/**
 * Constants for design system showcase sections (e.g. button matrix).
 */

/** Button showcase: size options for the matrix (id = Button size prop). */
export const BUTTON_SHOWCASE_SIZES = [
  { id: "2xs" as const, label: "2xs", px: 24 },
  { id: "sm" as const, label: "sm", px: 32 },
  { id: "md" as const, label: "md", px: 36 },
  { id: "lg" as const, label: "lg", px: 40 },
] as const;

/** Text button sizes for per-example previews (matches Button `size` prop; excludes icon-only sizes). */
/** `heightPx` matches Tailwind in `button.tsx` (`h-6` = 24px … `h-12` = 48px at default theme). */
export const BUTTON_DOC_TEXT_SIZES = [
  { id: "2xs" as const, label: "2XS", heightPx: 24 },
  { id: "sm" as const, label: "SM", heightPx: 32 },
  { id: "md" as const, label: "MD", heightPx: 36 },
  { id: "lg" as const, label: "LG", heightPx: 40 },
  { id: "xl" as const, label: "XL", heightPx: 48 },
] as const;

/** Variant rows for documentation “Examples” panels (shadcn-style one block per type). */
export const BUTTON_DOC_VARIANT_EXAMPLES = [
  {
    id: "default" as const,
    title: "Default",
    description: "Primary action; strongest emphasis. Use one per region when possible.",
  },
  {
    id: "secondary" as const,
    title: "Secondary",
    description: "Alternate emphasis when default is already used or context is lower priority.",
  },
  {
    id: "soft" as const,
    title: "Soft",
    description: "Tinted surface for supportive actions that should stay visible but quieter than primary.",
  },
  {
    id: "ghost" as const,
    title: "Ghost",
    description: "Minimal chrome for toolbars, tables, and dense layouts.",
  },
  {
    id: "muted" as const,
    title: "Muted",
    description: "Low-emphasis actions that read as tertiary until hovered.",
  },
  {
    id: "destructive" as const,
    title: "Destructive",
    description: "Irreversible or risky actions; pair with confirmation when impact is high.",
  },
] as const;

/** Button showcase: variants for matrix rows (id = Button variant prop). */
export const BUTTON_SHOWCASE_VARIANTS = [
  { id: "default" as const, label: "Primary" },
  { id: "secondary" as const, label: "Secondary" },
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
  soft: "!bg-primary/20 dark:!bg-primary/30",
  ghost: "!bg-muted !text-foreground",
  muted: "!bg-muted !text-foreground",
  destructive: "!bg-destructive !text-white !opacity-95",
};

/** Per-variant class that mimics active/press appearance (for Active column). */
export const BUTTON_ACTIVE_LOOK: Record<string, string> = {
  default: "!scale-[0.98] !bg-[var(--primary-hover)]",
  secondary:
    "!scale-[0.98] !border-[#CACACB] !bg-muted !text-foreground dark:!border-border dark:!bg-[color-mix(in_oklab,var(--foreground)_16%,var(--secondary))]",
  soft: "!scale-[0.98] !bg-primary/20 dark:!bg-primary/30",
  ghost: "!scale-[0.98] !bg-muted !text-foreground",
  muted: "!scale-[0.98] !bg-muted !text-foreground",
  destructive: "!scale-[0.98] !bg-destructive !text-white !opacity-95",
};
