"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/themeStore";
import { useWidgetStore } from "@/store/widgetStore";
import WidgetGrid from "./WidgetGrid";

export default function Dashboard() {
  const { theme, accentColor } = useThemeStore();
  const { editMode, setEditMode } = useWidgetStore();

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    root.style.setProperty("--accent", accentColor);
    root.style.setProperty("--accent-hover", accentColor + "cc");
  }, [theme, accentColor]);

  return (
    <div className="dashboard-shell h-screen w-screen overflow-hidden flex flex-col">
      {/* Top bar — minimal, mostly hidden */}
      <header className="flex-none flex items-center justify-end gap-3 px-4 py-2 z-10">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`text-xs px-3 py-1.5 rounded-full border transition ${
            editMode
              ? "bg-[var(--accent)] text-white border-transparent"
              : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {editMode ? "Done" : "Edit"}
        </button>
      </header>

      {/* Widget grid fills the remaining space */}
      <main className="flex-1 min-h-0">
        <WidgetGrid />
      </main>
    </div>
  );
}
