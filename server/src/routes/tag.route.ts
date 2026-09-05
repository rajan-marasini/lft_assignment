import * as tagController from "@/controller/tag.controller";
import { isAuthenticated } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validate.middleware";
import { createTagSchema, updateTagSchema } from "@/schemas/tag.schema";
import express from "express";

const router = express.Router();

// GET /api/tags - Fetch all tags with event count
router.get("/", tagController.GetAllTags);

// POST /api/tags - Create a new tag (authenticated users only)
router.post(
  "/",
  isAuthenticated,
  validate(createTagSchema),
  tagController.CreateTag,
);

// PATCH /api/tags/:tagId - Update tag name (authenticated users only)
router.patch(
  "/:tagId",
  isAuthenticated,
  validate(updateTagSchema),
  tagController.UpdateTag,
);

// DELETE /api/tags/:tagId - Delete a tag (authenticated users only)
router.delete("/:tagId", isAuthenticated, tagController.DeleteTag);

export default router;
