"use client";

import {
  Cartesian3,
  Cartographic,
  Color,
  defined,
  Ellipsoid,
  Math as CesiumMath,
  PolygonHierarchy,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from "@cesium/engine";
import type { Viewer } from "@cesium/widgets";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef } from "react";

import type { DesignSystemMapsGeofenceVertex } from "@/lib/design-system/design-system-maps-geofence-storage";

const ENTITY_FILL_ID = "design-system-geofence-fill";
const ENTITY_DRAFT_POLYLINE_ID = "design-system-geofence-draft-polyline";
const ENTITY_DRAFT_FILL_ID = "design-system-geofence-draft-fill";
const ENTITY_VTX_PREFIX = "design-system-geofence-draft-vtx-";
const MAX_VERTEX_ENTITIES = 64;

const SHADE_HSL_BY_NAME = {
  blue: { h: 214 / 360, s: 0.82, l: 0.6 },
  green: { h: 145 / 360, s: 0.65, l: 0.52 },
  yellow: { h: 52 / 360, s: 0.92, l: 0.58 },
  cyan: { h: 188 / 360, s: 0.78, l: 0.56 },
  orange: { h: 28 / 360, s: 0.9, l: 0.58 },
  purple: { h: 270 / 360, s: 0.72, l: 0.6 },
  red: { h: 2 / 360, s: 0.82, l: 0.58 },
} as const;

function vertexHeightM(vertex: DesignSystemMapsGeofenceVertex): number {
  const h = vertex[2];
  return h != null && Number.isFinite(h) ? h : 0;
}

function computeExtrusionBaseEllipsoidM(heightsM: number[]): number {
  if (heightsM.length === 0) {
    return 0;
  }
  let minH = heightsM[0]!;
  for (let i = 1; i < heightsM.length; i += 1) {
    const h = heightsM[i]!;
    if (h < minH) minH = h;
  }
  return minH;
}

function vertexToCartesian(vertex: DesignSystemMapsGeofenceVertex): Cartesian3 {
  const [lng, lat, heightM] = vertex;
  return Cartesian3.fromDegrees(lng, lat, heightM ?? 0);
}

function removeDraftOverlayEntities(viewer: Viewer): void {
  const ids = [ENTITY_DRAFT_POLYLINE_ID, ENTITY_DRAFT_FILL_ID];
  for (let i = 0; i < MAX_VERTEX_ENTITIES; i += 1) {
    ids.push(`${ENTITY_VTX_PREFIX}${i}`);
  }
  for (const id of ids) {
    const existing = viewer.entities.getById(id);
    if (existing) {
      viewer.entities.remove(existing);
    }
  }
}

/**
 * Picks the 3D position under the cursor (Photorealistic 3D Tiles). `pickEllipsoid` only hits the
 * WGS84 ellipsoid and does not match what you see when the globe is off — vertices looked "moved".
 */
function pickPositionOnScene(
  viewer: Viewer,
  windowPosition: import("@cesium/engine").Cartesian2,
  scratch: Cartographic,
): { lng: number; lat: number; heightM: number } | null {
  const scene = viewer.scene;
  if (scene.pickPositionSupported) {
    const picked = scene.pickPosition(windowPosition);
    if (defined(picked)) {
      const c = Cartographic.fromCartesian(picked, Ellipsoid.WGS84, scratch);
      return {
        lng: CesiumMath.toDegrees(c.longitude),
        lat: CesiumMath.toDegrees(c.latitude),
        heightM: c.height,
      };
    }
  }
  const ellipsoid = scene.globe?.ellipsoid ?? Ellipsoid.WGS84;
  const ellipsoidPick = viewer.camera.pickEllipsoid(windowPosition, ellipsoid);
  if (!defined(ellipsoidPick)) {
    return null;
  }
  const c = Cartographic.fromCartesian(ellipsoidPick, ellipsoid, scratch);
  return {
    lng: CesiumMath.toDegrees(c.longitude),
    lat: CesiumMath.toDegrees(c.latitude),
    heightM: c.height,
  };
}

/**
 * Renders saved + draft geofence graphics in Cesium. Uses depth picking on 3D Tiles so vertices match clicks.
 * Draft mode: vertex markers, edge polyline, rubber-band to cursor, semi-transparent fill (Google Earth–style).
 */
export function GoogleMapsGeofenceCesiumSync({
  viewerRef,
  active,
  savedRing,
  draftPoints,
  isDrawing,
  geofenceTuning,
  onAddPoint,
}: {
  viewerRef: RefObject<Viewer | null>;
  active: boolean;
  savedRing: DesignSystemMapsGeofenceVertex[] | null;
  draftPoints: readonly DesignSystemMapsGeofenceVertex[];
  isDrawing: boolean;
  geofenceTuning: {
    extrusion: number;
    strokeShade: "blue" | "green" | "yellow" | "cyan" | "orange" | "purple" | "red";
    opacity: number;
  };
  onAddPoint: (lng: number, lat: number, heightM: number) => void;
}) {
  const scratchCartographic = useRef(new Cartographic());
  const cursorRef = useRef<{ lng: number; lat: number; heightM: number } | null>(null);
  const rebuildDraftOverlay = useCallback((viewer: Viewer) => {
    if (!isDrawing) {
      return;
    }
    removeDraftOverlayEntities(viewer);

    const draft = draftPoints;
    const cursor = cursorRef.current;

    draft.forEach((vertex, index) => {
      viewer.entities.add({
        id: `${ENTITY_VTX_PREFIX}${index}`,
        position: vertexToCartesian(vertex),
        point: {
          pixelSize: 9,
          color: Color.fromBytes(255, 255, 255, 255),
          outlineColor: Color.fromBytes(37, 99, 235, 255),
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });
    });

    const linePositions: Cartesian3[] = draft.map(vertexToCartesian);
    if (cursor != null && draft.length >= 1) {
      linePositions.push(Cartesian3.fromDegrees(cursor.lng, cursor.lat, cursor.heightM));
    }
    if (linePositions.length >= 2) {
      viewer.entities.add({
        id: ENTITY_DRAFT_POLYLINE_ID,
        polyline: {
          positions: linePositions,
          width: 2,
          material: Color.fromAlpha(Color.fromBytes(96, 165, 250, 255), 0.95),
        },
      });
    }

    type LonLat = { lng: number; lat: number };
    let footprintLonLat: LonLat[] | null = null;
    let extrusionHeightsM: number[] | null = null;

    if (draft.length >= 2 && cursor != null) {
      footprintLonLat = [...draft.map(([lng, lat]) => ({ lng, lat })), { lng: cursor.lng, lat: cursor.lat }];
      extrusionHeightsM = [...draft.map(vertexHeightM), cursor.heightM];
    } else if (draft.length >= 3) {
      footprintLonLat = draft.map(([lng, lat]) => ({ lng, lat }));
      extrusionHeightsM = draft.map(vertexHeightM);
    }

    if (footprintLonLat != null && extrusionHeightsM != null && footprintLonLat.length >= 3) {
      const bottomEllipsoidM = computeExtrusionBaseEllipsoidM(extrusionHeightsM);
      const extrusionTopM = bottomEllipsoidM + geofenceTuning.extrusion;
      const footprint = footprintLonLat.map(({ lng, lat }) => Cartesian3.fromDegrees(lng, lat));
      const shadeHsl = SHADE_HSL_BY_NAME[geofenceTuning.strokeShade];
      const strokeAlpha = CesiumMath.clamp(geofenceTuning.opacity / 10, 0, 1);
      const edgeColor = Color.fromHsl(
        shadeHsl.h,
        CesiumMath.clamp(shadeHsl.s * 0.82, 0, 1),
        CesiumMath.clamp(0.4, 0, 1),
        strokeAlpha,
      );
      const fillColor = Color.fromHsl(
        shadeHsl.h,
        CesiumMath.clamp(shadeHsl.s * 0.72, 0, 1),
        shadeHsl.l,
        CesiumMath.clamp(0.12 + strokeAlpha * 0.35, 0.08, 0.5),
      );
      viewer.entities.add({
        id: ENTITY_DRAFT_FILL_ID,
        polygon: {
          hierarchy: new PolygonHierarchy(footprint),
          height: bottomEllipsoidM,
          extrudedHeight: extrusionTopM,
          material: fillColor,
          outline: true,
          outlineColor: edgeColor,
          outlineWidth: 2,
          perPositionHeight: false,
        },
      });
    }
  }, [
    draftPoints,
    geofenceTuning.extrusion,
    geofenceTuning.opacity,
    geofenceTuning.strokeShade,
    isDrawing,
  ]);

  useEffect(() => {
    if (!active) return;
    const viewer = viewerRef.current;
    if (viewer == null || viewer.isDestroyed()) return;

    const existing = viewer.entities.getById(ENTITY_FILL_ID);
    if (existing) {
      viewer.entities.remove(existing);
    }
    if (savedRing != null && savedRing.length >= 3) {
      const bottomEllipsoidM = computeExtrusionBaseEllipsoidM(savedRing.map(vertexHeightM));
      const extrusionTopM = bottomEllipsoidM + geofenceTuning.extrusion;
      const footprint = savedRing.map(([lng, lat]) => Cartesian3.fromDegrees(lng, lat));
      const shadeHsl = SHADE_HSL_BY_NAME[geofenceTuning.strokeShade];
      const strokeAlpha = CesiumMath.clamp(geofenceTuning.opacity / 10, 0, 1);
      const edgeColor = Color.fromHsl(
        shadeHsl.h,
        CesiumMath.clamp(shadeHsl.s * 0.82, 0, 1),
        CesiumMath.clamp(0.4, 0, 1),
        strokeAlpha,
      );
      const fillColor = Color.fromHsl(
        shadeHsl.h,
        CesiumMath.clamp(shadeHsl.s * 0.72, 0, 1),
        shadeHsl.l,
        CesiumMath.clamp(0.12 + strokeAlpha * 0.35, 0.08, 0.5),
      );
      viewer.entities.add({
        id: ENTITY_FILL_ID,
        polygon: {
          hierarchy: new PolygonHierarchy(footprint),
          height: bottomEllipsoidM,
          extrudedHeight: extrusionTopM,
          material: fillColor,
          outline: true,
          outlineColor: edgeColor,
          outlineWidth: 2,
          perPositionHeight: false,
        },
      });
    }

    return () => {
      if (viewer.isDestroyed()) return;
      const e = viewer.entities.getById(ENTITY_FILL_ID);
      if (e) viewer.entities.remove(e);
    };
  }, [
    active,
    geofenceTuning.extrusion,
    geofenceTuning.opacity,
    geofenceTuning.strokeShade,
    viewerRef,
    savedRing,
  ]);

  useEffect(() => {
    if (!active || !isDrawing) {
      cursorRef.current = null;
      const viewer = viewerRef.current;
      if (viewer != null && !viewer.isDestroyed()) {
        removeDraftOverlayEntities(viewer);
      }
      return;
    }

    const viewer = viewerRef.current;
    if (viewer == null || viewer.isDestroyed()) return;

    rebuildDraftOverlay(viewer);
  }, [active, isDrawing, rebuildDraftOverlay, viewerRef]);

  useEffect(() => {
    if (!active || !isDrawing) {
      const viewer = viewerRef.current;
      if (viewer != null && !viewer.isDestroyed()) {
        viewer.scene.canvas.style.cursor = "";
      }
      return;
    }

    const viewer = viewerRef.current;
    if (viewer == null || viewer.isDestroyed()) return;

    const scene = viewer.scene;
    const canvas = scene.canvas;
    const priorCursor = canvas.style.cursor;
    canvas.style.cursor = "crosshair";

    const handler = new ScreenSpaceEventHandler(canvas);

    const onMove = (movement: { endPosition: import("@cesium/engine").Cartesian2 }) => {
      const picked = pickPositionOnScene(viewer, movement.endPosition, scratchCartographic.current);
      cursorRef.current = picked;
      rebuildDraftOverlay(viewer);
    };

    const onClick = (click: { position: import("@cesium/engine").Cartesian2 }) => {
      const picked = pickPositionOnScene(viewer, click.position, scratchCartographic.current);
      if (!picked) return;
      onAddPoint(picked.lng, picked.lat, picked.heightM);
      cursorRef.current = picked;
    };

    handler.setInputAction(onMove, ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(onClick, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      canvas.style.cursor = priorCursor;
    };
  }, [active, isDrawing, onAddPoint, rebuildDraftOverlay, viewerRef]);

  return null;
}
