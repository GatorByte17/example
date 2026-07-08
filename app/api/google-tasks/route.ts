import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  isGoogleTasksConnected,
  fetchTaskLists,
  fetchTasks,
  addTask,
  setTaskDone,
  deleteTask,
} from "@/lib/integrations/google-tasks";
import { runMigrations } from "@/lib/db/schema";

function ensureDb() {
  try { runMigrations(); } catch { /* already initialized */ }
}

function errorResponse(err: unknown) {
  console.error("Google Tasks error:", err);
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Google Tasks request failed" },
    { status: 502 }
  );
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();

  const connected = isGoogleTasksConnected();
  const { searchParams } = new URL(req.url);
  const listId = searchParams.get("list");

  try {
    if (listId) {
      if (!connected) return NextResponse.json({ tasks: [] });
      return NextResponse.json({ tasks: await fetchTasks(listId) });
    }
    return NextResponse.json({
      connected,
      lists: connected ? await fetchTaskLists() : [],
    });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { listId, title } = await req.json();
  if (!listId || !title?.trim()) {
    return NextResponse.json({ error: "listId and title required" }, { status: 400 });
  }
  try {
    await addTask(listId, title.trim());
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { listId, taskId, done } = await req.json();
  if (!listId || !taskId) {
    return NextResponse.json({ error: "listId and taskId required" }, { status: 400 });
  }
  try {
    await setTaskDone(listId, taskId, Boolean(done));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ensureDb();
  const { searchParams } = new URL(req.url);
  const listId = searchParams.get("listId");
  const taskId = searchParams.get("taskId");
  if (!listId || !taskId) {
    return NextResponse.json({ error: "listId and taskId required" }, { status: 400 });
  }
  try {
    await deleteTask(listId, taskId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
