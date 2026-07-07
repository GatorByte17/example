"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CalendarView = "month" | "week";

interface ThemeState {
  theme: "dark" | "light";
  accentColor: string;
  calendarView: CalendarView;
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
  setCalendarView: (view: CalendarView) => void;
}

const DEFAULTS = {
  theme: "light" as const,
  accentColor: "#ff6b57",
  calendarView: "month" as CalendarView,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setAccentColor: (color) => set({ accentColor: color }),
      setCalendarView: (view) => set({ calendarView: view }),
    }),
    {
      name: "dashboard-theme",
      version: 1,
      // v0 persisted the old dark/indigo defaults; reset to the Skylight look
      migrate: () => DEFAULTS,
    }
  )
);
