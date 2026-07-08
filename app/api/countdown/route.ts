import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSetting, setSetting, deleteSetting } from "@/lib/db/queries/settings";
import { runMigrations } from "@/lib/db/schema";

function ensureDb() {
  try { runMigrations(); } catch { /* already initialized */ }
}

const KEY = "countdown_event";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const raw = getSetting(KEY);
  return NextResponse.json(raw ? JSON.parse(raw) : null);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();

  const { key, title, start, color, allDay } = await req.json();
  if (typeof key !== "string" || !key || typeof title !== "string" || !title) {
    return NextResponse.json({ error: "key and title required" }, { status: 400 });
  }
  if (typeof start !== "string" || isNaN(new Date(start).getTime())) {
    return NextResponse.json({ error: "start must be an ISO date" }, { status: 400 });
  }

  setSetting(KEY, JSON.stringify({ key, title, start, color: color ?? null, allDay: Boolean(allDay) }));
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  deleteSetting(KEY);
  return NextResponse.json({ ok: true });
}
