import type { CookieOptions, NextFunction, Request, Response } from "express";

import db from "@/db";
import { AppError } from "@/lib/errors";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import { comparePassword, hashPassword } from "@/lib/password";
import { TryCatch } from "@/middleware/error.handler";
import type {
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
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

    const [user] = await db("users")
      .insert({
        name,
        email,
        password_hash,
      })
      .returning(["id", "name", "email", "created_at", "updated_at"]);

    if (!user) {
      throw new AppError("Failed to register user", 500);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
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

    const tokenPayload = { userId: user.id, email: user.email };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

    const { password_hash: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        accessToken,
      },
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
      .select("id", "name", "email", "created_at", "updated_at")
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
