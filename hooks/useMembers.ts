"use client";

import useSWR from "swr";
import type { Member } from "@/lib/db/queries/members";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useMembers() {
  const { data, error, isLoading, mutate } = useSWR<Member[]>("/api/members", fetcher, {
    revalidateOnFocus: false,
  });

  async function addMember(name: string, color: string) {
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error(`Failed to save member (HTTP ${res.status})`);
    await mutate();
  }

  async function updateMember(id: number, patch: { name?: string; color?: string }) {
    const res = await fetch("/api/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (!res.ok) throw new Error(`Failed to update member (HTTP ${res.status})`);
    await mutate();
  }

  async function deleteMember(id: number) {
    const res = await fetch(`/api/members?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Failed to delete member (HTTP ${res.status})`);
    await mutate();
  }

  return {
    members: data ?? [],
    error,
    isLoading,
    addMember,
    updateMember,
    deleteMember,
  };
}
