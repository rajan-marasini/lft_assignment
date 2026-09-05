import { apiClient } from "@/api/axios";
import type { ApiResponse } from "@/types/auth.types";
import type { RsvpResponse, RsvpStatus } from "@/types/event.types";

export const rsvpApi = {
  upsertRsvp: async (
    eventId: string,
    status: RsvpStatus,
  ): Promise<ApiResponse<RsvpResponse>> => {
    const response = await apiClient.post<ApiResponse<RsvpResponse>>(
      `/events/${eventId}/rsvp`,
      { status },
    );
    return response.data;
  },

  deleteRsvp: async (eventId: string): Promise<ApiResponse<RsvpResponse>> => {
    const response = await apiClient.delete<ApiResponse<RsvpResponse>>(
      `/events/${eventId}/rsvp`,
    );
    return response.data;
  },

  getRsvpSummary: async (
    eventId: string,
  ): Promise<ApiResponse<RsvpResponse>> => {
    const response = await apiClient.get<ApiResponse<RsvpResponse>>(
      `/events/${eventId}/rsvp`,
    );
    return response.data;
  },
};
