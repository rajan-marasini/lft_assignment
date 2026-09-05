import { ArrowLeft, CalendarPlus } from "lucide-react";
import { Link, useNavigate } from "react-router";

import { EventForm } from "@/components/events/EventForm";
import { buttonVariants } from "@/components/ui/button";
import { useCreateEvent } from "@/hooks/useEvents";
import type { EventFormValues } from "@/lib/validations/event.schema";

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const { mutate: createEvent, isPending } = useCreateEvent();

  const handleSubmit = (values: EventFormValues) => {
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

      <EventForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        submitLabel="Create Event"
      />
    </div>
  );
};

export default CreateEventPage;
