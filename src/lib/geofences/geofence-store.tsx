"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import type { GeofenceProperties } from "@/lib/inventory/dealership-geofences";
import { mainLotGeoJSON } from "@/lib/inventory/dealership-geofences";

export type GeofenceFeature = Feature<Polygon, GeofenceProperties>;

const initialFeatures: GeofenceFeature[] = mainLotGeoJSON.features as GeofenceFeature[];

interface GeofenceContextValue {
  geofences: FeatureCollection<Polygon, GeofenceProperties>;
  addGeofence: (feature: GeofenceFeature) => void;
  removeGeofence: (id: string) => void;
}

const GeofenceContext = createContext<GeofenceContextValue | null>(null);

interface GeofenceProviderProps {
  children: ReactNode;
}

export function GeofenceProvider({ children }: GeofenceProviderProps) {
  const [features, setFeatures] = useState<GeofenceFeature[]>(initialFeatures);

  const geofences: FeatureCollection<Polygon, GeofenceProperties> = useMemo(
    () => ({
      type: "FeatureCollection",
      features,
    }),
    [features]
  );

  const addGeofence = useCallback((feature: GeofenceFeature) => {
    setFeatures((prev) => [...prev, feature]);
  }, []);

  const removeGeofence = useCallback((id: string) => {
    setFeatures((prev) => prev.filter((f) => f.properties?.id !== id));
  }, []);

  const value = useMemo<GeofenceContextValue>(
    () => ({ geofences, addGeofence, removeGeofence }),
    [geofences, addGeofence, removeGeofence]
  );

  return (
    <GeofenceContext.Provider value={value}>{children}</GeofenceContext.Provider>
  );
}

export function useGeofences(): GeofenceContextValue {
  const ctx = useContext(GeofenceContext);
  if (!ctx) {
    throw new Error("useGeofences must be used within a GeofenceProvider");
  }
  return ctx;
}
