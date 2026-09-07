import type { NextFunction, Request, Response } from "express";

import db from "@/db";
import { AppError } from "@/lib/errors";
import { TryCatch } from "@/middleware/error.handler";
import type { UpsertRsvpInput } from "@/schemas/rsvp.schema";

export async function fetchRsvpSummaryForEvent(
  eventId: string,
  userId?: string,
) {
  try {
    const countsRaw = await db("rsvps")
      .where({ event_id: eventId })
      .select(
        db.raw("COUNT(CASE WHEN status = 'yes' THEN 1 END)::int as yes"),
        db.raw("COUNT(CASE WHEN status = 'no' THEN 1 END)::int as no"),
        db.raw("COUNT(CASE WHEN status = 'maybe' THEN 1 END)::int as maybe"),
        db.raw("COUNT(*)::int as total"),
      )
      .first();

    const rsvpCounts = {
      yes: Number(countsRaw?.yes || 0),
      no: Number(countsRaw?.no || 0),
      maybe: Number(countsRaw?.maybe || 0),
      total: Number(countsRaw?.total || 0),
    };

    let currentUserStatus: "yes" | "no" | "maybe" | null = null;

    if (userId) {
      const userRsvp = await db("rsvps")
        .where({ event_id: eventId, user_id: userId })
        .select("status")
        .first();

      if (userRsvp) {
        currentUserStatus = userRsvp.status;
      }
    }

    const attendees = await db("rsvps")
      .join("users", "rsvps.user_id", "users.id")
      .where("rsvps.event_id", eventId)
      .whereIn("rsvps.status", ["yes", "maybe"])
      .select(
        "users.id as user_id",
        "users.name",
        "rsvps.status",
        "rsvps.updated_at",
      )
      .orderBy("rsvps.updated_at", "desc")
      .limit(10);

    return {
      counts: rsvpCounts,
      currentUserStatus,
      attendees: attendees.map((a) => ({
        id: a.user_id,
        name: a.name,
        status: a.status as "yes" | "maybe",
      })),
    };
  } catch {
    return {
      counts: { yes: 0, no: 0, maybe: 0, total: 0 },
      currentUserStatus: null,
      attendees: [],
    };
  }
}

export const UpsertRsvp = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const eventId = req.params.eventId as string;
    const { status }: UpsertRsvpInput = req.body;

    const event = await db("events").where({ id: eventId }).first();
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    // Authorization check: if event is private and not creator, verify access
    if (
      event.visibility === "private" &&
      event.creator_id !== req.user.userId
    ) {
      throw new AppError(
        "You do not have permission to access this event",
        403,
      );
    }

    try {
      const existingRsvp = await db("rsvps")
        .where({ event_id: eventId, user_id: req.user.userId })
        .first();

      if (existingRsvp) {
        await db("rsvps").where({ id: existingRsvp.id }).update({
          status,
          updated_at: db.fn.now(),
        });
      } else {
        await db("rsvps").insert({
          event_id: eventId,
          user_id: req.user.userId,
          status,
        });
      }
    } catch (err: any) {
      if (err?.code === "42P01") {
        throw new AppError(
          "Database table 'rsvps' does not exist yet. Please run database migrations ('npm run db:migrate' inside server folder).",
          500,
        );
      }
      throw err;
    }

    const summary = await fetchRsvpSummaryForEvent(eventId, req.user.userId);

    res.status(200).json({
      success: true,
      message: `RSVP updated to ${status}`,
      data: {
        rsvp: summary,
      },
    });
  },
);

export const DeleteRsvp = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const eventId = req.params.eventId as string;

    const existingRsvp = await db("rsvps")
      .where({ event_id: eventId, user_id: req.user.userId })
      .first();

    if (!existingRsvp) {
      throw new AppError("No active RSVP found for this event", 404);
    }

    await db("rsvps")
      .where({ event_id: eventId, user_id: req.user.userId })
      .del();

    const summary = await fetchRsvpSummaryForEvent(eventId, req.user.userId);

    res.status(200).json({
      success: true,
      message: "RSVP removed successfully",
      data: {
        rsvp: summary,
      },
    });
  },
);

export const GetEventRsvpSummary = TryCatch(
  async (req: Request, res: Response, _next: NextFunction) => {
    const eventId = req.params.eventId as string;

    const event = await db("events").where({ id: eventId }).first();
    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (
      event.visibility === "private" &&
      event.creator_id !== req.user?.userId
    ) {
      throw new AppError("You do not have permission to view this event", 403);
    }

    const summary = await fetchRsvpSummaryForEvent(eventId, req.user?.userId);

    res.status(200).json({
      success: true,
      data: {
        rsvp: summary,
      },
    });
  },
);
