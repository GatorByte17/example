import { CalendarEvent } from "./types";

// Lightweight CalDAV fetcher using tsdav
export async function fetchICloudEvents(
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const email = process.env.ICLOUD_EMAIL;
  const appPassword = process.env.ICLOUD_APP_PASSWORD;

  if (!email || !appPassword) return [];

  try {
    // Dynamic import to avoid SSR issues with tsdav
    const { DAVClient } = await import("tsdav");

    const client = new DAVClient({
      serverUrl: "https://caldav.icloud.com",
      credentials: { username: email, password: appPassword },
      authMethod: "Basic",
      defaultAccountType: "caldav",
    });

    await client.login();

    const calendars = await client.fetchCalendars();
    const events: CalendarEvent[] = [];

    for (const cal of calendars) {
      const objects = await client.fetchCalendarObjects({
        calendar: cal,
        timeRange: { start: timeMin.toISOString(), end: timeMax.toISOString() },
      });

      for (const obj of objects) {
        if (!obj.data) continue;
        const calName = (cal.displayName as string | undefined) ?? "iCloud";
        const parsed = parseICalEvent(obj.data as string, calName);
        if (parsed) events.push(parsed);
      }
    }

    return events.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  } catch (err) {
    console.error("iCloud CalDAV error:", err);
    return [];
  }
}

function parseICalEvent(
  icalData: string,
  calendarName: string
): CalendarEvent | null {
  // Simple iCal VEVENT parser for DTSTART, DTEND, SUMMARY, UID
  const lines = icalData.split(/\r?\n/);
  const event: Partial<CalendarEvent> = { source: "icloud", calendarName };

  let inEvent = false;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") { inEvent = true; continue; }
    if (line === "END:VEVENT") break;
    if (!inEvent) continue;

    const [rawKey, ...rest] = line.split(":");
    const value = rest.join(":").trim();
    const key = rawKey.split(";")[0];

    if (key === "UID") event.id = value;
    else if (key === "SUMMARY") event.title = value;
    else if (key === "DTSTART") {
      event.start = parseICalDate(value);
      event.allDay = !value.includes("T");
    } else if (key === "DTEND") {
      event.end = parseICalDate(value);
    }
  }

  if (!event.start || !event.title) return null;
  const id = event.id ?? crypto.randomUUID();
  return {
    id,
    // iCal UIDs are stable across recurring instances already
    seriesKey: id,
    title: event.title,
    start: event.start,
    end: event.end ?? event.start,
    allDay: event.allDay ?? false,
    source: "icloud",
    calendarName,
  };
}

function parseICalDate(val: string): string {
  // YYYYMMDDTHHMMSSZ or YYYYMMDD
  if (val.length === 8) {
    return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`;
  }
  const d = val.replace(
    /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)/,
    "$1-$2-$3T$4:$5:$6$7"
  );
  return d;
}

export function isICloudConfigured(): boolean {
  return Boolean(process.env.ICLOUD_EMAIL && process.env.ICLOUD_APP_PASSWORD);
}
