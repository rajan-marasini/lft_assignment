import type { NextFunction, Request, Response } from "express";
import type { Knex } from "knex";

import db from "@/db";
import { AppError } from "@/lib/errors";
import { TryCatch } from "@/middleware/error.handler";
import type {
  CreateEventInput,
  GetEventsQueryInput,
  UpdateEventInput,
} from "@/schemas/event.schema";

interface EventRow {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_email: string;
  title: string;
  description: string;
  starts_at: Date;
  location: string;
  visibility: "public" | "private";
  created_at: Date;
  updated_at: Date;
}

interface TagRow {
  id: string;
  name: string;
}

async function attachTagsToEvents(events: EventRow[]) {
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.id);

  const eventTags = await db("event_tags")
    .join("tags", "event_tags.tag_id", "tags.id")
    .whereIn("event_tags.event_id", eventIds)
    .select(
      "event_tags.event_id",
      "tags.id as tag_id",
      "tags.name as tag_name",
    );

  const tagsByEventId: Record<string, { id: string; name: string }[]> = {};
  for (const row of eventTags) {
    if (!tagsByEventId[row.event_id]) {
      tagsByEventId[row.event_id] = [];
    }
    tagsByEventId[row.event_id]!.push({ id: row.tag_id, name: row.tag_name });
  }

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    starts_at: event.starts_at,
    location: event.location,
    visibility: event.visibility,
    created_at: event.created_at,
    updated_at: event.updated_at,
    creator: {
      id: event.creator_id,
      name: event.creator_name,
      email: event.creator_email,
    },
    tags: tagsByEventId[event.id] || [],
  }));
}

async function processTags(
  trx: Knex.Transaction,
  tagNames: string[]
): Promise<string[]> {
  if (!tagNames || tagNames.length === 0) return [];

  const uniqueTagNames = Array.from(
    new Set(tagNames.map((t) => t.trim().toLowerCase())),
  ).filter(Boolean);

  const tagIds: string[] = [];

  for (const name of uniqueTagNames) {
    let tag = await trx("tags").where({ name }).first();
    if (!tag) {
      const [newTag] = await trx("tags")
        .insert({ name })
        .returning(["id", "name"]);
      tag = newTag;
    }
    if (tag?.id) {
      tagIds.push(tag.id);
    }
  }

  return tagIds;
}

export const CreateEvent = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const {
      title,
      description,
      starts_at,
      location,
      visibility,
      tags = [],
    }: CreateEventInput = req.body;

    const event = await db.transaction(async (trx) => {
      const [newEvent] = await trx("events")
        .insert({
          creator_id: req.user!.userId,
          title,
          description,
          starts_at: new Date(starts_at),
          location,
          visibility: visibility || "private",
        })
        .returning("*");

      if (tags.length > 0) {
        const tagIds = await processTags(trx, tags);
        const eventTagRows = tagIds.map((tag_id) => ({
          event_id: newEvent.id,
          tag_id,
        }));
        await trx("event_tags").insert(eventTagRows);
      }

      return newEvent;
    });

    const [formattedEvent] = await attachTagsToEvents([
      {
        ...event,
        creator_id: req.user.userId,
        creator_name: "",
        creator_email: req.user.email,
      },
    ]);

    const creator = await db("users")
      .where({ id: req.user.userId })
      .select("id", "name", "email")
      .first();

    if (formattedEvent && creator) {
      formattedEvent.creator = creator;
    }

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        event: formattedEvent,
      },
    });
  },
);

export const GetEvents = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const queryInput = req.query as unknown as GetEventsQueryInput;
    const {
      status = "all",
      visibility = "all",
      tag = [],
      search,
      sortBy = "starts_at",
      sortOrder = "asc",
      page = 1,
      limit = 10,
    } = queryInput;

    const currentUserId = req.user?.userId;

    const baseQuery = db("events")
      .join("users", "events.creator_id", "users.id")
      .select(
        "events.id",
        "events.creator_id",
        "users.name as creator_name",
        "users.email as creator_email",
        "events.title",
        "events.description",
        "events.starts_at",
        "events.location",
        "events.visibility",
        "events.created_at",
        "events.updated_at",
      );

    // Apply visibility scoping
    baseQuery.andWhere((builder) => {
      if (currentUserId) {
        if (visibility === "public") {
          builder.where("events.visibility", "public");
        } else if (visibility === "private") {
          builder
            .where("events.visibility", "private")
            .andWhere("events.creator_id", currentUserId);
        } else {
          builder
            .where("events.visibility", "public")
            .orWhere("events.creator_id", currentUserId);
        }
      } else {
        builder.where("events.visibility", "public");
      }
    });

    // Apply status filter (upcoming vs past)
    const now = new Date();
    if (status === "upcoming") {
      baseQuery.andWhere("events.starts_at", ">=", now);
    } else if (status === "past") {
      baseQuery.andWhere("events.starts_at", "<", now);
    }

    // Apply tag filter
    const tagList = Array.isArray(tag) ? tag : tag ? [tag] : [];
    if (tagList.length > 0) {
      baseQuery.whereExists(function () {
        this.select(1)
          .from("event_tags")
          .join("tags", "event_tags.tag_id", "tags.id")
          .whereRaw("event_tags.event_id = events.id")
          .whereIn("tags.name", tagList);
      });
    }

    // Apply search filter (title, description, location)
    if (search) {
      const searchPattern = `%${search}%`;
      baseQuery.andWhere((builder) => {
        builder
          .whereILike("events.title", searchPattern)
          .orWhereILike("events.description", searchPattern)
          .orWhereILike("events.location", searchPattern);
      });
    }

    // Count query for total items
    const countQuery = db("events").andWhere((builder) => {
      if (currentUserId) {
        if (visibility === "public") {
          builder.where("events.visibility", "public");
        } else if (visibility === "private") {
          builder
            .where("events.visibility", "private")
            .andWhere("events.creator_id", currentUserId);
        } else {
          builder
            .where("events.visibility", "public")
            .orWhere("events.creator_id", currentUserId);
        }
      } else {
        builder.where("events.visibility", "public");
      }
    });

    if (status === "upcoming") {
      countQuery.andWhere("events.starts_at", ">=", now);
    } else if (status === "past") {
      countQuery.andWhere("events.starts_at", "<", now);
    }

    if (tagList.length > 0) {
      countQuery.whereExists(function () {
        this.select(1)
          .from("event_tags")
          .join("tags", "event_tags.tag_id", "tags.id")
          .whereRaw("event_tags.event_id = events.id")
          .whereIn("tags.name", tagList);
      });
    }

    if (search) {
      const searchPattern = `%${search}%`;
      countQuery.andWhere((builder) => {
        builder
          .whereILike("events.title", searchPattern)
          .orWhereILike("events.description", searchPattern)
          .orWhereILike("events.location", searchPattern);
      });
    }

    const countResult = await countQuery
      .count<{ count: string }>("id as count")
      .first();
    const totalItems = parseInt(countResult?.count || "0", 10);

    // Apply sorting & pagination
    const validSortColumns: Record<string, string> = {
      starts_at: "events.starts_at",
      created_at: "events.created_at",
      title: "events.title",
    };
    const sortColumn = validSortColumns[sortBy] || "events.starts_at";
    const offset = (page - 1) * limit;

    const eventsRows: EventRow[] = await baseQuery
      .orderBy(sortColumn, sortOrder)
      .limit(limit)
      .offset(offset);

    const formattedEvents = await attachTagsToEvents(eventsRows);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.status(200).json({
      success: true,
      data: {
        events: formattedEvents,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
        },
      },
    });
  },
);

export const GetEventById = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { eventId } = req.params;

    const eventRow: EventRow | undefined = await db("events")
      .join("users", "events.creator_id", "users.id")
      .where("events.id", eventId)
      .select(
        "events.id",
        "events.creator_id",
        "users.name as creator_name",
        "users.email as creator_email",
        "events.title",
        "events.description",
        "events.starts_at",
        "events.location",
        "events.visibility",
        "events.created_at",
        "events.updated_at",
      )
      .first();

    if (!eventRow) {
      throw new AppError("Event not found", 404);
    }

    // Check authorization for private event
    if (
      eventRow.visibility === "private" &&
      eventRow.creator_id !== req.user?.userId
    ) {
      throw new AppError("You do not have permission to view this event", 403);
    }

    const [formattedEvent] = await attachTagsToEvents([eventRow]);

    res.status(200).json({
      success: true,
      data: {
        event: formattedEvent,
      },
    });
  },
);

export const UpdateEvent = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { eventId } = req.params;
    const {
      title,
      description,
      starts_at,
      location,
      visibility,
      tags,
    }: UpdateEventInput = req.body;

    const existingEvent = await db("events").where({ id: eventId }).first();

    if (!existingEvent) {
      throw new AppError("Event not found", 404);
    }

    if (existingEvent.creator_id !== req.user.userId) {
      throw new AppError("You are not authorized to update this event", 403);
    }

    await db.transaction(async (trx) => {
      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (starts_at !== undefined) updateData.starts_at = new Date(starts_at);
      if (location !== undefined) updateData.location = location;
      if (visibility !== undefined) updateData.visibility = visibility;

      if (Object.keys(updateData).length > 0) {
        await trx("events").where({ id: eventId }).update(updateData);
      }

      if (tags !== undefined) {
        await trx("event_tags").where({ event_id: eventId }).del();

        if (tags.length > 0) {
          const tagIds = await processTags(trx, tags);
          const eventTagRows = tagIds.map((tag_id) => ({
            event_id: eventId,
            tag_id,
          }));
          await trx("event_tags").insert(eventTagRows);
        }
      }
    });

    const updatedEventRow: EventRow = await db("events")
      .join("users", "events.creator_id", "users.id")
      .where("events.id", eventId)
      .select(
        "events.id",
        "events.creator_id",
        "users.name as creator_name",
        "users.email as creator_email",
        "events.title",
        "events.description",
        "events.starts_at",
        "events.location",
        "events.visibility",
        "events.created_at",
        "events.updated_at",
      )
      .first();

    const [formattedEvent] = await attachTagsToEvents([updatedEventRow]);

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: {
        event: formattedEvent,
      },
    });
  },
);

export const DeleteEvent = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const { eventId } = req.params;

    const existingEvent = await db("events").where({ id: eventId }).first();

    if (!existingEvent) {
      throw new AppError("Event not found", 404);
    }

    if (existingEvent.creator_id !== req.user.userId) {
      throw new AppError("You are not authorized to delete this event", 403);
    }

    await db("events").where({ id: eventId }).del();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  },
);
