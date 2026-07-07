"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import PhotoBackground from "./PhotoBackground";
import SkyHeader from "./SkyHeader";
import AgendaPanel from "./AgendaPanel";
import MonthCalendar from "./MonthCalendar";
import CountdownBanner from "./CountdownBanner";
import TodoPanel from "./TodoPanel";

export default function SkyLayout() {
  const { accentColor } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.style.setProperty("--accent", accentColor);
    root.style.setProperty("--accent-hover", accentColor + "cc");
  }, [accentColor]);

  return (
    <div className="sky-shell relative h-screen w-screen overflow-hidden">
      {/* Full-bleed photo slideshow background */}
      <PhotoBackground />

      {/* Content layer */}
      <div className="relative z-10 h-full flex flex-col">
        <SkyHeader />

        {/* Main 3-column grid */}
        <div
          className="flex-1 min-h-0 grid gap-3 p-3 pt-0
                     grid-cols-1
                     lg:grid-cols-[260px_1fr_260px]
                     landscape:grid-cols-[260px_1fr_260px]"
        >
          {/* Left — Agenda (reordered to show after calendar on portrait) */}
          <div className="order-2 lg:order-1 landscape:order-1 min-h-0">
            <AgendaPanel />
          </div>

          {/* Center — Month calendar + countdown */}
          <div className="order-1 lg:order-2 landscape:order-2 flex flex-col gap-3 min-h-0">
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
