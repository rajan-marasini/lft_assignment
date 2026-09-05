import { useQuery } from "@tanstack/react-query";

import { tagApi } from "@/api/tag.api";

export const TAGS_QUERY_KEY = ["tags"];

export const useGetAllTags = () => {
  return useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: tagApi.getAllTags,
    staleTime: 5 * 60 * 1000,
  });
};
