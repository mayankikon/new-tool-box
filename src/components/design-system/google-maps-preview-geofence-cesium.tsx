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
import { useEffect, useRef } from "react";

import type { DesignSystemMapsGeofenceVertex } from "@/lib/design-system/design-system-maps-geofence-storage";

const ENTITY_FILL_ID = "design-system-geofence-fill";
const ENTITY_DRAFT_POLYLINE_ID = "design-system-geofence-draft-polyline";
const ENTITY_DRAFT_FILL_ID = "design-system-geofence-draft-fill";
const ENTITY_VTX_PREFIX = "design-system-geofence-draft-vtx-";
const MAX_VERTEX_ENTITIES = 64;

/** Extra meters above the highest vertex so roofs / mesh near the top pick stay inside the volume. */
const GEOFENCE_EXTRUSION_CLEARANCE_ABOVE_MAX_M = 1;

function vertexHeightM(vertex: DesignSystemMapsGeofenceVertex): number {
  const h = vertex[2];
  return h != null && Number.isFinite(h) ? h : 0;
}

/**
 * Vertical extent for an extruded prism: flat footprint at {@link bottomEllipsoidM},
 * extruded to {@link topEllipsoidM} (covers all picked heights plus clearance above the max).
 */
function computeExtrusionEllipsoidBoundsM(heightsM: number[]): {
  bottomEllipsoidM: number;
  topEllipsoidM: number;
} {
  if (heightsM.length === 0) {
    return { bottomEllipsoidM: 0, topEllipsoidM: GEOFENCE_EXTRUSION_CLEARANCE_ABOVE_MAX_M };
  }
  let minH = heightsM[0]!;
  let maxH = heightsM[0]!;
  for (let i = 1; i < heightsM.length; i += 1) {
    const h = heightsM[i]!;
    if (h < minH) minH = h;
    if (h > maxH) maxH = h;
  }
  return {
    bottomEllipsoidM: minH,
    topEllipsoidM: maxH + GEOFENCE_EXTRUSION_CLEARANCE_ABOVE_MAX_M,
  };
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
  onAddPoint,
}: {
  viewerRef: RefObject<Viewer | null>;
  active: boolean;
  savedRing: DesignSystemMapsGeofenceVertex[] | null;
  draftPoints: readonly DesignSystemMapsGeofenceVertex[];
  isDrawing: boolean;
  onAddPoint: (lng: number, lat: number, heightM: number) => void;
}) {
  const scratchCartographic = useRef(new Cartographic());
  const draftPointsRef = useRef(draftPoints);
  const cursorRef = useRef<{ lng: number; lat: number; heightM: number } | null>(null);
  const onAddPointRef = useRef(onAddPoint);
  const isDrawingRef = useRef(isDrawing);

  draftPointsRef.current = draftPoints;
  onAddPointRef.current = onAddPoint;
  isDrawingRef.current = isDrawing;

  const rebuildDraftOverlay = (viewer: Viewer) => {
    if (!isDrawingRef.current) {
      return;
    }
    removeDraftOverlayEntities(viewer);

    const draft = draftPointsRef.current;
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
      const { bottomEllipsoidM, topEllipsoidM } = computeExtrusionEllipsoidBoundsM(extrusionHeightsM);
      const footprint = footprintLonLat.map(({ lng, lat }) => Cartesian3.fromDegrees(lng, lat));
      viewer.entities.add({
        id: ENTITY_DRAFT_FILL_ID,
        polygon: {
          hierarchy: new PolygonHierarchy(footprint),
          height: bottomEllipsoidM,
          extrudedHeight: topEllipsoidM,
          material: Color.fromBytes(59, 130, 246, 155),
          outline: true,
          outlineColor: Color.fromBytes(37, 99, 235, 200),
          outlineWidth: 1,
          perPositionHeight: false,
        },
      });
    }
  };

  useEffect(() => {
    if (!active) return;
    const viewer = viewerRef.current;
    if (viewer == null || viewer.isDestroyed()) return;

    const existing = viewer.entities.getById(ENTITY_FILL_ID);
    if (existing) {
      viewer.entities.remove(existing);
    }

    if (savedRing != null && savedRing.length >= 3) {
      const heightsM = savedRing.map(vertexHeightM);
      const { bottomEllipsoidM, topEllipsoidM } = computeExtrusionEllipsoidBoundsM(heightsM);
      const footprint = savedRing.map(([lng, lat]) => Cartesian3.fromDegrees(lng, lat));
      viewer.entities.add({
        id: ENTITY_FILL_ID,
        polygon: {
          hierarchy: new PolygonHierarchy(footprint),
          height: bottomEllipsoidM,
          extrudedHeight: topEllipsoidM,
          material: Color.fromBytes(59, 130, 246, 195),
          outline: true,
          outlineColor: Color.fromBytes(37, 99, 235, 230),
          outlineWidth: 2,
          perPositionHeight: false,
        },
      });
    }

    return () => {
      const v = viewerRef.current;
      if (v != null && !v.isDestroyed()) {
        const e = v.entities.getById(ENTITY_FILL_ID);
        if (e) v.entities.remove(e);
      }
    };
  }, [active, viewerRef, savedRing]);

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
  }, [active, isDrawing, draftPoints, viewerRef]);

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
      onAddPointRef.current(picked.lng, picked.lat, picked.heightM);
      cursorRef.current = picked;
    };

    handler.setInputAction(onMove, ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(onClick, ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.destroy();
      canvas.style.cursor = priorCursor;
    };
  }, [active, isDrawing, viewerRef]);

  return null;
}
