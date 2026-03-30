/**
 * Baked light “white + gray grooves” panel — shared by the product shell (`/`) and playground reset.
 * Page layout playground can override locally; “Reset grooves” restores these values.
 */
export const GROOVED_PANEL_LIGHT_BRUSH = {
  grooveIntensity: 25,
  groovePitchPx: 4,
  grooveLineThicknessPx: 2,
  panelGradientTopHex: "#fafafa",
  panelGradientBottomHex: "#f5f5f5",
  baseGradientDepth: 0,
  darkMetal: "carbon" as const,
  lightPanelBase: "whiteGroove" as const,
  showScrews: false,
};

/** Dark grooved panel — product main column (with light preference + dark theme) and playground preview. */
export const GROOVED_PANEL_DARK_BRUSH = {
  /** Slightly below max so brushed grooves stay atmospheric, not chalky. */
  grooveIntensity: 78,
  groovePitchPx: 4,
  grooveLineThicknessPx: 2,
  baseGradientDepth: 88,
  darkMetal: "brushed" as const,
  lightPanelBase: "metal" as const,
  showScrews: false,
};
