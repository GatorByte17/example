"use client";

import { create } from "zustand";
import type { LayoutItem } from "react-grid-layout";

export type BreakpointKey = "tv" | "desktop" | "landscape" | "portrait" | "mobile";

interface WidgetState {
  layouts: Record<string, LayoutItem[]>;
  editMode: boolean;
  setLayouts: (layouts: Record<string, LayoutItem[]>) => void;
  setEditMode: (v: boolean) => void;
}

export const useWidgetStore = create<WidgetState>((set) => ({
  layouts: {},
  editMode: false,
  setLayouts: (layouts) => set({ layouts }),
  setEditMode: (editMode) => set({ editMode }),
}));
