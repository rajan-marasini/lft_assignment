import type { NextFunction, Request, Response } from "express";

import { AppError } from "@/lib/errors";
import { verifyAccessToken } from "@/lib/jwt";

export const isAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Access token is missing or malformed", 401));
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new AppError("Access token is missing", 401));
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired access token", 401));
  }
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
  } catch {
    // Token is invalid/expired; proceed as guest
  }

  next();
};
