"use client";

import { Slider, valueToPercent } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

import {
  BATTERY_THRESHOLD_RECOMMENDED_V,
  BATTERY_THRESHOLD_STEP,
  BATTERY_THRESHOLD_V_MAX,
  BATTERY_THRESHOLD_V_MIN,
  BatteryThresholdIcon,
} from "@/components/ui/battery-threshold-icon";

const DEFAULT_MARK_VALUES = [10, 11, BATTERY_THRESHOLD_RECOMMENDED_V, 12, 12.5] as const;

export function formatVoltageMark(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

interface RecommendedTrackMarkerProps {
  percent: number;
  className?: string;
}

function RecommendedTrackMarker({ percent, className }: RecommendedTrackMarkerProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-x-0 top-0 flex h-full items-center", className)}
      aria-hidden="true"
    >
      <div
        className="absolute h-4 w-px -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.55)]"
        style={{ left: `${percent}%` }}
        title={`Recommended ${BATTERY_THRESHOLD_RECOMMENDED_V} V`}
      />
    </div>
  );
}

export interface BatteryThresholdSliderFieldProps {
  value: number;
  onValueChange: (volts: number) => void;
  /**
   * `inline`: icon left, track right (settings row).
   * `stack`: icon above track (card / modal body).
   * `centered`: icon and slider center-aligned; voltage number only under the icon (no labels/helpers/marks/footer).
   */
  layout?: "inline" | "stack" | "centered";
  /** When true, omits built-in label + helper on `Slider` (e.g. modal supplies copy). */
  bareSlider?: boolean;
  /** Merged onto each slider thumb (e.g. design-playground drawing thumb). */
  thumbClassName?: string;
  /** Merged onto the field wrapper around the slider (e.g. playground chrome). */
  fieldChromeClassName?: string;
  /** Tick labels on the track (defaults include 11.7 V). */
  markValues?: readonly number[];
  /** Amber “recommended” line at {@link BATTERY_THRESHOLD_RECOMMENDED_V} (design system default on). */
  showRecommendedMarker?: boolean;
  /** Footer line with “recommended 11.7 V” (design system default on). */
  showRecommendedFooter?: boolean;
  className?: string;
}

/**
 * Dealership {@link BatteryThresholdIcon} + voltage-marked `Slider` (10–12.5 V, 0.1 V step).
 */
export function BatteryThresholdSliderField({
  value,
  onValueChange,
  layout = "inline",
  bareSlider = false,
  thumbClassName,
  fieldChromeClassName,
  markValues = DEFAULT_MARK_VALUES,
  showRecommendedMarker = true,
  showRecommendedFooter = true,
  className,
}: BatteryThresholdSliderFieldProps) {
  const recPct = valueToPercent(BATTERY_THRESHOLD_RECOMMENDED_V, BATTERY_THRESHOLD_V_MIN, BATTERY_THRESHOLD_V_MAX);

  const sliderBlock = (
    <div className={cn("relative w-full min-w-0", fieldChromeClassName)}>
      <Slider
        value={value}
        onValueChange={(v) => onValueChange(v)}
        min={BATTERY_THRESHOLD_V_MIN}
        max={BATTERY_THRESHOLD_V_MAX}
        step={BATTERY_THRESHOLD_STEP}
        label={bareSlider ? undefined : "Low battery alert threshold"}
        helperText={
          bareSlider ? undefined : "We’ll alert when pack voltage drops below this level."
        }
        marks={{ values: [...markValues], showTicks: true }}
        formatMark={formatVoltageMark}
        thumbClassName={thumbClassName}
      />
      {showRecommendedMarker ? (
        <div
          className="pointer-events-none absolute left-2 right-2 z-[1] h-1.5"
          style={{ top: bareSlider ? "1.125rem" : "2.875rem" }}
        >
          <RecommendedTrackMarker percent={recPct} />
        </div>
      ) : null}
    </div>
  );

  const footer = showRecommendedFooter ? (
    <p className="px-2 text-xs tabular-nums text-muted-foreground">
      Set to <span className="font-medium text-foreground">{value.toFixed(1)} V</span>
      {" · "}
      recommended {BATTERY_THRESHOLD_RECOMMENDED_V} V
    </p>
  ) : (
    <p className="px-2 text-xs tabular-nums text-muted-foreground">
      Set to <span className="font-medium text-foreground">{value.toFixed(1)} V</span>
    </p>
  );

  if (layout === "centered") {
    const centeredSlider = (
      <div className={cn("relative w-full min-w-0 max-w-sm", fieldChromeClassName)}>
        <Slider
          value={value}
          onValueChange={(v) => onValueChange(v)}
          min={BATTERY_THRESHOLD_V_MIN}
          max={BATTERY_THRESHOLD_V_MAX}
          step={BATTERY_THRESHOLD_STEP}
          label={undefined}
          helperText={undefined}
          thumbClassName={thumbClassName}
          aria-label="Battery voltage threshold"
        />
        {showRecommendedMarker ? (
          <div
            className="pointer-events-none absolute left-2 right-2 z-[1] h-1.5"
            style={{ top: "1.125rem" }}
          >
            <RecommendedTrackMarker percent={recPct} />
          </div>
        ) : null}
      </div>
    );

    return (
      <div className={cn("flex w-full flex-col items-center gap-5 text-foreground", className)}>
        <div className="flex flex-col items-center gap-1.5">
          <BatteryThresholdIcon valueVolts={value} className="size-12" />
          <span
            className="text-base font-semibold tabular-nums tracking-tight text-foreground"
            aria-live="polite"
          >
            {value.toFixed(1)} V
          </span>
        </div>
        {centeredSlider}
      </div>
    );
  }

  if (layout === "stack") {
    return (
      <div className={cn("flex w-full flex-col items-center gap-4", className)}>
        <BatteryThresholdIcon valueVolts={value} className="size-14" />
        <div className="w-full max-w-md space-y-2">
          {sliderBlock}
          {footer}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-4", className)}>
      <BatteryThresholdIcon valueVolts={value} className="mt-1 size-10" />
      <div className="min-w-0 flex-1 space-y-2">
        {sliderBlock}
        {footer}
      </div>
    </div>
  );
}
