"use client";

import { cn } from "@/lib/utils";

export type SectionTitleVariant = "default" | "compact";

export interface SectionTitleProps {
  overline?: string;
  title: string;
  description?: React.ReactNode;
  variant?: SectionTitleVariant;
  className?: string;
}

export function SectionTitle({
  overline,
  title,
  description,
  variant = "default",
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "font-[family-name:var(--font-saira)]",
        variant === "default" && "pt-10",
        /* 40px below the divider; collapses with the next sibling’s space-y-* margin so body starts once. */
        variant === "default" && description != null && "mb-[40px]",
        className
      )}
    >
      {overline != null && variant === "default" && (
        <p className="mb-1 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          {overline}
        </p>
      )}
      <h2
        className={cn(
          "font-medium tracking-tight text-foreground",
          variant === "default" && "text-4xl",
          variant === "compact" && "text-xl mb-4"
        )}
      >
        {title}
      </h2>
      {description != null && variant === "default" && (
        <div className="mt-0">
          <p className="pt-2 pb-5 text-[16px] text-muted-foreground">{description}</p>
          <div className="border-t border-border" />
        </div>
      )}
    </div>
  );
}
