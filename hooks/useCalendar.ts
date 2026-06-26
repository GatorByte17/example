"use client";

import useSWR from "swr";
import { CalendarEvent } from "@/lib/integrations/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface CalendarResponse {
  events: CalendarEvent[];
  connected: { google: boolean; icloud: boolean };
  errors: string[];
}

export function useCalendar() {
  const { data, error, isLoading } = useSWR<CalendarResponse>(
    "/api/calendar",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
    }
  );

  return {
    events: data?.events ?? [],
    connected: data?.connected,
    errors: data?.errors ?? [],
    error,
    isLoading,
  };
}
