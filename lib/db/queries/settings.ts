import { getDb } from "../client";

export function getSetting(key: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(
    key,
    value
  );
}

export function deleteSetting(key: string): void {
  const db = getDb();
  db.prepare("DELETE FROM settings WHERE key = ?").run(key);
}

export function getAllSettings(): Record<string, string> {
  const db = getDb();
  const rows = db
    .prepare("SELECT key, value FROM settings")
    .all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
