import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { rsvpApi } from "@/api/rsvp.api";
import type { RsvpStatus } from "@/types/event.types";
import type { AxiosError } from "axios";

export const useRsvpSummary = (eventId: string, enabled = true) => {
  return useQuery({
    queryKey: ["rsvpSummary", eventId],
    queryFn: () => rsvpApi.getRsvpSummary(eventId),
    enabled: Boolean(eventId) && enabled,
  });
};

export const useUpsertRsvp = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: RsvpStatus) => rsvpApi.upsertRsvp(eventId, status),
    onSuccess: (data) => {
      toast.success(data.message || "RSVP updated!");
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["rsvpSummary", eventId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update RSVP. Please try again.",
      );
    },
  });
};

export const useDeleteRsvp = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rsvpApi.deleteRsvp(eventId),
    onSuccess: (data) => {
      toast.success(data.message || "RSVP removed!");
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["rsvpSummary", eventId] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to remove RSVP. Please try again.",
      );
    },
  });
};
