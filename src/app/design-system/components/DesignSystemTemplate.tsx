"use client";

import Link from "next/link";

export interface DesignSystemTemplateProps {
  children: React.ReactNode;
  /** Optional left nav (e.g. DesignSystemNav). When provided, layout is two-column: nav + main. */
  left?: React.ReactNode;
}

export function DesignSystemTemplate({ children, left }: DesignSystemTemplateProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="ds-doc-font border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
          <h1 className="font-headline text-sm font-semibold tracking-tight text-foreground">
            Design System
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/design-playground"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Design Playground
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {left != null && left}
        <main className="min-w-0 flex-1 px-6 py-12">
          <div className="mx-auto max-w-6xl space-y-16">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
