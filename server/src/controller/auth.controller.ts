import type { CookieOptions, NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

import db from "@/db";
import { sendVerificationEmail } from "@/lib/email";
import { AppError } from "@/lib/errors";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import logger from "@/lib/logger";
import { comparePassword, hashPassword } from "@/lib/password";
import { TryCatch } from "@/middleware/error.handler";
import type {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResendVerificationInput,
} from "@/schemas/auth.schema";

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000;

const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: COOKIE_MAX_AGE,
};

export const RegisterUser = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { name, email, password }: RegisterInput = req.body;

    const existingUser = await db("users").where({ email }).first();
    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    const password_hash = await hashPassword(password);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ); // 24 hours

    const [user] = await db("users")
      .insert({
        name,
        email,
        password_hash,
        is_verified: false,
        verification_token: verificationToken,
        verification_token_expires_at: verificationTokenExpiresAt,
      })
      .returning([
        "id",
        "name",
        "email",
        "is_verified",
        "created_at",
        "updated_at",
      ]);

    if (!user) {
      throw new AppError("Failed to register user", 500);
    }

    sendVerificationEmail(email, name, verificationToken).catch((err) => {
      logger.error(
        "Failed to send background registration verification email:",
        err,
      );
    });

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email to verify your account.",
      data: {
        user,
        requiresVerification: true,
      },
    });
  },
);

export const LoginUser = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password }: LoginInput = req.body;

    const user = await db("users").where({ email }).first();
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.is_verified) {
      throw new AppError(
        "Please verify your email address before logging in. Check your inbox for the verification link.",
        403,
      );
    }

    const tokenPayload = { userId: user.id, email: user.email };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    const {
      password_hash: _,
      verification_token: __,
      verification_token_expires_at: ___,
      ...userWithoutSensitiveData
    } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutSensitiveData,
        accessToken,
      },
    });
  },
);

export const VerifyEmail = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const token = (req.query.token as string) || (req.body.token as string);

    if (!token) {
      throw new AppError("Verification token is required", 400);
    }

    const user = await db("users").where({ verification_token: token }).first();
    if (!user) {
      throw new AppError("Invalid or expired verification token", 400);
    }

    if (
      user.verification_token_expires_at &&
      new Date(user.verification_token_expires_at) < new Date()
    ) {
      throw new AppError(
        "Verification token has expired. Please request a new verification link.",
        400,
      );
    }

    await db("users").where({ id: user.id }).update({
      is_verified: true,
      verification_token: null,
      verification_token_expires_at: null,
      updated_at: new Date(),
    });

    res.status(200).json({
      success: true,
      message:
        "Email verified successfully! You can now log in to your account.",
    });
  },
);

export const ResendVerificationEmail = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { email }: ResendVerificationInput = req.body;

    const user = await db("users").where({ email }).first();

    // To prevent account enumeration, return success message even if user doesn't exist
    if (!user) {
      res.status(200).json({
        success: true,
        message:
          "If an account with that email exists, a verification link has been sent.",
      });
      return;
    }

    if (user.is_verified) {
      res.status(200).json({
        success: true,
        message:
          "Your email address is already verified. You can proceed to log in.",
      });
      return;
    }

    const newVerificationToken = crypto.randomBytes(32).toString("hex");
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db("users").where({ id: user.id }).update({
      verification_token: newVerificationToken,
      verification_token_expires_at: newExpiresAt,
      updated_at: new Date(),
    });

    sendVerificationEmail(user.email, user.name, newVerificationToken).catch(
      (err) => {
        logger.error(
          "Failed to send resend verification email in background:",
          err,
        );
      },
    );

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    });
  },
);

export const RefreshToken = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const bodyInput: RefreshTokenInput = req.body;
    const refreshToken = req.cookies?.refreshToken || bodyInput.refreshToken;

    if (!refreshToken || typeof refreshToken !== "string") {
      throw new AppError("Refresh token is required", 400);
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await db("users").where({ id: payload.userId }).first();
    if (!user) {
      throw new AppError("User associated with token no longer exists", 404);
    }

    if (!user.is_verified) {
      throw new AppError("Please verify your email address first", 403);
    }

    const tokenPayload = { userId: user.id, email: user.email };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    res.cookie("refreshToken", newRefreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  },
);

export const LogoutUser = TryCatch(
  async (_req: Request, res: Response, _next: NextFunction) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);

export const GetMe = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await db("users")
      .select("id", "name", "email", "is_verified", "created_at", "updated_at")
      .where({ id: req.user.userId })
      .first();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  },
);
