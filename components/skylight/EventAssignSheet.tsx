"use client";

import { format, parseISO } from "date-fns";
import { useUiStore } from "@/store/uiStore";
import { useMembers } from "@/hooks/useMembers";
import { useAssignments } from "@/hooks/useAssignments";

export default function EventAssignSheet() {
  const { assignEvent, setAssignEvent } = useUiStore();
  const { members } = useMembers();
  const { assignments, assign } = useAssignments();

  if (!assignEvent) return null;

  const key = assignEvent.seriesKey ?? assignEvent.id;
  const assigned = assignments[key] ?? [];

  async function toggle(memberId: number) {
    const next = assigned.includes(memberId)
      ? assigned.filter((id) => id !== memberId)
      : [...assigned, memberId];
    try {
      await assign(key, next);
    } catch {
      /* the hook revalidates; dots revert on failure */
    }
  }

  const when = assignEvent.allDay
    ? format(parseISO(assignEvent.start), "EEEE, MMM d")
    : format(parseISO(assignEvent.start), "EEE, MMM d · h:mm a");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      onClick={() => setAssignEvent(null)}
    >
      <div
        className="sky-card w-full max-w-sm p-5 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: assignEvent.color ?? "var(--accent)" }}
            />
            <h2 className="text-base font-bold text-[var(--foreground)] truncate">
              {assignEvent.title}
            </h2>
          </div>
          <p className="text-xs text-[var(--muted)] mt-1">
            {when}
            {assignEvent.calendarName ? ` · ${assignEvent.calendarName}` : ""}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--teal)] mb-2">
            Who&apos;s this for?
          </p>
          {members.length === 0 ? (
            <p className="text-sm text-[var(--muted)] italic">
              Add family members in Settings first.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {members.map((m) => {
                const on = assigned.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    className={[
                      "flex items-center gap-3 px-3 py-2 rounded-xl transition text-left",
                      on ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]/60",
                    ].join(" ")}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: m.color }}
                    >
                      {m.initials}
                    </div>
                    <span className="flex-1 text-sm font-medium text-[var(--foreground)]">
                      {m.name}
                    </span>
                    <span
                      className={[
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition",
                        on
                          ? "text-white border-transparent"
                          : "border-[var(--border)] text-transparent",
                      ].join(" ")}
                      style={on ? { backgroundColor: m.color } : undefined}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[10px] text-[var(--muted)]">
          Recurring events are assigned for the whole series. Stored only on
          this dashboard — Google is never modified.
        </p>

        <button
          onClick={() => setAssignEvent(null)}
          className="self-end px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-bold transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}
