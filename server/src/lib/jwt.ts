import jwt, { type SignOptions } from "jsonwebtoken";
import type { TokenPayload } from "@/types/express";

const getAccessSecret = (): string =>
  process.env.JWT_ACCESS_SECRET || "default_access_secret_key";

const getRefreshSecret = (): string =>
  process.env.JWT_REFRESH_SECRET || "default_refresh_secret_key";

const getAccessExpiresIn = (): string =>
  process.env.JWT_ACCESS_EXPIRES_IN || "15m";

const getRefreshExpiresIn = (): string =>
  process.env.JWT_REFRESH_EXPIRES_IN || "30d";

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: getAccessExpiresIn() as any,
  };
  return jwt.sign(payload, getAccessSecret(), options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: getRefreshExpiresIn() as any,
  };
  return jwt.sign(payload, getRefreshSecret(), options);
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getAccessSecret()) as TokenPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}

export function verifyRefreshToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, getRefreshSecret()) as TokenPayload;
  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}
