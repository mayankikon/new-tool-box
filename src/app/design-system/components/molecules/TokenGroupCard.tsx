"use client";

import { ShowcaseCard } from "../atoms/ShowcaseCard";

export interface TokenGroupCardProps {
  title: string;
  children: React.ReactNode;
  padding?: "md" | "lg";
  className?: string;
}

export function TokenGroupCard({
  title,
  children,
  padding = "md",
  className,
}: TokenGroupCardProps) {
  return (
    <ShowcaseCard padding={padding} className={className}>
      <h3 className="ds-doc-font text-sm font-medium text-muted-foreground mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </ShowcaseCard>
  );
}
