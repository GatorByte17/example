"use client";

import { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
} from "date-fns";
import { useCalendar } from "@/hooks/useCalendar";
import { eventCoversDay } from "@/lib/events";
import { tint } from "@/lib/colors";
import type { CalendarEvent } from "@/lib/integrations/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildCells(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function eventsForDay(
  events: CalendarEvent[],
  year: number,
  month: number,
  day: number
): CalendarEvent[] {
  const target = new Date(year, month, day);
  return events.filter((e) => eventCoversDay(e, target));
}

function EventChip({ event }: { event: CalendarEvent }) {
  const color = event.color ?? "var(--accent)";
  const isVar = color.startsWith("var(");
  return (
    <div
      className="w-full px-1.5 py-0.5 rounded-md text-[10px] font-semibold truncate leading-tight
                 hidden landscape:block lg:block"
      style={{
        backgroundColor: isVar ? "rgba(255, 107, 87, 0.15)" : tint(color),
        color,
      }}
      title={event.title}
    >
      {event.title}
    </div>
  );
}

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
}

function DayCell({ day, isToday, isWeekend, events }: DayCellProps) {
  const chips = events.slice(0, 2);
  const extra = events.length - chips.length;

  return (
    <div
      className={[
        "flex flex-col items-stretch gap-0.5 p-1 min-w-0 min-h-0 rounded-xl overflow-hidden",
        isWeekend && day !== null ? "bg-[var(--surface-2)]/60" : "",
      ].join(" ")}
    >
      <div className="flex justify-center flex-none">
        <div
          className={[
            "w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold leading-none select-none transition-colors",
            isToday
              ? "bg-[var(--accent)] text-white font-bold shadow-sm"
              : day !== null
              ? "text-[var(--foreground)]"
              : "text-transparent",
          ].join(" ")}
        >
          {day ?? ""}
        </div>
      </div>

      {events.length > 0 && (
        <div className="flex flex-col gap-0.5 min-h-0 overflow-hidden">
          {chips.map((e) => (
            <EventChip key={e.id} event={e} />
          ))}
          {extra > 0 && (
            <div className="text-[9px] font-semibold text-[var(--muted)] px-1.5 hidden landscape:block lg:block">
              +{extra} more
            </div>
          )}
          {/* Dots fallback for portrait / narrow layouts */}
          <div className="flex gap-0.5 flex-wrap justify-center landscape:hidden lg:hidden">
            {events.slice(0, 4).map((e, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: e.color ?? "var(--accent)" }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MonthCalendar() {
  const [viewDate, setViewDate] = useState(new Date());

  // Fetch exactly the visible month (past days included)
  const range = useMemo(
    () => ({
      start: startOfMonth(viewDate).toISOString(),
      end: endOfMonth(viewDate).toISOString(),
    }),
    [viewDate]
  );
  const { events } = useCalendar(range);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const cells = buildCells(year, month);
  const weekCount = cells.length / 7;

  return (
    <div className="sky-card p-4 flex flex-col gap-3 flex-1 min-h-0">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white transition text-xl font-light"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-[var(--foreground)]">
            {format(viewDate, "MMMM yyyy")}
          </h2>
          {!isSameMonth(viewDate, today) && (
            <button
              onClick={() => setViewDate(new Date())}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white transition text-xl font-light"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 text-center flex-none">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-[10px] font-bold text-[var(--teal)] py-0.5 uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="grid grid-cols-7 flex-1 min-h-0 gap-0.5"
        style={{ gridTemplateRows: `repeat(${weekCount}, minmax(0, 1fr))` }}
      >
        {cells.map((day, i) => {
          const dayEvents = day ? eventsForDay(events, year, month, day) : [];
          const isToday =
            day !== null &&
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;
          const dow = i % 7;

          return (
            <DayCell
              key={i}
              day={day}
              isToday={isToday}
              isWeekend={dow === 0 || dow === 6}
              events={dayEvents}
            />
          );
        })}
      </div>
    </div>
  );
}
