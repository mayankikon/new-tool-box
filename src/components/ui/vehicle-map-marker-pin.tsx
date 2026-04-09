"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { MapMarkerHoverFrame } from "@/components/ui/map-marker-hover-frame";
import { encodePublicAssetPath } from "@/components/icons/map-marker-assets";

export const VEHICLE_MAP_PIN_SOURCES = {
  teal: "/media/map-markers/map-marker-vehicle-teal.svg",
  gold: "/media/map-markers/map-marker-vehicle-gold.svg",
  red: "/media/map-markers/map-marker-vehicle-orange.svg",
} as const;

export const MAP_PIN_BASE_WIDTH_PX = 48;
export const MAP_PIN_BASE_HEIGHT_PX = 50;
export const MAP_PIN_BACKDROP_HEIGHT_PX = 46;

const VEHICLE_MAP_PIN_ACCENT_HEX = {
  teal: "#1A9375",
  gold: "#E6B117",
  red: "#E64B17",
} as const;

export type VehicleMapMarkerPinTone = keyof typeof VEHICLE_MAP_PIN_SOURCES;

export interface VehicleMapMarkerPinProps {
  tone?: VehicleMapMarkerPinTone;
  className?: string;
  title?: string;
  hoverable?: boolean;
  sizeScale?: number;
  hoverScale?: number;
  hoverLiftPx?: number;
  hoverOverlayIntensity?: number;
  hoverBackgroundAlpha?: number;
  hoverShadowIntensity?: number;
  shadowIntensity?: number;
}

/**
 * Design-system vehicle shield pin extracted from map marker artwork.
 */
export function VehicleMapMarkerPin({
  tone = "teal",
  className,
  title = "Vehicle pin",
  hoverable = false,
  sizeScale = 1,
  hoverScale = 1.05,
  hoverLiftPx = 0,
  hoverOverlayIntensity = 5,
  hoverBackgroundAlpha = 0.2,
  hoverShadowIntensity = 3,
  shadowIntensity = 0,
}: VehicleMapMarkerPinProps) {
  const src = encodePublicAssetPath(VEHICLE_MAP_PIN_SOURCES[tone]);
  const widthPx = Math.round(MAP_PIN_BASE_WIDTH_PX * sizeScale);
  const heightPx = Math.round(MAP_PIN_BASE_HEIGHT_PX * sizeScale);
  const backdropWidthPx = Math.round(MAP_PIN_BASE_WIDTH_PX * sizeScale);
  const backdropHeightPx = Math.round(MAP_PIN_BACKDROP_HEIGHT_PX * sizeScale);
  const image = (
    <Image
      src={src}
      width={widthPx}
      height={heightPx}
      alt=""
      aria-label={title}
      role="img"
      unoptimized
      className={cn("h-[50px] w-[48px] shrink-0 object-contain", className)}
      style={{ width: widthPx, height: heightPx }}
      decoding="async"
      draggable={false}
    />
  );

  if (!hoverable) {
    return image;
  }

  return (
    <MapMarkerHoverFrame
      className="pointer-events-auto"
      backdropColor={VEHICLE_MAP_PIN_ACCENT_HEX[tone]}
      backdropClassName="shrink-0"
      backdropOffsetY={-2}
      backdropStyle={{
        width: backdropWidthPx,
        height: backdropHeightPx,
        clipPath:
          "path('M4 10C4 6.69 6.69 4 10 4H38C41.31 4 44 6.69 44 10V27C44 29 43 31 41 32.5L26 42.5C25 43.2 23 43.2 22 42.5L7 32.5C5 31 4 29 4 27V10Z')",
      }}
      hoverScale={hoverScale}
      hoverLiftPx={hoverLiftPx}
      hoverOverlayIntensity={hoverOverlayIntensity}
      hoverBackgroundAlpha={hoverBackgroundAlpha}
      hoverShadowIntensity={hoverShadowIntensity}
      shadowIntensity={shadowIntensity}
    >
      {image}
    </MapMarkerHoverFrame>
  );
}
