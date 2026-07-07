import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMembers, addMember, updateMember, deleteMember } from "@/lib/db/queries/members";
import { runMigrations } from "@/lib/db/schema";

function ensureDb() {
  try { runMigrations(); } catch { /* already initialized */ }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  return NextResponse.json(getMembers());
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { name, color } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const member = addMember(name.trim(), color ?? "#6366f1");
  return NextResponse.json(member, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { id, name, color } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  updateMember(Number(id), name, color);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteMember(Number(id));
  return NextResponse.json({ ok: true });
}
