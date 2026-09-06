import { AlertCircle, ArrowLeft, CalendarPlus } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { EventForm } from "@/components/events/EventForm";
import { buttonVariants } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useAuth";
import { useCreateEvent } from "@/hooks/useEvents";
import type { EventFormValues } from "@/lib/validations/event.schema";

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { mutate: createEvent, isPending } = useCreateEvent();

  const isUnverified = user?.is_verified === false;

  const handleSubmit = (values: EventFormValues) => {
    if (isUnverified) return;
    createEvent(
      {
        title: values.title,
        description: values.description,
        starts_at: new Date(values.starts_at).toISOString(),
        location: values.location,
        visibility: values.visibility,
        tags: values.tags,
      },
      {
        onSuccess: (response) => {
          if (response.data?.event?.id) {
            navigate(`/events/${response.data.event.id}`);
          } else {
            navigate("/");
          }
        },
      },
    );
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6 mx-auto px-4">
      {/* Back Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className={buttonVariants({
            variant: "ghost",
            size: "icon",
            className: "rounded-full",
          })}
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarPlus className="h-7 w-7 text-primary" />
            Create New Event
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Fill in the details below to publish your event.
          </p>
        </div>
      </div>

      {isUnverified && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg flex items-start gap-3 text-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold">Email Verification Required</h4>
            <p className="text-amber-800 text-xs">
              You must verify your email address before creating new events. Please check your inbox for the verification link.
            </p>
          </div>
        </div>
      )}

      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create Event"
        disabled={isUnverified}
      />
    </div>
  );
};

export default CreateEventPage;
