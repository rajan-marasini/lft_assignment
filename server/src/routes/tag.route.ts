import * as tagController from "@/controller/tag.controller";
import { isAuthenticated, requireVerified } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validate.middleware";
import { createTagSchema, updateTagSchema } from "@/schemas/tag.schema";
import express from "express";

const router = express.Router();

// GET /api/tags - Fetch all tags with event count
router.get("/", tagController.GetAllTags);

// POST /api/tags - Create a new tag (authenticated & verified users only)
router.post(
  "/",
  isAuthenticated,
  requireVerified,
  validate(createTagSchema),
  tagController.CreateTag,
);

// PATCH /api/tags/:tagId - Update tag name (authenticated & verified users only)
router.patch(
  "/:tagId",
  isAuthenticated,
  requireVerified,
  validate(updateTagSchema),
  tagController.UpdateTag,
);

// DELETE /api/tags/:tagId - Delete a tag (authenticated & verified users only)
router.delete("/:tagId", isAuthenticated, requireVerified, tagController.DeleteTag);

export default router;

