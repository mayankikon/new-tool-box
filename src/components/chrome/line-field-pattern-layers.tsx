"use client";

export interface LineFieldPatternSnapshot {
  lineField: {
    spacing: number;
    thickness: number;
    topOpacity: number;
    bottomOpacity: number;
    tint: string;
    blur: number;
    lift: number;
  };
  surface: {
    showPattern: boolean;
    glowOpacity: number;
    noiseOpacity: number;
  };
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  if (!/^[\da-fA-F]{6}$/.test(expanded)) {
    return { r: 148, g: 163, b: 184 };
  }

  return {
    r: Number.parseInt(expanded.slice(0, 2), 16),
    g: Number.parseInt(expanded.slice(2, 4), 16),
    b: Number.parseInt(expanded.slice(4, 6), 16),
  };
}

/**
 * Dark theme: preset opacities assume a light shell. Re-map to black-based washes and
 * very faint pinstripes so we do not paint a second “white from the top” on top of the
 * grooved column (which would disagree with Settings → General live preview).
 */
const DARK_LINE_ALPHA_SCALE = 0.14;
const DARK_GLOW_CRUSH_MAX = 0.52;

function buildLightSurfaceBackgroundImage(
  pattern: LineFieldPatternSnapshot,
  tint: { r: number; g: number; b: number },
): string {
  return [
    `radial-gradient(ellipse 120% 70% at 50% 0%, rgba(${tint.r}, ${tint.g}, ${tint.b}, ${pattern.surface.glowOpacity}) 0%, transparent 78%)`,
    `linear-gradient(180deg, rgba(255,255,255,${pattern.surface.noiseOpacity}) 0%, rgba(255,255,255,0) 42%)`,
  ].join(", ");
}

function buildDarkSurfaceBackgroundImage(
  pattern: LineFieldPatternSnapshot,
): string {
  const glow = Math.min(
    DARK_GLOW_CRUSH_MAX,
    pattern.surface.glowOpacity * 0.88,
  );
  const noise = pattern.surface.noiseOpacity * 0.85;
  return [
    `radial-gradient(ellipse 120% 70% at 50% 0%, rgba(0,0,0,${glow}) 0%, transparent 78%)`,
    `linear-gradient(180deg, rgba(0,0,0,${noise}) 0%, rgba(0,0,0,0) 42%)`,
  ].join(", ");
}

function buildLightStripedBackgroundImage(
  pattern: LineFieldPatternSnapshot,
  tint: { r: number; g: number; b: number },
): string {
  return `linear-gradient(180deg, rgba(${tint.r}, ${tint.g}, ${tint.b}, ${pattern.lineField.topOpacity}) 0%, rgba(${tint.r}, ${tint.g}, ${tint.b}, ${pattern.lineField.bottomOpacity}) 100%)`;
}

function buildDarkStripedBackgroundImage(pattern: LineFieldPatternSnapshot): string {
  const topA = pattern.lineField.topOpacity * DARK_LINE_ALPHA_SCALE;
  const bottomA = pattern.lineField.bottomOpacity * DARK_LINE_ALPHA_SCALE;
  return `linear-gradient(180deg, rgba(255,255,255,${topA}) 0%, rgba(255,255,255,${bottomA}) 100%)`;
}

/** Absolute, pointer-events-none layers (same math as the former `ConfigurationsLineFieldSurface`). */
export function LineFieldPatternLayers({
  pattern,
  forceDarkAppearance = false,
}: {
  pattern: LineFieldPatternSnapshot;
  /**
   * When true, paint dark-shell overlays even if `<html>` is not `.dark` yet.
   * Use when grooved panel is on **and** appearance is dark so the line field matches
   * `AppGroovedMainColumn` (avoids a white wash on dark metal during hydration).
   */
  forceDarkAppearance?: boolean;
}) {
  const tint = hexToRgb(pattern.lineField.tint);
  const lift = `translateY(${pattern.lineField.lift}px)`;
  const mask = `repeating-linear-gradient(to bottom, rgba(0,0,0,1) 0px, rgba(0,0,0,1) ${pattern.lineField.thickness}px, transparent ${pattern.lineField.thickness}px, transparent ${pattern.lineField.spacing}px)`;
  const patternOpacity = pattern.surface.showPattern ? 1 : 0;

  const darkShellLayers = (
    <>
      <div
        className="absolute inset-0"
        style={{
          opacity: patternOpacity,
          transform: lift,
          backgroundImage: buildDarkSurfaceBackgroundImage(pattern),
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          opacity: patternOpacity,
          transform: lift,
          filter: `blur(${pattern.lineField.blur}px)`,
          backgroundImage: buildDarkStripedBackgroundImage(pattern),
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.22)_100%)]" />
    </>
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {forceDarkAppearance ? (
        <div className="absolute inset-0">{darkShellLayers}</div>
      ) : (
        <>
          {/* Light shell: bright top wash + cool-tint pinstripes. */}
          <div className="absolute inset-0 dark:hidden">
            <div
              className="absolute inset-0"
              style={{
                opacity: patternOpacity,
                transform: lift,
                backgroundImage: buildLightSurfaceBackgroundImage(pattern, tint),
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                opacity: patternOpacity,
                transform: lift,
                filter: `blur(${pattern.lineField.blur}px)`,
                backgroundImage: buildLightStripedBackgroundImage(pattern, tint),
                WebkitMaskImage: mask,
                maskImage: mask,
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.35)_100%)]" />
          </div>
          {/* Dark shell: black top crush + whisper pinstripes so grooved tuning preview matches. */}
          <div className="absolute inset-0 hidden dark:block">{darkShellLayers}</div>
        </>
      )}
    </div>
  );
}
