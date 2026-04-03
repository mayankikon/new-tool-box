import type { LineFieldPatternSnapshot } from "@/components/chrome/line-field-pattern-layers";

/** Static line-field values for the main column background (all inventory / marketing pages). */
export const appLineFieldPattern: LineFieldPatternSnapshot = {
  lineField: {
    spacing: 4,
    thickness: 1.2,
    topOpacity: 0.18,
    bottomOpacity: 0.15,
    tint: "#d7dde4",
    blur: 0,
    lift: 0,
  },
  surface: {
    showPattern: true,
    glowOpacity: 0.2,
    noiseOpacity: 0.08,
  },
};
