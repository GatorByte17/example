"use client";

import { format, parseISO, startOfDay, addDays, isSameDay } from "date-fns";
import { useCalendar } from "@/hooks/useCalendar";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import type { CalendarEvent } from "@/lib/integrations/types";

function timeLabel(event: CalendarEvent): string {
  if (event.allDay) return "All day";
  return format(parseISO(event.start), "h:mm a");
}

function EventRow({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-white/5 last:border-0">
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: event.color ?? "var(--accent)" }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{event.title}</p>
        <p className="text-xs text-white/50">{timeLabel(event)}</p>
        {event.calendarName && (
          <p className="text-[10px] text-white/30 truncate">{event.calendarName}</p>
        )}
      </div>
    </div>
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
        {label}
      </p>
      {events.length === 0 ? (
        <p className="text-sm text-white/30 italic py-1">No events</p>
      ) : (
        events.map((e) => <EventRow key={e.id} event={e} />)
      )}
    </div>
  );
}

export default function AgendaPanel() {
  const { events, isLoading } = useCalendar();

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const todayEvents = events
    .filter((e) => isSameDay(parseISO(e.start), today))
    .sort((a, b) => a.start.localeCompare(b.start));

  const tomorrowEvents = events
    .filter((e) => isSameDay(parseISO(e.start), tomorrow))
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="glass-card p-4 flex flex-col gap-4 overflow-y-auto scrollbar-none min-h-0">
      <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">
        Agenda
      </h2>

      {isLoading ? (
        <SkeletonLoader count={3} />
      ) : (
        <>
          <Section label="Today" events={todayEvents} />
          <Section label="Tomorrow" events={tomorrowEvents} />
        </>
      )}
    </div>
  );
}
