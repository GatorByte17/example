"use client";

import { useClock } from "@/hooks/useClock";
import { formatDate, getGreeting } from "@/lib/utils";
import { WidgetProps } from "@/lib/widgets/registry";
import { cn } from "@/lib/utils";

export default function ClockWidget({ size }: WidgetProps) {
  const { time, hours12, minutes, seconds, ampm } = useClock();
  const greeting = getGreeting(time.getHours());
  const isCompact = size === "sm";

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 select-none">
      {!isCompact && (
        <p className="text-[var(--muted)] text-sm font-medium mb-1 tracking-wide">
          {greeting}
        </p>
      )}

      <div className="flex items-end gap-1 tabular-nums">
        <span
          className={cn(
            "font-bold text-[var(--foreground)] leading-none",
            size === "xl" ? "text-9xl" : size === "lg" ? "text-7xl" : size === "md" ? "text-6xl" : "text-4xl"
          )}
        >
          {pad(hours12)}:{pad(minutes)}
        </span>
        <div className="flex flex-col items-start mb-1 gap-0.5">
          <span className={cn(
            "text-[var(--accent)] font-semibold leading-none",
            size === "xl" ? "text-2xl" : "text-base"
          )}>
            {ampm}
          </span>
          {size !== "sm" && (
            <span className="text-[var(--muted)] text-sm leading-none font-mono">
              :{pad(seconds)}
            </span>
          )}
        </div>
      </div>

      {!isCompact && (
        <p className={cn(
          "text-[var(--muted)] mt-2 text-center",
          size === "xl" ? "text-lg" : "text-sm"
        )}>
          {formatDate(time)}
        </p>
      )}
    </div>
  );
}
