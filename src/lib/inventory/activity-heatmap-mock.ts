import type { Feature, FeatureCollection, Point } from "geojson";
import {
  getActivityTrackingCircleCenterLngLat,
  getActivityTrackingRadiusMiles,
} from "@/lib/marketing/service-defection-mock";

export interface ActivityHeatmapPointProperties {
  /** Visit intensity for Mapbox heatmap-weight, 0–1 */
  weight: number;
}

/** Deterministic PRNG for stable mock points across reloads. */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const [TRACK_CENTER_LNG, TRACK_CENTER_LAT] = getActivityTrackingCircleCenterLngLat();
const TRACK_RADIUS_MI = getActivityTrackingRadiusMiles();

/** ~69 statute miles per degree latitude (mid-lat approximation). */
const MI_PER_DEG_LAT = 69;

function milesPerDegreeLongitude(latDeg: number): number {
  return MI_PER_DEG_LAT * Math.cos((latDeg * Math.PI) / 180);
}

/** East / north miles from the home-lot tracking center → WGS84. */
function milesToLngLat(
  eastMiles: number,
  northMiles: number
): [number, number] {
  const lat = TRACK_CENTER_LAT + northMiles / MI_PER_DEG_LAT;
  const lng =
    TRACK_CENTER_LNG + eastMiles / milesPerDegreeLongitude(TRACK_CENTER_LAT);
  return [lng, lat];
}

/** Approximate distance from tracking center (adequate for a few statute miles). */
function distFromCenterMi(east: number, north: number): number {
  return Math.hypot(east, north);
}

function randomPointInDiskMiles(
  rnd: () => number,
  radiusMi: number
): { east: number; north: number; distMi: number } {
  const u = rnd();
  const v = rnd();
  const r = radiusMi * Math.sqrt(u);
  const theta = 2 * Math.PI * v;
  return {
    east: r * Math.sin(theta),
    north: r * Math.cos(theta),
    distMi: r,
  };
}

function randomPointInAnnulusMiles(
  rnd: () => number,
  innerMi: number,
  outerMi: number
): { east: number; north: number; distMi: number } {
  const u = rnd();
  const v = rnd();
  const r = Math.sqrt(innerMi * innerMi + u * (outerMi * outerMi - innerMi * innerMi));
  const theta = 2 * Math.PI * v;
  return {
    east: r * Math.sin(theta),
    north: r * Math.cos(theta),
    distMi: r,
  };
}

function weightForDistance(distMi: number, rnd: () => number): number {
  const edgeFade = 1 - 0.42 * (distMi / TRACK_RADIUS_MI);
  const base = 0.22 + rnd() * 0.78;
  return Math.min(1, Math.max(0.12, base * edgeFade));
}

/**
 * Mock aggregate activity **only inside** the Monitor tracking disc: same center and radius as
 * `ACTIVITY_TRACKING_CIRCLE_GEOJSON` (home centroid → covers all competitor pads + edge buffer).
 * Smooth blobs / annuli only (no radial spokes). Browser-only (no API).
 */
function buildActivityHeatmapFeatures(): Feature<Point, ActivityHeatmapPointProperties>[] {
  const features: Feature<Point, ActivityHeatmapPointProperties>[] = [];
  const R = TRACK_RADIUS_MI;

  const pushDisk = (seed: number, count: number, radiusMi: number) => {
    const rnd = mulberry32(seed);
    for (let i = 0; i < count; i += 1) {
      const { east, north, distMi } = randomPointInDiskMiles(rnd, radiusMi);
      if (distFromCenterMi(east, north) > R * 1.001) continue;
      const [lng, lat] = milesToLngLat(east, north);
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: { weight: weightForDistance(distMi, rnd) },
      });
    }
  };

  const pushAnnulus = (
    seed: number,
    count: number,
    innerMi: number,
    outerMi: number
  ) => {
    const rnd = mulberry32(seed);
    const outer = Math.min(outerMi, R * 0.995);
    const inner = Math.min(innerMi, outer * 0.92);
    for (let i = 0; i < count; i += 1) {
      const { east, north, distMi } = randomPointInAnnulusMiles(rnd, inner, outer);
      if (distFromCenterMi(east, north) > R * 1.001) continue;
      const [lng, lat] = milesToLngLat(east, north);
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: { weight: weightForDistance(distMi, rnd) },
      });
    }
  };

  const pushOffsetCluster = (
    seed: number,
    count: number,
    centerEastMi: number,
    centerNorthMi: number,
    spreadMi: number
  ) => {
    const rnd = mulberry32(seed);
    for (let i = 0; i < count; i += 1) {
      const east = centerEastMi + (rnd() - 0.5) * 2 * spreadMi;
      const north = centerNorthMi + (rnd() - 0.5) * 2 * spreadMi;
      const d = distFromCenterMi(east, north);
      if (d > R * 1.001) continue;
      const [lng, lat] = milesToLngLat(east, north);
      features.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: [lng, lat] },
        properties: { weight: weightForDistance(d, rnd) },
      });
    }
  };

  // Scaled to dynamic R (typically ~2–2.5 mi for the mock competitor layout)
  pushDisk(90210, 210, R * 0.44);
  pushAnnulus(44102, 120, R * 0.34, R * 0.48);

  pushAnnulus(60614, 150, R * 0.5, R * 0.8);
  pushAnnulus(73301, 130, R * 0.74, R * 0.98);

  const s = R * 0.22;
  pushOffsetCluster(52001, 44, R * 0.28, R * 0.18, s);
  pushOffsetCluster(52002, 40, -R * 0.2, R * 0.32, s);
  pushOffsetCluster(52003, 38, R * 0.38, -R * 0.22, s);
  pushOffsetCluster(52004, 42, -R * 0.3, -R * 0.26, s);
  pushOffsetCluster(52005, 36, R * 0.52, R * 0.15, s * 1.05);
  pushOffsetCluster(52006, 34, -R * 0.18, R * 0.48, s);

  return features;
}

export const activityHeatmapMockGeoJSON: FeatureCollection<
  Point,
  ActivityHeatmapPointProperties
> = {
  type: "FeatureCollection",
  features: buildActivityHeatmapFeatures(),
};
