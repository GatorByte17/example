import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchGoogleEvents, isGoogleConnected } from "@/lib/integrations/google-calendar";
import { fetchICloudEvents, isICloudConfigured } from "@/lib/integrations/caldav";
import { CalendarEvent } from "@/lib/integrations/types";

const MAX_RANGE_DAYS = 120;

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  // Default: start of today through 45 days out (agenda + countdown needs)
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultEnd.getDate() + 45);

  let start = searchParams.get("start") ? new Date(searchParams.get("start")!) : defaultStart;
  let end = searchParams.get("end") ? new Date(searchParams.get("end")!) : defaultEnd;

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    start = defaultStart;
    end = defaultEnd;
  }
  // Cap the window so a bad param can't request years of data
  if (end.getTime() - start.getTime() > MAX_RANGE_DAYS * 86_400_000) {
    end = new Date(start.getTime() + MAX_RANGE_DAYS * 86_400_000);
  }

  const results: CalendarEvent[] = [];
  const errors: string[] = [];

  const [googleEvents, icloudEvents] = await Promise.allSettled([
    isGoogleConnected() ? fetchGoogleEvents(start, end) : Promise.resolve([]),
    isICloudConfigured() ? fetchICloudEvents(start, end) : Promise.resolve([]),
  ]);

  if (googleEvents.status === "fulfilled") results.push(...googleEvents.value);
  else errors.push("Google Calendar: " + googleEvents.reason?.message);

  if (icloudEvents.status === "fulfilled") results.push(...icloudEvents.value);
  else errors.push("iCloud: " + icloudEvents.reason?.message);

  results.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return NextResponse.json({
    events: results,
    connected: {
      google: isGoogleConnected(),
      icloud: isICloudConfigured(),
    },
    errors,
  });
}
