"use client";

import useSWR from "swr";
import type { GTaskList, GTask } from "@/lib/integrations/google-tasks";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Google Tasks lists — polled so lists created on phones appear
export function useGoogleTaskLists() {
  const { data } = useSWR<{ connected: boolean; lists: GTaskList[] }>(
    "/api/google-tasks",
    fetcher,
    { refreshInterval: 60_000, revalidateOnFocus: true }
  );
  return {
    connected: data?.connected ?? false,
    googleLists: data?.lists ?? [],
  };
}

// Items in one Google Tasks list — polled fast so edits made in the
// Google Tasks app show up on the dashboard within seconds
export function useGoogleTasks(listId: string | null) {
  const key = listId ? `/api/google-tasks?list=${encodeURIComponent(listId)}` : null;
  const { data, isLoading, mutate } = useSWR<{ tasks: GTask[] }>(key, fetcher, {
    refreshInterval: 20_000,
    revalidateOnFocus: true,
    keepPreviousData: true,
  });

  const tasks = data?.tasks ?? [];

  async function addTask(title: string) {
    if (!listId) return;
    const res = await fetch("/api/google-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId, title }),
    });
    if (!res.ok) throw new Error(`Failed to add item (HTTP ${res.status})`);
    await mutate();
  }

  async function toggleTask(taskId: string) {
    if (!listId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    // Optimistic flip
    await mutate(
      { tasks: tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) },
      { revalidate: false }
    );
    const res = await fetch("/api/google-tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId, taskId, done: !task.done }),
    });
    if (!res.ok) throw new Error(`Failed to update item (HTTP ${res.status})`);
    await mutate();
  }

  async function deleteTask(taskId: string) {
    if (!listId) return;
    const res = await fetch(
      `/api/google-tasks?listId=${encodeURIComponent(listId)}&taskId=${encodeURIComponent(taskId)}`,
      { method: "DELETE" }
    );
    if (!res.ok) throw new Error(`Failed to delete item (HTTP ${res.status})`);
    await mutate();
  }

  return { tasks, isLoading, addTask, toggleTask, deleteTask };
}
