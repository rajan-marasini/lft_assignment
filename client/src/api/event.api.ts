import { apiClient } from "@/api/axios";
import type {
  ApiResponse,
} from "@/types/auth.types";
import type { GetEventsParams, GetEventsResponse } from "@/types/event.types";

export const eventApi = {
  getEvents: async (
    params: GetEventsParams = {}
  ): Promise<ApiResponse<GetEventsResponse>> => {
    const response = await apiClient.get<ApiResponse<GetEventsResponse>>(
      "/events",
      { params }
    );
    return response.data;
  },
};
