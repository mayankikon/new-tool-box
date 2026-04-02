"use client";

import Image from "next/image";
import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useTheme } from "@/components/theme/app-theme-provider";
import {
  Search,
  MapPin,
  ChevronDown,
  Filter,
  List,
  Copy,
  Check,
  X,
  Sun,
  Moon,
  Satellite,
  Box,
  Square,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import Supercluster from "supercluster";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Input,
  InputContainer,
  InputIcon,
} from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownButton } from "@/components/ui/dropdown-button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MapboxMap, MapControlButton } from "@/components/ui/mapbox-map";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableHeaderCell } from "@/components/ui/table-header-cell";
import { TableSlotCell } from "@/components/ui/table-slot-cell";
import { Paginator } from "@/components/ui/paginator";
import { FiltersPanel } from "@/components/ui/filters-panel";
import { DesignSystemTableShellNoTabs } from "@/components/chrome/design-system-table-shell-no-tabs";
import {
  VehicleListPanel,
  type VehicleListPanelRow,
} from "@/components/ui/vehicle-list-panel";
import { InventoryVehicleDetailPanel } from "@/components/inventory/vehicle-detail-panel";
import { SendVehicleBrochureDialog } from "@/components/inventory/send-vehicle-brochure-dialog";
import { MAPBOX_BASEMAP_DARK_URL } from "@/lib/mapbox-basemap-styles";
import {
  BatteryIcon,
  KeyPairedIcon,
  LocationIcon,
  type VehicleListItemProps,
} from "@/components/ui/vehicle-list-item";
import { VehicleMapMarkerChip } from "@/components/ui/vehicle-map-marker-chip";
import {
  VehicleMapClusterMarker,
  type VehicleMapClusterMarkerVariant,
} from "@/components/ui/vehicle-map-cluster-marker";
import { MapMarkerHoverFrame } from "@/components/ui/map-marker-hover-frame";
import { VehicleMapMarkerPin } from "@/components/ui/vehicle-map-marker-pin";
import { cn } from "@/lib/utils";
import {
  DEALERSHIP_CENTER,
  ICON_HEADQUARTERS_DISPLAY_NAME,
  mainLotGeoJSON,
} from "@/lib/inventory/dealership-geofences";
import { resolveIconHeadquartersFromMap } from "@/lib/inventory/icon-headquarters-building";
import { mediaUrl } from "@/lib/media-paths";
import {
  INVENTORY_PANEL_VEHICLES,
  type InventoryVehicleRecord,
} from "@/lib/inventory/vehicle-list-data";
import {
  buildInventoryVehicleFeatureCollection,
  INVENTORY_LOT_AGE_TIER_HEX,
  INVENTORY_MAP_DEALERSHIP_LABEL_MAX_ZOOM,
  INVENTORY_MAP_VEHICLE_IMAGE_ZOOM,
  type InventoryVehicleMapFeatureProperties,
} from "@/lib/inventory/inventory-map-vehicle-features";
import type { InventoryMapBasemapAppearance } from "@/lib/inventory/inventory-map-highlight";
import { InventoryMapSelectionSpotlight } from "@/components/inventory/inventory-map-selection-spotlight";
function inventoryMapAppearanceFromTheme(
  resolvedTheme: string | undefined
): InventoryMapAppearance {
  return resolvedTheme === "light" ? "light" : "dark";
}

const MAP_FILTER_ICONS = {
  stockType: mediaUrl("icons/lead-icon-car.svg"),
  inventoryAge: mediaUrl("icons/lead-icon-inventory-age.svg"),
  batteryStatus: mediaUrl("icons/lead-icon-battery-full.svg"),
} as const;

function MapFilterIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={16}
      height={16}
      className="size-4 shrink-0 object-contain"
      draggable={false}
      unoptimized
    />
  );
}

interface InventoryContentProps {
  className?: string;
  viewMode?: InventoryViewMode;
  onViewModeChange?: (viewMode: InventoryViewMode) => void;
}

export type InventoryViewMode = "map" | "table";

export type InventoryMapAppearance = InventoryMapBasemapAppearance;

export const INVENTORY_MAP_STYLE_DARK = MAPBOX_BASEMAP_DARK_URL;
/** Mapbox Studio light basemap — use a token that can load this style (style owner account or public). */
export const INVENTORY_MAP_STYLE_LIGHT =
  "mapbox://styles/kingermayank/cmn3lx6iy002j01ruclwo3ri0";
/** Satellite imagery with street / place labels (Mapbox default). */
export const INVENTORY_MAP_STYLE_SATELLITE =
  "mapbox://styles/mapbox/satellite-streets-v12";

function getNextMapAppearance(
  current: InventoryMapAppearance
): InventoryMapAppearance {
  if (current === "dark") return "light";
  if (current === "light") return "satellite";
  return "dark";
}

function getMapAppearanceLabel(appearance: InventoryMapAppearance): string {
  switch (appearance) {
    case "light":
      return "Light map";
    case "satellite":
      return "Satellite map";
    default:
      return "Dark map";
  }
}

/** True when the basemap is light (studio / light-v11) so labels and clusters stay readable. */
function inventoryMapUsesLightBasemapUi(
  appearance: InventoryMapAppearance
): boolean {
  return appearance === "light";
}

const CAR_RELATED_POI_CLASSES = [
  "car",
  "car-rental",
  "car-repair",
  "fuel",
  "charging-station",
  "parking",
  "parking-garage",
];

type GeofenceHandlerBundle = {
  onEnter: (e: mapboxgl.MapLayerMouseEvent) => void;
  onMove: (e: mapboxgl.MapLayerMouseEvent) => void;
  onLeave: () => void;
  popup: mapboxgl.Popup;
};

let activeGeofenceHandlers: GeofenceHandlerBundle | null = null;

const INVENTORY_VEHICLES_SOURCE_ID = "inventory-vehicles";
/** Extruded buildings from Mapbox Streets `composite` / `building` (2D basemaps need this for real 3D massing). */
const INVENTORY_3D_BUILDINGS_LAYER_ID = "inventory-3d-buildings";
const INVENTORY_ICON_HQ_FILL_LAYER_ID = "inventory-icon-hq-footprint";
const ICON_HQ_GEO_SOURCE_ID = "icon-hq-building";
const ICON_HQ_GEO_EXTRUSION_LAYER_ID = "inventory-icon-hq-geo-extrusion";
const ICON_HQ_GEO_FILL_LAYER_ID = "inventory-icon-hq-geo-fill";

const COMPOSITE_BUILDING_EXTRUDE_FILTER: mapboxgl.FilterSpecification = [
  "any",
  ["==", ["get", "extrude"], true],
  ["==", ["get", "extrude"], "true"],
];
const INVENTORY_DEALERSHIP_LABEL_SOURCE_ID = "inventory-dealership-label";
const INV_LAYER_DEALERSHIP_NAME = "inventory-dealership-name";
const INV_LAYER_CLUSTERS = "inventory-clusters";
const INV_LAYER_CLUSTER_COUNT = "inventory-cluster-count";
const INV_LAYER_UNCLUSTERED = "inventory-unclustered";

const INVENTORY_MAP_CLUSTER_MAX_ZOOM = 17.49;
const INVENTORY_MAP_CLUSTER_RADIUS = 72;
const INVENTORY_MAP_MAX_HTML_MARKERS = 40;
const INVENTORY_MAP_DEALERSHIP_CLUSTER_ZOOM = 15.5;
const INVENTORY_MAP_VEHICLE_PIN_ZOOM = 17.5;
const INVENTORY_MAP_CLUSTER_DISCOVERY_ZOOM = 17.2;
const INVENTORY_MAP_SHIELD_DISCOVERY_ZOOM = 17.7;

type InventoryVehicleMarkerEntry = {
  vin: string;
  marker: mapboxgl.Marker;
  root: Root;
  props: InventoryVehicleMapFeatureProperties;
  mode: "chip" | "pin";
  renderKey: string;
};

type InventoryClusterMarkerEntry = {
  clusterId: number;
  marker: mapboxgl.Marker;
  root: Root;
  countLabel: string;
  mode: VehicleMapClusterMarkerVariant;
};

type InventoryVehicleSelectHandler = (vin: string) => void;

const inventoryVehicleMarkerEntries = new Map<string, InventoryVehicleMarkerEntry>();
const inventoryClusterMarkerEntries = new Map<number, InventoryClusterMarkerEntry>();
let inventoryVehicleMapInteractionCleanup: (() => void) | null = null;
/** Latest vehicle GeoJSON for spotlight / coordinate lookup (same source as HTML markers). */
let lastInventoryVehicleFeatureCollection: FeatureCollection<
  Point,
  InventoryVehicleMapFeatureProperties
> | null = null;

let inventoryVehicleMarkersReconcile: (() => void) | null = null;

const inventoryMapMarkerHighlightRef: { selectedVin: string | null } = {
  selectedVin: null,
};

function scheduleInventoryVehicleMarkersReconcile() {
  inventoryVehicleMarkersReconcile?.();
}

/** Resolves lot coordinates for a VIN from the last built inventory vehicle GeoJSON. */
export function getInventoryMapVehicleLngLatByVin(
  vin: string
): [number, number] | null {
  const fc = lastInventoryVehicleFeatureCollection;
  if (!fc) return null;
  const found = fc.features.find((f) => f.properties?.vin === vin);
  if (!found || found.geometry.type !== "Point") return null;
  const [lng, lat] = found.geometry.coordinates;
  return [lng, lat];
}
let inventoryVehicleClusterIndex: Supercluster<
  InventoryVehicleMapFeatureProperties,
  Supercluster.AnyProps
> | null = null;

let iconHeadquartersInteractionCleanup: (() => void) | null = null;
let iconHeadquartersMarker: mapboxgl.Marker | null = null;
let iconHeadquartersMarkerRoot: Root | null = null;
let iconHqHoveredId: string | number | null = null;
let iconHqSelectedId: string | number | null = null;
let iconHqBindGeneration = 0;

function removeIconHeadquartersMarker() {
  iconHeadquartersMarkerRoot?.unmount();
  iconHeadquartersMarkerRoot = null;
  iconHeadquartersMarker?.remove();
  iconHeadquartersMarker = null;
}

function ensureIconHeadquartersMarker(map: mapboxgl.Map, lngLat: [number, number]) {
  removeIconHeadquartersMarker();
  const wrap = document.createElement("div");
  wrap.className = "pointer-events-auto";
  wrap.setAttribute("role", "img");
  wrap.setAttribute("aria-label", ICON_HEADQUARTERS_DISPLAY_NAME);
  iconHeadquartersMarkerRoot = createRoot(wrap);
  iconHeadquartersMarkerRoot.render(
    <div className="flex flex-col items-center">
      <MapMarkerHoverFrame
        className="pointer-events-auto"
        backdropColor="#D946EF"
        backdropClassName="h-[52px] w-[52px] rounded-[18px]"
        backdropOffsetY={-4}
        contentClassName="drop-shadow-[0_8px_24px_rgba(168,85,247,0.45)]"
      >
        <div className="flex flex-col items-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-b from-violet-300 via-fuchsia-500 to-fuchsia-700 ring-2 ring-white/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
          </div>
          <div className="h-3 w-px bg-gradient-to-b from-violet-200/90 to-transparent" />
        </div>
      </MapMarkerHoverFrame>
      <div className="mt-1 max-w-[140px] text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
        {ICON_HEADQUARTERS_DISPLAY_NAME}
      </div>
    </div>
  );

  iconHeadquartersMarker = new mapboxgl.Marker({
    element: wrap,
    anchor: "bottom",
    offset: [0, 6],
  })
    .setLngLat(lngLat)
    .addTo(map);
}

function teardownIconHeadquartersMap(map: mapboxgl.Map) {
  iconHeadquartersInteractionCleanup?.();
  iconHeadquartersInteractionCleanup = null;

  if (iconHqHoveredId != null) {
    try {
      map.setFeatureState(
        { source: "composite", sourceLayer: "building", id: iconHqHoveredId },
        { hover: false }
      );
    } catch {
      /* style or tiles unloaded */
    }
    iconHqHoveredId = null;
  }
  if (iconHqSelectedId != null) {
    try {
      map.setFeatureState(
        { source: "composite", sourceLayer: "building", id: iconHqSelectedId },
        { selected: false, hover: false }
      );
    } catch {
      /* style or tiles unloaded */
    }
    iconHqSelectedId = null;
  }

  removeIconHeadquartersMarker();

  if (map.getLayer(ICON_HQ_GEO_FILL_LAYER_ID)) {
    map.removeLayer(ICON_HQ_GEO_FILL_LAYER_ID);
  }
  if (map.getLayer(ICON_HQ_GEO_EXTRUSION_LAYER_ID)) {
    map.removeLayer(ICON_HQ_GEO_EXTRUSION_LAYER_ID);
  }
  if (map.getSource(ICON_HQ_GEO_SOURCE_ID)) {
    map.removeSource(ICON_HQ_GEO_SOURCE_ID);
  }

  if (map.getLayer(INVENTORY_ICON_HQ_FILL_LAYER_ID)) {
    map.removeLayer(INVENTORY_ICON_HQ_FILL_LAYER_ID);
  }

  if (map.getLayer(INVENTORY_3D_BUILDINGS_LAYER_ID)) {
    try {
      map.setFilter(INVENTORY_3D_BUILDINGS_LAYER_ID, COMPOSITE_BUILDING_EXTRUDE_FILTER);
    } catch {
      /* no-op */
    }
  }
}

function removeInventoryVehicleMapOverlays(map: mapboxgl.Map) {
  inventoryVehicleMarkersReconcile = null;
  if (inventoryVehicleMapInteractionCleanup) {
    inventoryVehicleMapInteractionCleanup();
    inventoryVehicleMapInteractionCleanup = null;
  }
  for (const { marker, root } of inventoryClusterMarkerEntries.values()) {
    root.unmount();
    marker.remove();
  }
  inventoryClusterMarkerEntries.clear();
  for (const { marker, root } of inventoryVehicleMarkerEntries.values()) {
    root.unmount();
    marker.remove();
  }
  inventoryVehicleMarkerEntries.clear();
  lastInventoryVehicleFeatureCollection = null;
  inventoryVehicleClusterIndex = null;

  for (const layerId of [
    INV_LAYER_CLUSTER_COUNT,
    INV_LAYER_CLUSTERS,
    INV_LAYER_UNCLUSTERED,
    INV_LAYER_DEALERSHIP_NAME,
  ]) {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
  if (map.getSource(INVENTORY_VEHICLES_SOURCE_ID)) {
    map.removeSource(INVENTORY_VEHICLES_SOURCE_ID);
  }
  if (map.getSource(INVENTORY_DEALERSHIP_LABEL_SOURCE_ID)) {
    map.removeSource(INVENTORY_DEALERSHIP_LABEL_SOURCE_ID);
  }
}


/** Maps lot-age tier to vehicle marker stroke variant (teal / gold / red). */
function inventoryMapChipVariantIndexForAgeTier(
  ageTier: InventoryVehicleMapFeatureProperties["ageTier"]
): number {
  if (ageTier === "fresh") return 0;
  if (ageTier === "aging") return 1;
  return 2;
}

function inventoryVehicleMarkerRenderKey(
  props: InventoryVehicleMapFeatureProperties,
  markerMode: "chip" | "pin"
): string {
  const { selectedVin } = inventoryMapMarkerHighlightRef;
  return `${markerMode}|${props.vin}|${selectedVin ?? ""}`;
}

function inventoryVehicleMarkerSelectionFlags(vin: string): {
  isSelected: boolean;
  dimPeerMarkers: boolean;
} {
  const selectedVin = inventoryMapMarkerHighlightRef.selectedVin;
  const isSelected = selectedVin != null && vin === selectedVin;
  const dimPeerMarkers = selectedVin != null && vin !== selectedVin;
  return { isSelected, dimPeerMarkers };
}

/** Selected vehicle scales up (~1.1–1.2×); peers use {@link inventoryVehicleMarkerSelectionFlags} dimming. */
const INVENTORY_MAP_SELECTED_MARKER_SCALE_CLASS = "scale-[1.15]";

function InventoryVehicleMapMarkerBody({
  props,
  markerMode,
  isSelected,
  dimPeerMarkers,
}: {
  props: InventoryVehicleMapFeatureProperties;
  markerMode: "chip" | "pin";
  isSelected: boolean;
  dimPeerMarkers: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const pinTone =
    props.ageTier === "fresh" ? "teal" : props.ageTier === "aging" ? "gold" : "red";

  const motionClass = prefersReducedMotion
    ? ""
    : "transition-[transform,opacity,filter] duration-200 ease-out";

  return (
    <div
      className={cn(
        "pointer-events-none inline-flex origin-center items-center justify-center",
        motionClass,
        dimPeerMarkers && "opacity-[0.48] saturate-[0.62]",
        isSelected && INVENTORY_MAP_SELECTED_MARKER_SCALE_CLASS
      )}
    >
      {markerMode === "chip" ? (
        <VehicleMapMarkerChip
          variantIndex={inventoryMapChipVariantIndexForAgeTier(props.ageTier)}
          imageSrc={props.imageSrc}
          imageAlt={props.imageAlt}
          title={props.title}
          hoverOverlayColor={INVENTORY_LOT_AGE_TIER_HEX[props.ageTier]}
        />
      ) : (
        <VehicleMapMarkerPin
          tone={pinTone}
          title={props.title}
          hoverable
        />
      )}
    </div>
  );
}

function mountInventoryVehicleMapMarker(
  props: InventoryVehicleMapFeatureProperties,
  markerMode: "chip" | "pin",
  onVehicleSelect?: InventoryVehicleSelectHandler
): { wrap: HTMLDivElement; root: Root } {
  const wrap = document.createElement("div");
  wrap.style.cursor = "pointer";
  wrap.className = "pointer-events-auto inline-flex items-center justify-center";
  const root = createRoot(wrap);
  const selectionFlags = inventoryVehicleMarkerSelectionFlags(props.vin);
  root.render(
    <InventoryVehicleMapMarkerBody
      props={props}
      markerMode={markerMode}
      isSelected={selectionFlags.isSelected}
      dimPeerMarkers={selectionFlags.dimPeerMarkers}
    />
  );
  if (onVehicleSelect) {
    wrap.addEventListener("click", () => {
      onVehicleSelect(props.vin);
    });
  }
  return { wrap, root };
}


function renderInventoryVehicleMapMarker(
  root: Root,
  props: InventoryVehicleMapFeatureProperties,
  markerMode: "chip" | "pin"
) {
  const selectionFlags = inventoryVehicleMarkerSelectionFlags(props.vin);
  root.render(
    <InventoryVehicleMapMarkerBody
      props={props}
      markerMode={markerMode}
      isSelected={selectionFlags.isSelected}
      dimPeerMarkers={selectionFlags.dimPeerMarkers}
    />
  );
}

function inventoryClusterMarkerVariantForZoom(
  zoom: number
): VehicleMapClusterMarkerVariant {
  return zoom <= INVENTORY_MAP_DEALERSHIP_CLUSTER_ZOOM
    ? "group-active"
    : "number-default";
}

function mountInventoryVehicleClusterMarker(
  countLabel: string,
  variant: VehicleMapClusterMarkerVariant
): { wrap: HTMLDivElement; root: Root } {
  const wrap = document.createElement("div");
  wrap.style.cursor = "pointer";
  wrap.style.zIndex = "2";
  const root = createRoot(wrap);
  root.render(
    <div className="pointer-events-none">
      <VehicleMapClusterMarker countLabel={countLabel} variant={variant} hoverable />
    </div>
  );
  return { wrap, root };
}

function renderInventoryVehicleClusterMarker(
  root: Root,
  countLabel: string,
  variant: VehicleMapClusterMarkerVariant
) {
  root.render(
    <div className="pointer-events-none">
      <VehicleMapClusterMarker countLabel={countLabel} variant={variant} hoverable />
    </div>
  );
}

function expandInventoryCluster(
  map: mapboxgl.Map,
  clusterId: number,
  coords: [number, number],
  variant: VehicleMapClusterMarkerVariant
) {
  const src = map.getSource(
    INVENTORY_VEHICLES_SOURCE_ID
  ) as mapboxgl.GeoJSONSource | undefined;
  if (!src) return;
  src.getClusterExpansionZoom(clusterId, (err, expansionZoom) => {
    if (err) return;
    const expansionBase = (expansionZoom ?? map.getZoom()) + 0.35;
    const nextZoom =
      variant === "group-active"
        ? Math.min(
            Math.max(expansionBase, INVENTORY_MAP_CLUSTER_DISCOVERY_ZOOM),
            INVENTORY_MAP_VEHICLE_PIN_ZOOM - 0.01
          )
        : Math.min(
            Math.max(expansionBase, INVENTORY_MAP_SHIELD_DISCOVERY_ZOOM),
            INVENTORY_MAP_VEHICLE_IMAGE_ZOOM - 0.01
          );
    map.easeTo({
      center: coords,
      zoom: nextZoom,
      duration: 360,
    });
  });
}

function reconcileInventoryVehicleClusterMarkers(map: mapboxgl.Map) {
  const zoom = map.getZoom();
  if (
    zoom > INVENTORY_MAP_CLUSTER_MAX_ZOOM ||
    !inventoryVehicleClusterIndex
  ) {
    for (const { marker, root } of inventoryClusterMarkerEntries.values()) {
      root.unmount();
      marker.remove();
    }
    inventoryClusterMarkerEntries.clear();
    return;
  }

  const bounds = map.getBounds();
  if (!bounds) {
    return;
  }
  const clusterFeatures = inventoryVehicleClusterIndex.getClusters(
    [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ],
    Math.floor(zoom)
  );
  const mode = inventoryClusterMarkerVariantForZoom(zoom);
  const seenClusterIds = new Set<number>();

  for (const feature of clusterFeatures) {
    if (feature.geometry.type !== "Point") continue;
    const clusterProps = feature.properties as Record<string, unknown> | undefined;
    if (!clusterProps || !("cluster" in clusterProps) || !clusterProps.cluster) {
      continue;
    }
    const clusterId = clusterProps.cluster_id as number;
    if (seenClusterIds.has(clusterId)) {
      continue;
    }
    seenClusterIds.add(clusterId);

    const coords = feature.geometry.coordinates as [number, number];
    const countLabel = String(
      clusterProps.point_count_abbreviated ??
        clusterProps.point_count ??
        ""
    );
    const existing = inventoryClusterMarkerEntries.get(clusterId);
    if (existing) {
      existing.marker.setLngLat(coords);
      if (existing.countLabel !== countLabel || existing.mode !== mode) {
        renderInventoryVehicleClusterMarker(existing.root, countLabel, mode);
        existing.countLabel = countLabel;
        existing.mode = mode;
      }
      continue;
    }

    const { wrap, root } = mountInventoryVehicleClusterMarker(countLabel, mode);
    const marker = new mapboxgl.Marker({ element: wrap, anchor: "center" })
      .setLngLat(coords)
      .addTo(map);
    wrap.addEventListener("click", () => {
      expandInventoryCluster(map, clusterId, coords, mode);
    });
    inventoryClusterMarkerEntries.set(clusterId, {
      clusterId,
      marker,
      root,
      countLabel,
      mode,
    });
  }

  for (const [clusterId, entry] of inventoryClusterMarkerEntries.entries()) {
    if (!seenClusterIds.has(clusterId)) {
      entry.root.unmount();
      entry.marker.remove();
      inventoryClusterMarkerEntries.delete(clusterId);
    }
  }
}

function reconcileInventoryVehicleHtmlMarkers(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance,
  onVehicleSelect?: InventoryVehicleSelectHandler
) {
  const fc = lastInventoryVehicleFeatureCollection;
  const zoom = map.getZoom();
  if (!fc || zoom < INVENTORY_MAP_VEHICLE_PIN_ZOOM) {
    for (const { marker, root } of inventoryVehicleMarkerEntries.values()) {
      root.unmount();
      marker.remove();
    }
    inventoryVehicleMarkerEntries.clear();
    return;
  }
  const markerMode = zoom >= INVENTORY_MAP_VEHICLE_IMAGE_ZOOM ? "chip" : "pin";

  const titleColor = inventoryMapUsesLightBasemapUi(appearance)
    ? "#0a0a0a"
    : "#fafafa";
  const subColor = inventoryMapUsesLightBasemapUi(appearance)
    ? "#404040"
    : appearance === "satellite"
      ? "#d4d4d8"
      : "#a1a1aa";

  const bounds = map.getBounds();
  if (!bounds) {
    return;
  }
  let count = 0;
  const nextVisibleVins = new Set<string>();
  for (const feature of fc.features) {
    if (count >= INVENTORY_MAP_MAX_HTML_MARKERS) break;
    const [lng, lat] = feature.geometry.coordinates;
    if (!bounds.contains(new mapboxgl.LngLat(lng, lat))) continue;

    const props = feature.properties;
    nextVisibleVins.add(props.vin);
    const nextRenderKey = inventoryVehicleMarkerRenderKey(props, markerMode);
    const existing = inventoryVehicleMarkerEntries.get(props.vin);
    if (existing) {
      existing.marker.setLngLat([lng, lat]);
      existing.props = props;
      if (existing.mode !== markerMode) {
        renderInventoryVehicleMapMarker(existing.root, props, markerMode);
        existing.mode = markerMode;
        existing.renderKey = nextRenderKey;
      } else if (existing.renderKey !== nextRenderKey) {
        renderInventoryVehicleMapMarker(existing.root, props, markerMode);
        existing.renderKey = nextRenderKey;
      }
      const selectedVin = inventoryMapMarkerHighlightRef.selectedVin;
      const el = existing.marker.getElement();
      el.style.zIndex =
        selectedVin != null && props.vin === selectedVin
          ? "50"
          : selectedVin != null
            ? "1"
            : "";
    } else {
      const { wrap: el, root } = mountInventoryVehicleMapMarker(
        props,
        markerMode,
        onVehicleSelect
      );
      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);

      const selectedVin = inventoryMapMarkerHighlightRef.selectedVin;
      el.style.zIndex =
        selectedVin != null && props.vin === selectedVin
          ? "50"
          : selectedVin != null
            ? "1"
            : "";

      inventoryVehicleMarkerEntries.set(props.vin, {
        vin: props.vin,
        marker,
        root,
        props,
        mode: markerMode,
        renderKey: nextRenderKey,
      });
    }
    count += 1;
  }

  for (const [vin, entry] of inventoryVehicleMarkerEntries.entries()) {
    if (!nextVisibleVins.has(vin)) {
      entry.root.unmount();
      entry.marker.remove();
      inventoryVehicleMarkerEntries.delete(vin);
    }
  }
}

function addInventoryVehicleMapOverlays(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance,
  vehicleFc: FeatureCollection<Point, InventoryVehicleMapFeatureProperties>,
  onVehicleSelect?: InventoryVehicleSelectHandler
) {
  const mainLot = mainLotGeoJSON.features[0];
  const dealershipName =
    mainLot?.properties?.name ?? "Dealership";

  map.addSource(INVENTORY_DEALERSHIP_LABEL_SOURCE_ID, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: dealershipName },
          geometry: {
            type: "Point",
            coordinates: [...DEALERSHIP_CENTER] as [number, number],
          },
        },
      ],
    },
  });

  const labelTextColor = inventoryMapUsesLightBasemapUi(appearance)
    ? "#0a0a0a"
    : appearance === "satellite"
      ? "#ffffff"
      : "#f4f4f5";
  const labelHaloColor =
    appearance === "satellite" || appearance === "dark"
      ? "rgba(0,0,0,0.75)"
      : "rgba(255,255,255,0.9)";

  map.addLayer({
    id: INV_LAYER_DEALERSHIP_NAME,
    type: "symbol",
    source: INVENTORY_DEALERSHIP_LABEL_SOURCE_ID,
    maxzoom: INVENTORY_MAP_DEALERSHIP_LABEL_MAX_ZOOM,
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
      "text-size": 15,
      "text-anchor": "center",
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": labelTextColor,
      "text-halo-color": labelHaloColor,
      "text-halo-width":
        appearance === "satellite" || appearance === "dark" ? 2 : 1.2,
    },
  });

  if (vehicleFc.features.length === 0) {
    lastInventoryVehicleFeatureCollection = vehicleFc;
    const reconcile = () => {
      reconcileInventoryVehicleClusterMarkers(map);
      reconcileInventoryVehicleHtmlMarkers(map, appearance, onVehicleSelect);
    };
    inventoryVehicleMarkersReconcile = reconcile;
    map.on("zoom", reconcile);
    map.on("moveend", reconcile);
    inventoryVehicleMapInteractionCleanup = () => {
      map.off("zoom", reconcile);
      map.off("moveend", reconcile);
      inventoryVehicleMarkersReconcile = null;
    };
    reconcile();
    return;
  }

  map.addSource(INVENTORY_VEHICLES_SOURCE_ID, {
    type: "geojson",
    data: vehicleFc,
    cluster: true,
    clusterMaxZoom: INVENTORY_MAP_CLUSTER_MAX_ZOOM,
    clusterRadius: INVENTORY_MAP_CLUSTER_RADIUS,
  });

  lastInventoryVehicleFeatureCollection = vehicleFc;
  inventoryVehicleClusterIndex = new Supercluster<
    InventoryVehicleMapFeatureProperties,
    Supercluster.AnyProps
  >({
    maxZoom: Math.floor(INVENTORY_MAP_CLUSTER_MAX_ZOOM),
    radius: INVENTORY_MAP_CLUSTER_RADIUS,
  }).load(vehicleFc.features);

  const tierColorExpr: mapboxgl.Expression = [
    "match",
    ["get", "ageTier"],
    "fresh",
    INVENTORY_LOT_AGE_TIER_HEX.fresh,
    "aging",
    INVENTORY_LOT_AGE_TIER_HEX.aging,
    "stale",
    INVENTORY_LOT_AGE_TIER_HEX.stale,
    "#737373",
  ];

  const clusterFill = inventoryMapUsesLightBasemapUi(appearance)
    ? "rgba(21, 93, 252, 0.92)"
    : appearance === "satellite"
      ? "rgba(255, 255, 255, 0.95)"
      : "rgba(126, 176, 255, 0.95)";
  const clusterStroke = inventoryMapUsesLightBasemapUi(appearance)
    ? "#ffffff"
    : appearance === "satellite"
      ? "rgba(0,0,0,0.45)"
      : "rgba(15, 23, 32, 0.85)";
  const countTextColor = inventoryMapUsesLightBasemapUi(appearance)
    ? "#ffffff"
    : appearance === "satellite"
      ? "#0a0a0a"
      : "#1a1f26";

  try {
    map.addLayer({
      id: INV_LAYER_CLUSTERS,
      type: "circle",
      source: INVENTORY_VEHICLES_SOURCE_ID,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": clusterFill,
        "circle-stroke-width": 2,
        "circle-stroke-color": clusterStroke,
        // Keep the backing layer technically rendered so queryRenderedFeatures
        // can resolve cluster geometry for the HTML markers.
        "circle-opacity": 0.01,
        "circle-stroke-opacity": 0.01,
        "circle-radius": [
          "step",
          ["get", "point_count"],
          18,
          10,
          22,
          24,
          28,
        ],
      },
    });

    map.addLayer({
      id: INV_LAYER_CLUSTER_COUNT,
      type: "symbol",
      source: INVENTORY_VEHICLES_SOURCE_ID,
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Bold", "Arial Unicode MS Bold"],
        "text-size": 13,
      },
      paint: {
        "text-color": countTextColor,
        "text-opacity": 0.01,
      },
    });

    map.addLayer({
      id: INV_LAYER_UNCLUSTERED,
      type: "circle",
      source: INVENTORY_VEHICLES_SOURCE_ID,
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": tierColorExpr,
        "circle-radius": 9,
        "circle-stroke-width": 2,
        "circle-stroke-color": inventoryMapUsesLightBasemapUi(appearance)
          ? "rgba(255,255,255,0.95)"
          : "rgba(15,23,32,0.9)",
        "circle-opacity": [
          "step",
          ["zoom"],
          1,
          INVENTORY_MAP_VEHICLE_PIN_ZOOM,
          0,
        ],
        "circle-stroke-opacity": [
          "step",
          ["zoom"],
          1,
          INVENTORY_MAP_VEHICLE_PIN_ZOOM,
          0,
        ],
      },
    });
  } catch {
    // Duplicate layer if style raced a reload — teardown will reset.
  }

  const reconcile = () => {
    reconcileInventoryVehicleClusterMarkers(map);
    reconcileInventoryVehicleHtmlMarkers(map, appearance, onVehicleSelect);
  };
  inventoryVehicleMarkersReconcile = reconcile;
  map.on("zoom", reconcile);
  map.on("moveend", reconcile);

  const onClusterClick = (e: mapboxgl.MapLayerMouseEvent) => {
    const feat = e.features?.[0];
    if (!feat || feat.geometry.type !== "Point") return;
    const pointGeometry = feat.geometry;
    const clusterId = feat.properties?.cluster_id as number | undefined;
    if (clusterId == null) return;
    const variant = inventoryClusterMarkerVariantForZoom(map.getZoom());
    expandInventoryCluster(
      map,
      clusterId,
      pointGeometry.coordinates as [number, number],
      variant
    );
  };

  const onUnclusteredClick = (e: mapboxgl.MapLayerMouseEvent) => {
    const feat = e.features?.[0];
    if (!feat || feat.geometry.type !== "Point") return;
    const props = feat.properties as unknown as InventoryVehicleMapFeatureProperties;
    onVehicleSelect?.(props.vin);
  };

  const onClusterPointerEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const onClusterPointerLeave = () => {
    map.getCanvas().style.cursor = "";
  };
  const onUnclusteredPointerEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const onUnclusteredPointerLeave = () => {
    map.getCanvas().style.cursor = "";
  };

  map.on("click", INV_LAYER_CLUSTERS, onClusterClick);
  map.on("click", INV_LAYER_UNCLUSTERED, onUnclusteredClick);
  map.on("mouseenter", INV_LAYER_CLUSTERS, onClusterPointerEnter);
  map.on("mouseleave", INV_LAYER_CLUSTERS, onClusterPointerLeave);
  map.on("mouseenter", INV_LAYER_UNCLUSTERED, onUnclusteredPointerEnter);
  map.on("mouseleave", INV_LAYER_UNCLUSTERED, onUnclusteredPointerLeave);

  inventoryVehicleMapInteractionCleanup = () => {
    map.off("zoom", reconcile);
    map.off("moveend", reconcile);
    inventoryVehicleMarkersReconcile = null;
    map.off("click", INV_LAYER_CLUSTERS, onClusterClick);
    map.off("click", INV_LAYER_UNCLUSTERED, onUnclusteredClick);
    map.off("mouseenter", INV_LAYER_CLUSTERS, onClusterPointerEnter);
    map.off("mouseleave", INV_LAYER_CLUSTERS, onClusterPointerLeave);
    map.off("mouseenter", INV_LAYER_UNCLUSTERED, onUnclusteredPointerEnter);
    map.off("mouseleave", INV_LAYER_UNCLUSTERED, onUnclusteredPointerLeave);
  };

  reconcile();
}

function teardownInventoryMapOverlays(map: mapboxgl.Map) {
  teardownIconHeadquartersMap(map);
  removeInventoryVehicleMapOverlays(map);
  if (activeGeofenceHandlers) {
    map.off("mouseenter", "geofences-hover", activeGeofenceHandlers.onEnter);
    map.off("mousemove", "geofences-hover", activeGeofenceHandlers.onMove);
    map.off("mouseleave", "geofences-hover", activeGeofenceHandlers.onLeave);
    activeGeofenceHandlers.popup.remove();
    activeGeofenceHandlers = null;
  }
  if (map.getLayer(INVENTORY_3D_BUILDINGS_LAYER_ID)) {
    map.removeLayer(INVENTORY_3D_BUILDINGS_LAYER_ID);
  }
  if (map.getLayer("road-highlight")) {
    map.removeLayer("road-highlight");
  }
  if (map.getLayer("geofences-hover")) {
    map.removeLayer("geofences-hover");
  }
  if (map.getLayer("geofences-line")) {
    map.removeLayer("geofences-line");
  }
  if (map.getLayer("geofences-fill")) {
    map.removeLayer("geofences-fill");
  }
  if (map.getSource("geofences")) {
    map.removeSource("geofences");
  }
}

function addGeofenceInteractivity(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance
) {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    className: inventoryMapUsesLightBasemapUi(appearance)
      ? "geofence-popup geofence-popup--light"
      : "geofence-popup",
    offset: 12,
  });

  const onEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };

  const onMove = () => {};

  const onLeave = () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  };

  map.on("mouseenter", "geofences-hover", onEnter);
  map.on("mousemove", "geofences-hover", onMove);
  map.on("mouseleave", "geofences-hover", onLeave);

  activeGeofenceHandlers = { onEnter, onMove, onLeave, popup };
}

function addGeofenceLayers(
  map: mapboxgl.Map,
  geofences: typeof mainLotGeoJSON,
  appearance: InventoryMapAppearance
) {
  const fillColor = inventoryMapUsesLightBasemapUi(appearance)
    ? "#155dfc"
    : appearance === "satellite"
      ? "#ffffff"
      : "#7eb0ff";
  const fillOpacity = inventoryMapUsesLightBasemapUi(appearance)
    ? 0.14
    : appearance === "satellite"
      ? 0.22
      : 0.22;
  const lineColor = inventoryMapUsesLightBasemapUi(appearance)
    ? "#155dfc"
    : appearance === "satellite"
      ? "#ffffff"
      : "#c5ddff";

  map.addSource("geofences", {
    type: "geojson",
    data: geofences,
  });

  map.addLayer({
    id: "geofences-fill",
    type: "fill",
    source: "geofences",
    paint: {
      "fill-color": fillColor,
      "fill-opacity": fillOpacity,
    },
  });

  map.addLayer({
    id: "geofences-line",
    type: "line",
    source: "geofences",
    paint: {
      "line-color": lineColor,
      "line-width": appearance === "satellite" ? 2.5 : 2,
      "line-opacity": 0.92,
    },
  });

  map.addLayer({
    id: "geofences-hover",
    type: "fill",
    source: "geofences",
    paint: {
      "fill-color": "#000000",
      "fill-opacity": 0,
    },
  });

  addGeofenceInteractivity(map, appearance);
}

const ROAD_HIGHLIGHT_INSERT_BEFORE_IDS = [
  "building-fill",
  "3d-buildings",
  "building-extrusion",
  "building",
  "poi-label",
  "place-label-city",
  "water-label",
] as const;

function resolveRoadHighlightBeforeId(map: mapboxgl.Map): string | undefined {
  const layers = map.getStyle().layers ?? [];
  for (const id of ROAD_HIGHLIGHT_INSERT_BEFORE_IDS) {
    if (layers.some((l) => l.id === id)) return id;
  }
  const firstLabelLayer = layers.find((layer) => {
    if (layer.type !== "symbol") return false;
    const sourceLayer = (layer as mapboxgl.SymbolLayer)["source-layer"];
    return typeof sourceLayer === "string" && sourceLayer.endsWith("_label");
  });
  return firstLabelLayer?.id;
}

function addRoadHighlighting(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance
) {
  const beforeId = resolveRoadHighlightBeforeId(map);
  if (!beforeId) return;

  const lineColor: mapboxgl.Expression =
    inventoryMapUsesLightBasemapUi(appearance)
      ? [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          "rgba(37, 99, 235, 0.32)",
          14,
          "rgba(29, 78, 216, 0.42)",
          18,
          "rgba(30, 64, 175, 0.52)",
        ]
      : appearance === "satellite"
        ? [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            "rgba(255, 255, 255, 0.35)",
            14,
            "rgba(255, 255, 255, 0.45)",
            18,
            "rgba(255, 255, 255, 0.55)",
          ]
        : [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            "rgba(120, 140, 180, 0.35)",
            14,
            "rgba(140, 160, 200, 0.5)",
            18,
            "rgba(160, 180, 220, 0.6)",
          ];

  map.addLayer(
    {
      id: "road-highlight",
      type: "line",
      source: "composite",
      "source-layer": "road",
      minzoom: 10,
      paint: {
        "line-color": lineColor,
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          10,
          ["match", ["get", "class"], ["motorway", "trunk", "primary"], 3, 1.5],
          14,
          ["match", ["get", "class"], ["motorway", "trunk", "primary"], 6, 3],
          18,
          ["match", ["get", "class"], ["motorway", "trunk", "primary"], 12, 6],
        ],
        "line-opacity": 0.85,
      },
    },
    beforeId
  );
}

function filterPoiLayers(map: mapboxgl.Map) {
  const style = map.getStyle();
  const layers = style.layers ?? [];
  const carFilter: mapboxgl.Expression = [
    "in",
    ["get", "class"],
    ["literal", CAR_RELATED_POI_CLASSES],
  ];

  for (const layer of layers) {
    if (layer.type !== "symbol") continue;
    const sourceLayer = (layer as mapboxgl.SymbolLayer)["source-layer"];
    if (sourceLayer !== "poi_label") continue;

    try {
      map.setFilter(layer.id, carFilter);
    } catch {
      // Layer may not support filters or have different schema
    }
  }
}

function setupInventoryMap(
  map: mapboxgl.Map,
  geofences: typeof mainLotGeoJSON,
  appearance: InventoryMapAppearance,
  onVehicleSelect?: InventoryVehicleSelectHandler
) {
  teardownInventoryMapOverlays(map);
  addGeofenceLayers(map, geofences, appearance);
  addRoadHighlighting(map, appearance);
  filterPoiLayers(map);

  const mainLotGeometry = geofences.features[0]?.geometry;
  const mainLotRing =
    mainLotGeometry?.type === "Polygon"
      ? mainLotGeometry.coordinates[0]
      : null;
  const inventoryVehicleFeatures: FeatureCollection<
    Point,
    InventoryVehicleMapFeatureProperties
  > = mainLotRing
    ? buildInventoryVehicleFeatureCollection(
        INVENTORY_PANEL_VEHICLES,
        mainLotRing
      )
    : { type: "FeatureCollection", features: [] };
  addInventoryVehicleMapOverlays(
    map,
    appearance,
    inventoryVehicleFeatures,
    onVehicleSelect
  );
}

const PANEL_WIDTH_PX = 400;
const FILTER_PANEL_WIDTH_PX = 320;
const PANEL_DURATION_S = 0.25;
const PANEL_EASE = [0.32, 0.72, 0, 1] as const;
const INVENTORY_PAGE_SIZE = 14;
/** Map + outer chrome — matches dark basemap letterboxing and app shell. */
const MAP_SURFACE_CLASS_DARK = "bg-[#1a1f26]";
const MAP_SURFACE_CLASS_LIGHT = "bg-[#F2F2F2]";
/** Tighter framing on dealership HQ (1161 W Corporate Dr, Arlington); global map default remains 16. */
const INVENTORY_MAP_INITIAL_ZOOM = 18;

const INVENTORY_MAP_TERRAIN_SOURCE_ID = "inventory-mapbox-dem";
const INVENTORY_MAP_3D_PITCH = 56;
const INVENTORY_MAP_3D_TERRAIN_EXAGGERATION = 1.2;

function ensureInventoryMapTerrainSource(map: mapboxgl.Map) {
  if (map.getSource(INVENTORY_MAP_TERRAIN_SOURCE_ID)) return;
  map.addSource(INVENTORY_MAP_TERRAIN_SOURCE_ID, {
    type: "raster-dem",
    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    tileSize: 512,
    maxzoom: 14,
  });
}

function resolveInventoryMapInsertBeforeFirstLabelLayer(
  map: mapboxgl.Map
): string | undefined {
  const layers = map.getStyle().layers ?? [];
  for (const layer of layers) {
    if (layer.type !== "symbol") continue;
    const sourceLayer = (layer as mapboxgl.SymbolLayer)["source-layer"];
    if (typeof sourceLayer === "string" && sourceLayer.includes("label")) {
      return layer.id;
    }
  }
  const firstSymbol = layers.find((layer) => layer.type === "symbol");
  return firstSymbol?.id;
}

function removeInventoryMap3dBuildingsLayer(map: mapboxgl.Map) {
  if (map.getLayer(INVENTORY_3D_BUILDINGS_LAYER_ID)) {
    map.removeLayer(INVENTORY_3D_BUILDINGS_LAYER_ID);
  }
}

type InventoryExtrusionPaint = NonNullable<
  mapboxgl.FillExtrusionLayerSpecification["paint"]
>;

function getDefaultInventoryBuildingExtrusionColor(
  appearance: InventoryMapAppearance
): string {
  return inventoryMapUsesLightBasemapUi(appearance)
    ? "#e8e5e1"
    : appearance === "satellite"
      ? "#d4d4d8"
      : "#7b8fb8";
}

function buildInventoryMapBuildingsExtrusionPaint(
  appearance: InventoryMapAppearance
): InventoryExtrusionPaint {
  const defaultColor = getDefaultInventoryBuildingExtrusionColor(appearance);
  const extrusionOpacity = appearance === "satellite" ? 0.72 : 0.88;

  return {
    "fill-extrusion-color": defaultColor,
    "fill-extrusion-height": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14,
      0,
      14.05,
      ["coalesce", ["get", "height"], 0],
    ],
    "fill-extrusion-base": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14,
      0,
      14.05,
      ["coalesce", ["get", "min_height"], 0],
    ],
    "fill-extrusion-opacity": extrusionOpacity,
    "fill-extrusion-vertical-gradient": true,
    "fill-extrusion-emissive-strength": 0,
    "fill-extrusion-ambient-occlusion-intensity": 0.34,
    "fill-extrusion-ambient-occlusion-radius": 12,
  };
}

/** Manual `ICON_HEADQUARTERS_BUILDING_IDS_OVERRIDE` only — uses composite `feature-state`. */
function buildInventoryMapBuildingsExtrusionPaintWithHqFeatureState(
  appearance: InventoryMapAppearance,
  hqIds: (string | number)[]
): InventoryExtrusionPaint {
  if (hqIds.length === 0) {
    return buildInventoryMapBuildingsExtrusionPaint(appearance);
  }
  const defaultColor = getDefaultInventoryBuildingExtrusionColor(appearance);
  const extrusionOpacity = appearance === "satellite" ? 0.72 : 0.88;
  const inHqList: mapboxgl.Expression = ["in", ["id"], ["literal", hqIds]];

  return {
    "fill-extrusion-color": [
      "case",
      [
        "all",
        inHqList,
        ["boolean", ["feature-state", "selected"], false],
      ],
      "#d946ef",
      ["all", inHqList, ["boolean", ["feature-state", "hover"], false]],
      "#a855f7",
      ["all", inHqList],
      "#6d28d9",
      defaultColor,
    ],
    "fill-extrusion-height": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14,
      0,
      14.05,
      ["coalesce", ["get", "height"], 0],
    ],
    "fill-extrusion-base": [
      "interpolate",
      ["linear"],
      ["zoom"],
      14,
      0,
      14.05,
      ["coalesce", ["get", "min_height"], 0],
    ],
    "fill-extrusion-opacity": extrusionOpacity,
    "fill-extrusion-vertical-gradient": true,
    "fill-extrusion-emissive-strength": [
      "case",
      [
        "all",
        inHqList,
        ["boolean", ["feature-state", "selected"], false],
      ],
      0.62,
      ["all", inHqList, ["boolean", ["feature-state", "hover"], false]],
      0.38,
      ["all", inHqList],
      0.14,
      0,
    ],
    "fill-extrusion-ambient-occlusion-intensity": 0.34,
    "fill-extrusion-ambient-occlusion-radius": 12,
  };
}

function applyInventoryMapBuildingsExtrusionPaintWithHqFeatureState(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance,
  hqIds: (string | number)[]
) {
  if (!map.getLayer(INVENTORY_3D_BUILDINGS_LAYER_ID)) return;
  const paint = buildInventoryMapBuildingsExtrusionPaintWithHqFeatureState(
    appearance,
    hqIds
  );
  (Object.keys(paint) as (keyof InventoryExtrusionPaint)[]).forEach((key) => {
    const value = paint[key];
    if (value !== undefined) {
      map.setPaintProperty(INVENTORY_3D_BUILDINGS_LAYER_ID, key, value);
    }
  });
}

function applyMainBuildingsExcludeHqPolygon(
  map: mapboxgl.Map,
  hqPolygon: Polygon | null
) {
  if (!map.getLayer(INVENTORY_3D_BUILDINGS_LAYER_ID)) return;
  try {
    if (!hqPolygon) {
      map.setFilter(INVENTORY_3D_BUILDINGS_LAYER_ID, COMPOSITE_BUILDING_EXTRUDE_FILTER);
      return;
    }
    map.setFilter(INVENTORY_3D_BUILDINGS_LAYER_ID, [
      "all",
      COMPOSITE_BUILDING_EXTRUDE_FILTER,
      ["!", ["within", ["literal", hqPolygon]]],
    ]);
  } catch {
    map.setFilter(INVENTORY_3D_BUILDINGS_LAYER_ID, COMPOSITE_BUILDING_EXTRUDE_FILTER);
  }
}

type IconHqGeoVisualState = "idle" | "hover" | "selected";

function applyIconHqGeoLayerPaints(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance,
  is3D: boolean,
  state: IconHqGeoVisualState
) {
  const extrusionOpacity = appearance === "satellite" ? 0.88 : 0.92;
  const fillOpacity = appearance === "satellite" ? 0.88 : 0.9;

  const extrusion =
    state === "selected"
      ? { color: "#d946ef", emissive: 0.62 }
      : state === "hover"
        ? { color: "#a855f7", emissive: 0.38 }
        : { color: "#6d28d9", emissive: 0.16 };

  const fill =
    state === "selected"
      ? "rgba(217, 70, 239, 0.82)"
      : state === "hover"
        ? "rgba(168, 85, 247, 0.65)"
        : "rgba(109, 40, 217, 0.48)";

  if (is3D && map.getLayer(ICON_HQ_GEO_EXTRUSION_LAYER_ID)) {
    map.setPaintProperty(
      ICON_HQ_GEO_EXTRUSION_LAYER_ID,
      "fill-extrusion-color",
      extrusion.color
    );
    map.setPaintProperty(
      ICON_HQ_GEO_EXTRUSION_LAYER_ID,
      "fill-extrusion-emissive-strength",
      extrusion.emissive
    );
    map.setPaintProperty(
      ICON_HQ_GEO_EXTRUSION_LAYER_ID,
      "fill-extrusion-opacity",
      extrusionOpacity
    );
  }
  if (!is3D && map.getLayer(ICON_HQ_GEO_FILL_LAYER_ID)) {
    map.setPaintProperty(ICON_HQ_GEO_FILL_LAYER_ID, "fill-color", fill);
    map.setPaintProperty(ICON_HQ_GEO_FILL_LAYER_ID, "fill-opacity", fillOpacity);
  }
}

function ensureIconHqGeoLayers(
  map: mapboxgl.Map,
  beforeId: string | undefined,
  footprint: Feature<Polygon, { height: number; min_height: number }>,
  is3D: boolean,
  appearance: InventoryMapAppearance
) {
  const collection: FeatureCollection = {
    type: "FeatureCollection",
    features: [footprint],
  };

  const existing = map.getSource(ICON_HQ_GEO_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
  if (existing) {
    existing.setData(collection);
  } else {
    map.addSource(ICON_HQ_GEO_SOURCE_ID, { type: "geojson", data: collection });
  }

  if (map.getLayer(ICON_HQ_GEO_FILL_LAYER_ID)) {
    map.removeLayer(ICON_HQ_GEO_FILL_LAYER_ID);
  }
  if (map.getLayer(ICON_HQ_GEO_EXTRUSION_LAYER_ID)) {
    map.removeLayer(ICON_HQ_GEO_EXTRUSION_LAYER_ID);
  }

  const extrusionOpacity = appearance === "satellite" ? 0.88 : 0.92;

  const extrusionLayer = {
    id: ICON_HQ_GEO_EXTRUSION_LAYER_ID,
    type: "fill-extrusion" as const,
    source: ICON_HQ_GEO_SOURCE_ID,
    minzoom: 14,
    layout: {
      visibility: is3D ? ("visible" as const) : ("none" as const),
    },
    paint: {
      "fill-extrusion-color": "#6d28d9",
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "min_height"],
      "fill-extrusion-opacity": extrusionOpacity,
      "fill-extrusion-vertical-gradient": true,
      "fill-extrusion-emissive-strength": 0.16,
      "fill-extrusion-ambient-occlusion-intensity": 0.34,
      "fill-extrusion-ambient-occlusion-radius": 12,
    },
  };

  const fillLayer = {
    id: ICON_HQ_GEO_FILL_LAYER_ID,
    type: "fill" as const,
    source: ICON_HQ_GEO_SOURCE_ID,
    minzoom: 14,
    layout: {
      visibility: is3D ? ("none" as const) : ("visible" as const),
    },
    paint: {
      "fill-color": "rgba(109, 40, 217, 0.48)",
      "fill-opacity": appearance === "satellite" ? 0.88 : 0.9,
    },
  };

  try {
    if (beforeId) {
      map.addLayer(extrusionLayer as unknown as mapboxgl.AnyLayer, beforeId);
      map.addLayer(fillLayer as unknown as mapboxgl.AnyLayer, beforeId);
    } else {
      map.addLayer(extrusionLayer as unknown as mapboxgl.AnyLayer);
      map.addLayer(fillLayer as unknown as mapboxgl.AnyLayer);
    }
  } catch {
    /* no-op */
  }

  applyIconHqGeoLayerPaints(map, appearance, is3D, "idle");
}

function ensureInventoryIconHqFillLayer(
  map: mapboxgl.Map,
  beforeId: string | undefined,
  hqIds: (string | number)[],
  is3D: boolean,
  appearance: InventoryMapAppearance
) {
  if (!map.getSource("composite")) return;
  if (map.getLayer(INVENTORY_ICON_HQ_FILL_LAYER_ID)) {
    map.removeLayer(INVENTORY_ICON_HQ_FILL_LAYER_ID);
  }
  if (hqIds.length === 0) return;

  const filter: mapboxgl.FilterSpecification = [
    "in",
    ["id"],
    ["literal", hqIds],
  ];

  const layer = {
    id: INVENTORY_ICON_HQ_FILL_LAYER_ID,
    type: "fill" as const,
    source: "composite",
    "source-layer": "building",
    promoteId: { building: "id" },
    filter,
    minzoom: 14,
    layout: {
      visibility: is3D ? ("none" as const) : ("visible" as const),
    },
    paint: {
      "fill-color": [
        "case",
        ["boolean", ["feature-state", "selected"], false],
        "rgba(217, 70, 239, 0.78)",
        ["boolean", ["feature-state", "hover"], false],
        "rgba(168, 85, 247, 0.6)",
        "rgba(109, 40, 217, 0.45)",
      ],
      "fill-opacity": appearance === "satellite" ? 0.88 : 0.9,
    },
  };

  try {
    if (beforeId) {
      map.addLayer(layer as unknown as mapboxgl.AnyLayer, beforeId);
    } else {
      map.addLayer(layer as unknown as mapboxgl.AnyLayer);
    }
  } catch {
    /* Style may omit `building` source-layer. */
  }
}

function setupIconHeadquartersInteraction(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance,
  is3D: boolean,
  hqIds: (string | number)[],
  anchorLngLat: [number, number],
  useGeoFootprint = false
) {
  iconHeadquartersInteractionCleanup?.();
  iconHeadquartersInteractionCleanup = null;

  if (!useGeoFootprint && hqIds.length === 0) return;

  if (useGeoFootprint) {
    const hitLayers: string[] = [];
    if (is3D && map.getLayer(ICON_HQ_GEO_EXTRUSION_LAYER_ID)) {
      hitLayers.push(ICON_HQ_GEO_EXTRUSION_LAYER_ID);
    }
    if (!is3D && map.getLayer(ICON_HQ_GEO_FILL_LAYER_ID)) {
      hitLayers.push(ICON_HQ_GEO_FILL_LAYER_ID);
    }
    if (hitLayers.length === 0) {
      return;
    }

    let geoHovered = false;
    let geoSelected = false;

    const handleMove = (e: mapboxgl.MapMouseEvent) => {
      const hit = map.queryRenderedFeatures(e.point, { layers: hitLayers })[0];
      if (!hit) {
        if (geoHovered && !geoSelected) {
          applyIconHqGeoLayerPaints(map, appearance, is3D, "idle");
        }
        geoHovered = false;
        map.getCanvas().style.cursor = "";
        return;
      }

      if (!geoHovered && !geoSelected) {
        applyIconHqGeoLayerPaints(map, appearance, is3D, "hover");
      }
      geoHovered = true;
      map.getCanvas().style.cursor = "pointer";
    };

    const handleLeave = () => {
      if (!geoSelected) {
        applyIconHqGeoLayerPaints(map, appearance, is3D, "idle");
      }
      geoHovered = false;
      map.getCanvas().style.cursor = "";
    };

    const handleClick = (e: mapboxgl.MapMouseEvent) => {
      const hit = map.queryRenderedFeatures(e.point, { layers: hitLayers })[0];
      if (hit) {
        e.originalEvent.stopPropagation();
        geoSelected = true;
        applyIconHqGeoLayerPaints(map, appearance, is3D, "selected");
        ensureIconHeadquartersMarker(map, anchorLngLat);
        return;
      }

      geoSelected = false;
      applyIconHqGeoLayerPaints(map, appearance, is3D, geoHovered ? "hover" : "idle");
      removeIconHeadquartersMarker();
    };

    map.on("mousemove", handleMove);
    map.on("click", handleClick);
    map.getCanvas().addEventListener("mouseleave", handleLeave);

    iconHeadquartersInteractionCleanup = () => {
      map.off("mousemove", handleMove);
      map.off("click", handleClick);
      map.getCanvas().removeEventListener("mouseleave", handleLeave);
      removeIconHeadquartersMarker();
      if (map.getLayer(ICON_HQ_GEO_EXTRUSION_LAYER_ID) || map.getLayer(ICON_HQ_GEO_FILL_LAYER_ID)) {
        applyIconHqGeoLayerPaints(map, appearance, is3D, "idle");
      }
      map.getCanvas().style.cursor = "";
    };
    return;
  }

  const hitLayers: string[] = [];
  if (is3D && map.getLayer(INVENTORY_3D_BUILDINGS_LAYER_ID)) {
    hitLayers.push(INVENTORY_3D_BUILDINGS_LAYER_ID);
  }
  if (!is3D && map.getLayer(INVENTORY_ICON_HQ_FILL_LAYER_ID)) {
    hitLayers.push(INVENTORY_ICON_HQ_FILL_LAYER_ID);
  }
  if (hitLayers.length === 0) return;

  const isHqId = (id: string | number | undefined | null) =>
    id != null && hqIds.includes(id);

  const clearHoverFeatureState = () => {
    if (iconHqHoveredId == null) return;
    try {
      map.setFeatureState(
        { source: "composite", sourceLayer: "building", id: iconHqHoveredId },
        { hover: false }
      );
    } catch {
      /* no-op */
    }
    iconHqHoveredId = null;
  };

  const handleMove = (e: mapboxgl.MapMouseEvent) => {
    const feats = map.queryRenderedFeatures(e.point, { layers: hitLayers });
    const hit = feats.find((f) => isHqId(f.id));
    if (!hit || hit.id === undefined) {
      clearHoverFeatureState();
      map.getCanvas().style.cursor = "";
      return;
    }
    const id = hit.id;
    if (iconHqHoveredId === id) {
      map.getCanvas().style.cursor = "pointer";
      return;
    }
    clearHoverFeatureState();
    if (id !== iconHqSelectedId) {
      map.setFeatureState(
        { source: "composite", sourceLayer: "building", id },
        { hover: true }
      );
    }
    iconHqHoveredId = id;
    map.getCanvas().style.cursor = "pointer";
  };

  const handleLeave = () => {
    clearHoverFeatureState();
    map.getCanvas().style.cursor = "";
  };

  const handleClick = (e: mapboxgl.MapMouseEvent) => {
    const feats = map.queryRenderedFeatures(e.point, { layers: hitLayers });
    const hit = feats.find((f) => isHqId(f.id));
    if (hit?.id !== undefined) {
      e.originalEvent.stopPropagation();
      if (iconHqSelectedId != null && iconHqSelectedId !== hit.id) {
        try {
          map.setFeatureState(
            {
              source: "composite",
              sourceLayer: "building",
              id: iconHqSelectedId,
            },
            { selected: false, hover: false }
          );
        } catch {
          /* no-op */
        }
      }
      iconHqSelectedId = hit.id;
      map.setFeatureState(
        { source: "composite", sourceLayer: "building", id: hit.id },
        { selected: true, hover: false }
      );
      clearHoverFeatureState();
      ensureIconHeadquartersMarker(map, anchorLngLat);
      return;
    }
    if (iconHqSelectedId != null) {
      try {
        map.setFeatureState(
          {
            source: "composite",
            sourceLayer: "building",
            id: iconHqSelectedId,
          },
          { selected: false }
        );
      } catch {
        /* no-op */
      }
      iconHqSelectedId = null;
      removeIconHeadquartersMarker();
    }
  };

  map.on("mousemove", handleMove);
  map.on("click", handleClick);
  map.getCanvas().addEventListener("mouseleave", handleLeave);

  iconHeadquartersInteractionCleanup = () => {
    map.off("mousemove", handleMove);
    map.off("click", handleClick);
    map.getCanvas().removeEventListener("mouseleave", handleLeave);
    clearHoverFeatureState();
    handleLeave();
    if (iconHqSelectedId != null) {
      try {
        map.setFeatureState(
          {
            source: "composite",
            sourceLayer: "building",
            id: iconHqSelectedId,
          },
          { selected: false }
        );
      } catch {
        /* no-op */
      }
      iconHqSelectedId = null;
    }
    removeIconHeadquartersMarker();
  };
}

function bindIconHeadquartersToMap(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance,
  is3D: boolean,
  resolved: ReturnType<typeof resolveIconHeadquartersFromMap>
) {
  const beforeId = resolveInventoryMapInsertBeforeFirstLabelLayer(map);
  ensureInventoryIconHqFillLayer(
    map,
    beforeId,
    resolved.ids,
    is3D,
    appearance
  );
  if (resolved.footprint) {
    ensureIconHqGeoLayers(map, beforeId, resolved.footprint, is3D, appearance);
    applyMainBuildingsExcludeHqPolygon(map, resolved.footprint.geometry);
  } else {
    applyMainBuildingsExcludeHqPolygon(map, null);
  }
  if (map.getLayer(INVENTORY_3D_BUILDINGS_LAYER_ID)) {
    applyInventoryMapBuildingsExtrusionPaintWithHqFeatureState(
      map,
      appearance,
      resolved.ids
    );
  }
  setupIconHeadquartersInteraction(
    map,
    appearance,
    is3D,
    resolved.ids,
    resolved.anchorLngLat,
    Boolean(resolved.footprint)
  );
}

function scheduleIconHeadquartersSetup(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance,
  is3D: boolean
) {
  const gen = ++iconHqBindGeneration;
  const run = () => {
    if (gen !== iconHqBindGeneration || !map.getSource("composite")) return;
    let resolved = resolveIconHeadquartersFromMap(map, mainLotGeoJSON);
    if (resolved.ids.length === 0) {
      map.once("idle", () => {
        if (gen !== iconHqBindGeneration || !map.getSource("composite")) return;
        resolved = resolveIconHeadquartersFromMap(map, mainLotGeoJSON);
        bindIconHeadquartersToMap(map, appearance, is3D, resolved);
      });
      return;
    }
    bindIconHeadquartersToMap(map, appearance, is3D, resolved);
  };
  map.once("idle", run);
}

function addInventoryMap3dBuildingsLayer(
  map: mapboxgl.Map,
  appearance: InventoryMapAppearance
) {
  if (map.getLayer(INVENTORY_3D_BUILDINGS_LAYER_ID)) return;
  if (!map.getSource("composite")) return;

  const beforeId = resolveInventoryMapInsertBeforeFirstLabelLayer(map);

  const layer = {
    id: INVENTORY_3D_BUILDINGS_LAYER_ID,
    type: "fill-extrusion" as const,
    source: "composite",
    "source-layer": "building",
    promoteId: { building: "id" },
    filter: [
      "any",
      ["==", ["get", "extrude"], true],
      ["==", ["get", "extrude"], "true"],
    ],
    minzoom: 14,
    paint: buildInventoryMapBuildingsExtrusionPaint(appearance),
  };

  try {
    if (beforeId) {
      map.addLayer(layer as unknown as mapboxgl.AnyLayer, beforeId);
    } else {
      map.addLayer(layer as unknown as mapboxgl.AnyLayer);
    }
  } catch {
    /* Style may omit `building` source-layer (some custom Studio styles). */
  }
}

/**
 * 3D: terrain, extruded buildings, pitched camera. 2D: flat (no extrusion / terrain).
 * Call after inventory layers are on the map (e.g. microtask after `setupInventoryMap`).
 */
function applyInventoryMapPerspective(
  map: mapboxgl.Map,
  useThreeDimensions: boolean,
  transitionDurationMs: number,
  appearance: InventoryMapAppearance
) {
  if (!map.loaded()) return;

  if (useThreeDimensions) {
    try {
      addInventoryMap3dBuildingsLayer(map, appearance);
      ensureInventoryMapTerrainSource(map);
      map.setTerrain({
        source: INVENTORY_MAP_TERRAIN_SOURCE_ID,
        exaggeration: INVENTORY_MAP_3D_TERRAIN_EXAGGERATION,
      });
    } catch {
      /* style or source may still be initializing */
    }
    map.easeTo({
      pitch: INVENTORY_MAP_3D_PITCH,
      duration: transitionDurationMs,
      essential: true,
    });
  } else {
    removeInventoryMap3dBuildingsLayer(map);
    try {
      map.setTerrain(null);
    } catch {
      /* ignore */
    }
    map.easeTo({
      pitch: 0,
      duration: transitionDurationMs,
      essential: true,
    });
  }

  queueMicrotask(() => {
    scheduleIconHeadquartersSetup(map, appearance, useThreeDimensions);
  });
}

function clearInventoryMapTerrainBeforeStyleChange(map: mapboxgl.Map) {
  try {
    map.setTerrain(null);
  } catch {
    /* map may be mid-teardown */
  }
}

function getVehicleStatusIcons(
  vin: string,
  index: number
): NonNullable<VehicleListItemProps["statusIcons"]> {
  const vinSeed = vin
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return {
    location: "active",
    keyPaired: (vinSeed + index) % 3 === 0 ? "inactive" : "active",
    battery: (vinSeed + index) % 4 === 0 ? "inactive" : "active",
  };
}

function InventoryTableView({
  vehicles,
  currentPage,
  onPageChange,
  isFiltersOpen,
  onCloseFilters,
  onResetFilters,
  onSelectionCountChange,
}: {
  vehicles: InventoryVehicleRecord[];
  currentPage: number;
  onPageChange: (page: number) => void;
  isFiltersOpen: boolean;
  onCloseFilters: () => void;
  onResetFilters: () => void;
  onSelectionCountChange?: (count: number) => void;
}) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const totalPages = Math.max(1, Math.ceil(vehicles.length / INVENTORY_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * INVENTORY_PAGE_SIZE;
  const pagedVehicles = vehicles.slice(pageStart, pageStart + INVENTORY_PAGE_SIZE);

  const handleCopy = useCallback(async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      window.setTimeout(() => {
        setCopiedValue((current) => (current === value ? null : current));
      }, 1600);
    } catch {
      setCopiedValue(null);
    }
  }, []);

  const toggleVehicleSelection = useCallback((vin: string, checked: boolean) => {
    setSelectedVehicles((current) =>
      checked
        ? [...current, vin]
        : current.filter((selectedVin) => selectedVin !== vin)
    );
  }, []);

  useEffect(() => {
    onSelectionCountChange?.(selectedVehicles.length);
    return () => onSelectionCountChange?.(0);
  }, [onSelectionCountChange, selectedVehicles.length]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <DesignSystemTableShellNoTabs
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        pagination={
          <Paginator
            variant="inline"
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={vehicles.length}
            pageSize={INVENTORY_PAGE_SIZE}
            onPageChange={onPageChange}
          />
        }
      >
        <div className="relative min-h-0 min-w-0">
          <Table className="border-separate border-spacing-0 bg-transparent text-sm">
            <TableHeader className="[&_tr]:border-0 [&_tr]:bg-transparent [&_tr]:hover:bg-transparent">
              <TableRow size="compact" className="!border-0 hover:bg-transparent">
                  <TableHead className="w-[56px] p-0">
                    <TableHeaderCell variant="checkbox" />
                  </TableHead>
                  <TableHead className="w-[220px] p-0">
                    <TableHeaderCell variant="label" label="VIN" />
                  </TableHead>
                  <TableHead className="w-[180px] p-0">
                    <TableHeaderCell variant="label" label="Stock #" />
                  </TableHead>
                  <TableHead className="w-[96px] p-0">
                    <TableHeaderCell variant="label" label="Year" />
                  </TableHead>
                  <TableHead className="w-[140px] p-0">
                    <TableHeaderCell variant="label" label="Make" />
                  </TableHead>
                  <TableHead className="w-[180px] p-0">
                    <TableHeaderCell variant="label" label="Model" />
                  </TableHead>
                  <TableHead className="w-[180px] p-0">
                    <TableHeaderCell variant="label" label="Trim" />
                  </TableHead>
                  <TableHead className="w-[160px] p-0">
                    <TableHeaderCell variant="label" label="Mileage" />
                  </TableHead>
                  <TableHead className="w-[140px] p-0">
                    <TableHeaderCell variant="label" label="Price" />
                  </TableHead>
                  <TableHead className="w-[140px] p-0">
                    <TableHeaderCell variant="label" label="Lot Age" />
                  </TableHead>
                  <TableHead className="w-[140px] p-0">
                    <TableHeaderCell variant="label" label="Stock Type" />
                  </TableHead>
                  <TableHead className="w-[160px] p-0">
                    <TableHeaderCell variant="label" label="Geofence" />
                  </TableHead>
                  <TableHead className="w-[124px] p-0">
                    <TableHeaderCell variant="label" label="Status" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedVehicles.map((vehicle, index) => {
                  const statusIcons = getVehicleStatusIcons(vehicle.vin, index);
                  const stockNumber = vehicle.vin.slice(-6);
                  const year = vehicle.title.split(" ")[0];
                  const isSelected = selectedVehicles.includes(vehicle.vin);

                  return (
                    <TableRow
                      key={vehicle.vin}
                      size="default"
                      className="!border-0 !bg-transparent hover:!bg-transparent"
                    >
                      <TableCell className="p-0">
                        <div className="flex min-h-11 items-center justify-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              toggleVehicleSelection(vehicle.vin, checked === true)
                            }
                            aria-label={`Select ${vehicle.title}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="p-0">
                        <div className="flex min-h-11 items-center px-2.5">
                          <div className="inline-flex max-w-full items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleCopy(vehicle.vin)}
                              aria-label={`Copy VIN ${vehicle.vin}`}
                              className="truncate text-left text-sm font-medium leading-5 text-primary transition-colors hover:text-primary"
                            >
                              {vehicle.vin}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(vehicle.vin)}
                              aria-label={`Copy VIN ${vehicle.vin}`}
                              className="inline-flex size-5 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {copiedValue === vehicle.vin ? (
                                <Check className="size-3.5 text-primary" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-0">
                        <div className="flex min-h-11 items-center px-2.5">
                          <div className="inline-flex max-w-full items-center gap-1">
                            <span className="truncate text-sm leading-5 text-foreground">
                              {stockNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(stockNumber)}
                              aria-label={`Copy stock number ${stockNumber}`}
                              className="inline-flex size-5 shrink-0 items-center justify-center rounded-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                            >
                              {copiedValue === stockNumber ? (
                                <Check className="size-3.5 text-primary" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={year}
                          className="min-h-11 text-foreground"
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.make}
                          className="min-h-11 text-foreground"
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.model}
                          className="min-h-11 text-foreground"
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.trim}
                          className="min-h-11 text-foreground"
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell label={vehicle.mileage} className="min-h-11" />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.price}
                          className="min-h-11 text-sm font-medium text-foreground"
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell label={vehicle.lotAge} className="min-h-11" />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell label={vehicle.stockType} className="min-h-11" />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell label={vehicle.geofence} className="min-h-11" />
                      </TableCell>
                      <TableCell className="p-0">
                        <div className="flex min-h-11 items-center gap-2 px-2.5 text-muted-foreground">
                          <LocationIcon variant={statusIcons.location} />
                          <KeyPairedIcon variant={statusIcons.keyPaired} />
                          <BatteryIcon variant={statusIcons.battery} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          <AnimatePresence initial={false}>
            {isFiltersOpen ? (
              <motion.aside
                key="inventory-table-filters"
                initial={{ x: FILTER_PANEL_WIDTH_PX, opacity: 0 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  transition: { duration: PANEL_DURATION_S, ease: PANEL_EASE },
                }}
                exit={{
                  x: FILTER_PANEL_WIDTH_PX,
                  opacity: 0,
                  transition: { duration: PANEL_DURATION_S, ease: PANEL_EASE },
                }}
                className="absolute inset-y-0 right-0 z-20 flex w-full max-w-[320px] flex-col overflow-hidden border border-border bg-background shadow-[-12px_0_32px_rgba(15,23,32,0.12)]"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                  <h3 className="text-sm font-medium tracking-[0.02em] text-foreground">
                    Filters
                  </h3>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 py-0 text-xs text-muted-foreground"
                      onClick={onResetFilters}
                    >
                      Reset
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close filters"
                      onClick={onCloseFilters}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-0 py-0">
                  <FiltersPanel variant="embedded" className="max-w-none" onReset={onResetFilters} />
                </div>
              </motion.aside>
            ) : null}
          </AnimatePresence>
        </div>
      </DesignSystemTableShellNoTabs>
    </div>
  );
}

export function InventoryContent({
  className,
  viewMode = "map",
}: InventoryContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isListPanelOpen, setIsListPanelOpen] = useState(true);
  const [selectedVehicleVin, setSelectedVehicleVin] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const [mapAppearanceOverride, setMapAppearanceOverride] =
    useState<InventoryMapAppearance | null>(null);
  const mapAppearance =
    mapAppearanceOverride ?? inventoryMapAppearanceFromTheme(resolvedTheme);
  const [isInventoryMap3D, setIsInventoryMap3D] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const [selectedVehicleCount, setSelectedVehicleCount] = useState(0);
  const [sendBrochureDialogOpen, setSendBrochureDialogOpen] = useState(false);
  /** Bumps when vehicle GeoJSON is attached so spotlight can resolve coordinates. */
  const [mapVehicleGeoTick, setMapVehicleGeoTick] = useState(0);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  /** Map instance for spotlight overlay (avoid reading `mapRef` during render). */
  const [spotlightMap, setSpotlightMap] = useState<mapboxgl.Map | null>(null);
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);
  const resizeFrameRef = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const duration = prefersReducedMotion ? 0 : PANEL_DURATION_S;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchFilteredVehicles = useMemo(
    () =>
      INVENTORY_PANEL_VEHICLES.filter((vehicle) => {
        if (!normalizedQuery) return true;

        return [
          vehicle.title,
          vehicle.vin,
          vehicle.make,
          vehicle.model,
          vehicle.trim,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      }),
    [normalizedQuery],
  );

  const vehicleRecordByVin = useMemo(
    () =>
      new Map(
        INVENTORY_PANEL_VEHICLES.map((vehicle) => [vehicle.vin, vehicle] as const)
      ),
    []
  );

  const selectedVehicle = selectedVehicleVin
    ? vehicleRecordByVin.get(selectedVehicleVin) ?? null
    : null;

  const selectedVehicleMapLngLat = ((): [number, number] | null => {
    void mapVehicleGeoTick;
    if (!selectedVehicleVin) return null;
    return getInventoryMapVehicleLngLatByVin(selectedVehicleVin);
  })();

  const vehicles: VehicleListPanelRow[] = searchFilteredVehicles.map((vehicle, index) => ({
    title: vehicle.title,
    vin: vehicle.vin,
    price: vehicle.price,
    mileage: vehicle.mileage,
    imageSrc: vehicle.imageSrc,
    imageAlt: vehicle.imageAlt,
    statusIcons: getVehicleStatusIcons(vehicle.vin, index),
  }));

  const handleVehicleSelect = useCallback((vin: string) => {
    setSelectedVehicleVin(vin);
    setIsListPanelOpen(true);
  }, []);

  const handleVehicleDetailBack = useCallback(() => {
    setSelectedVehicleVin(null);
  }, []);

  const mapPerspectiveDurationMs = prefersReducedMotion ? 0 : 420;

  useEffect(() => {
    inventoryMapMarkerHighlightRef.selectedVin = selectedVehicleVin;
    scheduleInventoryVehicleMarkersReconcile();
  }, [selectedVehicleVin]);

  const handleMapReady = useCallback(
    (map: mapboxgl.Map) => {
      mapRef.current = map;
      setSpotlightMap(map);
      setupInventoryMap(map, mainLotGeoJSON, mapAppearance, handleVehicleSelect);
      setMapVehicleGeoTick((tick) => tick + 1);
      queueMicrotask(() => {
        applyInventoryMapPerspective(
          map,
          isInventoryMap3D,
          mapPerspectiveDurationMs,
          mapAppearance
        );
      });
    },
    [handleVehicleSelect, mapAppearance, isInventoryMap3D, mapPerspectiveDurationMs]
  );

  const handleBeforeInventoryStyleChange = useCallback((map: mapboxgl.Map) => {
    clearInventoryMapTerrainBeforeStyleChange(map);
    teardownInventoryMapOverlays(map);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.loaded()) return;
    applyInventoryMapPerspective(
      map,
      isInventoryMap3D,
      mapPerspectiveDurationMs,
      mapAppearance
    );
  }, [isInventoryMap3D, mapPerspectiveDurationMs, mapAppearance]);

  const inventoryMapStyle = useMemo(() => {
    if (mapAppearance === "light") return INVENTORY_MAP_STYLE_LIGHT;
    if (mapAppearance === "satellite") return INVENTORY_MAP_STYLE_SATELLITE;
    return INVENTORY_MAP_STYLE_DARK;
  }, [mapAppearance]);

  const mapCanvasSurfaceClass =
    mapAppearance === "light" ? MAP_SURFACE_CLASS_LIGHT : MAP_SURFACE_CLASS_DARK;

  const nextMapAppearance = useMemo(
    () => getNextMapAppearance(mapAppearance),
    [mapAppearance]
  );

  const scheduleMapResize = useCallback(() => {
    if (resizeFrameRef.current != null) {
      cancelAnimationFrame(resizeFrameRef.current);
    }

    resizeFrameRef.current = requestAnimationFrame(() => {
      mapRef.current?.resize();
      resizeFrameRef.current = null;
    });
  }, []);

  useEffect(() => {
    const wrapper = mapWrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(() => {
      scheduleMapResize();
    });
    observer.observe(wrapper);
    return () => {
      observer.disconnect();
      if (resizeFrameRef.current != null) {
        cancelAnimationFrame(resizeFrameRef.current);
      }
    };
  }, [scheduleMapResize]);

  useEffect(() => {
    if (viewMode !== "map") return;
    scheduleMapResize();
  }, [viewMode, scheduleMapResize]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery("");
    setTableCurrentPage(1);
  }, []);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 pb-8 min-h-0",
        className
      )}
    >
      {/* Search row: full width, always visible (Figma / Sort UI 1.3) */}
      <div className="flex shrink-0 items-center gap-2.5">
        <InputContainer size="lg" className="w-full max-w-sm">
          <InputIcon position="lead">
            <Search className="size-4" />
          </InputIcon>
          <Input
            standalone={false}
            size="lg"
            aria-label="Search vehicles"
            placeholder="Search vehicles"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setTableCurrentPage(1);
            }}
          />
        </InputContainer>

        <Button variant="secondary" size="lg" className="shrink-0">
          <MapPin className="size-4 shrink-0 text-primary" />
          <span className="whitespace-nowrap">All Geofences</span>
          <ChevronDown className="size-4 shrink-0" />
        </Button>

        <div className="flex-1" />

        {viewMode === "table" && selectedVehicleCount > 0 ? (
          <DropdownButton
            label="Actions"
            variant="secondary"
            size="lg"
            align="end"
            contentClassName="w-48"
          >
            <DropdownMenuItem>Mark feature</DropdownMenuItem>
            <DropdownMenuItem>Add remarks</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSendBrochureDialogOpen(true)}
            >
              Send brochure
            </DropdownMenuItem>
            <DropdownMenuItem>Share location</DropdownMenuItem>
          </DropdownButton>
        ) : null}

        <Button
          variant="secondary"
          size="md"
          leadingIcon={<Filter />}
          aria-pressed={isFiltersOpen}
          onClick={() => setIsFiltersOpen((current) => !current)}
        >
          Filters
        </Button>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-200 ease-out",
            viewMode === "table"
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          )}
          aria-hidden={viewMode !== "table"}
        >
          <InventoryTableView
            vehicles={searchFilteredVehicles}
            currentPage={tableCurrentPage}
            onPageChange={setTableCurrentPage}
            isFiltersOpen={isFiltersOpen}
            onCloseFilters={() => setIsFiltersOpen(false)}
            onResetFilters={handleResetFilters}
            onSelectionCountChange={setSelectedVehicleCount}
          />
        </div>
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-250 ease-out",
            viewMode === "map"
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          )}
          aria-hidden={viewMode !== "map"}
        >
          <div
            className={cn(
              "flex h-full min-h-0 min-w-0 flex-1 gap-0 overflow-hidden rounded-sm",
              MAP_SURFACE_CLASS_DARK
            )}
          >
          <AnimatePresence initial={false}>
            {isListPanelOpen && (
              <motion.div
                key="vehicle-side-panel"
                initial={false}
                animate={{
                  width: PANEL_WIDTH_PX,
                  transition: {
                    width: { duration, ease: PANEL_EASE },
                  },
                }}
                exit={{
                  width: 0,
                  transition: {
                    width: { duration, ease: PANEL_EASE },
                  },
                }}
                onUpdate={scheduleMapResize}
                onAnimationComplete={scheduleMapResize}
                className={cn("shrink-0 overflow-hidden", MAP_SURFACE_CLASS_DARK)}
                style={{ willChange: "width" }}
              >
                {selectedVehicle ? (
                  <InventoryVehicleDetailPanel
                    vehicle={selectedVehicle}
                    statusIcons={getVehicleStatusIcons(
                      selectedVehicle.vin,
                      INVENTORY_PANEL_VEHICLES.findIndex(
                        (vehicle) => vehicle.vin === selectedVehicle.vin
                      )
                    )}
                    onBack={handleVehicleDetailBack}
                  />
                ) : (
                  <VehicleListPanel
                    vehicles={vehicles}
                    onCollapse={() => {
                      setIsListPanelOpen(false);
                      setSelectedVehicleVin(null);
                    }}
                    onVehicleClick={(vehicle) => {
                      if (vehicle.vin) {
                        handleVehicleSelect(vehicle.vin);
                      }
                    }}
                    className="h-full"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            ref={mapWrapperRef}
            transition={{ duration, ease: PANEL_EASE }}
            onUpdate={scheduleMapResize}
            onAnimationComplete={scheduleMapResize}
            className={cn(
              "relative min-w-0 w-full flex-1 min-h-0 overflow-hidden",
              mapCanvasSurfaceClass
            )}
            style={{ willChange: "width" }}
          >
            <MapboxMap
              center={DEALERSHIP_CENTER}
              zoom={INVENTORY_MAP_INITIAL_ZOOM}
              style={inventoryMapStyle}
              onMapReady={handleMapReady}
              onBeforeStyleChange={handleBeforeInventoryStyleChange}
              className="h-full w-full overflow-hidden"
              surfaceClassName={mapCanvasSurfaceClass}
              canvasBackgroundColor={
                mapAppearance === "light" ? "#F2F2F2" : "#1a1f26"
              }
              mutedMonochromeDark={false}
              extraControls={
                <>
                  {!isListPanelOpen ? (
                    <MapControlButton
                      type="button"
                      aria-label="Show vehicle list"
                      onClick={() => {
                        setSelectedVehicleVin(null);
                        setIsListPanelOpen(true);
                      }}
                    >
                      <List className="size-5" strokeWidth={1.9} />
                    </MapControlButton>
                  ) : null}
                    <MapControlButton
                      type="button"
                      aria-label={`${getMapAppearanceLabel(mapAppearance)}. Activate to switch to ${getMapAppearanceLabel(nextMapAppearance)}.`}
                      onClick={() =>
                      {
                        setMapAppearanceOverride((current) =>
                          getNextMapAppearance(
                            current ?? inventoryMapAppearanceFromTheme(resolvedTheme)
                          )
                        );
                      }
                      }
                    >
                    {mapAppearance === "light" ? (
                      <Sun className="size-5" strokeWidth={1.9} />
                    ) : mapAppearance === "satellite" ? (
                      <Satellite className="size-5" strokeWidth={1.9} />
                    ) : (
                      <Moon className="size-5" strokeWidth={1.9} />
                    )}
                  </MapControlButton>
                  <MapControlButton
                    type="button"
                    aria-label={
                      isInventoryMap3D
                        ? "Switch to flat map view"
                        : "Switch to 3D map view"
                    }
                    aria-pressed={isInventoryMap3D}
                    onClick={() => setIsInventoryMap3D((current) => !current)}
                    className={cn(
                      isInventoryMap3D &&
                        "border-[rgba(21,92,255,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.98))] text-primary shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_8px_18px_rgba(21,92,255,0.12),0px_0px_0px_1px_rgba(21,92,255,0.08)]"
                    )}
                  >
                    {isInventoryMap3D ? (
                      <Square className="size-5" strokeWidth={1.9} />
                    ) : (
                      <Box className="size-5" strokeWidth={1.9} />
                    )}
                  </MapControlButton>
                </>
              }
            />
            <InventoryMapSelectionSpotlight
              map={spotlightMap}
              lngLat={selectedVehicleMapLngLat}
              appearance={mapAppearance}
              visible={Boolean(selectedVehicleVin && selectedVehicleMapLngLat)}
            />
            <AnimatePresence initial={false}>
              {isFiltersOpen ? (
                <motion.aside
                  key="inventory-map-filters"
                  initial={{ x: FILTER_PANEL_WIDTH_PX, opacity: 0 }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    transition: { duration: PANEL_DURATION_S, ease: PANEL_EASE },
                  }}
                  exit={{
                    x: FILTER_PANEL_WIDTH_PX,
                    opacity: 0,
                    transition: { duration: PANEL_DURATION_S, ease: PANEL_EASE },
                  }}
                  className="absolute inset-y-0 right-0 z-20 flex w-full max-w-[320px] flex-col overflow-hidden border border-border bg-background shadow-[-12px_0_32px_rgba(15,23,32,0.16)]"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                    <h3 className="text-sm font-medium tracking-[0.02em] text-foreground">
                      Filters
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto px-0 py-0 text-xs text-muted-foreground"
                        onClick={handleResetFilters}
                      >
                        Reset
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Close filters"
                        onClick={() => setIsFiltersOpen(false)}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-0 py-0">
                    <FiltersPanel
                      variant="embedded"
                      className="max-w-none"
                      onReset={handleResetFilters}
                    />
                  </div>
                </motion.aside>
              ) : null}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              <motion.div
                key="inventory-floating-actions"
                initial={false}
                animate={{
                  opacity: 1,
                  transition: {
                    duration: duration * 0.5,
                    delay: duration * 0.3,
                    ease: PANEL_EASE,
                  },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: duration * 0.25, ease: PANEL_EASE },
                }}
                className="absolute left-3 top-3 z-10 flex flex-wrap gap-2"
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leadingIcon={
                    <MapFilterIcon
                      src={MAP_FILTER_ICONS.stockType}
                      alt="Stock type"
                    />
                  }
                  className="bg-background shadow-sm hover:bg-background"
                >
                  Stock Type
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leadingIcon={
                    <MapFilterIcon
                      src={MAP_FILTER_ICONS.inventoryAge}
                      alt="Inventory age"
                    />
                  }
                  className="bg-background shadow-sm hover:bg-background"
                >
                  Inventory Age
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leadingIcon={
                    <MapFilterIcon
                      src={MAP_FILTER_ICONS.batteryStatus}
                      alt="Battery status"
                    />
                  }
                  className="bg-background shadow-sm hover:bg-background"
                >
                  Battery Status
                </Button>
              </motion.div>
            </AnimatePresence>
          </motion.div>
          </div>
        </div>
      </div>
      <SendVehicleBrochureDialog
        open={sendBrochureDialogOpen}
        onOpenChange={setSendBrochureDialogOpen}
      />
    </div>
  );
}
