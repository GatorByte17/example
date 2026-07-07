"use client";

import useSWR from "swr";
import { Todo } from "@/lib/db/queries/todos";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useTodos(listName = "default") {
  const { data, error, isLoading, mutate } = useSWR<Todo[]>(
    `/api/todos?list=${listName}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  async function addTodo(title: string, dueDate?: string, memberId?: number) {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, list: listName, dueDate, memberId }),
    });
    await mutate();
  }

  async function toggleTodo(id: number) {
    // Optimistic update
    await mutate(
      (current) =>
        current?.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
      { revalidate: false }
    );
    await fetch("/api/todos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await mutate();
  }

  async function deleteTodo(id: number) {
    await fetch(`/api/todos?id=${id}`, { method: "DELETE" });
    await mutate();
  }

  return {
    todos: data ?? [],
    error,
    isLoading,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
