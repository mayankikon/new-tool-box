"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { MapMarkerHoverFrame } from "@/components/ui/map-marker-hover-frame";
import { encodePublicAssetPath } from "@/components/icons/map-marker-assets";
import {
  MAP_PIN_BACKDROP_HEIGHT_PX,
  MAP_PIN_BASE_HEIGHT_PX,
  MAP_PIN_BASE_WIDTH_PX,
} from "@/components/ui/vehicle-map-marker-pin";

const KEYS_MAP_PIN_SOURCE = "/media/map-markers/map-marker-keys.svg";

const KEYS_ACCENT_HEX = "#17A5E6";

export interface KeysMapMarkerPinProps {
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
 * Shield-shaped "keys" map marker pin with optional hover interaction
 * that matches the vehicle shield pin treatment.
 */
export function KeysMapMarkerPin({
  className,
  title = "Keys pin",
  hoverable = false,
  sizeScale = 1,
  hoverScale = 1.05,
  hoverLiftPx = 0,
  hoverOverlayIntensity = 5,
  hoverBackgroundAlpha = 0.2,
  hoverShadowIntensity = 3,
  shadowIntensity = 0,
}: KeysMapMarkerPinProps) {
  const src = encodePublicAssetPath(KEYS_MAP_PIN_SOURCE);
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
      backdropColor={KEYS_ACCENT_HEX}
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
