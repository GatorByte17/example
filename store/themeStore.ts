"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "dark" | "light";
  accentColor: string;
  toggleTheme: () => void;
  setAccentColor: (color: string) => void;
}

const DEFAULTS = {
  theme: "light" as const,
  accentColor: "#ff6b57",
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: "dashboard-theme",
      version: 1,
      // v0 persisted the old dark/indigo defaults; reset to the Skylight look
      migrate: () => DEFAULTS,
    }
  )
);
