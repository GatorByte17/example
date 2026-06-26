"use client";

import { ReactNode, Component, ErrorInfo } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface WidgetSlotProps {
  children: ReactNode;
  editMode: boolean;
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class WidgetErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Widget error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <span className="text-3xl mb-2">⚠️</span>
          <p className="text-sm text-[var(--muted)]">Widget unavailable</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function WidgetSlot({ children, editMode, className }: WidgetSlotProps) {
  return (
    <div className={cn("h-full w-full relative group", className)}>
      {editMode && (
        <div className="absolute inset-0 z-10 rounded-2xl ring-2 ring-[var(--accent)] ring-opacity-60 pointer-events-none" />
      )}
      {editMode && (
        <div className="drag-handle absolute top-2 right-2 z-20 cursor-grab active:cursor-grabbing opacity-70 hover:opacity-100 transition">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-[var(--muted)]">
            <circle cx="5" cy="4" r="1.5" />
            <circle cx="11" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
          </svg>
        </div>
      )}
      <GlassCard>
        <WidgetErrorBoundary>{children}</WidgetErrorBoundary>
      </GlassCard>
    </div>
  );
}
