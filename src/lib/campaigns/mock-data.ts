import type {
  Campaign,
  CampaignTemplate,
  CampaignTrigger,
  CampaignType,
  Channel,
  DashboardMetrics,
} from "./types";
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
  },
];

// ---------------------------------------------------------------------------
// Campaign Templates
// ---------------------------------------------------------------------------

export const CAMPAIGN_TEMPLATES: CampaignTemplate[] = [
  {
    id: "tpl-001",
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
        config: { delayDays: 3 },
      },
      messages: [
        {
          subject: "Welcome to the {{dealership_name}} family!",
          body: "Hi {{customer_name}}, congratulations on your new {{vehicle_year}} {{vehicle_make}} {{vehicle_model}}! We're excited to have you as part of our family.\n\nAs a valued customer, you're eligible for a complimentary first service. Our certified technicians will ensure your new vehicle is performing at its best.\n\nSchedule your complimentary first service today!",
          channel: "email",
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
      ],
      channels: [
        { channel: "sms", isEnabled: true, estimatedReach: 395 },
        { channel: "push", isEnabled: true, estimatedReach: 310 },
      ],
    },
  },
  {
    id: "tpl-003",
    name: "Oil Change Reminder",
    description:
      "Target customers approaching their next oil change interval.",
    category: "oil-change",
    defaults: {
      audienceSegments: [
        {
          id: "tpl-seg-3",
          field: "Last Oil Change",
          operator: "more than",
          value: "5000 miles ago",
        },
      ],
      trigger: {
        type: "mileage",
        isRecurring: true,
        config: { intervalMiles: 5000 },
      },
      messages: [
        {
          subject: "Time for an oil change, {{customer_name}}",
          body: "Hi {{customer_name}}, it's been a while since your last oil change. Your {{vehicle_year}} {{vehicle_model}} is due for fresh oil to keep your engine protected and running smoothly.\n\nDon't wait — regular oil changes extend your engine's life and improve fuel efficiency.\n\nSchedule your oil change today and get a free multi-point inspection!",
          channel: "sms",
        },
      ],
      channels: [
        { channel: "sms", isEnabled: true, estimatedReach: 820 },
        { channel: "email", isEnabled: true, estimatedReach: 1450 },
      ],
    },
  },
  {
    id: "tpl-004",
    name: "Battery Health Alert",
    description:
      "Proactively reach owners with declining battery diagnostics.",
    category: "battery-health",
    defaults: {
      trigger: {
        type: "diagnostic",
        isRecurring: true,
        config: { healthThreshold: 40 },
      },
      messages: [
        {
          subject: "Battery alert for your {{vehicle_model}}",
          body: "Hi {{customer_name}}, our diagnostics show that your {{vehicle_year}} {{vehicle_model}}'s battery health has dropped to {{battery_health}}%. A declining battery can leave you stranded.\n\nWe recommend scheduling a free battery inspection at your earliest convenience. Our technicians can test your battery and recommend the best course of action.\n\nBook your free battery inspection today!",
          channel: "email",
        },
      ],
      channels: [
        { channel: "sms", isEnabled: true, estimatedReach: 160 },
        { channel: "email", isEnabled: true, estimatedReach: 170 },
        { channel: "push", isEnabled: true, estimatedReach: 120 },
      ],
    },
  },
  {
    id: "tpl-005",
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
    name: "Seasonal Promotion",
    description:
      "Time-limited seasonal offers tied to weather or calendar events.",
    category: "seasonal-promotion",
    defaults: {
      trigger: {
        type: "seasonal",
        isRecurring: false,
        config: {},
      },
      messages: [
        {
          subject: "Spring savings for your {{vehicle_model}}",
          body: "Hi {{customer_name}}, spring is here and it's the perfect time to get your {{vehicle_year}} {{vehicle_model}} ready for the season ahead!\n\nTake advantage of our limited-time spring service special:\n• Tire rotation — $29.99\n• A/C system check — complimentary\n• Multi-point inspection — included\n\nDon't miss out — book your spring service appointment today!",
          channel: "email",
        },
      ],
      channels: [
        { channel: "email", isEnabled: true, estimatedReach: 1180 },
        { channel: "sms", isEnabled: true, estimatedReach: 1050 },
        { channel: "push", isEnabled: true, estimatedReach: 680 },
      ],
    },
  },
];

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
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "active"
  ).length;

  const campaignsWithMetrics = campaigns.filter(
    (c) => c.status !== "draft" && c.metrics.reach > 0
  );
  const avgConversionRate =
    campaignsWithMetrics.length > 0
      ? campaignsWithMetrics.reduce(
          (sum, c) => sum + c.metrics.conversionRate,
          0
        ) / campaignsWithMetrics.length
      : 0;

  const totalReached = campaigns.reduce((sum, c) => sum + c.metrics.reach, 0);
  const totalRevenue = campaigns.reduce(
    (sum, c) => sum + c.metrics.revenue,
    0
  );
  // Mock: +12% vs last month for dashboard storytelling
  const revenueTrendPercent = 12;

  return {
    activeCampaigns,
    avgConversionRate,
    totalReached,
    totalRevenue,
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
  { id: "mileage_since_service", label: "Mileage Since Last Service", category: "Service Lifecycle", operators: ["greater than", "less than", "between"], unit: "miles" },
  { id: "days_since_service", label: "Days Since Last Service", category: "Service Lifecycle", operators: ["greater than", "less than", "between"], unit: "days" },
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
  health: { label: "Vehicle Health", description: "Trigger based on vehicle health metrics (e.g., battery health below 40%)" },
  proximity: { label: "Proximity", description: "Trigger when a vehicle enters the dealership geofence area" },
  seasonal: { label: "Seasonal", description: "Trigger based on seasonal calendar events (e.g., winter prep, summer road trip)" },
};

export const CHANNEL_META: Record<
  Channel,
  { label: string; description: string; baseReach: number }
> = {
  sms: { label: "SMS", description: "Text messages with 98% open rate", baseReach: 920 },
  email: { label: "Email", description: "Rich HTML emails with images and links", baseReach: 1450 },
  push: { label: "Push Notification", description: "Mobile app push notifications", baseReach: 680 },
  "in-app": { label: "In-App Message", description: "Messages shown inside the dealership app", baseReach: 420 },
};

export const PERSONALIZATION_VARIABLES = [
  "customer_name",
  "vehicle_model",
  "vehicle_year",
  "vehicle_make",
  "mileage",
  "next_service_due",
  "battery_health",
  "last_service_date",
  "dealership_name",
] as const;

export const PERSONALIZATION_VARIABLE_LABELS: Record<string, string> = {
  customer_name: "Customer Name",
  vehicle_model: "Vehicle Model",
  vehicle_year: "Vehicle Year",
  vehicle_make: "Vehicle Make",
  mileage: "Current Mileage",
  next_service_due: "Next Service Due",
  battery_health: "Battery Health %",
  last_service_date: "Last Service Date",
  dealership_name: "Dealership Name",
};
