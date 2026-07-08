import { google } from "googleapis";
import { getAuthorizedClient, grantedScopes } from "./google-auth";

export interface GTaskList {
  id: string;
  title: string;
}

export interface GTask {
  id: string;
  title: string;
  done: boolean;
}

export function isGoogleTasksConnected(): boolean {
  return grantedScopes().includes("auth/tasks");
}

function tasksApi() {
  const client = getAuthorizedClient();
  if (!client) return null;
  return google.tasks({ version: "v1", auth: client });
}

export async function fetchTaskLists(): Promise<GTaskList[]> {
  const api = tasksApi();
  if (!api) return [];
  const res = await api.tasklists.list({ maxResults: 25 });
  return (res.data.items ?? [])
    .filter((l) => l.id)
    .map((l) => ({ id: l.id!, title: l.title ?? "Tasks" }));
}

export async function fetchTasks(listId: string): Promise<GTask[]> {
  const api = tasksApi();
  if (!api) return [];
  const res = await api.tasks.list({
    tasklist: listId,
    showCompleted: true,
    showHidden: true,
    maxResults: 100,
  });
  return (res.data.items ?? [])
    .filter((t) => t.id)
    .sort((a, b) => {
      // Open items in Google's order, completed at the bottom
      const aDone = a.status === "completed" ? 1 : 0;
      const bDone = b.status === "completed" ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return (a.position ?? "").localeCompare(b.position ?? "");
    })
    .map((t) => ({
      id: t.id!,
      title: t.title ?? "",
      done: t.status === "completed",
    }));
}

export async function addTask(listId: string, title: string): Promise<void> {
  const api = tasksApi();
  if (!api) throw new Error("Google not connected");
  await api.tasks.insert({ tasklist: listId, requestBody: { title } });
}

export async function setTaskDone(listId: string, taskId: string, done: boolean): Promise<void> {
  const api = tasksApi();
  if (!api) throw new Error("Google not connected");
  await api.tasks.patch({
    tasklist: listId,
    task: taskId,
    requestBody: { status: done ? "completed" : "needsAction" },
  });
}

export async function deleteTask(listId: string, taskId: string): Promise<void> {
  const api = tasksApi();
  if (!api) throw new Error("Google not connected");
  await api.tasks.delete({ tasklist: listId, task: taskId });
}
