import type { Feature, FeatureCollection, Polygon } from "geojson";

/**
 * Properties for any geofence (main lot or user-created).
 */
export interface GeofenceProperties {
  id: string;
  name: string;
  address?: string;
  zoneType?: string;
  vehicleCount?: number;
}

export interface MainLotProperties extends GeofenceProperties {
  vehicleCount: number;
}

/**
 * Dealership HQ — 1161 W Corporate Dr, Arlington, TX.
 * Center shifted south vs geocode (lat steps include −55/111320° for last move). [lng, lat] per GeoJSON.
 */
const DEALERSHIP_CENTER: [number, number] = [-97.0678261, 32.765202];

/**
 * Main lot at 1161 W Corporate Dr — same pentagon shape, shifted southwest onto
 * the 1161 building footprint (previous ring sat northeast of this parcel).
 */
const mainLotFeature: Feature<Polygon, MainLotProperties> = {
  type: "Feature",
  properties: {
    id: "lot-main",
    name: "Main Lot",
    address: "1161 W Corporate Dr, Arlington, TX",
    vehicleCount: 184,
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-97.06907, 32.765486],
        [-97.06815, 32.765506],
        [-97.06773, 32.765166],
        [-97.06771, 32.764466],
        [-97.06905, 32.764446],
        [-97.06907, 32.765486],
      ],
    ],
  },
};

export const mainLotGeoJSON: FeatureCollection<Polygon, MainLotProperties> = {
  type: "FeatureCollection",
  features: [mainLotFeature],
};

/** Shown on the map when Icon Headquarters is selected. */
export const ICON_HEADQUARTERS_DISPLAY_NAME = "Icon Headquarters";

/**
 * If automatic detection fails (no stable feature `id` on building tiles), set Mapbox
 * building feature ids here (inspect tiles in Mapbox Studio or `queryRenderedFeatures`).
 */
export const ICON_HEADQUARTERS_BUILDING_IDS_OVERRIDE: (string | number)[] = [];

export { DEALERSHIP_CENTER };
