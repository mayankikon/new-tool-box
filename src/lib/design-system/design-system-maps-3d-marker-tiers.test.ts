import { describe, expect, it } from "vitest";

import {
  resolveMarker3dTier,
  clusterMarkersForHeight,
  geofenceCentroid,
  CESIUM_3D_CLUSTER_MAX_HEIGHT_M,
  CESIUM_3D_CHIP_HEIGHT_M,
  CESIUM_3D_DEALERSHIP_HEIGHT_M,
} from "./design-system-maps-3d-marker-tiers";

describe("resolveMarker3dTier", () => {
  it("returns dealership above dealership threshold", () => {
    expect(resolveMarker3dTier(CESIUM_3D_DEALERSHIP_HEIGHT_M + 1)).toBe("dealership");
    expect(resolveMarker3dTier(2000)).toBe("dealership");
    expect(resolveMarker3dTier(5000)).toBe("dealership");
  });

  it("returns cluster between cluster and dealership thresholds", () => {
    expect(resolveMarker3dTier(CESIUM_3D_CLUSTER_MAX_HEIGHT_M + 1)).toBe("cluster");
    expect(resolveMarker3dTier(800)).toBe("cluster");
    expect(resolveMarker3dTier(CESIUM_3D_DEALERSHIP_HEIGHT_M)).toBe("cluster");
  });

  it("returns pin between chip and cluster thresholds", () => {
    expect(resolveMarker3dTier(CESIUM_3D_CHIP_HEIGHT_M + 1)).toBe("pin");
    expect(resolveMarker3dTier(400)).toBe("pin");
    expect(resolveMarker3dTier(CESIUM_3D_CLUSTER_MAX_HEIGHT_M)).toBe("pin");
  });

  it("returns chip at or below chip threshold", () => {
    expect(resolveMarker3dTier(CESIUM_3D_CHIP_HEIGHT_M)).toBe("chip");
    expect(resolveMarker3dTier(100)).toBe("chip");
    expect(resolveMarker3dTier(50)).toBe("chip");
  });

  it("handles boundary values precisely", () => {
    expect(resolveMarker3dTier(1200)).toBe("cluster");
    expect(resolveMarker3dTier(1200.01)).toBe("dealership");
    expect(resolveMarker3dTier(500)).toBe("pin");
    expect(resolveMarker3dTier(500.01)).toBe("cluster");
    expect(resolveMarker3dTier(290)).toBe("chip");
    expect(resolveMarker3dTier(290.01)).toBe("pin");
  });
});

describe("clusterMarkersForHeight", () => {
  const markers = Array.from({ length: 20 }, (_, i) => ({
    id: `m-${i}`,
    lng: -97.1 + (i % 5) * 0.0001,
    lat: 32.93 + Math.floor(i / 5) * 0.0001,
  }));

  it("returns clusters when markers are tightly grouped", () => {
    const result = clusterMarkersForHeight(markers, 800, 32.93, 560);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(markers.length);
    const totalPoints = result.reduce((sum, c) => sum + c.pointCount, 0);
    expect(totalPoints).toBe(markers.length);
  });

  it("returns more items at close zoom than at far zoom", () => {
    const farResult = clusterMarkersForHeight(markers, 2000, 32.93, 560);
    const closeResult = clusterMarkersForHeight(markers, 100, 32.93, 560);
    expect(closeResult.length).toBeGreaterThan(farResult.length);
  });

  it("returns empty array for empty markers", () => {
    expect(clusterMarkersForHeight([], 500, 32.93, 560)).toEqual([]);
  });

  it("cluster results have valid lat/lng and ids", () => {
    const result = clusterMarkersForHeight(markers, 800, 32.93, 560);
    for (const r of result) {
      expect(r.id).toBeTruthy();
      expect(typeof r.lng).toBe("number");
      expect(typeof r.lat).toBe("number");
      expect(r.pointCount).toBeGreaterThanOrEqual(1);
      expect(r.countLabel).toBeTruthy();
    }
  });
});

describe("geofenceCentroid", () => {
  it("computes arithmetic centroid of a triangle", () => {
    const ring = [[0, 0], [10, 0], [5, 10]] as [number, number][];
    const c = geofenceCentroid(ring);
    expect(c).not.toBeNull();
    expect(c!.lng).toBeCloseTo(5, 5);
    expect(c!.lat).toBeCloseTo(10 / 3, 5);
  });

  it("returns null for empty ring", () => {
    expect(geofenceCentroid([])).toBeNull();
  });
});
