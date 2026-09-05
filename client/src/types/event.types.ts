export type RsvpStatus = "yes" | "no" | "maybe";

export interface RsvpCounts {
  yes: number;
  no: number;
  maybe: number;
  total: number;
}

export interface RsvpAttendee {
  id: string;
  name: string;
  status: "yes" | "maybe";
}

export interface RsvpSummary {
  counts: RsvpCounts;
  currentUserStatus: RsvpStatus | null;
  attendees?: RsvpAttendee[];
}

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
  rsvp?: {
    counts: RsvpCounts;
    currentUserStatus: RsvpStatus | null;
  };
}

export interface EventPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  starts_at: string;
  location: string;
  visibility: "public" | "private";
  tags?: string[];
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface SingleEventResponse {
  event: Event;
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
  sortBy?: "starts_at" | "created_at" | "title" | "popularity";
  sortOrder?: "asc" | "desc";
  tag?: string[];
}

export interface RsvpResponse {
  rsvp: RsvpSummary;
}
