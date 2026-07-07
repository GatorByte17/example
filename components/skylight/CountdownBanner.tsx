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

  return (
    <div
      className="glass-card px-4 py-3 flex items-center gap-3"
      style={{ borderLeft: `3px solid ${next.color ?? "var(--accent)"}` }}
    >
      <span className="text-xl flex-shrink-0">📅</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{next.title}</p>
        <p className="text-xs text-white/50">
          {days === 1 ? "Tomorrow" : `In ${days} days`}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-2xl font-bold text-white leading-none">{days}</p>
        <p className="text-[10px] text-white/40 uppercase tracking-wide">days</p>
      </div>
    </div>
  );
}
