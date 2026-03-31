"use client";

import { cn } from "@/lib/utils";

/** Low-battery alert threshold range (volts). */
export const BATTERY_THRESHOLD_V_MIN = 10;
export const BATTERY_THRESHOLD_V_MAX = 12.5;
export const BATTERY_THRESHOLD_STEP = 0.1;
/** Product default recommendation (volts). */
export const BATTERY_THRESHOLD_RECOMMENDED_V = 11.7;

interface BatteryThresholdIconProps {
  /** Pack voltage threshold (V); inner fill rises with value. */
  valueVolts: number;
  className?: string;
}

/**
 * Dealership "Battery, Full" glyph (24×24 viewBox): outline + inner fill level
 * driven by threshold between {@link BATTERY_THRESHOLD_V_MIN} and {@link BATTERY_THRESHOLD_V_MAX}.
 * Asset source: `public/media/icons/lead-icon-battery-full.svg` (Figma “Battery, Full” glyph).
 */
export function BatteryThresholdIcon({ valueVolts, className }: BatteryThresholdIconProps) {
  const span = BATTERY_THRESHOLD_V_MAX - BATTERY_THRESHOLD_V_MIN;
  const t = Math.min(1, Math.max(0, (valueVolts - BATTERY_THRESHOLD_V_MIN) / span));
  /** Inner cavity in the 24×24 artwork (green rect in source). */
  const innerX = 4;
  const innerY = 8;
  const innerW = 16;
  const innerH = 11;
  const fillH = innerH * t;
  const fillY = innerY + innerH - fillH;

  return (
    <svg
      className={cn("shrink-0 text-foreground", className)}
      width={40}
      height={40}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M14 3C14 2.44772 14.4477 2 15 2H18C18.5523 2 19 2.44772 19 3C19 3.55228 18.5523 4 18 4H15C14.4477 4 14 3.55228 14 3Z"
        fill="currentColor"
        className="opacity-90"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 5C1.89543 5 1 5.89543 1 7V20C1 21.1046 1.89543 22 3 22H21C22.1046 22 23 21.1046 23 20V7C23 5.89543 22.1046 5 21 5H3ZM21 7H3L3 20H21V7Z"
        fill="currentColor"
        className="opacity-90"
      />
      <path
        d="M6 2C5.44772 2 5 2.44772 5 3C5 3.55228 5.44772 4 6 4H9C9.55228 4 10 3.55228 10 3C10 2.44772 9.55228 2 9 2H6Z"
        fill="currentColor"
        className="opacity-90"
      />
      {fillH > 0 ? (
        <rect
          x={innerX}
          y={fillY}
          width={innerW}
          height={fillH}
          className="fill-primary motion-reduce:transition-none transition-[y,height] duration-200 ease-out"
        />
      ) : null}
    </svg>
  );
}
