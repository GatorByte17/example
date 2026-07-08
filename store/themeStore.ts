"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CalendarView = "month" | "week";

export interface PanelVisibility {
  agenda: boolean;
  lists: boolean;
}

interface ThemeState {
  theme: "dark" | "light";
  accentColor: string;
  calendarView: CalendarView;
  panels: PanelVisibility;
  activeList: string; // list key shown in the Lists panel
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
  setCalendarView: (view: CalendarView) => void;
  setPanelVisible: (panel: keyof PanelVisibility, visible: boolean) => void;
  setActiveList: (key: string) => void;
}

const DEFAULTS = {
  theme: "light" as const,
  accentColor: "#ff6b57",
  calendarView: "month" as CalendarView,
  panels: { agenda: true, lists: true } as PanelVisibility,
  activeList: "chores",
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setAccentColor: (color) => set({ accentColor: color }),
      setCalendarView: (view) => set({ calendarView: view }),
      setPanelVisible: (panel, visible) =>
        set((s) => ({ panels: { ...s.panels, [panel]: visible } })),
      setActiveList: (key) => set({ activeList: key }),
    }),
    {
      name: "dashboard-theme",
      version: 1,
      // v0 persisted the old dark/indigo defaults; reset to the Skylight look
      migrate: () => DEFAULTS,
    }
  )
);
