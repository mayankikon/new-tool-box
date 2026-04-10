"use client";

import type { GroovedPanelDarkAppearance } from "@/lib/grooved-panel-dark-appearance";
import { cn } from "@/lib/utils";

export type DashPreviewSurface = "dark" | "light";

/** When `surface` is dark: carbon weave (tabs default) vs brushed horizontal grooves. */
export type DashPreviewDarkMetal = "carbon" | "brushed";

export interface DashPreviewBrushProps {
  /**
   * Scales horizontal groove contrast. 100 = default; 0 = no lines; 200 = strong.
   * @deprecated Use `grooveIntensity`; kept for callers still passing `verticalIntensity`.
   */
  verticalIntensity?: number;
  /** Preferred: horizontal groove contrast (same scale as former `verticalIntensity`). */
  grooveIntensity?: number;
  /**
   * Base metal gray gradient strength. 0 = very flat / light; 100 = default (lighter than legacy);
   * 200 = deepest contrast (legacy-style zinc on light, richer depth on dark).
   */
  baseGradientDepth?: number;
  /**
   * Repeat period in px: one groove band + gap before the next (lines stay equidistant).
   * Larger = more space between lines (when thickness is fixed).
   */
  groovePitchPx?: number;
  /**
   * Dark line thickness in px within each repeat period. Omit to use half the pitch (legacy).
   * Gap between lines equals pitch minus thickness; same period repeats (equidistant bands).
   */
  grooveLineThicknessPx?: number;
  /**
   * Light `whiteGroove` only: vertical gradient behind the grooves (top → bottom), 6-digit hex.
   */
  panelGradientTopHex?: string;
  /** Light `whiteGroove` only: bottom stop of the vertical gradient. */
  panelGradientBottomHex?: string;
  /** Corner screw heads. */
  showScrews?: boolean;
  /** Only applies when `surface` is `dark`. */
  darkMetal?: DashPreviewDarkMetal;
  /**
   * Dark + `brushed` only: user-defined diagonal ramp + groove stroke (General settings).
   * When omitted, built-in zinc ramp and white grooves apply.
   */
  darkBrushedAppearance?: GroovedPanelDarkAppearance;
  /**
   * Light surface only. `whiteGroove` = near-white base with gray horizontal lines (no zinc ramp).
   * `metal` = adjustable zinc gradient (default elsewhere).
   */
  lightPanelBase?: "metal" | "whiteGroove";
}

const DEFAULT_GROOVE_INTENSITY = 100;
/** Default panel read: slightly lighter than the original deep zinc ramp. */
const DEFAULT_BASE_GRADIENT_DEPTH = 80;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = hex.replace("#", "");
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => Math.round(clamp(x, 0, 255)).toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHex(flatHex: string, deepHex: string, tDeep: number): string {
  const A = hexToRgb(flatHex);
  const B = hexToRgb(deepHex);
  return rgbToHex(lerp(A.r, B.r, tDeep), lerp(A.g, B.g, tDeep), lerp(A.b, B.b, tDeep));
}

function normalizePanelHex(input: string | undefined, fallback: string): string {
  if (input == null || input.trim() === "") return fallback;
  const t = input.trim().replace(/^#/, "");
  if (/^[0-9A-Fa-f]{6}$/.test(t)) return `#${t}`;
  if (/^[0-9A-Fa-f]{3}$/.test(t)) {
    return `#${t[0]}${t[0]}${t[1]}${t[1]}${t[2]}${t[2]}`;
  }
  return fallback;
}

/** One horizontal groove cycle: transparent [0, gapEnd), stroke [gapEnd, period). */
function grooveHorizontalRepeat(
  pitchRaw: number,
  lineThicknessPx: number | undefined,
): { period: number; gapEnd: number; lineThickness: number } {
  const period = clamp(pitchRaw, 2, 48);
  const defaultThick = Math.max(0.5, period / 2);
  const thick =
    lineThicknessPx === undefined
      ? defaultThick
      : clamp(lineThicknessPx, 0.5, Math.max(0.5, period - 0.5));
  const gapEnd = Math.max(0.5, period - thick);
  return { period, gapEnd, lineThickness: thick };
}

function buildLightBrushedStyle(
  grooveIntensity: number,
  groovePitchPx: number,
  baseGradientDepth: number,
  grooveLineThicknessPx?: number,
): Pick<React.CSSProperties, "backgroundColor" | "backgroundImage"> {
  const scale = clamp(grooveIntensity, 0, 200) / 100;
  const lineAlpha = 0.04 * scale;
  const pitch = clamp(groovePitchPx, 2, 48);
  const { period, gapEnd } = grooveHorizontalRepeat(pitch, grooveLineThicknessPx);
  const tDeep = clamp(baseGradientDepth, 0, 200) / 200;
  const bg = mixHex("#f3f3f6", "#e4e4e7", tDeep);
  const c0 = mixHex("#fafafa", "#f4f4f5", tDeep);
  const c1 = mixHex("#eeeef2", "#d4d4d8", tDeep);
  const c2 = mixHex("#f5f5f7", "#e8e8ec", tDeep);
  return {
    backgroundColor: bg,
    backgroundImage: `
    linear-gradient(180deg, rgba(255,255,255,0.95) 0%, transparent 45%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${gapEnd}px,
      rgba(0,0,0,${lineAlpha}) ${gapEnd}px,
      rgba(0,0,0,${lineAlpha}) ${period}px
    ),
    linear-gradient(145deg, ${c0} 0%, ${c1} 42%, ${c2} 100%)
  `,
  };
}

/** White / off-white panel with visible gray grooves only — for playground billing preview. */
function buildLightWhiteGrooveStyle(
  grooveIntensity: number,
  groovePitchPx: number,
  grooveLineThicknessPx: number | undefined,
  panelGradientTopHex: string | undefined,
  panelGradientBottomHex: string | undefined,
): Pick<React.CSSProperties, "backgroundColor" | "backgroundImage"> {
  const scale = clamp(grooveIntensity, 0, 200) / 100;
  const lineAlpha = 0.048 * scale;
  const pitch = clamp(groovePitchPx, 2, 48);
  const { period, gapEnd } = grooveHorizontalRepeat(pitch, grooveLineThicknessPx);
  const topHex = normalizePanelHex(panelGradientTopHex, "#fafafa");
  const bottomHex = normalizePanelHex(panelGradientBottomHex, "#f4f4f4");
  return {
    backgroundColor: topHex,
    backgroundImage: `
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${gapEnd}px,
      rgba(0,0,0,${lineAlpha}) ${gapEnd}px,
      rgba(0,0,0,${lineAlpha}) ${period}px
    ),
    linear-gradient(180deg, ${topHex} 0%, ${bottomHex} 100%)
  `,
  };
}

function buildDarkCarbonStyle(
  grooveIntensity: number,
  groovePitchPx: number,
  baseGradientDepth: number,
  grooveLineThicknessPx?: number,
): Pick<React.CSSProperties, "backgroundColor" | "backgroundImage"> {
  const scale = clamp(grooveIntensity, 0, 200) / 100;
  const a0 = 0.18 * scale;
  const pitch = clamp(groovePitchPx, 2, 48);
  const { period, gapEnd } = grooveHorizontalRepeat(pitch, grooveLineThicknessPx);
  const tDeep = clamp(baseGradientDepth, 0, 200) / 200;
  const bg = mixHex("#1a1a1d", "#141416", tDeep);
  const g0 = mixHex("#222226", "#1a1a1e", tDeep);
  const g1 = mixHex("#121214", "#0c0c0e", tDeep);
  const g2 = mixHex("#1e1e22", "#16161a", tDeep);
  return {
    backgroundColor: bg,
    backgroundImage: `
    linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 42%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${gapEnd}px,
      rgba(0,0,0,${a0}) ${gapEnd}px,
      rgba(0,0,0,${a0}) ${period}px
    ),
    linear-gradient(125deg, ${g0} 0%, ${g1} 50%, ${g2} 100%)
  `,
  };
}

function buildDarkBrushedStyle(
  grooveIntensity: number,
  groovePitchPx: number,
  baseGradientDepth: number,
  grooveLineThicknessPx: number | undefined,
  customAppearance?: GroovedPanelDarkAppearance,
): Pick<React.CSSProperties, "backgroundColor" | "backgroundImage"> {
  const scale = clamp(grooveIntensity, 0, 200) / 100;
  /** Subtle cool-dark lines only — high-white alpha reads as gray “scratch” on dark UI. */
  const defaultLineAlpha = 0.022 * scale;
  const pitch = clamp(groovePitchPx, 2, 48);
  const { period, gapEnd } = grooveHorizontalRepeat(pitch, grooveLineThicknessPx);
  const tDeep = clamp(baseGradientDepth, 0, 200) / 200;

  let bg: string;
  let c0: string;
  let c1: string;
  let c2: string;
  let lineRgba: string;
  let sheenGradient: string;

  if (customAppearance) {
    const start = normalizePanelHex(
      customAppearance.gradientStartHex,
      "#242428",
    );
    const end = normalizePanelHex(customAppearance.gradientEndHex, "#070709");
    const grooveHex = normalizePanelHex(
      customAppearance.grooveLineHex,
      "#ffffff",
    );
    const gline = hexToRgb(grooveHex);
    /** Match non-custom path: groove contrast slider scales stroke alpha. */
    const gA = clamp(customAppearance.grooveOpacity, 0, 1) * scale;
    const sheenA = clamp(customAppearance.sheenOpacity, 0, 1);
    const sheenHex = normalizePanelHex(
      customAppearance.sheenColorHex,
      "#000000",
    );
    const sheenRgb = hexToRgb(sheenHex);
    bg = mixHex(start, end, 0.08 + 0.1 * tDeep);
    c0 = mixHex(start, end, 0.12 * tDeep);
    c1 = mixHex(start, end, 0.42 + 0.2 * tDeep);
    c2 = mixHex(start, end, 0.88 + 0.1 * (1 - tDeep));
    lineRgba = `rgba(${gline.r},${gline.g},${gline.b},${gA})`;
    sheenGradient = `linear-gradient(180deg, rgba(${sheenRgb.r},${sheenRgb.g},${sheenRgb.b},${sheenA}) 0%, transparent 40%)`;
  } else {
    bg = mixHex("#121215", "#0a0a0c", tDeep);
    c0 = mixHex("#18181c", "#101014", tDeep);
    c1 = mixHex("#0c0c0e", "#060608", tDeep);
    c2 = mixHex("#141418", "#0c0c10", tDeep);
    lineRgba = `rgba(255,255,255,${defaultLineAlpha})`;
    sheenGradient =
      "linear-gradient(180deg, rgba(255,255,255,0.028) 0%, transparent 40%)";
  }

  /**
   * Extended crush: single monotonic falloff (no stacked “light” mid-bands). Painted
   * first in the list = topmost—dims sheen/vignette highlights for a user-controlled
   * darker top.
   */
  let topExtendedCrushLayer = "";
  /**
   * Vignette: slider 0–1 → internal strength via stacked gradients + radial.
   */
  let topVignetteLayer = "";
  if (customAppearance) {
    const ext = clamp(customAppearance.topCrushExtended, 0, 1);
    if (ext > 0) {
      const a = ext;
      topExtendedCrushLayer = `linear-gradient(180deg, rgba(0,0,0,${a}) 0%, rgba(0,0,0,${a * 0.78}) 5%, rgba(0,0,0,${a * 0.42}) 14%, rgba(0,0,0,${a * 0.12}) 28%, transparent 52%),`;
      if (a > 0.55) {
        const edge = Math.min(1, (a - 0.55) / 0.45);
        topExtendedCrushLayer += `linear-gradient(180deg, rgba(0,0,0,${0.35 + edge * 0.62}) 0%, rgba(0,0,0,${0.12 + edge * 0.2}) 7%, transparent 22%),`;
      }
    }

    const vig = clamp(customAppearance.topVignetteOpacity, 0, 1);
    if (vig > 0) {
      const strength = vig * 2.5;
      const a = Math.min(1, strength);
      const b = Math.max(0, Math.min(1, strength - 1));
      const c = Math.max(0, strength - 2);
      const parts: string[] = [];
      if (c > 0) {
        parts.push(
          `linear-gradient(180deg, rgba(0,0,0,${Math.min(1, c)}) 0%, rgba(0,0,0,${c * 0.35}) 40%, transparent 68%)`,
        );
      }
      if (b > 0) {
        parts.push(
          `linear-gradient(180deg, rgba(0,0,0,${b}) 0%, rgba(0,0,0,${b * 0.42}) 36%, transparent 74%)`,
        );
      }
      parts.push(
        `radial-gradient(ellipse 125% 72% at 50% -12%, rgba(0,0,0,${a * 0.88}) 0%, rgba(0,0,0,${a * 0.32}) 52%, transparent 78%)`,
      );
      parts.push(
        `linear-gradient(180deg, rgba(0,0,0,${a}) 0%, rgba(0,0,0,${a * 0.82}) 16%, rgba(0,0,0,${a * 0.58}) 34%, rgba(0,0,0,${a * 0.34}) 52%, rgba(0,0,0,${a * 0.14}) 70%, rgba(0,0,0,${a * 0.04}) 86%, transparent 100%)`,
      );
      topVignetteLayer = `${parts.join(",")},`;
    }
  }

  return {
    backgroundColor: bg,
    backgroundImage: `
    ${topExtendedCrushLayer}${topVignetteLayer}${sheenGradient},
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent ${gapEnd}px,
      ${lineRgba} ${gapEnd}px,
      ${lineRgba} ${period}px
    ),
    linear-gradient(128deg, ${c0} 0%, ${c1} 52%, ${c2} 100%)
  `,
  };
}

function resolvePreviewBackground(
  surface: DashPreviewSurface,
  brush: Required<
    Pick<DashPreviewBrushProps, "grooveIntensity" | "groovePitchPx" | "darkMetal" | "baseGradientDepth">
  > &
    Pick<
      DashPreviewBrushProps,
      | "lightPanelBase"
      | "grooveLineThicknessPx"
      | "panelGradientTopHex"
      | "panelGradientBottomHex"
      | "darkBrushedAppearance"
    >,
): Pick<React.CSSProperties, "backgroundColor" | "backgroundImage"> {
  const lineThick = brush.grooveLineThicknessPx;
  if (surface === "light") {
    if (brush.lightPanelBase === "whiteGroove") {
      return buildLightWhiteGrooveStyle(
        brush.grooveIntensity,
        brush.groovePitchPx,
        lineThick,
        brush.panelGradientTopHex,
        brush.panelGradientBottomHex,
      );
    }
    return buildLightBrushedStyle(
      brush.grooveIntensity,
      brush.groovePitchPx,
      brush.baseGradientDepth,
      lineThick,
    );
  }
  if (brush.darkMetal === "brushed") {
    return buildDarkBrushedStyle(
      brush.grooveIntensity,
      brush.groovePitchPx,
      brush.baseGradientDepth,
      lineThick,
      brush.darkBrushedAppearance,
    );
  }
  return buildDarkCarbonStyle(
    brush.grooveIntensity,
    brush.groovePitchPx,
    brush.baseGradientDepth,
    lineThick,
  );
}

interface DashPreviewCanvasProps {
  children: React.ReactNode;
  className?: string;
  /** Dark carbon dash vs light brushed panel (for tab / control previews). */
  surface?: DashPreviewSurface;
  /** Optional CSS variables for DialKit-driven chrome (e.g. --retro-led-blur). */
  style?: React.CSSProperties;
  /** Brushed-metal tuning (horizontal grooves, base gradient depth, corner screws). */
  brush?: DashPreviewBrushProps;
  /**
   * When `surface` is light, normally child text is nudged to zinc for panel contrast.
   * Set false for full app previews that should keep theme typography.
   */
  toneChildTypography?: boolean;
  /** Merged onto the inner content wrapper (default includes gap-6). Use e.g. gap-0 for app shell. */
  innerClassName?: string;
}

/**
 * Dash-themed preview: dark carbon / brushed panel or light brushed-metal panel.
 */
export function DashPreviewCanvas({
  children,
  className,
  surface = "dark",
  style,
  brush,
  toneChildTypography = true,
  innerClassName,
}: DashPreviewCanvasProps) {
  const isLight = surface === "light";
  const grooveIntensity =
    brush?.grooveIntensity ?? brush?.verticalIntensity ?? DEFAULT_GROOVE_INTENSITY;
  const groovePitchPx =
    brush?.groovePitchPx ?? (surface === "light" ? 2 : 3);
  const grooveLineThicknessPx = brush?.grooveLineThicknessPx;
  const panelGradientTopHex = brush?.panelGradientTopHex;
  const panelGradientBottomHex = brush?.panelGradientBottomHex;
  const darkBrushedAppearance = brush?.darkBrushedAppearance;
  const darkMetal = brush?.darkMetal ?? "carbon";
  const showScrews = brush?.showScrews ?? true;
  const baseGradientDepth = brush?.baseGradientDepth ?? DEFAULT_BASE_GRADIENT_DEPTH;
  const lightPanelBase = brush?.lightPanelBase ?? "metal";
  const isWhiteGrooveLight = isLight && lightPanelBase === "whiteGroove";

  const baseBg = resolvePreviewBackground(surface, {
    grooveIntensity,
    groovePitchPx,
    darkMetal,
    baseGradientDepth,
    lightPanelBase,
    grooveLineThicknessPx,
    panelGradientTopHex,
    panelGradientBottomHex,
    darkBrushedAppearance,
  });

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg p-8",
        isWhiteGrooveLight
          ? "border border-zinc-200/75 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_10px_rgba(0,0,0,0.04)]"
          : isLight
            ? "border border-zinc-400/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-2px_12px_rgba(0,0,0,0.08)]"
            : "border border-zinc-600/80 shadow-[inset_0_2px_24px_rgba(0,0,0,0.65)]",
        className
      )}
      style={{
        ...baseBg,
        ...style,
      }}
    >
      <div
        className={cn(
          "relative z-[1] flex flex-col items-stretch gap-6",
          isLight &&
            toneChildTypography &&
            "text-zinc-900 [&_.text-muted-foreground]:text-zinc-600",
          innerClassName
        )}
      >
        {children}
      </div>
      {showScrews ? (
        <>
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-3 top-3 z-[2] size-2 rounded-full border shadow-inner",
              isLight
                ? "border-zinc-400/80 bg-gradient-to-br from-zinc-100 to-zinc-400/90"
                : "border-zinc-500/60 bg-gradient-to-br from-zinc-400/30 to-zinc-800/80"
            )}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute right-3 top-3 z-[2] size-2 rounded-full border shadow-inner",
              isLight
                ? "border-zinc-400/80 bg-gradient-to-br from-zinc-100 to-zinc-400/90"
                : "border-zinc-500/60 bg-gradient-to-br from-zinc-400/30 to-zinc-800/80"
            )}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-3 left-3 z-[2] size-2 rounded-full border shadow-inner",
              isLight
                ? "border-zinc-400/80 bg-gradient-to-br from-zinc-100 to-zinc-400/90"
                : "border-zinc-500/60 bg-gradient-to-br from-zinc-400/30 to-zinc-800/80"
            )}
          />
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute bottom-3 right-3 z-[2] size-2 rounded-full border shadow-inner",
              isLight
                ? "border-zinc-400/80 bg-gradient-to-br from-zinc-100 to-zinc-400/90"
                : "border-zinc-500/60 bg-gradient-to-br from-zinc-400/30 to-zinc-800/80"
            )}
          />
        </>
      ) : null}
    </div>
  );
}
