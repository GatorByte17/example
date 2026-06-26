"use client";

import { useCalendar } from "@/hooks/useCalendar";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { WidgetProps } from "@/lib/widgets/registry";
import { CalendarEvent } from "@/lib/integrations/types";
import { cn } from "@/lib/utils";
import { format, isToday, isTomorrow, isThisWeek, parseISO, startOfDay } from "date-fns";

function getDateLabel(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isThisWeek(date)) return format(date, "EEEE");
  return format(date, "MMM d");
}

function getTimeLabel(event: CalendarEvent): string {
  if (event.allDay) return "All day";
  return format(parseISO(event.start), "h:mm a");
}

function groupByDay(events: CalendarEvent[]): [string, CalendarEvent[]][] {
  const groups = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const day = startOfDay(parseISO(e.start)).toISOString();
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(e);
  }
  return Array.from(groups.entries()).slice(0, 5);
}

// Mini month calendar
function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="select-none">
      <div className="text-xs font-semibold text-[var(--foreground)] mb-2">
        {format(now, "MMMM yyyy")}
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-[9px] text-[var(--muted)] py-0.5">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div
            key={i}
            className={cn(
              "text-xs py-1 rounded-full leading-none w-6 h-6 flex items-center justify-center mx-auto",
              day === today
                ? "bg-[var(--accent)] text-white font-bold"
                : day
                ? "text-[var(--foreground)] hover:bg-white/10"
                : ""
            )}
          >
            {day ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <div
        className="w-1 h-full min-h-[20px] rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: event.color ?? "var(--accent)" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--foreground)] truncate">{event.title}</p>
        <p className="text-xs text-[var(--muted)]">{getTimeLabel(event)}</p>
      </div>
    </div>
  );
}

export default function CalendarWidget({ size }: WidgetProps) {
  const { events, connected, isLoading, errors } = useCalendar();
  const isCompact = size === "sm";
  const showMiniCal = size === "xl" || size === "lg";
  const maxEvents = size === "xl" ? 10 : size === "lg" ? 7 : size === "md" ? 5 : 3;

  if (isLoading) return <SkeletonLoader count={4} />;

  const noCalendars = connected && !connected.google && !connected.icloud;

  return (
    <div className="h-full flex flex-col p-4 gap-3 overflow-hidden">
      {!isCompact && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Calendar</h3>
          <div className="flex gap-1">
            {connected?.google && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
                Google
              </span>
            )}
            {connected?.icloud && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-[var(--muted)]">
                iCloud
              </span>
            )}
          </div>
        </div>
      )}

      {showMiniCal && (
        <>
          <MiniCalendar />
          <div className="h-px bg-white/10" />
        </>
      )}

      {noCalendars ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
          <span className="text-3xl">📅</span>
          <p className="text-xs text-[var(--muted)]">Connect a calendar in .env.local</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <span className="text-3xl">🎉</span>
          <p className="text-xs text-[var(--muted)]">No upcoming events</p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden flex flex-col gap-1">
          {groupByDay(events.slice(0, maxEvents)).map(([dayIso, dayEvents]) => (
            <div key={dayIso}>
              <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1">
                {getDateLabel(dayIso)}
              </p>
              {dayEvents.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <p className="text-[9px] text-red-400/70 truncate">{errors[0]}</p>
      )}
    </div>
  );
}
