"use client";

import { cn } from "@/lib/utils";
import { MapMarkerHoverFrame } from "@/components/ui/map-marker-hover-frame";
import { encodePublicAssetPath } from "@/components/icons/map-marker-assets";

const KEYS_MAP_PIN_SOURCE = "/media/map-markers/map-marker-keys.svg";

const KEYS_ACCENT_HEX = "#17A5E6";

export interface KeysMapMarkerPinProps {
  className?: string;
  title?: string;
  hoverable?: boolean;
}

/**
 * Shield-shaped "keys" map marker pin with optional hover interaction
 * that matches the vehicle shield pin treatment.
 */
export function KeysMapMarkerPin({
  className,
  title = "Keys pin",
  hoverable = false,
}: KeysMapMarkerPinProps) {
  const src = encodePublicAssetPath(KEYS_MAP_PIN_SOURCE);
  const image = (
    <img
      src={src}
      width={48}
      height={50}
      alt=""
      aria-label={title}
      role="img"
      className={cn("h-[50px] w-[48px] shrink-0 object-contain", className)}
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
      backdropClassName="h-[46px] w-[48px]"
      backdropOffsetY={-2}
      backdropStyle={{
        clipPath:
          "path('M4 10C4 6.69 6.69 4 10 4H38C41.31 4 44 6.69 44 10V27C44 29 43 31 41 32.5L26 42.5C25 43.2 23 43.2 22 42.5L7 32.5C5 31 4 29 4 27V10Z')",
      }}
    >
      {image}
    </MapMarkerHoverFrame>
  );
}
