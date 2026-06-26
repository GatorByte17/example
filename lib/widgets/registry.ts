import type { LayoutItem } from "react-grid-layout";
import type { BreakpointKey } from "@/store/widgetStore";

export interface WidgetProps {
  size: "sm" | "md" | "lg" | "xl";
  config?: Record<string, unknown>;
}

export interface WidgetDefinition {
  id: string;
  name: string;
  defaultLayouts: Record<BreakpointKey, Omit<LayoutItem, "i">>;
}

export function deriveSize(w: number, h: number): WidgetProps["size"] {
  const area = w * h;
  if (area <= 4) return "sm";
  if (area <= 12) return "md";
  if (area <= 24) return "lg";
  return "xl";
}
