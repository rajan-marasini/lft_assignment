import { z } from "zod";

export const createTagSchema = z.object({
  name: z
    .string({ message: "Tag name is required" })
    .trim()
    .min(1, "Tag name cannot be empty")
    .max(50, "Tag name cannot exceed 50 characters")
    .transform((val) => val.toLowerCase()),
});

export const updateTagSchema = z.object({
  name: z
    .string({ message: "Tag name is required" })
    .trim()
    .min(1, "Tag name cannot be empty")
    .max(50, "Tag name cannot exceed 50 characters")
    .transform((val) => val.toLowerCase()),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
