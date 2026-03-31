/**
 * Dark “brushed metal” main-column background (DashPreviewCanvas dark + brushed).
 * **`DEFAULT_GROOVED_PANEL_DARK_APPEARANCE`** is the shipped product profile (edit in
 * code). `GroovedPanelPreferenceProvider` only persists grooved on/off.
 */

export interface GroovedPanelDarkAppearance {
  /** 6-digit hex: lighter stop of the diagonal metal ramp (seen toward top-left). */
  gradientStartHex: string;
  /** 6-digit hex: deeper stop (toward bottom-right). */
  gradientEndHex: string;
  /** 6-digit hex: horizontal groove stroke color (RGB only; alpha separate). */
  grooveLineHex: string;
  /** Groove stroke opacity 0–1. */
  grooveOpacity: number;
  /** Top sheen: RGB tint (usually near-black to deepen the top, not a chalky white). */
  sheenColorHex: string;
  /** Top sheen opacity 0–1 (strength of the sheen gradient). */
  sheenOpacity: number;
  /**
   * Black vignette from the top (0–1). Painted above grooves and sheen so it kills
   * stray white rims from bright groove lines or specular highlights.
   */
  topVignetteOpacity: number;
  /**
   * Extra “extended” top crush (0–1). Stacks **above** vignette + sheen as a single
   * smooth, monotonic black falloff—use when you want a darker, more even top without
   * multi-layer vignette banding or bright mid-stops.
   */
  topCrushExtended: number;
  /**
   * 0–200: horizontal groove contrast on the dark brushed layer (`DashPreviewCanvas`
   * `grooveIntensity`). Lower = subtler lines; higher = brighter strokes.
   */
  brushGrooveIntensity: number;
  /**
   * 0–200: diagonal metal ramp depth (`baseGradientDepth`). Higher usually reads as
   * deeper / richer dark metal vs a flatter wash.
   */
  brushBaseGradientDepth: number;
}

/** Product baseline (matches tuned General settings preview). */
export const DEFAULT_GROOVED_PANEL_DARK_APPEARANCE: GroovedPanelDarkAppearance =
  {
    gradientStartHex: "#1E1F1C",
    gradientEndHex: "#1E1E21",
    grooveLineHex: "#29292e",
    grooveOpacity: 0.98,
    sheenColorHex: "#292929",
    sheenOpacity: 0,
    topVignetteOpacity: 0.15,
    topCrushExtended: 0.5,
    brushGrooveIntensity: 0,
    brushBaseGradientDepth: 5,
  };

export function normalizeGrooveHex(input: string, fallback: string): string {
  const t = input.trim().replace(/^#/, "");
  if (/^[0-9A-Fa-f]{6}$/.test(t)) return `#${t}`;
  if (/^[0-9A-Fa-f]{3}$/.test(t)) {
    return `#${t[0]}${t[0]}${t[1]}${t[1]}${t[2]}${t[2]}`;
  }
  return fallback;
}

export function clampOpacity(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function clampGrooveDial(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(200, Math.max(0, value));
}

/**
 * Merge partial fields onto a base (e.g. previous state). Hex strings are kept as-is so
 * typing “#2a…” does not snap to defaults on every keystroke.
 * Opacity fields are always clamped.
 */
export function mergeGroovedPanelDarkAppearance(
  incoming: Partial<GroovedPanelDarkAppearance> | undefined,
  base: GroovedPanelDarkAppearance,
): GroovedPanelDarkAppearance {
  const merged = { ...base, ...(incoming ?? {}) };
  return {
    ...merged,
    grooveOpacity: clampOpacity(
      merged.grooveOpacity ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.grooveOpacity,
    ),
    sheenOpacity: clampOpacity(
      merged.sheenOpacity ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.sheenOpacity,
    ),
    topVignetteOpacity: clampOpacity(
      merged.topVignetteOpacity ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.topVignetteOpacity,
    ),
    topCrushExtended: clampOpacity(
      merged.topCrushExtended ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.topCrushExtended,
    ),
    brushGrooveIntensity: clampGrooveDial(
      merged.brushGrooveIntensity ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.brushGrooveIntensity,
      DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.brushGrooveIntensity,
    ),
    brushBaseGradientDepth: clampGrooveDial(
      merged.brushBaseGradientDepth ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.brushBaseGradientDepth,
      DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.brushBaseGradientDepth,
    ),
  };
}

/**
 * Safe values for painting (invalid / in-progress hex → fall back to defaults per field).
 */
export function normalizeAppearanceForCanvas(
  a: GroovedPanelDarkAppearance,
): GroovedPanelDarkAppearance {
  return {
    gradientStartHex: normalizeGrooveHex(
      a.gradientStartHex,
      DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.gradientStartHex,
    ),
    gradientEndHex: normalizeGrooveHex(
      a.gradientEndHex,
      DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.gradientEndHex,
    ),
    grooveLineHex: normalizeGrooveHex(
      a.grooveLineHex,
      DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.grooveLineHex,
    ),
    grooveOpacity: clampOpacity(
      a.grooveOpacity ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.grooveOpacity,
    ),
    sheenColorHex: normalizeGrooveHex(
      a.sheenColorHex,
      DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.sheenColorHex,
    ),
    sheenOpacity: clampOpacity(
      a.sheenOpacity ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.sheenOpacity,
    ),
    topVignetteOpacity: clampOpacity(
      a.topVignetteOpacity ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.topVignetteOpacity,
    ),
    topCrushExtended: clampOpacity(
      a.topCrushExtended ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.topCrushExtended,
    ),
    brushGrooveIntensity: clampGrooveDial(
      a.brushGrooveIntensity ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.brushGrooveIntensity,
      DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.brushGrooveIntensity,
    ),
    brushBaseGradientDepth: clampGrooveDial(
      a.brushBaseGradientDepth ??
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.brushBaseGradientDepth,
      DEFAULT_GROOVED_PANEL_DARK_APPEARANCE.brushBaseGradientDepth,
    ),
  };
}
