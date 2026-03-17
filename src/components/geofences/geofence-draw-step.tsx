"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  CircleMode,
  DragCircleMode,
  DirectMode,
  SimpleSelectMode,
} from "mapbox-gl-draw-circle";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GeofenceDrawingToolbar, type GeofenceDrawTool } from "./geofence-drawing-toolbar";
import { cn } from "@/lib/utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places";

interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number];
  text: string;
}

interface GeocodingResponse {
  features: GeocodingFeature[];
}

interface GeofenceDrawStepProps {
  /** Map instance from parent (same map under the wizard). When null, drawing is disabled. */
  map: mapboxgl.Map | null;
  /** Current drawn shape (polygon feature) if any. */
  shape: Feature<Polygon> | null;
  /** Called when the user draws or updates the shape. */
  onShapeChange: (feature: Feature<Polygon> | null) => void;
  /** Optional initial search query for the map search input. */
  searchQuery?: string;
  /** Called when user selects an address from search (for step 2 prefill). */
  onAddressSelect?: (address: string) => void;
  onCancel: () => void;
  onContinue: () => void;
  className?: string;
}

function getFirstPolygonFeature(
  data: FeatureCollection<Polygon>
): Feature<Polygon> | null {
  const feature = data.features?.find(
    (f): f is Feature<Polygon> => f?.geometry?.type === "Polygon"
  );
  return feature ?? null;
}

export function GeofenceDrawStep({
  map,
  shape,
  onShapeChange,
  searchQuery = "",
  onAddressSelect,
  onCancel,
  onContinue,
  className,
}: GeofenceDrawStepProps) {
  const drawRef = useRef<InstanceType<typeof MapboxDraw> | null>(null);
  const [activeTool, setActiveTool] = useState<GeofenceDrawTool>("polygon");
  const [searchValue, setSearchValue] = useState(searchQuery);
  const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const undoStackRef = useRef<FeatureCollection<Polygon>[]>([]);
  const redoStackRef = useRef<FeatureCollection<Polygon>[]>([]);
  const prevStateRef = useRef<FeatureCollection<Polygon>>({
    type: "FeatureCollection",
    features: [],
  });

  const updateUndoRedoFromStacks = useCallback(() => {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  }, []);

  useEffect(() => {
    if (!map) return;

    const draw = new MapboxDraw({
      displayControls: false,
      controls: {
        point: false,
        line_string: false,
        polygon: true,
        trash: false,
        combine_features: false,
        uncombine_features: false,
      },
      defaultMode: "draw_polygon",
      modes: {
        ...MapboxDraw.modes,
        draw_circle: CircleMode,
        drag_circle: DragCircleMode,
        direct_select: DirectMode,
        simple_select: SimpleSelectMode,
      },
    });

    map.addControl(draw, "top-left");
    drawRef.current = draw;
    prevStateRef.current = draw.getAll() as FeatureCollection<Polygon>;

    const syncShapeFromDraw = () => {
      const data = draw.getAll() as FeatureCollection<Polygon>;
      const polygon = getFirstPolygonFeature(data);
      onShapeChange(polygon);
    };

    const pushPrevStateToUndo = () => {
      undoStackRef.current.push(prevStateRef.current);
      redoStackRef.current = [];
      prevStateRef.current = draw.getAll() as FeatureCollection<Polygon>;
      updateUndoRedoFromStacks();
    };

    const handleCreate = () => {
      pushPrevStateToUndo();
      syncShapeFromDraw();
    };

    const handleUpdate = () => {
      pushPrevStateToUndo();
      syncShapeFromDraw();
    };

    const handleDelete = () => {
      pushPrevStateToUndo();
      onShapeChange(null);
    };

    draw.on("draw.create", handleCreate);
    draw.on("draw.update", handleUpdate);
    draw.on("draw.delete", handleDelete);
    updateUndoRedoFromStacks();

    return () => {
      draw.off("draw.create", handleCreate);
      draw.off("draw.update", handleUpdate);
      draw.off("draw.delete", handleDelete);
      map.removeControl(draw);
      drawRef.current = null;
    };
  }, [map, onShapeChange, updateUndoRedoFromStacks]);

  const handleToolChange = useCallback(
    (tool: GeofenceDrawTool) => {
      setActiveTool(tool);
      const draw = drawRef.current;
      if (!draw || !map) return;
      if (tool === "polygon") {
        draw.changeMode("draw_polygon");
      } else if (tool === "circle") {
        draw.changeMode("draw_circle", { initialRadiusInKm: 0.15 });
      } else {
        draw.changeMode("simple_select");
      }
    },
    [map]
  );

  const handleUndo = useCallback(() => {
    const draw = drawRef.current;
    const stack = undoStackRef.current;
    if (!draw || stack.length === 0) return;
    const previous = stack.pop();
    if (!previous) return;
    redoStackRef.current.push(draw.getAll() as FeatureCollection<Polygon>);
    draw.set(previous);
    prevStateRef.current = previous;
    const polygon = getFirstPolygonFeature(previous);
    onShapeChange(polygon);
    setCanUndo(stack.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  }, [onShapeChange]);

  const handleRedo = useCallback(() => {
    const draw = drawRef.current;
    const stack = redoStackRef.current;
    if (!draw || stack.length === 0) return;
    const next = stack.pop();
    if (!next) return;
    undoStackRef.current.push(draw.getAll() as FeatureCollection<Polygon>);
    draw.set(next);
    prevStateRef.current = next;
    const polygon = getFirstPolygonFeature(next);
    onShapeChange(polygon);
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(stack.length > 0);
  }, [onShapeChange]);

  const handleReset = useCallback(() => {
    const draw = drawRef.current;
    if (!draw) return;
    draw.deleteAll();
    draw.changeMode("draw_polygon");
    onShapeChange(null);
    undoStackRef.current = [];
    redoStackRef.current = [];
    setCanUndo(false);
    setCanRedo(false);
  }, [onShapeChange]);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || !MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }
    try {
      const url = `${GEOCODE_URL}/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&types=address,place,poi&limit=5`;
      const res = await fetch(url);
      const data = (await res.json()) as GeocodingResponse;
      setSuggestions(data.features ?? []);
      setSuggestionsOpen(true);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const [debounceRef, setDebounceRef] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (debounceRef) clearTimeout(debounceRef);
    const id = setTimeout(() => fetchSuggestions(value), 250);
    setDebounceRef(id);
  };

  const handleSelectSuggestion = (feature: GeocodingFeature) => {
    setSearchValue(feature.place_name);
    setSuggestionsOpen(false);
    setSuggestions([]);
    onAddressSelect?.(feature.place_name);
    if (map) {
      map.flyTo({
        center: feature.center,
        zoom: 16,
        duration: 1200,
      });
    }
  };

  useEffect(() => {
    return () => {
      if (debounceRef) clearTimeout(debounceRef);
    };
  }, [debounceRef]);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <GeofenceDrawingToolbar
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onReset={handleReset}
        canUndo={canUndo}
        canRedo={canRedo}
        hasShape={!!shape}
      />

      <div className="relative">
        <div className="relative rounded-md border border-border bg-background/80">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search address to zoom map"
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={() => suggestions.length > 0 && setSuggestionsOpen(true)}
            onBlur={() =>
              setTimeout(() => setSuggestionsOpen(false), 150)
            }
            aria-autocomplete="list"
            aria-expanded={suggestionsOpen}
            aria-controls="geofence-search-suggestions"
            id="geofence-draw-search"
            className="h-8 pl-8 bg-transparent border-0"
          />
        </div>
        {suggestionsOpen && suggestions.length > 0 && (
          <div
            id="geofence-search-suggestions"
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-md border border-border bg-popover py-1 shadow-md"
            role="listbox"
          >
            {suggestions.map((feature) => (
              <button
                key={feature.id}
                type="button"
                role="option"
                className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted focus:bg-muted focus:outline-none"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectSuggestion(feature);
                }}
              >
                {feature.place_name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onContinue}
          disabled={!shape}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
