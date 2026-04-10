"use client";

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { Compass, Minus, Plus } from "lucide-react";
import mapboxgl, { type StyleSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAPBOX_BASEMAP_DARK_URL } from "@/lib/mapbox-basemap-styles";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

/** 1161 W Corporate Dr, Arlington, TX — aligned with `DEALERSHIP_CENTER` */
const DEFAULT_CENTER: [number, number] = [-97.0678261, 32.765202];
const DEFAULT_ZOOM = 16;
const DEFAULT_STYLE = MAPBOX_BASEMAP_DARK_URL;

type MapboxStyleInput = string | StyleSpecification;

interface MapboxMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  style?: MapboxStyleInput;
  /** Rendered on the bottom-left, aligned with the zoom stack (testing / auxiliary UI). */
  leadingControls?: ReactNode;
  /** Rendered below zoom/compass in the bottom-right control stack */
  extraControls?: ReactNode;
  /** Outer container background (Tailwind classes) */
  surfaceClassName?: string;
  /** Color behind the map canvas while tiles load */
  canvasBackgroundColor?: string;
  /**
   * Grayscale + slightly lighter canvas treatment for dark basemaps
   * (see `globals.css` `.sm-map-dark-muted`). Omit or false for light / satellite.
   */
  mutedMonochromeDark?: boolean;
  onMapReady?: (map: mapboxgl.Map) => void;
  /**
   * Called immediately before `setStyle` when the basemap style URL changes.
   * Remove GeoJSON sources/layers and map listeners here so they are not left
   * dangling while the style is empty (avoids crashes from `queryRenderedFeatures` / `setFeatureState`).
   */
  onBeforeStyleChange?: (map: mapboxgl.Map) => void;
}

interface CameraState {
  zoom: number;
  bearing: number;
}

export function MapControlButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex size-10 items-center justify-center rounded-[8px] border border-border bg-card/95 text-foreground shadow-sm backdrop-blur-sm transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out hover:bg-muted active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "dark:bg-card/90 dark:shadow-md dark:shadow-black/40 dark:hover:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function MapboxMap({
  className,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  style = DEFAULT_STYLE,
  leadingControls,
  extraControls,
  surfaceClassName = "bg-[#e8eaed]",
  canvasBackgroundColor = "#e8eaed",
  mutedMonochromeDark = false,
  onMapReady,
  onBeforeStyleChange,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const lastAppliedStyleRef = useRef<MapboxStyleInput | null>(null);
  const stylePropRef = useRef(style);
  const onMapReadyRef = useRef(onMapReady);
  const onBeforeStyleChangeRef = useRef(onBeforeStyleChange);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cameraState, setCameraState] = useState<CameraState>({
    zoom,
    bearing: 0,
  });

  useEffect(() => {
    stylePropRef.current = style;
  }, [style]);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    onBeforeStyleChangeRef.current = onBeforeStyleChange;
  }, [onBeforeStyleChange]);

  const syncCameraState = useCallback((map: mapboxgl.Map) => {
    setCameraState({
      zoom: map.getZoom(),
      bearing: map.getBearing(),
    });
  }, []);

  const handleMapLoad = useCallback(
    (map: mapboxgl.Map) => {
      lastAppliedStyleRef.current = stylePropRef.current;
      setIsLoaded(true);
      syncCameraState(map);
      onMapReadyRef.current?.(map);
    },
    [syncCameraState]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) {
      const frame = requestAnimationFrame(() => {
        setIsLoaded(true);
        onMapReadyRef.current?.(null as unknown as mapboxgl.Map);
      });
      return () => cancelAnimationFrame(frame);
    }
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: stylePropRef.current,
      center,
      zoom,
      antialias: true,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

    const handleCameraChange = () => syncCameraState(map);

    map.on("load", () => handleMapLoad(map));
    map.on("zoom", handleCameraChange);
    map.on("rotate", handleCameraChange);
    map.on("pitch", handleCameraChange);
    map.on("moveend", handleCameraChange);
    mapRef.current = map;
    return () => {
      map.off("zoom", handleCameraChange);
      map.off("rotate", handleCameraChange);
      map.off("pitch", handleCameraChange);
      map.off("moveend", handleCameraChange);
      map.remove();
      mapRef.current = null;
      lastAppliedStyleRef.current = null;
    };
  }, [handleMapLoad, center, zoom, syncCameraState]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isLoaded) return;
    if (lastAppliedStyleRef.current === style) return;

    const requestedStyle = style;

    const onStyleLoad = () => {
      if (stylePropRef.current !== requestedStyle) return;
      if (lastAppliedStyleRef.current === requestedStyle) return;
      lastAppliedStyleRef.current = requestedStyle;
      onMapReadyRef.current?.(map);
      queueMicrotask(() => {
        try {
          map.resize();
        } catch {
          /* map may be tearing down */
        }
      });
    };

    /**
     * Defer `onBeforeStyleChange` + `setStyle` to the next macrotask so teardown
     * (e.g. `createRoot` unmount on Mapbox HTML markers) never runs synchronously
     * inside this effect — React 19 rejects sync `root.unmount()` while a render
     * is still in progress from the same update chain.
     */
    const timeoutId = window.setTimeout(() => {
      const currentMap = mapRef.current;
      if (!currentMap || currentMap !== map) return;
      if (stylePropRef.current !== requestedStyle) return;
      try {
        onBeforeStyleChangeRef.current?.(map);
        map.setStyle(requestedStyle);
        map.once("style.load", onStyleLoad);
      } catch {
        /* map may be tearing down */
      }
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [style, isLoaded]);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 220 });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 220 });
  }, []);

  const handleResetBearing = useCallback(() => {
    mapRef.current?.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 280,
      essential: true,
    });
  }, []);

  const normalizedBearing = ((cameraState.bearing % 360) + 360) % 360;
  const isCompassActive = Math.abs(cameraState.bearing) > 1;
  const canZoomIn = cameraState.zoom < 22;
  const canZoomOut = cameraState.zoom > 1;

  return (
    <div className={cn("relative overflow-hidden", surfaceClassName, className)}>
      <div
        ref={containerRef}
        className={cn(mutedMonochromeDark && "sm-map-dark-muted")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          backgroundColor: canvasBackgroundColor,
        }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/60">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex items-end justify-between gap-3">
        {leadingControls ? (
          <div className="pointer-events-auto max-w-[min(100%,280px)] shrink">
            {leadingControls}
          </div>
        ) : (
          <span className="min-w-0 shrink" aria-hidden="true" />
        )}
        <div className="pointer-events-auto flex flex-col gap-2">
          <MapControlButton
            aria-label="Zoom in"
            onClick={handleZoomIn}
            disabled={!isLoaded || !canZoomIn}
          >
            <Plus className="size-5" strokeWidth={1.9} />
          </MapControlButton>
          <MapControlButton
            aria-label="Zoom out"
            onClick={handleZoomOut}
            disabled={!isLoaded || !canZoomOut}
          >
            <Minus className="size-5" strokeWidth={1.9} />
          </MapControlButton>
          <MapControlButton
            aria-label={isCompassActive ? "Reset map orientation" : "Map is facing north"}
            aria-pressed={isCompassActive}
            onClick={handleResetBearing}
            disabled={!isLoaded}
            className={cn(
              "mt-1",
              isCompassActive
                ? "border-[rgba(21,92,255,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.98))] text-primary shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_8px_18px_rgba(21,92,255,0.12),0px_0px_0px_1px_rgba(21,92,255,0.08)]"
                : undefined
            )}
          >
            <Compass
              className="size-5 transition-transform duration-200 ease-out motion-reduce:transition-none"
              style={{ transform: `rotate(${normalizedBearing}deg)` }}
              strokeWidth={1.9}
            />
          </MapControlButton>
          {extraControls ? (
            <div className="mt-1 flex flex-col gap-2 border-t border-border/60 pt-2">
              {extraControls}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
