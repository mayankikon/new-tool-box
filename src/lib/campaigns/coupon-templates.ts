import type {
  CampaignOffer,
  CouponAccentPreset,
  CouponBadgeKind,
  CouponConditionRule,
  CouponRules,
  CouponTemplateId,
  CouponVisualSpec,
  OfferType,
} from "./types";

export interface CouponTemplatePreset {
  id: CouponTemplateId;
  label: string;
  description: string;
  suggestedBadges: CouponBadgeKind[];
  defaultHeadline: string;
  defaultSubheadline: string;
  defaultCta: string;
}

export const COUPON_TEMPLATE_PRESETS: CouponTemplatePreset[] = [
  {
    id: "hero-banner",
    label: "Hero Banner",
    description: "Bold top band with large savings callout.",
    suggestedBadges: ["oil", "general", "battery"],
    defaultHeadline: "Your exclusive service savings",
    defaultSubheadline: "Book before the offer ends — we’ll take care of the rest.",
    defaultCta: "Book now",
  },
  {
    id: "ticket-stub",
    label: "Ticket Stub",
    description: "Perforated-ticket feel, great for limited-time promos.",
    suggestedBadges: ["brake", "tire", "general"],
    defaultHeadline: "Admit one: service savings",
    defaultSubheadline: "Present this offer at check-in. One use per visit.",
    defaultCta: "Redeem offer",
  },
  {
    id: "minimal-card",
    label: "Minimal Card",
    description: "Clean typography, high trust for email and app.",
    suggestedBadges: ["general", "oil", "battery"],
    defaultHeadline: "Service offer for you",
    defaultSubheadline: "Personalized for your vehicle and service history.",
    defaultCta: "Schedule service",
  },
  {
    id: "split-band",
    label: "Split Band",
    description: "Two-tone layout with strong contrast.",
    suggestedBadges: ["battery", "brake", "tire"],
    defaultHeadline: "Split the bill — we’ll cover part of it",
    defaultSubheadline: "Valid on qualifying services this month.",
    defaultCta: "Claim discount",
  },
  {
    id: "badge-ribbon",
    label: "Badge Ribbon",
    description: "Corner ribbon and badge for seasonal campaigns.",
    suggestedBadges: ["oil", "tire", "general"],
    defaultHeadline: "Seasonal service special",
    defaultSubheadline: "Stack with advisor-approved bundles where allowed.",
    defaultCta: "Get my offer",
  },
  {
    id: "dark-accent",
    label: "Dark Accent",
    description: "Bold accent stripe on a white card — reads like a printed offer.",
    suggestedBadges: ["battery", "brake", "general"],
    defaultHeadline: "VIP service window",
    defaultSubheadline: "Reserved capacity for the next few days only.",
    defaultCta: "Reserve my spot",
  },
];

export const COUPON_BADGE_LABELS: Record<CouponBadgeKind, string> = {
  oil: "Oil",
  brake: "Brake",
  battery: "Battery",
  tire: "Tire",
  general: "Service",
  custom: "Custom",
};

const MS_PER_DAY = 86_400_000;

export function createDefaultCouponRules(
  expirationDays: number,
): CouponRules {
  return {
    expirationMode: "relative",
    expirationDays,
    conditions: [],
  };
}

export function createCouponVisualFromPreset(
  templateId: CouponTemplateId,
  overrides: Partial<CouponVisualSpec> = {},
): CouponVisualSpec {
  const preset = COUPON_TEMPLATE_PRESETS.find((p) => p.id === templateId);
  const badge = preset?.suggestedBadges[0] ?? "general";
  return {
    templateId,
    headline: overrides.headline ?? preset?.defaultHeadline ?? "Service offer",
    subheadline:
      overrides.subheadline ??
      preset?.defaultSubheadline ??
      "Book your visit today.",
    ctaLabel: overrides.ctaLabel ?? preset?.defaultCta ?? "Book now",
    badge: overrides.badge ?? badge,
    customBadgeLabel: overrides.customBadgeLabel,
    accentPreset: overrides.accentPreset ?? "blue",
    cornerStyle: overrides.cornerStyle ?? "rounded",
    logoUrl: overrides.logoUrl,
    vehicleImageUrl: overrides.vehicleImageUrl,
    vehicleCaption: overrides.vehicleCaption,
    showLogoOnCoupon: overrides.showLogoOnCoupon ?? true,
    showVehicleOnCoupon: overrides.showVehicleOnCoupon ?? true,
    urgencyLine: overrides.urgencyLine,
    showUrgencyLine: overrides.showUrgencyLine ?? false,
  };
}

export function deriveValueLabelFromEconomics(offer: Pick<CampaignOffer, "type" | "valueLabel" | "discountPercent" | "discountCents">): string {
  if (offer.type === "percentage-discount" && offer.discountPercent != null) {
    return `${offer.discountPercent}% off`;
  }
  if (offer.type === "fixed-discount" && offer.discountCents != null) {
    const dollars = offer.discountCents / 100;
    return `$${dollars % 1 === 0 ? dollars.toFixed(0) : dollars.toFixed(2)} off`;
  }
  return offer.valueLabel;
}

/** Keep top-level expirationDays aligned with rules for workflow and legacy UI. */
export function syncOfferExpirationFromRules(offer: CampaignOffer): CampaignOffer {
  const { rules } = offer;
  if (rules.expirationMode === "relative") {
    return {
      ...offer,
      expirationDays: rules.expirationDays,
    };
  }
  if (rules.expiresAt) {
    const end = new Date(rules.expiresAt).getTime();
    const now = Date.now();
    const days = Math.max(1, Math.ceil((end - now) / MS_PER_DAY));
    return { ...offer, expirationDays: days };
  }
  return offer;
}

export function formatCouponExpirationSummary(offer: CampaignOffer): string {
  if (offer.rules.expirationMode === "fixed" && offer.rules.expiresAt) {
    try {
      return `Expires ${new Date(offer.rules.expiresAt).toLocaleDateString(undefined, { dateStyle: "medium" })}`;
    } catch {
      return "Fixed expiration";
    }
  }
  return `Expires in ${offer.rules.expirationDays} days`;
}

export function createNewCampaignOfferId(): string {
  return `offer-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now().toString(36)}`;
}

/** Blank slate for the coupon editor (create flow). */
export function createDraftCampaignOffer(): CampaignOffer {
  return buildCampaignOfferFromBuilderInput({
    type: "fixed-discount",
    title: "New service coupon",
    description: "Designed in Coupon.",
    codeStrategy: "unique-per-customer",
    redemptionGoal: "booked-appointment",
    eligibleServices: ["General service"],
    channelSafeCopy: "Save on your next visit — book today.",
    legalComplianceNote: "Terms apply. See dealer for details.",
    discountCents: 2500,
    visual: createCouponVisualFromPreset("minimal-card", {
      headline: "Save on your next visit",
      subheadline: "Book service this week and present this offer at check-in.",
      ctaLabel: "Book now",
    }),
    rules: createDefaultCouponRules(14),
    isRecommended: false,
    isApproved: false,
  });
}

export function buildCampaignOfferFromBuilderInput(params: {
  id?: string;
  type: OfferType;
  title: string;
  description: string;
  codeStrategy: CampaignOffer["codeStrategy"];
  redemptionGoal: CampaignOffer["redemptionGoal"];
  eligibleServices: string[];
  channelSafeCopy: string;
  legalComplianceNote: string;
  discountPercent?: number;
  discountCents?: number;
  /** When set, used instead of deriving from discount fields */
  valueLabelOverride?: string;
  visual: CouponVisualSpec;
  rules: CouponRules;
  recommendedChannels?: CampaignOffer["recommendedChannels"];
  isRecommended?: boolean;
  isApproved?: boolean;
}): CampaignOffer {
  const derived = deriveValueLabelFromEconomics({
    type: params.type,
    valueLabel: params.valueLabelOverride ?? "",
    discountPercent: params.discountPercent,
    discountCents: params.discountCents,
  });
  const valueLabel =
    params.valueLabelOverride?.trim() ||
    derived ||
    "Offer";
  const base: CampaignOffer = {
    id: params.id ?? createNewCampaignOfferId(),
    type: params.type,
    title: params.title,
    description: params.description,
    valueLabel,
    discountPercent: params.discountPercent,
    discountCents: params.discountCents,
    codeStrategy: params.codeStrategy,
    expirationDays: params.rules.expirationDays,
    redemptionGoal: params.redemptionGoal,
    eligibleServices: params.eligibleServices,
    channelSafeCopy: params.channelSafeCopy,
    legalComplianceNote: params.legalComplianceNote,
    recommendedChannels: params.recommendedChannels,
    isRecommended: params.isRecommended,
    isApproved: params.isApproved,
    visual: params.visual,
    rules: params.rules,
  };
  return syncOfferExpirationFromRules(base);
}

/** Merge Atlas or partial drafts with safe defaults. */
export function mergePartialCampaignOffer(
  partial: Partial<CampaignOffer> & Pick<CampaignOffer, "id">,
): CampaignOffer {
  const templateId = partial.visual?.templateId ?? "minimal-card";
  const expirationDays = partial.expirationDays ?? partial.rules?.expirationDays ?? 14;
  const rules: CouponRules = {
    expirationMode: partial.rules?.expirationMode ?? "relative",
    expirationDays,
    expiresAt: partial.rules?.expiresAt,
    maxRedemptionsTotal: partial.rules?.maxRedemptionsTotal,
    maxRedemptionsPerCustomer: partial.rules?.maxRedemptionsPerCustomer,
    maxRedemptionsPerDay: partial.rules?.maxRedemptionsPerDay,
    conditions: partial.rules?.conditions ?? [],
  };
  const visual = createCouponVisualFromPreset(templateId, partial.visual ?? {});
  const type = partial.type ?? "fixed-discount";
  const discountCents = partial.discountCents;
  const discountPercent = partial.discountPercent;
  return buildCampaignOfferFromBuilderInput({
    id: partial.id,
    type,
    title: partial.title ?? "Suggested offer",
    description: partial.description ?? "",
    codeStrategy: partial.codeStrategy ?? "unique-per-customer",
    redemptionGoal: partial.redemptionGoal ?? "booked-appointment",
    eligibleServices: partial.eligibleServices ?? [],
    channelSafeCopy: partial.channelSafeCopy ?? partial.visual?.headline ?? "Special offer inside.",
    legalComplianceNote:
      partial.legalComplianceNote ??
      "Subject to dealer participation and program terms.",
    discountPercent,
    discountCents,
    valueLabelOverride: partial.valueLabel,
    visual: { ...visual, ...partial.visual },
    rules,
    recommendedChannels: partial.recommendedChannels,
    isRecommended: partial.isRecommended,
    isApproved: partial.isApproved,
  });
}

export const COUPON_ACCENT_CLASSES: Record<
  CouponAccentPreset,
  { bg: string; text: string; border: string; soft: string }
> = {
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-600",
    border: "border-blue-500/40",
    soft: "bg-blue-500/10",
  },
  emerald: {
    bg: "bg-emerald-600",
    text: "text-emerald-600",
    border: "border-emerald-500/40",
    soft: "bg-emerald-500/10",
  },
  amber: {
    bg: "bg-amber-500",
    text: "text-amber-600",
    border: "border-amber-500/40",
    soft: "bg-amber-500/10",
  },
  rose: {
    bg: "bg-rose-600",
    text: "text-rose-600",
    border: "border-rose-500/40",
    soft: "bg-rose-500/10",
  },
  slate: {
    bg: "bg-slate-700",
    text: "text-slate-600",
    border: "border-slate-500/40",
    soft: "bg-slate-500/10",
  },
  violet: {
    bg: "bg-violet-600",
    text: "text-violet-600",
    border: "border-violet-500/40",
    soft: "bg-violet-500/10",
  },
  "brand-primary": {
    bg: "bg-blue-600",
    text: "text-blue-600",
    border: "border-blue-500/40",
    soft: "bg-blue-500/10",
  },
  "brand-secondary": {
    bg: "bg-slate-600",
    text: "text-slate-600",
    border: "border-slate-500/40",
    soft: "bg-slate-500/10",
  },
};

export function conditionRuleLabel(rule: CouponConditionRule): string {
  switch (rule.kind) {
    case "minInvoice":
      return `Min Invoice $${(rule.minCents / 100).toFixed(0)}`;
    case "serviceCategoryIn":
      return `Services: ${rule.categories.join(", ")}`;
    case "firstTimeCustomer":
      return "First-Time Customers Only";
    case "vinNotRedeemedBefore":
      return "One Redemption Per VIN";
    default:
      return "Condition";
  }
}

export const COUPON_CONDITION_OPTIONS: {
  id: string;
  label: string;
  create: () => CouponConditionRule;
}[] = [
  {
    id: "firstTimeCustomer",
    label: "First-Time Customers",
    create: () => ({ kind: "firstTimeCustomer" as const }),
  },
  {
    id: "vinNotRedeemedBefore",
    label: "One Per VIN",
    create: () => ({ kind: "vinNotRedeemedBefore" as const }),
  },
  {
    id: "minInvoice100",
    label: "Min Invoice $100",
    create: () => ({ kind: "minInvoice" as const, minCents: 10_000 }),
  },
  {
    id: "serviceOilBrake",
    label: "Oil & Brake Eligible",
    create: () => ({
      kind: "serviceCategoryIn" as const,
      categories: ["Oil", "Brake"],
    }),
  },
];
