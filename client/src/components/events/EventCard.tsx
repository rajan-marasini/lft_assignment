import { Clock, Globe, Lock, MapPin, User } from "lucide-react";
import { Link } from "react-router";

import type { Event } from "@/types/event.types";

interface EventCardProps {
  event: Event;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return {
    day: date.toLocaleDateString("en-US", { day: "numeric" }),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    year: date.getFullYear(),
    time: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

function isUpcoming(dateString: string) {
  return new Date(dateString) >= new Date();
}

export const EventCard = ({ event }: EventCardProps) => {
  const d = formatDate(event.starts_at);
  const upcoming = isUpcoming(event.starts_at);
  const cleanDescription = event.description
    ? event.description.replace(/<[^>]*>?/gm, "").trim()
    : "";

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <article className="flex flex-col sm:flex-row border border-stone-200 bg-white rounded-lg overflow-hidden group-hover:border-amber-400 group-hover:shadow-md transition-all duration-200 h-full">
        {/* Date column */}
        <div className="flex sm:flex-col items-center sm:items-center justify-start sm:justify-start gap-4 sm:gap-0 px-5 py-4 sm:py-5 sm:px-5 sm:min-w-20 bg-stone-50 border-b sm:border-b-0 sm:border-r border-stone-200">
          <div className="text-center">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              {d.weekday}
            </p>
            <p className="text-3xl font-bold text-stone-800 leading-none mt-0.5">
              {d.day}
            </p>
            <p className="text-xs font-medium text-stone-500 mt-0.5">
              {d.month}
            </p>
            <p className="text-[10px] text-stone-400 mt-0.5">{d.year}</p>
          </div>
          <div className="sm:mt-4 flex sm:flex-col items-center gap-1 text-stone-400">
            <Clock className="h-3 w-3 shrink-0" />
            <span className="text-[11px]">{d.time}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 px-5 py-4 gap-2.5">
          {/* Title row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-stone-900 text-base leading-snug group-hover:text-amber-700 transition-colors duration-150 line-clamp-1">
                {event.title}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                <User className="h-3 w-3 shrink-0" />
                {event.creator.name}
              </p>
            </div>

            {/* Status + visibility */}
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              {upcoming ? (
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-0.5 uppercase tracking-wide">
                  Upcoming
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 border border-stone-200 rounded px-2 py-0.5 uppercase tracking-wide">
                  Past
                </span>
              )}
              <span
                className={`text-[10px] font-semibold rounded px-2 py-0.5 uppercase tracking-wide flex items-center gap-1 border ${
                  event.visibility === "public"
                    ? "text-sky-700 bg-sky-50 border-sky-200"
                    : "text-amber-700 bg-amber-50 border-amber-200"
                }`}
              >
                {event.visibility === "public" ? (
                  <Globe className="h-2.5 w-2.5" />
                ) : (
                  <Lock className="h-2.5 w-2.5" />
                )}
                {event.visibility}
              </span>
            </div>
          </div>

          {/* Description */}
          {cleanDescription && (
            <p className="text-sm text-stone-500 leading-relaxed line-clamp-2">
              {cleanDescription}
            </p>
          )}

          {/* Footer row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-auto pt-0.5">
            {event.location && (
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <MapPin className="h-3 w-3 shrink-0 text-stone-400" />
                {event.location}
              </span>
            )}
            {event.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {event.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200"
                  >
                    #{tag.name}
                  </span>
                ))}
                {event.tags.length > 4 && (
                  <span className="text-[10px] text-stone-400">
                    +{event.tags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
};

export const EventCardSkeleton = () => (
  <div className="flex flex-col sm:flex-row border border-stone-200 bg-white rounded-lg overflow-hidden animate-pulse">
    <div className="sm:min-w-20 h-20 sm:h-auto bg-stone-100 border-b sm:border-b-0 sm:border-r border-stone-200" />
    <div className="flex flex-col flex-1 px-5 py-4 gap-3">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-1.5">
          <div className="h-4 bg-stone-200 rounded w-2/3" />
          <div className="h-3 bg-stone-100 rounded w-1/4" />
        </div>
        <div className="h-5 w-16 bg-stone-100 rounded" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-stone-100 rounded w-full" />
        <div className="h-3 bg-stone-100 rounded w-4/5" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-3 w-20 bg-stone-100 rounded" />
        <div className="h-3 w-12 bg-stone-100 rounded" />
        <div className="h-3 w-12 bg-stone-100 rounded" />
      </div>
    </div>
  </div>
);

export default EventCard;
