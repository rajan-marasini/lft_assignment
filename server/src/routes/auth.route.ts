import express from "express";

import * as authController from "@/controller/auth.controller";
import { isAuthenticated } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validate.middleware";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resendVerificationSchema,
} from "@/schemas/auth.schema";

const router = express.Router();

router.post("/register", validate(registerSchema), authController.RegisterUser);

router.post("/login", validate(loginSchema), authController.LoginUser);

router.get("/verify-email", authController.VerifyEmail);

router.post("/resend-verification", validate(resendVerificationSchema), authController.ResendVerificationEmail);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.RefreshToken,
);

router.post("/logout", isAuthenticated, authController.LogoutUser);

router.get("/me", isAuthenticated, authController.GetMe);

export default router;
