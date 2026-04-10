"use client";

import { cn } from "@/lib/utils";

interface AppGroovedMainColumnProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main column (right of sidebar): flat **`neutral-50`** in light mode (no horizontal line field or grooved canvas).
 */
export function AppGroovedMainColumn({
  children,
  className,
}: AppGroovedMainColumnProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col bg-neutral-50 dark:bg-background",
        className,
      )}
    >
      {children}
    </div>
  );
}
