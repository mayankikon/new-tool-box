import type {
  AudienceSegment,
  Campaign,
  CampaignTemplate,
  CampaignTrigger,
  CampaignType,
  Channel,
  DashboardMetrics,
} from "./types";
import type { CapacityHint } from "./types";
import { VEHICLE_MAKES } from "./vehicle-data";

// ---------------------------------------------------------------------------
// Mock Campaigns
// ---------------------------------------------------------------------------

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-001",
    name: "New Owner Welcome Series",
    status: "active",
    type: "new-owner",
    audienceSegments: [
      {
        id: "seg-1",
        field: "Purchase Date",
        operator: "within",
        value: "30 days",
      },
    ],
    audienceSize: 342,
    trigger: {
      type: "time-based",
      isRecurring: false,
      config: { delayDays: 3 },
    },
    messages: [
      {
        subject: "Welcome to the family!",
        body: "Congratulations on your new vehicle! Schedule your complimentary first service today.",
        channel: "email",
      },
      {
        body: "Welcome! Your complimentary first service is ready to book. Reply YES to schedule.",
        channel: "sms",
      },
    ],
    channels: [
      { channel: "email", isEnabled: true, estimatedReach: 320 },
      { channel: "sms", isEnabled: true, estimatedReach: 290 },
    ],
    metrics: {
      reach: 1842,
      responseRate: 34.2,
      conversionRate: 12.1,
      revenue: 28400,
      appointments: 89,
    },
    createdAt: "2025-12-15T10:00:00Z",
    updatedAt: "2026-03-01T14:30:00Z",
    launchedAt: "2026-01-02T09:00:00Z",
    marketingLibraryTemplateId: "tpl-library-001",
  },
  {
    id: "camp-002",
    name: "30K Mile Service Reminder",
    status: "active",
    type: "service-reminder",
    audienceSegments: [
      {
        id: "seg-2",
        field: "Current Mileage",
        operator: "between",
        value: "28000-31000",
      },
    ],
    audienceSize: 420,
    trigger: {
      type: "mileage",
      isRecurring: false,
      config: { thresholdMiles: 30000 },
    },
    messages: [
      {
        body: "Your vehicle is approaching 30,000 miles — time for a major service. Book now and save 15%.",
        channel: "sms",
      },
    ],
    channels: [
      { channel: "sms", isEnabled: true, estimatedReach: 395 },
      { channel: "push", isEnabled: true, estimatedReach: 310 },
    ],
    metrics: {
      reach: 1256,
      responseRate: 28.5,
      conversionRate: 9.8,
      revenue: 42300,
      appointments: 124,
    },
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-03-05T11:00:00Z",
    launchedAt: "2026-01-15T09:00:00Z",
    marketingLibraryTemplateId: "tpl-library-004",
  },
  {
    id: "camp-003",
    name: "Battery Health Alert",
    status: "active",
    type: "battery-health",
    audienceSegments: [
      {
        id: "seg-3",
        field: "Battery Health Score",
        operator: "less than",
        value: "40%",
      },
    ],
    audienceSize: 183,
    trigger: {
      type: "diagnostic",
      isRecurring: true,
      config: { healthThreshold: 40 },
    },
    messages: [
      {
        subject: "Your battery needs attention",
        body: "Our diagnostics show your battery health is declining. Schedule a free inspection before you get stranded.",
        channel: "email",
      },
      {
        body: "Battery alert: Your vehicle's battery health is low. Free inspection available — book today.",
        channel: "sms",
      },
    ],
    channels: [
      { channel: "email", isEnabled: true, estimatedReach: 170 },
      { channel: "sms", isEnabled: true, estimatedReach: 160 },
      { channel: "push", isEnabled: true, estimatedReach: 120 },
    ],
    metrics: {
      reach: 856,
      responseRate: 41.3,
      conversionRate: 15.7,
      revenue: 19800,
      appointments: 68,
    },
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-03-08T16:00:00Z",
    launchedAt: "2026-02-05T09:00:00Z",
  },
  {
    id: "camp-004",
    name: "Spring Tire Rotation Special",
    status: "scheduled",
    type: "seasonal-promotion",
    audienceSegments: [
      {
        id: "seg-4",
        field: "Last Tire Service",
        operator: "more than",
        value: "6 months ago",
      },
    ],
    audienceSize: 1280,
    trigger: {
      type: "seasonal",
      isRecurring: false,
      config: { startDate: "2026-04-01" },
    },
    messages: [
      {
        subject: "Spring into savings — tire rotation for $29.99",
        body: "Spring is here! Keep your tires in top shape with our $29.99 rotation special.",
        channel: "email",
      },
      {
        body: "Spring tire special: $29.99 rotation + free inspection. Book now before slots fill up!",
        channel: "sms",
      },
    ],
    channels: [
      { channel: "email", isEnabled: true, estimatedReach: 1180 },
      { channel: "sms", isEnabled: true, estimatedReach: 1050 },
    ],
    metrics: {
      reach: 0,
      responseRate: 0,
      conversionRate: 0,
      revenue: 0,
      appointments: 0,
    },
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-08T10:00:00Z",
    scheduledAt: "2026-04-01T09:00:00Z",
    marketingLibraryTemplateId: "tpl-library-016",
  },
  {
    id: "camp-005",
    name: "Warranty Expiration Notice",
    status: "scheduled",
    type: "warranty-expiration",
    audienceSegments: [
      {
        id: "seg-5",
        field: "Warranty End Date",
        operator: "within",
        value: "60 days",
      },
    ],
    audienceSize: 567,
    trigger: {
      type: "time-based",
      isRecurring: false,
      config: { daysBeforeExpiry: 60 },
    },
    messages: [
      {
        subject: "Your warranty expires soon — protect your investment",
        body: "Your factory warranty is expiring soon. Explore extended protection plans.",
        channel: "email",
      },
    ],
    channels: [
      { channel: "email", isEnabled: true, estimatedReach: 540 },
      { channel: "sms", isEnabled: true, estimatedReach: 480 },
    ],
    metrics: {
      reach: 0,
      responseRate: 0,
      conversionRate: 0,
      revenue: 0,
      appointments: 0,
    },
    createdAt: "2026-03-05T14:00:00Z",
    updatedAt: "2026-03-07T10:00:00Z",
    scheduledAt: "2026-03-20T09:00:00Z",
    marketingLibraryTemplateId: "tpl-library-008",
  },
  {
    id: "camp-006",
    name: "Winter Service Package",
    status: "completed",
    type: "seasonal-promotion",
    audienceSegments: [
      {
        id: "seg-6",
        field: "Vehicle Type",
        operator: "in",
        value: "SUV, Truck",
      },
    ],
    audienceSize: 2100,
    trigger: {
      type: "seasonal",
      isRecurring: false,
      config: { season: "winter" },
    },
    messages: [
      {
        subject: "Winter-ready your ride",
        body: "Prepare for winter with our comprehensive service package.",
        channel: "email",
      },
    ],
    channels: [
      { channel: "email", isEnabled: true, estimatedReach: 1950 },
      { channel: "sms", isEnabled: true, estimatedReach: 1800 },
    ],
    metrics: {
      reach: 3420,
      responseRate: 22.1,
      conversionRate: 8.4,
      revenue: 67200,
      appointments: 287,
    },
    createdAt: "2025-10-01T10:00:00Z",
    updatedAt: "2026-01-15T10:00:00Z",
    launchedAt: "2025-11-01T09:00:00Z",
    completedAt: "2026-01-15T00:00:00Z",
    marketingLibraryTemplateId: "tpl-library-006",
  },
  {
    id: "camp-007",
    name: "Q4 Oil Change Reminder",
    status: "completed",
    type: "oil-change",
    audienceSegments: [
      {
        id: "seg-7",
        field: "Last Oil Change",
        operator: "more than",
        value: "5000 miles ago",
      },
    ],
    audienceSize: 890,
    trigger: {
      type: "mileage",
      isRecurring: true,
      config: { intervalMiles: 5000 },
    },
    messages: [
      {
        body: "Time for an oil change! Book your $39.99 oil change special today.",
        channel: "sms",
      },
    ],
    channels: [{ channel: "sms", isEnabled: true, estimatedReach: 820 }],
    metrics: {
      reach: 1650,
      responseRate: 31.2,
      conversionRate: 11.3,
      revenue: 31400,
      appointments: 186,
    },
    createdAt: "2025-09-15T10:00:00Z",
    updatedAt: "2025-12-31T10:00:00Z",
    launchedAt: "2025-10-01T09:00:00Z",
    completedAt: "2025-12-31T00:00:00Z",
    marketingLibraryTemplateId: "tpl-library-014",
  },
  {
    id: "camp-008",
    name: "Holiday Sales Event",
    status: "completed",
    type: "custom",
    audienceSegments: [
      {
        id: "seg-8",
        field: "Customer Tier",
        operator: "in",
        value: "Gold, Platinum",
      },
    ],
    audienceSize: 2450,
    trigger: {
      type: "time-based",
      isRecurring: false,
      config: { startDate: "2025-12-15" },
    },
    messages: [
      {
        subject: "Exclusive holiday deals just for you",
        body: "As a valued customer, enjoy exclusive end-of-year pricing on new and certified pre-owned vehicles.",
        channel: "email",
      },
      {
        body: "Holiday exclusive: Special pricing on new & CPO vehicles. See offers now.",
        channel: "sms",
      },
    ],
    channels: [
      { channel: "email", isEnabled: true, estimatedReach: 2300 },
      { channel: "sms", isEnabled: true, estimatedReach: 2100 },
      { channel: "push", isEnabled: true, estimatedReach: 1800 },
      { channel: "in-app", isEnabled: true, estimatedReach: 1200 },
    ],
    metrics: {
      reach: 4820,
      responseRate: 18.6,
      conversionRate: 5.2,
      revenue: 124000,
      appointments: 312,
    },
    createdAt: "2025-11-20T10:00:00Z",
    updatedAt: "2026-01-05T10:00:00Z",
    launchedAt: "2025-12-15T09:00:00Z",
    completedAt: "2026-01-05T00:00:00Z",
  },
  {
    id: "camp-009",
    name: "Summer Road Trip Prep",
    status: "draft",
    type: "custom",
    audienceSegments: [],
    audienceSize: 0,
    trigger: {
      type: "seasonal",
      isRecurring: false,
      config: {},
    },
    messages: [],
    channels: [],
    metrics: {
      reach: 0,
      responseRate: 0,
      conversionRate: 0,
      revenue: 0,
      appointments: 0,
    },
    createdAt: "2026-03-08T15:00:00Z",
    updatedAt: "2026-03-08T15:00:00Z",
    marketingLibraryTemplateId: "tpl-library-023",
  },
  {
    id: "camp-010",
    name: "Extended Warranty Offer",
    status: "paused",
    type: "warranty-expiration",
    audienceSegments: [
      {
        id: "seg-10",
        field: "Vehicle Age",
        operator: "between",
        value: "3-5 years",
      },
    ],
    audienceSize: 735,
    trigger: {
      type: "time-based",
      isRecurring: false,
      config: { daysBeforeExpiry: 90 },
    },
    messages: [
      {
        subject: "Protect your vehicle with extended coverage",
        body: "Your factory warranty is ending soon. Lock in extended coverage at today's rates.",
        channel: "email",
      },
      {
        body: "Warranty ending soon? Extend your coverage and save. Reply INFO for details.",
        channel: "sms",
      },
    ],
    channels: [
      { channel: "email", isEnabled: true, estimatedReach: 700 },
      { channel: "sms", isEnabled: true, estimatedReach: 650 },
    ],
    metrics: {
      reach: 482,
      responseRate: 15.8,
      conversionRate: 4.1,
      revenue: 8900,
      appointments: 20,
    },
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-02T10:00:00Z",
    launchedAt: "2026-02-15T09:00:00Z",
    marketingLibraryTemplateId: "tpl-library-008",
  },
];

// ---------------------------------------------------------------------------
// Campaign Templates
// ---------------------------------------------------------------------------

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "tpl-001",
    marketingLibraryTemplateId: "tpl-library-001",
    name: "New Owner Onboarding",
    description:
      "Welcome new vehicle purchasers and drive first-service bookings.",
    category: "new-owner",
    defaults: {
      audienceSegments: [
        {
          id: "tpl-seg-1",
          field: "Purchase Date",
          operator: "within",
          value: "30 days",
        },
      ],
      trigger: {
        type: "time-based",
        isRecurring: false,
        config: { delayDays: 1 },
      },
      messages: [
        {
          subject: "Welcome to {{dealership_name}} — your service team",
          body: "Hi {{customer_name}}, I'm {{service_director_name}}, your service director at {{dealership_name}}. Congratulations on your new {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} {{vehicle_trim}}. If you have any questions, save my contact and reach out anytime.",
          channel: "sms",
          delayDays: 1,
        },
        {
          body: "Hi {{customer_name}}, hope you're doing well and enjoying your new {{vehicle_model}}. If anything comes up, we're here for you.",
          channel: "sms",
          delayDays: 7,
        },
        {
          body: "Hi {{customer_name}}, we wanted to check in. If you have any questions or want to make sure your {{vehicle_model}} is running great, stop by {{dealership_name}} or give us a call. We're here to help.",
          channel: "sms",
          delayDays: 30,
        },
      ],
      channels: [
        { channel: "email", isEnabled: true, estimatedReach: 320 },
        { channel: "sms", isEnabled: true, estimatedReach: 290 },
      ],
    },
  },
  {
    id: "tpl-002",
    marketingLibraryTemplateId: "tpl-library-004",
    name: "Service Reminder",
    description:
      "Automated reminders for upcoming scheduled service intervals.",
    category: "service-reminder",
    defaults: {
      trigger: {
        type: "mileage",
        isRecurring: true,
        config: { intervalMiles: 5000 },
      },
      messages: [
        {
          subject: "Your {{vehicle_model}} service is due",
          body: "Hi {{customer_name}}, your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} is approaching its next scheduled service at {{mileage}} miles.\n\nStaying on schedule keeps your vehicle running smoothly and protects your warranty. Our certified technicians are ready to help.\n\nBook your appointment today and keep your vehicle in peak condition!",
          channel: "sms",
        },
        {
          body: "Hi {{customer_name}}, quick reminder: your {{vehicle_model}} is due for service. Book at {{dealership_name}} and save 15% when you schedule this week. Reply YES to confirm.",
          channel: "sms",
          delayDays: 7,
        },
      ],
      channels: [
        { channel: "sms", isEnabled: true, estimatedReach: 395 },
        { channel: "push", isEnabled: true, estimatedReach: 310 },
      ],
    },
  },
  {
    id: "tpl-003",
    marketingLibraryTemplateId: "tpl-library-010",
    name: "Lease Renewal",
    description:
      "Re-engage lessees approaching end of term with renewal or purchase options.",
    category: "lease-renewal",
    defaults: {
      audienceSegments: [
        {
          id: "tpl-seg-3",
          field: "Lease End Date",
          operator: "within",
          value: "90 days",
        },
      ],
      trigger: {
        type: "time-based",
        isRecurring: false,
        config: { daysBeforeExpiry: 90 },
      },
      messages: [
        {
          subject: "Your lease is ending soon — options for your {{vehicle_model}}",
          body: "Hi {{customer_name}}, your lease on your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} is ending soon. We'd love to help you choose your next step: renew your lease, purchase this vehicle, or find a new one.\n\nSchedule a quick conversation with our team to explore your options and any current incentives.",
          channel: "email",
        },
        {
          subject: "60 days left on your lease — let's talk",
          body: "Hi {{customer_name}}, your lease ends in about 60 days. Have you thought about your next vehicle? We have special lease-end offers and trade-in values for your {{vehicle_model}}. Reply OPTIONS to learn more.",
          channel: "email",
          delayDays: 30,
        },
        {
          body: "Hi {{customer_name}}, your lease on your {{vehicle_model}} is up in ~30 days. Reply RENEW to extend, TRADE for a new vehicle, or call us to discuss. {{dealership_name}}",
          channel: "sms",
          delayDays: 60,
        },
      ],
      channels: [
        { channel: "email", isEnabled: true, estimatedReach: 380 },
        { channel: "sms", isEnabled: true, estimatedReach: 310 },
      ],
    },
  },
  {
    id: "tpl-004",
    marketingLibraryTemplateId: "tpl-library-011",
    name: "Vehicle Trade-In",
    description:
      "Reach owners with equity or older vehicles to drive trade-in and sales.",
    category: "vehicle-trade-in",
    defaults: {
      audienceSegments: [
        {
          id: "tpl-seg-4",
          field: "Vehicle Age",
          operator: "greater than",
          value: "5 years",
        },
      ],
      trigger: {
        type: "time-based",
        isRecurring: false,
        config: { delayDays: 1 },
      },
      messages: [
        {
          subject: "Get more for your {{vehicle_model}} — trade-in value has never been better",
          body: "Hi {{customer_name}}, the value of your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} may be higher than you think. Get a free, no-obligation trade-in quote and see how much you could put toward your next vehicle.\n\nReply TRADE to get your personalized estimate or stop by {{dealership_name}} for a quick appraisal.",
          channel: "sms",
        },
        {
          body: "Hi {{customer_name}}, still thinking about trading your {{vehicle_model}}? Our offer is valid for 7 more days. Reply TRADE for your updated quote or visit {{dealership_name}}.",
          channel: "sms",
          delayDays: 7,
        },
      ],
      channels: [
        { channel: "sms", isEnabled: true, estimatedReach: 520 },
        { channel: "email", isEnabled: true, estimatedReach: 680 },
      ],
    },
  },
  {
    id: "tpl-005",
    marketingLibraryTemplateId: "tpl-library-008",
    name: "Warranty Expiration",
    description:
      "Notify owners before factory warranty expires to upsell extended plans.",
    category: "warranty-expiration",
    defaults: {
      audienceSegments: [
        {
          id: "tpl-seg-5",
          field: "Warranty End Date",
          operator: "within",
          value: "60 days",
        },
      ],
      trigger: {
        type: "time-based",
        isRecurring: false,
        config: { daysBeforeExpiry: 60 },
      },
      messages: [
        {
          subject: "Your {{vehicle_model}} warranty expires soon",
          body: "Hi {{customer_name}}, your factory warranty on your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}} is expiring soon. Don't let unexpected repair costs catch you off guard.\n\nExplore our extended protection plans to keep your vehicle covered. Plans start at affordable monthly rates with comprehensive coverage.\n\nLearn more about your protection options today!",
          channel: "email",
          delayDays: 60,
        },
        {
          subject: "30 days left — extend your {{vehicle_model}} warranty",
          body: "Hi {{customer_name}}, your warranty expires in about 30 days. Lock in extended coverage at today's rates. Reply EXTEND for a quote or visit {{dealership_name}}.",
          channel: "email",
          delayDays: 30,
        },
      ],
      channels: [
        { channel: "email", isEnabled: true, estimatedReach: 540 },
        { channel: "sms", isEnabled: true, estimatedReach: 480 },
      ],
    },
  },
  {
    id: "tpl-006",
    marketingLibraryTemplateId: "tpl-library-007",
    name: "Recall",
    description:
      "Notify affected owners about safety or compliance recalls and schedule repairs.",
    category: "recall",
    defaults: {
      audienceSegments: [
        {
          id: "tpl-seg-6",
          field: "Open Recall",
          operator: "equals",
          value: "Yes",
        },
      ],
      trigger: {
        type: "time-based",
        isRecurring: false,
        config: { delayDays: 1 },
      },
      messages: [
        {
          subject: "Important: recall notice for your {{vehicle_model}}",
          body: "Hi {{customer_name}}, there is an open recall on your {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}. Your safety is our priority — we'll perform the repair at no cost to you.\n\nPlease schedule an appointment at {{dealership_name}} at your earliest convenience. Reply RECALL to book or call us directly.",
          channel: "email",
        },
        {
          subject: "Reminder: schedule your recall repair",
          body: "Hi {{customer_name}}, we still have an open recall on your {{vehicle_model}}. The repair is free. Reply RECALL to book or call {{dealership_name}}.",
          channel: "email",
          delayDays: 14,
        },
      ],
      channels: [
        { channel: "email", isEnabled: true, estimatedReach: 420 },
        { channel: "sms", isEnabled: true, estimatedReach: 390 },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Exclusion rules (who does NOT receive the campaign)
// ---------------------------------------------------------------------------

export interface ExclusionFieldDef {
  id: string;
  label: string;
  operators: string[];
  /** e.g. ["7", "14", "30"] for days; ["SMS", "Email", "Marketing"] for opt-out */
  options?: string[];
  valueLabel?: string;
}

export const EXCLUSION_FIELD_DEFS: ExclusionFieldDef[] = [
  { id: "contacted_in_last", label: "Contacted in last", operators: ["within"], options: ["7", "14", "30"], valueLabel: "days" },
  { id: "has_appointment", label: "Has scheduled appointment", operators: ["equals"], options: ["Yes"] },
  { id: "opted_out_sms", label: "Opted out of SMS", operators: ["equals"], options: ["Yes"] },
  { id: "opted_out_email", label: "Opted out of Email", operators: ["equals"], options: ["Yes"] },
  { id: "opted_out_marketing", label: "Opted out of marketing", operators: ["equals"], options: ["Yes"] },
  { id: "in_active_campaign", label: "In active campaign", operators: ["equals"], options: ["Yes"] },
];

// ---------------------------------------------------------------------------
// Win-back and at-risk segment presets
// ---------------------------------------------------------------------------

export interface WinbackPreset {
  id: string;
  label: string;
  description: string;
  segments: AudienceSegment[];
}

export const WINBACK_AT_RISK_PRESETS: WinbackPreset[] = [
  {
    id: "winback-12",
    label: "12+ months inactive + defected",
    description:
      "Customers with no service visit in the last 12 months who have defected to a competitor",
    segments: [
      { id: "wb12-1", field: "Days Since Last Service", operator: "greater than", value: "365" },
      { id: "wb12-2", field: "Competitor Service Defection", operator: "equals", value: "Yes" },
    ],
  },
  {
    id: "recent-defection-30",
    label: "Recent defections 30 days",
    description:
      "Customers showing a competitor service defection in the last 30 days",
    segments: [
      { id: "rd30-1", field: "Competitor Service Defection", operator: "equals", value: "Yes" },
      { id: "rd30-2", field: "Days Since Competitor Visit", operator: "less than", value: "30" },
    ],
  },
  {
    id: "cp-decline-winback",
    label: "Customer-pay decline follow-up",
    description:
      "Customers who declined recommended work recently and may shop other dealerships",
    segments: [
      { id: "cpd-1", field: "Declined Recommended Work", operator: "equals", value: "Yes" },
      { id: "cpd-2", field: "Days Since Last Service", operator: "less than", value: "30" },
    ],
  },
  {
    id: "winback-18",
    label: "No visit 18+ months",
    description: "Customers with no service visit in the last 18 months",
    segments: [
      { id: "wb18-1", field: "Days Since Last Service", operator: "greater than", value: "540" },
    ],
  },
  {
    id: "winback-24",
    label: "No visit 24+ months",
    description: "Customers with no service visit in the last 24 months",
    segments: [
      { id: "wb24-1", field: "Days Since Last Service", operator: "greater than", value: "720" },
    ],
  },
  {
    id: "atrisk-recall-only",
    label: "Last visit recall-only",
    description: "Last service was for recall only (low loyalty signal)",
    segments: [
      { id: "ar1-1", field: "Last Visit Type", operator: "equals", value: "Recall" },
    ],
  },
  {
    id: "atrisk-high-mileage",
    label: "High mileage, no recent service",
    description: "High mileage with no service in 6+ months",
    segments: [
      { id: "ar2-1", field: "Mileage Since Last Service", operator: "greater than", value: "7500" },
      { id: "ar2-2", field: "Days Since Last Service", operator: "greater than", value: "180" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Smart recommendations (for dashboard carousel)
// ---------------------------------------------------------------------------

export type RecommendationOpportunity = "high" | "medium" | "low";

export interface CampaignRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedReach: number;
  estimatedRevenue: number;
  opportunity: RecommendationOpportunity;
  /** Optional template id to pre-fill wizard */
  templateId?: string;
  /** Optional preset id to apply audience */
  presetId?: string;
}

export const CAMPAIGN_RECOMMENDATIONS: CampaignRecommendation[] = [
  {
    id: "rec-1",
    title: "30K Mile Service Push",
    description: "420 vehicles approaching 30,000-mile service interval",
    estimatedReach: 420,
    estimatedRevenue: 18500,
    opportunity: "high",
  },
  {
    id: "rec-2",
    title: "Recent Defections: Past 30 Days",
    description:
      "64 customers showed very recent competitor service defections in the last 30 days",
    estimatedReach: 64,
    estimatedRevenue: 9600,
    opportunity: "high",
    presetId: "recent-defection-30",
  },
  {
    id: "rec-3",
    title: "Customer-Pay Decline Win-Back",
    description:
      "91 recent service customers declined add-on work and may be shopping other dealerships",
    estimatedReach: 91,
    estimatedRevenue: 7400,
    opportunity: "medium",
    presetId: "cp-decline-winback",
  },
  {
    id: "rec-4",
    title: "Win-Back: 12+ Months Inactive + Defected",
    description:
      "118 customers have been gone 12+ months and have already defected to a competitor dealership",
    estimatedReach: 118,
    estimatedRevenue: 15200,
    opportunity: "high",
    presetId: "winback-12",
  },
  {
    id: "rec-5",
    title: "EV Battery Health Alert",
    description: "85 EVs/hybrids with declining battery health",
    estimatedReach: 85,
    estimatedRevenue: 6200,
    opportunity: "medium",
  },
];

/**
 * Legacy featured suggestion (e.g. tests or older flows). Smart Marketing **Monitor**
 * uses per-competitor win-back drafts from `buildWinBackCampaignRecommendation` in
 * `@/lib/marketing/service-defection-mock`.
 */
export const MONITOR_SERVICE_CAMPAIGN_RECOMMENDATION: CampaignRecommendation = {
  id: "rec-monitor-service",
  title: "Service-due & recall outreach",
  description:
    "47 vehicles are due for service and 12 have safety recalls — coordinate one campaign to book bays and close recall work.",
  estimatedReach: 59,
  estimatedRevenue: 22400,
  opportunity: "high",
  templateId: "tpl-002",
};

// ---------------------------------------------------------------------------
// Send time and capacity
// ---------------------------------------------------------------------------

export interface SendTimeWindow {
  id: string;
  label: string;
  startHour: number;
  endHour: number;
}

export const RECOMMENDED_SEND_WINDOWS: SendTimeWindow[] = [
  { id: "morning", label: "9:00 AM – 12:00 PM", startHour: 9, endHour: 12 },
  { id: "midday", label: "10:00 AM – 2:00 PM", startHour: 10, endHour: 14 },
  { id: "afternoon", label: "2:00 PM – 5:00 PM", startHour: 14, endHour: 17 },
  { id: "full-day", label: "9:00 AM – 5:00 PM", startHour: 9, endHour: 17 },
];

/** Mock: returns capacity hint (e.g. based on day of week). For MVP, returns static "normal". */
export function getCapacityHint(): CapacityHint {
  const day = new Date().getDay();
  if (day === 0 || day === 6) return "low";
  if (day === 1 || day === 5) return "high";
  return "normal";
}

// ---------------------------------------------------------------------------
// Campaign Type Labels
// ---------------------------------------------------------------------------

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  "service-reminder": "Service Reminder",
  "new-owner": "New Owner Onboarding",
  "oil-change": "Oil Change",
  "battery-health": "Battery Health",
  "warranty-expiration": "Warranty Expiration",
  "seasonal-promotion": "Seasonal Promotion",
  "lease-renewal": "Lease Renewal",
  "vehicle-trade-in": "Vehicle Trade-In",
  "recall": "Recall",
  custom: "Custom",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getCampaignById(id: string): Campaign | undefined {
  return MOCK_CAMPAIGNS.find((c) => c.id === id);
}

export function computeDashboardMetrics(
  campaigns: Campaign[]
): DashboardMetrics {
  const CHANNEL_OPEN_RATE_BASELINES: Record<Channel, number> = {
    sms: 97,
    email: 34,
    push: 58,
    "in-app": 49,
  };

  function estimatedOpenRateForCampaign(campaign: Campaign): number {
    if (typeof campaign.metrics.openRate === "number") {
      return campaign.metrics.openRate;
    }

    const enabledChannels = campaign.channels.filter((channel) => channel.isEnabled);
    if (enabledChannels.length === 0) {
      return 0;
    }

    const weightedTotal = enabledChannels.reduce(
      (sum, channel) =>
        sum + channel.estimatedReach * CHANNEL_OPEN_RATE_BASELINES[channel.channel],
      0
    );
    const totalEstimatedReach = enabledChannels.reduce(
      (sum, channel) => sum + channel.estimatedReach,
      0
    );

    return totalEstimatedReach > 0 ? weightedTotal / totalEstimatedReach : 0;
  }

  const activeCampaigns = campaigns.filter(
    (c) => c.status === "active"
  ).length;

  const campaignsWithMetrics = campaigns.filter(
    (c) => c.status !== "draft" && c.metrics.reach > 0
  );
  const totalWeightedReach = campaignsWithMetrics.reduce(
    (sum, campaign) => sum + campaign.metrics.reach,
    0
  );
  const avgConversionRate =
    totalWeightedReach > 0
      ? campaignsWithMetrics.reduce(
          (sum, campaign) =>
            sum + campaign.metrics.conversionRate * campaign.metrics.reach,
          0
        ) / totalWeightedReach
      : 0;
  const avgResponseRate =
    totalWeightedReach > 0
      ? campaignsWithMetrics.reduce(
          (sum, campaign) =>
            sum + campaign.metrics.responseRate * campaign.metrics.reach,
          0
        ) / totalWeightedReach
      : 0;
  const avgOpenRate =
    totalWeightedReach > 0
      ? campaignsWithMetrics.reduce(
          (sum, campaign) =>
            sum + estimatedOpenRateForCampaign(campaign) * campaign.metrics.reach,
          0
        ) / totalWeightedReach
      : 0;

  const totalReached = campaigns.reduce((sum, c) => sum + c.metrics.reach, 0);
  const totalRevenue = campaigns.reduce(
    (sum, c) => sum + c.metrics.revenue,
    0
  );
  const estimatedSpend = Math.max(totalReached * 4.25, 1);
  const roiMultiple = totalRevenue / estimatedSpend;
  // Mock: +12% vs last month for dashboard storytelling
  const revenueTrendPercent = 12;

  return {
    activeCampaigns,
    avgConversionRate,
    avgOpenRate,
    avgResponseRate,
    totalReached,
    totalRevenue,
    roiMultiple,
    revenueTrendPercent,
  };
}

// ---------------------------------------------------------------------------
// Wizard-specific data: segment fields, trigger metadata, channel metadata
// ---------------------------------------------------------------------------

export interface SegmentFieldDef {
  id: string;
  label: string;
  category: string;
  operators: string[];
  options?: string[];
  unit?: string;
}

export const SEGMENT_FIELD_DEFS: SegmentFieldDef[] = [
  { id: "vehicle_make", label: "Make", category: "Vehicle Attributes", operators: ["equals", "is one of"], options: VEHICLE_MAKES },
  { id: "vehicle_model", label: "Model", category: "Vehicle Attributes", operators: ["equals", "is one of"] },
  { id: "vehicle_year", label: "Year", category: "Vehicle Attributes", operators: ["equals", "greater than", "less than", "between"] },
  { id: "fuel_type", label: "Fuel Type", category: "Vehicle Attributes", operators: ["equals", "is one of"], options: ["Gas", "Hybrid", "EV", "Diesel", "Plug-in Hybrid"] },
  { id: "purchase_type", label: "Purchase Type", category: "Customer Attributes", operators: ["equals", "is one of"], options: ["New", "Used", "Certified Pre-Owned"] },
  { id: "service_visits", label: "Service Visits", category: "Customer Attributes", operators: ["equals", "greater than", "less than"] },
  { id: "loyalty_tier", label: "Loyalty Tier", category: "Customer Attributes", operators: ["equals", "is one of"], options: ["Bronze", "Silver", "Gold", "Platinum"] },
  { id: "battery_health", label: "Battery Health", category: "Vehicle Telemetry", operators: ["greater than", "less than", "between"], unit: "%" },
  { id: "dtc_codes", label: "Diagnostic Trouble Codes", category: "Vehicle Telemetry", operators: ["contains", "equals"] },
  { id: "inactive_days", label: "Vehicle Inactive Days", category: "Vehicle Telemetry", operators: ["greater than", "less than"], unit: "days" },
  { id: "proximity_miles", label: "Distance from Dealership", category: "Vehicle Telemetry", operators: ["less than", "greater than"], unit: "miles" },
  { id: "competitor_service_defection", label: "Competitor Service Defection", category: "Vehicle Telemetry", operators: ["equals"], options: ["Yes", "No"] },
  { id: "days_since_competitor_visit", label: "Days Since Competitor Visit", category: "Vehicle Telemetry", operators: ["greater than", "less than", "between"], unit: "days" },
  { id: "mileage_since_service", label: "Mileage Since Last Service", category: "Service Lifecycle", operators: ["greater than", "less than", "between"], unit: "miles" },
  { id: "days_since_service", label: "Days Since Last Service", category: "Service Lifecycle", operators: ["greater than", "less than", "between"], unit: "days" },
  { id: "declined_recommended_work", label: "Declined Recommended Work", category: "Service Lifecycle", operators: ["equals"], options: ["Yes", "No"] },
  { id: "oem_interval_status", label: "OEM Service Interval Status", category: "Service Lifecycle", operators: ["equals"], options: ["Due", "Overdue", "Upcoming", "Current"] },
];

export const SEGMENT_CATEGORIES = [...new Set(SEGMENT_FIELD_DEFS.map((f) => f.category))];

export const TRIGGER_TYPE_META: Record<
  CampaignTrigger["type"],
  { label: string; description: string }
> = {
  "time-based": { label: "Time-Based", description: "Trigger at specific time intervals (e.g., days after purchase, service due dates)" },
  mileage: { label: "Mileage Threshold", description: "Trigger when vehicle reaches a mileage milestone (e.g., 30k, 60k miles)" },
  diagnostic: { label: "Diagnostic Code", description: "Trigger when diagnostic trouble codes are detected on the vehicle" },
  health: { label: "Battery Health", description: "Trigger based on battery health metrics (e.g., battery health below 40%)" },
  proximity: { label: "Proximity", description: "Trigger when a vehicle enters the dealership geofence area" },
  seasonal: { label: "Seasonal", description: "Trigger based on seasonal calendar events (e.g., winter prep, summer road trip)" },
};

const CONSENT_RATIO = 0.85;

export const CHANNEL_META: Record<
  Channel,
  { label: string; description: string; baseReach: number; baseReachWithConsent: number }
> = {
  sms: { label: "SMS", description: "Text messages with 98% open rate", baseReach: 920, baseReachWithConsent: Math.round(920 * CONSENT_RATIO) },
  email: { label: "Email", description: "Rich HTML emails with images and links", baseReach: 1450, baseReachWithConsent: Math.round(1450 * CONSENT_RATIO) },
  push: { label: "Push Notification", description: "Mobile app push notifications", baseReach: 680, baseReachWithConsent: Math.round(680 * CONSENT_RATIO) },
  "in-app": { label: "In-App Message", description: "Messages shown inside the dealership app", baseReach: 420, baseReachWithConsent: Math.round(420 * CONSENT_RATIO) },
};

export const PERSONALIZATION_VARIABLES = [
  "customer_name",
  "vehicle_model",
  "vehicle_year",
  "vehicle_make",
  "vehicle_trim",
  "mileage",
  "next_service_due",
  "battery_health",
  "last_service_date",
  "dealership_name",
  "service_director_name",
] as const;

export const PERSONALIZATION_VARIABLE_LABELS: Record<string, string> = {
  customer_name: "Customer Name",
  vehicle_model: "Vehicle Model",
  vehicle_year: "Vehicle Year",
  vehicle_make: "Vehicle Make",
  vehicle_trim: "Vehicle Trim",
  mileage: "Current Mileage",
  next_service_due: "Next Service Due",
  battery_health: "Battery Health %",
  last_service_date: "Last Service Date",
  dealership_name: "Dealership Name",
  service_director_name: "Service Director Name",
};
