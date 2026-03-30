/**
 * DialKit preset for the **main column** line-field background (all inventory / marketing pages).
 * Tune via DialKit: **App Line Field** (Line Field + Surface).
 */
export type DialTuple = [number, number, number, number?];

export type LineFieldDialPreset = {
  lineField: {
    spacing: DialTuple;
    thickness: DialTuple;
    topOpacity: DialTuple;
    bottomOpacity: DialTuple;
    tint: string;
    blur: DialTuple;
    lift: DialTuple;
  };
  surface: {
    showPattern: boolean;
    glowOpacity: DialTuple;
    noiseOpacity: DialTuple;
  };
};

/** Single DialKit registration id for the app shell pattern. */
export const APP_LINE_FIELD_DIAL_LABEL = "App Line Field" as const;

export const appLineFieldDialPreset: LineFieldDialPreset = {
  lineField: {
    spacing: [4, 2, 32, 1] as DialTuple,
    thickness: [1.2, 0.5, 4, 0.1] as DialTuple,
    topOpacity: [0.18, 0.02, 0.5, 0.01] as DialTuple,
    bottomOpacity: [0.15, 0.01, 0.4, 0.01] as DialTuple,
    tint: "#d7dde4",
    blur: [0, 0, 8, 0.25] as DialTuple,
    lift: [0, -120, 120, 1] as DialTuple,
  },
  surface: {
    showPattern: true,
    glowOpacity: [0.2, 0, 0.7, 0.01] as DialTuple,
    noiseOpacity: [0.08, 0, 0.2, 0.01] as DialTuple,
  },
};
