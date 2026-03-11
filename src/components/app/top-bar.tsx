"use client";

import { cn } from "@/lib/utils";

export interface TopBarProps {
  /** Optional title or breadcrumb on the left */
  title?: React.ReactNode;
  /** Optional subtitle or secondary line under title */
  subtitle?: React.ReactNode;
  /** Right-side content (e.g. primary action button) */
  right?: React.ReactNode;
  className?: string;
}

/**
 * Full-width top app bar that sits above the main content area (right of the sidebar).
 * Use for page-level title and primary actions.
 */
export function TopBar({ title, subtitle, right, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6",
        className
      )}
      role="banner"
    >
      <div className="min-w-0 flex-1">
        {title != null && (
          <div className="truncate font-semibold text-foreground">
            {title}
          </div>
        )}
        {subtitle != null && (
          <div className="truncate text-sm text-muted-foreground">
            {subtitle}
          </div>
        )}
      </div>
      {right != null && (
        <div className="flex shrink-0 items-center gap-2">{right}</div>
      )}
    </header>
  );
}
