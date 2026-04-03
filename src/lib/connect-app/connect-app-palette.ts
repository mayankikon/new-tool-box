import { resolveBrandPalette } from "@/lib/branding/brand-profile-storage";
import type {
  BrandThemePreset,
  DealerBrandProfile,
} from "@/lib/branding/brand-profile-types";
import type { ConnectAppConfig } from "./connect-app-types";

/** Effective theme preset for Connect preview (matches `resolveConnectPalette` merge rules). */
export function resolveConnectThemePreset(
  config: ConnectAppConfig,
  profile: DealerBrandProfile,
): BrandThemePreset {
  const o = config.themeOverride;
  if (!o) {
    return profile.themePreset;
  }
  return o.themePreset ?? profile.themePreset;
}

export function resolveConnectPalette(
  config: ConnectAppConfig,
  profile: DealerBrandProfile,
) {
  const o = config.themeOverride;
  if (!o) {
    return resolveBrandPalette(profile);
  }
  const merged: DealerBrandProfile = {
    ...profile,
    themePreset: o.themePreset ?? profile.themePreset,
    customPrimaryHex: o.customPrimaryHex ?? profile.customPrimaryHex,
    customSecondaryHex: o.customSecondaryHex ?? profile.customSecondaryHex,
    fontPreset: o.fontPreset ?? profile.fontPreset,
  };
  return resolveBrandPalette(merged);
}

export function resolveConnectFontPreset(
  config: ConnectAppConfig,
  profile: DealerBrandProfile,
) {
  return config.themeOverride?.fontPreset ?? profile.fontPreset;
}
