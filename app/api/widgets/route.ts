import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLayouts, saveLayouts } from "@/lib/db/queries/widgets";
import { runMigrations } from "@/lib/db/schema";
import type { LayoutItem } from "react-grid-layout";

function ensureDb() {
  try { runMigrations(); } catch { /* already initialized */ }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  return NextResponse.json(getLayouts());
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const layouts = await req.json() as Record<string, LayoutItem[]>;
  saveLayouts(layouts);
  return NextResponse.json({ ok: true });
}
