/**
 * Static map-marker artwork from Figma exports in `public/media/map-markers-source/`.
 * Extracted pins live in `public/media/map-markers/` (see `scripts/extract-map-marker-svgs.mjs`).
 */

export interface MapMarkerAssetItem {
  /** URL path under `public/` (may contain spaces; encode with {@link encodePublicAssetPath} when rendering). */
  publicPath: string;
  figmaLabel: string;
}

/** Encodes each path segment so spaces in folder names work in the browser. */
export function encodePublicAssetPath(absolutePublicPath: string): string {
  if (!absolutePublicPath.startsWith("/")) {
    return absolutePublicPath;
  }
  const segments = absolutePublicPath.split("/").filter(Boolean);
  return `/${segments.map(encodeURIComponent).join("/")}`;
}

/** One SVG per pin variant, split from `Map Marker.svg`. */
export const extractedMapMarkerAssets: MapMarkerAssetItem[] = [
  {
    publicPath: "/media/map-markers/map-marker-number-default.svg",
    figmaLabel: "Style=Number, State=Default",
  },
  {
    publicPath: "/media/map-markers/map-marker-number-active.svg",
    figmaLabel: "Style=Number, State=Active",
  },
  {
    publicPath: "/media/map-markers/map-marker-signal.svg",
    figmaLabel: "Style=Signal, State=Active",
  },
  {
    publicPath: "/media/map-markers/map-marker-signal-error.svg",
    figmaLabel: "Style=Signal - Error, State=Active",
  },
  {
    publicPath: "/media/map-markers/map-marker-group.svg",
    figmaLabel: "Style=Group, State=Active",
  },
  {
    publicPath: "/media/map-markers/map-marker-key.svg",
    figmaLabel: "Style=Key, State=Active",
  },
  {
    publicPath: "/media/map-markers/map-marker-keys.svg",
    figmaLabel: "Style=Keys (shield), State=Active",
  },
  {
    publicPath: "/media/map-markers/map-marker-vehicle-teal.svg",
    figmaLabel: "Style=Car - 2 (teal shield)",
  },
  {
    publicPath: "/media/map-markers/map-marker-vehicle-gold.svg",
    figmaLabel: "Style=Car - 2 (gold shield)",
  },
  {
    publicPath: "/media/map-markers/map-marker-vehicle-orange.svg",
    figmaLabel: "Style=Car - 3, State=Active",
  },
];

/** Raster-backed vehicle chips from Figma (embedded imagery in SVG). */
export const vehicleMarkerChipAssets: MapMarkerAssetItem[] = [
  {
    publicPath: "/media/map-markers-source/Vehicle Marker.svg",
    figmaLabel: "Vehicle Marker",
  },
  {
    publicPath: "/media/map-markers-source/Vehicle Marker-1.svg",
    figmaLabel: "Vehicle Marker — variant 1",
  },
  {
    publicPath: "/media/map-markers-source/Vehicle Marker-2.svg",
    figmaLabel: "Vehicle Marker — variant 2",
  },
];

export const vehicleStatusIndicatorsLargeAsset: MapMarkerAssetItem = {
  publicPath: "/media/map-markers-source/Vehicle Card/Status Indicators - Large.svg",
  figmaLabel: "Vehicle Card / Status Indicators — Large",
};

/** Natural pixel size of `Status Indicators - Large.svg` (for `<image width/height>` when cropping). */
export const vehicleStatusIndicatorsLargeSourceSize = {
  width: 447,
  height: 229,
} as const;

export interface StatusIndicatorLargeCell {
  id: string;
  figmaLabel: string;
  /** Crop rectangle `x y width height` in source SVG user space. */
  viewBox: string;
}

const STATUS_GRID = {
  pad: 2,
  colLefts: [20, 158, 296],
  rowTops: [20, 72, 124, 176],
  cellWidth: 80,
  cellHeight: 36,
} as const;

const STATUS_GRID_LABELS: string[][] = [
  [
    "Key paired · battery good",
    "Key paired · battery warning",
    "Key paired · battery critical (alert)",
  ],
  [
    "Key paired · battery inactive",
    "Key paired · battery warning (column 2)",
    "Key paired · critical + exclamation",
  ],
  [
    "Key not paired / issue · battery good",
    "Key issue · battery warning",
    "Key issue · battery critical",
  ],
  [
    "Key issue · battery inactive",
    "Key issue · battery warning (row 4)",
    "Key issue · critical + exclamation",
  ],
];

function buildStatusIndicatorLargeCells(): StatusIndicatorLargeCell[] {
  const cells: StatusIndicatorLargeCell[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const x = STATUS_GRID.colLefts[col] - STATUS_GRID.pad;
      const y = STATUS_GRID.rowTops[row] - STATUS_GRID.pad;
      const w = STATUS_GRID.cellWidth + 2 * STATUS_GRID.pad;
      const h = STATUS_GRID.cellHeight + 2 * STATUS_GRID.pad;
      cells.push({
        id: `status-large-r${row}-c${col}`,
        figmaLabel: STATUS_GRID_LABELS[row][col],
        viewBox: `${x} ${y} ${w} ${h}`,
      });
    }
  }
  return cells;
}

/**
 * Twelve key+battery composites from the large status sheet (3 columns × 4 rows).
 * Render with {@link encodePublicAssetPath} on the sheet URL and a viewBox crop (see design-system playground).
 */
export const statusIndicatorLargeCells: StatusIndicatorLargeCell[] =
  buildStatusIndicatorLargeCells();
