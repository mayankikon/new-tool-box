"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media-paths";

export type MapViewTooltipVariant = "map" | "table";

export interface MapViewTooltipProps extends React.ComponentProps<"div"> {
  variant: MapViewTooltipVariant;
  /** Title line (defaults per variant). */
  title?: string;
  /** Supporting copy (defaults per variant). */
  description?: string;
  /** Elevated / pressed surface (e.g. parent hover or selected). */
  isActive?: boolean;
  /** Override preview image (default: Figma Sort UI 1.3 export in `public/media/tooltips/`). */
  mapPreviewSrc?: string;
  tablePreviewSrc?: string;
}

const DEFAULT_MAP_PREVIEW = mediaUrl("tooltips/map-view.svg");
/** Table / list preview: Figma "call-to-action table" export (`public/media/tooltips/table-cta.svg`). */
const DEFAULT_TABLE_PREVIEW = mediaUrl("tooltips/table-cta.svg");
const POINTER_MAP = mediaUrl("tooltips/pointer-map.svg");
const POINTER_TABLE = mediaUrl("tooltips/pointer-table.svg");

const DEFAULT_COPY: Record<
  MapViewTooltipVariant,
  { title: string; description: string }
> = {
  map: {
    title: "Map view",
    description: "AI-ranked results displayed on interactive map",
  },
  table: {
    title: "Table view",
    description: "AI-ranked results based on your criteria",
  },
};

/**
 * Rich tooltip body for choosing or explaining inventory map vs table views.
 * Map preview: `map-view.svg`. Table preview: `table-cta.svg` (CTA table export). Pointers: `pointer-*.svg`. All under `public/media/tooltips/`.
 */
export function MapViewTooltip({
  variant,
  title,
  description,
  isActive = false,
  mapPreviewSrc = DEFAULT_MAP_PREVIEW,
  tablePreviewSrc = DEFAULT_TABLE_PREVIEW,
  className,
  ...rest
}: MapViewTooltipProps) {
  const copy = DEFAULT_COPY[variant];
  const heading = title ?? copy.title;
  const body = description ?? copy.description;
  const pointerSrc = variant === "map" ? POINTER_MAP : POINTER_TABLE;

  return (
    <div
      data-variant={variant}
      className={cn(
        "flex w-[225px] flex-col items-center rounded-lg border-0 bg-transparent p-0",
        className
      )}
      {...rest}
    >
      <div
        className={cn(
          "flex min-h-0 w-full flex-col gap-4 self-stretch rounded-lg p-6 transition-[background-color,box-shadow] duration-200",
          isActive
            ? "bg-[rgb(34_34_37)] shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
            : "bg-[rgb(34_34_37)] shadow-none"
        )}
      >
        <div className="flex flex-col gap-1 text-left">
          <span className="font-[family-name:var(--font-saira)] text-base font-medium leading-6 text-white">
            {heading}
          </span>
          <span className="font-[family-name:var(--font-saira)] text-sm font-normal leading-5 text-white/50">
            {body}
          </span>
        </div>

        {variant === "map" ? (
          <div className="relative h-[102px] w-full overflow-hidden rounded-lg bg-white">
            {/* Figma export 177×129; clip matches Playground (top -27px in 102px well). */}
            <Image
              src={mapPreviewSrc}
              alt=""
              width={177}
              height={129}
              unoptimized
              draggable={false}
              className="pointer-events-none absolute left-0 top-[-27px] h-[129px] w-[177px] max-w-none select-none"
            />
          </div>
        ) : (
          <div className="relative h-[103px] w-full overflow-hidden rounded-sm">
            <Image
              src={tablePreviewSrc}
              alt=""
              width={177}
              height={103}
              unoptimized
              draggable={false}
              className="pointer-events-none h-[103px] w-full max-w-none select-none object-contain object-left-top"
            />
          </div>
        )}
      </div>

      <Image
        src={pointerSrc}
        alt=""
        width={12}
        height={6}
        unoptimized
        draggable={false}
        className="mt-0 shrink-0 select-none"
        aria-hidden
      />
    </div>
  );
}
