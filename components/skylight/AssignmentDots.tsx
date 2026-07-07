"use client";

import { useMembers } from "@/hooks/useMembers";
import { useAssignments } from "@/hooks/useAssignments";
import type { CalendarEvent } from "@/lib/integrations/types";

// Mini member avatars shown on an event; renders nothing when unassigned
export default function AssignmentDots({
  event,
  size = "sm",
}: {
  event: CalendarEvent;
  size?: "xs" | "sm";
}) {
  const { members } = useMembers();
  const { assignments } = useAssignments();

  const ids = assignments[event.seriesKey ?? event.id] ?? [];
  if (ids.length === 0) return null;

  const assigned = members.filter((m) => ids.includes(m.id));
  const cls =
    size === "xs" ? "w-3 h-3 text-[6px]" : "w-[18px] h-[18px] text-[8px]";

  return (
    <span className="inline-flex -space-x-1 align-middle flex-shrink-0">
      {assigned.map((m) => (
        <span
          key={m.id}
          className={`${cls} rounded-full flex items-center justify-center font-bold text-white ring-1 ring-[var(--surface)]`}
          style={{ backgroundColor: m.color }}
          title={m.name}
        >
          {m.initials[0]}
        </span>
      ))}
    </span>
  );
}
