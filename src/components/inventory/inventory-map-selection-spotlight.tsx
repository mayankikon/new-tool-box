"use client";

import { useCallback, useEffect, useRef } from "react";
import type mapboxgl from "mapbox-gl";
import { cn } from "@/lib/utils";
import type { InventoryMapBasemapAppearance } from "@/lib/inventory/inventory-map-highlight";

/**
 * Very subtle radial dim — barely perceptible; keeps focus on the selected point.
 * Center tracks the vehicle lng/lat (marker anchor); nudged slightly upward so the
 * “hole” aligns with the chip photo area vs the pin tip.
 */
const SUBTLE_VIGNETTE = {
  innerStop: 0.38,
  midStop: 0.78,
  outerOpacity: 0.07,
} as const;

const VERTICAL_CENTER_NUDGE_PX = -10;

function vignetteOverlayColor(appearance: InventoryMapBasemapAppearance): string {
  if (appearance === "light") {
    return "0,0,0";
  }
  if (appearance === "satellite") {
    return "10,12,18";
  }
  return "8,10,14";
}

export interface InventoryMapSelectionSpotlightProps {
  map: mapboxgl.Map | null;
  lngLat: [number, number] | null;
  appearance: InventoryMapBasemapAppearance;
  visible: boolean;
}

/**
 * Near-imperceptible radial vignette centered on the selected vehicle (screen-space).
 */
export function InventoryMapSelectionSpotlight({
  map,
  lngLat,
  appearance,
  visible,
}: InventoryMapSelectionSpotlightProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);

  const applyVignetteToDom = useCallback(() => {
    const el = surfaceRef.current;
    if (!map || !lngLat || !visible || !el) return;
    try {
      const p = map.project(lngLat);
      const canvas = map.getCanvas();
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      const x = (p.x / w) * 100;
      const y = ((p.y + VERTICAL_CENTER_NUDGE_PX) / h) * 100;
      const v = SUBTLE_VIGNETTE;
      const rgb = vignetteOverlayColor(appearance);
      const midOpacity = v.outerOpacity * 0.45;
      el.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(${rgb},0) 0%, rgba(${rgb},0) ${v.innerStop * 100}%, rgba(${rgb},${midOpacity}) ${v.midStop * 100}%, rgba(${rgb},${v.outerOpacity}) 100%)`;
    } catch {
      /* map tearing down */
    }
  }, [map, lngLat, visible, appearance]);

  useEffect(() => {
    if (!map || !visible || !lngLat) return;
    applyVignetteToDom();
    map.on("move", applyVignetteToDom);
    map.on("zoom", applyVignetteToDom);
    map.on("rotate", applyVignetteToDom);
    map.on("pitch", applyVignetteToDom);
    map.on("resize", applyVignetteToDom);
    return () => {
      map.off("move", applyVignetteToDom);
      map.off("zoom", applyVignetteToDom);
      map.off("rotate", applyVignetteToDom);
      map.off("pitch", applyVignetteToDom);
      map.off("resize", applyVignetteToDom);
    };
  }, [map, visible, lngLat, applyVignetteToDom]);

  if (!visible || !lngLat) {
    return null;
  }

  return (
    <div
      ref={surfaceRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-[5]",
        "motion-reduce:transition-none"
      )}
      aria-hidden="true"
    />
  );
}
