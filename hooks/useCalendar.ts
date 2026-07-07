"use client";

import useSWR from "swr";
import { CalendarEvent } from "@/lib/integrations/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface CalendarResponse {
  events: CalendarEvent[];
  connected: { google: boolean; icloud: boolean };
  errors: string[];
}

export interface CalendarRange {
  start: string; // ISO
  end: string;   // ISO
}

// Without a range: start of today → +45 days (agenda, countdown).
// With a range (month view): that exact window, past days included.
export function useCalendar(range?: CalendarRange) {
  const key = range
    ? `/api/calendar?start=${encodeURIComponent(range.start)}&end=${encodeURIComponent(range.end)}`
    : "/api/calendar";

  const { data, error, isLoading } = useSWR<CalendarResponse>(key, fetcher, {
    refreshInterval: 5 * 60 * 1000,
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  return {
    events: data?.events ?? [],
    connected: data?.connected,
    errors: data?.errors ?? [],
    error,
    isLoading,
  };
}
