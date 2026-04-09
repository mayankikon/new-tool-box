"use client";

import { Cartographic, Math as CesiumMath } from "@cesium/engine";
import type { Viewer } from "@cesium/widgets";
import {
  Minus,
  Pentagon,
  Plus,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  GoogleMapsPreview3dHtmlMarkers,
  type GoogleMapsPreview3dMarker,
} from "@/components/design-system/google-maps-preview-3d-html-markers";
import { GoogleMapsGeofenceCesiumSync } from "@/components/design-system/google-maps-preview-geofence-cesium";
import { GoogleMapsGeofencePanel } from "@/components/design-system/google-maps-preview-geofence-panel";
import { MapControlButton } from "@/components/ui/mapbox-map";
import {
  buildGeofenceInteriorPreviewMarkers,
} from "@/lib/design-system/design-system-maps-geofence-interior-markers";
import { resolveMarker3dTier, geofenceCentroid } from "@/lib/design-system/design-system-maps-3d-marker-tiers";
import { minVertexEllipsoidHeightM } from "@/lib/design-system/design-system-maps-geofence-interior-markers";
import {
  clearDesignSystemMapsGeofence,
  loadDesignSystemMapsGeofence,
  type DesignSystemMapsGeofenceVertex,
  saveDesignSystemMapsGeofence,
} from "@/lib/design-system/design-system-maps-geofence-storage";
import { cn } from "@/lib/utils";

/** Default view: 1101 W State Hwy 114, Grapevine, TX 76051 */
const DEFAULT_LNG = -97.0922;
const DEFAULT_LAT = 32.9273;
/** 2D satellite framing (Maps JS). */
const DEFAULT_SATELLITE_ZOOM = 18;
/** Eye height (meters) for an oblique “Earth-style” framing (3D). */
const DEFAULT_CAMERA_HEIGHT_M = 280;
const DEFAULT_HEADING_RAD = CesiumMath.toRadians(25);
const DEFAULT_PITCH_RAD = CesiumMath.toRadians(-40);
const MIN_SURFACE_HEIGHT_M = 45;
const MAX_SURFACE_HEIGHT_M = 400_000;
const APPLIED_MAP_TUNING = {
  camera: {
    tilt: 40,
    compassDirection: 279,
  },
  geofence: {
    extrusion: 5.5,
    strokeShade: "blue" as const,
    opacity: 5.5,
  },
  markers: {
    vehicleSize: 0.9,
    keysSize: 0.9,
    hoverScale: 1.1,
    hoverOverlayIntensity: 5,
    hoverLiftHeight: 0,
    hoverShadowIntensity: 5,
    pinShadow: 3,
  },
} as const;

const EARTH_CIRCUMFERENCE_M = 40_075_016.686;

/** Sample WGS84 pins around the default Grapevine, TX framing — same design-system assets as Components → Map Markers. */
const PREVIEW_3D_MAP_MARKERS: readonly GoogleMapsPreview3dMarker[] = [
  { id: "preview-teal", lng: -97.09305, lat: 32.92785, heightM: 14, variant: "teal" },
  { id: "preview-gold", lng: -97.09185, lat: 32.92655, heightM: 14, variant: "gold" },
  { id: "preview-teal-2", lng: -97.09075, lat: 32.92745, heightM: 14, variant: "teal" },
  { id: "preview-teal-3", lng: -97.09255, lat: 32.92815, heightM: 14, variant: "teal" },
  { id: "preview-teal-4", lng: -97.094, lat: 32.9276, heightM: 14, variant: "teal" },
  { id: "preview-teal-5", lng: -97.08995, lat: 32.92685, heightM: 14, variant: "teal" },
  { id: "preview-gold-2", lng: -97.09115, lat: 32.92695, heightM: 14, variant: "gold" },
  { id: "preview-gold-3", lng: -97.09335, lat: 32.92725, heightM: 14, variant: "gold" },
  { id: "preview-gold-4", lng: -97.0902, lat: 32.92835, heightM: 14, variant: "gold" },
  { id: "preview-gold-5", lng: -97.0921, lat: 32.92595, heightM: 14, variant: "gold" },
  { id: "preview-red", lng: -97.09045, lat: 32.92705, heightM: 14, variant: "red" },
  { id: "preview-red-2", lng: -97.09285, lat: 32.92635, heightM: 14, variant: "red" },
  { id: "preview-red-3", lng: -97.09365, lat: 32.92845, heightM: 14, variant: "red" },
  { id: "preview-red-4", lng: -97.08895, lat: 32.92755, heightM: 14, variant: "red" },
];

/** Cycle for vehicle pin tones when many markers are placed inside a saved geofence. */
const PREVIEW_3D_MARKER_VARIANT_CYCLE = PREVIEW_3D_MAP_MARKERS.map((m) => m.variant);

const MISSING_KEY_HELP =
  "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_MAP_TILES_API_KEY to .env.local. Enable the Maps JavaScript API (for 2D satellite) and Map Tiles API / Photorealistic 3D Tiles (for 3D) for that key.";

/** Served from `public/cesium/` via `scripts/copy-cesium-assets.mjs` (postinstall). */
const CESIUM_BASE_URL = "/cesium/";

function resolveGoogleMapsApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAP_TILES_API_KEY ??
    ""
  );
}

function metersPerPixelAtLatZoom(latDeg: number, zoom: number): number {
  const latRad = (latDeg * Math.PI) / 180;
  return (EARTH_CIRCUMFERENCE_M * Math.cos(latRad)) / (256 * Math.pow(2, zoom));
}

/** Rough eye height for Cesium from Maps zoom and viewport height. */
function eyeHeightFromMapZoom(latDeg: number, zoom: number, viewportHeightPx: number): number {
  const mpp = metersPerPixelAtLatZoom(latDeg, zoom);
  const groundSpanM = mpp * viewportHeightPx * 0.85;
  return CesiumMath.clamp(groundSpanM * 1.15, MIN_SURFACE_HEIGHT_M, MAX_SURFACE_HEIGHT_M);
}

/** Rough Maps zoom from Cesium camera height. */
function zoomFromEyeHeight(latDeg: number, heightM: number, viewportHeightPx: number): number {
  const groundSpanM = heightM / 1.15;
  const mpp = groundSpanM / (viewportHeightPx * 0.85);
  const cosLat = Math.cos((latDeg * Math.PI) / 180);
  if (cosLat < 1e-6) return 10;
  const z = Math.log2((EARTH_CIRCUMFERENCE_M * cosLat) / (256 * mpp));
  return Math.max(0, Math.min(21, z));
}

function zoomStepMeters(viewer: Viewer): number {
  const h = Cartographic.fromCartesian(viewer.camera.position).height;
  return CesiumMath.clamp(h * 0.12, 25, 350);
}

declare global {
  interface Window {
    CESIUM_BASE_URL?: string;
  }
}

interface Pending3dView {
  lat: number;
  lng: number;
  heightM: number;
  headingRad: number;
}

/**
 * Toggle 2D satellite (Maps JavaScript API) and photorealistic 3D (Cesium + Map Tiles API).
 * Custom 3D controls: zoom +/-, compass row, tilt +/-.
 */
export function GoogleMapsPreview() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const map2dContainerRef = useRef<HTMLDivElement>(null);
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const pending3dFlyRef = useRef<Pending3dView | null>(null);

  const keyOnMount = resolveGoogleMapsApiKey();
  const [mapMode, setMapMode] = useState<"2d" | "3d">("2d");
  /** 0 = Cesium not started; 1 = start / keep one Viewer instance. */
  const [cesiumInitToken, setCesiumInitToken] = useState(0);

  const [maps2dStatus, setMaps2dStatus] = useState<"idle" | "loading" | "ready" | "error">(() =>
    keyOnMount ? "idle" : "error",
  );
  const [maps2dError, setMaps2dError] = useState<string | null>(null);

  const [cesiumStatus, setCesiumStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [cesiumErrorMessage, setCesiumErrorMessage] = useState<string | null>(null);

  /** Pitch in degrees; negative = look toward surface (Cesium convention). */
  const [pitchDeg, setPitchDeg] = useState(0);
  /** Eye height above ellipsoid — drives zoom button enable/disable. */
  const [surfaceHeightM, setSurfaceHeightM] = useState(0);

  const [geofencePanelOpen, setGeofencePanelOpen] = useState(true);
  const [geofenceDrawing, setGeofenceDrawing] = useState(false);
  const [geofenceDraft, setGeofenceDraft] = useState<DesignSystemMapsGeofenceVertex[]>([]);
  const [geofenceSavedRing, setGeofenceSavedRing] = useState<DesignSystemMapsGeofenceVertex[] | null>(
    null,
  );

  /** When a geofence is saved, show preview pins inside its footprint at the geofence floor (not on roofs). */
  const preview3dMarkers = useMemo((): readonly GoogleMapsPreview3dMarker[] => {
    if (geofenceSavedRing != null && geofenceSavedRing.length >= 3) {
      const interior = buildGeofenceInteriorPreviewMarkers(
        geofenceSavedRing,
        PREVIEW_3D_MARKER_VARIANT_CYCLE,
      );
      if (interior.length > 0) {
        return interior;
      }
    }
    return PREVIEW_3D_MAP_MARKERS;
  }, [geofenceSavedRing]);

  const savedGeofenceCentroid = useMemo(
    () => (geofenceSavedRing != null && geofenceSavedRing.length >= 3 ? geofenceCentroid(geofenceSavedRing) : null),
    [geofenceSavedRing],
  );

  const savedGeofenceFloorM = useMemo(
    () => (geofenceSavedRing != null && geofenceSavedRing.length >= 3 ? minVertexEllipsoidHeightM(geofenceSavedRing) + 0.5 : undefined),
    [geofenceSavedRing],
  );

  const keyMissing = !keyOnMount;

  useEffect(() => {
    const stored = loadDesignSystemMapsGeofence();
    if (stored != null && stored.ring.length >= 3) {
      setGeofenceSavedRing(stored.ring);
    }
  }, []);

  useEffect(() => {
    const apiKey = resolveGoogleMapsApiKey();
    const el = map2dContainerRef.current;
    if (!apiKey || !el) {
      if (!apiKey) {
        setMaps2dStatus("error");
        setMaps2dError(MISSING_KEY_HELP);
      }
      return;
    }

    const map2dMountEl = el;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setMaps2dStatus("loading");
        setMaps2dError(null);
      }
    });

    void (async () => {
      try {
        const { setOptions, importLibrary } = await import("@googlemaps/js-api-loader");
        setOptions({ key: apiKey, v: "weekly" });
        const { Map: GoogleMapCtor } = await importLibrary("maps");
        if (cancelled || !map2dContainerRef.current) return;

        const map = new GoogleMapCtor(map2dContainerRef.current, {
          center: { lat: DEFAULT_LAT, lng: DEFAULT_LNG },
          zoom: DEFAULT_SATELLITE_ZOOM,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          tilt: 0,
          heading: CesiumMath.toDegrees(DEFAULT_HEADING_RAD),
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          rotateControl: true,
          zoomControl: true,
        });
        if (cancelled) return;
        googleMapRef.current = map;
        setMaps2dStatus("ready");
      } catch (error: unknown) {
        if (cancelled) return;
        setMaps2dStatus("error");
        setMaps2dError(
          error instanceof Error ? error.message : "Failed to load Google Maps (2D satellite).",
        );
      }
    })();

    return () => {
      cancelled = true;
      googleMapRef.current = null;
      map2dMountEl.replaceChildren();
    };
  }, [keyOnMount]);

  useEffect(() => {
    if (cesiumInitToken === 0) return;

    const apiKey = resolveGoogleMapsApiKey();
    const container = cesiumContainerRef.current;
    if (!apiKey || !container) {
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setCesiumStatus("loading");
        setCesiumErrorMessage(null);
      }
    });

    void (async () => {
      try {
        window.CESIUM_BASE_URL = CESIUM_BASE_URL;

        const [engine, widgets] = await Promise.all([
          import("@cesium/engine"),
          import("@cesium/widgets"),
        ]);
        await import("cesium/Build/Cesium/Widgets/widgets.css");

        if (cancelled || !container) return;

        const { Cesium3DTileset, Resource, Cartesian3, Color } = engine;
        const { Viewer } = widgets;

        const viewer = new Viewer(container, {
          globe: false,
          baseLayer: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          vrButton: false,
          infoBox: false,
          selectionIndicator: false,
          // Credits rendered off-DOM for this internal preview; restore visible attribution before production.
          creditContainer: document.createElement("div"),
        });

        viewer.scene.backgroundColor = Color.fromBytes(15, 18, 24, 255);

        const tilesetUrl = new Resource({
          url: "https://tile.googleapis.com/v1/3dtiles/root.json",
          queryParameters: { key: apiKey },
        });

        const tileset = await Cesium3DTileset.fromUrl(tilesetUrl, {
          showCreditsOnScreen: false,
        });

        viewer.scene.primitives.add(tileset);

        if (cancelled) {
          viewer.destroy();
          return;
        }

        const pending = pending3dFlyRef.current;
        pending3dFlyRef.current = null;

        if (pending) {
          await viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(pending.lng, pending.lat, pending.heightM),
            orientation: {
              heading: pending.headingRad,
              pitch: DEFAULT_PITCH_RAD,
              roll: 0,
            },
            duration: 2,
          });
        } else {
          await viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(
              DEFAULT_LNG,
              DEFAULT_LAT,
              DEFAULT_CAMERA_HEIGHT_M,
            ),
            orientation: {
              heading: DEFAULT_HEADING_RAD,
              pitch: DEFAULT_PITCH_RAD,
              roll: 0,
            },
            duration: 2,
          });
        }

        if (cancelled) {
          viewer.destroy();
          return;
        }

        viewerRef.current = viewer;
        setPitchDeg(CesiumMath.toDegrees(viewer.camera.pitch));
        setSurfaceHeightM(Cartographic.fromCartesian(viewer.camera.position).height);
        setCesiumStatus("ready");
      } catch (error: unknown) {
        if (cancelled) return;
        setCesiumStatus("error");
        setCesiumErrorMessage(error instanceof Error ? error.message : "Failed to load 3D map.");
      }
    })();

    return () => {
      cancelled = true;
      const v = viewerRef.current;
      viewerRef.current = null;
      if (v != null) {
        v.destroy();
      }
    };
  }, [cesiumInitToken]);

  useEffect(() => {
    if (cesiumStatus !== "ready") return;
    const viewer = viewerRef.current;
    if (viewer == null) return;

    const sync = () => {
      const c = viewer.camera;
      setPitchDeg(CesiumMath.toDegrees(c.pitch));
      setSurfaceHeightM(Cartographic.fromCartesian(c.position).height);
    };

    viewer.camera.changed.addEventListener(sync);
    sync();

    return () => {
      // Init effect may destroy the viewer first; avoid touching camera after destroy.
      if (viewer.isDestroyed()) return;
      viewer.camera.changed.removeEventListener(sync);
    };
  }, [cesiumStatus]);

  useEffect(() => {
    const map = googleMapRef.current;
    if (map == null || mapMode !== "2d") return;
    map.setHeading(APPLIED_MAP_TUNING.camera.compassDirection);
    // Maps JS only supports non-zero tilt in supported imagery contexts; it safely clamps/ignores otherwise.
    map.setTilt(APPLIED_MAP_TUNING.camera.tilt);
  }, [mapMode]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer == null || viewer.isDestroyed() || mapMode !== "3d" || cesiumStatus !== "ready") return;
    const c = viewer.camera;
    c.setView({
      orientation: {
        heading: CesiumMath.toRadians(APPLIED_MAP_TUNING.camera.compassDirection),
        pitch: CesiumMath.toRadians(-APPLIED_MAP_TUNING.camera.tilt),
        roll: c.roll,
      },
    });
  }, [cesiumStatus, mapMode]);

  const viewportHeightPx = () => wrapperRef.current?.clientHeight ?? 560;

  const handleSwitchTo3d = useCallback(() => {
    const map = googleMapRef.current;
    const vp = viewportHeightPx();
    if (map) {
      const c = map.getCenter();
      if (c) {
        const lat = c.lat();
        const lng = c.lng();
        const z = map.getZoom() ?? DEFAULT_SATELLITE_ZOOM;
        const headingDegMap = map.getHeading() ?? 0;
        pending3dFlyRef.current = {
          lat,
          lng,
          heightM: eyeHeightFromMapZoom(lat, z, vp),
          headingRad: CesiumMath.toRadians(headingDegMap),
        };
      } else {
        pending3dFlyRef.current = null;
      }
    } else {
      pending3dFlyRef.current = null;
    }
    setCesiumInitToken((t) => (t === 0 ? 1 : t));
    setMapMode("3d");
  }, []);

  const handleSwitchTo2d = useCallback(() => {
    const viewer = viewerRef.current;
    const map = googleMapRef.current;
    const vp = viewportHeightPx();
    if (viewer && map && cesiumStatus === "ready") {
      const carto = Cartographic.fromCartesian(viewer.camera.position);
      const lat = CesiumMath.toDegrees(carto.latitude);
      const lng = CesiumMath.toDegrees(carto.longitude);
      const h = carto.height;
      const headDeg = CesiumMath.toDegrees(viewer.camera.heading);
      map.setCenter({ lat, lng });
      map.setZoom(zoomFromEyeHeight(lat, h, vp));
      map.setHeading(((headDeg % 360) + 360) % 360);
      map.setTilt(0);
    }
    setMapMode("2d");
  }, [cesiumStatus]);

  const handleZoomIn = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer == null) return;
    const h = Cartographic.fromCartesian(viewer.camera.position).height;
    if (h < MIN_SURFACE_HEIGHT_M + 5) return;
    viewer.camera.moveForward(zoomStepMeters(viewer));
  }, []);

  const handleZoomOut = useCallback(() => {
    const viewer = viewerRef.current;
    if (viewer == null) return;
    const h = Cartographic.fromCartesian(viewer.camera.position).height;
    if (h > MAX_SURFACE_HEIGHT_M) return;
    viewer.camera.moveBackward(zoomStepMeters(viewer));
  }, []);

  const handleSetTilt = useCallback((tiltDeg: number) => {
    const viewer = viewerRef.current;
    if (viewer == null) return;
    const c = viewer.camera;
    const newPitch = CesiumMath.clamp(
      CesiumMath.toRadians(-tiltDeg),
      -CesiumMath.PI_OVER_TWO + 0.02,
      0,
    );
    c.setView({
      orientation: {
        heading: c.heading,
        pitch: newPitch,
        roll: c.roll,
      },
    });
  }, []);

  const handleGeofenceAddPoint = useCallback((lng: number, lat: number, heightM: number) => {
    setGeofenceDraft((prev) => [...prev, [lng, lat, heightM]]);
  }, []);

  const handleGeofenceStart = useCallback(() => {
    setGeofenceDraft([]);
    setGeofenceDrawing(true);
  }, []);

  const handleGeofenceCancel = useCallback(() => {
    setGeofenceDraft([]);
    setGeofenceDrawing(false);
  }, []);

  const handleGeofenceComplete = useCallback(() => {
    setGeofenceDraft((current) => {
      if (current.length < 3) return current;
      const ring: DesignSystemMapsGeofenceVertex[] = current.map(([lng, lat, h]) => [
        lng,
        lat,
        h ?? 0,
      ]);
      saveDesignSystemMapsGeofence(ring);
      queueMicrotask(() => {
        setGeofenceSavedRing(ring);
        setGeofenceDrawing(false);
      });
      return [];
    });
  }, []);

  const handleGeofenceClearSaved = useCallback(() => {
    clearDesignSystemMapsGeofence();
    setGeofenceSavedRing(null);
  }, []);

  const geofenceMapReady = mapMode === "3d" && cesiumStatus === "ready";
  const tiltDisplayDeg = Math.round(-pitchDeg);
  const canZoomIn = cesiumStatus === "ready" && surfaceHeightM > MIN_SURFACE_HEIGHT_M;
  const canZoomOut = cesiumStatus === "ready" && surfaceHeightM < MAX_SURFACE_HEIGHT_M;

  if (keyMissing) {
    return (
      <div className="rounded-md border border-border bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Maps preview could not be loaded</p>
        <p className="mt-2 max-w-2xl leading-relaxed">{MISSING_KEY_HELP}</p>
      </div>
    );
  }

  const mapMinHeightClass = "min-h-[min(70vh,560px)]";

  const show2dErrorOverlay = maps2dStatus === "error" && maps2dError && mapMode === "2d";
  const show2dLoading = (maps2dStatus === "loading" || maps2dStatus === "idle") && mapMode === "2d";
  const show3dLoading =
    mapMode === "3d" && (cesiumStatus === "loading" || cesiumStatus === "idle");
  const show3dError = mapMode === "3d" && cesiumStatus === "error" && cesiumErrorMessage;

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "relative w-full overflow-hidden rounded-md border border-border bg-[#0f1218] shadow-sm",
        mapMinHeightClass,
      )}
    >
      <div
        ref={map2dContainerRef}
        className={cn(
          "absolute inset-0 z-0",
          mapMode !== "2d" && "invisible pointer-events-none",
          mapMinHeightClass,
        )}
        role="application"
        aria-label="Google satellite map (2D)"
      />
      <div
        ref={cesiumContainerRef}
        className={cn(
          "absolute inset-0 z-0",
          mapMode !== "3d" && "invisible pointer-events-none",
          mapMinHeightClass,
          "[&_.cesium-viewer-toolbar]:hidden [&_.cesium-viewer-bottom]:hidden [&_.cesium-viewer]:min-h-[inherit] [&_.cesium-viewer-cesiumWidgetContainer]:min-h-[inherit]",
        )}
        role="application"
        aria-label="Google Photorealistic 3D map preview"
      />

      <GoogleMapsPreview3dHtmlMarkers
        viewerRef={viewerRef}
        visible={mapMode === "3d" && cesiumStatus === "ready"}
        markers={preview3dMarkers}
        surfaceHeightM={surfaceHeightM}
        geofenceCentroid={savedGeofenceCentroid}
        dealershipHeightM={savedGeofenceFloorM}
        markerTuning={{
          vehicleScale: APPLIED_MAP_TUNING.markers.vehicleSize,
          keysScale: APPLIED_MAP_TUNING.markers.keysSize,
          hoverScale: APPLIED_MAP_TUNING.markers.hoverScale,
          hoverOverlayIntensity: APPLIED_MAP_TUNING.markers.hoverOverlayIntensity,
          hoverLiftPx: APPLIED_MAP_TUNING.markers.hoverLiftHeight,
          hoverShadowIntensity: APPLIED_MAP_TUNING.markers.hoverShadowIntensity,
          shadowIntensity: APPLIED_MAP_TUNING.markers.pinShadow,
        }}
      />

      <GoogleMapsGeofenceCesiumSync
        viewerRef={viewerRef}
        active={geofenceMapReady}
        savedRing={geofenceSavedRing}
        draftPoints={geofenceDraft}
        isDrawing={geofenceDrawing}
        geofenceTuning={{
          extrusion: APPLIED_MAP_TUNING.geofence.extrusion,
          strokeShade: APPLIED_MAP_TUNING.geofence.strokeShade,
          opacity: APPLIED_MAP_TUNING.geofence.opacity,
        }}
        onAddPoint={handleGeofenceAddPoint}
      />

      <GoogleMapsGeofencePanel
        expanded={geofencePanelOpen}
        onExpandedChange={setGeofencePanelOpen}
        isDrawing={geofenceDrawing}
        onStartDrawing={handleGeofenceStart}
        onCancelDrawing={handleGeofenceCancel}
        onCompleteDrawing={handleGeofenceComplete}
        draftPointCount={geofenceDraft.length}
        draftVertices={geofenceDraft}
        hasSavedGeofence={geofenceSavedRing != null && geofenceSavedRing.length >= 3}
        onClearSaved={handleGeofenceClearSaved}
        drawDisabled={!geofenceMapReady}
      />

      <div
        className="absolute left-3 top-3 z-[2000] flex gap-1.5 pointer-events-auto touch-manipulation"
        role="group"
        aria-label="Map mode"
      >
        <MapControlButton
          type="button"
          aria-pressed={mapMode === "2d"}
          aria-label="Satellite (2D)"
          onClick={handleSwitchTo2d}
          className={cn(
            "pointer-events-auto min-h-11 min-w-11 touch-manipulation",
            mapMode === "2d" &&
              "border-[rgba(21,92,255,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.98))] text-primary shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_8px_18px_rgba(21,92,255,0.12),0px_0px_0px_1px_rgba(21,92,255,0.08)]",
          )}
        >
          <span className="px-1 text-xs font-semibold">2D</span>
        </MapControlButton>
        <MapControlButton
          type="button"
          aria-pressed={mapMode === "3d"}
          aria-label="Photorealistic 3D"
          onClick={handleSwitchTo3d}
          className={cn(
            "pointer-events-auto min-h-11 min-w-11 touch-manipulation",
            mapMode === "3d" &&
              "border-[rgba(21,92,255,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.98))] text-primary shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_8px_18px_rgba(21,92,255,0.12),0px_0px_0px_1px_rgba(21,92,255,0.08)]",
          )}
        >
          <span className="px-1 text-xs font-semibold">3D</span>
        </MapControlButton>
      </div>

      {show2dLoading ? (
        <div
          className={`pointer-events-none absolute inset-0 z-10 flex w-full items-center justify-center bg-[#0f1218]/80 text-sm text-muted-foreground backdrop-blur-[1px]`}
          aria-live="polite"
        >
          Loading satellite map…
        </div>
      ) : null}

      {show2dErrorOverlay ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f1218]/90 p-4 text-center text-sm text-muted-foreground">
          <p className="max-w-md">{maps2dError}</p>
        </div>
      ) : null}

      {show3dLoading ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex w-full items-center justify-center bg-[#0f1218]/80 text-sm text-muted-foreground backdrop-blur-[1px]"
          aria-live="polite"
        >
          Loading photorealistic 3D map…
        </div>
      ) : null}

      {show3dError ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0f1218]/90 p-4 text-center text-sm text-muted-foreground">
          <p className="max-w-md">{cesiumErrorMessage}</p>
        </div>
      ) : null}

      {mapMode === "3d" ? (
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-end justify-between">
          {cesiumStatus === "ready" ? (
            <div className="pointer-events-auto flex flex-col items-start gap-1.5">
              <div className="min-w-[7rem] rounded-[8px] border border-border bg-card/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm dark:bg-card/90">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Eye height</p>
                <p className="tabular-nums text-sm font-semibold text-foreground">
                  {surfaceHeightM >= 1000
                    ? `${(surfaceHeightM / 1000).toFixed(2)} km`
                    : `${Math.round(surfaceHeightM)} m`}
                </p>
              </div>
              <div className="min-w-[7rem] rounded-[8px] border border-border bg-card/95 px-2.5 py-1.5 shadow-sm backdrop-blur-sm dark:bg-card/90">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Marker tier</p>
                <p className="tabular-nums text-sm font-semibold text-foreground capitalize">
                  {resolveMarker3dTier(surfaceHeightM)}
                </p>
              </div>
              <div className="min-w-[7rem] rounded-[8px] border border-border bg-card/95 px-2.5 py-2 shadow-sm backdrop-blur-sm dark:bg-card/90">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Tilt · <span className="tabular-nums font-semibold text-foreground">{tiltDisplayDeg}°</span>
                </p>
                <div className="mt-1.5 flex gap-1" role="group" aria-label="Tilt presets">
                  {[0, 15, 30, 45, 60, 90].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => handleSetTilt(deg)}
                      aria-label={`Set tilt to ${deg}°`}
                      aria-pressed={tiltDisplayDeg === deg}
                      className={cn(
                        "h-6 min-w-[2rem] rounded-md px-1 text-[11px] font-medium tabular-nums transition-colors",
                        tiltDisplayDeg === deg
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div />
          )}
          <div className="pointer-events-auto flex flex-col gap-2">
            <MapControlButton
              aria-label={geofenceMapReady ? "Open geofence controls" : "Geofence controls unavailable"}
              onClick={() => {
                setGeofencePanelOpen(true);
                if (!geofenceDrawing) {
                  handleGeofenceStart();
                }
              }}
              disabled={!geofenceMapReady}
              className="size-10"
            >
              <Pentagon className="size-4" strokeWidth={1.9} />
            </MapControlButton>
            <MapControlButton
              aria-label="Zoom in"
              onClick={handleZoomIn}
              disabled={!canZoomIn}
            >
              <Plus className="size-5" strokeWidth={1.9} />
            </MapControlButton>
            <MapControlButton
              aria-label="Zoom out"
              onClick={handleZoomOut}
              disabled={!canZoomOut}
            >
              <Minus className="size-5" strokeWidth={1.9} />
            </MapControlButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
