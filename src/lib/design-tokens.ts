/**
 * Foundation design tokens sourced from globals.css / design-tokens JSON.
 * Used by the design system showcase. Theme colors (`themeTokenGroups`) are the canonical palette;
 * shadcn-style semantic groups are not duplicated here — components still use `--background`, `--primary`,
 * etc. from `globals.css` via Tailwind.
 */

export const radiusTokens = [
  { name: "none", cssVar: "--radius-none", value: "0px", tailwindClass: "rounded-[var(--radius-none)]" },
  { name: "2xs", cssVar: "--radius-2xs", value: "2px", tailwindClass: "rounded-[var(--radius-2xs)]" },
  { name: "xs", cssVar: "--radius-xs", value: "4px", tailwindClass: "rounded-[var(--radius-xs)]" },
  { name: "sm", cssVar: "--radius-sm", value: "6px", tailwindClass: "rounded-[var(--radius-sm)]" },
  { name: "md", cssVar: "--radius-md", value: "8px", tailwindClass: "rounded-[var(--radius-md)]" },
  { name: "lg", cssVar: "--radius-lg", value: "12px", tailwindClass: "rounded-[var(--radius-lg)]" },
  { name: "xl", cssVar: "--radius-xl", value: "16px", tailwindClass: "rounded-[var(--radius-xl)]" },
  { name: "full", cssVar: "--radius-full", value: "9999px", tailwindClass: "rounded-[var(--radius-full)]" },
  { name: "Card-sm", cssVar: "--radius-Card-sm", value: "8px", tailwindClass: "rounded-[var(--radius-Card-sm)]" },
  { name: "Card-md", cssVar: "--radius-Card-md", value: "12px", tailwindClass: "rounded-[var(--radius-Card-md)]" },
] as const;

/** Spacing scale from design-tokens/spacing.json (layout-primitives.css) */
export const spacingTokens = [
  "0", "1", "2", "4", "6", "8", "10", "12", "14", "16", "20", "24", "28", "32", "36", "40", "44", "48",
] as const;

/** Stroke (border width) from design-tokens/stroke.json */
export const strokeTokens = [
  { name: "sm", cssVar: "--stroke-sm", value: "0.5px" },
  { name: "default", cssVar: "--stroke-default", value: "1px" },
  { name: "lg", cssVar: "--stroke-lg", value: "2px" },
  { name: "xl", cssVar: "--stroke-xl", value: "3px" },
] as const;

/** Typography: font families from design-tokens/font-family.json */
export const fontFamilyTokens = [
  { name: "headline", cssVar: "--font-headline", className: "font-headline" },
  { name: "body", cssVar: "--font-body", className: "font-sans" },
  { name: "code", cssVar: "--font-code", className: "font-mono" },
] as const;

/** Font sizes from design-tokens/font-size.json */
export const fontSizeTokens = [
  { name: "xs", value: "12px" },
  { name: "sm", value: "14px" },
  { name: "md", value: "16px" },
  { name: "lg", value: "18px" },
  { name: "xl", value: "20px" },
  { name: "2xl", value: "24px" },
  { name: "3xl", value: "30px" },
  { name: "4xl", value: "36px" },
  { name: "5xl", value: "48px" },
  { name: "6xl", value: "60px" },
] as const;

/** Font weights */
export const fontWeightTokens = [
  { name: "normal", value: "400" },
  { name: "medium", value: "500" },
  { name: "semibold", value: "600" },
  { name: "bold", value: "700" },
] as const;

/** Line heights */
export const lineHeightTokens = [
  { name: "5", value: "20px" },
  { name: "6", value: "24px" },
  { name: "7", value: "28px" },
] as const;

/** Letter spacing */
export const letterSpacingTokens = [
  { name: "tighter", value: "-0.80px" },
  { name: "tight", value: "-0.40px" },
  { name: "normal", value: "0px" },
  { name: "wide", value: "0.40px" },
  { name: "wider", value: "0.80px" },
  { name: "widest", value: "1.60px" },
] as const;

/** Theme tokens (design-tokens/themes.json) for design system showcase - background swatches use var, text use color */
export const themeTokenGroups = [
  {
    name: "Background",
    tokens: [
      { name: "background-page", cssVar: "var(--theme-background-page)", type: "bg" as const },
      { name: "background-container", cssVar: "var(--theme-background-container)", type: "bg" as const },
      { name: "background-default", cssVar: "var(--theme-background-default)", type: "bg" as const },
      { name: "background-sidebar", cssVar: "var(--theme-background-sidebar)", type: "bg" as const },
      { name: "background-accent", cssVar: "var(--theme-background-accent)", type: "bg" as const },
      { name: "background-hover", cssVar: "var(--theme-background-hover)", type: "bg" as const },
      { name: "background-pressed", cssVar: "var(--theme-background-pressed)", type: "bg" as const },
    ],
  },
  {
    name: "Text",
    tokens: [
      { name: "text-primary", cssVar: "var(--theme-text-primary)", type: "text" as const },
      { name: "text-secondary", cssVar: "var(--theme-text-secondary)", type: "text" as const },
      { name: "text-tertiary", cssVar: "var(--theme-text-tertiary)", type: "text" as const },
      { name: "text-inactive", cssVar: "var(--theme-text-inactive)", type: "text" as const },
      { name: "text-destructive", cssVar: "var(--theme-text-destructive)", type: "text" as const },
      { name: "text-interactive", cssVar: "var(--theme-text-interactive)", type: "text" as const },
      { name: "text-success", cssVar: "var(--theme-text-success)", type: "text" as const },
      { name: "text-warning", cssVar: "var(--theme-text-warning)", type: "text" as const },
    ],
  },
  {
    name: "Stroke (border color)",
    tokens: [
      { name: "stroke-default", cssVar: "var(--theme-stroke-default)", type: "bg" as const },
      { name: "stroke-subtle", cssVar: "var(--theme-stroke-subtle)", type: "bg" as const },
      { name: "stroke-accent", cssVar: "var(--theme-stroke-accent)", type: "bg" as const },
      { name: "stroke-destructive", cssVar: "var(--theme-stroke-destructive)", type: "bg" as const },
    ],
  },
  {
    name: "Button",
    tokens: [
      { name: "button-primary-default", cssVar: "var(--theme-background-button-primary-default)", type: "bg" as const },
      { name: "button-primary-hover", cssVar: "var(--theme-background-button-primary-hover)", type: "bg" as const },
      { name: "button-secondary-default", cssVar: "var(--theme-background-button-secondary-default)", type: "bg" as const },
      { name: "button-secondary-hover", cssVar: "var(--theme-background-button-secondary-hover)", type: "bg" as const },
      { name: "button-destructive", cssVar: "var(--theme-background-button-destructive)", type: "bg" as const },
    ],
  },
  {
    name: "Interaction States",
    tokens: [
      { name: "stroke-hover", cssVar: "var(--theme-stroke-hover)", type: "bg" as const },
      { name: "stroke-focus", cssVar: "var(--theme-stroke-focus)", type: "bg" as const },
      { name: "input-hover", cssVar: "var(--theme-background-input-hover)", type: "bg" as const },
      { name: "card-hover", cssVar: "var(--theme-background-card-hover)", type: "bg" as const },
    ],
  },
] as const;
