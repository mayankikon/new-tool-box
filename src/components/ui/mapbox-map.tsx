"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const DEFAULT_CENTER: [number, number] = [-97.06844, 32.76498];
const DEFAULT_ZOOM = 16;
const DEFAULT_STYLE = "mapbox://styles/mapbox/navigation-night-v1";

interface MapboxMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  style?: string;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export function MapboxMap({
  className,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  style = DEFAULT_STYLE,
  onMapReady,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleMapLoad = useCallback(
    (map: mapboxgl.Map) => {
      setIsLoaded(true);
      onMapReady?.(map);
    },
    [onMapReady]
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!MAPBOX_TOKEN) {
      setIsLoaded(true);
      onMapReady?.(null as unknown as mapboxgl.Map);
      return;
    }
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
      antialias: true,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
    map.on("load", () => handleMapLoad(map));
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [handleMapLoad, center, zoom, style, onMapReady]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/60">
          <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
        </div>
      )}
    </div>
  );
}
