import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTodos, addTodo, toggleTodo, deleteTodo, deleteCompleted } from "@/lib/db/queries/todos";
import { runMigrations } from "@/lib/db/schema";

function ensureDb() {
  try { runMigrations(); } catch { /* already initialized */ }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { searchParams } = new URL(req.url);
  const list = searchParams.get("list") ?? "default";
  return NextResponse.json(getTodos(list));
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { title, list, dueDate, memberId } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });
  const todo = addTodo(title.trim(), list ?? "default", dueDate, memberId);
  return NextResponse.json(todo, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { id } = await req.json();
  toggleTodo(Number(id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { searchParams } = new URL(req.url);
  if (searchParams.get("completed") === "1") {
    const removed = deleteCompleted(searchParams.get("list") ?? "default");
    return NextResponse.json({ ok: true, removed });
  }
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteTodo(Number(id));
  return NextResponse.json({ ok: true });
}
