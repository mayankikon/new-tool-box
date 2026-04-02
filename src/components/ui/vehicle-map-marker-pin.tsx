"use client";

import { cn } from "@/lib/utils";
import { MapMarkerHoverFrame } from "@/components/ui/map-marker-hover-frame";
import { encodePublicAssetPath } from "@/components/icons/map-marker-assets";

export const VEHICLE_MAP_PIN_SOURCES = {
  teal: "/media/map-markers/map-marker-vehicle-teal.svg",
  gold: "/media/map-markers/map-marker-vehicle-gold.svg",
  red: "/media/map-markers/map-marker-vehicle-orange.svg",
} as const;

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
}

/**
 * Design-system vehicle shield pin extracted from map marker artwork.
 */
export function VehicleMapMarkerPin({
  tone = "teal",
  className,
  title = "Vehicle pin",
  hoverable = false,
}: VehicleMapMarkerPinProps) {
  const src = encodePublicAssetPath(VEHICLE_MAP_PIN_SOURCES[tone]);
  const image = (
    <img
      src={src}
      width={58}
      height={58}
      alt=""
      aria-label={title}
      role="img"
      className={cn("size-[58px] shrink-0 object-contain", className)}
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
      backdropClassName="h-[52px] w-[68px]"
      backdropOffsetY={-1}
      backdropStyle={{
        clipPath: "polygon(14% 12%, 86% 12%, 86% 60%, 50% 88%, 14% 60%)",
      }}
    >
      {image}
    </MapMarkerHoverFrame>
  );
}
