import { useQuery } from "@tanstack/react-query";

import { eventApi } from "@/api/event.api";
import type { GetEventsParams } from "@/types/event.types";

export const EVENTS_QUERY_KEY = (params: GetEventsParams) => [
  "events",
  params,
];

export const useGetEvents = (params: GetEventsParams = {}) => {
  return useQuery({
    queryKey: EVENTS_QUERY_KEY(params),
    queryFn: () => eventApi.getEvents(params),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
};
