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
    <div className="relative min-h-screen w-full md:h-screen md:overflow-hidden bg-[var(--background)]">
      <div className="min-h-screen md:min-h-0 md:h-full flex flex-col">
        <SkyHeader />

        {/* Naturally-sized scrolling column on phones; height-locked 3-column kiosk on md+ */}
        <div
          className="md:flex-1 md:min-h-0 grid gap-3 p-3 pt-0
                     grid-cols-1
                     md:landscape:grid-cols-[260px_1fr_260px]
                     lg:grid-cols-[280px_1fr_280px]"
        >
          {/* Left — Agenda (after calendar when stacked) */}
          <div className="order-2 md:landscape:order-1 lg:order-1 md:min-h-0">
            <AgendaPanel />
          </div>

          {/* Center — Calendar + countdown */}
          <div className="order-1 md:landscape:order-2 lg:order-2 flex flex-col gap-3 md:min-h-0">
            <MonthCalendar />
            <CountdownBanner />
          </div>

          {/* Right — Chores */}
          <div className="order-3 md:min-h-0">
            <TodoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
