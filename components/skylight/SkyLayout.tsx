"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import SkyHeader from "./SkyHeader";
import AgendaPanel from "./AgendaPanel";
import MonthCalendar from "./MonthCalendar";
import CountdownBanner from "./CountdownBanner";
import TodoPanel from "./TodoPanel";

export default function SkyLayout() {
  const { accentColor } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.setProperty("--accent", accentColor);
    root.style.setProperty("--accent-hover", accentColor + "cc");
  }, [accentColor]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--background)]">
      <div className="h-full flex flex-col">
        <SkyHeader />

        {/* Main 3-column grid */}
        <div
          className="flex-1 min-h-0 grid gap-4 p-4 pt-0
                     grid-cols-1
                     lg:grid-cols-[280px_1fr_280px]
                     landscape:grid-cols-[280px_1fr_280px]"
        >
          {/* Left — Agenda (shows after calendar on portrait) */}
          <div className="order-2 lg:order-1 landscape:order-1 min-h-0">
            <AgendaPanel />
          </div>

          {/* Center — Month calendar + countdown */}
          <div className="order-1 lg:order-2 landscape:order-2 flex flex-col gap-4 min-h-0">
            <MonthCalendar />
            <CountdownBanner />
          </div>

          {/* Right — Chores */}
          <div className="order-3 min-h-0">
            <TodoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
