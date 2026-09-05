export interface EventTag {
  id: string;
  name: string;
}

export interface EventCreator {
  id: string;
  name: string;
  email: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  location: string;
  visibility: "public" | "private";
  created_at: string;
  updated_at: string;
  creator: EventCreator;
  tags: EventTag[];
}

export interface EventPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface GetEventsResponse {
  events: Event[];
  pagination: EventPagination;
}

export interface GetEventsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "upcoming" | "past";
  visibility?: "all" | "public" | "private";
  sortBy?: "starts_at" | "created_at" | "title";
  sortOrder?: "asc" | "desc";
  tag?: string[];
}
