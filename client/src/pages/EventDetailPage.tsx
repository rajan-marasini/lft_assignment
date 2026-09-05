import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit3,
  Globe,
  Lock,
  MapPin,
  Tag as TagIcon,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";

import { DeleteEventDialog } from "@/components/events/DeleteEventDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEventById } from "@/hooks/useEvents";
import { useAuthStore } from "@/stores/use-auth-store";

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useGetEventById(id || "");
  const event = data?.data?.event;

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6 mx-auto px-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container max-w-md py-16 text-center space-y-4 mx-auto px-4">
        <h2 className="text-2xl font-bold text-destructive">Event Not Found</h2>
        <p className="text-muted-foreground text-sm">
          The event you are trying to view does not exist, or you do not have
          permission to view it.
        </p>
        <Link to="/" className={buttonVariants({ variant: "outline" })}>
          Back to Browse Events
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === event.creator.id;
  const startsAt = new Date(event.starts_at);
  const isPast = startsAt < new Date();

  return (
    <div className="container max-w-6xl py-8 space-y-6 mx-auto px-4">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/"
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "w-fit gap-2",
          })}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              to={`/events/${event.id}/edit`}
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "gap-1.5",
              })}
            >
              <Edit3 className="h-4 w-4" />
              Edit Event
            </Link>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              Delete Event
            </Button>
          </div>
        )}
      </div>

      {/* Main Event Card */}
      <Card className="border border-border shadow-sm overflow-hidden">
        {/* Card Header Section */}
        <CardHeader className="p-6 sm:p-8 space-y-4 bg-muted/20 border-b border-border">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Badge */}
            {isPast ? (
              <Badge
                variant="secondary"
                className="bg-muted text-muted-foreground border-border"
              >
                Past Event
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-200 dark:border-emerald-900">
                Upcoming
              </Badge>
            )}

            {/* Visibility Badge */}
            {event.visibility === "public" ? (
              <Badge
                variant="outline"
                className="gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
              >
                <Globe className="h-3 w-3" />
                Public
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="gap-1 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900"
              >
                <Lock className="h-3 w-3" />
                Private
              </Badge>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            {event.title}
          </h1>

          {/* Key Info Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Date & Time
                </p>
                <p className="font-semibold text-foreground">
                  {format(startsAt, "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 inline" />
                  {format(startsAt, "h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Location
                </p>
                <p className="font-semibold text-foreground">
                  {event.location}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Card Content Body */}
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Creator Profile Header */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {event.creator.name ? (
                  event.creator.name.charAt(0).toUpperCase()
                ) : (
                  <User className="h-4 w-4" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Organized by</p>
              <p className="text-sm font-semibold text-foreground">
                {event.creator.name || "Event Host"}
              </p>
              <p className="text-xs text-muted-foreground">
                {event.creator.email}
              </p>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TagIcon className="h-3.5 w-3.5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="px-3 py-1 text-xs"
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Rich Text Description */}
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold uppercase tracking-wider ">
              About This Event
            </h3>
            <div
              className="tiptap-content text-foreground text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {isOwner && (
        <DeleteEventDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          eventId={event.id}
          eventTitle={event.title}
          onSuccess={() => navigate("/")}
        />
      )}
    </div>
  );
};

export default EventDetailPage;
