import { z } from "zod";

export const createEventSchema = z.object({
  title: z
    .string({ message: "Title is required" })
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title cannot exceed 200 characters"),
  description: z
    .string({ message: "Description is required" })
    .trim()
    .min(1, "Description cannot be empty"),
  starts_at: z
    .string({ message: "Start date/time is required" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Please provide a valid ISO date/time string",
    }),
  location: z
    .string({ message: "Location is required" })
    .trim()
    .min(1, "Location cannot be empty")
    .max(255, "Location cannot exceed 255 characters"),
  visibility: z.enum(["public", "private"]).default("private"),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Tag cannot be empty")
        .max(50, "Tag cannot exceed 50 characters")
        .transform((val) => val.toLowerCase()),
    )
    .optional()
    .default([]),
});

export const updateEventSchema = createEventSchema.partial();

export const getEventsQuerySchema = z
  .object({
    status: z.enum(["upcoming", "past", "all"]).optional().default("all"),
    visibility: z.enum(["public", "private", "all"]).optional().default("all"),
    tag: z
      .union([
        z.string(),
        z.array(z.string()),
        z.record(z.string(), z.string()),
      ])
      .optional(),
    "tag[]": z
      .union([
        z.string(),
        z.array(z.string()),
        z.record(z.string(), z.string()),
      ])
      .optional(),
    search: z.string().trim().optional(),
    sortBy: z
      .enum(["starts_at", "created_at", "title", "popularity"])
      .optional()
      .default("starts_at"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(10),
  })
  .transform((data) => {
    const rawTag = data.tag ?? data["tag[]"];
    let tags: string[] = [];

    if (typeof rawTag === "string") {
      tags = rawTag
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    } else if (Array.isArray(rawTag)) {
      tags = rawTag
        .flatMap((t) => t.split(","))
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    } else if (rawTag && typeof rawTag === "object") {
      tags = Object.values(rawTag)
        .flatMap((t) => (typeof t === "string" ? t.split(",") : []))
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    return {
      status: data.status,
      visibility: data.visibility,
      tag: tags,
      search: data.search,
      sortBy: data.sortBy,
      sortOrder: data.sortOrder,
      page: data.page,
      limit: data.limit,
    };
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type GetEventsQueryInput = z.infer<typeof getEventsQuerySchema>;
