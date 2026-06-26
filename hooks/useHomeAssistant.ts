"use client";

import useSWR from "swr";
import { HAEntity } from "@/lib/integrations/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useHomeAssistant(entityIds?: string[]) {
  const query = entityIds?.length
    ? `?entities=${entityIds.join(",")}`
    : "";

  const { data, error, isLoading, mutate } = useSWR<HAEntity[]>(
    `/api/home-assistant${query}`,
    fetcher,
    {
      refreshInterval: 30 * 1000, // 30 seconds
      revalidateOnFocus: true,
    }
  );

  async function callService(
    domain: string,
    service: string,
    data: Record<string, unknown>
  ) {
    await fetch("/api/home-assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain, service, data }),
    });
    await mutate();
  }

  return { entities: data ?? [], error, isLoading, callService };
}
