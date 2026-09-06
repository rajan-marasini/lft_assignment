import { CalendarPlus, Loader2, UserCheck } from "lucide-react";
import { Link } from "react-router";

import { EventCard } from "@/components/events/EventCard";
import { buttonVariants } from "@/components/ui/button";
import { useGetEvents } from "@/hooks/useEvents";
import { useAuthStore } from "@/stores/use-auth-store";

export const MyEventsPage = () => {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useGetEvents({
    visibility: "all",
    limit: 50,
  });

  const events = data?.data?.events || [];
  const myEvents = events.filter((e) => e.creator.id === user?.id);

  return (
    <div className="container max-w-6xl py-8 space-y-6 mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="h-7 w-7 text-primary" />
            My Created Events
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all the events you have hosted and created.
          </p>
        </div>

        <Link
          to="/events/create"
          className={buttonVariants({
            className: "gap-2 shrink-0 rounded-none",
          })}
        >
          <CalendarPlus className="h-4 w-4" />
          Create Event
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">
            Fetching your events...
          </p>
        </div>
      ) : myEvents.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl space-y-4 max-w-md mx-auto my-8">
          <div className="p-3 bg-muted w-fit rounded-full mx-auto text-muted-foreground">
            <CalendarPlus className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">No Events Found</h3>
            <p className="text-muted-foreground text-sm">
              You haven&apos;t created any events yet. Start by creating your
              first event!
            </p>
          </div>
          <Link
            to="/events/create"
            className={buttonVariants({ className: "gap-2 rounded-none" })}
          >
            <CalendarPlus className="h-4 w-4" />
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {myEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
