export type AudienceStatus =
  | "due"
  | "active"
  | "defection-risk"
  | "open-recall"
  | "ownership-change"
  | "geographically-relocated";

export interface MarketingAudienceRow {
  id: string;
  customerName: string;
  vehicleStatus: AudienceStatus;
  retentionScore: number;
}

export type MarketingAudienceSortKey =
  | "customerName"
  | "vehicleStatus"
  | "retentionScore";

export const MARKETING_AUDIENCE_TAB_VALUES = [
  "all-services",
  "due",
  "active",
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
  "all-services": "All Services",
  due: "Due",
  active: "Active",
  "defection-risk": "Defection Risk",
  "open-recall": "Open Recall",
  "ownership-change": "Ownership Change",
  "geographically-relocated": "Geographically Relocated",
};

export const AUDIENCE_STATUS_LABELS: Record<AudienceStatus, string> = {
  due: "Due",
  active: "Active",
  "defection-risk": "Defection Risk",
  "open-recall": "Open Recall",
  "ownership-change": "Ownership Change",
  "geographically-relocated": "Geographically Relocated",
};

export const MARKETING_AUDIENCE_TAB_FILTER: Record<
  MarketingAudienceTabValue,
  (row: MarketingAudienceRow) => boolean
> = {
  "all-services": () => true,
  due: (row) => row.vehicleStatus === "due",
  active: (row) => row.vehicleStatus === "active",
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
    vehicleStatus: "due",
    retentionScore: 77,
  },
  {
    id: "aud-2",
    customerName: "Emma Thompson",
    vehicleStatus: "active",
    retentionScore: 92,
  },
  {
    id: "aud-3",
    customerName: "Benjamin Foster",
    vehicleStatus: "defection-risk",
    retentionScore: 36,
  },
  {
    id: "aud-4",
    customerName: "Harper Butler",
    vehicleStatus: "open-recall",
    retentionScore: 44,
  },
  {
    id: "aud-5",
    customerName: "Liam Garcia",
    vehicleStatus: "ownership-change",
    retentionScore: 61,
  },
  {
    id: "aud-6",
    customerName: "Ava Martinez",
    vehicleStatus: "geographically-relocated",
    retentionScore: 29,
  },
  {
    id: "aud-7",
    customerName: "Ethan Davis",
    vehicleStatus: "due",
    retentionScore: 70,
  },
  {
    id: "aud-8",
    customerName: "Chloe Hall",
    vehicleStatus: "active",
    retentionScore: 88,
  },
  {
    id: "aud-9",
    customerName: "James Taylor",
    vehicleStatus: "defection-risk",
    retentionScore: 42,
  },
  {
    id: "aud-10",
    customerName: "Charlotte Anderson",
    vehicleStatus: "open-recall",
    retentionScore: 48,
  },
  {
    id: "aud-11",
    customerName: "Oliver Thomas",
    vehicleStatus: "ownership-change",
    retentionScore: 58,
  },
  {
    id: "aud-12",
    customerName: "Amelia White",
    vehicleStatus: "geographically-relocated",
    retentionScore: 31,
  },
];

export function vehicleStatusLabel(status: AudienceStatus): string {
  return AUDIENCE_STATUS_LABELS[status];
}

export function compareMarketingAudienceValues(
  left: MarketingAudienceRow,
  right: MarketingAudienceRow,
  sortKey: MarketingAudienceSortKey,
  direction: "asc" | "desc",
): number {
  const multiplier = direction === "asc" ? 1 : -1;

  if (sortKey === "retentionScore") {
    return (left.retentionScore - right.retentionScore) * multiplier;
  }

  if (sortKey === "vehicleStatus") {
    return (
      vehicleStatusLabel(left.vehicleStatus).localeCompare(
        vehicleStatusLabel(right.vehicleStatus),
      ) * multiplier
    );
  }

  return left.customerName.localeCompare(right.customerName) * multiplier;
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
      vehicleStatusLabel(row.vehicleStatus).toLowerCase().includes(normalizedQuery)
    );
  });
}

export function serializeMarketingAudienceRowsToCsv(
  rows: MarketingAudienceRow[],
): string {
  const header = ["Customer Name", "Vehicle Status", "Retention Score"];
  const body = rows.map((row) =>
    [
      row.customerName,
      vehicleStatusLabel(row.vehicleStatus),
      String(row.retentionScore),
    ]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(","),
  );

  return [header.join(","), ...body].join("\n");
}
