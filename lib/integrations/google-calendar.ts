import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";
import { CalendarEvent } from "./types";
import { getSetting, setSetting } from "@/lib/db/queries/settings";
import { GOOGLE_EVENT_COLORS } from "@/lib/colors";

function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
  );
}

export function getGoogleAuthUrl(): string {
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
  });
}

export async function exchangeGoogleCode(code: string): Promise<void> {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);
  setSetting("google_calendar_tokens", JSON.stringify(tokens));
}

function toEvent(
  item: calendar_v3.Schema$Event,
  cal: calendar_v3.Schema$CalendarListEntry
): CalendarEvent {
  const now = new Date().toISOString();
  return {
    // Prefix with the calendar id — recurring-instance ids are only unique per calendar
    id: `${cal.id}:${item.id ?? crypto.randomUUID()}`,
    title: item.summary ?? "(No title)",
    start: item.start?.dateTime ?? item.start?.date ?? now,
    end: item.end?.dateTime ?? item.end?.date ?? now,
    allDay: !item.start?.dateTime,
    // Event-level color wins; otherwise use the calendar's own color
    color:
      (item.colorId ? GOOGLE_EVENT_COLORS[item.colorId] : undefined) ??
      cal.backgroundColor ??
      undefined,
    calendarName: cal.summary ?? "Google Calendar",
    source: "google",
  };
}

export async function fetchGoogleEvents(
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const tokenStr = getSetting("google_calendar_tokens");
  if (!tokenStr) return [];

  const client = getOAuth2Client();
  client.setCredentials(JSON.parse(tokenStr));

  // Auto-save refreshed tokens
  client.on("tokens", (tokens) => {
    const existing = JSON.parse(getSetting("google_calendar_tokens") ?? "{}");
    setSetting(
      "google_calendar_tokens",
      JSON.stringify({ ...existing, ...tokens })
    );
  });

  const calendar = google.calendar({ version: "v3", auth: client });

  // All calendars the user has visible in Google Calendar's sidebar
  const calList = await calendar.calendarList.list({ maxResults: 50 });
  const calendars = (calList.data.items ?? []).filter(
    (c) => c.id && c.selected !== false
  );

  const perCalendar = await Promise.allSettled(
    calendars.map(async (cal) => {
      const res = await calendar.events.list({
        calendarId: cal.id!,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 250,
      });
      return (res.data.items ?? []).map((item) => toEvent(item, cal));
    })
  );

  const events: CalendarEvent[] = [];
  for (const result of perCalendar) {
    if (result.status === "fulfilled") events.push(...result.value);
    else console.error("Google calendar fetch error:", result.reason);
  }
  return events;
}

export function isGoogleConnected(): boolean {
  return Boolean(getSetting("google_calendar_tokens"));
}
