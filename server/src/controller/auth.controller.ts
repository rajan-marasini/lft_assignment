import { TryCatch } from "@/middleware/error.handler";
import type { NextFunction, Request, Response } from "express";

export const RegisterUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {},
);
