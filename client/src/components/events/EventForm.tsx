import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Globe, Lock, MapPin, Tag } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { RichTextEditor } from "@/components/events/RichTextEditor";
import { TagInput } from "@/components/events/TagInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  eventSchema,
  type EventFormValues,
} from "@/lib/validations/event.schema";

interface EventFormProps {
  initialValues?: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  disabled?: boolean;
}

export const EventForm = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save Event",
  disabled = false,
}: EventFormProps) => {
  // Format initial starts_at string for datetime-local input format (YYYY-MM-DDTHH:mm)
  const formatDatetimeLocal = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      starts_at: formatDatetimeLocal(initialValues?.starts_at) || "",
      location: initialValues?.location || "",
      visibility: initialValues?.visibility || "public",
      tags: initialValues?.tags || [],
    },
  });

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold text-foreground">
              Event Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g. Annual Tech Conference 2026"
              {...register("title")}
              className={
                errors.title
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
            />
            {errors.title && (
              <p className="text-xs text-destructive font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Date/Time and Location Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Starts At */}
            <div className="space-y-2">
              <Label
                htmlFor="starts_at"
                className="font-semibold text-foreground flex items-center gap-1.5"
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Date & Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="starts_at"
                type="datetime-local"
                {...register("starts_at")}
                className={
                  errors.starts_at
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.starts_at && (
                <p className="text-xs text-destructive font-medium">
                  {errors.starts_at.message}
                </p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="font-semibold text-foreground flex items-center gap-1.5"
              >
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location / Venue <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g. Grand Hall, Downtown / Zoom Link"
                {...register("location")}
                className={
                  errors.location
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {errors.location && (
                <p className="text-xs text-destructive font-medium">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          {/* Visibility & Tags Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visibility */}
            <div className="space-y-2">
              <Label
                htmlFor="visibility"
                className="font-semibold text-foreground flex items-center gap-1.5"
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                Visibility Settings <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="visibility"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="visibility" className="w-full">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-emerald-500" />
                          <span>Public (Visible to everyone)</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-amber-500" />
                          <span>Private (Visible only to you)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.visibility && (
                <p className="text-xs text-destructive font-medium">
                  {errors.visibility.message}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="font-semibold text-foreground flex items-center gap-1.5">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Event Tags
              </Label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Type tag and press Enter..."
                  />
                )}
              />
            </div>
          </div>

          {/* Description (Rich Text Editor) */}
          <div className="space-y-2">
            <Label className="font-semibold text-foreground">
              Event Description <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Provide details about schedule, venue instructions, speaker line-up, etc."
                />
              )}
            />
            {errors.description && (
              <p className="text-xs text-destructive font-medium">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Form Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="submit"
              disabled={isSubmitting || disabled}
              className="px-6 font-medium rounded-none"
            >
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
