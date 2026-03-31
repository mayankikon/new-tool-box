"use client";

import { ShowcaseCard } from "../atoms/ShowcaseCard";

export interface ComponentShowcaseBlockProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  padding?: "md" | "lg";
  className?: string;
  /** When true, wrap content in ShowcaseCard; when false, only render title + description + children (for nested blocks) */
  useCard?: boolean;
}

export function ComponentShowcaseBlock({
  title,
  description,
  children,
  padding = "lg",
  className,
  useCard = true,
}: ComponentShowcaseBlockProps) {
  const header = (
    <>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      {description != null && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
    </>
  );

  if (!useCard) {
    return (
      <div className={className}>
        {header}
        {children}
      </div>
    );
  }

  return (
    <ShowcaseCard padding={padding} className={className}>
      {header}
      {children}
    </ShowcaseCard>
  );
}
