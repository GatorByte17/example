"use client";

import { useState, useRef, useEffect } from "react";
import { useTodos } from "@/hooks/useTodos";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { WidgetProps } from "@/lib/widgets/registry";
import { cn } from "@/lib/utils";

export default function TodoWidget({ size }: WidgetProps) {
  const { todos, isLoading, addTodo, toggleTodo, deleteTodo } = useTodos();
  const [inputValue, setInputValue] = useState("");
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const compact = size === "sm";

  useEffect(() => {
    if (showInput) inputRef.current?.focus();
  }, [showInput]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;
    setInputValue("");
    setShowInput(false);
    await addTodo(val);
  }

  if (isLoading) return <SkeletonLoader count={3} />;

  const pending = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="h-full flex flex-col p-3 gap-2 overflow-hidden">
      {!compact && (
        <div className="flex items-center justify-between flex-none">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            To-do
            {pending.length > 0 && (
              <span className="ml-2 text-xs text-[var(--muted)] font-normal">
                {pending.length} left
              </span>
            )}
          </h3>
          <button
            onClick={() => setShowInput((v) => !v)}
            className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-lg leading-none hover:bg-[var(--accent-hover)] transition"
            aria-label="Add task"
          >
            +
          </button>
        </div>
      )}

      {showInput && (
        <form onSubmit={handleAdd} className="flex-none">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="New task…"
            onBlur={() => { if (!inputValue.trim()) setShowInput(false); }}
            className="w-full px-3 py-2 text-sm rounded-xl bg-[var(--surface-2)] text-[var(--foreground)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] placeholder:text-[var(--muted)]"
          />
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-1 scrollbar-none">
        {todos.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center py-4">
            <span className="text-3xl">✅</span>
            <p className="text-xs text-[var(--muted)]">All done!</p>
          </div>
        )}

        {pending.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2 group rounded-xl p-2 hover:bg-white/5 transition"
          >
            <button
              onClick={() => toggleTodo(todo.id)}
              className={cn(
                "w-5 h-5 rounded-full border-2 flex-shrink-0 transition flex items-center justify-center",
                "border-[var(--accent)] hover:bg-[var(--accent)]/20"
              )}
              aria-label="Complete"
            />
            <span className={cn(
              "flex-1 text-[var(--foreground)] truncate",
              compact ? "text-xs" : "text-sm"
            )}>
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-red-400 transition text-xs px-1"
              aria-label="Delete"
            >
              ✕
            </button>
          </div>
        ))}

        {done.length > 0 && !compact && (
          <div className="pt-2">
            <div className="h-px bg-white/10 mb-2" />
            {done.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-2 group rounded-xl p-2 hover:bg-white/5 transition opacity-50"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className="w-5 h-5 rounded-full bg-[var(--accent)]/30 border-2 border-[var(--accent)]/50 flex-shrink-0 flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-[var(--accent)]" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="flex-1 text-sm text-[var(--muted)] line-through truncate">
                  {todo.title}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 text-[var(--muted)] hover:text-red-400 transition text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {compact && (
        <button
          onClick={() => setShowInput(true)}
          className="w-full text-xs text-[var(--accent)] text-center py-1 hover:opacity-80 transition"
        >
          + Add
        </button>
      )}
    </div>
  );
}
