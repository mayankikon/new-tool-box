"use client";

import type { ReactNode } from "react";

import { FileCabinetTableChrome } from "@/app/design-playground/components/file-cabinet-table-chrome";
import type { DashPreviewSurface } from "@/app/design-playground/components/dash-preview-canvas";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";
import { cn } from "@/lib/utils";

export const VEHICLE_DETAIL_DECK_TAB_VALUES = ["info", "trips"] as const;

export const VEHICLE_DETAIL_DECK_TAB_LABELS: Record<string, string> = {
  info: "Info",
  trips: "Trips",
};

const { underGlowPx, tabAccent, tabTopRadiusPx } = FILE_CABINET_BILLING_TABLE_DEFAULTS;

export interface VehicleDetailDeckTabsProps {
  value: string;
  onValueChange: (next: string) => void;
  surface: DashPreviewSurface;
  children: ReactNode;
  className?: string;
}

/**
 * Vehicle detail only: full file-cabinet tab row (sink-rise folder motion, Preset + LED capsule under
 * labels, stable tab widths). Centered tab group; table/campaign chrome elsewhere unchanged.
 */
export function VehicleDetailDeckTabs({
  value,
  onValueChange,
  surface,
  children,
  className,
}: VehicleDetailDeckTabsProps) {
  return (
    <FileCabinetTableChrome
      className={cn("relative flex w-full min-w-0 flex-col", className)}
      value={value}
      onValueChange={onValueChange}
      labels={VEHICLE_DETAIL_DECK_TAB_LABELS}
      tabValues={VEHICLE_DETAIL_DECK_TAB_VALUES}
      surface={surface}
      underGlowPx={underGlowPx}
      accent={tabAccent}
      tabTopRadiusPx={tabTopRadiusPx}
      showLeftLamp={false}
      noLeftLampBelowStyle="preset-led"
      tabMotionVariant="sink-rise"
      centerTabList
    >
      {children}
    </FileCabinetTableChrome>
  );
}
