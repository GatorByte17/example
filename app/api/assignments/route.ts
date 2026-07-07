import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAssignments, setAssignments } from "@/lib/db/queries/assignments";
import { runMigrations } from "@/lib/db/schema";

function ensureDb() {
  try { runMigrations(); } catch { /* already initialized */ }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  return NextResponse.json(getAssignments());
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();

  const { eventKey, memberIds } = await req.json();
  if (!eventKey || typeof eventKey !== "string") {
    return NextResponse.json({ error: "eventKey required" }, { status: 400 });
  }
  if (!Array.isArray(memberIds) || memberIds.some((id) => !Number.isInteger(id))) {
    return NextResponse.json({ error: "memberIds must be an integer array" }, { status: 400 });
  }

  setAssignments(eventKey, memberIds);
  return NextResponse.json({ ok: true });
}
