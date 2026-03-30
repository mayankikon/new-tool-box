/**
 * Constants for design system showcase sections (e.g. button matrix).
 */

/** Button showcase: size options for the matrix (id = Button size prop). */
export const BUTTON_SHOWCASE_SIZES = [
  { id: "2xs" as const, label: "2xs", px: 24 },
  { id: "xs" as const, label: "xs", px: 28 },
  { id: "sm" as const, label: "sm", px: 32 },
  { id: "md" as const, label: "md", px: 36 },
  { id: "lg" as const, label: "lg", px: 40 },
] as const;

/** Button showcase: variants for matrix rows (id = Button variant prop). */
export const BUTTON_SHOWCASE_VARIANTS = [
  { id: "default" as const, label: "Primary" },
  { id: "secondary" as const, label: "Secondary" },
  { id: "dashed" as const, label: "Dashed" },
  { id: "soft" as const, label: "Soft" },
  { id: "ghost" as const, label: "Ghost" },
  { id: "muted" as const, label: "Muted" },
  { id: "destructive" as const, label: "Destructive" },
] as const;

/** Button showcase: states for matrix columns; class to simulate that state. */
export const BUTTON_SHOWCASE_STATES = [
  { id: "default", label: "DEFAULT", forceClassName: undefined },
  { id: "hover", label: "HOVER", forceClassName: "button-showcase-hover" },
  { id: "focus", label: "FOCUS", forceClassName: "ring-2 ring-ring ring-offset-2 ring-offset-background" },
  { id: "active", label: "ACTIVE", forceClassName: "button-showcase-active" },
  { id: "disabled", label: "DISABLED", forceClassName: undefined },
  { id: "loading", label: "LOADING", forceClassName: undefined },
] as const;

/** Per-variant class that mimics hover appearance (for Hover column). */
export const BUTTON_HOVER_LOOK: Record<string, string> = {
  default: "!bg-[var(--primary-hover)]",
  secondary:
    "!border-[#CACACB] !bg-muted !text-foreground dark:!border-border dark:!bg-[color-mix(in_oklab,var(--foreground)_11%,var(--secondary))]",
  dashed: "!bg-muted !text-foreground",
  soft: "!bg-primary/20 dark:!bg-primary/30",
  ghost: "!bg-muted !text-foreground",
  muted: "!bg-muted !text-foreground",
  destructive: "!bg-destructive/20 dark:!bg-destructive/30",
};

/** Per-variant class that mimics active/press appearance (for Active column). */
export const BUTTON_ACTIVE_LOOK: Record<string, string> = {
  default: "!scale-[0.98] !bg-[var(--primary-hover)]",
  secondary:
    "!scale-[0.98] !border-[#CACACB] !bg-muted !text-foreground dark:!border-border dark:!bg-[color-mix(in_oklab,var(--foreground)_16%,var(--secondary))]",
  dashed: "!scale-[0.98] !bg-muted !text-foreground",
  soft: "!scale-[0.98] !bg-primary/20 dark:!bg-primary/30",
  ghost: "!scale-[0.98] !bg-muted !text-foreground",
  muted: "!scale-[0.98] !bg-muted !text-foreground",
  destructive: "!scale-[0.98] !bg-destructive/20 dark:!bg-destructive/30",
};
