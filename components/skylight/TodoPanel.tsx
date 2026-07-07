"use client";

import { useState, FormEvent } from "react";
import { useTodos } from "@/hooks/useTodos";
import { useMembers } from "@/hooks/useMembers";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import type { Todo } from "@/lib/db/queries/todos";
import type { Member } from "@/lib/db/queries/members";

const MEMBER_COLORS = [
  "#6366f1","#f43f5e","#10b981","#f59e0b",
  "#0ea5e9","#8b5cf6","#f97316","#14b8a6",
];

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
  return (
    <div className="flex items-center gap-2.5 py-1.5 group">
      <button
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition"
        style={{ borderColor: memberColor ?? "rgba(255,255,255,0.3)" }}
        aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
      >
        {todo.done && (
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: memberColor ?? "rgba(255,255,255,0.5)" }}
          />
        )}
      </button>

      <span
        className={`flex-1 text-sm min-w-0 truncate transition ${
          todo.done ? "text-white/30 line-through" : "text-white/80"
        }`}
      >
        {todo.title}
      </span>

      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white/60 transition text-xs px-1"
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
      {member && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color }} />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            {member.name}
          </p>
        </div>
      )}
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
  const { todos, isLoading, addTodo, toggleTodo, deleteTodo } = useTodos("chores");
  const { members, addMember } = useMembers();
  const [newTitle, setNewTitle] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<number | "">("");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");

  async function handleAddTodo(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTodo(newTitle.trim(), undefined, selectedMemberId ? Number(selectedMemberId) : undefined);
    setNewTitle("");
  }

  async function handleAddMember(e: FormEvent) {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const color = MEMBER_COLORS[members.length % MEMBER_COLORS.length];
    await addMember(newMemberName.trim(), color);
    setNewMemberName("");
    setShowAddMember(false);
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

  return (
    <div className="glass-card p-4 flex flex-col gap-3 overflow-y-auto scrollbar-none min-h-0">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">Chores</h2>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="text-[10px] text-white/30 hover:text-white/60 transition"
          title="Add family member"
        >
          + Person
        </button>
      </div>

      {showAddMember && (
        <form onSubmit={handleAddMember} className="flex gap-1.5">
          <input
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Name"
            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="px-2 py-1 rounded-lg bg-[var(--accent)]/80 text-white text-xs"
          >
            Add
          </button>
        </form>
      )}

      {isLoading ? (
        <SkeletonLoader count={3} />
      ) : (
        <div className="flex flex-col gap-3">
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

          {todos.length === 0 && (
            <p className="text-sm text-white/30 italic">No chores added</p>
          )}
        </div>
      )}

      {/* Add chore form */}
      <form onSubmit={handleAddTodo} className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-white/10">
        {members.length > 0 && (
          <select
            value={selectedMemberId}
            onChange={(e) =>
              setSelectedMemberId(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
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
            placeholder="Add a chore…"
            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 min-w-0"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-[var(--accent)]/80 hover:bg-[var(--accent)] text-white text-sm transition"
          >
            +
          </button>
        </div>
      </form>
    </div>
  );
}
