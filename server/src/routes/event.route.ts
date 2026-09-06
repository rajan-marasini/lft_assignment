import express from "express";

import * as eventController from "@/controller/event.controller";
import * as rsvpController from "@/controller/rsvp.controller";
import {
  isAuthenticated,
  optionalAuth,
  requireVerified,
} from "@/middleware/auth.middleware";
import {
  eventMutationLimiter,
  rsvpLimiter,
} from "@/middleware/rate-limit.middleware";
import { validate, validateQuery } from "@/middleware/validate.middleware";
import {
  createEventSchema,
  getEventsQuerySchema,
  updateEventSchema,
} from "@/schemas/event.schema";
import { upsertRsvpSchema } from "@/schemas/rsvp.schema";

const router = express.Router();

// POST /api/events - Create new event (authenticated & verified users only)
router.post(
  "/",
  eventMutationLimiter,
  isAuthenticated,
  requireVerified,
  validate(createEventSchema),
  eventController.CreateEvent,
);

// GET /api/events - Get list of events with filtering, search & pagination
router.get(
  "/",
  optionalAuth,
  validateQuery(getEventsQuerySchema),
  eventController.GetEvents,
);

// GET /api/events/:eventId - Get event details by ID
router.get("/:eventId", optionalAuth, eventController.GetEventById);

// PATCH /api/events/:eventId - Update existing event (creator only & verified)
router.patch(
  "/:eventId",
  eventMutationLimiter,
  isAuthenticated,
  requireVerified,
  validate(updateEventSchema),
  eventController.UpdateEvent,
);

// DELETE /api/events/:eventId - Delete event (creator only & verified)
router.delete(
  "/:eventId",
  eventMutationLimiter,
  isAuthenticated,
  requireVerified,
  eventController.DeleteEvent,
);

// --- RSVP Routes ---

// GET /api/events/:eventId/rsvp - Get RSVP summary for an event
router.get("/:eventId/rsvp", optionalAuth, rsvpController.GetEventRsvpSummary);

// POST /api/events/:eventId/rsvp - Submit or update RSVP status
router.post(
  "/:eventId/rsvp",
  rsvpLimiter,
  isAuthenticated,
  requireVerified,
  validate(upsertRsvpSchema),
  rsvpController.UpsertRsvp,
);

// DELETE /api/events/:eventId/rsvp - Remove RSVP status
router.delete(
  "/:eventId/rsvp",
  rsvpLimiter,
  isAuthenticated,
  requireVerified,
  rsvpController.DeleteRsvp,
);

export default router;
