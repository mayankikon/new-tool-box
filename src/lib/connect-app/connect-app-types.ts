import type { BrandThemePreset, FontPreset } from "@/lib/branding/brand-profile-types";

export type ConnectHeroMode = "image" | "video";

export type ConnectQuickActionIcon =
  | "calendar"
  | "phone"
  | "tag"
  | "map-pin"
  | "wrench"
  | "message";

export type ConnectQuickActionKind =
  | "schedule"
  | "call"
  | "coupons"
  | "directions"
  | "service"
  | "message";

export interface ConnectQuickAction {
  id: string;
  icon: ConnectQuickActionIcon;
  label: string;
  kind: ConnectQuickActionKind;
}

/** Drops scheduling CTAs and legacy “Book Service” rows (preview + editor use saved config). */
export function sanitizeConnectQuickActions(
  actions: ConnectQuickAction[],
): ConnectQuickAction[] {
  return actions.filter((a) => {
    if (a.kind === "schedule") return false;
    if (a.label.trim().toLowerCase() === "book service") return false;
    return true;
  });
}

export interface ConnectPromotionRef {
  id: string;
  couponId?: string;
  customTitle?: string;
  customImageUrl?: string;
  customDescription?: string;
}

export interface ConnectAppConfig {
  dealershipId: string;
  heroMode: ConnectHeroMode;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  welcomeHeadline: string;
  welcomeSubtext: string;
  /** Optional hero strip image (e.g. vehicle lineup); defaults to bundled asset in preview. */
  theseVehiclesImageUrl?: string;
  showDealerLogoOnHero: boolean;
  quickActions: ConnectQuickAction[];
  promotionsEnabled: boolean;
  promotionRefs: ConnectPromotionRef[];
  galleryEnabled: boolean;
  galleryMediaIds: string[];
  themeOverride?: {
    themePreset?: BrandThemePreset;
    customPrimaryHex?: string;
    customSecondaryHex?: string;
    fontPreset?: FontPreset;
  };
  activeTabIndex: number;
}

/** Legacy persisted JSON may include `carousel` hero mode or `carouselImageUrls`. */
export type ConnectAppConfigPersisted = Omit<ConnectAppConfig, "heroMode"> & {
  heroMode?: ConnectHeroMode | "carousel" | string;
  carouselImageUrls?: string[];
};

/** Strips legacy fields and maps old hero carousel → single cover image. */
export function normalizeConnectAppConfig(
  config: ConnectAppConfigPersisted,
): ConnectAppConfig {
  const legacyCarousel = config.carouselImageUrls ?? [];
  const rawMode = String(config.heroMode ?? "image");
  let heroMode: ConnectHeroMode = rawMode === "video" ? "video" : "image";
  let heroImageUrl = config.heroImageUrl;

  if (rawMode === "carousel") {
    heroMode = "image";
    if (!heroImageUrl?.trim() && legacyCarousel[0]) {
      heroImageUrl = legacyCarousel[0];
    }
  }

  const rest = { ...config };
  delete rest.carouselImageUrls;

  return {
    ...rest,
    heroMode,
    heroImageUrl,
  };
}

export function createDefaultConnectAppConfig(): ConnectAppConfig {
  return {
    dealershipId: "connect-default",
    heroMode: "image",
    welcomeHeadline: "Explore your dealership",
    welcomeSubtext: "Service, savings, and support — all in one place.",
    showDealerLogoOnHero: true,
    quickActions: [
      {
        id: "qa-2",
        icon: "phone",
        label: "Call us",
        kind: "call",
      },
      {
        id: "qa-3",
        icon: "tag",
        label: "Coupons",
        kind: "coupons",
      },
      {
        id: "qa-4",
        icon: "map-pin",
        label: "Directions",
        kind: "directions",
      },
    ],
    promotionsEnabled: true,
    promotionRefs: [],
    galleryEnabled: true,
    galleryMediaIds: [],
    themeOverride: {
      themePreset: "red",
    },
    activeTabIndex: 0,
  };
}
