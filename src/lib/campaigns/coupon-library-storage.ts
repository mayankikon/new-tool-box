import type { CampaignOffer } from "./types";

const STORAGE_KEY = "sm-coupon-library-v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function isCampaignOffer(value: unknown): value is CampaignOffer {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.title === "string" &&
    o.visual != null &&
    typeof o.visual === "object" &&
    o.rules != null &&
    typeof o.rules === "object"
  );
}

/** Coupons saved from Coupon (standalone or synced). */
export function loadCouponLibrary(): CampaignOffer[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCampaignOffer);
  } catch {
    return [];
  }
}

export function saveCouponLibrary(offers: CampaignOffer[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
  } catch {
    /* quota or private mode */
  }
}

export function upsertCouponInLibrary(offer: CampaignOffer): CampaignOffer[] {
  const current = loadCouponLibrary();
  const idx = current.findIndex((o) => o.id === offer.id);
  const next =
    idx >= 0
      ? current.map((o, i) => (i === idx ? offer : o))
      : [...current, offer];
  saveCouponLibrary(next);
  return next;
}

export function removeCouponFromLibrary(offerId: string): CampaignOffer[] {
  const next = loadCouponLibrary().filter((o) => o.id !== offerId);
  saveCouponLibrary(next);
  return next;
}

/**
 * Prepend saved library coupons that are not already in the wizard offer list
 * (e.g. template or Atlas defaults). Keeps a single source of truth for “my designs”.
 */
export function mergeUserCouponsWithOffers(
  wizardOffers: CampaignOffer[],
): CampaignOffer[] {
  const saved = loadCouponLibrary();
  if (saved.length === 0) return wizardOffers;
  const wizardIds = new Set(wizardOffers.map((o) => o.id));
  const prepend = saved.filter((s) => !wizardIds.has(s.id));
  if (prepend.length === 0) return wizardOffers;
  return [...prepend, ...wizardOffers];
}
