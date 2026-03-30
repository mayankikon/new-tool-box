import { MOCK_CAMPAIGNS } from "@/lib/campaigns/mock-data";
import type { Campaign, CampaignTrigger } from "@/lib/campaigns/types";

import type { MarketingTemplateCard, TemplateLifecycleStage } from "./mock-data";

export const ALL_TEMPLATE_CHANNELS = ["sms", "email", "push"] as const;

export type TemplateChannelOption = (typeof ALL_TEMPLATE_CHANNELS)[number];

export interface ResolvedMarketingTemplateConfig {
  defaultTrigger: CampaignTrigger;
  defaultAudienceSummary: string;
  defaultExclusionsSummary: string;
}

const lifecycleTrigger: Record<TemplateLifecycleStage, CampaignTrigger> = {
  onboarding: {
    type: "time-based",
    isRecurring: false,
    config: { delayDays: 1 },
  },
  "service-revenue": {
    type: "mileage",
    isRecurring: true,
    config: { intervalMiles: 5000 },
  },
  "research-education": {
    type: "time-based",
    isRecurring: false,
    config: { delayDays: 30 },
  },
  "win-back-retention": {
    type: "time-based",
    isRecurring: true,
    config: { intervalDays: 180 },
  },
};

const lifecycleAudience: Record<TemplateLifecycleStage, string> = {
  onboarding:
    "Owners in the first weeks after vehicle purchase or lease start.",
  "service-revenue":
    "Active service customers with vehicles due for maintenance, follow-up, or seasonal offers.",
  "research-education":
    "Owners between visits or early in ownership while learning the vehicle.",
  "win-back-retention":
    "Owners who have gone quiet or are at risk of churning from dealership service.",
};

const lifecycleExclusions: Record<TemplateLifecycleStage, string> = {
  onboarding:
    "Exclude customers who opted out of marketing or lack consent for the selected channels.",
  "service-revenue":
    "Exclude marketing opt-outs, duplicate appointments the same week, or very recent identical sends.",
  "research-education":
    "Exclude marketing opt-outs and, if needed, contacts messaged in the last 7 days.",
  "win-back-retention":
    "Exclude customers with a booked future appointment or an open repair order.",
};

/** Fine-tuned defaults for specific library rows; others use lifecycle fallbacks. */
const triggerOverrides: Partial<Record<string, CampaignTrigger>> = {
  "tpl-library-001": {
    type: "time-based",
    isRecurring: false,
    config: { delayDays: 0 },
  },
  "tpl-library-002": {
    type: "time-based",
    isRecurring: false,
    config: { delayDays: 7 },
  },
  "tpl-library-003": {
    type: "time-based",
    isRecurring: false,
    config: { delayDays: 30 },
  },
  "tpl-library-004": {
    type: "mileage",
    isRecurring: false,
    config: { thresholdMiles: 7500 },
  },
  "tpl-library-005": {
    type: "time-based",
    isRecurring: false,
    config: { delayDays: 14 },
  },
  "tpl-library-006": {
    type: "seasonal",
    isRecurring: true,
    config: { seasonWindow: "quarterly" },
  },
  "tpl-library-007": {
    type: "diagnostic",
    isRecurring: false,
    config: { reason: "open_factory_recall" },
  },
  "tpl-library-008": {
    type: "time-based",
    isRecurring: false,
    config: { daysBeforeExpiry: 60 },
  },
  "tpl-library-009": {
    type: "time-based",
    isRecurring: true,
    config: { daysSinceLastService: 365 },
  },
  "tpl-library-010": {
    type: "time-based",
    isRecurring: false,
    config: { daysBeforeLeaseEnd: 120 },
  },
  "tpl-library-011": {
    type: "time-based",
    isRecurring: false,
    config: { equityReviewIntervalDays: 90 },
  },
  "tpl-library-012": {
    type: "time-based",
    isRecurring: false,
    config: { delayDaysAfterService: 1 },
  },
  "tpl-library-013": {
    type: "time-based",
    isRecurring: false,
    config: { delayDaysBeforeAppointment: 1 },
  },
  "tpl-library-014": {
    type: "time-based",
    isRecurring: true,
    config: { intervalDays: 90 },
  },
  "tpl-library-015": {
    type: "time-based",
    isRecurring: false,
    config: { delayDaysAfterVisit: 2 },
  },
  "tpl-library-016": {
    type: "seasonal",
    isRecurring: true,
    config: { focus: "tire_rotation_alignment" },
  },
  "tpl-library-017": {
    type: "mileage",
    isRecurring: true,
    config: { intervalMiles: 12000 },
  },
  "tpl-library-018": {
    type: "time-based",
    isRecurring: false,
    config: { delayDaysAfterPurchase: 45 },
  },
  "tpl-library-019": {
    type: "seasonal",
    isRecurring: false,
    config: { promoWindow: "extended_hours_launch" },
  },
  "tpl-library-020": {
    type: "time-based",
    isRecurring: false,
    config: { delayDays: 1 },
  },
  "tpl-library-021": {
    type: "time-based",
    isRecurring: false,
    config: { delayDaysAfterPurchase: 3 },
  },
  "tpl-library-022": {
    type: "time-based",
    isRecurring: false,
    config: { delayDays: 21 },
  },
  "tpl-library-023": {
    type: "seasonal",
    isRecurring: false,
    config: { focus: "pre_trip_season" },
  },
  "tpl-library-024": {
    type: "time-based",
    isRecurring: false,
    config: { delayDaysAfterPurchase: 180 },
  },
  "tpl-library-025": {
    type: "time-based",
    isRecurring: false,
    config: { delayDaysAfterPositiveTouchpoint: 3 },
  },
  "tpl-library-026": {
    type: "time-based",
    isRecurring: false,
    config: { delayHoursAfterMissedAppointment: 4 },
  },
  "tpl-library-027": {
    type: "time-based",
    isRecurring: false,
    config: { inviteToProgram: true },
  },
};

export function getResolvedMarketingTemplateConfig(
  card: MarketingTemplateCard,
): ResolvedMarketingTemplateConfig {
  return {
    defaultTrigger:
      triggerOverrides[card.id] ?? lifecycleTrigger[card.lifecycleStage],
    defaultAudienceSummary: lifecycleAudience[card.lifecycleStage],
    defaultExclusionsSummary: lifecycleExclusions[card.lifecycleStage],
  };
}

export function listCampaignsUsingLibraryTemplate(
  libraryTemplateId: string,
): Pick<Campaign, "id" | "name" | "status">[] {
  return MOCK_CAMPAIGNS.filter(
    (campaign) => campaign.marketingLibraryTemplateId === libraryTemplateId,
  ).map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    status: campaign.status,
  }));
}

export const TRIGGER_TYPE_LABELS: Record<CampaignTrigger["type"], string> = {
  "time-based": "Time-based",
  mileage: "Mileage",
  diagnostic: "Diagnostic",
  health: "Health",
  proximity: "Proximity",
  seasonal: "Seasonal",
};

export function formatTriggerSummary(trigger: CampaignTrigger): string {
  const typeLabel = TRIGGER_TYPE_LABELS[trigger.type] ?? trigger.type;
  const cadence = trigger.isRecurring ? "Recurring" : "One-time";
  const cfg = trigger.config;
  const hints: string[] = [];

  if (typeof cfg.delayDays === "number") {
    hints.push(`${cfg.delayDays}d after trigger event`);
  }
  if (typeof cfg.delayDaysBeforeAppointment === "number") {
    hints.push(`${cfg.delayDaysBeforeAppointment}d before appointment`);
  }
  if (typeof cfg.delayDaysAfterVisit === "number") {
    hints.push(`${cfg.delayDaysAfterVisit}d after visit`);
  }
  if (typeof cfg.delayDaysAfterPurchase === "number") {
    hints.push(`${cfg.delayDaysAfterPurchase}d after purchase`);
  }
  if (typeof cfg.delayDaysAfterService === "number") {
    hints.push(`${cfg.delayDaysAfterService}d after service`);
  }
  if (typeof cfg.daysBeforeExpiry === "number") {
    hints.push(`${cfg.daysBeforeExpiry}d before warranty expiry`);
  }
  if (typeof cfg.daysBeforeLeaseEnd === "number") {
    hints.push(`${cfg.daysBeforeLeaseEnd}d before lease end`);
  }
  if (typeof cfg.daysSinceLastService === "number") {
    hints.push(`${cfg.daysSinceLastService}d since last service`);
  }
  if (typeof cfg.thresholdMiles === "number") {
    hints.push(`Near ${cfg.thresholdMiles} mi`);
  }
  if (typeof cfg.intervalMiles === "number") {
    hints.push(`Every ${cfg.intervalMiles} mi`);
  }
  if (typeof cfg.intervalDays === "number") {
    hints.push(`Every ${cfg.intervalDays}d`);
  }
  if (cfg.season != null || cfg.seasonWindow != null || cfg.focus != null) {
    hints.push("Seasonal / focused window");
  }
  if (cfg.reason != null) {
    hints.push(String(cfg.reason));
  }

  const detail = hints.length > 0 ? ` · ${hints.join(", ")}` : "";
  return `${typeLabel} · ${cadence}${detail}`;
}

export const TRIGGER_TYPES: CampaignTrigger["type"][] = [
  "time-based",
  "mileage",
  "diagnostic",
  "health",
  "proximity",
  "seasonal",
];
