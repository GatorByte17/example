"use client";

import { differenceInDays, parseISO, startOfDay, isAfter, addDays } from "date-fns";
import { useCalendar } from "@/hooks/useCalendar";

export default function CountdownBanner() {
  const { events } = useCalendar();

  const today = startOfDay(new Date());
  const threshold = addDays(today, 6); // only show events more than 6 days out

  const upcoming = events
    .filter((e) => isAfter(startOfDay(parseISO(e.start)), threshold))
    .sort((a, b) => a.start.localeCompare(b.start));

  if (upcoming.length === 0) return null;

  const next = upcoming[0];
  const days = differenceInDays(startOfDay(parseISO(next.start)), today);
  const color = next.color ?? "var(--accent)";

  return (
    <div
      className="sky-card px-4 py-3 flex items-center gap-3 flex-none"
      style={{ borderLeft: `5px solid ${color}` }}
    >
      <span className="text-2xl flex-shrink-0">🗓️</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[var(--foreground)] truncate">{next.title}</p>
        <p className="text-xs text-[var(--muted)] font-medium">
          {days === 1 ? "Tomorrow!" : `Coming up in ${days} days`}
        </p>
      </div>
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
