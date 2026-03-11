/**
 * Foundation design tokens sourced from globals.css.
 * Used by the design system showcase to display token names and swatches.
 */

export const colorTokenGroups = [
  {
    name: "Base",
    tokens: [
      { name: "background", cssVar: "--background", tailwindClass: "bg-background" },
      { name: "foreground", cssVar: "--foreground", tailwindClass: "bg-foreground" },
    ],
  },
  {
    name: "Card",
    tokens: [
      { name: "card", cssVar: "--card", tailwindClass: "bg-card" },
      { name: "card-foreground", cssVar: "--card-foreground", tailwindClass: "bg-card-foreground" },
    ],
  },
  {
    name: "Popover",
    tokens: [
      { name: "popover", cssVar: "--popover", tailwindClass: "bg-popover" },
      { name: "popover-foreground", cssVar: "--popover-foreground", tailwindClass: "bg-popover-foreground" },
    ],
  },
  {
    name: "Primary",
    tokens: [
      { name: "primary", cssVar: "--primary", tailwindClass: "bg-primary" },
      { name: "primary-foreground", cssVar: "--primary-foreground", tailwindClass: "bg-primary-foreground" },
    ],
  },
  {
    name: "Secondary",
    tokens: [
      { name: "secondary", cssVar: "--secondary", tailwindClass: "bg-secondary" },
      { name: "secondary-foreground", cssVar: "--secondary-foreground", tailwindClass: "bg-secondary-foreground" },
    ],
  },
  {
    name: "Muted",
    tokens: [
      { name: "muted", cssVar: "--muted", tailwindClass: "bg-muted" },
      { name: "muted-foreground", cssVar: "--muted-foreground", tailwindClass: "bg-muted-foreground" },
    ],
  },
  {
    name: "Accent",
    tokens: [
      { name: "accent", cssVar: "--accent", tailwindClass: "bg-accent" },
      { name: "accent-foreground", cssVar: "--accent-foreground", tailwindClass: "bg-accent-foreground" },
    ],
  },
  {
    name: "Destructive",
    tokens: [{ name: "destructive", cssVar: "--destructive", tailwindClass: "bg-destructive" }],
  },
  {
    name: "Border & Input",
    tokens: [
      { name: "border", cssVar: "--border", tailwindClass: "bg-border" },
      { name: "input", cssVar: "--input", tailwindClass: "bg-input" },
      { name: "ring", cssVar: "--ring", tailwindClass: "bg-ring" },
    ],
  },
  {
    name: "Charts",
    tokens: [
      { name: "chart-1", cssVar: "--chart-1", tailwindClass: "bg-chart-1" },
      { name: "chart-2", cssVar: "--chart-2", tailwindClass: "bg-chart-2" },
      { name: "chart-3", cssVar: "--chart-3", tailwindClass: "bg-chart-3" },
      { name: "chart-4", cssVar: "--chart-4", tailwindClass: "bg-chart-4" },
      { name: "chart-5", cssVar: "--chart-5", tailwindClass: "bg-chart-5" },
    ],
  },
  {
    name: "Sidebar",
    tokens: [
      { name: "sidebar", cssVar: "--sidebar", tailwindClass: "bg-sidebar" },
      { name: "sidebar-foreground", cssVar: "--sidebar-foreground", tailwindClass: "bg-sidebar-foreground" },
      { name: "sidebar-primary", cssVar: "--sidebar-primary", tailwindClass: "bg-sidebar-primary" },
      { name: "sidebar-primary-foreground", cssVar: "--sidebar-primary-foreground", tailwindClass: "bg-sidebar-primary-foreground" },
      { name: "sidebar-accent", cssVar: "--sidebar-accent", tailwindClass: "bg-sidebar-accent" },
      { name: "sidebar-accent-foreground", cssVar: "--sidebar-accent-foreground", tailwindClass: "bg-sidebar-accent-foreground" },
      { name: "sidebar-border", cssVar: "--sidebar-border", tailwindClass: "bg-sidebar-border" },
      { name: "sidebar-ring", cssVar: "--sidebar-ring", tailwindClass: "bg-sidebar-ring" },
    ],
  },
] as const;

export const radiusTokens = [
  { name: "none", cssVar: "--radius-none", tailwindClass: "rounded-[var(--radius-none)]" },
  { name: "2xs", cssVar: "--radius-2xs", tailwindClass: "rounded-[var(--radius-2xs)]" },
  { name: "xs", cssVar: "--radius-xs", tailwindClass: "rounded-[var(--radius-xs)]" },
  { name: "sm", cssVar: "--radius-sm", tailwindClass: "rounded-[var(--radius-sm)]" },
  { name: "md", cssVar: "--radius-md", tailwindClass: "rounded-[var(--radius-md)]" },
  { name: "lg", cssVar: "--radius-lg", tailwindClass: "rounded-[var(--radius-lg)]" },
  { name: "xl", cssVar: "--radius-xl", tailwindClass: "rounded-[var(--radius-xl)]" },
  { name: "2xl", cssVar: "--radius-2xl", tailwindClass: "rounded-[var(--radius-2xl)]" },
  { name: "3xl", cssVar: "--radius-3xl", tailwindClass: "rounded-[var(--radius-3xl)]" },
  { name: "full", cssVar: "--radius-full", tailwindClass: "rounded-[var(--radius-full)]" },
  { name: "Card-sm", cssVar: "--radius-Card-sm", tailwindClass: "rounded-[var(--radius-Card-sm)]" },
  { name: "Card-md", cssVar: "--radius-Card-md", tailwindClass: "rounded-[var(--radius-Card-md)]" },
  { name: "Card-lg", cssVar: "--radius-Card-lg", tailwindClass: "rounded-[var(--radius-Card-lg)]" },
] as const;

/** Spacing scale from Spacing.json (layout-primitives.css) */
export const spacingTokens = [
  "0", "1", "2", "4", "6", "8", "10", "12", "14", "16", "20", "24", "28", "32", "36", "40", "44", "48", "96",
] as const;

/** Stroke (border width) from Stroke.json */
export const strokeTokens = [
  { name: "sm", cssVar: "--stroke-sm", value: "0.5px" },
  { name: "default", cssVar: "--stroke-default", value: "1px" },
  { name: "lg", cssVar: "--stroke-lg", value: "2px" },
  { name: "xl", cssVar: "--stroke-xl", value: "3px" },
] as const;

/** Typography: font families from Font Family.json */
export const fontFamilyTokens = [
  { name: "headline", cssVar: "--font-headline", className: "font-headline" },
  { name: "body", cssVar: "--font-body", className: "font-sans" },
  { name: "code", cssVar: "--font-code", className: "font-mono" },
] as const;

/** Font sizes from Font Size.json */
export const fontSizeTokens = [
  "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl",
] as const;

/** Font weights */
export const fontWeightTokens = [
  "normal", "medium", "semibold", "bold",
] as const;

/** Line heights */
export const lineHeightTokens = [
  "5", "6", "7",
] as const;

/** Letter spacing */
export const letterSpacingTokens = [
  "tighter", "tight", "normal", "wide", "wider", "widest",
] as const;

/** Theme tokens (Themes.json) for design system showcase - background swatches use var, text use color */
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
