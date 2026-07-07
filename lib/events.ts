import { parseISO, addDays, isSameDay } from "date-fns";
import type { CalendarEvent } from "@/lib/integrations/types";

// True when the event overlaps the given calendar day (multi-day aware).
// All-day events use an exclusive end date (Google/iCal convention), which
// the half-open interval comparison handles naturally.
export function eventCoversDay(event: CalendarEvent, day: Date): boolean {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = addDays(dayStart, 1);
  const start = parseISO(event.start);
  const end = parseISO(event.end);

  if (start < dayEnd && end > dayStart) return true;
  // Zero-duration events (end === start) still show on their start day
  return isSameDay(start, dayStart);
}
