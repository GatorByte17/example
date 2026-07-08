"use client";

import { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameWeek,
  isSameDay,
  parseISO,
} from "date-fns";
import { useCalendar } from "@/hooks/useCalendar";
import { useThemeStore, CalendarView } from "@/store/themeStore";
import { useUiStore } from "@/store/uiStore";
import { eventCoversDay } from "@/lib/events";
import { tint, readableText } from "@/lib/colors";
import AssignmentDots from "./AssignmentDots";
import type { CalendarEvent } from "@/lib/integrations/types";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function chipColors(color?: string) {
  // The raw calendar color stays as the tint; the text is a darkened
  // version of the same hue so light colors (yellow, sky blue) stay legible
  const hex = !color || color.startsWith("var(") ? "#ff6b57" : color;
  return {
    backgroundColor: tint(hex, 0.18),
    color: readableText(hex),
  };
}

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

function sortedEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((e) => eventCoversDay(e, day))
    .sort((a, b) => a.start.localeCompare(b.start));
}

/* ── Month view ─────────────────────────────────────────────────────── */

function MonthChip({ event }: { event: CalendarEvent }) {
  const { setAssignEvent } = useUiStore();
  return (
    <button
      onClick={() => setAssignEvent(event)}
      className="w-full px-1.5 py-0.5 rounded-md text-[10px] font-semibold leading-tight text-left
                 hidden md:landscape:flex lg:flex items-center gap-1 min-w-0"
      style={chipColors(event.color)}
      title={event.title}
    >
      <span className="truncate flex-1 min-w-0">{event.title}</span>
      <AssignmentDots event={event} size="xs" />
    </button>
  );
}

function MonthDayCell({
  day,
  isToday,
  isWeekend,
  events,
}: {
  day: number | null;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
}) {
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
            <MonthChip key={e.id} event={e} />
          ))}
          {extra > 0 && (
            <div className="text-[9px] font-semibold text-[var(--muted)] px-1.5 hidden md:landscape:block lg:block">
              +{extra} more
            </div>
          )}
          {/* Dots fallback for narrow layouts */}
          <div className="flex gap-0.5 flex-wrap justify-center md:landscape:hidden lg:hidden">
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

function MonthGrid({ viewDate, events }: { viewDate: Date; events: CalendarEvent[] }) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const cells = buildCells(year, month);
  const weekCount = cells.length / 7;

  return (
    <>
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

      <div
        className="grid grid-cols-7 flex-1 min-h-[300px] md:min-h-0 gap-0.5"
        style={{ gridTemplateRows: `repeat(${weekCount}, minmax(0, 1fr))` }}
      >
        {cells.map((day, i) => {
          const target = day !== null ? new Date(year, month, day) : null;
          const dayEvents = target ? sortedEventsForDay(events, target) : [];
          const isToday = target !== null && isSameDay(target, today);
          const dow = i % 7;

          return (
            <MonthDayCell
              key={i}
              day={day}
              isToday={isToday}
              isWeekend={dow === 0 || dow === 6}
              events={dayEvents}
            />
          );
        })}
      </div>
    </>
  );
}

/* ── Week view ──────────────────────────────────────────────────────── */

function WeekEventChip({ event }: { event: CalendarEvent }) {
  const { setAssignEvent } = useUiStore();
  return (
    <button
      onClick={() => setAssignEvent(event)}
      className="px-2 py-1 rounded-lg text-[11px] leading-tight text-left w-full"
      style={chipColors(event.color)}
      title={event.title}
    >
      <div className="font-bold truncate">
        {event.title} <AssignmentDots event={event} size="xs" />
      </div>
      {!event.allDay && (
        <div className="opacity-75 font-medium">
          {format(parseISO(event.start), "h:mm a")}
        </div>
      )}
    </button>
  );
}

function WeekGrid({ viewDate, events }: { viewDate: Date; events: CalendarEvent[] }) {
  const weekStart = startOfWeek(viewDate);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-7 gap-1.5 overflow-y-auto scrollbar-none">
      {days.map((day) => {
        const dayEvents = sortedEventsForDay(events, day);
        const isToday = isSameDay(day, today);

        return (
          <div
            key={day.toISOString()}
            className={[
              "flex md:flex-col gap-2 md:gap-1.5 rounded-xl p-2 min-w-0 md:min-h-0",
              isToday ? "bg-[var(--surface-2)]" : "",
            ].join(" ")}
          >
            {/* Day header — left column on phones, top on wider screens */}
            <div className="flex md:flex-col items-center gap-1 flex-none w-12 md:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--teal)]">
                {format(day, "EEE")}
              </span>
              <span
                className={[
                  "w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold leading-none",
                  isToday
                    ? "bg-[var(--accent)] text-white font-bold shadow-sm"
                    : "text-[var(--foreground)]",
                ].join(" ")}
              >
                {format(day, "d")}
              </span>
            </div>

            <div className="flex flex-col gap-1 flex-1 min-w-0 md:overflow-y-auto scrollbar-none">
              {dayEvents.length === 0 ? (
                <span className="text-[11px] text-[var(--muted)]/60 italic md:text-center py-1">
                  —
                </span>
              ) : (
                dayEvents.map((e) => <WeekEventChip key={e.id} event={e} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Card with view toggle + navigation ─────────────────────────────── */

export default function MonthCalendar() {
  const [viewDate, setViewDate] = useState(new Date());
  const { calendarView, setCalendarView } = useThemeStore();

  const range = useMemo(() => {
    if (calendarView === "week") {
      return {
        start: startOfWeek(viewDate).toISOString(),
        end: endOfWeek(viewDate).toISOString(),
      };
    }
    return {
      start: startOfMonth(viewDate).toISOString(),
      end: endOfMonth(viewDate).toISOString(),
    };
  }, [viewDate, calendarView]);

  const { events } = useCalendar(range);

  const today = new Date();
  const onCurrent =
    calendarView === "week"
      ? isSameWeek(viewDate, today)
      : isSameMonth(viewDate, today);

  const title =
    calendarView === "week"
      ? `${format(startOfWeek(viewDate), "MMM d")} – ${format(endOfWeek(viewDate), "MMM d")}`
      : format(viewDate, "MMMM yyyy");

  function step(dir: 1 | -1) {
    setViewDate((d) =>
      calendarView === "week"
        ? dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)
        : dir === 1 ? addMonths(d, 1) : subMonths(d, 1)
    );
  }

  return (
    <div className="sky-card p-3 sm:p-4 flex flex-col gap-3 flex-1 min-h-0">
      {/* Navigation + view toggle */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => step(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white transition text-xl font-light flex-shrink-0"
          aria-label={calendarView === "week" ? "Previous week" : "Previous month"}
        >
          ‹
        </button>

        <div className="flex items-center gap-2 flex-wrap justify-center min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[var(--foreground)] whitespace-nowrap">
            {title}
          </h2>
          {!onCurrent && (
            <button
              onClick={() => setViewDate(new Date())}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition"
            >
              Today
            </button>
          )}
          <div className="flex bg-[var(--surface-2)] rounded-full p-0.5">
            {(["month", "week"] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setCalendarView(v)}
                className={[
                  "px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition",
                  calendarView === v
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)]",
                ].join(" ")}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => step(1)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white transition text-xl font-light flex-shrink-0"
          aria-label={calendarView === "week" ? "Next week" : "Next month"}
        >
          ›
        </button>
      </div>

      {calendarView === "week" ? (
        <WeekGrid viewDate={viewDate} events={events} />
      ) : (
        <MonthGrid viewDate={viewDate} events={events} />
      )}
    </div>
  );
}
