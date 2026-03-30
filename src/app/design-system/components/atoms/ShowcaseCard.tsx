"use client";

import { cn } from "@/lib/utils";

export type ShowcaseCardPadding = "md" | "lg";

export interface ShowcaseCardProps {
  children: React.ReactNode;
  padding?: ShowcaseCardPadding;
  className?: string;
}

export function ShowcaseCard({
  children,
  padding = "lg",
  className,
}: ShowcaseCardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-card shadow-sm",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
