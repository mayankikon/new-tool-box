import Supercluster from "supercluster";

/**
 * 3D (Cesium) marker tier thresholds — tuned via the eye-height meter overlay.
 *
 * | Tier        | Eye height      | Visual                                       |
 * |-------------|-----------------|----------------------------------------------|
 * | chip        | ≤ 290 m         | VehicleMapMarkerChip (vehicle photos)         |
 * | pin         | 290 m – 500 m   | VehicleMapMarkerPin (teal/gold/red shields)   |
 * | cluster     | 500 m – 1200 m  | VehicleMapClusterMarker (number-default)      |
 * | dealership  | > 1200 m        | Single VehicleMapClusterMarker (group-active) |
 */

export type Marker3dTier = "dealership" | "cluster" | "pin" | "chip";

/** Above this eye height → number-default cluster badges. */
export const CESIUM_3D_CLUSTER_MAX_HEIGHT_M = 500;

/** At or below this eye height → chip tier (vehicle photos). */
export const CESIUM_3D_CHIP_HEIGHT_M = 290;

/** Above this → single dealership icon at geofence centroid. */
export const CESIUM_3D_DEALERSHIP_HEIGHT_M = 1200;

/** Supercluster pixel radius (matches 2D `INVENTORY_MAP_CLUSTER_RADIUS`). */
const CLUSTER_RADIUS = 72;

const EARTH_CIRCUMFERENCE_M = 40_075_016.686;

export function resolveMarker3dTier(eyeHeightM: number): Marker3dTier {
  if (eyeHeightM > CESIUM_3D_DEALERSHIP_HEIGHT_M) return "dealership";
  if (eyeHeightM > CESIUM_3D_CLUSTER_MAX_HEIGHT_M) return "cluster";
  if (eyeHeightM <= CESIUM_3D_CHIP_HEIGHT_M) return "chip";
  return "pin";
}

function zoomFromEyeHeight(latDeg: number, heightM: number, viewportHeightPx: number): number {
  const groundSpanM = heightM / 1.15;
  const mpp = groundSpanM / (viewportHeightPx * 0.85);
  const cosLat = Math.cos((latDeg * Math.PI) / 180);
  if (cosLat < 1e-6) return 10;
  const z = Math.log2((EARTH_CIRCUMFERENCE_M * cosLat) / (256 * mpp));
  return Math.max(0, Math.min(21, z));
}

export interface Marker3dClusterResult {
  id: string;
  lng: number;
  lat: number;
  pointCount: number;
  countLabel: string;
}

interface MarkerLike {
  id: string;
  lng: number;
  lat: number;
}

/**
 * Runs Supercluster on the markers at the equivalent Mapbox zoom for the given eye height
 * and returns cluster centroids with point counts.
 */
export function clusterMarkersForHeight<M extends MarkerLike>(
  markers: readonly M[],
  eyeHeightM: number,
  latDeg: number,
  viewportHeightPx: number,
): Marker3dClusterResult[] {
  if (markers.length === 0) return [];

  const equivalentZoom = zoomFromEyeHeight(latDeg, eyeHeightM, viewportHeightPx);

  const features: GeoJSON.Feature<GeoJSON.Point>[] = markers.map((m) => ({
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [m.lng, m.lat] },
    properties: { markerId: m.id },
  }));

  const index = new Supercluster({
    maxZoom: 20,
    radius: CLUSTER_RADIUS,
  });
  index.load(features);

  let minLng = markers[0]!.lng;
  let maxLng = markers[0]!.lng;
  let minLat = markers[0]!.lat;
  let maxLat = markers[0]!.lat;
  for (const m of markers) {
    if (m.lng < minLng) minLng = m.lng;
    if (m.lng > maxLng) maxLng = m.lng;
    if (m.lat < minLat) minLat = m.lat;
    if (m.lat > maxLat) maxLat = m.lat;
  }
  const pad = 0.005;

  const clusters = index.getClusters(
    [minLng - pad, minLat - pad, maxLng + pad, maxLat + pad],
    Math.floor(equivalentZoom),
  );

  return clusters.map((f) => {
    const [lng, lat] = f.geometry.coordinates as [number, number];
    const props = f.properties as Record<string, unknown>;
    const isCluster = Boolean(props.cluster);
    const pointCount = isCluster ? (props.point_count as number) : 1;
    const countLabel = isCluster
      ? String(props.point_count_abbreviated ?? props.point_count ?? "")
      : "1";
    const id = isCluster
      ? `cluster-${props.cluster_id}`
      : `single-${props.markerId ?? lng.toFixed(6)}`;
    return { id, lng, lat, pointCount, countLabel };
  });
}

/** Arithmetic centroid of a geofence ring (lon/lat only). */
export function geofenceCentroid(
  ring: readonly { 0: number; 1: number }[],
): { lng: number; lat: number } | null {
  if (ring.length === 0) return null;
  let sumLng = 0;
  let sumLat = 0;
  for (const v of ring) {
    sumLng += v[0];
    sumLat += v[1];
  }
  return { lng: sumLng / ring.length, lat: sumLat / ring.length };
}
