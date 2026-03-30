"use client";

import { cn } from "@/lib/utils";

interface PlayAreaSectionProps {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Groups a preview + variants + tweaks under one heading inside a component playground page.
 */
export function PlayAreaSection({
  id,
  title,
  description,
  children,
  className,
}: PlayAreaSectionProps) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 space-y-5 rounded-lg border border-border/80 bg-card/30 p-5", className)}
    >
      <header className="space-y-1 border-b border-border/60 pb-3">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
