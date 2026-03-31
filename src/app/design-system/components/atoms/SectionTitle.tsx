"use client";

import { cn } from "@/lib/utils";

export type SectionTitleVariant = "default" | "compact";

export interface SectionTitleProps {
  title: string;
  description?: React.ReactNode;
  variant?: SectionTitleVariant;
  className?: string;
}

export function SectionTitle({
  title,
  description,
  variant = "default",
  className,
}: SectionTitleProps) {
  return (
    <div className={cn("ds-doc-font", className)}>
      <h2
        className={cn(
          "font-semibold tracking-tight text-foreground",
          variant === "default" && "text-2xl",
          variant === "compact" && "text-xl mb-4"
        )}
      >
        {title}
      </h2>
      {description != null && variant === "default" && (
        <p className="mt-1 text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
