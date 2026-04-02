import {
  createCouponVisualFromPreset,
  createDefaultCouponRules,
} from "@/lib/campaigns/coupon-templates";
import type {
  AudienceSegment,
  CampaignOffer,
  CampaignTrigger,
  CampaignType,
} from "@/lib/campaigns/types";
import {
  buildAtlasTieredOffers,
  buildCouponStrategyFromRows,
} from "@/lib/atlas-ai/coupon-strategy";
import type {
  AtlasAiCampaignSuggestion,
  AtlasAiCustomerPreviewRow,
  AtlasAiHomeModule,
  AtlasAiIntent,
  AtlasAiPromptSuggestion,
  AtlasAiResponse,
} from "@/lib/atlas-ai/types";

type CustomerPriority = AtlasAiCustomerPreviewRow["priority"];

interface AtlasAiMockCustomer {
  id: string;
  name: string;
  year: number;
  make: string;
  model: string;
  lastServiceDate: string;
  mileage: number;
  daysSinceLastService: number;
  oilChangeDue: boolean;
  due30kService: boolean;
  leaseEndDays?: number;
  warrantyDays?: number;
  hasRecall: boolean;
  batteryRisk: boolean;
  powertrain: "ice" | "hybrid" | "ev";
  priority: CustomerPriority;
  serviceDueReason: string;
}

const PREVIEW_ROW_COUNT = 18;

const SYNTHETIC_FIRST_NAMES = [
  "Noah",
  "Sophia",
  "Mason",
  "Isabella",
  "Logan",
  "Mia",
  "Lucas",
  "Ella",
  "Jackson",
  "Avery",
  "Levi",
  "Aria",
];

const SYNTHETIC_LAST_NAMES = [
  "Reed",
  "Collins",
  "Ward",
  "Morris",
  "Peterson",
  "Cook",
  "Bailey",
  "Brooks",
  "Price",
  "Murphy",
  "Powell",
  "Simmons",
];

export const ATLAS_AI_HEADLINES = [
  "Ask me about your dealership",
  "Find revenue hiding in your service lane",
  "See who’s drifting, defecting, or ready to return",
  "Turn customer signals into next best actions",
  "Spot retention risk before revenue walks away",
];

export const ATLAS_AI_HOME_MODULES: AtlasAiHomeModule[] = [
  {
    id: "atlas-home-retention",
    title: "Retention Risk",
    description: "Find owners most likely to miss their next visit.",
    prompt: "Which customers are overdue for service and most likely to defect before their next visit?",
    examples: [
      "Who is fading out of service retention?",
      "Which overdue owners still have comeback value?",
    ],
    iconKey: "gauge",
  },
  {
    id: "atlas-home-recall",
    title: "Recall Opportunity",
    description: "See recall urgency with downstream service upside.",
    prompt: "How many of my customers are due for a recall right now?",
    examples: [
      "Which recall owners also missed maintenance?",
      "Where is recall urgency creating lane opportunity?",
    ],
    iconKey: "shield",
  },
  {
    id: "atlas-home-revenue",
    title: "Revenue Gaps",
    description: "Size recoverable revenue sitting in inactive owners.",
    prompt: "How much service revenue is sitting in my inactive customer base?",
    examples: [
      "How much revenue is slipping through inactivity?",
      "Which segments are worth recovering first?",
    ],
    iconKey: "coins",
  },
  {
    id: "atlas-home-defection",
    title: "Defection Signals",
    description: "Catch owners showing competitor or churn behavior.",
    prompt: "Which high-value customers are showing defection risk right now?",
    examples: [
      "Which owners look like they’re leaving the lane?",
      "Who is worth a save motion before they defect?",
    ],
    iconKey: "route",
  },
  {
    id: "atlas-home-relocation",
    title: "Relocation Insights",
    description: "Identify owners who may have moved out of market.",
    prompt: "How many of my customers have moved to a different geographical area in the past 30 days?",
    examples: [
      "Who likely moved outside our primary market?",
      "Which relocated owners should be suppressed?",
    ],
    iconKey: "map",
  },
  {
    id: "atlas-home-bdc",
    title: "BDC Priorities",
    description: "Package the customers worth calling first this week.",
    prompt: "Which customers should BDC call first this week?",
    examples: [
      "Who should the team call first this week?",
      "Which owners combine urgency with revenue upside?",
    ],
    iconKey: "phone",
  },
];

export const ATLAS_AI_PROMPT_SUGGESTIONS: AtlasAiPromptSuggestion[] = [
  {
    id: "atlas-prompt-1",
    label: "Moved markets",
    prompt: "How many of my customers have moved to a different geographical area in the past 30 days?",
  },
  {
    id: "atlas-prompt-2",
    label: "Competitor visits",
    prompt: "How many of my customers visited a competitor dealership in the past 30 days?",
  },
  {
    id: "atlas-prompt-3",
    label: "Recall now",
    prompt: "How many of my customers are due for a recall right now?",
  },
  {
    id: "atlas-prompt-4",
    label: "Revenue upside",
    prompt: "How much service revenue is sitting in my inactive customer base?",
  },
  {
    id: "atlas-prompt-5",
    label: "30K due",
    prompt: "How many of my customers are due for 30K service this month?",
  },
  {
    id: "atlas-prompt-6",
    label: "Defection risk",
    prompt: "Which high-value customers are showing defection risk right now?",
  },
  {
    id: "atlas-prompt-7",
    label: "Warranty window",
    prompt: "How many of my customers are nearing warranty expiration right now?",
  },
  {
    id: "atlas-prompt-8",
    label: "BDC first",
    prompt: "Which customers should BDC call first this week?",
  },
];

const ATLAS_AI_CUSTOMERS: AtlasAiMockCustomer[] = [
  {
    id: "atlas-cust-1",
    name: "Ryan Parker",
    year: 2020,
    make: "BMW",
    model: "X5",
    lastServiceDate: "2024-03-15",
    mileage: 31420,
    daysSinceLastService: 369,
    oilChangeDue: true,
    due30kService: true,
    leaseEndDays: 68,
    hasRecall: false,
    batteryRisk: false,
    powertrain: "ice",
    priority: "high",
    serviceDueReason: "30K interval and overdue oil change",
  },
  {
    id: "atlas-cust-2",
    name: "Emma Thompson",
    year: 2021,
    make: "Audi",
    model: "Q7",
    lastServiceDate: "2024-08-01",
    mileage: 28740,
    daysSinceLastService: 230,
    oilChangeDue: true,
    due30kService: true,
    leaseEndDays: 42,
    hasRecall: false,
    batteryRisk: false,
    powertrain: "ice",
    priority: "high",
    serviceDueReason: "Approaching lease end and 30K service",
  },
  {
    id: "atlas-cust-3",
    name: "Benjamin Foster",
    year: 2021,
    make: "Mercedes-Benz",
    model: "GLE",
    lastServiceDate: "2023-12-10",
    mileage: 40110,
    daysSinceLastService: 465,
    oilChangeDue: true,
    due30kService: false,
    warrantyDays: 54,
    hasRecall: false,
    batteryRisk: false,
    powertrain: "ice",
    priority: "high",
    serviceDueReason: "Overdue service and warranty expiring soon",
  },
  {
    id: "atlas-cust-4",
    name: "Harper Butler",
    year: 2024,
    make: "Lexus",
    model: "RX Hybrid",
    lastServiceDate: "2024-11-02",
    mileage: 18410,
    daysSinceLastService: 137,
    oilChangeDue: false,
    due30kService: false,
    warrantyDays: 38,
    hasRecall: false,
    batteryRisk: true,
    powertrain: "hybrid",
    priority: "medium",
    serviceDueReason: "Warranty window and hybrid battery check opportunity",
  },
  {
    id: "atlas-cust-5",
    name: "Liam Garcia",
    year: 2021,
    make: "Toyota",
    model: "RAV4",
    lastServiceDate: "2023-11-20",
    mileage: 52300,
    daysSinceLastService: 485,
    oilChangeDue: true,
    due30kService: false,
    hasRecall: true,
    batteryRisk: false,
    powertrain: "ice",
    priority: "high",
    serviceDueReason: "Open recall and overdue routine service",
  },
  {
    id: "atlas-cust-6",
    name: "Ava Martinez",
    year: 2023,
    make: "Ford",
    model: "Explorer",
    lastServiceDate: "2024-06-18",
    mileage: 29890,
    daysSinceLastService: 274,
    oilChangeDue: true,
    due30kService: true,
    hasRecall: false,
    batteryRisk: false,
    powertrain: "ice",
    priority: "medium",
    serviceDueReason: "30K mile service due this month",
  },
  {
    id: "atlas-cust-7",
    name: "Ethan Davis",
    year: 2022,
    make: "Chevrolet",
    model: "Tahoe",
    lastServiceDate: "2024-01-09",
    mileage: 44780,
    daysSinceLastService: 435,
    oilChangeDue: true,
    due30kService: false,
    warrantyDays: 22,
    hasRecall: false,
    batteryRisk: false,
    powertrain: "ice",
    priority: "high",
    serviceDueReason: "High-value warranty and overdue service outreach",
  },
  {
    id: "atlas-cust-8",
    name: "Chloe Hall",
    year: 2024,
    make: "Nissan",
    model: "Ariya",
    lastServiceDate: "2024-12-12",
    mileage: 12080,
    daysSinceLastService: 97,
    oilChangeDue: false,
    due30kService: false,
    hasRecall: false,
    batteryRisk: true,
    powertrain: "ev",
    priority: "medium",
    serviceDueReason: "Battery health trend suggests proactive outreach",
  },
  {
    id: "atlas-cust-9",
    name: "James Taylor",
    year: 2021,
    make: "Honda",
    model: "CR-V",
    lastServiceDate: "2024-04-25",
    mileage: 30115,
    daysSinceLastService: 328,
    oilChangeDue: true,
    due30kService: true,
    leaseEndDays: 83,
    hasRecall: false,
    batteryRisk: false,
    powertrain: "ice",
    priority: "high",
    serviceDueReason: "30K service due with lease renewal window",
  },
  {
    id: "atlas-cust-10",
    name: "Charlotte Anderson",
    year: 2023,
    make: "Subaru",
    model: "Outback",
    lastServiceDate: "2024-05-18",
    mileage: 21990,
    daysSinceLastService: 305,
    oilChangeDue: true,
    due30kService: false,
    hasRecall: false,
    batteryRisk: false,
    powertrain: "ice",
    priority: "medium",
    serviceDueReason: "Oil service overdue before spring travel season",
  },
  {
    id: "atlas-cust-11",
    name: "Oliver Thomas",
    year: 2019,
    make: "Kia",
    model: "Telluride",
    lastServiceDate: "2023-09-14",
    mileage: 61240,
    daysSinceLastService: 552,
    oilChangeDue: true,
    due30kService: false,
    hasRecall: true,
    batteryRisk: false,
    powertrain: "ice",
    priority: "high",
    serviceDueReason: "Recall open and 18+ months since service",
  },
  {
    id: "atlas-cust-12",
    name: "Amelia White",
    year: 2022,
    make: "Volkswagen",
    model: "Tiguan",
    lastServiceDate: "2024-10-08",
    mileage: 26200,
    daysSinceLastService: 162,
    oilChangeDue: false,
    due30kService: false,
    leaseEndDays: 27,
    hasRecall: false,
    batteryRisk: false,
    powertrain: "ice",
    priority: "high",
    serviceDueReason: "Lease maturity conversation needed this month",
  },
  {
    id: "atlas-cust-13",
    name: "Henry Martin",
    year: 2021,
    make: "Hyundai",
    model: "Santa Fe Hybrid",
    lastServiceDate: "2024-02-02",
    mileage: 35660,
    daysSinceLastService: 411,
    oilChangeDue: true,
    due30kService: false,
    hasRecall: false,
    batteryRisk: true,
    powertrain: "hybrid",
    priority: "high",
    serviceDueReason: "Hybrid battery outreach and overdue service",
  },
];

const FOLLOW_UPS = {
  oilChange: [
    "How many of these oil-change customers are also overdue by more than 12 months?",
    "Which oil-change customers should BDC call first?",
    "Show the highest-priority oil-change audience first.",
  ],
  winback: [
    "Which inactive customers have the highest revenue upside?",
    "Which of these customers should BDC call first?",
    "Show only the highest-priority dormant customers.",
  ],
  lease: [
    "Which lease-end customers have the strongest service retention value?",
    "Which lease-end customers are also overdue for maintenance?",
    "Show lease-end customers with the highest opportunity first.",
  ],
  warranty: [
    "Which owners are inside the most urgent warranty window?",
    "Which warranty customers should BDC call first?",
    "Show only the highest-value warranty audience.",
  ],
  recall: [
    "Which recall customers should we contact first?",
    "Show recall customers that are also overdue for service.",
    "Which recall owners carry the most service upside?",
  ],
  battery: [
    "Show only EV and hybrid owners with the highest battery risk.",
    "Which battery-health customers should BDC call first?",
    "Which battery-health audience has the highest revenue upside?",
  ],
  bdc: [
    "Show only the customers with the strongest service comeback value.",
    "Which of these BDC targets have recall urgency too?",
    "Which BDC targets should move into a campaign next?",
  ],
  relocation: [
    "Which relocated owners should be suppressed from local service offers?",
    "Which relocated customers still have strong revenue value?",
    "Show only relocated customers outside our primary market area.",
  ],
  defection: [
    "Which defection-risk owners are overdue for service with us?",
    "How many of these customers are worth a win-back campaign?",
    "Show only the highest-value defection audience.",
  ],
  competitor: [
    "Which competitor-visit owners are still recoverable?",
    "How many competitor-visit customers are overdue with us?",
    "Show only the customers with the highest comeback value.",
  ],
  fallback: [
    "How many of my customers have moved to a different geographical area in the past 30 days?",
    "How many of my customers visited a competitor dealership in the past 30 days?",
    "How much service revenue is sitting in my inactive customer base?",
  ],
};

function createAudienceSegment(
  id: string,
  field: string,
  operator: string,
  value: string,
): AudienceSegment {
  return { id, field, operator, value };
}

/** Partial coupon drafts Atlas attaches to campaign recommendations (merged in wizard). */
const ATLAS_SUGGESTED_COUPONS = {
  oilChange: {
    type: "percentage-discount",
    discountPercent: 10,
    title: "Oil change week",
    description: "Routine oil service incentive for due customers.",
    channelSafeCopy: "Save 10% when you book oil service this week.",
    legalComplianceNote: "Valid once per VIN. Excludes synthetic upcharges unless noted.",
    visual: createCouponVisualFromPreset("hero-banner", {
      headline: "Fresh oil, happy engine",
      subheadline: "Book this week and save on oil & filter service.",
      ctaLabel: "Book oil service",
      badge: "oil",
      accentPreset: "emerald",
      showUrgencyLine: true,
      urgencyLine: "Your bay is waiting",
    }),
    rules: {
      ...createDefaultCouponRules(7),
      maxRedemptionsPerCustomer: 1,
      conditions: [{ kind: "serviceCategoryIn" as const, categories: ["Oil"] }],
    },
  } satisfies Partial<CampaignOffer>,
  battery: {
    type: "fixed-discount",
    discountCents: 3500,
    title: "Battery health check",
    description: "Proactive battery test and replacement incentive.",
    channelSafeCopy: "$35 toward battery service when you book this month.",
    legalComplianceNote: "Applies to qualifying battery SKUs. Advisor confirmation required.",
    visual: createCouponVisualFromPreset("split-band", {
      headline: "Battery rescue offer",
      subheadline:
        "We’ll test your high-voltage system and help you save on approved service.",
      ctaLabel: "Book battery check",
      badge: "battery",
      accentPreset: "amber",
      showUrgencyLine: true,
      urgencyLine: "Limited diagnostic slots",
    }),
    rules: {
      ...createDefaultCouponRules(10),
      maxRedemptionsPerCustomer: 1,
      conditions: [{ kind: "vinNotRedeemedBefore" as const }],
    },
  } satisfies Partial<CampaignOffer>,
  winback: {
    type: "fixed-discount",
    discountCents: 2000,
    title: "We miss you — service credit",
    description: "Win-back incentive for dormant service customers.",
    channelSafeCopy: "$20 service credit when you book your first visit back.",
    legalComplianceNote: "New visit only after 12+ months inactive. One per household.",
    visual: createCouponVisualFromPreset("ticket-stub", {
      headline: "Welcome back credit",
      subheadline: "Schedule any maintenance visit and we’ll apply savings at checkout.",
      ctaLabel: "Claim credit",
      badge: "general",
      accentPreset: "violet",
    }),
    rules: {
      ...createDefaultCouponRules(14),
      maxRedemptionsTotal: 250,
      conditions: [{ kind: "vinNotRedeemedBefore" as const }],
    },
  } satisfies Partial<CampaignOffer>,
  competitor: {
    type: "percentage-discount",
    discountPercent: 15,
    title: "Come back to us",
    description: "Stronger incentive for competitor-visit recovery.",
    channelSafeCopy: "15% off your next service visit when you book with us.",
    legalComplianceNote: "Cannot combine with other offers. Max discount may apply.",
    visual: createCouponVisualFromPreset("dark-accent", {
      headline: "Your lane, your team",
      subheadline: "Let us earn the next visit — exclusive return offer inside.",
      ctaLabel: "Schedule now",
      badge: "brake",
      accentPreset: "rose",
      showUrgencyLine: true,
      urgencyLine: "Almost gone",
    }),
    rules: {
      ...createDefaultCouponRules(10),
      maxRedemptionsPerDay: 30,
      conditions: [{ kind: "minInvoice" as const, minCents: 7500 }],
    },
  } satisfies Partial<CampaignOffer>,
} as const;

function buildCampaignSuggestion({
  title,
  description,
  campaignType,
  templateId,
  presetId,
  estimatedReach,
  estimatedRevenue,
  audienceLabel,
  audienceSegments,
  trigger,
  suggestedOffer,
}: {
  title: string;
  description: string;
  campaignType: CampaignType;
  templateId?: string;
  presetId?: string;
  estimatedReach: number;
  estimatedRevenue?: number;
  audienceLabel: string;
  audienceSegments: AudienceSegment[];
  trigger?: CampaignTrigger;
  suggestedOffer?: Partial<CampaignOffer>;
}): AtlasAiCampaignSuggestion {
  return {
    title,
    description,
    campaignType,
    templateId,
    presetId,
    estimatedReach,
    estimatedRevenue,
    audienceLabel,
    audienceSegments,
    trigger,
    suggestedOffer,
  };
}

function retentionScoreFromCustomer(customer: AtlasAiMockCustomer, index: number): number {
  const hash =
    customer.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + index * 17;
  const seed = hash % 100;
  if (customer.priority === "high") {
    return 10 + (seed % 45);
  }
  if (customer.priority === "medium") {
    return 35 + (seed % 40);
  }
  return 55 + (seed % 42);
}

function toPreviewRows(customers: AtlasAiMockCustomer[]): AtlasAiCustomerPreviewRow[] {
  const expandedCustomers = expandCustomersForPreview(customers, PREVIEW_ROW_COUNT);

  return expandedCustomers.map((customer, index) => ({
    id: customer.id,
    name: customer.name,
    vehicle: `${customer.year} ${customer.make} ${customer.model}`,
    retentionScore: retentionScoreFromCustomer(customer, index),
    lastServiceDate: customer.lastServiceDate,
    mileage: customer.mileage,
    serviceDueReason: customer.serviceDueReason,
    priority: customer.priority,
  }));
}

function shiftIsoDate(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function expandCustomersForPreview(
  customers: AtlasAiMockCustomer[],
  targetCount: number,
): AtlasAiMockCustomer[] {
  if (customers.length === 0) return [];
  if (customers.length >= targetCount) return customers.slice(0, targetCount);

  const expanded = [...customers];

  while (expanded.length < targetCount) {
    const template = customers[expanded.length % customers.length];
    const syntheticIndex = expanded.length - customers.length;
    const firstName = SYNTHETIC_FIRST_NAMES[syntheticIndex % SYNTHETIC_FIRST_NAMES.length];
    const lastName =
      SYNTHETIC_LAST_NAMES[Math.floor(syntheticIndex / 2) % SYNTHETIC_LAST_NAMES.length];
    const mileageOffset = 700 + syntheticIndex * 380;
    const daysOffset = 6 + (syntheticIndex % 5) * 7;

    expanded.push({
      ...template,
      id: `${template.id}-synthetic-${syntheticIndex + 1}`,
      name: `${firstName} ${lastName}`,
      mileage: template.mileage + mileageOffset,
      daysSinceLastService: template.daysSinceLastService + daysOffset,
      lastServiceDate: shiftIsoDate(template.lastServiceDate, -daysOffset),
    });
  }

  return expanded;
}

function toPromptSuggestions(prompts: string[]): AtlasAiPromptSuggestion[] {
  return prompts.map((prompt, index) => ({
    id: `atlas-follow-up-${index}-${prompt.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: prompt,
    prompt,
  }));
}

function normalizeQuery(query: string) {
  return query.trim().toLowerCase();
}

function getRelocationMatches() {
  return ATLAS_AI_CUSTOMERS.filter((customer) =>
    ["atlas-cust-2", "atlas-cust-5", "atlas-cust-8", "atlas-cust-12"].includes(customer.id),
  );
}

function getCompetitorVisitMatches() {
  return ATLAS_AI_CUSTOMERS.filter((customer) =>
    ["atlas-cust-1", "atlas-cust-3", "atlas-cust-5", "atlas-cust-10", "atlas-cust-11"].includes(
      customer.id,
    ),
  );
}

function getDefectionMatches() {
  return ATLAS_AI_CUSTOMERS.filter(
    (customer) =>
      customer.priority === "high" &&
      (customer.daysSinceLastService >= 365 || customer.hasRecall || customer.leaseEndDays != null),
  );
}

function detectIntent(query: string): AtlasAiIntent {
  const normalized = normalizeQuery(query);

  if (
    normalized.includes("competitor") ||
    normalized.includes("geo fence") ||
    normalized.includes("geofence")
  ) {
    return "competitor-visit";
  }
  if (
    normalized.includes("moved") ||
    normalized.includes("relocated") ||
    normalized.includes("geographical area") ||
    normalized.includes("out of market")
  ) {
    return "relocation";
  }
  if (normalized.includes("defection") || normalized.includes("defect")) {
    return "defection";
  }
  if (normalized.includes("bdc") || normalized.includes("call this week")) {
    return "bdc-list";
  }
  if (normalized.includes("battery")) {
    return "battery-health";
  }
  if (normalized.includes("30k") || normalized.includes("30 k")) {
    return "thirty-k-service";
  }
  if (normalized.includes("lease")) {
    return "lease-end";
  }
  if (normalized.includes("warranty")) {
    return "warranty-expiration";
  }
  if (normalized.includes("recall")) {
    return "recall";
  }
  if (
    normalized.includes("12+ months") ||
    normalized.includes("12 months") ||
    normalized.includes("no service") ||
    normalized.includes("not serviced") ||
    normalized.includes("inactive")
  ) {
    return "winback";
  }
  if (normalized.includes("campaign")) {
    return "campaign-recommendation";
  }
  if (normalized.includes("oil")) {
    return "oil-change";
  }
  if (normalized.includes("overdue service") || normalized.includes("due for service")) {
    return "overdue-service";
  }

  return "unknown";
}

function createRecommendedActions(includeCampaign = true) {
  return [
    {
      id: "atlas-action-export",
      label: "Send to BDC / Export list",
      description: "Package this audience for a BDC handoff or CSV export.",
      kind: "export" as const,
      emphasis: "primary" as const,
    },
    ...(includeCampaign
      ? [
          {
            id: "atlas-action-campaign",
            label: "Create campaign for this audience",
            description: "Open the campaign builder with the audience context prefilled.",
            kind: "campaign" as const,
            emphasis: "secondary" as const,
          },
        ]
      : []),
  ];
}

function buildResponse(
  userQuery: string,
  intent: AtlasAiIntent,
): AtlasAiResponse {
  switch (intent) {
    case "oil-change": {
      const matches = ATLAS_AI_CUSTOMERS.filter((customer) => customer.oilChangeDue);
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} owners are due for an oil change`,
        summary:
          `I found ${previewRows.length} customers who look due for an oil change. The highest-priority group overlaps with overdue service and lease-end opportunities, so this is a strong service-to-sales bridge audience.`,
        whyItMatters:
          "Several of these owners are already slipping on service cadence, which makes this audience valuable for both immediate bookings and broader retention recovery.",
        metrics: [
          { id: "matched", label: "Matched customers", value: String(previewRows.length) },
          { id: "high-priority", label: "High priority", value: String(previewRows.filter((customer) => customer.priority === "high").length) },
          { id: "revenue", label: "Estimated service revenue", value: "$7.8K" },
        ],
        insightCategory: "Revenue Gaps",
        insightTags: ["Service due", "High revenue upside"],
        nextBestActionLabel: "Campaign first",
        audiencePreview: {
          label: "Oil change audience",
          description: "Customers likely due for an oil service based on mileage and time since last visit.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.oilChange),
        campaignSuggestion: buildCampaignSuggestion({
          title: "Oil Change Recovery Campaign",
          description: "Re-engage customers who are due for a routine oil service with a low-friction booking CTA.",
          campaignType: "oil-change",
          templateId: "tpl-002",
          estimatedReach: previewRows.length,
          estimatedRevenue: 7800,
          audienceLabel: "Oil change due customers",
          audienceSegments: [
            createAudienceSegment("atlas-oil-1", "Mileage Since Last Service", "greater than", "4500"),
            createAudienceSegment("atlas-oil-2", "Days Since Last Service", "greater than", "180"),
          ],
          trigger: {
            type: "mileage",
            isRecurring: true,
            config: { intervalMiles: 5000 },
          },
          suggestedOffer: ATLAS_SUGGESTED_COUPONS.oilChange,
        }),
      };
    }
    case "overdue-service":
    case "winback": {
      const matches = ATLAS_AI_CUSTOMERS.filter((customer) => customer.daysSinceLastService >= 365);
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} inactive owners are ready for a win-back push`,
        summary:
          `I found ${previewRows.length} customers who have gone at least 12 months without service. This is a strong win-back audience, especially because several of them also have recall, warranty, or hybrid battery outreach opportunities.`,
        whyItMatters:
          "This group represents recapturable revenue and the highest risk of permanent service-lane churn if the dealership waits too long to re-engage them.",
        metrics: [
          { id: "matched", label: "Dormant customers", value: String(previewRows.length) },
          { id: "high-priority", label: "High priority", value: String(previewRows.filter((customer) => customer.priority === "high").length) },
          { id: "revenue", label: "Estimated recapture revenue", value: "$12.4K" },
        ],
        insightCategory: "Retention Risk",
        insightTags: ["Inactive", "High revenue upside", "BDC first"],
        nextBestActionLabel: "BDC first",
        audiencePreview: {
          label: "12+ month win-back audience",
          description: "Customers with no recent service activity who are most likely to respond to reactivation outreach.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.winback),
        campaignSuggestion: buildCampaignSuggestion({
          title: "12+ Month Win-Back Campaign",
          description: "Reconnect with dormant service customers using a service reminder plus an incentive to book.",
          campaignType: "service-reminder",
          presetId: "winback-12",
          estimatedReach: previewRows.length,
          estimatedRevenue: 12400,
          audienceLabel: "Customers inactive for 12+ months",
          audienceSegments: [
            createAudienceSegment("atlas-winback-1", "Days Since Last Service", "greater than", "365"),
          ],
          trigger: {
            type: "time-based",
            isRecurring: false,
            config: { delayDays: 1 },
          },
          suggestedOffer: ATLAS_SUGGESTED_COUPONS.winback,
        }),
      };
    }
    case "lease-end": {
      const matches = ATLAS_AI_CUSTOMERS.filter(
        (customer) => customer.leaseEndDays != null && customer.leaseEndDays <= 90,
      ).sort((left, right) => (left.leaseEndDays ?? 999) - (right.leaseEndDays ?? 999));
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} lease-end owners need a retention decision`,
        summary:
          `I found ${previewRows.length} customers nearing lease end in the next 90 days. Several also have service-touchpoint opportunities, which makes this a high-value audience for coordinated sales and service follow-up.`,
        whyItMatters:
          "Lease-end owners can fall out of both sales and service retention quickly, so this audience benefits from an early, coordinated outreach motion.",
        metrics: [
          { id: "matched", label: "Lease-end customers", value: String(previewRows.length) },
          { id: "soonest", label: "Earliest maturity", value: "27 days" },
          { id: "revenue", label: "Estimated renewal opportunity", value: "$18.6K" },
        ],
        insightCategory: "Retention Risk",
        insightTags: ["Lease end", "BDC first"],
        nextBestActionLabel: "BDC first",
        audiencePreview: {
          label: "Lease-end audience",
          description: "Customers approaching lease maturity in the next 90 days.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.lease),
        campaignSuggestion: buildCampaignSuggestion({
          title: "Lease Renewal Outreach",
          description: "Prompt lessees to renew, buy out, or trade up before maturity.",
          campaignType: "lease-renewal",
          templateId: "tpl-003",
          estimatedReach: previewRows.length,
          estimatedRevenue: 18600,
          audienceLabel: "Lease-end customers within 90 days",
          audienceSegments: [
            createAudienceSegment("atlas-lease-1", "Lease End Date", "within", "90 days"),
          ],
          trigger: {
            type: "time-based",
            isRecurring: false,
            config: { daysBeforeExpiry: 90 },
          },
        }),
      };
    }
    case "warranty-expiration": {
      const matches = ATLAS_AI_CUSTOMERS.filter(
        (customer) => customer.warrantyDays != null && customer.warrantyDays <= 60,
      ).sort((left, right) => (left.warrantyDays ?? 999) - (right.warrantyDays ?? 999));
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} owners are nearing warranty expiration`,
        summary:
          `I found ${previewRows.length} customers with warranties expiring in the next 60 days. This audience is ideal for protection-plan outreach, and several are already overdue for service, which gives you a stronger reason to contact them now.`,
        whyItMatters:
          "Warranty windows create a natural outreach moment, especially when paired with overdue maintenance or strong lifetime-value potential.",
        metrics: [
          { id: "matched", label: "Expiring warranties", value: String(previewRows.length) },
          { id: "urgent", label: "Under 30 days", value: String(matches.filter((customer) => (customer.warrantyDays ?? 999) <= 30).length) },
          { id: "revenue", label: "Estimated protection revenue", value: "$9.4K" },
        ],
        insightCategory: "Revenue Gaps",
        insightTags: ["Warranty window", "High revenue upside"],
        nextBestActionLabel: "Campaign first",
        audiencePreview: {
          label: "Warranty-expiration audience",
          description: "Customers with near-term warranty deadlines and strong outreach value.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.warranty),
        campaignSuggestion: buildCampaignSuggestion({
          title: "Warranty Expiration Campaign",
          description: "Educate owners before factory coverage ends and prompt an extended plan conversation.",
          campaignType: "warranty-expiration",
          templateId: "tpl-005",
          estimatedReach: previewRows.length,
          estimatedRevenue: 9400,
          audienceLabel: "Warranties expiring within 60 days",
          audienceSegments: [
            createAudienceSegment("atlas-warranty-1", "Warranty End Date", "within", "60 days"),
          ],
          trigger: {
            type: "time-based",
            isRecurring: false,
            config: { daysBeforeExpiry: 60 },
          },
        }),
      };
    }
    case "recall": {
      const matches = ATLAS_AI_CUSTOMERS.filter((customer) => customer.hasRecall);
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} owners are showing recall urgency`,
        summary:
          `I found ${previewRows.length} customers with open recalls. This is the most urgent audience operationally, and these owners are also strong service follow-up candidates once the recall repair is booked.`,
        whyItMatters:
          "Recall customers give the dealership an immediate reason to reach out and a chance to pull additional fixed-ops revenue into the same appointment.",
        metrics: [
          { id: "matched", label: "Open recalls", value: String(previewRows.length) },
          { id: "high-priority", label: "High priority", value: String(previewRows.filter((customer) => customer.priority === "high").length) },
          { id: "revenue", label: "Estimated follow-up service opportunity", value: "$4.2K" },
        ],
        insightCategory: "Recall Opportunity",
        insightTags: ["Recall due", "BDC first"],
        nextBestActionLabel: "BDC first",
        audiencePreview: {
          label: "Recall audience",
          description: "Customers with open recalls who should be contacted first.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.recall),
        campaignSuggestion: buildCampaignSuggestion({
          title: "Open Recall Repair Campaign",
          description: "Prompt customers to schedule recall repairs quickly while reinforcing dealership trust.",
          campaignType: "recall",
          templateId: "tpl-006",
          estimatedReach: previewRows.length,
          estimatedRevenue: 4200,
          audienceLabel: "Customers with open recalls",
          audienceSegments: [
            createAudienceSegment("atlas-recall-1", "Open Recall", "equals", "Yes"),
          ],
          trigger: {
            type: "time-based",
            isRecurring: false,
            config: { delayDays: 1 },
          },
        }),
      };
    }
    case "battery-health": {
      const matches = ATLAS_AI_CUSTOMERS.filter((customer) => customer.batteryRisk);
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} owners are showing battery-health opportunity`,
        summary:
          `I found ${previewRows.length} EV or hybrid owners who look like good candidates for proactive battery-health outreach. This audience is high-intent and well suited to an educational campaign or a BDC callback list.`,
        whyItMatters:
          "Battery-health outreach works best when it feels proactive and consultative, which makes this audience a strong fit for both service education and follow-up revenue.",
        metrics: [
          { id: "matched", label: "Battery outreach candidates", value: String(previewRows.length) },
          { id: "ev-hybrid", label: "EV / hybrid owners", value: String(previewRows.length) },
          { id: "revenue", label: "Estimated inspection revenue", value: "$3.1K" },
        ],
        insightCategory: "Revenue Gaps",
        insightTags: ["Battery opportunity", "Campaign first"],
        nextBestActionLabel: "Campaign first",
        audiencePreview: {
          label: "Battery-health audience",
          description: "EV and hybrid owners with signals that justify proactive service outreach.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.battery),
        campaignSuggestion: buildCampaignSuggestion({
          title: "Battery Health Education Campaign",
          description: "Invite EV and hybrid owners to a battery health inspection or consultation.",
          campaignType: "battery-health",
          estimatedReach: previewRows.length,
          estimatedRevenue: 3100,
          audienceLabel: "EV and hybrid battery outreach",
          audienceSegments: [
            createAudienceSegment("atlas-battery-1", "Powertrain", "in", "EV, Hybrid"),
            createAudienceSegment("atlas-battery-2", "Battery Health Trend", "equals", "Declining"),
          ],
          trigger: {
            type: "health",
            isRecurring: false,
            config: { threshold: "declining" },
          },
          suggestedOffer: ATLAS_SUGGESTED_COUPONS.battery,
        }),
      };
    }
    case "thirty-k-service": {
      const matches = ATLAS_AI_CUSTOMERS.filter((customer) => customer.due30kService);
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} owners are approaching a 30K service moment`,
        summary:
          `I found ${previewRows.length} customers due for 30K mile service. This audience is strong because it combines routine maintenance urgency with highly explainable service recommendations.`,
        whyItMatters:
          "Milestone service audiences are highly explainable to customers, which makes them easier to move into action with both BDC outreach and service campaigns.",
        metrics: [
          { id: "matched", label: "30K service due", value: String(previewRows.length) },
          { id: "high-priority", label: "High priority", value: String(previewRows.filter((customer) => customer.priority === "high").length) },
          { id: "revenue", label: "Estimated service revenue", value: "$11.1K" },
        ],
        insightCategory: "Revenue Gaps",
        insightTags: ["30K due", "High revenue upside"],
        nextBestActionLabel: "Campaign first",
        audiencePreview: {
          label: "30K service audience",
          description: "Customers approaching or passing the 30,000-mile service interval.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.oilChange),
        campaignSuggestion: buildCampaignSuggestion({
          title: "30K Mile Service Push",
          description: "Drive bookings for customers approaching the 30K service milestone.",
          campaignType: "service-reminder",
          templateId: "tpl-002",
          estimatedReach: previewRows.length,
          estimatedRevenue: 11100,
          audienceLabel: "30K mile service due",
          audienceSegments: [
            createAudienceSegment("atlas-30k-1", "Mileage", "between", "28000-32000"),
          ],
          trigger: {
            type: "mileage",
            isRecurring: true,
            config: { intervalMiles: 30000 },
          },
        }),
      };
    }
    case "campaign-recommendation": {
      const response = buildResponse(
        "Which customers have not serviced in 12+ months?",
        "winback",
      );
      return {
        ...response,
        intent,
        userQuery,
      };
    }
    case "relocation": {
      const matches = getRelocationMatches();
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} owners likely moved outside your market`,
        summary:
          `I found ${previewRows.length} customers who appear to have shifted into a different geographic area in the past 30 days. Several are still high-value service owners, but they may need suppression, reassignment, or a different outreach strategy.`,
        whyItMatters:
          "Recent movers can distort campaign performance and BDC prioritization if they stay mixed into the local audience after leaving the dealership’s primary market.",
        metrics: [
          { id: "matched", label: "Relocated owners", value: String(previewRows.length) },
          { id: "high-priority", label: "High value owners", value: String(previewRows.filter((customer) => customer.priority === "high").length) },
          { id: "revenue", label: "Revenue at risk", value: "$6.2K" },
        ],
        insightCategory: "Relocation Insights",
        insightTags: ["Relocated", "Retention risk"],
        nextBestActionLabel: "BDC first",
        audiencePreview: {
          label: "Relocation audience",
          description: "Owners who likely moved outside the dealership’s primary market in the past 30 days.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(false),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.relocation),
      };
    }
    case "competitor-visit": {
      const matches = getCompetitorVisitMatches();
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} owners show recent competitor-visit behavior`,
        summary:
          `I found ${previewRows.length} customers who look like they visited a competitor dealership recently. Several are overdue with us, which makes this a strong early win-back and service recovery audience.`,
        whyItMatters:
          "Competitor-visit signals are one of the clearest early warnings of service-lane defection, especially when paired with missed maintenance or long gaps since last visit.",
        metrics: [
          { id: "matched", label: "Competitor visits", value: String(previewRows.length) },
          { id: "overdue", label: "Also overdue with us", value: String(matches.filter((customer) => customer.daysSinceLastService >= 365).length) },
          { id: "revenue", label: "Recoverable service revenue", value: "$8.7K" },
        ],
        insightCategory: "Defection Signals",
        insightTags: ["Competitor visit", "Defection risk", "BDC first"],
        nextBestActionLabel: "BDC first",
        audiencePreview: {
          label: "Competitor-visit audience",
          description: "Owners showing competitor dealership behavior and strong comeback value.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.competitor),
        campaignSuggestion: buildCampaignSuggestion({
          title: "Competitor Defection Win-Back",
          description: "Re-engage owners showing competitor behavior with a service-first win-back offer.",
          campaignType: "service-reminder",
          presetId: "winback-12",
          estimatedReach: previewRows.length,
          estimatedRevenue: 8700,
          audienceLabel: "Competitor-visit audience",
          audienceSegments: [
            createAudienceSegment("atlas-defect-1", "Competitor Visit", "equals", "Yes"),
            createAudienceSegment("atlas-defect-2", "Days Since Last Service", "greater than", "180"),
          ],
          suggestedOffer: ATLAS_SUGGESTED_COUPONS.competitor,
        }),
      };
    }
    case "defection": {
      const matches = getDefectionMatches();
      const previewRows = toPreviewRows(matches);
      return {
        intent,
        userQuery,
        headline: `${previewRows.length} high-value owners are showing defection risk`,
        summary:
          `I found ${previewRows.length} high-value customers showing defection risk based on overdue service, recall urgency, or weakening lane engagement. This is the strongest recovery audience to prioritize before revenue walks away.`,
        whyItMatters:
          "Defection-risk owners are close enough to losing that proactive outreach still matters, but far enough along that a generic reminder is no longer strong enough.",
        metrics: [
          { id: "matched", label: "Defection-risk owners", value: String(previewRows.length) },
          { id: "urgent", label: "High priority", value: String(previewRows.filter((customer) => customer.priority === "high").length) },
          { id: "revenue", label: "Revenue at risk", value: "$14.1K" },
        ],
        insightCategory: "Defection Signals",
        insightTags: ["Defection risk", "High revenue upside", "BDC first"],
        nextBestActionLabel: "BDC first",
        audiencePreview: {
          label: "Defection-risk audience",
          description: "High-value owners most likely to fall out of service retention without action now.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.defection),
        campaignSuggestion: buildCampaignSuggestion({
          title: "Service Lane Save Campaign",
          description: "Prioritize owners showing churn signals with a save-the-lane recovery message.",
          campaignType: "service-reminder",
          presetId: "winback-12",
          estimatedReach: previewRows.length,
          estimatedRevenue: 14100,
          audienceLabel: "Defection-risk audience",
          audienceSegments: [
            createAudienceSegment("atlas-save-1", "Defection Risk", "equals", "High"),
          ],
        }),
      };
    }
    case "bdc-list": {
      const matches = [...ATLAS_AI_CUSTOMERS]
        .filter(
          (customer) =>
            customer.priority === "high" &&
            (customer.hasRecall ||
              customer.daysSinceLastService >= 365 ||
              (customer.warrantyDays ?? 999) <= 60 ||
              (customer.leaseEndDays ?? 999) <= 90),
        )
        .sort((left, right) => right.daysSinceLastService - left.daysSinceLastService);
      const previewRows = toPreviewRows(matches);

      return {
        intent,
        userQuery,
        headline: `${previewRows.length} customers belong on your BDC priority list`,
        summary:
          `I built a BDC call list with ${previewRows.length} high-priority customers. This list leans toward customers who have either urgent operational reasons to contact them now or strong campaign-conversion potential.`,
        whyItMatters:
          "This list helps the team spend calls on owners with the clearest revenue or urgency signal instead of treating every inactive or recall customer the same way.",
        metrics: [
          { id: "matched", label: "BDC call targets", value: String(previewRows.length) },
          { id: "recall", label: "Recall / warranty urgency", value: String(matches.filter((customer) => customer.hasRecall || (customer.warrantyDays ?? 999) <= 60).length) },
          { id: "service", label: "Overdue service", value: String(matches.filter((customer) => customer.daysSinceLastService >= 365).length) },
        ],
        insightCategory: "BDC Priorities",
        insightTags: ["BDC first", "High revenue upside"],
        nextBestActionLabel: "BDC first",
        audiencePreview: {
          label: "BDC priority list",
          description: "High-priority customers recommended for this week's outbound team follow-up.",
          totalCount: previewRows.length,
          rows: previewRows,
        },
        recommendedActions: createRecommendedActions(true),
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.bdc),
        campaignSuggestion: buildCampaignSuggestion({
          title: "BDC Win-Back + Service Recovery Campaign",
          description: "Support outbound calling with a coordinated follow-up campaign for the same audience.",
          campaignType: "service-reminder",
          presetId: "winback-12",
          estimatedReach: previewRows.length,
          estimatedRevenue: 14300,
          audienceLabel: "BDC weekly priority list",
          audienceSegments: [
            createAudienceSegment("atlas-bdc-1", "Days Since Last Service", "greater than", "365"),
            createAudienceSegment("atlas-bdc-2", "Open Recall", "equals", "Yes"),
          ],
          trigger: {
            type: "time-based",
            isRecurring: false,
            config: { delayDays: 1 },
          },
        }),
      };
    }
    case "unknown":
    default:
      return {
        intent: "unknown",
        userQuery,
        headline: "Atlas needs a more specific customer signal",
        summary:
          "I couldn’t confidently map that request to one of the supported customer-discovery workflows yet. Try asking about oil changes, inactive service customers, lease end, recalls, warranty expiration, battery outreach, or a BDC call list.",
        whyItMatters:
          "Atlas works best when the question points to a customer signal, audience, risk, or revenue opportunity it can evaluate.",
        metrics: [],
        insightCategory: "Guided Prompt",
        insightTags: ["Prompt needed"],
        nextBestActionLabel: "Try a guided prompt",
        recommendedActions: [
          {
            id: "atlas-action-try-again",
            label: "Try a guided prompt",
            description: "Use one of the supported prompts to generate an audience and recommended next step.",
            kind: "bdc",
            emphasis: "primary",
          },
        ],
        followUpPrompts: toPromptSuggestions(FOLLOW_UPS.fallback),
      };
  }
}

function enrichAtlasResponse(response: AtlasAiResponse): AtlasAiResponse {
  const rows = response.audiencePreview?.rows;
  if (!rows?.length) {
    return response;
  }

  const couponStrategy = buildCouponStrategyFromRows(rows, 0);
  let campaignSuggestion = response.campaignSuggestion;
  if (campaignSuggestion) {
    campaignSuggestion = {
      ...campaignSuggestion,
      suggestedOffers: buildAtlasTieredOffers(0),
    };
  }

  return {
    ...response,
    couponStrategy,
    ...(campaignSuggestion ? { campaignSuggestion } : {}),
  };
}

export function getAtlasAiResponse(query: string): AtlasAiResponse {
  const intent = detectIntent(query);
  return enrichAtlasResponse(buildResponse(query, intent));
}
