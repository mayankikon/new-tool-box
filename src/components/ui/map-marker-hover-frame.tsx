"use client";

import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
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
  hoverScale?: number;
  hoverLiftPx?: number;
  hoverOverlayIntensity?: number;
  hoverBackgroundAlpha?: number;
  hoverShadowIntensity?: number;
  shadowIntensity?: number;
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
  hoverScale = 1.05,
  hoverLiftPx = 0,
  hoverOverlayIntensity = 5,
  hoverBackgroundAlpha = 0.2,
  hoverShadowIntensity = 3,
  shadowIntensity = 0,
}: MapMarkerHoverFrameProps) {
  const [hovered, setHovered] = useState(false);
  const overlayOpacity = useMemo(
    () => (hovered ? Math.max(0, Math.min(1, hoverBackgroundAlpha * (hoverOverlayIntensity / 10))) : 0),
    [hoverBackgroundAlpha, hoverOverlayIntensity, hovered],
  );
  const baseShadowOpacity = Math.max(0, Math.min(1, shadowIntensity / 10));
  const hoverShadowOpacity = Math.max(0, Math.min(1, hoverShadowIntensity / 10));
  const baseFilter = baseShadowOpacity > 0 ? `drop-shadow(0 10px 16px rgba(15,23,32,${baseShadowOpacity * 0.55}))` : undefined;
  const hoverFilter = hovered
    ? `drop-shadow(0 16px 24px rgba(15,23,32,${hoverShadowOpacity * 0.55}))`
    : baseFilter;

  return (
    <div
      className={cn(
        "group relative inline-flex items-center justify-center p-[2px]",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-150 ease-out"
        style={{ opacity: overlayOpacity }}
      >
        <div
          className={backdropClassName}
          style={{
            transform: `translate(${backdropOffsetX}px, ${backdropOffsetY}px)`,
            ...backdropStyle,
            backgroundColor: applyAlpha(backdropColor, hoverBackgroundAlpha),
          }}
        />
      </div>
      <div
        className={cn(
          "relative z-10 inline-flex items-center justify-center origin-center transition-all duration-150 ease-out will-change-transform",
          contentClassName
        )}
        style={{
          transform: hovered
            ? `translateY(-${Math.max(0, hoverLiftPx)}px) scale(${Math.max(0.1, hoverScale)})`
            : "translateY(0px) scale(1)",
          filter: hoverFilter,
        }}
      >
        {children}
      </div>
    </div>
  );
}
