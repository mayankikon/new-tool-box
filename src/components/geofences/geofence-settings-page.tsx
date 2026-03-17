"use client";

import { useCallback, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateActions,
} from "@/components/ui/empty-state";
import { MapboxMap } from "@/components/ui/mapbox-map";
import { GeofenceListPanel } from "@/components/geofences/geofence-list-panel";
import { GeofenceWizard } from "@/components/geofences/geofence-wizard";
import { useGeofences } from "@/lib/geofences/geofence-store";
import { DEALERSHIP_CENTER } from "@/lib/inventory/dealership-geofences";
import { cn } from "@/lib/utils";

interface GeofenceSettingsPageProps {
  /** When true, show the floating create panel over the map. */
  isCreating?: boolean;
  /** Called when user cancels or closes the create flow. */
  onCloseCreate?: () => void;
  /** Called when user clicks Create Geofence (empty state or header). */
  onCreateClick?: () => void;
  className?: string;
}

export function GeofenceSettingsPage({
  isCreating = false,
  onCloseCreate,
  onCreateClick,
  className,
}: GeofenceSettingsPageProps) {
  const { geofences, addGeofence, removeGeofence } = useGeofences();
  const features = geofences.features;
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const handleMapReady = useCallback((map: mapboxgl.Map) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const handleWizardComplete = useCallback(
    (feature: Parameters<typeof addGeofence>[0]) => {
      addGeofence(feature);
      onCloseCreate?.();
    },
    [addGeofence, onCloseCreate]
  );

  const isEmpty = features.length === 0;
  const showList = !isEmpty && !isCreating;

  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-6 overflow-hidden px-8 pb-8 min-h-0",
        className
      )}
    >
      <div className="flex flex-1 min-h-0 gap-6">
        {/* Left panel: empty state or list */}
        <aside className="flex w-[320px] shrink-0 flex-col overflow-hidden rounded-md border border-border bg-card">
          {isEmpty && !isCreating && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
              <EmptyState className="max-w-xs">
                <EmptyStateIcon>
                  <MapPin className="size-6 text-muted-foreground" />
                </EmptyStateIcon>
                <EmptyStateContent>
                  <EmptyStateTitle className="text-sm font-medium text-foreground">
                    No Geofence Created
                  </EmptyStateTitle>
                  <EmptyStateDescription className="text-xs">
                    Create a geofence to define location-based areas for your
                    inventory and rules.
                  </EmptyStateDescription>
                </EmptyStateContent>
                <EmptyStateActions>
                  <Button onClick={onCreateClick} size="sm">
                    <Plus className="size-4" />
                    Create Geofence
                  </Button>
                </EmptyStateActions>
              </EmptyState>
            </div>
          )}
          {showList && (
            <GeofenceListPanel
              geofences={features}
              onRemove={removeGeofence}
              className="flex-1 min-h-0"
            />
          )}
          {isCreating && (
            <div className="flex flex-1 items-center justify-center p-4 text-sm text-muted-foreground">
              Use the panel on the map to draw and save a geofence.
            </div>
          )}
        </aside>

        {/* Right: map with optional floating create panel */}
        <div className="relative flex-1 min-w-0 min-h-0 overflow-hidden rounded-md">
          <MapboxMap
            center={DEALERSHIP_CENTER}
            onMapReady={handleMapReady}
            className="absolute inset-0 h-full w-full"
          />
          {isCreating && (
            <GeofenceWizard
              map={mapRef.current}
              onCancel={() => onCloseCreate?.()}
              onComplete={handleWizardComplete}
              className="left-8 top-24"
            />
          )}
        </div>
      </div>
    </div>
  );
}
