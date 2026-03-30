"use client";

import {
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { curveMonotoneX, stack } from "d3-shape";
import { Group } from "@visx/group";
import { AreaClosed } from "@visx/shape";
import { scaleLinear, scaleBand } from "@visx/scale";
import { AlertTriangle, BarChart3, LayoutGrid, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import type {
  LotAgeTierKey,
  LotAgeSeriesPoint,
  LotAgeTiersWidgetData,
  VehicleAgeDistributionWidgetData,
  VehicleAgeHistogramBin,
} from "@/lib/inventory/dashboard-data";
import { lotAgeTierColors } from "@/lib/inventory/dashboard-data";
import {
  mergeInventoryDashboardWidgetSettings,
  WidgetHeader,
  WidgetShell,
  inventoryDashboardShowcaseWidgetSettings,
  type InventoryDashboardWidgetSettings,
} from "@/components/inventory/inventory-dashboard-widgets";

const STACK_KEYS: LotAgeTierKey[] = ["aged", "moderate", "fresh"];

const LOT_AGE_CHART = {
  height: 200,
  margin: { top: 8, right: 12, bottom: 28, left: 40 },
  minWidth: 280,
} as const;

const HIST_CHART = {
  height: 160,
  margin: { top: 8, right: 12, bottom: 32, left: 40 },
  minWidth: 280,
} as const;

function tierColor(tier: LotAgeTierKey): string {
  return lotAgeTierColors[tier];
}

function histogramFill(daysStart: number, daysEnd: number): string {
  const mid = (daysStart + daysEnd) / 2;
  if (mid <= 45) return lotAgeTierColors.fresh;
  if (mid <= 90) return lotAgeTierColors.moderate;
  return lotAgeTierColors.aged;
}

function useChartWidth(minWidth: number): { wrapRef: React.RefObject<HTMLDivElement | null>; width: number } {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(minWidth);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) {
      return;
    }

    const measure = () => {
      const next = Math.max(minWidth, Math.floor(el.getBoundingClientRect().width));
      setWidth(next);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [minWidth]);

  return { wrapRef, width };
}

function svgPointerToChartX(
  clientX: number,
  svgEl: SVGSVGElement,
  chartWidth: number
): number {
  const rect = svgEl.getBoundingClientRect();
  const ratio = rect.width > 0 ? (clientX - rect.left) / rect.width : 0;
  return ratio * chartWidth;
}

function nearestSeriesIndex(innerX: number, labels: string[], xScale: ReturnType<typeof scaleBand<string>>): number {
  let best = 0;
  let bestDist = Infinity;
  labels.forEach((label, i) => {
    const cx = (xScale(label) ?? 0) + xScale.bandwidth() / 2;
    const d = Math.abs(innerX - cx);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
}

function findHistogramBinAtInnerX(
  innerX: number,
  bins: VehicleAgeHistogramBin[],
  xScale: ReturnType<typeof scaleBand<string>>
): VehicleAgeHistogramBin | null {
  for (const bin of bins) {
    const key = `${bin.daysStart}-${bin.daysEnd}`;
    const x = xScale(key) ?? 0;
    const bw = xScale.bandwidth();
    if (innerX >= x && innerX <= x + bw) {
      return bin;
    }
  }
  return null;
}

type ChartTooltipState = {
  x: number;
  y: number;
  content: ReactNode;
} | null;

function ChartTooltipPortal({
  tooltip,
  labelFamily,
}: {
  tooltip: ChartTooltipState;
  labelFamily: string;
}) {
  if (!tooltip) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute z-20 max-w-[min(280px,calc(100%-8px))] rounded-[2px] border border-border bg-card px-4 py-3 text-left shadow-md"
      style={{
        left: tooltip.x,
        top: tooltip.y,
        transform: "translate(-50%, calc(-100% - 10px))",
        fontFamily: labelFamily,
      }}
      role="status"
      aria-live="polite"
    >
      {tooltip.content}
    </div>
  );
}

function LotAgeStackedAreaChart({
  series,
  ariaSummary,
  labelFamily,
  gradientIdSuffix,
  horizontalBleedPx,
}: {
  series: LotAgeSeriesPoint[];
  ariaSummary: string;
  labelFamily: string;
  gradientIdSuffix: string;
  /** Cancels parent horizontal padding so the SVG spans the full card width. */
  horizontalBleedPx?: number;
}) {
  const freshGrad = `lotAgeFresh-${gradientIdSuffix}`;
  const moderateGrad = `lotAgeModerate-${gradientIdSuffix}`;
  const agedGrad = `lotAgeAged-${gradientIdSuffix}`;

  const { wrapRef, width: chartWidth } = useChartWidth(LOT_AGE_CHART.minWidth);
  const { height } = LOT_AGE_CHART;

  const margin = useMemo(
    () =>
      horizontalBleedPx != null
        ? { ...LOT_AGE_CHART.margin, left: 30, right: 4 }
        : LOT_AGE_CHART.margin,
    [horizontalBleedPx]
  );

  const [tooltip, setTooltip] = useState<ChartTooltipState>(null);

  const { stackedSeries, xScale, yScale } = useMemo(() => {
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const stackGen = stack<LotAgeSeriesPoint, LotAgeTierKey>().keys(STACK_KEYS);
    const stacked = stackGen(series);

    const maxY = Math.max(...series.map((d) => d.fresh + d.moderate + d.aged), 1);

    const xScaleInner = scaleBand<string>({
      domain: series.map((d) => d.label),
      range: [0, innerWidth],
      paddingInner: 0.15,
    });

    const yScaleInner = scaleLinear<number>({
      domain: [0, maxY],
      range: [innerH, 0],
      nice: true,
    });

    return {
      stackedSeries: stacked,
      xScale: xScaleInner,
      yScale: yScaleInner,
    };
  }, [series, chartWidth, height, margin]);

  const yTicks = yScale.ticks?.(4) ?? [];

  const handleLotAgePointer = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const svg = event.currentTarget;
      const chartX = svgPointerToChartX(event.clientX, svg, chartWidth);
      const innerX = chartX - margin.left;
      if (innerX < 0 || innerX > chartWidth - margin.left - margin.right) {
        setTooltip(null);
        return;
      }

      const labels = series.map((d) => d.label);
      const idx = nearestSeriesIndex(innerX, labels, xScale);
      const point = series[idx];
      if (!point) {
        setTooltip(null);
        return;
      }

      const total = point.fresh + point.moderate + point.aged;
      const wrap = wrapRef.current;
      if (!wrap) {
        return;
      }
      const b = wrap.getBoundingClientRect();
      setTooltip({
        x: event.clientX - b.left,
        y: event.clientY - b.top,
        content: (
          <div className="space-y-1.5 text-xs">
            <div className="font-medium text-foreground">{point.label}</div>
            <div className="tabular-nums text-[var(--theme-text-secondary)]">
              Total vehicles: <span className="font-semibold text-foreground">{total}</span>
            </div>
            <ul className="space-y-0.5 tabular-nums text-[var(--theme-text-tertiary)]">
              <li className="flex justify-between gap-4">
                <span style={{ color: lotAgeTierColors.fresh }}>Fresh</span>
                <span>{point.fresh}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span style={{ color: lotAgeTierColors.moderate }}>Moderate</span>
                <span>{point.moderate}</span>
              </li>
              <li className="flex justify-between gap-4">
                <span style={{ color: lotAgeTierColors.aged }}>Aged</span>
                <span>{point.aged}</span>
              </li>
            </ul>
          </div>
        ),
      });
    },
    [chartWidth, series, margin.left, margin.right, xScale, wrapRef]
  );

  const clearTooltip = useCallback(() => setTooltip(null), []);

  const chartBlock = (
    <div ref={wrapRef} className="relative w-full min-w-0">
      <ChartTooltipPortal tooltip={tooltip} labelFamily={labelFamily} />
      <svg
        width={chartWidth}
        height={LOT_AGE_CHART.height}
        role="img"
        aria-label={ariaSummary}
        className="block max-w-full touch-none"
        onPointerMove={handleLotAgePointer}
        onPointerLeave={clearTooltip}
        onPointerDown={handleLotAgePointer}
      >
        <defs>
          <linearGradient id={freshGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lotAgeTierColors.fresh} stopOpacity={0.85} />
            <stop offset="100%" stopColor={lotAgeTierColors.fresh} stopOpacity={0.25} />
          </linearGradient>
          <linearGradient id={moderateGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lotAgeTierColors.moderate} stopOpacity={0.85} />
            <stop offset="100%" stopColor={lotAgeTierColors.moderate} stopOpacity={0.25} />
          </linearGradient>
          <linearGradient id={agedGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lotAgeTierColors.aged} stopOpacity={0.9} />
            <stop offset="100%" stopColor={lotAgeTierColors.aged} stopOpacity={0.3} />
          </linearGradient>
        </defs>
        <Group left={margin.left} top={margin.top}>
          {yTicks.map((tick) => {
            const y = yScale(tick) ?? 0;
            return (
              <line
                key={tick}
                x1={0}
                x2={chartWidth - margin.left - margin.right}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeOpacity={0.6}
                strokeDasharray="4 4"
              />
            );
          })}
          {stackedSeries.map((layer, layerIndex) => {
            const key = STACK_KEYS[layerIndex];
            const fillId =
              key === "fresh"
                ? `url(#${freshGrad})`
                : key === "moderate"
                  ? `url(#${moderateGrad})`
                  : `url(#${agedGrad})`;
            return (
              <AreaClosed
                key={key}
                data={layer}
                curve={curveMonotoneX}
                x={(d) => (xScale(d.data.label) ?? 0) + xScale.bandwidth() / 2}
                y0={(d) => yScale(d[0])}
                y1={(d) => yScale(d[1])}
                yScale={yScale}
                fill={fillId}
              />
            );
          })}
          {series.map((d) => {
            const cx = (xScale(d.label) ?? 0) + xScale.bandwidth() / 2;
            const total = d.fresh + d.moderate + d.aged;
            const cy = yScale(total);
            return (
              <circle
                key={`dot-${d.label}`}
                cx={cx}
                cy={cy}
                r={3}
                fill="var(--card)"
                stroke="var(--theme-text-tertiary)"
                strokeWidth={1}
                className="motion-safe:transition-opacity [@media(prefers-reduced-motion:reduce)]:transition-none"
              />
            );
          })}
        </Group>
      </svg>
    </div>
  );

  if (horizontalBleedPx == null) {
    return chartBlock;
  }

  return (
    <div
      className="relative w-full min-w-0 shrink-0"
      style={{
        marginLeft: -horizontalBleedPx,
        marginRight: -horizontalBleedPx,
        width: `calc(100% + ${horizontalBleedPx * 2}px)`,
      }}
    >
      {chartBlock}
    </div>
  );
}

export interface LotAgeTiersCardProps {
  data: LotAgeTiersWidgetData;
  settings?: Partial<InventoryDashboardWidgetSettings>;
}

export function LotAgeTiersCard({ data, settings }: LotAgeTiersCardProps) {
  const dial = mergeInventoryDashboardWidgetSettings({
    ...inventoryDashboardShowcaseWidgetSettings,
    ...settings,
  });

  const gradientId = useId().replace(/:/g, "");

  const ariaSummary = useMemo(() => {
    const totals = data.tiers.map((t) => `${t.label} ${t.count}`).join(", ");
    return `Lot age tiers over time. Current counts: ${totals}. ${data.footerMessage}`;
  }, [data.footerMessage, data.tiers]);

  return (
    <WidgetShell
      minHeight={420}
      settings={dial}
      bodyClassName="overflow-visible"
      header={
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-start justify-between gap-3">
            <WidgetHeader icon={LayoutGrid} title={data.title} settings={dial} />
            <Button type="button" variant="secondary" size="sm" className="shrink-0">
              Reset
            </Button>
          </div>
          <p
            className="text-[var(--theme-text-tertiary)]"
            style={{
              fontFamily: dial.typography.labelFamily,
              fontSize: dial.typography.captionSize,
              fontWeight: dial.typography.captionWeight,
            }}
          >
            {data.subtitle}
          </p>
        </div>
      }
      body={
        <div className="flex w-full min-w-0 flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.tiers.map((tier) => (
              <div
                key={tier.tier}
                className="rounded-md border border-border bg-white/90 px-3 py-3 dark:bg-sidebar/70"
                style={{ borderTopWidth: 3, borderTopColor: tierColor(tier.tier) }}
              >
                <div
                  className="text-foreground"
                  style={{
                    fontFamily: dial.typography.valueFamily,
                    fontSize: dial.typography.valueSize,
                    fontWeight: dial.typography.valueWeight,
                  }}
                >
                  {tier.count}
                </div>
                <div
                  className="mt-0.5 text-[var(--theme-text-secondary)]"
                  style={{
                    fontFamily: dial.typography.labelFamily,
                    fontSize: dial.typography.labelSize,
                    fontWeight: dial.typography.labelWeight,
                  }}
                >
                  {tier.label} · {tier.dayRangeLabel}
                </div>
                <div
                  className="mt-2 text-[var(--theme-text-tertiary)]"
                  style={{
                    fontFamily: dial.typography.labelFamily,
                    fontSize: 12,
                    fontWeight: 400,
                  }}
                >
                  {tier.trendLabel}
                </div>
              </div>
            ))}
          </div>

          <LotAgeStackedAreaChart
            series={data.series}
            ariaSummary={ariaSummary}
            labelFamily={dial.typography.labelFamily}
            gradientIdSuffix={gradientId}
          />
          <div
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
            style={{
              fontFamily: dial.typography.labelFamily,
              fontSize: dial.typography.captionSize,
            }}
          >
            <div className="flex items-center gap-2 text-[var(--theme-text-secondary)]">
              <AlertTriangle
                className="size-4 shrink-0"
                style={{ color: lotAgeTierColors.moderate }}
                aria-hidden
              />
              <span>{data.footerMessage}</span>
            </div>
            <LinkButton asButton variant="primary" className="text-sm">
              {data.ctaLabel}
            </LinkButton>
          </div>
        </div>
      }
    />
  );
}

export interface InventoryAgingOverviewCardProps {
  lotAge: LotAgeTiersWidgetData;
  vehicleAge: VehicleAgeDistributionWidgetData;
  settings?: Partial<InventoryDashboardWidgetSettings>;
  className?: string;
}

/** Lot-age stacked area (full-bleed) + vehicle distribution tier stats and footer CTA. */
export function InventoryAgingOverviewCard({
  lotAge,
  vehicleAge,
  settings,
  className,
}: InventoryAgingOverviewCardProps) {
  const dial = mergeInventoryDashboardWidgetSettings({
    ...inventoryDashboardShowcaseWidgetSettings,
    ...settings,
  });

  const gradientId = useId().replace(/:/g, "");

  const chartAriaSummary = useMemo(() => {
    const mix = vehicleAge.tierStats.map((s) => `${s.label} ${s.percentLabel}`).join(", ");
    return `Inventory aging over time by tier counts. Current mix: ${mix}. ${lotAge.footerMessage}`;
  }, [lotAge.footerMessage, vehicleAge.tierStats]);

  const cardPaddingX = dial.layout.cardPaddingX;

  return (
    <WidgetShell
      className={className}
      minHeight={440}
      settings={dial}
      bodyClassName="overflow-visible"
      header={
        <WidgetHeader icon={Layers} title="Lot Distribution" settings={dial} />
      }
      body={
        <div className="flex w-full min-w-0 flex-col gap-5">
          <LotAgeStackedAreaChart
            series={lotAge.series}
            ariaSummary={chartAriaSummary}
            labelFamily={dial.typography.labelFamily}
            gradientIdSuffix={gradientId}
            horizontalBleedPx={cardPaddingX}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {vehicleAge.tierStats.map((stat) => (
              <div key={stat.tier} className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: tierColor(stat.tier) }}
                    aria-hidden
                  />
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: dial.typography.valueFamily,
                      fontSize: dial.typography.valueSize,
                      fontWeight: dial.typography.valueWeight,
                    }}
                  >
                    {stat.percentLabel}
                  </span>
                </div>
                <div
                  className="mt-1 text-[var(--theme-text-secondary)]"
                  style={{
                    fontFamily: dial.typography.labelFamily,
                    fontSize: dial.typography.labelSize,
                  }}
                >
                  {stat.label} · {stat.dayRangeLabel}
                </div>
                <div
                  className="mt-1 text-[var(--theme-text-tertiary)]"
                  style={{ fontFamily: dial.typography.labelFamily, fontSize: 12 }}
                >
                  {stat.weekDeltaLabel}
                  {stat.holdingCostLabel ? ` · ${stat.holdingCostLabel}` : ""}
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"
            style={{
              fontFamily: dial.typography.labelFamily,
              fontSize: dial.typography.captionSize,
            }}
          >
            <div className="flex items-center gap-2 text-[var(--theme-text-secondary)]">
              <AlertTriangle
                className="size-4 shrink-0"
                style={{ color: lotAgeTierColors.moderate }}
                aria-hidden
              />
              <span>{lotAge.footerMessage}</span>
            </div>
            <LinkButton asButton variant="primary" className="text-sm">
              {lotAge.ctaLabel}
            </LinkButton>
          </div>
        </div>
      }
    />
  );
}

export interface VehicleAgeDistributionCardProps {
  data: VehicleAgeDistributionWidgetData;
  settings?: Partial<InventoryDashboardWidgetSettings>;
}

export function VehicleAgeDistributionCard({
  data,
  settings,
}: VehicleAgeDistributionCardProps) {
  const dial = mergeInventoryDashboardWidgetSettings({
    ...inventoryDashboardShowcaseWidgetSettings,
    ...settings,
  });

  const { wrapRef, width: chartWidth } = useChartWidth(HIST_CHART.minWidth);
  const { margin, height } = HIST_CHART;

  const [tooltip, setTooltip] = useState<ChartTooltipState>(null);

  const { xScale, yScale, innerHeight, ariaSummary } = useMemo(() => {
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const domain = data.bins.map((b) => `${b.daysStart}-${b.daysEnd}`);
    const xScaleInner = scaleBand<string>({
      domain,
      range: [0, innerWidth],
      paddingInner: 0.2,
    });

    const maxC = Math.max(
      ...data.bins.map((b) => Math.max(b.count, b.baselineCap ?? 0)),
      1
    );

    const yScaleInner = scaleLinear<number>({
      domain: [0, maxC],
      range: [innerH, 0],
      nice: true,
    });

    const parts = data.tierStats.map((s) => `${s.label} ${s.percentLabel}`).join(", ");
    const ariaSummaryInner = `Vehicle age histogram by days on lot. Tier mix: ${parts}. ${data.nextWindowVehicleCount} vehicles ${data.nextWindowMessage} in the next ${data.nextDaysWindow} days.`;

    return {
      xScale: xScaleInner,
      yScale: yScaleInner,
      innerHeight: innerH,
      ariaSummary: ariaSummaryInner,
    };
  }, [data, chartWidth, height, margin.left, margin.right, margin.top, margin.bottom]);

  const handleHistPointer = useCallback(
    (event: ReactPointerEvent<SVGSVGElement>) => {
      const svg = event.currentTarget;
      const chartX = svgPointerToChartX(event.clientX, svg, chartWidth);
      const innerX = chartX - margin.left;
      if (innerX < 0 || innerX > chartWidth - margin.left - margin.right) {
        setTooltip(null);
        return;
      }

      const bin = findHistogramBinAtInnerX(innerX, data.bins, xScale);
      if (!bin) {
        setTooltip(null);
        return;
      }

      const wrap = wrapRef.current;
      if (!wrap) {
        return;
      }
      const b = wrap.getBoundingClientRect();
      setTooltip({
        x: event.clientX - b.left,
        y: event.clientY - b.top,
        content: (
          <div className="space-y-1 text-xs">
            <div className="font-medium text-foreground">
              {bin.daysStart}–{bin.daysEnd} days on lot
            </div>
            <div className="tabular-nums text-[var(--theme-text-secondary)]">
              Vehicles in bin:{" "}
              <span className="font-semibold text-foreground">{bin.count}</span>
            </div>
            {bin.baselineCap != null ? (
              <div className="tabular-nums text-[var(--theme-text-tertiary)]">
                Prior baseline cap: {bin.baselineCap}
              </div>
            ) : null}
          </div>
        ),
      });
    },
    [chartWidth, data.bins, margin.left, margin.right, xScale, wrapRef]
  );

  const clearHistTooltip = useCallback(() => setTooltip(null), []);

  return (
    <WidgetShell
      minHeight={520}
      settings={dial}
      bodyClassName="overflow-visible"
      header={
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-start justify-between gap-3">
            <WidgetHeader icon={BarChart3} title={data.title} settings={dial} />
            <Button type="button" variant="secondary" size="sm" className="shrink-0">
              Reset
            </Button>
          </div>
          <p
            className="text-[var(--theme-text-tertiary)]"
            style={{
              fontFamily: dial.typography.labelFamily,
              fontSize: dial.typography.captionSize,
              fontWeight: dial.typography.captionWeight,
            }}
          >
            {data.subtitle}
          </p>
        </div>
      }
      body={
        <div className="flex w-full min-w-0 flex-col gap-5">
          <div ref={wrapRef} className="relative w-full min-w-0">
            <ChartTooltipPortal tooltip={tooltip} labelFamily={dial.typography.labelFamily} />
            <svg
              width={chartWidth}
              height={HIST_CHART.height}
              role="img"
              aria-label={ariaSummary}
              className="block max-w-full touch-none"
              onPointerMove={handleHistPointer}
              onPointerLeave={clearHistTooltip}
              onPointerDown={handleHistPointer}
            >
              <Group left={margin.left} top={margin.top}>
                {data.bins.map((bin) => {
                  const key = `${bin.daysStart}-${bin.daysEnd}`;
                  const x = xScale(key) ?? 0;
                  const bw = xScale.bandwidth();
                  const cap = bin.baselineCap ?? bin.count;
                  const hBack = innerHeight - (yScale(cap) ?? innerHeight);
                  const hFore = innerHeight - (yScale(bin.count) ?? innerHeight);
                  const fill = histogramFill(bin.daysStart, bin.daysEnd);
                  return (
                    <Group key={key}>
                      {bin.baselineCap != null ? (
                        <rect
                          x={x}
                          y={yScale(cap)}
                          width={bw}
                          height={hBack}
                          rx={4}
                          fill="var(--muted)"
                          opacity={0.35}
                        />
                      ) : null}
                      <rect
                        x={x}
                        y={yScale(bin.count)}
                        width={bw}
                        height={hFore}
                        rx={4}
                        fill={fill}
                        opacity={0.92}
                      />
                    </Group>
                  );
                })}
              </Group>
              <text
                x={chartWidth / 2}
                y={HIST_CHART.height - 6}
                textAnchor="middle"
                className="fill-[var(--theme-text-tertiary)]"
                style={{
                  fontFamily: dial.typography.labelFamily,
                  fontSize: 11,
                }}
              >
                Days on Lot (bins)
              </text>
            </svg>
          </div>

          <div
            className="relative h-2 w-full overflow-visible rounded-full"
            style={{
              background: `linear-gradient(90deg, ${lotAgeTierColors.fresh} 0%, ${lotAgeTierColors.moderate} 50%, ${lotAgeTierColors.aged} 100%)`,
            }}
            aria-hidden
          >
            <span className="absolute left-0 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-sm dark:border-sidebar dark:bg-sidebar" />
            <span className="absolute left-[55%] top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-sm dark:border-sidebar dark:bg-sidebar" />
            <span className="absolute right-0 top-1/2 size-3 translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-sm dark:border-sidebar dark:bg-sidebar" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {data.tierStats.map((stat) => (
              <div key={stat.tier} className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: tierColor(stat.tier) }}
                    aria-hidden
                  />
                  <span
                    className="text-foreground"
                    style={{
                      fontFamily: dial.typography.valueFamily,
                      fontSize: dial.typography.valueSize,
                      fontWeight: dial.typography.valueWeight,
                    }}
                  >
                    {stat.percentLabel}
                  </span>
                </div>
                <div
                  className="mt-1 text-[var(--theme-text-secondary)]"
                  style={{
                    fontFamily: dial.typography.labelFamily,
                    fontSize: dial.typography.labelSize,
                  }}
                >
                  {stat.label} · {stat.dayRangeLabel}
                </div>
                <div
                  className="mt-1 text-[var(--theme-text-tertiary)]"
                  style={{ fontFamily: dial.typography.labelFamily, fontSize: 12 }}
                >
                  {stat.weekDeltaLabel}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 md:grid-cols-2">
            <div
              className="rounded-md border border-border/80 bg-muted/20 px-3 py-3"
              style={{ borderLeftWidth: 3, borderLeftColor: lotAgeTierColors.moderate }}
            >
              <div
                className="font-medium text-foreground"
                style={{ fontFamily: dial.typography.labelFamily, fontSize: dial.typography.labelSize }}
              >
                Next {data.nextDaysWindow} Days
              </div>
              <p
                className="mt-2 text-[var(--theme-text-secondary)]"
                style={{ fontFamily: dial.typography.labelFamily, fontSize: 13 }}
              >
                <span className="font-semibold text-foreground">{data.nextWindowVehicleCount}</span>{" "}
                {data.nextWindowMessage}
              </p>
              <p
                className="mt-1 text-[var(--theme-text-tertiary)]"
                style={{ fontFamily: dial.typography.labelFamily, fontSize: 12 }}
              >
                {data.nextWindowHoldingRiskLabel}
              </p>
            </div>
            <div>
              <div
                className="mb-2 text-[var(--theme-text-secondary)]"
                style={{ fontFamily: dial.typography.labelFamily, fontSize: dial.typography.labelSize }}
              >
                Closest to Aged
              </div>
              <ul className="space-y-2">
                {data.nearAgedVehicles.map((v) => (
                  <li
                    key={`${v.year}-${v.make}-${v.model}-${v.daysOnLot}`}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-foreground">
                      {v.year} {v.make} {v.model}
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--theme-text-tertiary)]">
                      {v.daysOnLot} days
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      }
    />
  );
}
