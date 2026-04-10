import { pickRandomVehicleFromCatalog } from "@/lib/campaigns/vehicle-catalog-sample";
import { VEHICLE_MODELS_BY_MAKE } from "@/lib/campaigns/vehicle-data";
import {
  BRAND_THEME_PALETTES,
  DEFAULT_DEALERSHIP_LOGO_SRC,
  type BrandThemePreset,
  type DealerBrandProfile,
  type ResolvedBrandPalette,
} from "./brand-profile-types";

const STORAGE_KEY = "sm-brand-profile-v1";
const LEGACY_STORAGE_KEY = "sm-dealership-branding-v1";

export const BRAND_PROFILE_CHANGED_EVENT = "sm-brand-profile-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function nowIso(): string {
  return new Date().toISOString();
}

function createId(): string {
  return `brand-${Math.random().toString(36).slice(2, 12)}`;
}

function defaultVehicleFromCatalog() {
  return pickRandomVehicleFromCatalog();
}

export function resolveBrandPalette(profile: DealerBrandProfile): ResolvedBrandPalette {
  if (profile.themePreset === "custom") {
    const primary = profile.customPrimaryHex?.trim() || BRAND_THEME_PALETTES.blue.primary;
    const secondary =
      profile.customSecondaryHex?.trim() || BRAND_THEME_PALETTES.blue.secondary;
    return {
      primary,
      primaryForeground: "#FFFFFF",
      secondary,
      secondaryForeground: "#FFFFFF",
      accent: mixWithWhite(primary, 0.85),
      surface: mixWithWhite(primary, 0.92),
      navBar: darkenHex(primary, 0.12),
      tabBar: "#0F172A",
    };
  }
  return BRAND_THEME_PALETTES[profile.themePreset];
}

function mixWithWhite(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const t = Math.min(1, Math.max(0, amount));
  return rgbToHex(
    Math.round(r + (255 - r) * t),
    Math.round(g + (255 - g) * t),
    Math.round(b + (255 - b) * t),
  );
}

function darkenHex(hex: string, amount: number): string {
  const { r, g, b } = parseHex(hex);
  const f = 1 - Math.min(0.4, Math.max(0, amount));
  return rgbToHex(
    Math.round(r * f),
    Math.round(g * f),
    Math.round(b * f),
  );
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  if (full.length !== 6) {
    return { r: 30, g: 58, b: 138 };
  }
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

interface LegacyDealershipBranding {
  dealershipLogoUrl: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleImageUrl: string;
}

function readLegacyBranding(): LegacyDealershipBranding | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LegacyDealershipBranding>;
    if (
      typeof parsed.dealershipLogoUrl === "string" &&
      typeof parsed.vehicleMake === "string" &&
      typeof parsed.vehicleModel === "string" &&
      typeof parsed.vehicleImageUrl === "string"
    ) {
      return parsed as LegacyDealershipBranding;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function staticServerProfile(): DealerBrandProfile {
  const toyota =
    VEHICLE_MODELS_BY_MAKE.Toyota?.find((m) => m.imageUrl?.trim()) ??
    VEHICLE_MODELS_BY_MAKE.BMW?.find((m) => m.imageUrl?.trim());
  return {
    id: "default",
    dealershipName: "Your Dealership",
    logoUrl: DEFAULT_DEALERSHIP_LOGO_SRC,
    logomarkUrl: undefined,
    appIconUrl: undefined,
    themePreset: "blue",
    fontPreset: "modern-sans",
    toneProfile: "professional",
    vehicleMake: "Toyota",
    vehicleModel: toyota?.model ?? "RAV4",
    vehicleImageUrl: toyota?.imageUrl ?? "",
    updatedAt: nowIso(),
  };
}

function withDefaults(partial: Partial<DealerBrandProfile>): DealerBrandProfile {
  const v = defaultVehicleFromCatalog();
  return {
    id: partial.id ?? createId(),
    dealershipName: partial.dealershipName ?? "Your Dealership",
    logoUrl: partial.logoUrl ?? DEFAULT_DEALERSHIP_LOGO_SRC,
    logomarkUrl: partial.logomarkUrl,
    appIconUrl: partial.appIconUrl,
    themePreset: (partial.themePreset ?? "blue") as BrandThemePreset,
    customPrimaryHex: partial.customPrimaryHex,
    customSecondaryHex: partial.customSecondaryHex,
    fontPreset: partial.fontPreset ?? "modern-sans",
    toneProfile: partial.toneProfile ?? "professional",
    vehicleMake: partial.vehicleMake ?? v.make,
    vehicleModel: partial.vehicleModel ?? v.model,
    vehicleImageUrl: partial.vehicleImageUrl ?? v.imageUrl,
    updatedAt: partial.updatedAt ?? nowIso(),
  };
}

export function loadBrandProfile(): DealerBrandProfile {
  if (!isBrowser()) {
    return staticServerProfile();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DealerBrandProfile>;
      if (typeof parsed.logoUrl === "string" && typeof parsed.dealershipName === "string") {
        return withDefaults(parsed);
      }
    }

    const legacy = readLegacyBranding();
    if (legacy) {
      const merged = withDefaults({
        logoUrl: legacy.dealershipLogoUrl,
        vehicleMake: legacy.vehicleMake,
        vehicleModel: legacy.vehicleModel,
        vehicleImageUrl: legacy.vehicleImageUrl,
      });
      saveBrandProfile(merged);
      return merged;
    }

    const initial = withDefaults({});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  } catch {
    /* ignore */
  }
  const initial = withDefaults({});
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch {
    /* ignore */
  }
  return initial;
}

export function saveBrandProfile(next: DealerBrandProfile): void {
  if (!isBrowser()) return;
  try {
    const toSave: DealerBrandProfile = {
      ...next,
      updatedAt: nowIso(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    window.dispatchEvent(new Event(BRAND_PROFILE_CHANGED_EVENT));
    /** @deprecated Coupon module listeners; remove when all use brand profile */
    window.dispatchEvent(new Event("sm-dealership-branding-changed"));
  } catch {
    /* ignore */
  }
}

export function updateBrandProfile(
  patch: Partial<DealerBrandProfile>,
): DealerBrandProfile {
  const current = loadBrandProfile();
  const merged = withDefaults({ ...current, ...patch, id: current.id });
  saveBrandProfile(merged);
  return merged;
}

export function resetBrandProfileToDefaults(): DealerBrandProfile {
  const next = withDefaults({ id: loadBrandProfile().id });
  saveBrandProfile(next);
  return next;
}
