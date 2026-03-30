import type { Feature, FeatureCollection, Polygon, Position } from "geojson";
import type mapboxgl from "mapbox-gl";
import {
  DEALERSHIP_CENTER,
  ICON_HEADQUARTERS_BUILDING_IDS_OVERRIDE,
  mainLotGeoJSON,
} from "@/lib/inventory/dealership-geofences";

export interface IconHeadquartersResolution {
  /**
   * When set (manual override only), use composite `feature-state` + id filter path.
   * Mapbox tiles often omit ids — prefer `footprint` from auto-resolve.
   */
  ids: (string | number)[];
  /** Marker / label anchor (building centroid when resolved, else dealership center). */
  anchorLngLat: [number, number];
  /**
   * HQ footprint + heights for a GeoJSON overlay (hover/click without tile feature ids).
   */
  footprint: Feature<Polygon, { height: number; min_height: number }> | null;
}

function closeRing(ring: Position[]): Position[] {
  if (ring.length === 0) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring;
  return [...ring, first];
}

function pointInRing(lng: number, lat: number, ring: Position[]): boolean {
  if (ring.length < 3) return false;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function polygonRingAreaSqMetersApprox(ring: Position[]): number {
  if (ring.length < 3) return Infinity;
  let twice = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    twice += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return Math.abs(twice) * 0.5;
}

function centroidOfRing(ring: Position[]): [number, number] {
  let sx = 0;
  let sy = 0;
  const n = ring.length - 1;
  const limit = ring[n][0] === ring[0][0] && ring[n][1] === ring[0][1] ? n : ring.length;
  for (let i = 0; i < limit; i++) {
    sx += ring[i][0];
    sy += ring[i][1];
  }
  const d = Math.max(1, limit);
  return [sx / d, sy / d];
}

function buildingContainsPoint(
  feature: mapboxgl.MapboxGeoJSONFeature,
  lng: number,
  lat: number
): boolean {
  const g = feature.geometry;
  if (!g) return false;
  if (g.type === "Polygon") {
    const coords = g.coordinates as Position[][];
    const outer = coords[0];
    if (!outer || !pointInRing(lng, lat, outer)) return false;
    for (let h = 1; h < coords.length; h++) {
      if (pointInRing(lng, lat, coords[h])) return false;
    }
    return true;
  }
  if (g.type === "MultiPolygon") {
    const multi = g.coordinates as Position[][][];
    for (const poly of multi) {
      const outer = poly[0];
      if (!outer || !pointInRing(lng, lat, outer)) continue;
      let inHole = false;
      for (let h = 1; h < poly.length; h++) {
        if (pointInRing(lng, lat, poly[h])) inHole = true;
      }
      if (!inHole) return true;
    }
  }
  return false;
}

function mainLotOuterRing(
  geofences: FeatureCollection<Polygon>
): Position[] | null {
  const g = geofences.features[0]?.geometry;
  if (g?.type !== "Polygon") return null;
  return g.coordinates[0] ?? null;
}

function pointInsideGeofence(
  lng: number,
  lat: number,
  geofences: FeatureCollection<Polygon>
): boolean {
  const ring = mainLotOuterRing(geofences);
  if (!ring) return false;
  return pointInRing(lng, lat, ring);
}

function readBuildingHeights(
  props: Record<string, unknown> | null | undefined
): { height: number; min_height: number } {
  const rawH = props?.height;
  const rawMin = props?.min_height;
  const height =
    typeof rawH === "number" && Number.isFinite(rawH) && rawH > 0 ? rawH : 12;
  const min_height =
    typeof rawMin === "number" && Number.isFinite(rawMin) && rawMin >= 0
      ? rawMin
      : 0;
  return { height, min_height };
}

/**
 * Picks the smallest extruded building footprint (by planar area) that contains
 * the dealership center and lies inside the main lot geofence — typically the showroom, not the whole lot slab.
 *
 * Returns a **GeoJSON footprint** so hover/selection work even when Mapbox tiles omit `feature.id`.
 */
export function resolveIconHeadquartersFromMap(
  map: mapboxgl.Map,
  geofences: FeatureCollection<Polygon> = mainLotGeoJSON
): IconHeadquartersResolution {
  if (ICON_HEADQUARTERS_BUILDING_IDS_OVERRIDE.length > 0) {
    return {
      ids: [...ICON_HEADQUARTERS_BUILDING_IDS_OVERRIDE],
      anchorLngLat: [...DEALERSHIP_CENTER] as [number, number],
      footprint: null,
    };
  }

  const [lng, lat] = DEALERSHIP_CENTER;
  if (!pointInsideGeofence(lng, lat, geofences)) {
    return {
      ids: [],
      anchorLngLat: [...DEALERSHIP_CENTER] as [number, number],
      footprint: null,
    };
  }

  let features: mapboxgl.MapboxGeoJSONFeature[] = [];
  try {
    features = map.querySourceFeatures("composite", {
      sourceLayer: "building",
      filter: [
        "any",
        ["==", ["get", "extrude"], true],
        ["==", ["get", "extrude"], "true"],
      ],
    });
  } catch {
    return {
      ids: [],
      anchorLngLat: [...DEALERSHIP_CENTER] as [number, number],
      footprint: null,
    };
  }

  type Candidate = {
    feature: mapboxgl.MapboxGeoJSONFeature;
    area: number;
    centroid: [number, number];
    closedOuter: Position[];
  };

  const candidates: Candidate[] = [];

  for (const f of features) {
    if (!buildingContainsPoint(f, lng, lat)) continue;
    const g = f.geometry;
    if (!g || (g.type !== "Polygon" && g.type !== "MultiPolygon")) continue;
    let bestRing: Position[] | null = null;
    let bestArea = Infinity;
    if (g.type === "Polygon") {
      const outer = (g.coordinates as Position[][])[0];
      if (outer) {
        const a = polygonRingAreaSqMetersApprox(outer);
        if (a < bestArea) {
          bestArea = a;
          bestRing = outer;
        }
      }
    } else {
      for (const poly of g.coordinates as Position[][][]) {
        const outer = poly[0];
        if (!outer) continue;
        const a = polygonRingAreaSqMetersApprox(outer);
        if (a < bestArea) {
          bestArea = a;
          bestRing = outer;
        }
      }
    }
    if (!bestRing || !Number.isFinite(bestArea)) continue;
    const closedOuter = closeRing(bestRing);
    candidates.push({
      feature: f,
      area: bestArea,
      centroid: centroidOfRing(closedOuter),
      closedOuter,
    });
  }

  if (candidates.length === 0) {
    return {
      ids: [],
      anchorLngLat: [...DEALERSHIP_CENTER] as [number, number],
      footprint: null,
    };
  }

  candidates.sort((a, b) => a.area - b.area);
  const best = candidates[0]!;
  const props = best.feature.properties as Record<string, unknown> | undefined;
  const { height, min_height } = readBuildingHeights(props);

  const footprint: Feature<Polygon, { height: number; min_height: number }> = {
    type: "Feature",
    id: "icon-headquarters",
    properties: { height, min_height },
    geometry: {
      type: "Polygon",
      coordinates: [best.closedOuter],
    },
  };

  return {
    ids: [],
    anchorLngLat: best.centroid,
    footprint,
  };
}
