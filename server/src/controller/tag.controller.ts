import type { NextFunction, Request, Response } from "express";

import db from "@/db";
import { AppError } from "@/lib/errors";
import { TryCatch } from "@/middleware/error.handler";
import type { CreateTagInput, UpdateTagInput } from "@/schemas/tag.schema";

export const GetAllTags = TryCatch(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const tags = await db("tags")
      .leftJoin("event_tags", "tags.id", "event_tags.tag_id")
      .select("tags.id", "tags.name", "tags.created_at")
      .count<Record<string, string>>("event_tags.event_id as event_count")
      .groupBy("tags.id", "tags.name", "tags.created_at")
      .orderBy("tags.name", "asc");

    const formattedTags = tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      created_at: tag.created_at,
      event_count: parseInt(tag.event_count || "0", 10),
    }));

    res.status(200).json({
      success: true,
      data: {
        tags: formattedTags,
      },
    });
  },
);

export const CreateTag = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { name }: CreateTagInput = req.body;

    const existingTag = await db("tags").where({ name }).first();
    if (existingTag) {
      throw new AppError("Tag with this name already exists", 409);
    }

    const [newTag] = await db("tags")
      .insert({ name })
      .returning(["id", "name", "created_at"]);

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: {
        tag: {
          ...newTag,
          event_count: 0,
        },
      },
    });
  },
);

export const UpdateTag = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { tagId } = req.params;
    const { name }: UpdateTagInput = req.body;

    const existingTag = await db("tags").where({ id: tagId }).first();
    if (!existingTag) {
      throw new AppError("Tag not found", 404);
    }

    const nameConflict = await db("tags")
      .where({ name })
      .andWhereNot({ id: tagId })
      .first();

    if (nameConflict) {
      throw new AppError("Tag with this name already exists", 409);
    }

    const [updatedTag] = await db("tags")
      .where({ id: tagId })
      .update({ name })
      .returning(["id", "name", "created_at"]);

    const countResult = await db("event_tags")
      .where({ tag_id: tagId })
      .count<{ count: string }>("event_id as count")
      .first();

    res.status(200).json({
      success: true,
      message: "Tag updated successfully",
      data: {
        tag: {
          ...updatedTag,
          event_count: parseInt(countResult?.count || "0", 10),
        },
      },
    });
  },
);

export const DeleteTag = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { tagId } = req.params;

    const existingTag = await db("tags").where({ id: tagId }).first();
    if (!existingTag) {
      throw new AppError("Tag not found", 404);
    }

    await db("tags").where({ id: tagId }).del();

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  },
);
