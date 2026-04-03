import type {
  CouponAccentPreset,
  CouponCornerStyle,
  CouponTemplateId,
  OfferType,
} from "./types";

/** Title Case each word (kebab / snake / space separated). */
export function toTitleCaseLabel(raw: string): string {
  return raw
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  "fixed-discount": "Fixed Discount",
  "percentage-discount": "Percentage Discount",
  "service-bundle": "Service Bundle",
  "free-add-on": "Free Add-On",
  "seasonal-promotion": "Seasonal Promotion",
  custom: "Custom",
};

export function offerTypeTitle(type: OfferType): string {
  return OFFER_TYPE_LABELS[type] ?? toTitleCaseLabel(type);
}

const ACCENT_LABELS: Record<CouponAccentPreset, string> = {
  blue: "Blue",
  emerald: "Emerald",
  amber: "Amber",
  rose: "Rose",
  slate: "Slate",
  violet: "Violet",
  "brand-primary": "Brand primary",
  "brand-secondary": "Brand secondary",
};

export function accentPresetTitle(preset: CouponAccentPreset): string {
  return ACCENT_LABELS[preset] ?? toTitleCaseLabel(preset);
}

const CORNER_LABELS: Record<CouponCornerStyle, string> = {
  rounded: "Rounded",
  sharp: "Sharp",
  pill: "Pill",
};

export function cornerStyleTitle(style: CouponCornerStyle): string {
  return CORNER_LABELS[style] ?? toTitleCaseLabel(style);
}

const TEMPLATE_LABELS: Record<CouponTemplateId, string> = {
  "hero-banner": "Hero Banner",
  "ticket-stub": "Ticket Stub",
  "minimal-card": "Minimal Card",
  "split-band": "Split Band",
  "badge-ribbon": "Badge Ribbon",
  "dark-accent": "Dark Accent",
};

export function couponTemplateTitle(id: CouponTemplateId): string {
  return TEMPLATE_LABELS[id] ?? toTitleCaseLabel(id);
}
