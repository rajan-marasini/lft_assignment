import { z } from "zod";

export const upsertRsvpSchema = z.object({
  status: z.enum(["yes", "no", "maybe"], {
    message: "RSVP status must be 'yes', 'no', or 'maybe'",
  }),
});

export type UpsertRsvpInput = z.infer<typeof upsertRsvpSchema>;
