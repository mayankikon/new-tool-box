import type { ResolvedBrandPalette } from "@/lib/branding/brand-profile-types";
import type { CouponAccentPreset } from "@/lib/campaigns/types";
import { COUPON_ACCENT_CLASSES } from "@/lib/campaigns/coupon-templates";

export type CouponAccentDisplay =
  | {
      kind: "tailwind";
      tw: (typeof COUPON_ACCENT_CLASSES)[CouponAccentPreset];
    }
  | {
      kind: "inline";
      /** Main accent fill (bands, buttons) */
      primary: string;
      /** Secondary accent (borders, alternate) */
      secondary: string;
      /** Soft wash background */
      soft: string;
    };

export function resolveCouponAccentDisplay(
  preset: CouponAccentPreset,
  palette: ResolvedBrandPalette | undefined | null,
): CouponAccentDisplay {
  if (preset === "brand-primary" && palette) {
    return {
      kind: "inline",
      primary: palette.primary,
      secondary: palette.secondary,
      soft: palette.accent,
    };
  }
  if (preset === "brand-secondary" && palette) {
    return {
      kind: "inline",
      primary: palette.secondary,
      secondary: palette.primary,
      soft: palette.accent,
    };
  }
  return { kind: "tailwind", tw: COUPON_ACCENT_CLASSES[preset] };
}
