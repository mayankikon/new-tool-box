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
 * Dealership HQ — center: [-97.06844, 32.76498]
 * Coordinates are [lng, lat] per GeoJSON spec.
 */
const DEALERSHIP_CENTER: [number, number] = [-97.06844, 32.76498];

const mainLotFeature: Feature<Polygon, MainLotProperties> = {
  type: "Feature",
  properties: {
    id: "lot-main",
    name: "Main Lot",
    vehicleCount: 184,
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-97.0706, 32.766],
        [-97.0662, 32.766],
        [-97.0662, 32.7639],
        [-97.0706, 32.7639],
        [-97.0706, 32.766],
      ],
    ],
  },
};

export const mainLotGeoJSON: FeatureCollection<Polygon, MainLotProperties> = {
  type: "FeatureCollection",
  features: [mainLotFeature],
};

export { DEALERSHIP_CENTER };
