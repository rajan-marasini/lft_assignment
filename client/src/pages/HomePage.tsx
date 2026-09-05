import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

import { EventCard, EventCardSkeleton } from "@/components/events/EventCard";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useAuth";
import { useGetEvents } from "@/hooks/useEvents";
import type { GetEventsParams } from "@/types/event.types";

const EVENTS_PER_PAGE = 6;

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
] as const;

type StatusFilter = "all" | "upcoming" | "past";

export const HomePage = () => {
  const { data: user } = useCurrentUser();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("upcoming");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryParams: GetEventsParams = {
    page,
    limit: EVENTS_PER_PAGE,
    status: statusFilter,
    visibility: user ? "all" : "public",
    sortBy: "starts_at",
    sortOrder: statusFilter === "past" ? "desc" : "asc",
    ...(search ? { search } : {}),
  };

  const { data, isFetching, isError } = useGetEvents(queryParams);

  const events = data?.data?.events ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const totalItems = pagination?.totalItems ?? 0;

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [totalPages],
  );

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "360px" }}
      >
        <img
          src="/hero-banner.jpg"
          alt="People enjoying a community event"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-stone-900/55" />

        <div className="relative h-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col justify-center">
          <div className="max-w-xl">
            <p className="text-amber-300 text-sm font-medium mb-2 tracking-wide">
              Community Events
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Find events happening around you
            </h1>
            <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
              Browse upcoming public events, or sign in to manage and share your
              own.
            </p>
            {!user && (
              <div className="flex gap-3 mt-6">
                <Link to="/register">
                  <button
                    id="hero-signup-btn"
                    className="bg-white text-stone-900 hover:bg-stone-100 transition-colors text-sm font-semibold px-5 py-2.5 rounded"
                  >
                    Create account
                  </button>
                </Link>
                <Link to="/login">
                  <button
                    id="hero-signin-btn"
                    className="text-white border border-white/40 hover:bg-white/10 transition-colors text-sm px-5 py-2.5 rounded"
                  >
                    Sign in
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
            <Input
              id="event-search-input"
              placeholder="Search events…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 pr-8 h-9 bg-white border-stone-300 text-stone-800 placeholder-stone-400 focus:border-stone-500 focus:ring-0 text-sm rounded"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status tabs */}
          <div className="flex items-center border border-stone-300 bg-white rounded overflow-hidden text-sm divide-x divide-stone-300">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                id={`status-filter-${opt.value}`}
                onClick={() => handleStatusChange(opt.value)}
                className={`px-4 py-1.5 font-medium transition-colors ${
                  statusFilter === opt.value
                    ? "bg-stone-800 text-white"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Count */}
          <p className="text-sm text-stone-400 sm:ml-auto whitespace-nowrap">
            {totalItems > 0
              ? `${totalItems.toLocaleString()} event${totalItems !== 1 ? "s" : ""}`
              : ""}
          </p>
        </div>

        {/* Active search badge */}
        {search && (
          <div className="flex items-center gap-2 mb-4 text-sm text-stone-500">
            <span>Results for</span>
            <button
              onClick={clearSearch}
              className="inline-flex items-center gap-1 bg-stone-100 border border-stone-200 text-stone-600 rounded px-2 py-0.5 text-xs hover:bg-stone-200 transition-colors"
            >
              "{search}"
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Events list */}
        <div
          id="events-list"
          className={`flex flex-col gap-3 transition-opacity duration-200 ${
            isFetching ? "opacity-50" : "opacity-100"
          }`}
        >
          {isFetching && events.length === 0 ? (
            Array.from({ length: EVENTS_PER_PAGE }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))
          ) : isError ? (
            <div className="py-20 text-center">
              <CalendarDays className="h-10 w-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600 font-medium">
                Could not load events
              </p>
              <p className="text-stone-400 text-sm mt-1">
                Something went wrong. Please try again.
              </p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-20 text-center">
              <CalendarDays className="h-10 w-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600 font-medium">No events found</p>
              <p className="text-stone-400 text-sm mt-1">
                {search
                  ? `Nothing matched "${search}".`
                  : "Nothing here yet. Try a different filter."}
              </p>
              {(search || statusFilter !== "all") && (
                <button
                  id="clear-filters-btn"
                  onClick={() => {
                    clearSearch();
                    setStatusFilter("all");
                  }}
                  className="mt-4 text-sm text-stone-500 underline underline-offset-2 hover:text-stone-800"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            events.map((event) => <EventCard key={event.id} event={event} />)
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            id="events-pagination"
            className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200"
          >
            <p className="text-sm text-stone-400 hidden sm:block">
              Page {page} of {totalPages}
            </p>

            <nav
              className="flex items-center gap-1"
              aria-label="Events pagination"
            >
              <button
                id="pagination-prev-btn"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || isFetching}
                aria-label="Previous page"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded border border-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map((p, idx) =>
                  p === "ellipsis" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 text-center text-stone-400 text-sm"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      id={`pagination-page-${p}`}
                      onClick={() => handlePageChange(p)}
                      disabled={isFetching}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? "page" : undefined}
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-stone-800 text-white border border-stone-800"
                          : "text-stone-500 hover:bg-stone-100 border border-stone-200 hover:text-stone-900"
                      } disabled:cursor-not-allowed`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                id="pagination-next-btn"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || isFetching}
                aria-label="Next page"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded border border-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>

            <p className="text-sm text-stone-400 hidden md:block">
              {totalItems.toLocaleString()} total
            </p>
          </div>
        )}
      </main>
    </>
  );
};

export default HomePage;
