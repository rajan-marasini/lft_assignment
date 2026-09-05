import { apiClient } from "@/api/axios";
import type { ApiResponse } from "@/types/auth.types";
import type {
  CreateEventPayload,
  GetEventsParams,
  GetEventsResponse,
  SingleEventResponse,
  UpdateEventPayload,
} from "@/types/event.types";

export const eventApi = {
  getEvents: async (
    params: GetEventsParams = {}
  ): Promise<ApiResponse<GetEventsResponse>> => {
    const response = await apiClient.get<ApiResponse<GetEventsResponse>>(
      "/events",
      {
        params,
        paramsSerializer: {
          indexes: null,
        },
      }
    );
    return response.data;
  },

  getEventById: async (
    id: string
  ): Promise<ApiResponse<SingleEventResponse>> => {
    const response = await apiClient.get<ApiResponse<SingleEventResponse>>(
      `/events/${id}`
    );
    return response.data;
  },

  createEvent: async (
    payload: CreateEventPayload
  ): Promise<ApiResponse<SingleEventResponse>> => {
    const response = await apiClient.post<ApiResponse<SingleEventResponse>>(
      "/events",
      payload
    );
    return response.data;
  },

  updateEvent: async (
    id: string,
    payload: UpdateEventPayload
  ): Promise<ApiResponse<SingleEventResponse>> => {
    const response = await apiClient.patch<ApiResponse<SingleEventResponse>>(
      `/events/${id}`,
      payload
    );
    return response.data;
  },

  deleteEvent: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/events/${id}`);
    return response.data;
  },
};

