import type { Position } from "geojson";
import mapboxgl from "mapbox-gl";

import {
  SERVICE_DEFECTION_SPOKES_GEOJSON,
  SERVICE_DEFECTION_ZONE_FEATURE_IDS,
  SERVICE_DEFECTION_ZONES_GEOJSON,
  formatCompetitorKind,
  getCompetitorPolygonFeature,
  type CompetitorVenueKind,
  type ServiceDefectionGeofenceProperties,
} from "@/lib/marketing/service-defection-mock";

export const SERVICE_DEFECTION_MAP_SOURCE_ID = "service-defection-zones";
export const SERVICE_DEFECTION_SPOKES_SOURCE_ID = "service-defection-spokes";

const SPOKES_LAYER_ID = "service-defection-spokes-line";
const FILL_HOME_LAYER_ID = "service-defection-fill-home";
const FILL_COMPETITOR_LAYER_ID = "service-defection-fill-competitor";
const LINE_LAYER_ID = "service-defection-zones-line";

const FILL_LAYER_IDS = [FILL_HOME_LAYER_ID, FILL_COMPETITOR_LAYER_ID] as const;

/** Green (your lot) / red (competitors) — fill opacity with highlight pulse (legible on light + dark basemaps). */
const fillOpacityPaint: mapboxgl.Expression = [
  "case",
  ["boolean", ["feature-state", "highlight"], false],
  ["match", ["get", "zoneRole"], "competitor", 0.58, "home", 0.72, 0.28],
  ["match", ["get", "zoneRole"], "competitor", 0.4, "home", 0.52, 0.2],
];

const lineWidthPaint: mapboxgl.Expression = [
  "+",
  ["match", ["get", "zoneRole"], "home", 2.6, "competitor", 2.2, 1.5],
  ["case", ["boolean", ["feature-state", "highlight"], false], 3.4, 0],
];

function extendBoundsFromRing(
  bounds: mapboxgl.LngLatBounds,
  ring: Position[]
): void {
  for (const coord of ring) {
    const lng = coord[0];
    const lat = coord[1];
    if (typeof lng === "number" && typeof lat === "number") {
      bounds.extend([lng, lat]);
    }
  }
}

function boundsForServiceDefectionZones(): mapboxgl.LngLatBounds {
  const bounds = new mapboxgl.LngLatBounds();
  for (const feature of SERVICE_DEFECTION_ZONES_GEOJSON.features) {
    const { geometry } = feature;
    if (geometry.type !== "Polygon") continue;
    for (const ring of geometry.coordinates) {
      extendBoundsFromRing(bounds, ring);
    }
  }
  return bounds;
}

function removeLayerIfPresent(map: mapboxgl.Map, layerId: string): void {
  try {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  } catch {
    /* style may be mid-reload */
  }
}

export function teardownServiceDefectionMap(map: mapboxgl.Map): void {
  try {
    removeLayerIfPresent(map, SPOKES_LAYER_ID);
    removeLayerIfPresent(map, LINE_LAYER_ID);
    for (const id of FILL_LAYER_IDS) {
      removeLayerIfPresent(map, id);
    }
    if (map.getSource(SERVICE_DEFECTION_SPOKES_SOURCE_ID)) {
      map.removeSource(SERVICE_DEFECTION_SPOKES_SOURCE_ID);
    }
    if (map.getSource(SERVICE_DEFECTION_MAP_SOURCE_ID)) {
      map.removeSource(SERVICE_DEFECTION_MAP_SOURCE_ID);
    }
  } catch {
    /* map removing or style invalid */
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function popupSubtitle(
  props: ServiceDefectionGeofenceProperties
): string {
  if (props.zoneRole === "home") {
    return "Your lot";
  }
  if (props.zoneRole === "competitor" && props.zoneType) {
    return formatCompetitorKind(props.zoneType as CompetitorVenueKind);
  }
  return "Service area";
}

function buildPopupHtml(props: ServiceDefectionGeofenceProperties): string {
  const name = escapeHtml(props.name);
  const sub = escapeHtml(popupSubtitle(props));
  return `<div style="min-width:132px">
    <div style="font-weight:600;font-size:13px;line-height:1.25">${name}</div>
    <div style="font-size:11px;line-height:1.35;margin-top:3px;opacity:0.88">${sub}</div>
  </div>`;
}

/** Miles per degree latitude (approximate) — for nudging label anchor north of polygon. */
const MI_PER_DEG_LAT = 69;

/**
 * Anchor for a fixed map label above a competitor geofence: bbox top-center, nudged north
 * so the popup (Mapbox `anchor: "bottom"`) reads as sitting over the zone.
 */
export function getCompetitorListHoverPopupLngLat(
  competitorId: string
): mapboxgl.LngLatLike | null {
  const feature = getCompetitorPolygonFeature(competitorId);
  if (!feature || feature.geometry.type !== "Polygon") return null;
  const ring = feature.geometry.coordinates[0];
  let minLng = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const coord of ring) {
    const lng = coord[0];
    const lat = coord[1];
    if (typeof lng !== "number" || typeof lat !== "number") continue;
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }
  if (!Number.isFinite(minLng)) return null;
  const midLng = (minLng + maxLng) / 2;
  const offsetNorthMi = 0.028;
  return [midLng, maxLat + offsetNorthMi / MI_PER_DEG_LAT];
}

/** Same card chrome as map hover — name + kind subtitle from GeoJSON properties. */
export function buildServiceDefectionGeofencePopupHtml(
  competitorId: string
): string | null {
  const feature = getCompetitorPolygonFeature(competitorId);
  if (!feature) return null;
  return buildPopupHtml(
    feature.properties as ServiceDefectionGeofenceProperties
  );
}

function defectionLayersExist(map: mapboxgl.Map): boolean {
  return Boolean(
    map.getLayer(FILL_HOME_LAYER_ID) && map.getLayer(FILL_COMPETITOR_LAYER_ID)
  );
}

export interface ServiceDefectionMapSetupOptions {
  onMapFeatureHoverIdChange?: (featureId: string | null) => void;
  /** Use light popup chrome on light basemap (see `globals.css` `.geofence-popup--light`). */
  popupVariant?: "dark" | "light";
  /**
   * When true, cursor-following geofence popups are hidden (e.g. defection list is showing a
   * fixed anchor popup above the highlighted zone).
   */
  suppressHoverPopup?: () => boolean;
}

/**
 * Syncs polygon outline/fill emphasis with list hover or map hover (`featureId` is `properties.id`).
 */
export function applyServiceDefectionHighlight(
  map: mapboxgl.Map,
  activeFeatureId: string | null
): void {
  try {
    if (!map.isStyleLoaded()) return;
    if (!map.getSource(SERVICE_DEFECTION_MAP_SOURCE_ID)) return;
    if (!defectionLayersExist(map)) return;
    for (const fid of SERVICE_DEFECTION_ZONE_FEATURE_IDS) {
      try {
        map.setFeatureState(
          { source: SERVICE_DEFECTION_MAP_SOURCE_ID, id: fid },
          { highlight: Boolean(activeFeatureId) && fid === activeFeatureId }
        );
      } catch {
        /* feature or source unavailable during style transition */
      }
    }
  } catch {
    /* ignore */
  }
}

/**
 * Home (green) + competitors (red), dashed hub-and-spoke lines from your lot to each competitor,
 * and a camera fit that shows every polygon (no fixed-mile ring).
 */
export function setupServiceDefectionMap(
  map: mapboxgl.Map,
  options?: ServiceDefectionMapSetupOptions
): () => void {
  teardownServiceDefectionMap(map);

  const onMapFeatureHoverIdChange = options?.onMapFeatureHoverIdChange;
  const suppressHoverPopup = options?.suppressHoverPopup;
  const popupClassName =
    options?.popupVariant === "light"
      ? "geofence-popup geofence-popup--light"
      : "geofence-popup";

  let alive = true;

  try {
    if (!map.isStyleLoaded()) {
      return () => {
        alive = false;
      };
    }

    map.addSource(SERVICE_DEFECTION_MAP_SOURCE_ID, {
      type: "geojson",
      data: SERVICE_DEFECTION_ZONES_GEOJSON,
      promoteId: "id",
    });

    map.addSource(SERVICE_DEFECTION_SPOKES_SOURCE_ID, {
      type: "geojson",
      data: SERVICE_DEFECTION_SPOKES_GEOJSON,
      lineMetrics: true,
    });

    const homeGreen = "rgb(16, 185, 129)";
    const competitorRed = "rgb(239, 68, 68)";
    const homeLine = "rgba(110, 231, 183, 0.98)";
    const competitorLine = "rgba(252, 165, 165, 0.98)";

    const fillColorExpr: mapboxgl.Expression = [
      "match",
      ["get", "zoneRole"],
      "competitor",
      competitorRed,
      "home",
      homeGreen,
      "rgb(100, 116, 139)",
    ];

    /**
     * Polygon fills + outlines first so a bad hub-and-spoke line layer never blocks geofences.
     * `line-gradient` cannot be combined with `line-dasharray` (Mapbox style spec) — that pairing
     * caused `addLayer` to fail in GL JS v3 and aborted setup before fills were added.
     */
    map.addLayer({
      id: FILL_HOME_LAYER_ID,
      type: "fill",
      source: SERVICE_DEFECTION_MAP_SOURCE_ID,
      filter: ["==", ["get", "zoneRole"], "home"],
      paint: {
        "fill-color": fillColorExpr,
        "fill-opacity": fillOpacityPaint,
      },
    });

    map.addLayer({
      id: FILL_COMPETITOR_LAYER_ID,
      type: "fill",
      source: SERVICE_DEFECTION_MAP_SOURCE_ID,
      filter: ["==", ["get", "zoneRole"], "competitor"],
      paint: {
        "fill-color": fillColorExpr,
        "fill-opacity": fillOpacityPaint,
      },
    });

    map.addLayer({
      id: LINE_LAYER_ID,
      type: "line",
      source: SERVICE_DEFECTION_MAP_SOURCE_ID,
      paint: {
        "line-color": [
          "match",
          ["get", "zoneRole"],
          "competitor",
          competitorLine,
          "home",
          homeLine,
          "rgba(148, 163, 184, 0.85)",
        ],
        "line-width": lineWidthPaint,
      },
    });

    try {
      map.addLayer({
        id: SPOKES_LAYER_ID,
        type: "line",
        source: SERVICE_DEFECTION_SPOKES_SOURCE_ID,
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-gradient": [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            "rgba(52, 211, 153, 0.82)",
            0.5,
            "rgba(250, 204, 21, 0.45)",
            1,
            "rgba(248, 113, 113, 0.88)",
          ],
          "line-width": 2.25,
          "line-opacity": 0.92,
          "line-blur": 0.25,
        },
      });
    } catch {
      /* Hub–spoke lines are optional; geofence fills must still render. */
    }

    const bounds = boundsForServiceDefectionZones();
    map.fitBounds(bounds, {
      padding: { top: 56, bottom: 56, left: 56, right: 56 },
      /** Tighter framing so ~1–2 mi competitor rings fill the viewport. */
      maxZoom: 15.6,
      duration: 0,
    });
  } catch {
    return () => {
      alive = false;
      teardownServiceDefectionMap(map);
    };
  }

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 10,
    className: popupClassName,
  });

  let lastReportedMapHoverId: string | null = null;

  const safeRemovePopup = () => {
    try {
      popup.remove();
    } catch {
      /* popup DOM may be detached */
    }
  };

  const handleMouseMove = (e: mapboxgl.MapMouseEvent) => {
    if (!alive) return;
    try {
      if (!map.isStyleLoaded() || !defectionLayersExist(map)) {
        safeRemovePopup();
        return;
      }

      let feats: mapboxgl.MapboxGeoJSONFeature[] = [];
      try {
        feats = map.queryRenderedFeatures(e.point, {
          layers: [...FILL_LAYER_IDS],
        });
      } catch {
        return;
      }

      const raw = feats[0]?.properties as
        | ServiceDefectionGeofenceProperties
        | undefined;
      const id = raw?.id ?? null;

      if (id !== lastReportedMapHoverId) {
        lastReportedMapHoverId = id;
        onMapFeatureHoverIdChange?.(id);
      }

      const canvas = map.getCanvas();
      if (suppressHoverPopup?.()) {
        safeRemovePopup();
        canvas.style.cursor = raw?.name ? "pointer" : "";
      } else if (raw?.name) {
        popup.setLngLat(e.lngLat).setHTML(buildPopupHtml(raw)).addTo(map);
        canvas.style.cursor = "pointer";
      } else {
        safeRemovePopup();
        canvas.style.cursor = "";
      }
    } catch {
      /* ignore during zoom / style churn */
    }
  };

  const handleMapContainerLeave = () => {
    if (!alive) return;
    lastReportedMapHoverId = null;
    onMapFeatureHoverIdChange?.(null);
    safeRemovePopup();
    try {
      map.getCanvas().style.cursor = "";
    } catch {
      /* ignore */
    }
  };

  map.on("mousemove", handleMouseMove);
  const container = map.getContainer();
  container.addEventListener("mouseleave", handleMapContainerLeave);

  return () => {
    alive = false;
    try {
      map.off("mousemove", handleMouseMove);
    } catch {
      /* ignore */
    }
    try {
      container.removeEventListener("mouseleave", handleMapContainerLeave);
    } catch {
      /* ignore */
    }
    safeRemovePopup();
    teardownServiceDefectionMap(map);
  };
}

export function fitMapToCompetitor(
  map: mapboxgl.Map,
  competitorId: string
): void {
  try {
    if (!map.isStyleLoaded()) return;
    if (!map.getSource(SERVICE_DEFECTION_MAP_SOURCE_ID)) return;
    if (!defectionLayersExist(map)) return;
  } catch {
    return;
  }

  const feature = getCompetitorPolygonFeature(competitorId);
  if (!feature || feature.geometry.type !== "Polygon") return;

  const bounds = new mapboxgl.LngLatBounds();
  for (const ring of feature.geometry.coordinates) {
    extendBoundsFromRing(bounds, ring);
  }
  try {
    map.fitBounds(bounds, { padding: 72, maxZoom: 16.2, duration: 700 });
  } catch {
    /* ignore */
  }
}
