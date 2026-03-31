"use client";

import { BatteryThresholdSliderField } from "@/components/ui/battery-threshold-slider-field";
import { cn } from "@/lib/utils";

export interface BatteryThresholdClimateFanPlaygroundProps {
  value: number;
  onValueChange: (volts: number) => void;
  /**
   * Mirrors “Play area: design system Slider” — `baseline` (dark canvas) vs `drawing`
   * (`.playground-ds-slider-drawing` + `slider-thumb-drawing`).
   */
  variant: "baseline" | "drawing";
  className?: string;
}

/**
 * Climate-fan chrome with centered battery icon + live voltage under the icon, slider centered below.
 * No field labels, helpers, scale numbers, or footer copy.
 */
export function BatteryThresholdClimateFanPlayground({
  value,
  onValueChange,
  variant,
  className,
}: BatteryThresholdClimateFanPlaygroundProps) {
  const drawing = variant === "drawing";

  return (
    <div
      className={cn(
        "w-full max-w-md text-foreground",
        drawing && "playground-ds-slider-drawing",
        className
      )}
    >
      <BatteryThresholdSliderField
        layout="centered"
        value={value}
        onValueChange={onValueChange}
        thumbClassName={drawing ? "slider-thumb-drawing" : undefined}
        showRecommendedMarker={false}
      />
    </div>
  );
}
