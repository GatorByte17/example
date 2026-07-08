"use client";

import useSWR from "swr";
import type { List } from "@/lib/db/queries/lists";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useLists() {
  const { data, error, isLoading, mutate } = useSWR<List[]>("/api/lists", fetcher, {
    revalidateOnFocus: false,
  });

  async function addList(name: string): Promise<List> {
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Failed to create list (HTTP ${res.status})`);
    }
    const list = (await res.json()) as List;
    await mutate();
    return list;
  }

  async function deleteList(id: number) {
    const res = await fetch(`/api/lists?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Failed to delete list (HTTP ${res.status})`);
    }
    await mutate();
  }

  return { lists: data ?? [], error, isLoading, addList, deleteList };
}
