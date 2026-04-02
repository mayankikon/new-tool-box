"use client";

/**
 * Shared visual tokens for the Portfolio 3.0 checkbox + radio reference matrix.
 */

export const PORTFOLIO_FORM_CONTROL_BORDER_HEX = "#ebeced";
export const PORTFOLIO_FORM_CONTROL_GREEN_HEX = "#1A9375";
export const PORTFOLIO_FORM_CONTROL_DISABLED_FILL_HEX = "#a3a3a3";
export const PORTFOLIO_FORM_CONTROL_GRADIENT_START_HEX = "#ECECED";
export const PORTFOLIO_FORM_CONTROL_GRADIENT_MID_HEX = "#7A7B7F";
export const PORTFOLIO_FORM_CONTROL_GRADIENT_END_HEX = "#ECECED";
export const PORTFOLIO_FORM_CONTROL_SURFACE_HEX = "#fafafa";

export interface PortfolioControlSharedVisuals {
  accentColor: string;
  gradientStartColor: string;
  gradientMidColor: string;
  gradientEndColor: string;
  surfaceColor: string;
  disabledFillColor: string;
}

export interface PortfolioCheckboxVisuals extends PortfolioControlSharedVisuals {
  glowSizePx: number;
  glowBlurPx: number;
  glowOpacity: number;
  fillRadiusPx: number;
}

export interface PortfolioRadioVisuals extends PortfolioControlSharedVisuals {
  glowSizePx: number;
  glowBlurPx: number;
  glowOpacity: number;
  dotSizePx: number;
}

export const PORTFOLIO_CHECKBOX_DEFAULT_VISUALS: PortfolioCheckboxVisuals = {
  accentColor: PORTFOLIO_FORM_CONTROL_GREEN_HEX,
  gradientStartColor: PORTFOLIO_FORM_CONTROL_GRADIENT_START_HEX,
  gradientMidColor: PORTFOLIO_FORM_CONTROL_GRADIENT_MID_HEX,
  gradientEndColor: PORTFOLIO_FORM_CONTROL_GRADIENT_END_HEX,
  surfaceColor: PORTFOLIO_FORM_CONTROL_SURFACE_HEX,
  disabledFillColor: PORTFOLIO_FORM_CONTROL_DISABLED_FILL_HEX,
  glowSizePx: 12,
  glowBlurPx: 2,
  glowOpacity: 1,
  fillRadiusPx: 2,
};

export const PORTFOLIO_RADIO_DEFAULT_VISUALS: PortfolioRadioVisuals = {
  accentColor: PORTFOLIO_FORM_CONTROL_GREEN_HEX,
  gradientStartColor: PORTFOLIO_FORM_CONTROL_GRADIENT_START_HEX,
  gradientMidColor: PORTFOLIO_FORM_CONTROL_GRADIENT_MID_HEX,
  gradientEndColor: PORTFOLIO_FORM_CONTROL_GRADIENT_END_HEX,
  surfaceColor: PORTFOLIO_FORM_CONTROL_SURFACE_HEX,
  disabledFillColor: PORTFOLIO_FORM_CONTROL_DISABLED_FILL_HEX,
  glowSizePx: 12,
  glowBlurPx: 2,
  glowOpacity: 1,
  dotSizePx: 10,
};

export function hexToRgbaString(hexColor: string, alpha: number): string {
  const normalizedHex = hexColor.replace("#", "");
  const safeAlpha = Math.min(1, Math.max(0, alpha));

  if (normalizedHex.length !== 6) {
    return hexColor;
  }

  const red = Number.parseInt(normalizedHex.slice(0, 2), 16);
  const green = Number.parseInt(normalizedHex.slice(2, 4), 16);
  const blue = Number.parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${safeAlpha})`;
}
