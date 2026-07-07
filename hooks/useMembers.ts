"use client";

import useSWR from "swr";
import type { Member } from "@/lib/db/queries/members";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useMembers() {
  const { data, error, isLoading, mutate } = useSWR<Member[]>("/api/members", fetcher, {
    revalidateOnFocus: false,
  });

  async function addMember(name: string, color: string) {
    await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    await mutate();
  }

  async function deleteMember(id: number) {
    await fetch(`/api/members?id=${id}`, { method: "DELETE" });
    await mutate();
  }

  return {
    members: data ?? [],
    error,
    isLoading,
    addMember,
    deleteMember,
  };
}
