"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ResponsiveGridLayout } from "react-grid-layout";
import type { LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import { useOrientation } from "@/hooks/useOrientation";
import { useWidgetStore } from "@/store/widgetStore";
import { WidgetSlot } from "./WidgetSlot";
import { deriveSize } from "@/lib/widgets/registry";
import dynamic from "next/dynamic";

import "react-grid-layout/css/styles.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWidget = React.ComponentType<any>;

const WIDGET_COMPONENTS: Record<string, AnyWidget> = {
  clock:         dynamic(() => import("@/components/widgets/ClockWidget")),
  weather:       dynamic(() => import("@/components/widgets/WeatherWidget")),
  calendar:      dynamic(() => import("@/components/widgets/CalendarWidget")),
  todos:         dynamic(() => import("@/components/widgets/TodoWidget")),
  homeassistant: dynamic(() => import("@/components/widgets/HomeAssistantWidget")),
};

const COLS: Record<string, number> = {
  tv:        16,
  desktop:   12,
  landscape: 12,
  portrait:  8,
  mobile:    4,
};

const BREAKPOINTS: Record<string, number> = {
  tv:        1920,
  desktop:   1280,
  landscape: 1024,
  portrait:  768,
  mobile:    0,
};

function makeLayout(items: Array<Omit<LayoutItem, "moved">>): readonly LayoutItem[] {
  return items as readonly LayoutItem[];
}

const DEFAULT_LAYOUTS: ResponsiveLayouts = {
  tv: makeLayout([
    { i: "clock",         x: 0,  y: 0, w: 4, h: 3 },
    { i: "weather",       x: 4,  y: 0, w: 4, h: 3 },
    { i: "calendar",      x: 8,  y: 0, w: 5, h: 6 },
    { i: "homeassistant", x: 13, y: 0, w: 3, h: 6 },
    { i: "todos",         x: 0,  y: 3, w: 4, h: 3 },
  ]),
  desktop: makeLayout([
    { i: "clock",         x: 0, y: 0, w: 4, h: 3 },
    { i: "weather",       x: 4, y: 0, w: 4, h: 3 },
    { i: "calendar",      x: 8, y: 0, w: 4, h: 6 },
    { i: "todos",         x: 0, y: 3, w: 4, h: 4 },
    { i: "homeassistant", x: 4, y: 3, w: 4, h: 4 },
  ]),
  landscape: makeLayout([
    { i: "clock",         x: 0, y: 0, w: 4, h: 3 },
    { i: "weather",       x: 4, y: 0, w: 4, h: 3 },
    { i: "calendar",      x: 8, y: 0, w: 4, h: 6 },
    { i: "todos",         x: 0, y: 3, w: 4, h: 4 },
    { i: "homeassistant", x: 4, y: 3, w: 4, h: 4 },
  ]),
  portrait: makeLayout([
    { i: "clock",         x: 0, y: 0,  w: 8, h: 3 },
    { i: "weather",       x: 0, y: 3,  w: 4, h: 3 },
    { i: "homeassistant", x: 4, y: 3,  w: 4, h: 3 },
    { i: "calendar",      x: 0, y: 6,  w: 8, h: 5 },
    { i: "todos",         x: 0, y: 11, w: 8, h: 4 },
  ]),
  mobile: makeLayout([
    { i: "clock",         x: 0, y: 0,  w: 4, h: 3 },
    { i: "weather",       x: 0, y: 3,  w: 4, h: 3 },
    { i: "calendar",      x: 0, y: 6,  w: 4, h: 5 },
    { i: "homeassistant", x: 0, y: 11, w: 4, h: 4 },
    { i: "todos",         x: 0, y: 15, w: 4, h: 4 },
  ]),
};

const WIDGET_IDS = Object.keys(WIDGET_COMPONENTS);

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function debouncedSave(layouts: ResponsiveLayouts) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layouts),
      });
    } catch (e) {
      console.error("Failed to save layouts:", e);
    }
  }, 800);
}

export default function WidgetGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState(80);
  const [containerWidth, setContainerWidth] = useState(0);
  const orientation = useOrientation();
  const { layouts, setLayouts, editMode } = useWidgetStore();
  const [ready, setReady] = useState(false);

  const updateDimensions = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const w = el.clientWidth;
    setRowHeight(Math.max(40, Math.floor(h / 10)));
    setContainerWidth(w);
  }, []);

  useEffect(() => {
    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateDimensions]);

  useEffect(() => {
    fetch("/api/widgets")
      .then((r) => r.json())
      .then((saved: Record<string, LayoutItem[]>) => {
        if (saved && Object.keys(saved).length > 0) {
          // Convert plain arrays from DB into readonly arrays
          const converted: ResponsiveLayouts = {};
          for (const [bp, items] of Object.entries(saved)) {
            converted[bp] = items as readonly LayoutItem[];
          }
          setLayouts(converted as Record<string, LayoutItem[]>);
        } else {
          setLayouts(DEFAULT_LAYOUTS as Record<string, LayoutItem[]>);
        }
        setReady(true);
      })
      .catch(() => {
        setLayouts(DEFAULT_LAYOUTS as Record<string, LayoutItem[]>);
        setReady(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleLayoutChange(
    _currentLayout: readonly LayoutItem[],
    allLayouts: ResponsiveLayouts
  ) {
    setLayouts(allLayouts as Record<string, LayoutItem[]>);
    debouncedSave(allLayouts);
  }

  if (!ready || containerWidth === 0) {
    return (
      <div ref={containerRef} className="h-full w-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentBpLayouts =
    (layouts[orientation === "portrait" ? "portrait" : "landscape"] as LayoutItem[] | undefined) ?? [];

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <ResponsiveGridLayout
        width={containerWidth}
        layouts={layouts as ResponsiveLayouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={rowHeight}
        margin={[12, 12]}
        containerPadding={[12, 12]}
        dragConfig={{
          enabled: editMode,
          handle: ".drag-handle",
        }}
        resizeConfig={{ enabled: editMode }}
        onLayoutChange={handleLayoutChange}
        autoSize={false}
        style={{ height: "100%" }}
      >
        {WIDGET_IDS.map((widgetId) => {
          const Component = WIDGET_COMPONENTS[widgetId];
          const layoutItem = currentBpLayouts.find((l) => l.i === widgetId);
          const size = layoutItem
            ? deriveSize(layoutItem.w, layoutItem.h)
            : "md";

          return (
            <div key={widgetId} style={{ height: "100%" }}>
              <WidgetSlot editMode={editMode}>
                <Component size={size} />
              </WidgetSlot>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
}
