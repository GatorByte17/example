"use client";

import { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  parseISO,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { useCalendar } from "@/hooks/useCalendar";
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
  return events.filter((e) => isSameDay(parseISO(e.start), target));
}

interface DayCellProps {
  day: number | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
}

function DayCell({ day, isToday, isCurrentMonth, events }: DayCellProps) {
  const dots = events.slice(0, 4);
  const extra = events.length - dots.length;

  return (
    <div className="flex flex-col items-center gap-0.5 py-1 min-w-0">
      <div
        className={[
          "w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors leading-none select-none",
          isToday
            ? "bg-[var(--accent)] text-white font-bold"
            : isCurrentMonth
            ? "text-white hover:bg-white/10"
            : "text-white/20",
        ].join(" ")}
      >
        {day ?? ""}
      </div>

      {events.length > 0 && (
        <div className="flex gap-0.5 flex-wrap justify-center">
          {dots.map((e, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: e.color ?? "var(--accent)" }}
            />
          ))}
          {extra > 0 && (
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
          )}
        </div>
      )}
    </div>
  );
}

export default function MonthCalendar() {
  const { events } = useCalendar();
  const [viewDate, setViewDate] = useState(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const cells = buildCells(year, month);

  return (
    <div className="glass-card p-4 flex flex-col gap-3 flex-1 min-h-0">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition text-lg font-light"
          aria-label="Previous month"
        >
          ‹
        </button>

        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white">
            {format(viewDate, "MMMM yyyy")}
          </h2>
          {!isSameMonth(viewDate, today) && (
            <button
              onClick={() => setViewDate(new Date())}
              className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 transition"
            >
              Today
            </button>
          )}
        </div>

        <button
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition text-lg font-light"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 text-center">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-[10px] font-medium text-white/40 py-0.5 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 flex-1">
        {cells.map((day, i) => {
          const dayEvents = day ? eventsForDay(events, year, month, day) : [];
          const isToday =
            day !== null &&
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;

          return (
            <DayCell
              key={i}
              day={day}
              isToday={isToday}
              isCurrentMonth={day !== null}
              events={dayEvents}
            />
          );
        })}
      </div>
    </div>
  );
}
