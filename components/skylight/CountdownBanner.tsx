"use client";

import { differenceInDays, parseISO, startOfDay, isAfter, addDays } from "date-fns";
import { useCalendar } from "@/hooks/useCalendar";
import { useCountdown } from "@/hooks/useCountdown";
import type { CalendarEvent } from "@/lib/integrations/types";

interface Target {
  title: string;
  start: string;
  color: string | null;
  pinned: boolean;
}

// Auto-pick: the next event 7+ days out, considering only the FIRST
// upcoming occurrence of each series — a weekly event happening this
// week never shows up as a countdown to next week's instance.
function autoTarget(events: CalendarEvent[], today: Date): Target | null {
  const threshold = addDays(today, 6);

  const firstOccurrence = new Map<string, CalendarEvent>();
  for (const e of events) {
    if (startOfDay(parseISO(e.start)) < today) continue;
    const key = e.seriesKey ?? e.id;
    const existing = firstOccurrence.get(key);
    if (!existing || e.start < existing.start) firstOccurrence.set(key, e);
  }

  const candidates = Array.from(firstOccurrence.values())
    .filter((e) => isAfter(startOfDay(parseISO(e.start)), threshold))
    .sort((a, b) => a.start.localeCompare(b.start));

  if (candidates.length === 0) return null;
  const next = candidates[0];
  return { title: next.title, start: next.start, color: next.color ?? null, pinned: false };
}

export default function CountdownBanner() {
  const { events } = useCalendar();
  const { pinned, unpin } = useCountdown();

  const today = startOfDay(new Date());

  let target: Target | null = null;

  if (pinned) {
    // Prefer the next live occurrence of the pinned series (handles
    // recurring events rolling forward); fall back to the pinned snapshot
    const nextOccurrence = events
      .filter(
        (e) =>
          (e.seriesKey ?? e.id) === pinned.key &&
          startOfDay(parseISO(e.start)) >= today
      )
      .sort((a, b) => a.start.localeCompare(b.start))[0];

    const start = nextOccurrence?.start ?? pinned.start;
    if (startOfDay(parseISO(start)) >= today) {
      target = {
        title: nextOccurrence?.title ?? pinned.title,
        start,
        color: nextOccurrence?.color ?? pinned.color,
        pinned: true,
      };
    }
  }

  if (!target) target = autoTarget(events, today);
  if (!target) return null;

  const days = differenceInDays(startOfDay(parseISO(target.start)), today);
  const color = target.color ?? "var(--accent)";
  const label = days === 0 ? "Today!" : days === 1 ? "Tomorrow!" : `Coming up in ${days} days`;

  return (
    <div
      className="sky-card px-4 py-3 flex items-center gap-3 flex-none group"
      style={{ borderLeft: `5px solid ${color}` }}
    >
      <span className="text-2xl flex-shrink-0">{target.pinned ? "📌" : "🗓️"}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--foreground)] truncate">{target.title}</p>
        <p className="text-xs text-[var(--muted)] font-medium">{label}</p>
      </div>
      {target.pinned && (
        <button
          onClick={() => unpin().catch(() => {})}
          className="text-[10px] font-semibold text-[var(--muted)] hover:text-red-500 transition opacity-60 hover:opacity-100 flex-shrink-0"
          title="Unpin from countdown"
        >
          Unpin
        </button>
      )}
      <div className="text-right flex-shrink-0">
        <p className="text-3xl font-extrabold leading-none" style={{ color }}>
          {days}
        </p>
        <p className="text-[10px] text-[var(--muted)] uppercase tracking-wide font-semibold">
          days
        </p>
      </div>
    </div>
  );
}
