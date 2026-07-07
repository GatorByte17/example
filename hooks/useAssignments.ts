"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// eventKey (seriesKey) → member ids, maintained locally in SQLite
export function useAssignments() {
  const { data, mutate } = useSWR<Record<string, number[]>>(
    "/api/assignments",
    fetcher,
    { revalidateOnFocus: false }
  );

  async function assign(eventKey: string, memberIds: number[]) {
    // Optimistic update so avatar dots appear instantly
    await mutate({ ...(data ?? {}), [eventKey]: memberIds }, { revalidate: false });
    const res = await fetch("/api/assignments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventKey, memberIds }),
    });
    if (!res.ok) throw new Error(`Failed to save assignment (HTTP ${res.status})`);
    await mutate();
  }

  return { assignments: data ?? {}, assign };
}
