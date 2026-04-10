"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Minus, Plus } from "lucide-react";
import mapboxgl from "mapbox-gl";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapControlButton } from "@/components/ui/mapbox-map";
import { mediaUrl } from "@/lib/media-paths";
import { cn } from "@/lib/utils";
import {
  INVENTORY_MAP_ZOOM_CHECKPOINT_MARKER,
  INVENTORY_MAP_ZOOM_SNAP_THRESHOLD,
  INVENTORY_MAP_VEHICLE_IMAGE_ZOOM,
  inventoryMapNormalizedToZoom,
  inventoryMapSliderCheckpointNormalized,
  inventoryMapZoomToNormalized,
  nearestCheckpointIndex,
  snapNormalizedIfClose,
} from "@/lib/inventory/inventory-map-zoom-checkpoints";

const ZOOM_DWELL_MS = 1000;
const ZOOM_STEP_DURATION_MS = 220;
const CHECKPOINT_EASE_MS = 480;

const ACCENT = "#1A9375";

/** Matches max dwell tooltip width + gap for invisible hover bridge (see component). */
const ZOOM_DWELL_BRIDGE_W_PX = 156;

const layoutEase = [0.32, 0.72, 0, 1] as const;

/** Checkpoint tooltip art: vehicle markers → map marker icon; vehicle images → photo asset (`public/media/map-markers/`). */
const CHECKPOINT_TOOLTIP_SRC = [
  mediaUrl("map-markers/icon.svg"),
  mediaUrl("map-markers/image.png"),
] as const;

/** Fixed width so both checkpoint chips align; inner assets are centered. */
const CHECKPOINT_TOOLTIP_CHIP_CLASS =
  "pointer-events-none absolute right-full z-[24] mr-2 flex h-9 w-20 min-w-20 max-w-20 shrink-0 items-center justify-center rounded-[4px] border border-border bg-muted/95 px-2 py-1 text-foreground shadow-sm";

/** Layout box for Next/Image (wide preview); `unoptimized` keeps source pixels crisp when `image.png` is high-res. */
const VEHICLE_IMAGE_TOOLTIP_INTRINSIC_WIDTH_PX = 400;
const VEHICLE_IMAGE_TOOLTIP_INTRINSIC_HEIGHT_PX = 160;

/** Expanded slider: icon-only zoom actions (no `MapControlButton` border/shadow — panel provides chrome). */
const sliderPanelZoomIconButtonClass =
  "flex size-9 shrink-0 items-center justify-center rounded-[4px] text-foreground transition-[color,background-color,transform] duration-200 ease-out hover:bg-muted/50 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60";

/** Normalized distance: thumb and checkpoint goo merge visually when closer than this. */
const CHECKPOINT_SNAP_VISUAL_THRESHOLD = 0.038;

/** Goo disk sizes (px); slightly larger than sharp rings so the merge reads clearly. */
const GOO_THUMB_DIAMETER_PX = 14;
const GOO_CHECKPOINT_DIAMETER_PX = 13;

export interface InventoryMapZoomControlsProps {
  map: mapboxgl.Map | null;
  prefersReducedMotion: boolean;
}

export function InventoryMapZoomControls({
  map,
  prefersReducedMotion,
}: InventoryMapZoomControlsProps) {
  const [sliderExpanded, setSliderExpanded] = useState(false);
  const [dwellOpen, setDwellOpen] = useState(false);
  const [normalized, setNormalized] = useState(0.65);
  const [dragging, setDragging] = useState(false);
  const [activeCheckpoint, setActiveCheckpoint] = useState<0 | 1>(0);
  /** Which checkpoint ring is hovered (tooltips + hover scale); mouse only. */
  const [hoveredCheckpointIndex, setHoveredCheckpointIndex] = useState<number | null>(null);
  /** Drives metaball “merge” pulse after clicking a checkpoint (cleared after animation window). */
  const [mergePulseCheckpointIndex, setMergePulseCheckpointIndex] = useState<number | null>(
    null
  );

  const gooFilterDomId = useId().replace(/:/g, "");
  const mergePulseClearRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragActiveRef = useRef(false);

  /**
   * Enable controls whenever we hold a map instance. Do **not** gate on `map.loaded()`:
   * during `setStyle` / basemap changes Mapbox reports `loaded() === false` until the new
   * style finishes, which incorrectly disabled zoom for a visible map.
   */
  const isReady = Boolean(map);

  const checkpointPositions = useMemo(() => inventoryMapSliderCheckpointNormalized(), []);

  const checkpointSnapFlags = useMemo(
    () =>
      checkpointPositions.map(
        (pos, i) =>
          activeCheckpoint === i &&
          Math.abs(normalized - pos) < CHECKPOINT_SNAP_VISUAL_THRESHOLD
      ),
    [checkpointPositions, activeCheckpoint, normalized]
  );

  useEffect(() => {
    if (mergePulseCheckpointIndex === null) return;
    mergePulseClearRef.current = setTimeout(() => {
      setMergePulseCheckpointIndex(null);
      mergePulseClearRef.current = null;
    }, CHECKPOINT_EASE_MS + 320);
    return () => {
      if (mergePulseClearRef.current !== null) {
        clearTimeout(mergePulseClearRef.current);
        mergePulseClearRef.current = null;
      }
    };
  }, [mergePulseCheckpointIndex]);

  const syncNormalizedFromMap = useCallback(() => {
    if (!map) return;
    const z = map.getZoom();
    const n = inventoryMapZoomToNormalized(z);
    setNormalized(n);
    setActiveCheckpoint(nearestCheckpointIndex(n, checkpointPositions) as 0 | 1);
  }, [map, checkpointPositions]);

  useEffect(() => {
    if (!map) return;
    const onChange = () => syncNormalizedFromMap();
    map.on("zoom", onChange);
    map.on("moveend", onChange);
    syncNormalizedFromMap();
    return () => {
      map.off("zoom", onChange);
      map.off("moveend", onChange);
    };
  }, [map, syncNormalizedFromMap]);

  const applyMarkerCheckpoint = useCallback(() => {
    if (!map) return;
    const duration = prefersReducedMotion ? 0 : CHECKPOINT_EASE_MS;
    map.easeTo({
      zoom: INVENTORY_MAP_ZOOM_CHECKPOINT_MARKER,
      duration,
      essential: true,
    });
    setActiveCheckpoint(0);
  }, [map, prefersReducedMotion]);

  const applyImageCheckpoint = useCallback(() => {
    if (!map) return;
    const duration = prefersReducedMotion ? 0 : CHECKPOINT_EASE_MS;
    map.easeTo({
      zoom: INVENTORY_MAP_VEHICLE_IMAGE_ZOOM,
      duration,
      essential: true,
    });
    setActiveCheckpoint(1);
  }, [map, prefersReducedMotion]);

  const applyCheckpointByIndex = useCallback(
    (index: number) => {
      if (index === 0) applyMarkerCheckpoint();
      else applyImageCheckpoint();
    },
    [applyImageCheckpoint, applyMarkerCheckpoint]
  );

  const handleZoomIn = useCallback(() => {
    map?.zoomIn({ duration: prefersReducedMotion ? 0 : ZOOM_STEP_DURATION_MS });
  }, [map, prefersReducedMotion]);

  const handleZoomOut = useCallback(() => {
    map?.zoomOut({ duration: prefersReducedMotion ? 0 : ZOOM_STEP_DURATION_MS });
  }, [map, prefersReducedMotion]);

  const clearDwellTimer = useCallback(() => {
    if (dwellTimerRef.current != null) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  const handleZoomGroupEnter = useCallback(() => {
    if (sliderExpanded) return;
    clearDwellTimer();
    dwellTimerRef.current = setTimeout(() => {
      setDwellOpen(true);
      dwellTimerRef.current = null;
    }, ZOOM_DWELL_MS);
  }, [clearDwellTimer, sliderExpanded]);

  const handleZoomGroupLeave = useCallback(() => {
    clearDwellTimer();
    setDwellOpen(false);
  }, [clearDwellTimer]);

  const normalizedFromClientY = useCallback(
    (clientY: number) => {
      const el = trackRef.current;
      if (!el) return 0.5;
      const rect = el.getBoundingClientRect();
      const yFromTop = clientY - rect.top;
      const t = yFromTop / rect.height;
      return Math.max(0, Math.min(1, 1 - t));
    },
    []
  );

  const applyContinuousZoom = useCallback(
    (n: number) => {
      if (!map) return;
      map.setZoom(inventoryMapNormalizedToZoom(n));
    },
    [map]
  );

  const finishDrag = useCallback(
    (n: number) => {
      if (!map) return;
      const { value, snapped, checkpointIndex } = snapNormalizedIfClose(
        n,
        checkpointPositions,
        INVENTORY_MAP_ZOOM_SNAP_THRESHOLD
      );
      if (snapped && checkpointIndex !== null) {
        applyCheckpointByIndex(checkpointIndex);
        return;
      }
      map.easeTo({
        zoom: inventoryMapNormalizedToZoom(value),
        duration: prefersReducedMotion ? 0 : 200,
        essential: true,
      });
      setNormalized(value);
    },
    [applyCheckpointByIndex, checkpointPositions, map, prefersReducedMotion]
  );

  const onTrackPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!map || !trackRef.current) return;
      e.preventDefault();
      dragActiveRef.current = true;
      setDragging(true);
      trackRef.current.setPointerCapture(e.pointerId);
      const n = normalizedFromClientY(e.clientY);
      setNormalized(n);
      applyContinuousZoom(n);
    },
    [applyContinuousZoom, map, normalizedFromClientY]
  );

  const onTrackPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragActiveRef.current || !map) return;
      const n = normalizedFromClientY(e.clientY);
      setNormalized(n);
      applyContinuousZoom(n);
    },
    [applyContinuousZoom, map, normalizedFromClientY]
  );

  const onTrackPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragActiveRef.current) return;
      dragActiveRef.current = false;
      setDragging(false);
      try {
        trackRef.current?.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      const n = normalizedFromClientY(e.clientY);
      finishDrag(n);
    },
    [finishDrag, normalizedFromClientY]
  );

  const canZoomIn = (map?.getZoom() ?? 0) < 22;
  const canZoomOut = (map?.getZoom() ?? 0) > 1;

  const checkpointLabels = ["Vehicle markers", "Vehicle images"] as const;

  const layoutTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: layoutEase };

  return (
    <div
      className="relative w-10 shrink-0"
      onMouseEnter={handleZoomGroupEnter}
      onMouseLeave={handleZoomGroupLeave}
    >
      {dwellOpen && !sliderExpanded ? (
        <div
          className="pointer-events-auto absolute bottom-0 right-full top-0 z-[25]"
          style={{ width: ZOOM_DWELL_BRIDGE_W_PX }}
          aria-hidden
        />
      ) : null}

      {dwellOpen && !sliderExpanded ? (
        <div
          className="pointer-events-auto absolute right-full z-30 mr-2 w-[148px] rounded-[4px] bg-foreground px-3 py-2.5 text-background shadow-lg"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          role="tooltip"
        >
          <div className="pointer-events-none absolute top-1/2 -right-1.5 z-10 size-3 -translate-y-1/2 rotate-45 bg-foreground" />
          <p className="relative text-sm font-medium">Zoom</p>
          <button
            type="button"
            className="relative mt-1 w-full cursor-pointer text-left text-sm font-medium text-[#70D1F4] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#70D1F4]/50"
            onClick={() => {
              setDwellOpen(false);
              setSliderExpanded(true);
            }}
          >
            Show slider
          </button>
        </div>
      ) : null}

      <motion.div
        layout
        transition={{ layout: layoutTransition }}
        className="flex w-full flex-col items-center overflow-visible rounded-[4px]"
      >
        {!sliderExpanded ? (
          <div className="flex w-full flex-col items-center gap-2">
            <MapControlButton
              aria-label="Zoom in"
              className="rounded-[4px]"
              onClick={handleZoomIn}
              disabled={!isReady || !canZoomIn}
            >
              <Plus className="size-5" strokeWidth={1.9} />
            </MapControlButton>
            <MapControlButton
              aria-label="Zoom out"
              className="rounded-[4px]"
              onClick={handleZoomOut}
              disabled={!isReady || !canZoomOut}
            >
              <Minus className="size-5" strokeWidth={1.9} />
            </MapControlButton>
          </div>
        ) : (
          <div
            role="group"
            aria-label="Zoom level checkpoints"
            className="flex w-full flex-col items-center gap-1.5 overflow-visible rounded-[4px] bg-card/95 py-2 shadow-md ring-1 ring-border/60 backdrop-blur-sm dark:bg-card/90"
          >
            <button
              type="button"
              aria-label="Zoom in"
              className={sliderPanelZoomIconButtonClass}
              onClick={handleZoomIn}
              disabled={!isReady || !canZoomIn}
            >
              <Plus className="size-5" strokeWidth={1.9} />
            </button>

            {/* Fixed-width column + pixel-centered line/dots so rings align with the track (no subpixel drift). */}
            <div className="relative mx-auto flex w-4 shrink-0 justify-center overflow-visible">
              <div
                ref={trackRef}
                className="relative h-40 w-4 cursor-grab touch-none overflow-visible active:cursor-grabbing"
                onPointerDown={onTrackPointerDown}
                onPointerMove={onTrackPointerMove}
                onPointerUp={onTrackPointerUp}
                onPointerCancel={onTrackPointerUp}
              >
                {/* Symmetric trapezoid; 6px bar centered with margin-left -3px from 50% */}
                <div
                  className="absolute top-1 bottom-1 z-0 rounded-[4px]"
                  style={{
                    left: "50%",
                    width: 6,
                    marginLeft: -3,
                    clipPath: "polygon(0% 0%, 100% 0%, 65% 100%, 35% 100%)",
                    background: `linear-gradient(180deg, ${ACCENT}55, rgba(148,163,184,0.35))`,
                  }}
                  aria-hidden
                />

                {!prefersReducedMotion ? (
                  <>
                    <svg
                      width={0}
                      height={0}
                      className="absolute"
                      aria-hidden
                    >
                      <defs>
                        <filter
                          id={gooFilterDomId}
                          x="-50%"
                          y="-50%"
                          width="200%"
                          height="200%"
                        >
                          <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation="3.5"
                            result="blur"
                          />
                          <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
                            result="goo"
                          />
                        </filter>
                      </defs>
                    </svg>
                    <div
                      className="pointer-events-none absolute inset-0 z-[2] overflow-visible"
                      style={{ filter: `url(#${gooFilterDomId})` }}
                      aria-hidden
                    >
                      <div
                        className="absolute rounded-full bg-primary"
                        style={{
                          left: "50%",
                          top: `${(1 - normalized) * 100}%`,
                          width: GOO_THUMB_DIAMETER_PX,
                          height: GOO_THUMB_DIAMETER_PX,
                          marginLeft: -(GOO_THUMB_DIAMETER_PX / 2),
                          marginTop: -(GOO_THUMB_DIAMETER_PX / 2),
                          boxSizing: "border-box",
                          // Keep in lockstep with the sharp thumb — no `top` transition (was causing visible lag vs green goo).
                          transition: "none",
                        }}
                      />
                      {checkpointPositions.map((pos, i) => {
                        const showCheckpointGoo =
                          mergePulseCheckpointIndex === i || checkpointSnapFlags[i];
                        if (!showCheckpointGoo) return null;
                        return (
                          <div
                            key={`goo-checkpoint-${i}`}
                            className="absolute rounded-full bg-primary"
                            style={{
                              left: "50%",
                              top: `${(1 - pos) * 100}%`,
                              width: GOO_CHECKPOINT_DIAMETER_PX,
                              height: GOO_CHECKPOINT_DIAMETER_PX,
                              marginLeft: -(GOO_CHECKPOINT_DIAMETER_PX / 2),
                              marginTop: -(GOO_CHECKPOINT_DIAMETER_PX / 2),
                              boxSizing: "border-box",
                            }}
                          />
                        );
                      })}
                    </div>
                  </>
                ) : null}

                {checkpointPositions.map((pos, i) => {
                  const isActive = activeCheckpoint === i;
                  const isCheckpointHovered = hoveredCheckpointIndex === i;
                  /** Chips only while hovering the ring (hidden when active but not hovered). */
                  const showCheckpointTooltip = isCheckpointHovered;
                  const ringScaleClass =
                    dragging
                      ? "scale-95"
                      : !prefersReducedMotion && isCheckpointHovered
                        ? "scale-[1.5]"
                        : "scale-100";
                  return (
                    <Fragment key={i}>
                      <button
                        type="button"
                        className={cn(
                          "absolute flex items-center justify-center rounded-full border bg-card p-0",
                          // Transform only: border/active color must snap with the thumb (no border-color tween lag).
                          !prefersReducedMotion && "transition-transform duration-200 ease-out",
                          isActive || isCheckpointHovered
                            ? "z-[15] border-primary"
                            : "z-[14] border-muted-foreground/45",
                          ringScaleClass,
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        )}
                        style={{
                          left: "50%",
                          top: `${(1 - pos) * 100}%`,
                          width: 10,
                          height: 10,
                          marginLeft: -5,
                          marginTop: -5,
                          boxSizing: "border-box",
                        }}
                        aria-label={checkpointLabels[i]}
                        aria-current={isActive ? "true" : undefined}
                        onMouseEnter={() => setHoveredCheckpointIndex(i)}
                        onMouseLeave={() => setHoveredCheckpointIndex(null)}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setMergePulseCheckpointIndex(i);
                          applyCheckpointByIndex(i);
                        }}
                      />
                      {showCheckpointTooltip ? (
                        <div
                          className={CHECKPOINT_TOOLTIP_CHIP_CLASS}
                          style={{
                            top: `${(1 - pos) * 100}%`,
                            transform: "translateY(-50%)",
                          }}
                          aria-hidden
                        >
                          {i === 0 ? (
                            <img
                              src={CHECKPOINT_TOOLTIP_SRC[0]}
                              alt=""
                              className="size-6 shrink-0 object-contain object-center"
                              draggable={false}
                            />
                          ) : (
                            <Image
                              src={CHECKPOINT_TOOLTIP_SRC[1]}
                              alt=""
                              width={VEHICLE_IMAGE_TOOLTIP_INTRINSIC_WIDTH_PX}
                              height={VEHICLE_IMAGE_TOOLTIP_INTRINSIC_HEIGHT_PX}
                              quality={100}
                              sizes="80px"
                              unoptimized
                              className="h-8 w-full max-h-8 object-contain object-center"
                            />
                          )}
                        </div>
                      ) : null}
                    </Fragment>
                  );
                })}

                <motion.div
                  className="pointer-events-none absolute z-[20] rounded-full border-2 border-primary bg-card"
                  style={{
                    left: "50%",
                    top: `${(1 - normalized) * 100}%`,
                    width: 12,
                    height: 12,
                    marginLeft: -6,
                    marginTop: -6,
                    boxSizing: "border-box",
                  }}
                  animate={
                    prefersReducedMotion
                      ? { scale: dragging ? 1.1 : 1 }
                      : {
                          scale: dragging
                            ? 1.1
                            : mergePulseCheckpointIndex !== null
                              ? [1, 1.14, 1]
                              : 1,
                        }
                  }
                  transition={
                    prefersReducedMotion
                      ? { duration: 0.15 }
                      : mergePulseCheckpointIndex !== null && !dragging
                        ? {
                            duration: 0.55,
                            times: [0, 0.32, 1],
                            ease: layoutEase,
                          }
                        : { duration: 0.15 }
                  }
                  aria-hidden
                />

              </div>
            </div>

            <button
              type="button"
              aria-label="Zoom out"
              className={sliderPanelZoomIconButtonClass}
              onClick={handleZoomOut}
              disabled={!isReady || !canZoomOut}
            >
              <Minus className="size-5" strokeWidth={1.9} />
            </button>

            <button
              type="button"
              className="px-1 pb-0.5 text-center text-[10px] font-medium text-muted-foreground underline-offset-2 hover:underline"
              onClick={() => setSliderExpanded(false)}
            >
              Hide slider
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
