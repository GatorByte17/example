import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchWeather } from "@/lib/integrations/weather";
import { resolveLocation } from "@/lib/location";
import { runMigrations } from "@/lib/db/schema";

function ensureDb() {
  try { runMigrations(); } catch { /* already initialized */ }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();

  const { latitude, longitude, locationName } = resolveLocation();

  try {
    const data = await fetchWeather(parseFloat(latitude), parseFloat(longitude), locationName);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Weather fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
