import { z } from "zod";

export const eventSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must not exceed 150 characters"),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters"),
  starts_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please select a valid date and time",
  }),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must not exceed 200 characters"),
  visibility: z.enum(["public", "private"]),
  tags: z.array(z.string()),
});

export type EventFormValues = z.infer<typeof eventSchema>;
