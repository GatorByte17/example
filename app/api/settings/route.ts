import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { setSetting } from "@/lib/db/queries/settings";
import { resolveLocation } from "@/lib/location";
import { runMigrations } from "@/lib/db/schema";

function ensureDb() {
  try { runMigrations(); } catch { /* already initialized */ }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  return NextResponse.json(resolveLocation());
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();

  const { latitude, longitude, locationName } = await req.json();

  if (latitude !== undefined) {
    const lat = Number(latitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return NextResponse.json({ error: "Invalid latitude" }, { status: 400 });
    }
    setSetting("weather_lat", String(lat));
  }
  if (longitude !== undefined) {
    const lon = Number(longitude);
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      return NextResponse.json({ error: "Invalid longitude" }, { status: 400 });
    }
    setSetting("weather_lon", String(lon));
  }
  if (locationName !== undefined) {
    if (!String(locationName).trim()) {
      return NextResponse.json({ error: "Location name required" }, { status: 400 });
    }
    setSetting("weather_name", String(locationName).trim());
  }

  return NextResponse.json(resolveLocation());
}
