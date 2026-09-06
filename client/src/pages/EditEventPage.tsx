import { AlertCircle, ArrowLeft, Edit3, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { EventForm } from "@/components/events/EventForm";
import { buttonVariants } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useAuth";
import { useGetEventById, useUpdateEvent } from "@/hooks/useEvents";
import type { EventFormValues } from "@/lib/validations/event.schema";

export const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: userData } = useCurrentUser();
  const user = userData;

  const { data, isLoading, error } = useGetEventById(id || "");
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateEvent();

  const event = data?.data?.event;
  const isUnverified = user?.is_verified === false;

  // Authorization check: if event is loaded and user is not the creator, redirect
  useEffect(() => {
    if (event && user && event.creator.id !== user.id) {
      toast.error("You are not authorized to edit this event");
      navigate(`/events/${id}`, { replace: true });
    }
  }, [event, user, id, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm font-medium">
          Loading event details...
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container max-w-xl py-16 text-center space-y-4 mx-auto px-4">
        <h2 className="text-xl font-bold text-destructive">Event Not Found</h2>
        <p className="text-muted-foreground text-sm">
          The event you are trying to edit does not exist or has been removed.
        </p>
        <Link to="/" className={buttonVariants({ variant: "outline" })}>
          Back to Home
        </Link>
      </div>
    );
  }

  const handleSubmit = (values: EventFormValues) => {
    if (!id || isUnverified) return;
    updateEvent(
      {
        id,
        payload: {
          title: values.title,
          description: values.description,
          starts_at: new Date(values.starts_at).toISOString(),
          location: values.location,
          visibility: values.visibility,
          tags: values.tags,
        },
      },
      {
        onSuccess: () => {
          navigate(`/events/${id}`);
        },
      },
    );
  };

  return (
    <div className="container max-w-6xl py-8 space-y-6 mx-auto px-4">
      {/* Back Header */}
      <div className="flex items-center gap-4">
        <Link
          to={`/events/${id}`}
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
            <Edit3 className="h-7 w-7 text-primary" />
            Edit Event
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update event information and settings.
          </p>
        </div>
      </div>

      {isUnverified && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg flex items-start gap-3 text-sm">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-semibold">Email Verification Required</h4>
            <p className="text-amber-800 text-xs">
              You must verify your email address before updating event details. Please check your inbox for the verification link.
            </p>
          </div>
        </div>
      )}

      <EventForm
        initialValues={{
          title: event.title,
          description: event.description,
          starts_at: event.starts_at,
          location: event.location,
          visibility: event.visibility,
          tags: event.tags?.map((t) => t.name) || [],
        }}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
        submitLabel="Update Event"
        disabled={isUnverified}
      />
    </div>
  );
};

export default EditEventPage;

