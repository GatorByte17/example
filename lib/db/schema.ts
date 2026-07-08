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

    CREATE TABLE IF NOT EXISTS members (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      color      TEXT    NOT NULL DEFAULT '#6366f1',
      initials   TEXT    NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS event_assignments (
      event_key  TEXT    NOT NULL,
      member_id  INTEGER NOT NULL,
      PRIMARY KEY (event_key, member_id)
    );

    CREATE TABLE IF NOT EXISTS lists (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      key        TEXT    NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Additive migrations — safe to run repeatedly
  try { db.exec("ALTER TABLE todos ADD COLUMN member_id INTEGER"); } catch { /* already exists */ }

  // Built-in list; todos with list_name 'chores' predate the lists table
  db.prepare(
    "INSERT OR IGNORE INTO lists (name, key, sort_order) VALUES ('Chores', 'chores', 0)"
  ).run();
}
