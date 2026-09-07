import jwt, { type SignOptions } from "jsonwebtoken";

import type { TokenPayload } from "@/types/express";

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ||
      "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ||
      "30d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET!,
  ) as TokenPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET!,
  ) as TokenPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}
