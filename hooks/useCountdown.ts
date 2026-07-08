"use client";

import useSWR from "swr";
import type { CalendarEvent } from "@/lib/integrations/types";

export interface PinnedCountdown {
  key: string;   // seriesKey of the pinned event
  title: string;
  start: string; // ISO of the instance that was pinned
  color: string | null;
  allDay: boolean;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useCountdown() {
  const { data, mutate } = useSWR<PinnedCountdown | null>("/api/countdown", fetcher, {
    revalidateOnFocus: false,
  });

  async function pin(event: CalendarEvent) {
    const snapshot: PinnedCountdown = {
      key: event.seriesKey ?? event.id,
      title: event.title,
      start: event.start,
      color: event.color ?? null,
      allDay: event.allDay,
    };
    await mutate(snapshot, { revalidate: false });
    const res = await fetch("/api/countdown", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snapshot),
    });
    if (!res.ok) throw new Error(`Failed to pin (HTTP ${res.status})`);
    await mutate();
  }

  async function unpin() {
    await mutate(null, { revalidate: false });
    const res = await fetch("/api/countdown", { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to unpin (HTTP ${res.status})`);
    await mutate();
  }

  return { pinned: data ?? null, pin, unpin };
}
