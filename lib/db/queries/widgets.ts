import { getDb } from "../client";
import type { LayoutItem } from "react-grid-layout";

export interface StoredLayout {
  breakpoint: string;
  widget_id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function getLayouts(): Record<string, LayoutItem[]> {
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM widget_layouts")
    .all() as StoredLayout[];
  const result: Record<string, LayoutItem[]> = {};
  for (const row of rows) {
    if (!result[row.breakpoint]) result[row.breakpoint] = [];
    result[row.breakpoint].push({
      i: row.widget_id,
      x: row.x,
      y: row.y,
      w: row.w,
      h: row.h,
    });
  }
  return result;
}

export function saveLayouts(layouts: Record<string, LayoutItem[]>): void {
  const db = getDb();
  const upsert = db.prepare(
    "INSERT OR REPLACE INTO widget_layouts (breakpoint, widget_id, x, y, w, h) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const saveAll = db.transaction(() => {
    for (const [bp, items] of Object.entries(layouts)) {
      for (const item of items) {
        upsert.run(bp, item.i, item.x, item.y, item.w, item.h);
      }
    }
  });
  saveAll();
}
