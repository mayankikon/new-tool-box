import mapboxgl from "mapbox-gl";
import { activityHeatmapMockGeoJSON } from "@/lib/inventory/activity-heatmap-mock";
import { ACTIVITY_TRACKING_CIRCLE_GEOJSON } from "@/lib/marketing/service-defection-mock";

export const ACTIVITY_HEATMAP_SOURCE_ID = "activity-heatmap-source";
export const ACTIVITY_HEATMAP_LAYER_ID = "activity-heatmap-layer";

export const ACTIVITY_TRACKING_CIRCLE_SOURCE_ID = "activity-tracking-circle-source";
export const ACTIVITY_TRACKING_CIRCLE_FILL_LAYER_ID = "activity-tracking-circle-fill";
export const ACTIVITY_TRACKING_CIRCLE_LINE_LAYER_ID = "activity-tracking-circle-line";

/** Monitor: heatmap sits under service-defection polygon fills. */
const SERVICE_DEFECTION_FILL_HOME_LAYER_ID = "service-defection-fill-home";

/** Inventory map: heatmap under clustered vehicle layer when that map is used. */
const INVENTORY_CLUSTERS_LAYER_ID = "inventory-clusters";

function resolveActivityHeatmapBeforeId(map: mapboxgl.Map): string | undefined {
  if (map.getLayer(SERVICE_DEFECTION_FILL_HOME_LAYER_ID)) {
    return SERVICE_DEFECTION_FILL_HOME_LAYER_ID;
  }
  if (map.getLayer(INVENTORY_CLUSTERS_LAYER_ID)) {
    return INVENTORY_CLUSTERS_LAYER_ID;
  }
  if (map.getLayer("road-highlight")) {
    return "road-highlight";
  }
  return undefined;
}

/**
 * Adds GeoJSON sources + heatmap + tracking disc (fill under heatmap, outline on top).
 * Safe to call when style is loaded.
 */
export function ensureActivityHeatmapSourceAndLayer(map: mapboxgl.Map) {
  if (!map.getSource(ACTIVITY_TRACKING_CIRCLE_SOURCE_ID)) {
    map.addSource(ACTIVITY_TRACKING_CIRCLE_SOURCE_ID, {
      type: "geojson",
      data: ACTIVITY_TRACKING_CIRCLE_GEOJSON,
    });
  }

  if (!map.getSource(ACTIVITY_HEATMAP_SOURCE_ID)) {
    map.addSource(ACTIVITY_HEATMAP_SOURCE_ID, {
      type: "geojson",
      data: activityHeatmapMockGeoJSON,
    });
  }

  const beforeId = resolveActivityHeatmapBeforeId(map);

  if (!map.getLayer(ACTIVITY_TRACKING_CIRCLE_FILL_LAYER_ID) && beforeId) {
    map.addLayer(
      {
        id: ACTIVITY_TRACKING_CIRCLE_FILL_LAYER_ID,
        type: "fill",
        source: ACTIVITY_TRACKING_CIRCLE_SOURCE_ID,
        paint: {
          "fill-color": "rgba(21, 93, 252, 0.06)",
          "fill-outline-color": "rgba(0,0,0,0)",
        },
      },
      beforeId
    );
  }

  if (!map.getLayer(ACTIVITY_HEATMAP_LAYER_ID) && beforeId) {
    map.addLayer(
      {
        id: ACTIVITY_HEATMAP_LAYER_ID,
        type: "heatmap",
        source: ACTIVITY_HEATMAP_SOURCE_ID,
        maxzoom: 20,
        paint: {
          "heatmap-weight": ["coalesce", ["to-number", ["get", "weight"]], 0.5],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9,
            0.42,
            11,
            0.48,
            14,
            0.35,
            16,
            0.72,
            18,
            1.15,
          ],
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.15,
            "rgba(34,197,94,0.45)",
            0.4,
            "rgba(234,179,8,0.72)",
            0.65,
            "rgba(249,115,22,0.88)",
            1,
            "rgba(220,38,38,0.95)",
          ],
          "heatmap-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9,
            82,
            11,
            62,
            13,
            44,
            14,
            36,
            16,
            38,
            18,
            48,
          ],
          "heatmap-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9,
            0.5,
            11,
            0.58,
            14,
            0.55,
            17,
            0.78,
            18,
            0.85,
          ],
        },
      },
      beforeId
    );
  }

  if (!map.getLayer(ACTIVITY_TRACKING_CIRCLE_LINE_LAYER_ID)) {
    map.addLayer({
      id: ACTIVITY_TRACKING_CIRCLE_LINE_LAYER_ID,
      type: "line",
      source: ACTIVITY_TRACKING_CIRCLE_SOURCE_ID,
      paint: {
        "line-color": "rgba(21, 93, 252, 0.85)",
        "line-width": 2,
        "line-dasharray": [2, 2],
        "line-opacity": 0.9,
      },
    });
  }
}

export function setActivityHeatmapVisibility(map: mapboxgl.Map, visible: boolean) {
  const vis = visible ? "visible" : "none";
  if (map.getLayer(ACTIVITY_HEATMAP_LAYER_ID)) {
    map.setLayoutProperty(ACTIVITY_HEATMAP_LAYER_ID, "visibility", vis);
  }
  if (map.getLayer(ACTIVITY_TRACKING_CIRCLE_FILL_LAYER_ID)) {
    map.setLayoutProperty(ACTIVITY_TRACKING_CIRCLE_FILL_LAYER_ID, "visibility", vis);
  }
  if (map.getLayer(ACTIVITY_TRACKING_CIRCLE_LINE_LAYER_ID)) {
    map.setLayoutProperty(ACTIVITY_TRACKING_CIRCLE_LINE_LAYER_ID, "visibility", vis);
  }
}

/** Idempotent teardown when basemap style changes. */
export function removeActivityHeatmapFromMap(map: mapboxgl.Map) {
  if (map.getLayer(ACTIVITY_TRACKING_CIRCLE_LINE_LAYER_ID)) {
    map.removeLayer(ACTIVITY_TRACKING_CIRCLE_LINE_LAYER_ID);
  }
  if (map.getLayer(ACTIVITY_HEATMAP_LAYER_ID)) {
    map.removeLayer(ACTIVITY_HEATMAP_LAYER_ID);
  }
  if (map.getLayer(ACTIVITY_TRACKING_CIRCLE_FILL_LAYER_ID)) {
    map.removeLayer(ACTIVITY_TRACKING_CIRCLE_FILL_LAYER_ID);
  }
  if (map.getSource(ACTIVITY_HEATMAP_SOURCE_ID)) {
    map.removeSource(ACTIVITY_HEATMAP_SOURCE_ID);
  }
  if (map.getSource(ACTIVITY_TRACKING_CIRCLE_SOURCE_ID)) {
    map.removeSource(ACTIVITY_TRACKING_CIRCLE_SOURCE_ID);
  }
}
