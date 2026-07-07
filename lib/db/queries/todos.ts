import { getDb } from "../client";

export interface Todo {
  id: number;
  title: string;
  done: boolean;
  due_date: string | null;
  list_name: string;
  sort_order: number;
  created_at: string;
  member_id: number | null;
}

type TodoRow = Omit<Todo, "done"> & { done: number };

export function getTodos(listName = "default"): Todo[] {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM todos WHERE list_name = ? ORDER BY sort_order ASC, id ASC")
    .all(listName) as TodoRow[];
  return rows.map((r) => ({ ...r, done: r.done === 1 }));
}

export function addTodo(
  title: string,
  listName = "default",
  dueDate?: string,
  memberId?: number
): Todo {
  const db = getDb();
  const maxOrder = (
    db
      .prepare("SELECT MAX(sort_order) as m FROM todos WHERE list_name = ?")
      .get(listName) as { m: number | null }
  ).m ?? -1;
  const result = db
    .prepare(
      "INSERT INTO todos (title, list_name, due_date, sort_order, member_id) VALUES (?, ?, ?, ?, ?)"
    )
    .run(title, listName, dueDate ?? null, maxOrder + 1, memberId ?? null);
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

export function deleteCompleted(listName = "default"): number {
  const db = getDb();
  const result = db
    .prepare("DELETE FROM todos WHERE list_name = ? AND done = 1")
    .run(listName);
  return result.changes;
}

export function getTodoById(id: number): Todo | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as TodoRow | undefined;
  if (!row) return null;
  return { ...row, done: row.done === 1 };
}
