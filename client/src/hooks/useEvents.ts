import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import { eventApi } from "@/api/event.api";
import type {
  CreateEventPayload,
  GetEventsParams,
  UpdateEventPayload,
} from "@/types/event.types";

export const EVENTS_QUERY_KEY = (params: GetEventsParams) => [
  "events",
  params,
];

export const EVENT_DETAIL_QUERY_KEY = (id: string) => ["events", "detail", id];

export const useGetEvents = (params: GetEventsParams = {}) => {
  return useQuery({
    queryKey: EVENTS_QUERY_KEY(params),
    queryFn: () => eventApi.getEvents(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};

export const useGetEventById = (id: string) => {
  return useQuery({
    queryKey: EVENT_DETAIL_QUERY_KEY(id),
    queryFn: () => eventApi.getEventById(id),
    enabled: !!id,
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventApi.createEvent(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const msg = error.response?.data?.message || "Failed to create event.";
      toast.error(msg);
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateEventPayload;
    }) => eventApi.updateEvent(id, payload),
    onSuccess: (data, variables) => {
      toast.success(data.message || "Event updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: EVENT_DETAIL_QUERY_KEY(variables.id),
      });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const msg = error.response?.data?.message || "Failed to update event.";
      toast.error(msg);
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => eventApi.deleteEvent(id),
    onSuccess: (data) => {
      toast.success(data.message || "Event deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const msg = error.response?.data?.message || "Failed to delete event.";
      toast.error(msg);
    },
  });
};

