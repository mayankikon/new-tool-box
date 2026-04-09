"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

const STOCK_TYPE_TEXT_CLASS: Record<string, string> = {
  New: "text-[#3D25DC]",
  "Pre-Owned": "text-[#B45309]",
  Certified: "text-[#E64B17]",
  Service: "text-[#BE123C]",
};

export interface InventoryVehicleHoverTooltipProps
  extends React.ComponentProps<"div"> {
  title: string;
  vin: string;
  stockNumber?: string;
  stockType?: string;
  price?: string;
  mileage?: string;
}

export function InventoryVehicleHoverTooltip({
  title,
  vin,
  stockNumber,
  stockType,
  price,
  mileage,
  className,
  ...rest
}: InventoryVehicleHoverTooltipProps) {
  const metadataLineOne = [vin, stockNumber].filter(Boolean).join(" \u2022 ");
  const metadataLineTwo = [price, mileage].filter(Boolean).join(" \u2022 ");
  const stockTypeClassName =
    (stockType && STOCK_TYPE_TEXT_CLASS[stockType]) || "text-[#666666]";

  return (
    <div
      className={cn(
        "pointer-events-none inline-flex flex-col items-center",
        className
      )}
      {...rest}
    >
      <div className="w-[226px] rounded-[8px] bg-white px-4 py-3 shadow-[0px_6px_8px_0px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-[2px]">
          <p className="truncate font-[family-name:var(--font-saira)] text-sm font-medium leading-5 text-[#111111]">
            {title}
          </p>
          <div className="flex flex-col text-xs leading-4 text-[#666666]">
            <p className="truncate">{metadataLineOne}</p>
            <p className="truncate">
              {stockType ? (
                <span className={stockTypeClassName}>{stockType}</span>
              ) : null}
              {stockType && metadataLineTwo ? " \u2022 " : ""}
              {metadataLineTwo}
            </p>
          </div>
        </div>
      </div>
      <div aria-hidden className="relative h-2 w-4 overflow-hidden">
        <div className="absolute -top-[5px] left-1/2 size-[10px] -translate-x-1/2 rotate-45 bg-white shadow-[0px_6px_8px_0px_rgba(0,0,0,0.04)]" />
      </div>
    </div>
  );
}
