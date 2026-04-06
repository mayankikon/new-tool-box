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
        className
      )}
    >
      {overline != null && variant === "default" && (
        <p className="mb-1 text-[12px] font-medium uppercase tracking-wider text-muted-foreground">
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
        <div className="mt-0 pb-2">
          <p className="pt-2 pb-10 text-[16px] text-muted-foreground">{description}</p>
          <div className="border-t border-border" />
        </div>
      )}
    </div>
  );
}
