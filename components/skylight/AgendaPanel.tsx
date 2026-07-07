"use client";

import { format, parseISO, startOfDay, addDays } from "date-fns";
import { useCalendar } from "@/hooks/useCalendar";
import { eventCoversDay } from "@/lib/events";
import { useUiStore } from "@/store/uiStore";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import AssignmentDots from "./AssignmentDots";
import type { CalendarEvent } from "@/lib/integrations/types";

function timeLabel(event: CalendarEvent): string {
  if (event.allDay) return "All day";
  return format(parseISO(event.start), "h:mm a");
}

function EventRow({ event }: { event: CalendarEvent }) {
  const { setAssignEvent } = useUiStore();
  return (
    <button
      onClick={() => setAssignEvent(event)}
      className="w-full text-left flex items-start gap-2.5 py-2 border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]/50 rounded-lg px-1 -mx-1 transition"
    >
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: event.color ?? "var(--accent)" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--foreground)] truncate">
          {event.title} <AssignmentDots event={event} />
        </p>
        <span className="inline-block text-[11px] font-medium text-[var(--muted)] bg-[var(--surface-2)] rounded-full px-2 py-0.5 mt-1">
          {timeLabel(event)}
        </span>
        {event.calendarName && (
          <p className="text-[10px] text-[var(--muted)]/70 truncate mt-0.5">
            {event.calendarName}
          </p>
        )}
      </div>
    </button>
  );
}

function Section({
  label,
  events,
}: {
  label: string;
  events: CalendarEvent[];
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--teal)] mb-2">
        {label}
      </p>
      {events.length === 0 ? (
        <p className="text-sm text-[var(--muted)] italic py-1">No events</p>
      ) : (
        events.map((e) => <EventRow key={e.id} event={e} />)
      )}
    </div>
  );
}

export default function AgendaPanel() {
  const { events, connected, isLoading } = useCalendar();

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const todayEvents = events
    .filter((e) => eventCoversDay(e, today))
    .sort((a, b) => a.start.localeCompare(b.start));

  const tomorrowEvents = events
    .filter((e) => eventCoversDay(e, tomorrow))
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="sky-card p-4 flex flex-col gap-4 overflow-y-auto scrollbar-none min-h-0 h-full">
      <h2 className="text-base font-bold text-[var(--foreground)]">Agenda</h2>

      {isLoading ? (
        <SkeletonLoader count={3} />
      ) : (
        <>
          <Section label="Today" events={todayEvents} />
          <Section label="Tomorrow" events={tomorrowEvents} />
        </>
      )}

      {connected && !connected.google && (
        <a
          href="/api/calendar/google/connect"
          className="mt-auto flex items-center justify-center gap-2 text-xs font-semibold text-[var(--teal)] hover:text-white hover:bg-[var(--teal)] border border-[var(--teal)]/40 rounded-full px-3 py-2 transition"
        >
          Connect Google Calendar
        </a>
      )}
    </div>
  );
}
