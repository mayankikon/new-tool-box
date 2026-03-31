"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

interface DesignPlaygroundShellProps {
  nav: React.ReactNode;
  children: React.ReactNode;
  /** Merged onto the main content column (e.g. wider max-width for full-width previews). */
  contentClassName?: string;
}

export function DesignPlaygroundShell({
  nav,
  children,
  contentClassName,
}: DesignPlaygroundShellProps) {
  return (
    <div className="ds-doc-font min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            Design Playground
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/design-system"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Design System
            </Link>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        {nav}
        <div className="min-w-0 flex-1 overflow-auto px-6 py-8">
          <div className={cn("mx-auto max-w-5xl space-y-8", contentClassName)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
