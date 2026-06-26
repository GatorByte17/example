"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-white/10",
        className
      )}
    />
  );
}

export function SkeletonLoader({ count = 3, className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4 w-full", i === count - 1 && "w-2/3")}
        />
      ))}
    </div>
  );
}
