import { getDb } from "../client";

export interface Todo {
  id: number;
  title: string;
  done: boolean;
  due_date: string | null;
  list_name: string;
  sort_order: number;
  created_at: string;
}

export function getTodos(listName = "default"): Todo[] {
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT * FROM todos WHERE list_name = ? ORDER BY sort_order ASC, id ASC"
    )
    .all(listName) as (Omit<Todo, "done"> & { done: number })[];
  return rows.map((r) => ({ ...r, done: r.done === 1 }));
}

export function addTodo(
  title: string,
  listName = "default",
  dueDate?: string
): Todo {
  const db = getDb();
  const maxOrder = (
    db
      .prepare("SELECT MAX(sort_order) as m FROM todos WHERE list_name = ?")
      .get(listName) as { m: number | null }
  ).m ?? -1;
  const result = db
    .prepare(
      "INSERT INTO todos (title, list_name, due_date, sort_order) VALUES (?, ?, ?, ?)"
    )
    .run(title, listName, dueDate ?? null, maxOrder + 1);
  return getTodoById(result.lastInsertRowid as number)!;
}

export function toggleTodo(id: number): void {
  const db = getDb();
  db.prepare("UPDATE todos SET done = NOT done WHERE id = ?").run(id);
}

export function deleteTodo(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM todos WHERE id = ?").run(id);
}

export function getTodoById(id: number): Todo | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as
    | (Omit<Todo, "done"> & { done: number })
    | undefined;
  if (!row) return null;
  return { ...row, done: row.done === 1 };
}
