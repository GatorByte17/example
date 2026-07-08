"use client";

import { useState, FormEvent } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useMembers } from "@/hooks/useMembers";
import { useLists } from "@/hooks/useLists";
import { useThemeStore } from "@/store/themeStore";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { MEMBER_COLORS } from "@/lib/colors";
import type { Todo } from "@/lib/db/queries/todos";
import type { Member } from "@/lib/db/queries/members";

function TodoItem({
  todo,
  onToggle,
  onDelete,
  memberColor,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  memberColor?: string;
}) {
  const color = memberColor ?? "var(--teal)";
  return (
    <div className="flex items-center gap-2.5 py-1.5 group">
      <button
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition"
        style={{
          borderColor: color,
          backgroundColor: todo.done ? color : "transparent",
        }}
        aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
      >
        {todo.done && <span className="text-white text-xs font-bold">✓</span>}
      </button>

      <span
        className={`flex-1 text-sm font-medium min-w-0 truncate transition ${
          todo.done
            ? "text-[var(--muted)] line-through"
            : "text-[var(--foreground)]"
        }`}
      >
        {todo.title}
      </span>

      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-[var(--accent)] transition text-xs px-1"
        aria-label="Delete chore"
      >
        ✕
      </button>
    </div>
  );
}

function MemberSection({
  member,
  todos,
  onToggle,
  onDelete,
}: {
  member: Member | null;
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  if (todos.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        {member ? (
          <>
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: member.color }}
            >
              {member.initials}
            </div>
            <p className="text-xs font-bold text-[var(--foreground)]">{member.name}</p>
          </>
        ) : (
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--teal)]">
            Everyone
          </p>
        )}
      </div>
      {todos.map((t) => (
        <TodoItem
          key={t.id}
          todo={t}
          onToggle={onToggle}
          onDelete={onDelete}
          memberColor={member?.color}
        />
      ))}
    </div>
  );
}

export default function TodoPanel() {
  const { lists, addList, deleteList } = useLists();
  const { activeList, setActiveList } = useThemeStore();
  // Fall back to Chores if the persisted active list was deleted
  const currentList =
    lists.find((l) => l.key === activeList) ?? lists.find((l) => l.key === "chores");
  const listKey = currentList?.key ?? "chores";
  const isChores = listKey === "chores";

  const { todos, isLoading, addTodo, toggleTodo, deleteTodo } = useTodos(listKey);
  const { members, addMember } = useMembers();
  const [newTitle, setNewTitle] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<number | "">("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [saveError, setSaveError] = useState("");

  async function handleAddList(e: FormEvent) {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const list = await addList(newListName.trim());
      setActiveList(list.key);
      setNewListName("");
      setShowAddList(false);
      setSaveError("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to create list");
    }
  }

  async function handleDeleteList() {
    if (!currentList || isChores) return;
    if (!window.confirm(`Delete the "${currentList.name}" list and its items?`)) return;
    try {
      await deleteList(currentList.id);
      setActiveList("chores");
      setSaveError("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to delete list");
    }
  }

  async function handleAddTodo(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await addTodo(
        newTitle.trim(),
        undefined,
        isChores && selectedMemberId ? Number(selectedMemberId) : undefined
      );
      setNewTitle("");
      setSaveError("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save chore");
    }
  }

  async function handleAddMember(e: FormEvent) {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    try {
      const color = MEMBER_COLORS[members.length % MEMBER_COLORS.length];
      await addMember(newMemberName.trim(), color);
      setNewMemberName("");
      setShowAddMember(false);
      setSaveError("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save member");
    }
  }

  // Group todos by member
  const byMember = new Map<number | null, Todo[]>();
  byMember.set(null, []);
  for (const m of members) byMember.set(m.id, []);
  for (const t of todos) {
    const mid = t.member_id ?? null;
    if (!byMember.has(mid)) byMember.set(mid, []);
    byMember.get(mid)!.push(t);
  }

  const inputClass =
    "bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40 transition";

  return (
    <div className="sky-card p-4 flex flex-col gap-3 overflow-y-auto scrollbar-none min-h-0 h-full">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold text-[var(--foreground)] truncate">
          {currentList?.name ?? "Lists"}
        </h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isChores && currentList && (
            <button
              onClick={handleDeleteList}
              className="text-[11px] font-semibold text-[var(--muted)] hover:text-red-500 transition"
              title="Delete this list"
            >
              Delete list
            </button>
          )}
          {isChores && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="text-[11px] font-semibold text-[var(--teal)] hover:text-[var(--accent)] transition"
              title="Add family member"
            >
              + Person
            </button>
          )}
        </div>
      </div>

      {/* List switcher */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-1 px-1">
        {lists.map((l) => (
          <button
            key={l.id}
            onClick={() => setActiveList(l.key)}
            className={[
              "px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition flex-shrink-0",
              l.key === listKey
                ? "bg-[var(--accent)] text-white shadow-sm"
                : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {l.name}
          </button>
        ))}
        <button
          onClick={() => setShowAddList(!showAddList)}
          className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--surface-2)] text-[var(--teal)] hover:bg-[var(--teal)] hover:text-white transition flex-shrink-0"
          title="New list"
        >
          +
        </button>
      </div>

      {showAddList && (
        <form onSubmit={handleAddList} className="flex gap-1.5">
          <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name (e.g. Groceries)"
            className={`flex-1 px-2.5 py-1.5 text-xs min-w-0 ${inputClass}`}
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[var(--teal)] text-white text-xs font-semibold hover:opacity-90 transition"
          >
            Add
          </button>
        </form>
      )}

      {showAddMember && isChores && (
        <form onSubmit={handleAddMember} className="flex gap-1.5">
          <input
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Name"
            className={`flex-1 px-2.5 py-1.5 text-xs min-w-0 ${inputClass}`}
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-[var(--teal)] text-white text-xs font-semibold hover:opacity-90 transition"
          >
            Add
          </button>
        </form>
      )}

      {isLoading ? (
        <SkeletonLoader count={3} />
      ) : (
        <div className="flex flex-col gap-3">
          {isChores ? (
            <>
              {/* Member sections */}
              {members.map((m) => (
                <MemberSection
                  key={m.id}
                  member={m}
                  todos={byMember.get(m.id) ?? []}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              ))}

              {/* General chores (no member) */}
              {(byMember.get(null) ?? []).length > 0 && (
                <MemberSection
                  member={null}
                  todos={byMember.get(null) ?? []}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                />
              )}
            </>
          ) : (
            /* Plain lists (shopping etc.) — flat items, no member grouping */
            <div>
              {todos.map((t) => (
                <TodoItem key={t.id} todo={t} onToggle={toggleTodo} onDelete={deleteTodo} />
              ))}
            </div>
          )}

          {todos.length === 0 && (
            <div className="flex flex-col items-center gap-1 py-4 text-center">
              <span className="text-3xl">{isChores ? "🎉" : "🛒"}</span>
              <p className="text-sm text-[var(--muted)] font-medium">
                {isChores ? "All done!" : "Nothing here yet"}
              </p>
            </div>
          )}
        </div>
      )}

      {saveError && (
        <p className="text-xs text-red-500 font-medium">
          {saveError} — check `docker compose logs` and that ./data is writable.
        </p>
      )}

      {/* Add chore form */}
      <form
        onSubmit={handleAddTodo}
        className="flex flex-col gap-1.5 mt-auto pt-3 border-t border-[var(--border)]"
      >
        {isChores && members.length > 0 && (
          <select
            value={selectedMemberId}
            onChange={(e) =>
              setSelectedMemberId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className={`px-2.5 py-1.5 text-xs ${inputClass}`}
          >
            <option value="">Everyone</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex gap-1.5">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={isChores ? "Add a chore…" : "Add an item…"}
            className={`flex-1 px-3 py-2 text-sm min-w-0 ${inputClass}`}
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold transition"
          >
            +
          </button>
        </div>
      </form>
    </div>
  );
}
