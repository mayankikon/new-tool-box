"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { MapMarkerHoverFrame } from "@/components/ui/map-marker-hover-frame";
import {
  encodePublicAssetPath,
  vehicleMarkerChipAssets,
  vehicleStatusIndicatorsLargeAsset,
  vehicleStatusIndicatorsLargeSourceSize,
} from "@/components/icons/map-marker-assets";

/** Stroke colors aligned with {@link vehicleMarkerChipAssets} order (Figma default / variant 1 / variant 2). */
export const VEHICLE_MARKER_CHIP_STROKE_HEX = [
  "#00B397",
  "#E6B117",
  "#E50C0C",
] as const;

/** Interior fill (Sort UI vehicle marker export). */
const VEHICLE_MARKER_FILL_PATH_D =
  "M6 12C6 9.79086 7.79086 8 10 8H64C66.2091 8 68 9.79086 68 12V37.0874C68 38.8234 66.8802 40.3612 65.228 40.8942L38.228 49.6039C37.4296 49.8614 36.5704 49.8614 35.772 49.6039L8.77199 40.8942C7.1198 40.3612 6 38.8234 6 37.0874V12Z";

/** Outer stroke path (same geometry for all chip variants). */
const VEHICLE_MARKER_STROKE_PATH_D =
  "M10 9H64C65.6569 9 67 10.3431 67 12V37.0869C67 38.3889 66.16 39.5427 64.9209 39.9424L37.9209 48.6523C37.3222 48.8454 36.6778 48.8454 36.0791 48.6523L9.0791 39.9424C7.83996 39.5427 7 38.3889 7 37.0869V12C7 10.3431 8.34315 9 10 9Z";

const PHOTO_WELL_X = 10;
const PHOTO_WELL_Y = 0;
const PHOTO_WELL_SIZE = 54;
/** Drawn image viewport: 1.1× the 52×52 baseline, centered in the 54×54 Figma clip (`meet`; slight edge crop). */
const PHOTO_IMAGE_SIZE = 52 * 1.1;
const PHOTO_IMAGE_X =
  PHOTO_WELL_X + (PHOTO_WELL_SIZE - PHOTO_IMAGE_SIZE) / 2;
const PHOTO_IMAGE_Y =
  PHOTO_WELL_Y + (PHOTO_WELL_SIZE - PHOTO_IMAGE_SIZE) / 2;

function parseViewBox(viewBox: string): [number, number, number, number] {
  const parts = viewBox.trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) {
    return [0, 0, 84, 40];
  }
  return parts as [number, number, number, number];
}

/** Cropped key + battery strip from `Status Indicators - Large.svg` (standalone asset; compose at the screen if needed). */
export function VehicleMapMarkerStatusIndicatorCrop(props: {
  viewBox: string;
  className?: string;
  title: string;
}) {
  const [vx, vy, vw, vh] = parseViewBox(props.viewBox);
  const src = encodePublicAssetPath(vehicleStatusIndicatorsLargeAsset.publicPath);
  const { width: iw, height: ih } = vehicleStatusIndicatorsLargeSourceSize;
  return (
    <svg
      viewBox={`0 0 ${vw} ${vh}`}
      className={props.className}
      role="img"
      aria-label={props.title}
    >
      <title>{props.title}</title>
      <image href={src} x={-vx} y={-vy} width={iw} height={ih} />
    </svg>
  );
}

export interface VehicleMapMarkerChipProps {
  /** Index into {@link vehicleMarkerChipAssets} / {@link VEHICLE_MARKER_CHIP_STROKE_HEX} (clamped). */
  variantIndex?: number;
  className?: string;
  /** When set, renders the Figma frame as vector SVG with this photo in a centered viewport (52×52 at 1.1× scale; `meet`; same URLs as vehicle list). */
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  hoverOverlayColor?: string;
}

function VehicleMapMarkerChipWithPhoto({
  variantIndex,
  className,
  imageSrc,
  imageAlt,
  title,
  hoverOverlayColor,
}: Required<Pick<VehicleMapMarkerChipProps, "imageSrc">> &
  Pick<
    VehicleMapMarkerChipProps,
    "variantIndex" | "className" | "imageAlt" | "title" | "hoverOverlayColor"
  >) {
  const uid = useId().replace(/:/g, "");
  const filterId = `vm-chip-filter-${uid}`;
  const clipId = `vm-chip-clip-${uid}`;
  const safeVariant = Math.min(
    Math.max(0, variantIndex ?? 0),
    VEHICLE_MARKER_CHIP_STROKE_HEX.length - 1
  );
  const stroke = VEHICLE_MARKER_CHIP_STROKE_HEX[safeVariant];
  const alt = imageAlt?.trim() || title?.trim() || "Vehicle";

  const svg = (
    <svg
      width={74}
      height={60}
      viewBox="0 0 74 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-[60px] w-[74px] shrink-0", className)}
      role="img"
      aria-label={alt}
    >
      <title>{alt}</title>
      <defs>
        <filter
          id={filterId}
          x="0"
          y="6"
          width="74"
          height="53.7969"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.15 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
        <clipPath id={clipId}>
          <rect
            width={PHOTO_WELL_SIZE}
            height={PHOTO_WELL_SIZE}
            transform={`translate(${PHOTO_WELL_X})`}
          />
        </clipPath>
      </defs>
      <g filter={`url(#${filterId})`}>
        <path d={VEHICLE_MARKER_FILL_PATH_D} fill="#E5E5E5" />
        <path
          d={VEHICLE_MARKER_STROKE_PATH_D}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
        />
      </g>
      <g clipPath={`url(#${clipId})`}>
        <image
          href={imageSrc}
          x={PHOTO_IMAGE_X}
          y={PHOTO_IMAGE_Y}
          width={PHOTO_IMAGE_SIZE}
          height={PHOTO_IMAGE_SIZE}
          preserveAspectRatio="xMidYMid meet"
        />
      </g>
    </svg>
  );

  if (!hoverOverlayColor) {
    return svg;
  }

  return (
    <MapMarkerHoverFrame
      className="pointer-events-auto"
      backdropColor={hoverOverlayColor}
      backdropClassName="h-[56px] w-[88px]"
      backdropOffsetY={-1}
      backdropStyle={{
        clipPath: "polygon(8% 16%, 92% 16%, 92% 64%, 50% 88%, 8% 64%)",
      }}
    >
      {svg}
    </MapMarkerHoverFrame>
  );
}

/**
 * Figma vehicle marker: static export (`vehicleMarkerChipAssets`) when no photo; vector frame + clipped `imageSrc` when a photo URL is provided.
 */
export function VehicleMapMarkerChip({
  variantIndex = 0,
  className,
  imageSrc,
  imageAlt,
  title,
  hoverOverlayColor,
}: VehicleMapMarkerChipProps) {
  const chipList = vehicleMarkerChipAssets;
  const safeVariant = Math.min(
    Math.max(0, variantIndex),
    Math.max(0, chipList.length - 1)
  );

  const trimmedSrc = imageSrc?.trim();
  if (trimmedSrc) {
    return (
      <VehicleMapMarkerChipWithPhoto
        variantIndex={safeVariant}
        className={className}
        imageSrc={trimmedSrc}
        imageAlt={imageAlt}
        title={title}
        hoverOverlayColor={hoverOverlayColor}
      />
    );
  }

  const chip = chipList[safeVariant];
  const mainSrc = chip ? encodePublicAssetPath(chip.publicPath) : "";

  const image = mainSrc ? (
    <img
      src={mainSrc}
      width={74}
      height={60}
      alt=""
      className={cn(
        "h-[60px] w-[74px] shrink-0 object-contain drop-shadow-sm",
        className
      )}
      decoding="async"
      draggable={false}
    />
  ) : null;

  if (!image || !hoverOverlayColor) {
    return image;
  }

  return (
    <MapMarkerHoverFrame
      className="pointer-events-auto"
      backdropColor={hoverOverlayColor}
      backdropClassName="h-[56px] w-[88px]"
      backdropOffsetY={-1}
      backdropStyle={{
        clipPath: "polygon(8% 16%, 92% 16%, 92% 64%, 50% 88%, 8% 64%)",
      }}
    >
      {image}
    </MapMarkerHoverFrame>
  );
}
