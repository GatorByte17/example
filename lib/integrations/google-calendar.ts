import { google } from "googleapis";
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

export async function fetchGoogleEvents(
  daysAhead = 14
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
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 50,
  });

  return (res.data.items ?? []).map((item) => ({
    id: item.id ?? crypto.randomUUID(),
    title: item.summary ?? "(No title)",
    start: item.start?.dateTime ?? item.start?.date ?? now.toISOString(),
    end: item.end?.dateTime ?? item.end?.date ?? now.toISOString(),
    allDay: !item.start?.dateTime,
    color: item.colorId ? GOOGLE_EVENT_COLORS[item.colorId] : undefined,
    calendarName: "Google Calendar",
    source: "google",
  }));
}

export function isGoogleConnected(): boolean {
  return Boolean(getSetting("google_calendar_tokens"));
}
