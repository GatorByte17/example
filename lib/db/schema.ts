import { getDb } from "./client";

export function runMigrations() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS todos (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      title      TEXT    NOT NULL,
      done       INTEGER NOT NULL DEFAULT 0,
      due_date   TEXT,
      list_name  TEXT    NOT NULL DEFAULT 'default',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS widget_layouts (
      breakpoint TEXT    NOT NULL,
      widget_id  TEXT    NOT NULL,
      x          INTEGER NOT NULL,
      y          INTEGER NOT NULL,
      w          INTEGER NOT NULL,
      h          INTEGER NOT NULL,
      PRIMARY KEY (breakpoint, widget_id)
    );

    CREATE TABLE IF NOT EXISTS calendar_credentials (
      provider   TEXT PRIMARY KEY,
      data       TEXT NOT NULL
    );
  `);
}
