import { Check, HelpCircle, UserX, X } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useAuth";
import { useDeleteRsvp, useUpsertRsvp } from "@/hooks/useRsvp";
import type { RsvpCounts, RsvpStatus } from "@/types/event.types";

interface RsvpSelectorProps {
  eventId: string;
  currentStatus: RsvpStatus | null;
  counts?: RsvpCounts;
}

export const RsvpSelector = ({
  eventId,
  currentStatus,
  counts,
}: RsvpSelectorProps) => {
  const { data: user } = useCurrentUser();
  const upsertMutation = useUpsertRsvp(eventId);
  const deleteMutation = useDeleteRsvp(eventId);

  const isLoading = upsertMutation.isPending || deleteMutation.isPending;

  const handleSelectStatus = (status: RsvpStatus) => {
    if (!user) return;
    if (currentStatus === status) {
      deleteMutation.mutate();
    } else {
      upsertMutation.mutate(status);
    }
  };

  const handleClear = () => {
    if (!user || !currentStatus) return;
    deleteMutation.mutate();
  };

  if (!user) {
    return (
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-4 text-center">
        <p className="text-sm font-medium text-amber-900 mb-2">
          Want to join this event?
        </p>
        <p className="text-xs text-amber-700/80 mb-3">
          Sign in to RSVP and let the organizer know you are coming.
        </p>
        <Link to="/login">
          <Button size="sm" className="bg-stone-900 hover:bg-stone-800 text-white text-xs px-4">
            Sign in to RSVP
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">Your RSVP Status</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Select your response for this event
          </p>
        </div>
        {currentStatus && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-rose-600 transition-colors disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            Clear RSVP
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* YES / Going */}
        <button
          type="button"
          onClick={() => handleSelectStatus("yes")}
          disabled={isLoading}
          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
            currentStatus === "yes"
              ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs ring-1 ring-emerald-500"
              : "bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100"
          } disabled:opacity-50`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Check
              className={`h-4 w-4 ${
                currentStatus === "yes" ? "text-emerald-600" : "text-stone-400"
              }`}
            />
            <span className="font-semibold">Going</span>
          </div>
          {counts && (
            <span className="text-[10px] text-stone-500">
              {counts.yes} attending
            </span>
          )}
        </button>

        {/* MAYBE */}
        <button
          type="button"
          onClick={() => handleSelectStatus("maybe")}
          disabled={isLoading}
          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
            currentStatus === "maybe"
              ? "bg-amber-50 border-amber-500 text-amber-800 shadow-2xs ring-1 ring-amber-500"
              : "bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100"
          } disabled:opacity-50`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <HelpCircle
              className={`h-4 w-4 ${
                currentStatus === "maybe" ? "text-amber-600" : "text-stone-400"
              }`}
            />
            <span className="font-semibold">Maybe</span>
          </div>
          {counts && (
            <span className="text-[10px] text-stone-500">
              {counts.maybe} interested
            </span>
          )}
        </button>

        {/* NO / Not Going */}
        <button
          type="button"
          onClick={() => handleSelectStatus("no")}
          disabled={isLoading}
          className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
            currentStatus === "no"
              ? "bg-rose-50 border-rose-400 text-rose-800 shadow-2xs ring-1 ring-rose-400"
              : "bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100"
          } disabled:opacity-50`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <UserX
              className={`h-4 w-4 ${
                currentStatus === "no" ? "text-rose-600" : "text-stone-400"
              }`}
            />
            <span className="font-semibold">Decline</span>
          </div>
          {counts && (
            <span className="text-[10px] text-stone-500">
              {counts.no} declined
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
