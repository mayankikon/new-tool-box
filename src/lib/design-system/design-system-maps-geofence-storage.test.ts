import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearDesignSystemMapsGeofence,
  loadDesignSystemMapsGeofence,
  type DesignSystemMapsGeofenceVertex,
  saveDesignSystemMapsGeofence,
} from "./design-system-maps-geofence-storage";

const KEY = "design-system-maps-geofence-v1";

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => {
      map.delete(key);
    },
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
  } as Storage;
}

describe("design-system-maps-geofence-storage", () => {
  beforeEach(() => {
    vi.stubGlobal("window", { localStorage: createMemoryStorage() } as Window);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips a valid ring with heights", () => {
    const ring: DesignSystemMapsGeofenceVertex[] = [
      [-97.1, 32.92, 120.5],
      [-97.09, 32.92, 121.0],
      [-97.095, 32.93, 119.8],
    ];
    saveDesignSystemMapsGeofence(ring);
    const loaded = loadDesignSystemMapsGeofence();
    expect(loaded).not.toBeNull();
    expect(loaded!.ring).toEqual(ring);
    expect(loaded!.savedAtIso).toMatch(/^\d{4}-/);
  });

  it("round-trips lng/lat-only ring", () => {
    const ring: DesignSystemMapsGeofenceVertex[] = [
      [-97.1, 32.92],
      [-97.09, 32.92],
      [-97.095, 32.93],
    ];
    saveDesignSystemMapsGeofence(ring);
    const loaded = loadDesignSystemMapsGeofence();
    expect(loaded).not.toBeNull();
    expect(loaded!.ring).toEqual(ring);
  });

  it("returns null for invalid JSON", () => {
    window.localStorage.setItem(KEY, "not-json");
    expect(loadDesignSystemMapsGeofence()).toBeNull();
  });

  it("clear removes storage", () => {
    saveDesignSystemMapsGeofence([
      [-97.1, 32.92, 0],
      [-97.09, 32.92, 0],
      [-97.095, 32.93, 0],
    ]);
    clearDesignSystemMapsGeofence();
    expect(loadDesignSystemMapsGeofence()).toBeNull();
  });
});
