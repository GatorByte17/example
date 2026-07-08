import { getDb } from "../client";

export interface List {
  id: number;
  name: string;
  key: string;
  sort_order: number;
}

export function getLists(): List[] {
  const db = getDb();
  return db.prepare("SELECT * FROM lists ORDER BY sort_order ASC, id ASC").all() as List[];
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function addList(name: string): List {
  const db = getDb();
  const key = slugify(name);
  if (!key) throw new Error("Invalid list name");
  const existing = db.prepare("SELECT id FROM lists WHERE key = ?").get(key);
  if (existing) throw new Error("A list with that name already exists");

  const maxOrder = (
    db.prepare("SELECT MAX(sort_order) as m FROM lists").get() as { m: number | null }
  ).m ?? 0;
  const result = db
    .prepare("INSERT INTO lists (name, key, sort_order) VALUES (?, ?, ?)")
    .run(name.trim(), key, maxOrder + 1);
  return db.prepare("SELECT * FROM lists WHERE id = ?").get(result.lastInsertRowid) as List;
}

export function deleteList(id: number): void {
  const db = getDb();
  const list = db.prepare("SELECT * FROM lists WHERE id = ?").get(id) as List | undefined;
  if (!list) return;
  if (list.key === "chores") throw new Error("The Chores list is built in");
  // A deleted list takes its items with it
  db.transaction(() => {
    db.prepare("DELETE FROM todos WHERE list_name = ?").run(list.key);
    db.prepare("DELETE FROM lists WHERE id = ?").run(id);
  })();
}
