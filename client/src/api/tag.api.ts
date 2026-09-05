import { apiClient } from "@/api/axios";
import type { ApiResponse } from "@/types/auth.types";
import type { EventTag } from "@/types/event.types";

export interface GetTagsResponse {
  tags: (EventTag & { event_count: number })[];
}

export const tagApi = {
  getAllTags: async (): Promise<ApiResponse<GetTagsResponse>> => {
    const response = await apiClient.get<ApiResponse<GetTagsResponse>>("/tags");
    return response.data;
  },
};
