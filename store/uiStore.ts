"use client";

import { create } from "zustand";
import type { CalendarEvent } from "@/lib/integrations/types";

interface UiState {
  assignEvent: CalendarEvent | null;
  setAssignEvent: (event: CalendarEvent | null) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  assignEvent: null,
  setAssignEvent: (event) => set({ assignEvent: event }),
}));
