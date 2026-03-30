"use client";

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MapMarkerHoverFrameProps {
  children: ReactNode;
  className?: string;
  backdropColor: string;
  backdropClassName?: string;
  backdropStyle?: CSSProperties;
  backdropOffsetX?: number;
  backdropOffsetY?: number;
  contentClassName?: string;
}

function applyAlpha(color: string, alpha: number) {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    let hex = trimmed.slice(1);
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (hex.length === 6) {
      const r = Number.parseInt(hex.slice(0, 2), 16);
      const g = Number.parseInt(hex.slice(2, 4), 16);
      const b = Number.parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].every((value) => Number.isFinite(value))) {
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      }
    }
  }
  return trimmed;
}

export function MapMarkerHoverFrame({
  children,
  className,
  backdropColor,
  backdropClassName,
  backdropStyle,
  backdropOffsetX = 0,
  backdropOffsetY = 0,
  contentClassName,
}: MapMarkerHoverFrameProps) {
  return (
    <div
      className={cn(
        "group relative inline-flex items-center justify-center p-[2px]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
      >
        <div
          className={backdropClassName}
          style={{
            transform: `translate(${backdropOffsetX}px, ${backdropOffsetY}px)`,
            ...backdropStyle,
            backgroundColor: applyAlpha(backdropColor, 0.2),
          }}
        />
      </div>
      <div
        className={cn(
          "relative z-10 inline-flex items-center justify-center origin-center transition-transform duration-150 ease-out will-change-transform group-hover:scale-[1.05] group-hover:drop-shadow-[0_16px_24px_rgba(15,23,32,0.28)]",
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
}
