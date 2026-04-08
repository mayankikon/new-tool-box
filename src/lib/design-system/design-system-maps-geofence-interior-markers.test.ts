import { describe, expect, it } from "vitest";

import {
  buildGeofenceInteriorPreviewMarkers,
  INTERIOR_VEHICLE_MARKER_COUNT_MAX,
  INTERIOR_VEHICLE_MARKER_COUNT_MIN,
  isLngLatInsideRing,
  sampleLonLatPointsInsideRing,
} from "./design-system-maps-geofence-interior-markers";

describe("design-system-maps-geofence-interior-markers", () => {
  it("detects interior point for a simple square", () => {
    const square: [number, number][] = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ];
    expect(isLngLatInsideRing(5, 5, square)).toBe(true);
    expect(isLngLatInsideRing(15, 5, square)).toBe(false);
  });

  it("returns points inside a small geofence-like ring", () => {
    const ring: [number, number, number][] = [
      [-97.1, 32.92, 100],
      [-97.09, 32.92, 100],
      [-97.095, 32.93, 100],
    ];
    const pts = sampleLonLatPointsInsideRing(ring, 5);
    expect(pts.length).toBeGreaterThan(0);
    for (const [lng, lat] of pts) {
      expect(isLngLatInsideRing(lng, lat, ring.map(([a, b]) => [a, b]))).toBe(true);
    }
  });

  it("builds 40–50 clustered markers inside ring with stable ids for same ring", () => {
    const ring: [number, number, number][] = [
      [-97.1, 32.92, 100],
      [-97.09, 32.92, 100],
      [-97.095, 32.93, 100],
    ];
    const variants = ["teal", "gold", "red"] as const;
    const a = buildGeofenceInteriorPreviewMarkers(ring, variants);
    const b = buildGeofenceInteriorPreviewMarkers(ring, variants);
    expect(a.length).toBe(b.length);
    expect(a.length).toBeGreaterThanOrEqual(INTERIOR_VEHICLE_MARKER_COUNT_MIN);
    expect(a.length).toBeLessThanOrEqual(INTERIOR_VEHICLE_MARKER_COUNT_MAX);
    expect(a[0]!.id).toBe("geofence-preview-vehicle-0");
    for (const m of a) {
      expect(isLngLatInsideRing(m.lng, m.lat, ring.map(([x, y]) => [x, y]))).toBe(true);
    }
  });
});
