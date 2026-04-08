"use client";

import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  SceneTransforms,
  type Ellipsoid,
} from "@cesium/engine";
import type { Viewer } from "@cesium/widgets";
import type { RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";

/** Nudge sampled mesh height slightly toward the ground to reduce “hovering” when zooming (pin art + LOD bias). */
const SAMPLED_SURFACE_OFFSET_M = -2.75;

/** Re-sample 3D tile heights after zoom stops so LOD matches what you see (debounced). */
const ZOOM_RESAMPLE_DEBOUNCE_MS = 480;
/** Ignore small camera height jitter (mostly pan / tilt at similar distance). */
const EYE_HEIGHT_RESAMPLE_MIN_DELTA_M = 55;
const EYE_HEIGHT_RESAMPLE_MIN_RATIO = 0.17;

import { KeysMapMarkerPin } from "@/components/ui/keys-map-marker-pin";
import { VehicleMapMarkerPin } from "@/components/ui/vehicle-map-marker-pin";
import type { VehicleMapMarkerPinTone } from "@/components/ui/vehicle-map-marker-pin";
import { VehicleMapClusterMarker } from "@/components/ui/vehicle-map-cluster-marker";
import { VehicleMapMarkerChip, VEHICLE_MARKER_CHIP_STROKE_HEX } from "@/components/ui/vehicle-map-marker-chip";
import { cn } from "@/lib/utils";
import {
  resolveMarker3dTier,
  clusterMarkersForHeight,
  type Marker3dClusterResult,
} from "@/lib/design-system/design-system-maps-3d-marker-tiers";

export type GoogleMapsPreview3dMarker = {
  id: string;
  lng: number;
  lat: number;
  /**
   * Fallback height in meters above the WGS84 ellipsoid when scene height sampling is unavailable.
   */
  heightM?: number;
  /**
   * When set with {@link skipSceneHeightSampling}, anchor pins at this ellipsoid height instead of
   * {@link Scene#sampleHeightMostDetailed} (avoids roof meshes; used for pins inside a saved geofence floor).
   */
  ellipsoidHeightM?: number;
  /** If true, do not use scene height sampling; use {@link ellipsoidHeightM} or {@link heightM}. */
  skipSceneHeightSampling?: boolean;
  variant: "keys" | VehicleMapMarkerPinTone;
  /** CloudFront vehicle image URL for the chip tier (VehicleMapMarkerChip). */
  imageSrc?: string;
  /** Lot-age tier index (0 = teal/fresh, 1 = gold/aging, 2 = red/stale) for chip stroke color. */
  ageTier?: number;
};

interface GoogleMapsPreview3dHtmlMarkersProps {
  viewerRef: RefObject<Viewer | null>;
  visible: boolean;
  markers: readonly GoogleMapsPreview3dMarker[];
  /** Camera eye height in meters — drives tier switching (dealership / cluster / pin / chip). */
  surfaceHeightM: number;
  /** Geofence centroid for the single dealership icon at far zoom. */
  geofenceCentroid?: { lng: number; lat: number } | null;
  /** Ellipsoid height for the dealership icon (defaults to average marker height). */
  dealershipHeightM?: number;
}

const scratchAdjustCartographic = new Cartographic();

function cartesianFromSampledHeight(
  m: GoogleMapsPreview3dMarker,
  cartographic: Cartographic | undefined,
  ellipsoid: Ellipsoid,
): Cartesian3 {
  if (m.skipSceneHeightSampling) {
    const h = m.ellipsoidHeightM ?? m.heightM ?? 12;
    return Cartesian3.fromDegrees(m.lng, m.lat, h + SAMPLED_SURFACE_OFFSET_M);
  }
  if (
    cartographic != null &&
    cartographic.height != null &&
    !Number.isNaN(cartographic.height)
  ) {
    const adjusted = Cartographic.clone(cartographic, scratchAdjustCartographic);
    adjusted.height += SAMPLED_SURFACE_OFFSET_M;
    return Cartographic.toCartesian(adjusted, ellipsoid, new Cartesian3());
  }
  return Cartesian3.fromDegrees(m.lng, m.lat, m.heightM ?? 12);
}

/**
 * Renders design-system map marker pins as HTML positioned with Cesium
 * {@link SceneTransforms.worldToWindowCoordinates}.
 *
 * Positions use {@link Scene#sampleHeightMostDetailed} when supported so anchors sit on
 * photorealistic 3D Tiles geometry instead of a bare ellipsoid — avoiding parallax “drift”
 * when the camera pans/tilts. Falls back to ellipsoid height when sampling is unavailable.
 * When the camera “zooms” (large eye-height change), heights are re-sampled (debounced) so
 * the picked surface matches the current tile LOD; a small negative height nudge reduces
 * residual float vs the mesh when zooming.
 */
/** Default lat/viewport for Supercluster zoom conversion — matches the preview dealership area. */
const DEFAULT_CLUSTER_LAT_DEG = 32.93;
const DEFAULT_VIEWPORT_HEIGHT_PX = 560;

const DEALERSHIP_MARKER_ID = "dealership-single";

export function GoogleMapsPreview3dHtmlMarkers({
  viewerRef,
  visible,
  markers,
  surfaceHeightM,
  geofenceCentroid: centroid,
  dealershipHeightM,
}: GoogleMapsPreview3dHtmlMarkersProps) {
  const markerElementsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const cartesianByIdRef = useRef<Record<string, Cartesian3>>({});
  const overlayRef = useRef<HTMLDivElement | null>(null);
  /** One scratch Cartesian2 per marker id — avoids reusing a single result buffer across calls. */
  const winByIdRef = useRef<Record<string, Cartesian2>>({});
  const eyeAtLastSampleMRef = useRef<number | null>(null);
  const zoomResampleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tier = resolveMarker3dTier(surfaceHeightM);

  const clusters: Marker3dClusterResult[] | null = useMemo(() => {
    if (tier !== "cluster" || markers.length === 0) return null;
    return clusterMarkersForHeight(
      markers,
      surfaceHeightM,
      DEFAULT_CLUSTER_LAT_DEG,
      DEFAULT_VIEWPORT_HEIGHT_PX,
    );
  }, [tier, markers, surfaceHeightM]);

  const dealershipItem: Marker3dClusterResult | null = useMemo(() => {
    if (tier !== "dealership" || !centroid) return null;
    return {
      id: DEALERSHIP_MARKER_ID,
      lng: centroid.lng,
      lat: centroid.lat,
      pointCount: markers.length,
      countLabel: String(markers.length),
    };
  }, [tier, centroid, markers.length]);

  /** Snap lon/lat to detailed surface height (3D Tiles + terrain) to remove depth parallax vs mesh. */
  useEffect(() => {
    if (!visible) return;
    const viewer = viewerRef.current;
    if (viewer == null || viewer.isDestroyed()) return;

    const scene = viewer.scene;
    let cancelled = false;

    const ellipsoid = scene.ellipsoid;
    const scratchEyeCartographic = new Cartographic();
    let activeSampleId = 0;

    const applyCartesiansFromCartographics = (cartographics: Cartographic[]) => {
      const next: Record<string, Cartesian3> = {};
      for (let i = 0; i < markers.length; i++) {
        const m = markers[i];
        const c = cartographics[i];
        next[m.id] = cartesianFromSampledHeight(m, c, ellipsoid);
      }
      cartesianByIdRef.current = next;
    };

    const fallbackEllipsoidOnly = () => {
      cartesianByIdRef.current = Object.fromEntries(
        markers.map((m) => [m.id, cartesianFromSampledHeight(m, undefined, ellipsoid)]),
      );
    };

    const runSampleHeight = async (cartographics: Cartographic[]) => {
      if (!scene.sampleHeightSupported) return;
      const sampleId = ++activeSampleId;
      try {
        await scene.sampleHeightMostDetailed(cartographics);
      } catch {
        /* tiles may still be loading */
      }
      if (cancelled || viewer.isDestroyed() || sampleId !== activeSampleId) return;
      applyCartesiansFromCartographics(cartographics);
      const eyeCartographic = Cartographic.fromCartesian(
        viewer.camera.position,
        ellipsoid,
        scratchEyeCartographic,
      );
      eyeAtLastSampleMRef.current = eyeCartographic.height;
    };

    fallbackEllipsoidOnly();
    eyeAtLastSampleMRef.current = null;

    const allSkipSampling = markers.length > 0 && markers.every((m) => m.skipSceneHeightSampling);

    void (async () => {
      if (allSkipSampling || !scene.sampleHeightSupported) {
        return;
      }

      const cartographics = markers.map((m) => Cartographic.fromDegrees(m.lng, m.lat, 0));
      const maxAttempts = 6;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (cancelled || viewer.isDestroyed()) return;
        await runSampleHeight(cartographics);
        const allHeightsKnown = cartographics.every(
          (c) => c != null && c.height != null && !Number.isNaN(c.height),
        );
        if (allHeightsKnown) return;
        await new Promise((r) => setTimeout(r, 1200));
      }
    })();

    const scheduleZoomResample = () => {
      if (
        cancelled ||
        viewer.isDestroyed() ||
        !scene.sampleHeightSupported ||
        (markers.length > 0 && markers.every((m) => m.skipSceneHeightSampling))
      ) {
        return;
      }

      if (zoomResampleTimerRef.current != null) {
        clearTimeout(zoomResampleTimerRef.current);
      }

      zoomResampleTimerRef.current = setTimeout(() => {
        zoomResampleTimerRef.current = null;
        if (cancelled || viewer.isDestroyed()) return;

        const eyeCartographic = Cartographic.fromCartesian(
          viewer.camera.position,
          ellipsoid,
          scratchEyeCartographic,
        );
        const eyeM = eyeCartographic.height;
        const lastM = eyeAtLastSampleMRef.current;
        if (lastM != null) {
          const deltaM = Math.abs(eyeM - lastM);
          const ratio = lastM > 1 ? deltaM / lastM : 0;
          if (deltaM < EYE_HEIGHT_RESAMPLE_MIN_DELTA_M && ratio < EYE_HEIGHT_RESAMPLE_MIN_RATIO) {
            return;
          }
        }

        const cartographics = markers.map((m) => Cartographic.fromDegrees(m.lng, m.lat, 0));
        void runSampleHeight(cartographics);
      }, ZOOM_RESAMPLE_DEBOUNCE_MS);
    };

    viewer.camera.changed.addEventListener(scheduleZoomResample);

    return () => {
      cancelled = true;
      if (zoomResampleTimerRef.current != null) {
        clearTimeout(zoomResampleTimerRef.current);
        zoomResampleTimerRef.current = null;
      }
      // Init effect may destroy the viewer first; camera touches scene after destroy.
      if (!viewer.isDestroyed()) {
        viewer.camera.changed.removeEventListener(scheduleZoomResample);
      }
    };
  }, [visible, viewerRef, markers]);

  const clusterCartesianByIdRef = useRef<Record<string, Cartesian3>>({});

  useEffect(() => {
    const next: Record<string, Cartesian3> = {};

    const avgH =
      markers.length > 0
        ? markers.reduce((s, m) => s + (m.ellipsoidHeightM ?? m.heightM ?? 12), 0) / markers.length
        : 12;
    const baseH = (dealershipHeightM ?? avgH) + SAMPLED_SURFACE_OFFSET_M;

    if (dealershipItem) {
      next[dealershipItem.id] = Cartesian3.fromDegrees(dealershipItem.lng, dealershipItem.lat, baseH);
    }
    if (clusters) {
      for (const c of clusters) {
        next[c.id] = Cartesian3.fromDegrees(c.lng, c.lat, avgH + SAMPLED_SURFACE_OFFSET_M);
      }
    }

    clusterCartesianByIdRef.current = next;
  }, [clusters, dealershipItem, markers, dealershipHeightM]);

  /** Items currently rendered in the overlay — individual markers, clusters, or single dealership icon. */
  const renderedItems: { id: string }[] =
    tier === "dealership" && dealershipItem
      ? [dealershipItem]
      : tier === "cluster" && clusters
        ? clusters
        : (markers as unknown as { id: string }[]);

  useEffect(() => {
    if (!visible) return;
    const viewer = viewerRef.current;
    if (viewer == null || viewer.isDestroyed()) return;

    const scene = viewer.scene;
    const updatePositions = () => {
      if (viewer.isDestroyed()) return;
      const overlay = overlayRef.current;
      if (!overlay) return;
      const or = overlay.getBoundingClientRect();
      const canvas = scene.canvas;
      const cr = canvas.getBoundingClientRect();

      const positionSource =
        tier === "cluster" ? clusterCartesianByIdRef.current : cartesianByIdRef.current;

      for (const item of renderedItems) {
        const el = markerElementsRef.current[item.id];
        const cartesian = positionSource[item.id];
        if (!el || !cartesian) continue;

        let winScratch = winByIdRef.current[item.id];
        if (!winScratch) {
          winScratch = new Cartesian2();
          winByIdRef.current[item.id] = winScratch;
        }

        const win = SceneTransforms.worldToWindowCoordinates(scene, cartesian, winScratch);
        if (win == null) {
          el.style.visibility = "hidden";
          continue;
        }

        const x = cr.left - or.left + win.x;
        const y = cr.top - or.top + win.y;
        el.style.visibility = "visible";
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
      }
    };

    scene.postRender.addEventListener(updatePositions);
    updatePositions();

    return () => {
      if (!viewer.isDestroyed()) {
        scene.postRender.removeEventListener(updatePositions);
      }
    };
  }, [visible, viewerRef, markers, tier, clusters, renderedItems]);

  if (!visible) {
    return null;
  }

  const renderMarkerContent = () => {
    if (tier === "dealership" && dealershipItem) {
      return (
        <div
          key={dealershipItem.id}
          ref={(el) => {
            markerElementsRef.current[dealershipItem.id] = el;
            if (el) el.style.visibility = "hidden";
          }}
          className={cn(
            "pointer-events-auto absolute left-0 top-0 origin-bottom",
            "will-change-transform",
          )}
        >
          <VehicleMapClusterMarker
            variant="group-active"
            countLabel={dealershipItem.countLabel}
            hoverable
            title={`Dealership — ${dealershipItem.countLabel} vehicles`}
          />
        </div>
      );
    }

    if (tier === "cluster" && clusters) {
      return clusters.map((c) => (
        <div
          key={c.id}
          ref={(el) => {
            markerElementsRef.current[c.id] = el;
            if (el) el.style.visibility = "hidden";
          }}
          className={cn(
            "pointer-events-auto absolute left-0 top-0 origin-bottom",
            "will-change-transform",
          )}
        >
          <VehicleMapClusterMarker
            variant="number-default"
            countLabel={c.countLabel}
            hoverable
            title={`Cluster — ${c.countLabel} vehicles`}
          />
        </div>
      ));
    }

    return markers.map((m) => (
      <div
        key={m.id}
        ref={(el) => {
          markerElementsRef.current[m.id] = el;
          if (el) el.style.visibility = "hidden";
        }}
        className={cn(
          "pointer-events-auto absolute left-0 top-0 origin-bottom",
          "will-change-transform",
        )}
      >
        {tier === "chip" ? (
          <VehicleMapMarkerChip
            variantIndex={m.ageTier ?? 0}
            imageSrc={m.imageSrc}
            title={`Vehicle — ${m.id}`}
            hoverOverlayColor={VEHICLE_MARKER_CHIP_STROKE_HEX[m.ageTier ?? 0]}
          />
        ) : m.variant === "keys" ? (
          <KeysMapMarkerPin hoverable title={`Keys — ${m.id}`} />
        ) : (
          <VehicleMapMarkerPin tone={m.variant} hoverable title={`Vehicle — ${m.id}`} />
        )}
      </div>
    ));
  };

  return (
    <div
      ref={overlayRef}
      className="pointer-events-none absolute inset-0 z-[100] overflow-hidden"
    >
      {renderMarkerContent()}
    </div>
  );
}
