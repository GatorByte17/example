import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchHAStates, callHAService } from "@/lib/integrations/home-assistant";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const entityIds = searchParams.get("entities")?.split(",").filter(Boolean);

  try {
    const states = await fetchHAStates(entityIds);
    return NextResponse.json(states);
  } catch (err) {
    console.error("HA fetch error:", err);
    return NextResponse.json({ error: "Failed to reach Home Assistant" }, { status: 502 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { domain, service, data } = await req.json();
    await callHAService(domain, service, data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("HA service call error:", err);
    return NextResponse.json({ error: "Service call failed" }, { status: 500 });
  }
}
