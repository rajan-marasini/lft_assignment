import { describe, expect, it } from "bun:test";
import { loginSchema, registerSchema } from "../auth.schema";
import { createEventSchema, getEventsQuerySchema } from "../event.schema";
import { upsertRsvpSchema } from "../rsvp.schema";

describe("Validation Schemas", () => {
  describe("Auth Schemas", () => {
    it("should validate valid registration input", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "John@Example.com",
        password: "secretpassword",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("john@example.com");
      }
    });

    it("should reject invalid email in registration", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "not-an-email",
        password: "secretpassword",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = registerSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "123",
      });
      expect(result.success).toBe(false);
    });

    it("should validate login input", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Event Schemas", () => {
    it("should validate valid create event input", () => {
      const result = createEventSchema.safeParse({
        title: "Annual Tech Conference",
        description: "A great tech event",
        starts_at: "2026-10-15T09:00:00Z",
        location: "Convention Center",
        visibility: "public",
        tags: ["Tech", "Networking"],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual(["tech", "networking"]);
      }
    });

    it("should reject invalid date in create event", () => {
      const result = createEventSchema.safeParse({
        title: "Invalid Event",
        description: "Description",
        starts_at: "not-a-date",
        location: "Somewhere",
      });
      expect(result.success).toBe(false);
    });

    it("should transform getEventsQuery tag parameters properly", () => {
      const result = getEventsQuerySchema.safeParse({
        tag: "conference,workshop",
        status: "upcoming",
        sortBy: "starts_at",
        page: "2",
        limit: "20",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tag).toEqual(["conference", "workshop"]);
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });
  });

  describe("RSVP Schema", () => {
    it("should accept yes, no, maybe status", () => {
      expect(upsertRsvpSchema.safeParse({ status: "yes" }).success).toBe(true);
      expect(upsertRsvpSchema.safeParse({ status: "no" }).success).toBe(true);
      expect(upsertRsvpSchema.safeParse({ status: "maybe" }).success).toBe(true);
      expect(upsertRsvpSchema.safeParse({ status: "invalid" }).success).toBe(false);
    });
  });
});
