import type { DesignSystemMapsGeofenceVertex } from "@/lib/design-system/design-system-maps-geofence-storage";
import { VEHICLE_MODELS_BY_MAKE } from "@/lib/campaigns/vehicle-data";

/** Vehicle preview pins inside a saved geofence (inclusive range). */
export const INTERIOR_VEHICLE_MARKER_COUNT_MIN = 40;
export const INTERIOR_VEHICLE_MARKER_COUNT_MAX = 50;

/** Ray-casting point-in-polygon on lon/lat (planar; fine for small design-system lots). */
export function isLngLatInsideRing(lng: number, lat: number, ringLonLat: readonly [number, number][]): boolean {
  const n = ringLonLat.length;
  if (n < 3) return false;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i, i += 1) {
    const xi = ringLonLat[i]![0];
    const yi = ringLonLat[i]![1];
    const xj = ringLonLat[j]![0];
    const yj = ringLonLat[j]![1];
    const denom = yj - yi;
    const intersectsRay =
      (yi > lat) !== (yj > lat) &&
      lng < xi + ((xj - xi) * (lat - yi)) / (Math.abs(denom) < 1e-18 ? 1e-18 : denom);
    if (intersectsRay) {
      inside = !inside;
    }
  }
  return inside;
}

function ringToLonLatPairs(ring: readonly DesignSystemMapsGeofenceVertex[]): [number, number][] {
  const pairs: [number, number][] = ring.map(([lng, lat]) => [lng, lat]);
  const first = pairs[0];
  const last = pairs[pairs.length - 1];
  if (
    first != null &&
    last != null &&
    first[0] === last[0] &&
    first[1] === last[1] &&
    pairs.length > 3
  ) {
    return pairs.slice(0, -1);
  }
  return pairs;
}

function boundingBox(ring: readonly [number, number][]) {
  let minLng = ring[0]![0];
  let maxLng = ring[0]![0];
  let minLat = ring[0]![1];
  let maxLat = ring[0]![1];
  for (const [lng, lat] of ring) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { minLng, maxLng, minLat, maxLat };
}

/** Deterministic seed from saved ring so layout is stable across re-renders. */
export function hashRingSeed(ring: readonly DesignSystemMapsGeofenceVertex[]): number {
  let h = 2166136261;
  for (const v of ring) {
    const lng = v[0];
    const lat = v[1];
    const hh = v[2] ?? 0;
    h ^= Math.floor(lng * 1e9);
    h = Math.imul(h, 16777619);
    h ^= Math.floor(lat * 1e9);
    h = Math.imul(h, 16777619);
    h ^= Math.floor(hh * 100);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomPointInsideRing(
  lonLat: readonly [number, number][],
  rand: () => number,
  minLng: number,
  maxLng: number,
  minLat: number,
  maxLat: number,
): [number, number] | null {
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const lng = minLng + rand() * (maxLng - minLng);
    const lat = minLat + rand() * (maxLat - minLat);
    if (isLngLatInsideRing(lng, lat, lonLat)) {
      return [lng, lat];
    }
  }
  const cx = lonLat.reduce((s, p) => s + p[0], 0) / lonLat.length;
  const cy = lonLat.reduce((s, p) => s + p[1], 0) / lonLat.length;
  if (isLngLatInsideRing(cx, cy, lonLat)) {
    return [cx, cy];
  }
  return null;
}

/** ~Meters east/north → delta lng/lat at given latitude. */
function jitterMeters(
  lng: number,
  lat: number,
  eastM: number,
  northM: number,
): [number, number] {
  const dLat = northM / 111_320;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const dLng = cosLat > 1e-6 ? eastM / (111_320 * cosLat) : 0;
  return [lng + dLng, lat + dLat];
}

/**
 * Deterministic interior sample positions for preview pins.
 * Uses bbox grid + centroid; falls back to pseudo-random sweep if needed.
 */
export function sampleLonLatPointsInsideRing(
  ring: readonly DesignSystemMapsGeofenceVertex[],
  targetCount: number,
): [number, number][] {
  const lonLat = ringToLonLatPairs(ring);
  if (lonLat.length < 3) return [];

  const { minLng, maxLng, minLat, maxLat } = boundingBox(lonLat);
  const cx = lonLat.reduce((s, p) => s + p[0], 0) / lonLat.length;
  const cy = lonLat.reduce((s, p) => s + p[1], 0) / lonLat.length;

  const out: [number, number][] = [];
  const tryPush = (lng: number, lat: number) => {
    if (!isLngLatInsideRing(lng, lat, lonLat)) return;
    const key = `${lng.toFixed(8)},${lat.toFixed(8)}`;
    if (out.some(([a, b]) => `${a.toFixed(8)},${b.toFixed(8)}` === key)) return;
    out.push([lng, lat]);
  };

  tryPush(cx, cy);

  const gridSteps = Math.max(6, Math.ceil(Math.sqrt(targetCount * 4)));
  for (let gi = 0; gi < gridSteps && out.length < targetCount; gi += 1) {
    for (let gj = 0; gj < gridSteps && out.length < targetCount; gj += 1) {
      const u = (gi + 0.5) / gridSteps;
      const v = (gj + 0.5) / gridSteps;
      tryPush(minLng + u * (maxLng - minLng), minLat + v * (maxLat - minLat));
    }
  }

  const dLng = (maxLng - minLng) * 0.08;
  const dLat = (maxLat - minLat) * 0.08;
  const rings = 8;
  const spoke = 12;
  for (let r = 1; r <= rings && out.length < targetCount; r += 1) {
    for (let s = 0; s < spoke && out.length < targetCount; s += 1) {
      const ang = (s / spoke) * Math.PI * 2;
      tryPush(cx + Math.cos(ang) * dLng * r, cy + Math.sin(ang) * dLat * r);
    }
  }

  let fallback = 0;
  while (out.length < targetCount && fallback < targetCount * 6) {
    const t = fallback / (targetCount * 6);
    const lng = minLng + (maxLng - minLng) * ((t * 7.13) % 1);
    const lat = minLat + (maxLat - minLat) * ((t * 11.17) % 1);
    tryPush(lng, lat);
    fallback += 1;
  }

  if (out.length === 0) {
    const midLng = (minLng + maxLng) / 2;
    const midLat = (minLat + maxLat) / 2;
    if (isLngLatInsideRing(midLng, midLat, lonLat)) {
      out.push([midLng, midLat]);
    }
  }

  return out.slice(0, targetCount);
}

/**
 * Seeded pseudo-random points inside the ring, clustered near a few interior seeds so pins sit
 * close together in small groups (typ. 40–50 markers).
 */
export function sampleClusteredRandomPointsInsideRing(
  ring: readonly DesignSystemMapsGeofenceVertex[],
  seed: number,
  count: number,
): [number, number][] {
  const lonLat = ringToLonLatPairs(ring);
  if (lonLat.length < 3 || count <= 0) return [];

  const { minLng, maxLng, minLat, maxLat } = boundingBox(lonLat);
  const rand = mulberry32(seed);
  const widthM = (maxLng - minLng) * 111_320 * Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
  const heightM = (maxLat - minLat) * 111_320;
  const typicalSizeM = Math.max(widthM, heightM, 1);

  const numClusters = Math.min(
    8,
    Math.max(3, Math.round(4 + rand() * 3)),
  );

  const centers: [number, number][] = [];
  for (let c = 0; c < numClusters; c += 1) {
    const p = randomPointInsideRing(lonLat, rand, minLng, maxLng, minLat, maxLat);
    if (p != null) {
      centers.push(p);
    }
  }
  if (centers.length === 0) {
    return sampleLonLatPointsInsideRing(ring, count);
  }

  const jitterMinM = Math.min(12, typicalSizeM * 0.02);
  const jitterMaxM = Math.min(45, typicalSizeM * 0.12);

  const seen = new Set<string>();
  const out: [number, number][] = [];

  const tryAdd = (lng: number, lat: number) => {
    const key = `${lng.toFixed(9)},${lat.toFixed(9)}`;
    if (seen.has(key)) return false;
    if (!isLngLatInsideRing(lng, lat, lonLat)) return false;
    seen.add(key);
    out.push([lng, lat]);
    return true;
  };

  let guard = 0;
  while (out.length < count && guard < count * 80) {
    guard += 1;
    const cluster = centers[Math.floor(rand() * centers.length)]!;
    const radiusM = jitterMinM + rand() * (jitterMaxM - jitterMinM);
    const theta = rand() * Math.PI * 2;
    const eastM = Math.cos(theta) * radiusM;
    const northM = Math.sin(theta) * radiusM;
    const [lng, lat] = jitterMeters(cluster[0], cluster[1], eastM, northM);
    tryAdd(lng, lat);
  }

  if (out.length < count) {
    const extra = sampleLonLatPointsInsideRing(ring, count - out.length + 10);
    for (const [lng, lat] of extra) {
      if (out.length >= count) break;
      tryAdd(lng, lat + (rand() - 0.5) * 1e-7);
    }
  }

  return out.slice(0, count);
}

export function minVertexEllipsoidHeightM(ring: readonly DesignSystemMapsGeofenceVertex[]): number {
  let minH = Number.POSITIVE_INFINITY;
  for (const v of ring) {
    const h = v[2];
    const hm = h != null && Number.isFinite(h) ? h : 0;
    if (hm < minH) minH = hm;
  }
  return Number.isFinite(minH) ? minH : 0;
}

export type GeofenceInteriorMarkerVariant = "keys" | "teal" | "gold" | "red";

export type GeofenceInteriorPreviewMarker = {
  id: string;
  lng: number;
  lat: number;
  variant: GeofenceInteriorMarkerVariant;
  ellipsoidHeightM: number;
  skipSceneHeightSampling: true;
  /** CloudFront vehicle side-view URL for chip tier rendering. */
  imageSrc: string;
  /** Lot-age tier index (0 = teal/fresh, 1 = gold/aging, 2 = red/stale). */
  ageTier: number;
};

/** Flat list of all Evox side-view image URLs from the vehicle catalog (non-empty only). */
const EVOX_SIDE_VIEW_URLS: string[] = Object.values(VEHICLE_MODELS_BY_MAKE)
  .flat()
  .map((v) => v.imageUrl)
  .filter((url) => url.length > 0);

/** Number of distinct age tier buckets (0 = teal/fresh, 1 = gold/aging, 2 = red/stale). */
const AGE_TIER_COUNT = 3;

/**
 * Builds many preview markers inside the saved geofence footprint, clustered randomly at ground
 * level ({@link skipSceneHeightSampling}) so pins stay off roof meshes.
 * Each marker is assigned a cycling Evox photo and an age-tier index for chip rendering.
 */
export function buildGeofenceInteriorPreviewMarkers(
  ring: readonly DesignSystemMapsGeofenceVertex[],
  variantCycle: readonly GeofenceInteriorMarkerVariant[],
): GeofenceInteriorPreviewMarker[] {
  if (ring.length < 3 || variantCycle.length === 0) return [];

  const floorM = minVertexEllipsoidHeightM(ring) + 0.5;
  const seed = hashRingSeed(ring);
  const rand = mulberry32(seed ^ 0x9e3779b9);
  const count =
    INTERIOR_VEHICLE_MARKER_COUNT_MIN +
    Math.floor(rand() * (INTERIOR_VEHICLE_MARKER_COUNT_MAX - INTERIOR_VEHICLE_MARKER_COUNT_MIN + 1));

  const points = sampleClusteredRandomPointsInsideRing(ring, seed, count);
  if (points.length === 0) return [];

  return points.map(([lng, lat], i) => ({
    id: `geofence-preview-vehicle-${i}`,
    lng,
    lat,
    variant: variantCycle[i % variantCycle.length]!,
    ellipsoidHeightM: floorM,
    skipSceneHeightSampling: true as const,
    imageSrc: EVOX_SIDE_VIEW_URLS[i % EVOX_SIDE_VIEW_URLS.length]!,
    ageTier: i % AGE_TIER_COUNT,
  }));
}
