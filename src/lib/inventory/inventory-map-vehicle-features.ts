import type {
  Feature,
  FeatureCollection,
  Point,
  Position,
} from "geojson";
import type { InventoryVehicleRecord } from "@/lib/inventory/vehicle-list-data";
import { INVENTORY_FRONT_IMAGE_SRC_BY_VIN } from "@/lib/inventory/inventory-front-image-data";

/** 0–30 days: green/teal; 31–60: yellow; 61+: red (lot-age heat). */
export type InventoryLotAgeTier = "fresh" | "aging" | "stale";

/** Stroke / circle colors aligned with status-sheet greens / amber / orange-red. */
export const INVENTORY_LOT_AGE_TIER_HEX: Record<InventoryLotAgeTier, string> = {
  fresh: "#1A9375",
  aging: "#E6B117",
  stale: "#E64B17",
};

/** Zoom at or above this shows HTML image markers (and hides unclustered circles). */
export const INVENTORY_MAP_VEHICLE_IMAGE_ZOOM = 18.5;

const LOT_AGE_DAY_PATTERN = /(\d+)\s*days?/i;

export function parseLotAgeDays(value: string): number | null {
  const m = value.trim().match(LOT_AGE_DAY_PATTERN);
  if (!m) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

export function ageTierFromDays(days: number): InventoryLotAgeTier {
  if (days <= 30) return "fresh";
  if (days <= 60) return "aging";
  return "stale";
}

/**
 * Ray-casting point-in-polygon. `ring` is closed GeoJSON ring [lng, lat][].
 */
export function isPointInPolygonRing(
  lng: number,
  lat: number,
  ring: Position[]
): boolean {
  if (ring.length < 4) return false;
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

function polygonBoundingBox(ring: Position[]): {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
} {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of ring) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return { minLng, maxLng, minLat, maxLat };
}

/** Deterministic 32-bit seed from string (FNV-1a-ish mix). */
export function hashStringToSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomPointInPolygonRing(
  ring: Position[],
  seed: number,
  maxAttempts = 80
): [number, number] {
  const { minLng, maxLng, minLat, maxLat } = polygonBoundingBox(ring);
  const rand = mulberry32(seed);
  for (let a = 0; a < maxAttempts; a++) {
    const lng = minLng + rand() * (maxLng - minLng);
    const lat = minLat + rand() * (maxLat - minLat);
    if (isPointInPolygonRing(lng, lat, ring)) {
      return [lng, lat];
    }
  }
  const cx = (minLng + maxLng) / 2;
  const cy = (minLat + maxLat) / 2;
  return [cx, cy];
}

export interface InventoryVehicleMapFeatureProperties {
  vin: string;
  stockNumber: string;
  lotAgeDays: number;
  ageTier: InventoryLotAgeTier;
  title: string;
  price: string;
  mileage: string;
  imageSrc: string;
  imageAlt: string;
  stockType: string;
  lotAgeLabel: string;
}

function isOnMapLot(vehicle: InventoryVehicleRecord): boolean {
  return vehicle.geofence.trim().toLowerCase() !== "off lot";
}

/**
 * GeoJSON points for inventory vehicles on the main lot: VIN-seeded positions inside the polygon ring.
 */
export function buildInventoryVehicleFeatureCollection(
  vehicles: InventoryVehicleRecord[],
  mainLotPolygonRing: Position[]
): FeatureCollection<Point, InventoryVehicleMapFeatureProperties> {
  const features: Feature<Point, InventoryVehicleMapFeatureProperties>[] = [];

  for (const v of vehicles) {
    if (!isOnMapLot(v)) continue;

    const lotAgeDays = parseLotAgeDays(v.lotAge);
    if (lotAgeDays == null) continue;

    const ageTier = ageTierFromDays(lotAgeDays);
    const seed = hashStringToSeed(v.vin);
    const coordinates = randomPointInPolygonRing(mainLotPolygonRing, seed);

    features.push({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates,
      },
      properties: {
        vin: v.vin,
        stockNumber: v.stockNumber,
        lotAgeDays,
        ageTier,
        title: v.title,
        price: v.price,
        mileage: v.mileage,
        imageSrc: INVENTORY_FRONT_IMAGE_SRC_BY_VIN[v.vin] ?? v.imageSrc,
        imageAlt: v.imageAlt,
        stockType: v.stockType,
        lotAgeLabel: v.lotAge,
      },
    });
  }

  return {
    type: "FeatureCollection",
    features,
  };
}
