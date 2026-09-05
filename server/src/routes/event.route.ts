import express from "express";

import * as eventController from "@/controller/event.controller";
import * as rsvpController from "@/controller/rsvp.controller";
import { isAuthenticated, optionalAuth } from "@/middleware/auth.middleware";
import { validate, validateQuery } from "@/middleware/validate.middleware";
import {
  createEventSchema,
  getEventsQuerySchema,
  updateEventSchema,
} from "@/schemas/event.schema";
import { upsertRsvpSchema } from "@/schemas/rsvp.schema";

const router = express.Router();

// POST /api/events - Create new event (authenticated users only)
router.post(
  "/",
  isAuthenticated,
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

// PATCH /api/events/:eventId - Update existing event (creator only)
router.patch(
  "/:eventId",
  isAuthenticated,
  validate(updateEventSchema),
  eventController.UpdateEvent,
);

// DELETE /api/events/:eventId - Delete event (creator only)
router.delete("/:eventId", isAuthenticated, eventController.DeleteEvent);

// --- RSVP Routes ---

// GET /api/events/:eventId/rsvp - Get RSVP summary for an event
router.get("/:eventId/rsvp", optionalAuth, rsvpController.GetEventRsvpSummary);

// POST /api/events/:eventId/rsvp - Submit or update RSVP status
router.post(
  "/:eventId/rsvp",
  isAuthenticated,
  validate(upsertRsvpSchema),
  rsvpController.UpsertRsvp,
);

// DELETE /api/events/:eventId/rsvp - Remove RSVP status
router.delete("/:eventId/rsvp", isAuthenticated, rsvpController.DeleteRsvp);

export default router;

