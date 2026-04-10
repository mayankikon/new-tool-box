import { describe, expect, it } from "vitest";

import {
  INVENTORY_MAP_SLIDER_ZOOM_MAX,
  INVENTORY_MAP_SLIDER_ZOOM_MIN,
  INVENTORY_MAP_ZOOM_SNAP_THRESHOLD,
  inventoryMapNormalizedToZoom,
  inventoryMapSliderCheckpointNormalized,
  inventoryMapZoomToNormalized,
  nearestCheckpointIndex,
  snapNormalizedIfClose,
} from "@/lib/inventory/inventory-map-zoom-checkpoints";

describe("inventoryMapZoomToNormalized / inventoryMapNormalizedToZoom", () => {
  it("round-trips mid-range on the linear slider", () => {
    const z = 17.3;
    const n = inventoryMapZoomToNormalized(z);
    const back = inventoryMapNormalizedToZoom(n);
    expect(back).toBeCloseTo(z, 5);
  });

  it("maps min zoom to 0 and max zoom to 1", () => {
    expect(inventoryMapZoomToNormalized(INVENTORY_MAP_SLIDER_ZOOM_MIN)).toBe(0);
    expect(inventoryMapZoomToNormalized(INVENTORY_MAP_SLIDER_ZOOM_MAX)).toBe(1);
  });
});

describe("inventoryMapSliderCheckpointNormalized", () => {
  it("places vehicle marker and image stops by real zoom, not equidistant", () => {
    const [markerN, imageN] = inventoryMapSliderCheckpointNormalized();
    expect(markerN).toBeLessThan(imageN);
    expect(markerN).toBeGreaterThan(0);
    expect(imageN).toBeLessThan(1);
  });
});

describe("nearestCheckpointIndex", () => {
  it("returns closest checkpoint index for arbitrary positions", () => {
    const checkpoints = [0.25, 0.75];
    expect(nearestCheckpointIndex(0.2, checkpoints)).toBe(0);
    expect(nearestCheckpointIndex(0.55, checkpoints)).toBe(1);
    expect(nearestCheckpointIndex(0.9, checkpoints)).toBe(1);
  });
});

describe("snapNormalizedIfClose", () => {
  const checkpoints = [0.25, 0.75];

  it("snaps when within threshold", () => {
    const { value, snapped, checkpointIndex } = snapNormalizedIfClose(
      0.76,
      checkpoints,
      INVENTORY_MAP_ZOOM_SNAP_THRESHOLD
    );
    expect(snapped).toBe(true);
    expect(checkpointIndex).toBe(1);
    expect(value).toBe(0.75);
  });

  it("does not snap when far from wells", () => {
    const { snapped, checkpointIndex } = snapNormalizedIfClose(
      0.5,
      checkpoints,
      0.09
    );
    expect(snapped).toBe(false);
    expect(checkpointIndex).toBeNull();
  });
});
