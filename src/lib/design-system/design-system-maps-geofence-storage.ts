const STORAGE_KEY = "design-system-maps-geofence-v1";

/** WGS84 vertex; optional `heightM` is height above the ellipsoid from 3D tile picks (see geofence Cesium sync). */
export type DesignSystemMapsGeofenceVertex = [lng: number, lat: number, heightM?: number];

export interface DesignSystemMapsGeofenceStored {
  /** Closed ring; older saves are `[lng, lat][]` only. */
  ring: DesignSystemMapsGeofenceVertex[];
  savedAtIso: string;
}

export function loadDesignSystemMapsGeofence(): DesignSystemMapsGeofenceStored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const ring = (parsed as { ring?: unknown }).ring;
    if (!Array.isArray(ring) || ring.length < 3) return null;
    const normalized: DesignSystemMapsGeofenceVertex[] = [];
    for (const p of ring) {
      if (!Array.isArray(p) || p.length < 2) return null;
      const lng = Number(p[0]);
      const lat = Number(p[1]);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
      if (p.length >= 3) {
        const heightM = Number(p[2]);
        if (!Number.isFinite(heightM)) return null;
        normalized.push([lng, lat, heightM]);
      } else {
        normalized.push([lng, lat]);
      }
    }
    const savedAtIso =
      typeof (parsed as { savedAtIso?: unknown }).savedAtIso === "string"
        ? (parsed as { savedAtIso: string }).savedAtIso
        : new Date().toISOString();
    return { ring: normalized, savedAtIso };
  } catch {
    return null;
  }
}

export function saveDesignSystemMapsGeofence(ring: DesignSystemMapsGeofenceVertex[]): void {
  if (typeof window === "undefined") return;
  const payload: DesignSystemMapsGeofenceStored = {
    ring,
    savedAtIso: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearDesignSystemMapsGeofence(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
