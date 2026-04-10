"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useTheme } from "@/components/theme/app-theme-provider";
import {
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
  ChevronLeft,
  ChevronsLeft,
  Sparkles,
  Hourglass,
  Timer,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import mapboxgl from "mapbox-gl";
import Supercluster from "supercluster";
import type { Feature, FeatureCollection, Point, Polygon } from "geojson";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { DropdownButton } from "@/components/ui/dropdown-button";
import { MapboxMap, MapControlButton } from "@/components/ui/mapbox-map";
import { InventoryMapZoomControls } from "@/components/inventory/inventory-map-zoom-controls";
import { BoundaryIcon } from "@/components/icons/boundary-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { FilterButton } from "@/components/ui/filter-button";
import { DesignSystemTableShellNoTabs } from "@/components/chrome/design-system-table-shell-no-tabs";
import {
  VehicleListPanel,
  type VehicleListPanelRow,
} from "@/components/ui/vehicle-list-panel";
import { InventoryVehicleDetailPanel } from "@/components/inventory/vehicle-detail-panel";
import { InventoryVehicleSearchField } from "@/components/inventory/inventory-vehicle-search-field";
import { SendVehicleBrochureDialog } from "@/components/inventory/send-vehicle-brochure-dialog";
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
import { KeysMapMarkerPin } from "@/components/ui/keys-map-marker-pin";
import { VehicleMapMarkerPin } from "@/components/ui/vehicle-map-marker-pin";
import { InventoryVehicleHoverTooltip } from "@/components/ui/inventory-vehicle-hover-tooltip";
import {
  DATA_TABLE_CELL_INNER_HOVER_CLASS,
  DATA_TABLE_HEADER_ROW_BACKGROUND_CLASS,
  DATA_TABLE_ROW_GROUP_CLASS,
  DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
} from "@/lib/data-table-row-hover";
import { cn } from "@/lib/utils";
import {
  DEALERSHIP_CENTER,
  mainLotGeoJSON,
} from "@/lib/inventory/dealership-geofences";
import { resolveIconHeadquartersFromMap } from "@/lib/inventory/icon-headquarters-building";
import {
  INVENTORY_PANEL_VEHICLES,
  type InventoryVehicleRecord,
} from "@/lib/inventory/vehicle-list-data";
import {
  formatSimilarVehiclesListTitle,
  listSimilarVehicles,
} from "@/lib/inventory/similar-vehicles";
import {
  buildInventoryVehicleFeatureCollection,
  hashStringToSeed,
  INVENTORY_LOT_AGE_TIER_HEX,
  INVENTORY_MAP_VEHICLE_IMAGE_ZOOM,
  randomPointInPolygonRing,
  type InventoryVehicleMapFeatureProperties,
} from "@/lib/inventory/inventory-map-vehicle-features";
import type { InventoryMapBasemapAppearance } from "@/lib/inventory/inventory-map-highlight";
import { InventoryMapSelectionSpotlight } from "@/components/inventory/inventory-map-selection-spotlight";
function inventoryMapAppearanceFromTheme(
  resolvedTheme: string | undefined
): InventoryMapAppearance {
  return resolvedTheme === "light" ? "light" : "dark";
}

interface InventoryContentProps {
  className?: string;
  viewMode?: InventoryViewMode;
}

export type InventoryViewMode = "map" | "table";

export type InventoryMapAppearance = InventoryMapBasemapAppearance;

/** Mapbox Standard: same vector basemap for light + dark; `lightPreset` switches at runtime. */
const INVENTORY_MAP_STANDARD_STYLE_URL = "mapbox://styles/mapbox/standard";
export const INVENTORY_MAP_STYLE_LIGHT = INVENTORY_MAP_STANDARD_STYLE_URL;
export const INVENTORY_MAP_STYLE_DARK = INVENTORY_MAP_STANDARD_STYLE_URL;
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

/** True when the basemap is light (Standard / light-v11) so labels and clusters stay readable. */
function inventoryMapUsesLightBasemapUi(
  appearance: InventoryMapAppearance
): boolean {
  return appearance === "light";
}

/** Standard style has built-in 3D buildings/landmarks — skip custom fill-extrusion layers. */
function isInventoryMapStandardStyle(
  appearance: InventoryMapAppearance
): boolean {
  return appearance === "light" || appearance === "dark";
}

/** Apple Maps–like park / woodland tint on Standard (2D landcover, not individual trees). */
const INVENTORY_MAP_STANDARD_COLOR_GREENSPACE = "#6eb85a";

/**
 * Configure Mapbox Standard style's basemap properties via `setConfigProperty`.
 * Safe to call on non-Standard styles (errors silently caught).
 *
 * Tree models require `show3dObjects: true` — when it is false, Mapbox hides all
 * Standard 3D content (buildings, landmarks, and trees). That is independent of
 * camera pitch; the inventory "3D" toggle only controlled this flag before, so
 * users in flat (2D) mode never saw trees. We keep the object stack on and use
 * `show3dLandmarks` follows the inventory 3D toggle. We keep `show3dBuildings`
 * on whenever Standard is active so tree models are not suppressed in flat
 * (pitch-0) mode — in practice Mapbox ties building mesh visibility closely to
 * the same 3D stack as vegetation in many tiles.
 *
 * POI and landmark **labels** are off so dealership / HQ names and addresses
 * from the basemap do not compete with inventory UI.
 */
function configureInventoryMapStandardStyle(
  map: mapboxgl.Map,
  is3D: boolean,
  appearance: InventoryMapAppearance
) {
  const setBasemapConfig = (key: string, value: unknown) => {
    try {
      map.setConfigProperty("basemap", key, value);
    } catch {
      /* non-Standard style or unsupported GL JS version */
    }
  };

  const lightPreset =
    appearance === "light" ? "dusk" : appearance === "dark" ? "night" : "dusk";
  setBasemapConfig("lightPreset", lightPreset);
  setBasemapConfig("show3dObjects", true);
  setBasemapConfig("show3dTrees", true);
  setBasemapConfig("show3dBuildings", true);
  setBasemapConfig("show3dLandmarks", is3D);
  setBasemapConfig("showPointOfInterestLabels", false);
  setBasemapConfig("showLandmarkIconLabels", false);
  setBasemapConfig(
    "colorGreenspace",
    appearance === "dark" ? "#4a8f42" : INVENTORY_MAP_STANDARD_COLOR_GREENSPACE
  );
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
  removeHoverListeners?: () => void;
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
let inventoryVehicleHoverPopup: mapboxgl.Popup | null = null;
let inventoryVehicleHoverPopupRoot: Root | null = null;
let inventoryVehicleHoveredVin: string | null = null;

const inventoryMapMarkerHighlightRef: { selectedVin: string | null } = {
  selectedVin: null,
};

function scheduleInventoryVehicleMarkersReconcile() {
  inventoryVehicleMarkersReconcile?.();
}

/** Keep marker highlight/dimming in sync before React commits (reconcile reads this ref synchronously). */
function syncInventoryMapSelectedVinRef(vin: string | null) {
  inventoryMapMarkerHighlightRef.selectedVin = vin;
  scheduleInventoryVehicleMarkersReconcile();
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

function removeInventoryVehicleHoverPopup() {
  inventoryVehicleHoveredVin = null;
  inventoryVehicleHoverPopupRoot?.unmount();
  inventoryVehicleHoverPopupRoot = null;
  inventoryVehicleHoverPopup?.remove();
  inventoryVehicleHoverPopup = null;
}

function ensureInventoryVehicleHoverPopup(map: mapboxgl.Map): {
  popup: mapboxgl.Popup;
  root: Root;
} {
  if (inventoryVehicleHoverPopup && inventoryVehicleHoverPopupRoot) {
    return {
      popup: inventoryVehicleHoverPopup,
      root: inventoryVehicleHoverPopupRoot,
    };
  }

  const content = document.createElement("div");
  content.className = "pointer-events-none";

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    maxWidth: "none",
    className: "inventory-vehicle-hover-popup inventory-vehicle-hover-popup--light",
    anchor: "bottom",
    offset: [0, -24],
  });
  popup.setDOMContent(content).addTo(map);

  inventoryVehicleHoverPopup = popup;
  inventoryVehicleHoverPopupRoot = createRoot(content);

  return { popup, root: inventoryVehicleHoverPopupRoot };
}

function showInventoryVehicleHoverPopup(
  map: mapboxgl.Map,
  lngLat: [number, number],
  props: InventoryVehicleMapFeatureProperties
) {
  const { popup, root } = ensureInventoryVehicleHoverPopup(map);
  inventoryVehicleHoveredVin = props.vin;
  root.render(
    <InventoryVehicleHoverTooltip
      title={props.title}
      vin={props.vin}
      stockNumber={props.stockNumber}
      stockType={props.stockType}
      price={props.price}
      mileage={props.mileage}
    />
  );
  popup.setLngLat(lngLat);
}

function hideInventoryVehicleHoverPopup(vin?: string) {
  if (vin && inventoryVehicleHoveredVin && vin !== inventoryVehicleHoveredVin) {
    return;
  }
  inventoryVehicleHoveredVin = null;
  inventoryVehicleHoverPopupRoot?.render(<></>);
  inventoryVehicleHoverPopup?.remove();
}
let inventoryVehicleClusterIndex: Supercluster<
  InventoryVehicleMapFeatureProperties,
  Supercluster.AnyProps
> | null = null;

/** Key markers shown on the map when a vehicle is selected (2 per vehicle). */
type InventoryKeyMarkerEntry = {
  marker: mapboxgl.Marker;
  root: Root;
};
const inventoryKeyMarkerEntries: InventoryKeyMarkerEntry[] = [];
const INVENTORY_KEY_MARKERS_PER_VEHICLE = 2;

function mountInventoryKeyMarker(
  lngLat: [number, number],
  map: mapboxgl.Map
): InventoryKeyMarkerEntry {
  const wrap = document.createElement("div");
  wrap.className = "pointer-events-none inline-flex items-center justify-center";
  wrap.style.zIndex = "12";
  const root = createRoot(wrap);
  root.render(<KeysMapMarkerPin hoverable title="Key fob" />);
  const marker = new mapboxgl.Marker({ element: wrap, anchor: "center" })
    .setLngLat(lngLat)
    .addTo(map);
  return { marker, root };
}

function removeAllInventoryKeyMarkers() {
  for (const entry of inventoryKeyMarkerEntries) {
    entry.root.unmount();
    entry.marker.remove();
  }
  inventoryKeyMarkerEntries.length = 0;
}

/**
 * Places or removes key fob markers on the map based on vehicle selection.
 * When a VIN is selected, 2 key markers are placed at deterministic positions
 * inside the main lot geofence. When deselected, they are removed.
 */
function reconcileInventoryKeyMarkers(map: mapboxgl.Map) {
  const selectedVin = inventoryMapMarkerHighlightRef.selectedVin;
  if (!selectedVin) {
    removeAllInventoryKeyMarkers();
    return;
  }

  const currentVinOnMap =
    inventoryKeyMarkerEntries.length > 0
      ? (inventoryKeyMarkerEntries as Array<InventoryKeyMarkerEntry & { _vin?: string }>)[0]?._vin
      : null;
  if (currentVinOnMap === selectedVin) return;

  removeAllInventoryKeyMarkers();

  const ring = mainLotGeoJSON.features[0]?.geometry.coordinates[0];
  if (!ring) return;

  for (let i = 0; i < INVENTORY_KEY_MARKERS_PER_VEHICLE; i++) {
    const seed = hashStringToSeed(`${selectedVin}-key-${i}`);
    const coords = randomPointInPolygonRing(ring, seed);
    const entry = mountInventoryKeyMarker(coords, map) as InventoryKeyMarkerEntry & { _vin?: string };
    entry._vin = selectedVin;
    inventoryKeyMarkerEntries.push(entry);
  }
}

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
  wrap.setAttribute("aria-label", "Dealership headquarters");
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
  for (const entry of inventoryVehicleMarkerEntries.values()) {
    entry.removeHoverListeners?.();
    entry.root.unmount();
    entry.marker.remove();
  }
  inventoryVehicleMarkerEntries.clear();
  removeInventoryVehicleHoverPopup();
  removeAllInventoryKeyMarkers();
  lastInventoryVehicleFeatureCollection = null;
  inventoryVehicleClusterIndex = null;

  for (const layerId of [
    INV_LAYER_CLUSTER_COUNT,
    INV_LAYER_CLUSTERS,
    INV_LAYER_UNCLUSTERED,
  ]) {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
  if (map.getSource(INVENTORY_VEHICLES_SOURCE_ID)) {
    map.removeSource(INVENTORY_VEHICLES_SOURCE_ID);
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

/** Selected vehicle scales up (~1.15×); peers stay slightly subdued (opacity/saturation ~0.9). */
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
        dimPeerMarkers && "opacity-[0.9] saturate-[0.9]",
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
  onVehicleSelect?: InventoryVehicleSelectHandler
) {
  const fc = lastInventoryVehicleFeatureCollection;
  const zoom = map.getZoom();
  if (!fc || zoom < INVENTORY_MAP_VEHICLE_PIN_ZOOM) {
    for (const entry of inventoryVehicleMarkerEntries.values()) {
      entry.removeHoverListeners?.();
      entry.root.unmount();
      entry.marker.remove();
    }
    inventoryVehicleMarkerEntries.clear();
    hideInventoryVehicleHoverPopup();
    return;
  }
  /**
   * Tier-colored shield pins from the HTML threshold until `INVENTORY_MAP_VEHICLE_IMAGE_ZOOM` (18.5);
   * photo chips at/above that zoom so images stay legible. Selection fly uses `easeTo` (not `flyTo`) so
   * the camera does not dip through zoom bands mid-animation and thrash pin↔chip.
   */
  const markerMode: "chip" | "pin" =
    zoom >= INVENTORY_MAP_VEHICLE_IMAGE_ZOOM ? "chip" : "pin";

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
          ? "15"
          : selectedVin != null
            ? "1"
            : "";
      if (inventoryVehicleHoveredVin === props.vin) {
        showInventoryVehicleHoverPopup(map, [lng, lat], props);
      }
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
          ? "15"
          : selectedVin != null
            ? "1"
            : "";

      const onMarkerEnter = () => {
        const entry = inventoryVehicleMarkerEntries.get(props.vin);
        if (!entry) return;
        const lngLat = entry.marker.getLngLat();
        showInventoryVehicleHoverPopup(
          map,
          [lngLat.lng, lngLat.lat],
          entry.props
        );
      };
      const onMarkerLeave = () => {
        hideInventoryVehicleHoverPopup(props.vin);
      };
      const onMarkerClick = () => {
        hideInventoryVehicleHoverPopup(props.vin);
      };
      el.addEventListener("mouseenter", onMarkerEnter);
      el.addEventListener("mouseleave", onMarkerLeave);
      el.addEventListener("click", onMarkerClick);
      const removeHoverListeners = () => {
        el.removeEventListener("mouseenter", onMarkerEnter);
        el.removeEventListener("mouseleave", onMarkerLeave);
        el.removeEventListener("click", onMarkerClick);
      };

      inventoryVehicleMarkerEntries.set(props.vin, {
        vin: props.vin,
        marker,
        root,
        props,
        mode: markerMode,
        renderKey: nextRenderKey,
        removeHoverListeners,
      });
    }
    count += 1;
  }

  for (const [vin, entry] of inventoryVehicleMarkerEntries.entries()) {
    if (!nextVisibleVins.has(vin)) {
      hideInventoryVehicleHoverPopup(vin);
      entry.removeHoverListeners?.();
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
  if (vehicleFc.features.length === 0) {
    lastInventoryVehicleFeatureCollection = vehicleFc;
    const reconcile = () => {
      reconcileInventoryVehicleClusterMarkers(map);
      reconcileInventoryVehicleHtmlMarkers(map, onVehicleSelect);
      reconcileInventoryKeyMarkers(map);
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
    reconcileInventoryVehicleHtmlMarkers(map, onVehicleSelect);
    reconcileInventoryKeyMarkers(map);
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
    hideInventoryVehicleHoverPopup(props.vin);
    onVehicleSelect?.(props.vin);
  };

  const onClusterPointerEnter = () => {
    hideInventoryVehicleHoverPopup();
    map.getCanvas().style.cursor = "pointer";
  };
  const onClusterPointerLeave = () => {
    map.getCanvas().style.cursor = "";
  };
  const onUnclusteredPointerEnter = (e: mapboxgl.MapLayerMouseEvent) => {
    map.getCanvas().style.cursor = "pointer";
    const feat = e.features?.[0];
    if (!feat || feat.geometry.type !== "Point") return;
    const props = feat.properties as unknown as InventoryVehicleMapFeatureProperties;
    showInventoryVehicleHoverPopup(
      map,
      feat.geometry.coordinates as [number, number],
      props
    );
  };
  const onUnclusteredPointerMove = (e: mapboxgl.MapLayerMouseEvent) => {
    const feat = e.features?.[0];
    if (!feat || feat.geometry.type !== "Point") return;
    const props = feat.properties as unknown as InventoryVehicleMapFeatureProperties;
    showInventoryVehicleHoverPopup(
      map,
      feat.geometry.coordinates as [number, number],
      props
    );
  };
  const onUnclusteredPointerLeave = () => {
    hideInventoryVehicleHoverPopup();
    map.getCanvas().style.cursor = "";
  };

  map.on("click", INV_LAYER_CLUSTERS, onClusterClick);
  map.on("click", INV_LAYER_UNCLUSTERED, onUnclusteredClick);
  map.on("mouseenter", INV_LAYER_CLUSTERS, onClusterPointerEnter);
  map.on("mouseleave", INV_LAYER_CLUSTERS, onClusterPointerLeave);
  map.on("mouseenter", INV_LAYER_UNCLUSTERED, onUnclusteredPointerEnter);
  map.on("mousemove", INV_LAYER_UNCLUSTERED, onUnclusteredPointerMove);
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
    map.off("mousemove", INV_LAYER_UNCLUSTERED, onUnclusteredPointerMove);
    map.off("mouseleave", INV_LAYER_UNCLUSTERED, onUnclusteredPointerLeave);
    hideInventoryVehicleHoverPopup();
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

/**
 * Main-lot geofence paints by basemap. Light map keeps a softer fill; dark + satellite
 * use brighter, higher-chroma blues and stronger opacity so the polygon does not read
 * washed out against night Standard or busy imagery.
 */
function getInventoryGeofencePaint(appearance: InventoryMapAppearance): {
  fillColor: string;
  fillOpacity: number;
  lineColor: string;
  lineWidth: number;
  lineOpacity: number;
} {
  switch (appearance) {
    case "light":
      return {
        fillColor: "#2563eb",
        fillOpacity: 0.22,
        lineColor: "#1d4ed8",
        lineWidth: 2.5,
        lineOpacity: 0.95,
      };
    case "satellite":
      return {
        fillColor: "#3b82f6",
        fillOpacity: 0.42,
        lineColor: "#dbeafe",
        lineWidth: 3,
        lineOpacity: 0.98,
      };
    default:
      // Dark basemap: saturated fill + very light stroke so the outline pops (not a dark/muted rim).
      return {
        fillColor: "#60a5fa",
        fillOpacity: 0.4,
        lineColor: "#e0f2fe",
        lineWidth: 3,
        lineOpacity: 1,
      };
  }
}

function addGeofenceLayers(
  map: mapboxgl.Map,
  geofences: typeof mainLotGeoJSON,
  appearance: InventoryMapAppearance
) {
  const { fillColor, fillOpacity, lineColor, lineWidth, lineOpacity } =
    getInventoryGeofencePaint(appearance);

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
      "line-width": lineWidth,
      "line-opacity": lineOpacity,
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
  if (isInventoryMapStandardStyle(appearance)) return;
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
  if (!isInventoryMapStandardStyle(appearance)) {
    filterPoiLayers(map);
  }
  addGeofenceLayers(map, geofences, appearance);
  addRoadHighlighting(map, appearance);

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

/** Matches map/table search `InputContainer` width (`max-w-sm` → 24rem at 16px root). */
const PANEL_WIDTH_PX = 384;
const DETAIL_PANEL_WIDTH_PX = 400;
/** List / selection-driven focus: Mapbox easeTo (no flyTo zoom arc — avoids chip↔pin flicker mid-move). */
const INVENTORY_MAP_SELECTION_FLY_DURATION_MS = 500;
const FILTER_PANEL_WIDTH_PX = 320;
const PANEL_DURATION_S = 0.25;
const PANEL_EASE = [0.32, 0.72, 0, 1] as const;
/** Staggered map ↔ table crossfade: fast exit, short delay then ease-in */
const INVENTORY_VIEW_OUT_DURATION_S = 0.2;
const INVENTORY_VIEW_IN_DELAY_S = 0.06;
const INVENTORY_VIEW_TABLE_IN_DURATION_S = 0.28;
const INVENTORY_VIEW_MAP_IN_DURATION_S = 0.3;
const INVENTORY_PAGE_SIZE = 14;
/** Map + outer chrome — matches dark basemap letterboxing and app shell. */
const MAP_SURFACE_CLASS_DARK = "bg-[#1a1f26]";
const MAP_SURFACE_CLASS_LIGHT = "bg-[#ddd5cc]";
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
  if (isInventoryMapStandardStyle(appearance)) return;
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
  if (isInventoryMapStandardStyle(appearance)) return;
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
  if (isInventoryMapStandardStyle(appearance)) return;
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
 * For Mapbox Standard style, 3D buildings/landmarks are built-in; we configure
 * them via `setConfigProperty` and only add terrain + pitch.
 * Call after inventory layers are on the map (e.g. microtask after `setupInventoryMap`).
 */
function applyInventoryMapPerspective(
  map: mapboxgl.Map,
  useThreeDimensions: boolean,
  transitionDurationMs: number,
  appearance: InventoryMapAppearance
) {
  if (!map.loaded()) return;

  const useStandard = isInventoryMapStandardStyle(appearance);

  if (useStandard) {
    configureInventoryMapStandardStyle(map, useThreeDimensions, appearance);
    const reapplyStandardConfig = () => {
      configureInventoryMapStandardStyle(map, useThreeDimensions, appearance);
    };
    map.once("idle", reapplyStandardConfig);
  }

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

  if (!useStandard) {
    queueMicrotask(() => {
      scheduleIconHeadquartersSetup(map, appearance, useThreeDimensions);
    });
  }
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

function parseLotAgeDays(lotAge: string): number | null {
  const match = /(\d+)\s*days?/i.exec(lotAge);
  return match != null ? Number(match[1]) : null;
}

function lotAgeTier(days: number): "low" | "medium" | "high" {
  if (days < 30) return "low";
  if (days <= 45) return "medium";
  return "high";
}

function applyMapToolbarFilters(
  vehicles: InventoryVehicleRecord[],
  options: {
    batteryLow: boolean;
    newStock: boolean;
    preOwned: boolean;
    ageHigh: boolean;
  },
): InventoryVehicleRecord[] {
  let list = vehicles;
  const { batteryLow, newStock, preOwned, ageHigh } = options;

  if (batteryLow) {
    list = list.filter((vehicle, i) => {
      const idx = INVENTORY_PANEL_VEHICLES.findIndex(
        (row) => row.vin === vehicle.vin,
      );
      return (
        getVehicleStatusIcons(vehicle.vin, idx >= 0 ? idx : i).battery ===
        "inactive"
      );
    });
  }

  if (newStock || preOwned) {
    list = list.filter((vehicle) => {
      if (newStock && vehicle.stockType === "New") return true;
      if (preOwned && vehicle.stockType === "Pre-Owned") return true;
      return false;
    });
  }

  if (ageHigh) {
    list = list.filter((vehicle) => {
      const days = parseLotAgeDays(vehicle.lotAge);
      if (days == null) return false;
      return lotAgeTier(days) === "high";
    });
  }

  return list;
}

function InventoryMapGeofenceDropdown({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="secondary"
            size="md"
            leadingIcon={
              <BoundaryIcon
                className="size-4 text-black dark:text-foreground"
                aria-hidden
              />
            }
            trailingIcon={
              <ChevronDown
                className="size-4 text-black dark:text-foreground"
                aria-hidden
              />
            }
            className={cn(
              "shrink-0 text-black [&_svg]:text-black dark:text-foreground dark:[&_svg]:text-foreground",
              triggerClassName
            )}
          >
            All Geofences
          </Button>
        }
      />
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem>All Geofences</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Main lot</DropdownMenuItem>
        <DropdownMenuItem>All saved geofences</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
              <TableRow size="compact" className={cn("!border-0", DATA_TABLE_HEADER_ROW_BACKGROUND_CLASS)}>
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
                      className={cn(
                        DATA_TABLE_ROW_GROUP_CLASS,
                        "!border-0 !bg-transparent",
                        DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
                      )}
                    >
                      <TableCell className="p-0">
                        <div className={cn("flex min-h-11 items-center justify-center", DATA_TABLE_CELL_INNER_HOVER_CLASS)}>
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
                        <div className={cn("flex min-h-11 items-center px-2.5", DATA_TABLE_CELL_INNER_HOVER_CLASS)}>
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
                        <div className={cn("flex min-h-11 items-center px-2.5", DATA_TABLE_CELL_INNER_HOVER_CLASS)}>
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
                          className={cn("min-h-11 text-foreground", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.make}
                          className={cn("min-h-11 text-foreground", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.model}
                          className={cn("min-h-11 text-foreground", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.trim}
                          className={cn("min-h-11 text-foreground", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.mileage}
                          className={cn("min-h-11", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.price}
                          className={cn("min-h-11 text-sm font-medium text-foreground", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.lotAge}
                          className={cn("min-h-11", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.stockType}
                          className={cn("min-h-11", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <TableSlotCell
                          label={vehicle.geofence}
                          className={cn("min-h-11", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
                        />
                      </TableCell>
                      <TableCell className="p-0">
                        <div className={cn("flex min-h-11 items-center gap-2 px-2.5 text-muted-foreground", DATA_TABLE_CELL_INNER_HOVER_CLASS)}>
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
  const [similarVehiclesSession, setSimilarVehiclesSession] = useState<{
    anchor: InventoryVehicleRecord;
    results: InventoryVehicleRecord[];
  } | null>(null);
  const { resolvedTheme } = useTheme();
  const [mapAppearanceOverride, setMapAppearanceOverride] =
    useState<InventoryMapAppearance | null>(null);
  const mapAppearance =
    mapAppearanceOverride ?? inventoryMapAppearanceFromTheme(resolvedTheme);
  const [isInventoryMap3D, setIsInventoryMap3D] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [mapFilterBatteryLow, setMapFilterBatteryLow] = useState(false);
  const [mapFilterNew, setMapFilterNew] = useState(false);
  const [mapFilterPreOwned, setMapFilterPreOwned] = useState(false);
  const [mapFilterAgeHigh, setMapFilterAgeHigh] = useState(false);
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

  const searchFilteredVehicles = useMemo(() => {
    const queryFiltered = INVENTORY_PANEL_VEHICLES.filter((vehicle) => {
      if (!normalizedQuery) return true;

      return [
        vehicle.title,
        vehicle.vin,
        vehicle.make,
        vehicle.model,
        vehicle.trim,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });

    if (viewMode !== "map") {
      return queryFiltered;
    }

    return applyMapToolbarFilters(queryFiltered, {
      batteryLow: mapFilterBatteryLow,
      newStock: mapFilterNew,
      preOwned: mapFilterPreOwned,
      ageHigh: mapFilterAgeHigh,
    });
  }, [
    normalizedQuery,
    viewMode,
    mapFilterBatteryLow,
    mapFilterNew,
    mapFilterPreOwned,
    mapFilterAgeHigh,
  ]);

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

  const selectedVehicleMapLngLat = useMemo((): [number, number] | null => {
    void mapVehicleGeoTick;
    if (!selectedVehicleVin) return null;
    return getInventoryMapVehicleLngLatByVin(selectedVehicleVin);
  }, [selectedVehicleVin, mapVehicleGeoTick]);

  const vehicles: VehicleListPanelRow[] = searchFilteredVehicles.map((vehicle, index) => ({
    title: vehicle.title,
    stockNumber: vehicle.stockNumber,
    vin: vehicle.vin,
    price: vehicle.price,
    mileage: vehicle.mileage,
    stockType: vehicle.stockType,
    imageSrc: vehicle.imageSrc,
    imageAlt: vehicle.imageAlt,
    statusIcons: getVehicleStatusIcons(vehicle.vin, index),
  }));

  const similarFilteredVehicles = useMemo(() => {
    if (!similarVehiclesSession) return [];
    const { results } = similarVehiclesSession;
    if (!normalizedQuery) return results;

    return results.filter((vehicle) =>
      [
        vehicle.title,
        vehicle.vin,
        vehicle.make,
        vehicle.model,
        vehicle.trim,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    );
  }, [similarVehiclesSession, normalizedQuery]);

  const similarVehicleRows: VehicleListPanelRow[] = useMemo(
    () =>
      similarFilteredVehicles.map((vehicle) => ({
        title: vehicle.title,
        stockNumber: vehicle.stockNumber,
        vin: vehicle.vin,
        price: vehicle.price,
        mileage: vehicle.mileage,
        stockType: vehicle.stockType,
        imageSrc: vehicle.imageSrc,
        imageAlt: vehicle.imageAlt,
        statusIcons: getVehicleStatusIcons(
          vehicle.vin,
          INVENTORY_PANEL_VEHICLES.findIndex((v) => v.vin === vehicle.vin)
        ),
      })),
    [similarFilteredVehicles]
  );

  /**
   * Imperative fly so the camera moves in the same turn as the click (useEffect often ran too late
   * or bailed on `isStyleLoaded` / missing coords timing). Waits for `map.load` if needed.
   */
  const flyMapToVehicleVin = useCallback(
    (vin: string) => {
      if (viewMode !== "map") return;

      const run = () => {
        const map = mapRef.current;
        if (!map?.loaded()) return;

        const ll =
          getInventoryMapVehicleLngLatByVin(vin) ?? DEALERSHIP_CENTER;

        const durationMs = prefersReducedMotion
          ? 0
          : INVENTORY_MAP_SELECTION_FLY_DURATION_MS;
        const targetZoom = Math.max(
          map.getZoom(),
          INVENTORY_MAP_VEHICLE_IMAGE_ZOOM
        );

        /**
         * Use easeTo (not flyTo): flyTo’s curved path can temporarily zoom *below*
         * INVENTORY_MAP_VEHICLE_IMAGE_ZOOM, so reconcileInventoryVehicleHtmlMarkers switches
         * markers to pin mode until the animation finishes.
         */
        const mapContainer = map.getContainer();
        const containerWidth = mapContainer.offsetWidth;
        const panelOffset = PANEL_WIDTH_PX + DETAIL_PANEL_WIDTH_PX + 48;
        const offsetPx = Math.min(panelOffset, containerWidth * 0.6);
        const point = map.project(ll);
        const shiftedCenter = map.unproject([
          point.x - offsetPx / 2,
          point.y,
        ]);

        map.easeTo({
          center: [shiftedCenter.lng, shiftedCenter.lat],
          zoom: targetZoom,
          bearing: map.getBearing(),
          pitch: map.getPitch(),
          duration: durationMs,
          essential: true,
        });
      };

      const map = mapRef.current;
      if (map?.loaded()) {
        run();
      } else if (map) {
        map.once("load", run);
      }
    },
    [viewMode, prefersReducedMotion]
  );

  const handleVehicleSelect = useCallback(
    (vin: string) => {
      setSimilarVehiclesSession(null);
      syncInventoryMapSelectedVinRef(vin);
      setSelectedVehicleVin(vin);
      setIsListPanelOpen(true);
      flyMapToVehicleVin(vin);
    },
    [flyMapToVehicleVin]
  );

  const handleVehicleDetailBack = useCallback(() => {
    syncInventoryMapSelectedVinRef(null);
    setSelectedVehicleVin(null);
  }, []);

  const handleShowSimilarVehicles = useCallback(() => {
    if (!selectedVehicle) return;
    const results = listSimilarVehicles(selectedVehicle, INVENTORY_PANEL_VEHICLES, 40);
    setSimilarVehiclesSession({ anchor: selectedVehicle, results });
    syncInventoryMapSelectedVinRef(null);
    setSelectedVehicleVin(null);
  }, [selectedVehicle]);

  const handleSimilarVehiclesBack = useCallback(() => {
    if (!similarVehiclesSession) return;
    const anchorVin = similarVehiclesSession.anchor.vin;
    setSimilarVehiclesSession(null);
    syncInventoryMapSelectedVinRef(anchorVin);
    setSelectedVehicleVin(anchorVin);
    flyMapToVehicleVin(anchorVin);
  }, [similarVehiclesSession, flyMapToVehicleVin]);

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
    setMapFilterBatteryLow(false);
    setMapFilterNew(false);
    setMapFilterPreOwned(false);
    setMapFilterAgeHigh(false);
  }, []);

  const mapGeofenceButton = <InventoryMapGeofenceDropdown />;

  const filtersButton = (
    <FilterButton
      label="Filters"
      selected={isFiltersOpen}
      size="md"
      className="w-full min-w-0"
      onClick={() => setIsFiltersOpen((current) => !current)}
    />
  );

  const searchInput = (
    <InventoryVehicleSearchField
      value={searchQuery}
      onChange={(next) => {
        setSearchQuery(next);
        setTableCurrentPage(1);
      }}
    />
  );

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        (viewMode === "table" || viewMode === "map") && "gap-6 px-8 pb-8",
        className
      )}
    >
      {/* Table view: search row above content (Figma / Sort UI 1.3) */}
      {viewMode === "table" ? (
        <div className="flex shrink-0 items-center gap-2.5">
          {searchInput}
          {mapGeofenceButton}
          <div className="flex-1" />
          {selectedVehicleCount > 0 ? (
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
          {filtersButton}
        </div>
      ) : null}

      {viewMode === "map" ? (
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2.5">
          {searchInput}
          {mapGeofenceButton}
          <div className="min-w-0 flex-1" />
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              aria-pressed={mapFilterBatteryLow}
              leadingIcon={
                <BatteryIcon
                  variant="inactive"
                  className="text-muted-foreground"
                  aria-hidden
                />
              }
              className={cn(
                "shrink-0",
                mapFilterBatteryLow &&
                  "border-primary bg-white shadow-sm dark:border-primary dark:bg-background",
              )}
              onClick={() =>
                setMapFilterBatteryLow((current) => !current)
              }
            >
              Low Battery
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              aria-pressed={mapFilterNew}
              leadingIcon={
                <Sparkles className="text-muted-foreground" aria-hidden />
              }
              className={cn(
                "shrink-0",
                mapFilterNew &&
                  "border-primary bg-white shadow-sm dark:border-primary dark:bg-background",
              )}
              onClick={() => setMapFilterNew((current) => !current)}
            >
              New
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              aria-pressed={mapFilterPreOwned}
              leadingIcon={
                <Timer className="text-muted-foreground" aria-hidden />
              }
              className={cn(
                "shrink-0",
                mapFilterPreOwned &&
                  "border-primary bg-white shadow-sm dark:border-primary dark:bg-background",
              )}
              onClick={() =>
                setMapFilterPreOwned((current) => !current)
              }
            >
              Pre-Owned
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              aria-pressed={mapFilterAgeHigh}
              leadingIcon={
                <Hourglass className="text-muted-foreground" aria-hidden />
              }
              className={cn(
                "shrink-0",
                mapFilterAgeHigh &&
                  "border-primary bg-white shadow-sm dark:border-primary dark:bg-background",
              )}
              onClick={() =>
                setMapFilterAgeHigh((current) => !current)
              }
            >
              Aged
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              leadingIcon={<Filter />}
              onClick={() => setIsFiltersOpen((current) => !current)}
            >
              Filters
            </Button>
          </div>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <motion.div
          initial={false}
          className={cn(
            "absolute inset-0",
            viewMode !== "table" && "pointer-events-none"
          )}
          aria-hidden={viewMode !== "table"}
          animate={{
            opacity: viewMode === "table" ? 1 : 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : viewMode === "table"
                ? {
                    duration: INVENTORY_VIEW_TABLE_IN_DURATION_S,
                    delay: INVENTORY_VIEW_IN_DELAY_S,
                    ease: PANEL_EASE,
                  }
                : {
                    duration: INVENTORY_VIEW_OUT_DURATION_S,
                    delay: 0,
                    ease: PANEL_EASE,
                  }
          }
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
        </motion.div>
        <motion.div
          initial={false}
          className={cn(
            "absolute inset-0",
            viewMode !== "map" && "pointer-events-none"
          )}
          aria-hidden={viewMode !== "map"}
          animate={{
            opacity: viewMode === "map" ? 1 : 0,
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : viewMode === "map"
                ? {
                    duration: INVENTORY_VIEW_MAP_IN_DURATION_S,
                    delay: INVENTORY_VIEW_IN_DELAY_S,
                    ease: PANEL_EASE,
                  }
                : {
                    duration: INVENTORY_VIEW_OUT_DURATION_S,
                    delay: 0,
                    ease: PANEL_EASE,
                  }
          }
        >
          <div
            className={cn(
              "relative h-full min-h-0 min-w-0 flex-1 overflow-hidden rounded-md border border-border",
              MAP_SURFACE_CLASS_DARK
            )}
          >
            <div
              ref={mapWrapperRef}
              className={cn(
                "absolute inset-0 min-h-0 overflow-hidden",
                mapCanvasSurfaceClass
              )}
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
                mapAppearance === "light" ? "#ddd5cc" : "#1a1f26"
              }
              mutedMonochromeDark={false}
              replaceDefaultZoomControls={
                <InventoryMapZoomControls
                  map={spotlightMap}
                  prefersReducedMotion={Boolean(prefersReducedMotion)}
                />
              }
              extraControls={
                <>
                  {!isListPanelOpen ? (
                    <MapControlButton
                      type="button"
                      aria-label="Show vehicle list"
                      onClick={() => {
                        setSimilarVehiclesSession(null);
                        syncInventoryMapSelectedVinRef(null);
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
            <AnimatePresence initial={false}>
              {isListPanelOpen ? (
                <motion.div
                  key="vehicle-floating-panel"
                  initial={false}
                  animate={{
                    width: PANEL_WIDTH_PX,
                    transition: {
                      width: { duration, ease: PANEL_EASE },
                    },
                  }}
                  exit={{
                    width: 0,
                    opacity: 0,
                    transition: {
                      width: { duration, ease: PANEL_EASE },
                      opacity: { duration: duration * 0.5, ease: PANEL_EASE },
                    },
                  }}
                  className="pointer-events-auto absolute inset-y-0 left-0 z-20 flex flex-col overflow-hidden border-r border-border bg-sidebar shadow-[0_12px_40px_rgba(15,23,32,0.18)]"
                  style={{ willChange: "width" }}
                >
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <motion.div
                      key={similarVehiclesSession ? "similar" : "list"}
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { duration: 0.18, ease: PANEL_EASE }
                      }
                      className="flex min-h-0 flex-1 flex-col overflow-hidden"
                    >
                      {similarVehiclesSession ? (
                        <VehicleListPanel
                          vehicles={similarVehicleRows}
                          listHeader={
                            <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border bg-sidebar px-3">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 shrink-0 gap-1 px-1.5 text-muted-foreground hover:text-foreground"
                                onClick={handleSimilarVehiclesBack}
                              >
                                <ChevronLeft className="size-4" aria-hidden />
                                Back
                              </Button>
                              <p className="min-w-0 flex-1 truncate text-center font-headline text-[12px] font-medium leading-snug text-foreground">
                                {formatSimilarVehiclesListTitle(
                                  similarVehiclesSession.anchor
                                )}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsListPanelOpen(false);
                                  setSimilarVehiclesSession(null);
                                  syncInventoryMapSelectedVinRef(null);
                                  setSelectedVehicleVin(null);
                                }}
                                className="flex size-4 shrink-0 items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground"
                                aria-label="Collapse panel"
                              >
                                <ChevronsLeft className="size-4" />
                              </button>
                            </div>
                          }
                          emptyState={
                            <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 px-4 py-8 text-center">
                              <p className="text-sm text-muted-foreground">
                                {normalizedQuery
                                  ? "No vehicles match your search."
                                  : "No similar vehicles found."}
                              </p>
                            </div>
                          }
                          onVehicleClick={(vehicle) => {
                            if (vehicle.vin) {
                              handleVehicleSelect(vehicle.vin);
                            }
                          }}
                          className="min-h-0 flex-1 border-0 bg-transparent"
                        />
                      ) : (
                        <VehicleListPanel
                          vehicles={vehicles}
                          selectedVin={selectedVehicleVin}
                          onCollapse={() => {
                            setIsListPanelOpen(false);
                            syncInventoryMapSelectedVinRef(null);
                            setSelectedVehicleVin(null);
                            setSimilarVehiclesSession(null);
                          }}
                          onVehicleClick={(vehicle) => {
                            if (vehicle.vin) {
                              handleVehicleSelect(vehicle.vin);
                            }
                          }}
                          className="min-h-0 flex-1 border-0 bg-transparent"
                        />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            <AnimatePresence initial={false}>
              {isListPanelOpen && selectedVehicle ? (
                <motion.div
                  key="vehicle-detail-floating-panel"
                  initial={{ x: -24, opacity: 0 }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    transition: { duration, ease: PANEL_EASE },
                  }}
                  exit={{
                    x: -24,
                    opacity: 0,
                    transition: {
                      duration: duration * 0.7,
                      ease: PANEL_EASE,
                    },
                  }}
                  className="pointer-events-auto absolute bottom-4 top-4 z-20 flex flex-col overflow-hidden rounded-lg border border-border bg-neutral-50 shadow-[0_4px_16px_rgba(0,0,0,0.08),0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.03] dark:border-border dark:bg-sidebar"
                  style={{
                    left: `${PANEL_WIDTH_PX + 24}px`,
                    width: DETAIL_PANEL_WIDTH_PX,
                    willChange: "transform, opacity",
                  }}
                >
                  <InventoryVehicleDetailPanel
                    key={selectedVehicle.vin}
                    vehicle={selectedVehicle}
                    statusIcons={getVehicleStatusIcons(
                      selectedVehicle.vin,
                      INVENTORY_PANEL_VEHICLES.findIndex(
                        (vehicle) => vehicle.vin === selectedVehicle.vin
                      )
                    )}
                    onBack={handleVehicleDetailBack}
                    onShowSimilarVehicles={handleShowSimilarVehicles}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
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
                  className="absolute inset-y-0 right-0 z-40 flex w-full max-w-[320px] flex-col overflow-hidden border border-border bg-background shadow-[-12px_0_32px_rgba(15,23,32,0.16)]"
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
            </div>
          </div>
        </motion.div>
      </div>
      <SendVehicleBrochureDialog
        open={sendBrochureDialogOpen}
        onOpenChange={setSendBrochureDialogOpen}
      />
    </div>
  );
}
