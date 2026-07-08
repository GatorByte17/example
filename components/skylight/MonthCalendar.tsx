"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import { HOUR_HEIGHT, layoutDayEvents, allDayEventsFor } from "@/lib/week-layout";
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

// Current-time line, isolated so only it re-renders each minute
function NowLine() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const top = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT;

  return (
    <div className="absolute left-0 right-0 z-10 pointer-events-none" style={{ top }}>
      <div className="h-[2px] bg-[var(--accent)]" />
      <div className="w-2 h-2 rounded-full bg-[var(--accent)] -mt-[5px] -ml-0.5" />
    </div>
  );
}

// Hour-by-hour timeline: iPad landscape / desktop widths
function WeekTimeline({ days, events }: { days: Date[]; events: CalendarEvent[] }) {
  const { setAssignEvent } = useUiStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = new Date();
  const hours = Array.from({ length: 24 }, (_, h) => h);

  // Open on the morning, not midnight
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 7 * HOUR_HEIGHT });
  }, []);

  const cols = "grid grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-x-1";

  return (
    <div className="flex-1 min-h-0 hidden md:flex flex-col">
      {/* Day headers + all-day chips */}
      <div className={`${cols} flex-none pb-1`}>
        <div />
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const allDay = allDayEventsFor(events, day);
          return (
            <div key={day.toISOString()} className="flex flex-col items-stretch gap-1 min-w-0">
              <div className="flex items-center justify-center gap-1.5">
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
              {allDay.slice(0, 2).map((e) => (
                <button
                  key={e.id}
                  onClick={() => setAssignEvent(e)}
                  className="px-1.5 py-0.5 rounded-md text-[9px] font-bold truncate text-left"
                  style={chipColors(e.color)}
                  title={e.title}
                >
                  {e.title}
                </button>
              ))}
              {allDay.length > 2 && (
                <span className="text-[9px] font-semibold text-[var(--muted)] px-1.5">
                  +{allDay.length - 2} more
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrollable hour grid */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-none rounded-xl">
        <div className={cols} style={{ height: 24 * HOUR_HEIGHT }}>
          {/* Time gutter */}
          <div className="relative">
            {hours.map((h) => (
              <span
                key={h}
                className="absolute right-1.5 text-[9px] font-semibold text-[var(--muted)] -translate-y-1/2"
                style={{ top: h * HOUR_HEIGHT }}
              >
                {h === 0 ? "" : format(new Date(2000, 0, 1, h), "h a")}
              </span>
            ))}
          </div>

          {days.map((day) => {
            const isToday = isSameDay(day, today);
            const positioned = layoutDayEvents(events, day);
            return (
              <div
                key={day.toISOString()}
                className={[
                  "relative min-w-0",
                  isToday ? "bg-[var(--surface-2)]/50 rounded-lg" : "",
                ].join(" ")}
              >
                {hours.map((h) => (
                  <div
                    key={h}
                    className="absolute left-0 right-0 border-t border-[var(--border)]"
                    style={{ top: h * HOUR_HEIGHT }}
                  />
                ))}
                {isToday && <NowLine />}
                {positioned.map((p) => (
                  <button
                    key={p.event.id}
                    onClick={() => setAssignEvent(p.event)}
                    className="absolute rounded-lg px-1.5 py-1 text-left overflow-hidden border border-white/40"
                    style={{
                      top: p.top,
                      height: Math.max(p.height - 2, 22),
                      left: `${p.leftPct}%`,
                      width: `calc(${p.widthPct}% - 2px)`,
                      ...chipColors(p.event.color),
                    }}
                    title={p.event.title}
                  >
                    <div className="text-[10px] font-bold truncate leading-tight">
                      {p.event.title} <AssignmentDots event={p.event} size="xs" />
                    </div>
                    {p.height >= 34 && (
                      <div className="text-[9px] font-medium opacity-75 truncate">
                        {format(parseISO(p.event.start), "h:mm a")}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekGrid({ viewDate, events }: { viewDate: Date; events: CalendarEvent[] }) {
  const weekStart = startOfWeek(viewDate);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <>
      {/* Phones: simple day list (an hour grid doesn't fit) */}
      <div className="flex-1 min-h-0 flex flex-col gap-1.5 overflow-y-auto scrollbar-none md:hidden">
        {days.map((day) => {
          const dayEvents = sortedEventsForDay(events, day);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              className={[
                "flex gap-2 rounded-xl p-2 min-w-0",
                isToday ? "bg-[var(--surface-2)]" : "",
              ].join(" ")}
            >
              <div className="flex items-center gap-1 flex-none w-12">
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

              <div className="flex flex-col gap-1 flex-1 min-w-0">
                {dayEvents.length === 0 ? (
                  <span className="text-[11px] text-[var(--muted)]/60 italic py-1">—</span>
                ) : (
                  dayEvents.map((e) => <WeekEventChip key={e.id} event={e} />)
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* iPad/desktop: hour-by-hour timeline */}
      <WeekTimeline days={days} events={events} />
    </>
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
