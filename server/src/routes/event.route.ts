import * as eventController from "@/controller/event.controller";
import { isAuthenticated } from "@/middleware/auth.middleware";
import { validate, validateQuery } from "@/middleware/validate.middleware";
import {
  createEventSchema,
  getEventsQuerySchema,
  updateEventSchema,
} from "@/schemas/event.schema";
import express from "express";

const router = express.Router();

// GET /api/events/tags - Fetch all tags
router.get("/tags", eventController.GetAllTags);

// POST /api/events - Create new event (authenticated users only)
router.post(
  "/",
  isAuthenticated,
  validate(createEventSchema),
  eventController.CreateEvent,
);

// GET /api/events - Get list of events with filtering, search & pagination
router.get("/", validateQuery(getEventsQuerySchema), eventController.GetEvents);

// GET /api/events/:eventId - Get event details by ID
router.get("/:eventId", eventController.GetEventById);

// PATCH /api/events/:eventId - Update existing event (creator only)
router.patch(
  "/:eventId",
  isAuthenticated,
  validate(updateEventSchema),
  eventController.UpdateEvent,
);

// DELETE /api/events/:eventId - Delete event (creator only)
router.delete("/:eventId", isAuthenticated, eventController.DeleteEvent);

export default router;
