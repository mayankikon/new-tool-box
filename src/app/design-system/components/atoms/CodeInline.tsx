"use client";

import { cn } from "@/lib/utils";

export type CodeInlineSize = "xs" | "sm";

export interface CodeInlineProps {
  children: React.ReactNode;
  size?: CodeInlineSize;
  className?: string;
}

export function CodeInline({
  children,
  size = "xs",
  className,
}: CodeInlineProps) {
  return (
    <code
      className={cn(
        "rounded bg-muted",
        size === "xs" && "px-1 py-0.5 text-xs",
        size === "sm" && "px-1.5 py-0.5 text-sm",
        className
      )}
    >
      {children}
    </code>
  );
}
