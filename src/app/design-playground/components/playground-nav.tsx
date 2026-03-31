"use client";

import { cn } from "@/lib/utils";

import type { PlaygroundNavComponentItem, PlaygroundNavPatternItem } from "../design-playground-registry";

interface PlaygroundNavProps {
  componentItems: PlaygroundNavComponentItem[];
  patternItems: PlaygroundNavPatternItem[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export function PlaygroundNav({
  componentItems,
  patternItems,
  activeSlug,
  onSelect,
}: PlaygroundNavProps) {
  return (
    <nav
      className="flex w-[min(100%,300px)] shrink-0 flex-col border-r border-border bg-muted/25"
      aria-label="Design system components"
    >
      <div className="sticky top-[57px] max-h-[calc(100vh-57px)] overflow-y-auto py-6 pl-6 pr-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Components
        </p>
        <p className="mb-3 text-[11px] leading-snug text-muted-foreground">
          Same list as <code className="text-[10px]">design-system-nav-config</code>. Bold = live retro
          playground; others are queued (see audit doc).
        </p>
        <ul className="space-y-0.5">
          {componentItems.map(({ slug, label, live }) => {
            const active = activeSlug === slug;
            return (
              <li key={slug}>
                <button
                  type="button"
                  onClick={() => onSelect(slug)}
                  className={cn(
                    "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted/25",
                    active
                      ? "bg-primary/15 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    live && !active && "font-medium text-foreground/90"
                  )}
                >
                  {label}
                  {live ? (
                    <span className="ml-1.5 text-[10px] font-semibold text-primary">●</span>
                  ) : (
                    <span className="sr-only">(queued)</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mb-2 mt-8 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Patterns
        </p>
        <ul className="space-y-0.5">
          {patternItems.map(({ slug, label, live }) => {
            const active = activeSlug === slug;
            return (
              <li key={slug}>
                <button
                  type="button"
                  onClick={() => onSelect(slug)}
                  className={cn(
                    "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted/25",
                    active
                      ? "bg-primary/15 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                    live && !active && "font-medium text-foreground/90"
                  )}
                >
                  {label}
                  {live ? (
                    <span className="ml-1.5 text-[10px] font-semibold text-primary">●</span>
                  ) : (
                    <span className="sr-only">(queued)</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
          App-level modules to extract:{" "}
          <code className="text-[11px]">docs/design-system-retro-audit.md</code> § App-wide extractables.
        </p>
      </div>
    </nav>
  );
}
