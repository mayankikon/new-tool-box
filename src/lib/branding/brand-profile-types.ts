/**
 * Dealer Brand Profile — colors, typography, tone, and identity for campaigns,
 * coupons, storefront customization, and shell chrome.
 */

export type BrandThemePreset = "red" | "blue" | "violet" | "black" | "custom";

export type FontPreset =
  | "modern-sans"
  | "classic-serif"
  | "bold-impact"
  | "clean-geometric";

export type ToneProfile =
  | "professional"
  | "friendly"
  | "premium-luxury"
  | "sporty-energetic"
  | "community-family";

export interface ResolvedBrandPalette {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  surface: string;
  navBar: string;
  tabBar: string;
}

export interface DealerBrandProfile {
  id: string;
  dealershipName: string;

  /** Full horizontal logo URL */
  logoUrl: string;
  /** Square mark (optional), e.g. for nav */
  logomarkUrl?: string;
  /** Rounded app icon URL (optional) */
  appIconUrl?: string;

  themePreset: BrandThemePreset;
  customPrimaryHex?: string;
  customSecondaryHex?: string;

  fontPreset: FontPreset;
  toneProfile: ToneProfile;

  /** Coupon builder catalog vehicle (migrated from legacy dealership branding) */
  vehicleMake: string;
  vehicleModel: string;
  vehicleImageUrl: string;

  updatedAt: string;
}

/** Curated palettes: Red / Blue / Violet / Black */
export const BRAND_THEME_PALETTES: Record<
  Exclude<BrandThemePreset, "custom">,
  ResolvedBrandPalette
> = {
  red: {
    primary: "#B91C1C",
    primaryForeground: "#FFFFFF",
    secondary: "#1F2937",
    secondaryForeground: "#F9FAFB",
    accent: "#FEE2E2",
    surface: "#FEF2F2",
    navBar: "#991B1B",
    tabBar: "#111827",
  },
  blue: {
    primary: "#1E3A8A",
    primaryForeground: "#FFFFFF",
    secondary: "#3B82F6",
    secondaryForeground: "#FFFFFF",
    accent: "#DBEAFE",
    surface: "#EFF6FF",
    navBar: "#1E40AF",
    tabBar: "#0F172A",
  },
  violet: {
    primary: "#2E259C",
    primaryForeground: "#FFFFFF",
    secondary: "#7C6FD6",
    secondaryForeground: "#1E1B4B",
    accent: "#E8E6FA",
    surface: "#F4F3FC",
    navBar: "#252080",
    tabBar: "#1E1B4B",
  },
  /** Monochrome: gray chrome + ink primary; avoids all-black nav/tab like other presets. */
  black: {
    primary: "#0A0A0A",
    primaryForeground: "#FFFFFF",
    secondary: "#525252",
    secondaryForeground: "#FAFAFA",
    accent: "#E4E4E7",
    surface: "#F4F4F5",
    navBar: "#52525B",
    tabBar: "#3F3F46",
  },
};

export const DEFAULT_DEALERSHIP_LOGO_SRC = "/account-logo-placeholder.png";

export const FONT_PRESET_LABELS: Record<FontPreset, string> = {
  "modern-sans": "Modern Sans",
  "classic-serif": "Classic Serif",
  "bold-impact": "Bold Impact",
  "clean-geometric": "Clean Geometric",
};

export const TONE_PROFILE_LABELS: Record<ToneProfile, string> = {
  professional: "Professional",
  friendly: "Friendly",
  "premium-luxury": "Premium / Luxury",
  "sporty-energetic": "Sporty / Energetic",
  "community-family": "Community / Family",
};

export const TONE_PROFILE_EXAMPLES: Record<ToneProfile, string> = {
  professional: "Schedule your next service appointment.",
  friendly: "Hey! Time for a quick check-up — we’ve got you covered.",
  "premium-luxury": "Experience white-glove service tailored to your vehicle.",
  "sporty-energetic": "Performance tune-up — book before the season kicks off.",
  "community-family": "Your neighborhood shop — trusted by families for years.",
};
