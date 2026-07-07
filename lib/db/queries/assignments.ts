import { getDb } from "../client";

// Event → member assignments live only in the local DB; the event_key is
// the event's seriesKey so recurring events are tagged once for all instances.
export function getAssignments(): Record<string, number[]> {
  const db = getDb();
  const rows = db
    .prepare("SELECT event_key, member_id FROM event_assignments")
    .all() as { event_key: string; member_id: number }[];

  const map: Record<string, number[]> = {};
  for (const row of rows) {
    (map[row.event_key] ??= []).push(row.member_id);
  }
  return map;
}

export function setAssignments(eventKey: string, memberIds: number[]): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare("DELETE FROM event_assignments WHERE event_key = ?").run(eventKey);
    const insert = db.prepare(
      "INSERT OR IGNORE INTO event_assignments (event_key, member_id) VALUES (?, ?)"
    );
    for (const id of memberIds) insert.run(eventKey, id);
  })();
}
