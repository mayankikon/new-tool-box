import { INVENTORY_MAP_VEHICLE_IMAGE_ZOOM } from "@/lib/inventory/inventory-map-vehicle-features";

export { INVENTORY_MAP_VEHICLE_IMAGE_ZOOM };

/** Zoom for tier-colored circle markers (below HTML vehicle chips). */
export const INVENTORY_MAP_ZOOM_CHECKPOINT_MARKER = 17.3;

/**
 * Slider maps zoom linearly from min→bottom to max→top of the track.
 * Span is **tighter** than e.g. 14–20 so the **vehicle marker** (17.3) and **vehicle image** (18.5)
 * checkpoints have comfortable separation on the track. Values outside this range still clamp at the ends.
 */
export const INVENTORY_MAP_SLIDER_ZOOM_MIN = 15;
export const INVENTORY_MAP_SLIDER_ZOOM_MAX = 19.5;

/** Snap when the handle is within this fraction of track height from a checkpoint. */
export const INVENTORY_MAP_ZOOM_SNAP_THRESHOLD = 0.09;

export function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/**
 * Linear map: camera zoom → 0–1 handle position (bottom = min zoom, top = max zoom).
 */
export function inventoryMapZoomToNormalized(zoom: number): number {
  const span = INVENTORY_MAP_SLIDER_ZOOM_MAX - INVENTORY_MAP_SLIDER_ZOOM_MIN;
  if (span <= 1e-9) return 0;
  return clamp01((zoom - INVENTORY_MAP_SLIDER_ZOOM_MIN) / span);
}

/**
 * Inverse: normalized handle → zoom (continuous drag between checkpoints).
 */
export function inventoryMapNormalizedToZoom(normalized: number): number {
  const n = clamp01(normalized);
  return (
    INVENTORY_MAP_SLIDER_ZOOM_MIN +
    n * (INVENTORY_MAP_SLIDER_ZOOM_MAX - INVENTORY_MAP_SLIDER_ZOOM_MIN)
  );
}

/**
 * Where the two checkpoint rings sit on the track (0 = bottom, 1 = top), from fixed zoom levels:
 * vehicle circle markers, then vehicle photo chips.
 */
export function inventoryMapSliderCheckpointNormalized(): readonly [number, number] {
  return [
    inventoryMapZoomToNormalized(INVENTORY_MAP_ZOOM_CHECKPOINT_MARKER),
    inventoryMapZoomToNormalized(INVENTORY_MAP_VEHICLE_IMAGE_ZOOM),
  ];
}

export function nearestCheckpointIndex(
  normalized: number,
  checkpoints: readonly number[]
): number {
  let best = 0;
  let bestDist = Infinity;
  checkpoints.forEach((c, i) => {
    const d = Math.abs(normalized - c);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

export function snapNormalizedIfClose(
  normalized: number,
  checkpoints: readonly number[],
  threshold: number = INVENTORY_MAP_ZOOM_SNAP_THRESHOLD
): { value: number; snapped: boolean; checkpointIndex: number | null } {
  let closest = 0;
  let closestDist = Infinity;
  checkpoints.forEach((c, i) => {
    const d = Math.abs(normalized - c);
    if (d < closestDist) {
      closestDist = d;
      closest = i;
    }
  });
  if (closestDist <= threshold) {
    return {
      value: checkpoints[closest],
      snapped: true,
      checkpointIndex: closest,
    };
  }
  return { value: normalized, snapped: false, checkpointIndex: null };
}
