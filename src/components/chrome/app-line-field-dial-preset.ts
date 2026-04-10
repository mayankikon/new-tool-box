import type { LineFieldPatternSnapshot } from "@/components/chrome/line-field-pattern-layers";

/** Static line-field values for the main column background (all inventory / marketing pages). */
export const appLineFieldPattern: LineFieldPatternSnapshot = {
  lineField: {
    spacing: 4,
    thickness: 1.2,
    topOpacity: 0.18,
    bottomOpacity: 0.15,
    /** Neutral gray pinstripes on `neutral-50` (same family as `--neutral-300`–`--neutral-400`). */
    tint: "#c4c4c4",
    blur: 0,
    lift: 0,
  },
  surface: {
    showPattern: true,
    glowOpacity: 0.2,
    noiseOpacity: 0.08,
  },
};
