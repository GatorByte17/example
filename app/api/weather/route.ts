import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchWeather } from "@/lib/integrations/weather";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? process.env.NEXT_PUBLIC_LATITUDE ?? "37.7749");
  const lon = parseFloat(searchParams.get("lon") ?? process.env.NEXT_PUBLIC_LONGITUDE ?? "-122.4194");
  const name = searchParams.get("name") ?? process.env.NEXT_PUBLIC_LOCATION_NAME ?? "Home";

  try {
    const data = await fetchWeather(lat, lon, name);
    return NextResponse.json(data);
  } catch (err) {
    console.error("Weather fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
