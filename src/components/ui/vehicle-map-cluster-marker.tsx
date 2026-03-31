"use client";

import { cn } from "@/lib/utils";
import { MapMarkerHoverFrame } from "@/components/ui/map-marker-hover-frame";

export type VehicleMapClusterMarkerVariant = "number-default" | "group-active";

export interface VehicleMapClusterMarkerProps {
  countLabel?: string;
  variant?: VehicleMapClusterMarkerVariant;
  className?: string;
  title?: string;
  hoverable?: boolean;
}

const GROUP_ICON_PATH =
  "M26 12H21V7C21 6.73478 20.8946 6.48043 20.7071 6.29289C20.5196 6.10536 20.2652 6 20 6H12C11.7348 6 11.4804 6.10536 11.2929 6.29289C11.1054 6.48043 11 6.73478 11 7V12H6C5.73478 12 5.48043 12.1054 5.29289 12.2929C5.10536 12.4804 5 12.7348 5 13V27C5 27.2652 5.10536 27.5196 5.29289 27.7071C5.48043 27.8946 5.73478 28 6 28H26C26.2652 28 26.5196 27.8946 26.7071 27.7071C26.8946 27.5196 27 27.2652 27 27V13C27 12.7348 26.8946 12.4804 26.7071 12.2929C26.5196 12.1054 26.2652 12 26 12ZM8 14H11V26H8V14ZM13 13V8H19V26H17V24C17 23.7348 16.8946 23.4804 16.7071 23.2929C16.5196 23.1054 16.2652 23 16 23C15.7348 23 15.4804 23.1054 15.2929 23.2929C15.1054 23.4804 15 23.7348 15 24V26H13V13ZM25 26H21V14H25V26ZM17 12H15V10H17V12ZM17 16H15V14H17V16ZM17 20H15V18H17V20ZM9 15H10V17H9V15ZM9 19H10V21H9V19ZM9 23H10V25H9V23ZM24 17H22V15H24V17ZM24 21H22V19H24V21ZM24 25H22V23H24V25Z";

export function VehicleMapClusterMarker({
  countLabel,
  variant = "number-default",
  className,
  title,
  hoverable = false,
}: VehicleMapClusterMarkerProps) {
  const markerSize = 48;
  const safeCount = countLabel?.trim() || "0";
  const accessibleTitle =
    title?.trim() ||
    (variant === "group-active"
      ? `Inventory group cluster${safeCount ? `, ${safeCount} vehicles` : ""}`
      : `Inventory cluster, ${safeCount} vehicles`);

  if (variant === "group-active") {
    const svg = (
      <svg
        width={markerSize}
        height={markerSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={accessibleTitle}
        className={cn(
          "size-12 shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.22)]",
          className
        )}
      >
        <title>{accessibleTitle}</title>
        <rect x="7" y="7" width="34" height="34" rx="5" fill="#1A9375" />
        <rect x="6" y="6" width="36" height="36" rx="6" stroke="#126550" strokeWidth="2" />
        <path d={GROUP_ICON_PATH} fill="white" transform="translate(8 7)" />
      </svg>
    );

    if (!hoverable) {
      return svg;
    }

    return (
      <MapMarkerHoverFrame
        className="pointer-events-auto"
        backdropColor="#1A9375"
        backdropClassName="size-[52px] rounded-[16px]"
      >
        {svg}
      </MapMarkerHoverFrame>
    );
  }

  const fontSize =
    safeCount.length >= 4 ? 11 : safeCount.length >= 3 ? 13 : 16;

  const svg = (
    <svg
      width={markerSize}
      height={markerSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={accessibleTitle}
      className={cn(
        "size-12 shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.2)]",
        className
      )}
    >
      <title>{accessibleTitle}</title>
      <rect x="7" y="7" width="34" height="34" rx="5" fill="white" />
      <rect x="6" y="6" width="36" height="36" rx="6" stroke="#DCDCDC" strokeWidth="2" />
      <text
        x="24"
        y="24"
        fill="#126550"
        fontSize={fontSize}
        fontWeight="600"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily:
            "var(--font-saira), var(--font-headline), 'DIN Offc Pro', 'Arial Unicode MS', sans-serif",
          letterSpacing: safeCount.length >= 3 ? "-0.03em" : "-0.02em",
        }}
      >
        {safeCount}
      </text>
    </svg>
  );

  if (!hoverable) {
    return svg;
  }

  return (
    <MapMarkerHoverFrame
      className="pointer-events-auto"
      backdropColor="#1A9375"
      backdropClassName="size-[52px] rounded-[16px]"
    >
      {svg}
    </MapMarkerHoverFrame>
  );
}
