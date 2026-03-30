"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import {
  Building2,
  ChevronRight,
  CircleDollarSign,
  Flame,
  MapPinned,
  Megaphone,
  Moon,
  Satellite,
  Store,
  Sun,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { TopBar } from "@/components/app/top-bar";
import {
  InventoryKpiCard,
  inventoryDashboardShowcaseWidgetSettings,
  type DashboardKpiMetric,
} from "@/components/inventory/inventory-dashboard-widgets";
import {
  ensureActivityHeatmapSourceAndLayer,
  removeActivityHeatmapFromMap,
  setActivityHeatmapVisibility,
} from "@/components/marketing/activity-heatmap-layer";
import {
  applyServiceDefectionHighlight,
  buildServiceDefectionGeofencePopupHtml,
  fitMapToCompetitor,
  getCompetitorListHoverPopupLngLat,
  setupServiceDefectionMap,
} from "@/components/marketing/service-defection-map-layers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapControlButton, MapboxMap } from "@/components/ui/mapbox-map";
import type { CampaignRecommendation } from "@/lib/campaigns/mock-data";
import {
  buildWinBackCampaignRecommendation,
  getRankedServiceDefectionCompetitors,
  getServiceDefectionKpiSnapshot,
  type CompetitorVenueKind,
} from "@/lib/marketing/service-defection-mock";
import { cn } from "@/lib/utils";

const KPI_ICON_CLASS = "!text-foreground";

/** Dark gray basemap — buildings/roads read clearly; geofences stay fully saturated (no canvas filter). */
const MONITOR_MAP_STYLE_DARK = "mapbox://styles/mapbox/dark-v11";
/** Light gray basemap — Mapbox default layers (vs. ultra-flat custom) so structure isn’t blown out. */
const MONITOR_MAP_STYLE_LIGHT = "mapbox://styles/mapbox/light-v11";
const MONITOR_MAP_STYLE_SATELLITE =
  "mapbox://styles/mapbox/satellite-streets-v12";

type MonitorBasemap = "dark" | "light" | "satellite";

const currencyCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function competitorKindIcon(kind: CompetitorVenueKind): LucideIcon {
  if (kind === "franchise_dealer") return Store;
  if (kind === "independent") return Wrench;
  return Zap;
}

function useServiceDefectionKpiMetrics(): DashboardKpiMetric[] {
  return useMemo(() => {
    const k = getServiceDefectionKpiSnapshot();
    return [
      {
        label: "Active Defectors (30d)",
        value: String(k.serviceDefectors30d),
        icon: Users,
        iconClassName: KPI_ICON_CLASS,
      },
      {
        label: "Revenue at Risk (Annual Est.)",
        value: currencyCompact.format(k.revenueAtRiskAnnual),
        icon: CircleDollarSign,
        iconClassName: KPI_ICON_CLASS,
      },
      {
        label: "Competitors Tracked",
        value: String(k.competitorsTracked),
        icon: Building2,
        iconClassName: KPI_ICON_CLASS,
      },
      {
        label: "Win-Back Campaigns Active",
        value: String(k.winBackCampaignsActive),
        icon: Megaphone,
        iconClassName: KPI_ICON_CLASS,
      },
    ];
  }, []);
}

export interface MarketingMonitorPageProps {
  onCreateCampaignFromSuggestion?: (suggestion: CampaignRecommendation) => void;
}

export function MarketingMonitorPage({
  onCreateCampaignFromSuggestion,
}: MarketingMonitorPageProps) {
  const kpiMetrics = useServiceDefectionKpiMetrics();
  const rankedCompetitors = useMemo(
    () => getRankedServiceDefectionCompetitors(),
    []
  );

  const mapRef = useRef<mapboxgl.Map | null>(null);
  const overlayCleanupRef = useRef<(() => void) | null>(null);
  const mapHoverReportRef = useRef<(id: string | null) => void>(() => {});
  const listHoveredCompetitorIdRef = useRef<string | null>(null);
  const listHoverAnchorPopupRef = useRef<mapboxgl.Popup | null>(null);

  const [basemap, setBasemap] = useState<MonitorBasemap>("dark");
  const [mapFocusedCompetitorId, setMapFocusedCompetitorId] = useState<
    string | null
  >(null);
  const [listHoveredCompetitorId, setListHoveredCompetitorId] = useState<
    string | null
  >(null);
  const [mapHoveredFeatureId, setMapHoveredFeatureId] = useState<string | null>(
    null
  );
  const [mapOverlayEpoch, setMapOverlayEpoch] = useState(0);
  const [showActivityHeatmap, setShowActivityHeatmap] = useState(false);
  const showActivityHeatmapRef = useRef(false);
  showActivityHeatmapRef.current = showActivityHeatmap;

  listHoveredCompetitorIdRef.current = listHoveredCompetitorId;

  mapHoverReportRef.current = (id: string | null) => {
    setMapHoveredFeatureId(id);
  };

  const highlightFeatureId =
    listHoveredCompetitorId ?? mapHoveredFeatureId;

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    applyServiceDefectionHighlight(map, highlightFeatureId);
  }, [highlightFeatureId, mapOverlayEpoch]);

  useEffect(() => {
    const map = mapRef.current;

    const removeListAnchorPopup = () => {
      const existing = listHoverAnchorPopupRef.current;
      if (!existing) return;
      try {
        existing.remove();
      } catch {
        /* map or DOM gone */
      }
      listHoverAnchorPopupRef.current = null;
    };

    removeListAnchorPopup();

    if (!map || !listHoveredCompetitorId) {
      return removeListAnchorPopup;
    }

    const lngLat = getCompetitorListHoverPopupLngLat(listHoveredCompetitorId);
    const html = buildServiceDefectionGeofencePopupHtml(
      listHoveredCompetitorId
    );
    if (!lngLat || !html) {
      return removeListAnchorPopup;
    }

    const applyListAnchorPopup = () => {
      const currentMap = mapRef.current;
      if (currentMap !== map || !map.isStyleLoaded()) return;

      removeListAnchorPopup();

      const useLightChrome = basemap === "light" || basemap === "dark";
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: "bottom",
        offset: [0, 6],
        maxWidth: "320px",
        className: useLightChrome
          ? "geofence-popup geofence-popup--light"
          : "geofence-popup",
      });
      popup.setLngLat(lngLat).setHTML(html).addTo(map);
      listHoverAnchorPopupRef.current = popup;
    };

    if (map.isStyleLoaded()) {
      applyListAnchorPopup();
    } else {
      map.once("idle", applyListAnchorPopup);
    }

    return () => {
      map.off("idle", applyListAnchorPopup);
      removeListAnchorPopup();
    };
  }, [listHoveredCompetitorId, mapOverlayEpoch, basemap]);

  const basemapRef = useRef(basemap);
  basemapRef.current = basemap;

  const onMapReady = useCallback((map: mapboxgl.Map) => {
    overlayCleanupRef.current?.();
    overlayCleanupRef.current = null;
    mapRef.current = map;
    overlayCleanupRef.current = setupServiceDefectionMap(map, {
      onMapFeatureHoverIdChange: (id) => mapHoverReportRef.current(id),
      popupVariant:
        basemapRef.current === "light" || basemapRef.current === "dark"
          ? "light"
          : "dark",
      suppressHoverPopup: () => Boolean(listHoveredCompetitorIdRef.current),
    });
    if (showActivityHeatmapRef.current) {
      ensureActivityHeatmapSourceAndLayer(map);
      setActivityHeatmapVisibility(map, true);
    }
    setMapOverlayEpoch((n) => n + 1);
  }, []);

  const handleBeforeStyleChange = useCallback((map: mapboxgl.Map) => {
    try {
      listHoverAnchorPopupRef.current?.remove();
    } catch {
      /* ignore */
    }
    listHoverAnchorPopupRef.current = null;
    removeActivityHeatmapFromMap(map);
    overlayCleanupRef.current?.();
    overlayCleanupRef.current = null;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    if (showActivityHeatmap) {
      ensureActivityHeatmapSourceAndLayer(map);
      setActivityHeatmapVisibility(map, true);
      return;
    }

    setActivityHeatmapVisibility(map, false);
  }, [showActivityHeatmap]);

  useEffect(() => {
    return () => {
      try {
        listHoverAnchorPopupRef.current?.remove();
      } catch {
        /* ignore */
      }
      listHoverAnchorPopupRef.current = null;
      const map = mapRef.current;
      if (map) {
        removeActivityHeatmapFromMap(map);
      }
      overlayCleanupRef.current?.();
      overlayCleanupRef.current = null;
      mapRef.current = null;
    };
  }, []);

  const mapStyle = useMemo(() => {
    if (basemap === "light") return MONITOR_MAP_STYLE_LIGHT;
    if (basemap === "satellite") return MONITOR_MAP_STYLE_SATELLITE;
    return MONITOR_MAP_STYLE_DARK;
  }, [basemap]);

  const mapSurfaceClass =
    basemap === "light"
      ? "bg-[#d9d6d2]"
      : basemap === "dark"
        ? "bg-[#1c2533]"
        : "bg-[#1a1f26]";
  const mapCanvasBg =
    basemap === "light"
      ? "#d9d6d2"
      : basemap === "dark"
        ? "#1c2533"
        : "#1a1f26";

  const handleShowCompetitorOnMap = useCallback((competitorId: string) => {
    const map = mapRef.current;
    if (!map) return;
    setMapFocusedCompetitorId(competitorId);
    fitMapToCompetitor(map, competitorId);
  }, []);

  const handleDraftWinBack = useCallback(
    (suggestion: CampaignRecommendation) => {
      onCreateCampaignFromSuggestion?.(suggestion);
    },
    [onCreateCampaignFromSuggestion]
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-6">
      <TopBar
        title="Monitor"
        subtitle="Defection Monitoring — rank competitor pull, preview on the map, and draft win-backs."
      />
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-[var(--spacing-32)] pl-[var(--spacing-32)] pr-[var(--spacing-32)] pt-6">
        <section className="grid shrink-0 grid-cols-2 gap-4 lg:grid-cols-4">
          {kpiMetrics.map((metric) => (
            <InventoryKpiCard
              key={metric.label}
              metric={metric}
              settings={inventoryDashboardShowcaseWidgetSettings}
            />
          ))}
        </section>

        <section className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[7fr_3fr] lg:items-stretch lg:gap-6">
          <div className="flex min-h-[320px] min-w-0 flex-col lg:min-h-0">
            <div className="min-h-0 flex-1 overflow-hidden rounded-sm border border-border">
              <MapboxMap
                className="h-full min-h-[280px] w-full"
                style={mapStyle}
                surfaceClassName={mapSurfaceClass}
                canvasBackgroundColor={mapCanvasBg}
                mutedMonochromeDark={false}
                onBeforeStyleChange={handleBeforeStyleChange}
                onMapReady={onMapReady}
                extraControls={
                  <>
                    <MapControlButton
                      type="button"
                      aria-pressed={showActivityHeatmap}
                      aria-label="Aggregate anonymized activity heat map within a circular tracking radius around your lot (covers competitor pads). Not individual identities or precise tracking."
                      title="Shows heat inside a dashed circle sized to your five competitor geofences plus a small edge margin."
                      onClick={() => setShowActivityHeatmap((v) => !v)}
                    >
                      <Flame className="size-5" strokeWidth={1.9} />
                    </MapControlButton>
                    <MapControlButton
                      type="button"
                      aria-label="Gray map"
                      aria-pressed={basemap === "dark"}
                      onClick={() => setBasemap("dark")}
                      className={cn(
                        basemap === "dark" &&
                          "border-[rgba(21,92,255,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.98))] text-primary shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_8px_18px_rgba(21,92,255,0.12)]"
                      )}
                    >
                      <Moon className="size-5" strokeWidth={1.9} />
                    </MapControlButton>
                    <MapControlButton
                      type="button"
                      aria-label="Light map"
                      aria-pressed={basemap === "light"}
                      onClick={() => setBasemap("light")}
                      className={cn(
                        basemap === "light" &&
                          "border-[rgba(21,92,255,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.98))] text-primary shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_8px_18px_rgba(21,92,255,0.12)]"
                      )}
                    >
                      <Sun className="size-5" strokeWidth={1.9} />
                    </MapControlButton>
                    <MapControlButton
                      type="button"
                      aria-label="Satellite map"
                      aria-pressed={basemap === "satellite"}
                      onClick={() => setBasemap("satellite")}
                      className={cn(
                        basemap === "satellite" &&
                          "border-[rgba(21,92,255,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(238,244,255,0.98))] text-primary shadow-[0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_8px_18px_rgba(21,92,255,0.12)]"
                      )}
                    >
                      <Satellite className="size-5" strokeWidth={1.9} />
                    </MapControlButton>
                  </>
                }
              />
            </div>
          </div>

          <aside className="flex min-h-[320px] min-w-0 flex-col lg:min-h-0 lg:max-w-none">
            <Card className="flex h-full min-h-0 flex-1 flex-col gap-0 overflow-hidden rounded-sm border border-border bg-card py-0 shadow-sm">
              <CardHeader className="shrink-0 border-b border-border px-4 py-3">
                <CardTitle className="font-headline text-base font-medium leading-snug text-foreground">
                  Defection Monitoring
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ranked 1–5 by impact · Map: green = your lot, red = competitors,
                  dashed links show how they sit relative to you · Hover a row to
                  spotlight the zone and show its name above the geofence on the map
                </p>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-y-auto px-0 pb-1 pt-0">
                <ul className="divide-y divide-border" role="list">
                  {rankedCompetitors.map((competitor) => {
                    const isMapFocused =
                      mapFocusedCompetitorId === competitor.id;
                    const winBack =
                      buildWinBackCampaignRecommendation(competitor);
                    const KindIcon = competitorKindIcon(competitor.kind);
                    const rankTone =
                      competitor.impactRank <= 2
                        ? "border-destructive/35 bg-destructive/10 text-destructive"
                        : competitor.impactRank === 3
                          ? "border-amber-500/35 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                          : "border-border bg-muted/50 text-muted-foreground";

                    return (
                      <li key={competitor.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() =>
                            handleShowCompetitorOnMap(competitor.id)
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key === "Enter" ||
                              event.key === " "
                            ) {
                              event.preventDefault();
                              handleShowCompetitorOnMap(competitor.id);
                            }
                          }}
                          onMouseEnter={() =>
                            setListHoveredCompetitorId(competitor.id)
                          }
                          onMouseLeave={() =>
                            setListHoveredCompetitorId(null)
                          }
                          className={cn(
                            "flex cursor-pointer gap-3 px-4 py-3 text-left transition-colors outline-none",
                            "hover:bg-muted/40",
                            "focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            isMapFocused && "bg-muted/30",
                            highlightFeatureId === competitor.id &&
                              "bg-primary/5 ring-1 ring-inset ring-primary/20",
                          )}
                          aria-label={`Rank ${competitor.impactRank}: ${competitor.name}. ${competitor.defectingCustomerCount} defectors. Activate to zoom map.`}
                        >
                          <div
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-md border text-sm font-semibold tabular-nums",
                              rankTone,
                            )}
                            aria-hidden
                          >
                            {competitor.impactRank}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="flex min-w-0 items-start gap-2">
                              <div
                                className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground"
                                aria-hidden
                              >
                                <KindIcon className="size-4" strokeWidth={2} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium leading-snug text-foreground">
                                  {competitor.name}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <Badge
                                    variant="secondary"
                                    className="h-5 px-1.5 text-[10px] font-medium"
                                  >
                                    {competitor.impactRank === 1
                                      ? "Highest impact"
                                      : competitor.impactRank === 5
                                        ? "Lowest in set"
                                        : `Impact #${competitor.impactRank}`}
                                  </Badge>
                                  <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                                    <MapPinned
                                      className="size-3 shrink-0 opacity-70"
                                      aria-hidden
                                    />
                                    <span className="truncate">
                                      {competitor.address.split(",")[0]}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-x-3 gap-y-1 pl-[44px] text-xs text-muted-foreground">
                              <span>
                                <span className="font-semibold text-foreground">
                                  {competitor.defectingCustomerCount}
                                </span>{" "}
                                defectors
                              </span>
                              <span className="text-border">·</span>
                              <span>
                                <span className="font-semibold text-foreground">
                                  {currencyCompact.format(
                                    competitor.estimatedAnnualServiceRevenueAtRisk
                                  )}
                                </span>{" "}
                                at risk
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1 pl-[44px]">
                              {competitor.topServices.slice(0, 3).map((svc) => (
                                <Badge
                                  key={svc}
                                  variant="outline"
                                  className="h-5 px-1.5 text-[10px] font-normal text-muted-foreground"
                                >
                                  {svc}
                                </Badge>
                              ))}
                            </div>

                            {competitor.promotionSummary ? (
                              <p className="line-clamp-2 pl-[44px] text-[11px] leading-relaxed text-muted-foreground">
                                {competitor.promotionSummary}
                              </p>
                            ) : null}

                            {onCreateCampaignFromSuggestion ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleDraftWinBack(winBack);
                                }}
                                className="group/btn ml-[44px] flex w-fit items-center gap-0.5 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                              >
                                <span>Draft win-back</span>
                                <ChevronRight
                                  className="size-3.5 opacity-70 transition-transform group-hover/btn:translate-x-px"
                                  aria-hidden
                                />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </div>
  );
}
