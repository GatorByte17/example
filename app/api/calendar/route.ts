import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchGoogleEvents, isGoogleConnected } from "@/lib/integrations/google-calendar";
import { fetchICloudEvents, isICloudConfigured } from "@/lib/integrations/caldav";
import { CalendarEvent } from "@/lib/integrations/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const results: CalendarEvent[] = [];
  const errors: string[] = [];

  const [googleEvents, icloudEvents] = await Promise.allSettled([
    isGoogleConnected() ? fetchGoogleEvents() : Promise.resolve([]),
    isICloudConfigured() ? fetchICloudEvents() : Promise.resolve([]),
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
