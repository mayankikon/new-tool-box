"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";
import {
  BATTERY_THRESHOLD_STEP,
  BATTERY_THRESHOLD_V_MAX,
  BATTERY_THRESHOLD_V_MIN,
  BatteryThresholdIcon,
} from "@/components/ui/battery-threshold-icon";
import { BatteryThresholdSliderField } from "@/components/ui/battery-threshold-slider-field";

export {
  BATTERY_THRESHOLD_RECOMMENDED_V,
  BATTERY_THRESHOLD_STEP,
  BATTERY_THRESHOLD_V_MAX,
  BATTERY_THRESHOLD_V_MIN,
} from "@/components/ui/battery-threshold-icon";


function formatVoltsAria(value: number): string {
  return `${value.toFixed(1)} volts`;
}

export type BatteryThresholdVariant = "studio" | "gradient";

export interface BatteryThresholdControlProps {
  variant: BatteryThresholdVariant;
  value: number;
  onValueChange: (volts: number) => void;
  /** Design-system slider only: match Climate fan drawing thumb playground chrome. */
  studioChrome?: "baseline" | "drawing";
  className?: string;
}

/**
 * Low-battery alert threshold (V). Studio variant uses design-system `Slider`;
 * gradient variant uses native range + `.retro-range-battery-voltage`.
 */
export function BatteryThresholdControl({
  variant,
  value,
  onValueChange,
  studioChrome = "baseline",
  className,
}: BatteryThresholdControlProps) {
  const nativeId = useId();

  if (variant === "studio") {
    return (
      <div className={className}>
        <BatteryThresholdSliderField
          layout="centered"
          value={value}
          onValueChange={onValueChange}
          thumbClassName={studioChrome === "drawing" ? "slider-thumb-drawing" : undefined}
          fieldChromeClassName={studioChrome === "drawing" ? "playground-ds-slider-drawing text-foreground" : undefined}
          showRecommendedMarker={false}
        />
      </div>
    );
  }

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
      <input
        id={nativeId}
        type="range"
        min={BATTERY_THRESHOLD_V_MIN}
        max={BATTERY_THRESHOLD_V_MAX}
        step={BATTERY_THRESHOLD_STEP}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        className="retro-range-track retro-range-battery-voltage z-[2] h-8 w-full max-w-sm cursor-pointer"
        style={{ background: "transparent" }}
        aria-label="Battery voltage threshold"
        aria-valuetext={formatVoltsAria(value)}
      />
    </div>
  );
}
