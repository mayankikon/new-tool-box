"use client";

import { ChevronRight, Pentagon, Trash2 } from "lucide-react";
import { useCallback, useId } from "react";

import { Button } from "@/components/ui/button";
import type { DesignSystemMapsGeofenceVertex } from "@/lib/design-system/design-system-maps-geofence-storage";
import { cn } from "@/lib/utils";

function formatVertexLine(index: number, vertex: DesignSystemMapsGeofenceVertex): string {
  const [lng, lat, heightM] = vertex;
  const latStr = lat >= 0 ? `${lat.toFixed(5)}°N` : `${Math.abs(lat).toFixed(5)}°S`;
  const lngStr = lng >= 0 ? `${lng.toFixed(5)}°E` : `${Math.abs(lng).toFixed(5)}°W`;
  const h =
    heightM != null && Number.isFinite(heightM) && Math.abs(heightM) > 0.01
      ? ` · ${Math.round(heightM)} m`
      : "";
  return `${index + 1}. ${latStr}, ${lngStr}${h}`;
}

interface GoogleMapsGeofencePanelProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  isDrawing: boolean;
  onStartDrawing: () => void;
  onCancelDrawing: () => void;
  onCompleteDrawing: () => void;
  draftPointCount: number;
  draftVertices: readonly DesignSystemMapsGeofenceVertex[];
  hasSavedGeofence: boolean;
  onClearSaved: () => void;
  /** When false (e.g. not in 3D or Cesium not ready), drawing actions are disabled. */
  drawDisabled: boolean;
}

/**
 * Collapsible right rail for drawing a geofence on the design-system Maps 3D preview.
 */
export function GoogleMapsGeofencePanel({
  expanded,
  onExpandedChange,
  isDrawing,
  onStartDrawing,
  onCancelDrawing,
  onCompleteDrawing,
  draftPointCount,
  draftVertices,
  hasSavedGeofence,
  onClearSaved,
  drawDisabled,
}: GoogleMapsGeofencePanelProps) {
  const headingId = useId();
  const canComplete = isDrawing && draftPointCount >= 3;

  const handleComplete = useCallback(() => {
    if (canComplete) onCompleteDrawing();
  }, [canComplete, onCompleteDrawing]);

  return (
    <div
      className={cn(
        "pointer-events-none absolute right-0 top-14 bottom-28 z-[1500] flex max-w-full flex-col overflow-visible",
        expanded ? "w-[min(20rem,calc(100%-1rem))]" : "w-10",
      )}
    >
      <div className="pointer-events-auto flex min-h-0 flex-1 flex-col items-stretch">
        {expanded ? (
          <div
            id={headingId}
            className="flex h-full min-h-0 flex-col rounded-l-md border border-border bg-card/95 shadow-lg backdrop-blur-md dark:bg-card/90"
            style={{ filter: "none" }}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                <Pentagon className="size-4 shrink-0 text-primary" aria-hidden />
                <h2 className="truncate text-sm font-semibold text-foreground">Geofence</h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
                aria-label="Collapse geofence panel"
                onClick={() => onExpandedChange(false)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3 text-xs text-muted-foreground">
              {drawDisabled ? (
                <p className="rounded-md border border-border bg-muted/40 px-2 py-2 text-[11px] text-foreground">
                  Switch to <strong>Photorealistic 3D</strong> and wait for the scene to load to draw or edit a
                  geofence.
                </p>
              ) : null}
              <p className="leading-relaxed">
                Like <strong className="text-foreground">Google Earth</strong>: the cursor becomes a crosshair,
                each click adds a vertex on the <strong className="text-foreground">3D surface</strong> (not the
                hidden globe), the shaded area updates as you move the mouse, and the edge follows your next
                click. Use <strong className="text-foreground">Complete polygon</strong> when you have at least
                three points. The fence is drawn as a <strong className="text-foreground">vertical prism</strong>{" "}
                from the lowest picked height up to the highest pick plus <strong className="text-foreground">1 m</strong>{" "}
                so roofs and terrain stay inside the volume. ~77% blue frosted fill with an outline to obscure
                the satellite surface beneath (true Gaussian blur is not available in Cesium).
              </p>

              <div className="flex flex-col gap-2">
                {!isDrawing ? (
                  <Button
                    type="button"
                    size="sm"
                    className="w-full"
                    onClick={onStartDrawing}
                    disabled={drawDisabled}
                  >
                    Draw geofence
                  </Button>
                ) : (
                  <>
                    <p className="text-[11px] tabular-nums text-foreground">
                      Vertices: <strong>{draftPointCount}</strong> (need 3+ to complete)
                    </p>
                    {draftVertices.length > 0 ? (
                      <ul
                        className="max-h-28 overflow-y-auto rounded-md border border-border bg-muted/20 px-2 py-1.5 font-mono text-[10px] leading-relaxed text-foreground"
                        aria-label="Placed vertices"
                      >
                        {draftVertices.map((v, i) => (
                          <li key={`${v[0]}-${v[1]}-${i}`}>{formatVertexLine(i, v)}</li>
                        ))}
                      </ul>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="default"
                      className="w-full"
                      onClick={handleComplete}
                      disabled={drawDisabled || !canComplete}
                    >
                      Complete polygon
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={onCancelDrawing}
                      disabled={drawDisabled}
                    >
                      Cancel drawing
                    </Button>
                  </>
                )}
              </div>

              {hasSavedGeofence ? (
                <div className="rounded-md border border-border bg-muted/30 px-2 py-2">
                  <p className="mb-2 text-[11px] text-muted-foreground">A saved geofence is on the map.</p>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="w-full"
                    leadingIcon={<Trash2 className="size-3.5" />}
                    onClick={onClearSaved}
                    disabled={drawDisabled}
                  >
                    Clear saved geofence
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
