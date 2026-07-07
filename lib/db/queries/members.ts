import { getDb } from "../client";

export interface Member {
  id: number;
  name: string;
  color: string;
  initials: string;
  sort_order: number;
}

export function getMembers(): Member[] {
  const db = getDb();
  return db.prepare("SELECT * FROM members ORDER BY sort_order ASC, id ASC").all() as Member[];
}

export function getMemberById(id: number): Member | null {
  const db = getDb();
  return db.prepare("SELECT * FROM members WHERE id = ?").get(id) as Member | null;
}

export function addMember(name: string, color: string): Member {
  const db = getDb();
  const initials = name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const maxOrder = (
    db.prepare("SELECT MAX(sort_order) as m FROM members").get() as { m: number | null }
  ).m ?? -1;
  const result = db
    .prepare("INSERT INTO members (name, color, initials, sort_order) VALUES (?, ?, ?, ?)")
    .run(name.trim(), color, initials, maxOrder + 1);
  return getMemberById(result.lastInsertRowid as number)!;
}

export function updateMember(id: number, name?: string, color?: string): void {
  const db = getDb();
  if (name !== undefined) {
    const initials = name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    db.prepare("UPDATE members SET name = ?, initials = ? WHERE id = ?").run(name.trim(), initials, id);
  }
  if (color !== undefined) {
    db.prepare("UPDATE members SET color = ? WHERE id = ?").run(color, id);
  }
}

export function deleteMember(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM members WHERE id = ?").run(id);
}
