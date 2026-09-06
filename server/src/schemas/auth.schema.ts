import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters long"),
  email: z.email("Please provide a valid email address").trim().toLowerCase(),
  password: z
    .string({ message: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
});

export const loginSchema = z.object({
  email: z.email("Please provide a valid email address").trim().toLowerCase(),
  password: z
    .string({ message: "Password is required" })
    .min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const verifyEmailQuerySchema = z.object({
  token: z.string({ message: "Verification token is required" }).trim().min(1, "Verification token is required"),
});

export const resendVerificationSchema = z.object({
  email: z.email("Please provide a valid email address").trim().toLowerCase(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type VerifyEmailQueryInput = z.infer<typeof verifyEmailQuerySchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

