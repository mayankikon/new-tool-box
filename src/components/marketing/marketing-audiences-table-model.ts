export type AudienceStatus =
  | "due"
  | "defection-risk"
  | "open-recall"
  | "ownership-change"
  | "geographically-relocated";

export type RecallUrgency = "open" | "urgent";

export interface MarketingAudienceRow {
  id: string;
  customerName: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  vehicleStatus: AudienceStatus;
  campaigns: string[];
  milesUntilService?: number;
  defectedDealership?: string;
  recallUrgency?: RecallUrgency;
  transferDate?: string;
  relocatedState?: string;
}

export type MarketingAudienceSortKey =
  | "customerName"
  | "vehicle"
  | "vehicleStatus"
  | "campaigns"
  | "milesUntilService"
  | "defectedDealership"
  | "recallUrgency"
  | "transferDate"
  | "relocatedState";

export const MARKETING_AUDIENCE_TAB_VALUES = [
  "all-services",
  "due",
  "defection-risk",
  "open-recall",
  "ownership-change",
  "geographically-relocated",
] as const;

export type MarketingAudienceTabValue =
  (typeof MARKETING_AUDIENCE_TAB_VALUES)[number];

export const MARKETING_AUDIENCE_TAB_LABELS: Record<
  MarketingAudienceTabValue,
  string
> = {
  "all-services": "All",
  due: "Service Due",
  "defection-risk": "Active Defector",
  "open-recall": "Open Recall",
  "ownership-change": "Ownership Change",
  "geographically-relocated": "Geo. Relocated",
};

export const AUDIENCE_STATUS_LABELS: Record<AudienceStatus, string> = {
  due: "Service Due",
  "defection-risk": "Defection Risk",
  "open-recall": "Open Recall",
  "ownership-change": "Ownership Change",
  "geographically-relocated": "Geo. Relocated",
};

export const MARKETING_AUDIENCE_TAB_FILTER: Record<
  MarketingAudienceTabValue,
  (row: MarketingAudienceRow) => boolean
> = {
  "all-services": () => true,
  due: (row) => row.vehicleStatus === "due",
  "defection-risk": (row) => row.vehicleStatus === "defection-risk",
  "open-recall": (row) => row.vehicleStatus === "open-recall",
  "ownership-change": (row) => row.vehicleStatus === "ownership-change",
  "geographically-relocated": (row) =>
    row.vehicleStatus === "geographically-relocated",
};

export const MARKETING_AUDIENCE_ROWS: MarketingAudienceRow[] = [
  {
    id: "aud-1",
    customerName: "Ryan Parker",
    vehicleYear: 2022,
    vehicleMake: "Toyota",
    vehicleModel: "Camry",
    vehicleStatus: "due",
    campaigns: ["Spring Service Special"],
    milesUntilService: 1200,
  },
  {
    id: "aud-3",
    customerName: "Benjamin Foster",
    vehicleYear: 2023,
    vehicleMake: "Ford",
    vehicleModel: "F-150",
    vehicleStatus: "defection-risk",
    campaigns: ["Win-Back Campaign"],
    defectedDealership: "AutoNation Ford",
  },
  {
    id: "aud-4",
    customerName: "Harper Butler",
    vehicleYear: 2020,
    vehicleMake: "Chevrolet",
    vehicleModel: "Equinox",
    vehicleStatus: "open-recall",
    campaigns: ["Recall Awareness"],
    recallUrgency: "urgent",
  },
  {
    id: "aud-5",
    customerName: "Liam Garcia",
    vehicleYear: 2019,
    vehicleMake: "BMW",
    vehicleModel: "X5",
    vehicleStatus: "ownership-change",
    campaigns: ["Trade-In Bonus", "Loyalty Rewards Q2", "New Owner Intro"],
    transferDate: "2025-12-15",
  },
  {
    id: "aud-6",
    customerName: "Ava Martinez",
    vehicleYear: 2024,
    vehicleMake: "Tesla",
    vehicleModel: "Model 3",
    vehicleStatus: "geographically-relocated",
    campaigns: ["Market Expansion"],
    relocatedState: "TX",
  },
  {
    id: "aud-7",
    customerName: "Ethan Davis",
    vehicleYear: 2021,
    vehicleMake: "Hyundai",
    vehicleModel: "Tucson",
    vehicleStatus: "due",
    campaigns: ["Spring Service Special", "Oil Change Reminder"],
    milesUntilService: 3400,
  },
  {
    id: "aud-9",
    customerName: "James Taylor",
    vehicleYear: 2020,
    vehicleMake: "Jeep",
    vehicleModel: "Grand Cherokee",
    vehicleStatus: "defection-risk",
    campaigns: ["Win-Back Campaign", "Service Recovery"],
    defectedDealership: "Hendrick Chrysler",
  },
  {
    id: "aud-10",
    customerName: "Charlotte Anderson",
    vehicleYear: 2023,
    vehicleMake: "Subaru",
    vehicleModel: "Outback",
    vehicleStatus: "open-recall",
    campaigns: ["Recall Awareness", "Safety First", "Urgent Recall Notice"],
    recallUrgency: "open",
  },
  {
    id: "aud-11",
    customerName: "Oliver Thomas",
    vehicleYear: 2018,
    vehicleMake: "Audi",
    vehicleModel: "Q5",
    vehicleStatus: "ownership-change",
    campaigns: ["New Owner Welcome"],
    transferDate: "2026-01-22",
  },
  {
    id: "aud-12",
    customerName: "Amelia White",
    vehicleYear: 2022,
    vehicleMake: "Mazda",
    vehicleModel: "CX-5",
    vehicleStatus: "geographically-relocated",
    campaigns: ["Market Expansion", "Regional Promo"],
    relocatedState: "FL",
  },
];

export function vehicleStatusLabel(status: AudienceStatus): string {
  return AUDIENCE_STATUS_LABELS[status];
}

export function vehicleLabel(row: MarketingAudienceRow): string {
  return `${row.vehicleYear} ${row.vehicleMake} ${row.vehicleModel}`;
}

export function campaignsLabel(campaigns: string[]): string {
  if (campaigns.length === 0) return "\u2014";
  if (campaigns.length === 1) return campaigns[0];
  return `${campaigns[0]} +${campaigns.length - 1}`;
}

export function compareMarketingAudienceValues(
  left: MarketingAudienceRow,
  right: MarketingAudienceRow,
  sortKey: MarketingAudienceSortKey,
  direction: "asc" | "desc",
): number {
  const multiplier = direction === "asc" ? 1 : -1;

  switch (sortKey) {
    case "vehicle":
      return vehicleLabel(left).localeCompare(vehicleLabel(right)) * multiplier;

    case "vehicleStatus":
      return (
        vehicleStatusLabel(left.vehicleStatus).localeCompare(
          vehicleStatusLabel(right.vehicleStatus),
        ) * multiplier
      );

    case "campaigns":
      return (left.campaigns.length - right.campaigns.length) * multiplier;

    case "milesUntilService":
      return (
        ((left.milesUntilService ?? 0) - (right.milesUntilService ?? 0)) *
        multiplier
      );

    case "defectedDealership":
      return (
        (left.defectedDealership ?? "").localeCompare(
          right.defectedDealership ?? "",
        ) * multiplier
      );

    case "recallUrgency": {
      const urgencyRank: Record<RecallUrgency, number> = {
        urgent: 0,
        open: 1,
      };
      const leftRank = left.recallUrgency
        ? urgencyRank[left.recallUrgency]
        : 2;
      const rightRank = right.recallUrgency
        ? urgencyRank[right.recallUrgency]
        : 2;
      return (leftRank - rightRank) * multiplier;
    }

    case "transferDate":
      return (
        (left.transferDate ?? "").localeCompare(right.transferDate ?? "") *
        multiplier
      );

    case "relocatedState":
      return (
        (left.relocatedState ?? "").localeCompare(right.relocatedState ?? "") *
        multiplier
      );

    default:
      return left.customerName.localeCompare(right.customerName) * multiplier;
  }
}

export function filterMarketingAudienceRows(
  rows: MarketingAudienceRow[],
  tab: MarketingAudienceTabValue,
  query: string,
): MarketingAudienceRow[] {
  const normalizedQuery = query.trim().toLowerCase();
  const tabFilter = MARKETING_AUDIENCE_TAB_FILTER[tab];

  const filteredByTab = rows.filter(tabFilter);
  if (!normalizedQuery) {
    return filteredByTab;
  }

  return filteredByTab.filter((row) => {
    return (
      row.customerName.toLowerCase().includes(normalizedQuery) ||
      vehicleLabel(row).toLowerCase().includes(normalizedQuery) ||
      vehicleStatusLabel(row.vehicleStatus)
        .toLowerCase()
        .includes(normalizedQuery) ||
      row.campaigns.some((c) => c.toLowerCase().includes(normalizedQuery))
    );
  });
}

export function serializeMarketingAudienceRowsToCsv(
  rows: MarketingAudienceRow[],
): string {
  const header = [
    "Customer Name",
    "Vehicle",
    "Status",
    "Campaigns",
    "Miles Until Service",
    "Defected To",
    "Recall Urgency",
    "Date Transferred",
    "Relocated To",
  ];
  const body = rows.map((row) =>
    [
      row.customerName,
      vehicleLabel(row),
      vehicleStatusLabel(row.vehicleStatus),
      row.campaigns.join("; "),
      row.milesUntilService != null ? String(row.milesUntilService) : "",
      row.defectedDealership ?? "",
      row.recallUrgency ?? "",
      row.transferDate ?? "",
      row.relocatedState ?? "",
    ]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(","),
  );

  return [header.join(","), ...body].join("\n");
}
