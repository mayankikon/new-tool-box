export type InventoryDashboardIcon =
  | "battery-warning"
  | "radio-off"
  | "signal-warning"
  | "pending-registration"
  | "gps-device"
  | "key-device"
  | "vehicle-inventory"
  | "lot-utilization"
  | "devices-sold";

export interface InventoryDashboardKpi {
  label: string;
  value: string;
  icon: InventoryDashboardIcon;
}

export interface InventoryMetricSlice {
  label: string;
  value: number;
  color: string;
}

export interface InventoryStatusMetric {
  title: string;
  icon: InventoryDashboardIcon;
  value: number;
  valueLabel: string;
  subtitle: string;
  segments: InventoryMetricSlice[];
}

export interface InventoryDonutMetric {
  title: string;
  icon: InventoryDashboardIcon;
  centerLabel: string;
  centerValue: string;
  slices: InventoryMetricSlice[];
}

export interface InventoryPeriodMetric {
  label: string;
  total: string;
  slices: InventoryMetricSlice[];
}

export interface InventoryDevicesSoldTableColumn {
  key: string;
  label: string;
}

export interface InventoryDevicesSoldTableRow {
  label: string;
  kind: "breakdown" | "total" | "penRate";
  color?: string;
  values: Array<number | string | null>;
}

/** Lot age tier colors (fresh / moderate / aged) for inventory aging widgets. */
export const lotAgeTierColors = {
  fresh: "#2D8A75",
  moderate: "#F5A623",
  aged: "#E74C3C",
} as const;

export type LotAgeTierKey = keyof typeof lotAgeTierColors;

export interface LotAgeTierSummary {
  tier: LotAgeTierKey;
  label: string;
  dayRangeLabel: string;
  count: number;
  trendLabel: string;
}

/** One point on the stacked area timeline (counts per tier). */
export interface LotAgeSeriesPoint {
  /** Short x-axis label, e.g. "90d ago" */
  label: string;
  fresh: number;
  moderate: number;
  aged: number;
}

export interface LotAgeTiersWidgetData {
  title: string;
  subtitle: string;
  tiers: LotAgeTierSummary[];
  series: LotAgeSeriesPoint[];
  footerMessage: string;
  ctaLabel: string;
}

export interface VehicleAgeHistogramBin {
  daysStart: number;
  daysEnd: number;
  count: number;
  /** Optional taller “baseline” cap for a faint background bar */
  baselineCap?: number;
}

export interface VehicleAgeTierStat {
  tier: LotAgeTierKey;
  label: string;
  dayRangeLabel: string;
  percentLabel: string;
  weekDeltaLabel: string;
  holdingCostLabel?: string;
}

export interface VehicleNearAged {
  year: number;
  make: string;
  model: string;
  daysOnLot: number;
}

export interface VehicleAgeDistributionWidgetData {
  title: string;
  subtitle: string;
  bins: VehicleAgeHistogramBin[];
  tierStats: VehicleAgeTierStat[];
  nextDaysWindow: number;
  nextWindowVehicleCount: number;
  nextWindowMessage: string;
  nextWindowHoldingRiskLabel: string;
  nearAgedVehicles: VehicleNearAged[];
}

export interface InventoryDashboardData {
  kpis: InventoryDashboardKpi[];
  statusCards: InventoryStatusMetric[];
  inventoryBreakdown: InventoryDonutMetric;
  lotUtilization: InventoryDonutMetric;
  lotAgeTiers: LotAgeTiersWidgetData;
  vehicleAgeDistribution: VehicleAgeDistributionWidgetData;
  devicesSold: {
    title: string;
    icon: InventoryDashboardIcon;
    periods: InventoryPeriodMetric[];
    tableColumns: InventoryDevicesSoldTableColumn[];
    tableRows: InventoryDevicesSoldTableRow[];
  };
}

export const inventoryDashboardData: InventoryDashboardData = {
  kpis: [
    { label: "Low Battery", value: "17", icon: "battery-warning" },
    { label: "Non Reporting", value: "23", icon: "radio-off" },
    { label: "Installation Exception", value: "14", icon: "signal-warning" },
    { label: "Pending Registration", value: "8", icon: "pending-registration" },
  ],
  statusCards: [
    {
      title: "GPS Device Pairing Status",
      icon: "gps-device",
      value: 92,
      valueLabel: "92%",
      subtitle: "Install Rate",
      segments: [
        { label: "Paired", value: 814, color: "var(--chart-1)" },
        { label: "Unpaired", value: 37, color: "rgba(39,39,42,0.12)" },
        { label: "Total", value: 858, color: "transparent" },
      ],
    },
    {
      title: "Key Device Pairing Status",
      icon: "key-device",
      value: 63,
      valueLabel: "63%",
      subtitle: "Install Rate",
      segments: [
        { label: "Paired", value: 814, color: "var(--chart-2)" },
        { label: "Unpaired", value: 37, color: "rgba(39,39,42,0.12)" },
        { label: "Total", value: 858, color: "transparent" },
      ],
    },
  ],
  inventoryBreakdown: {
    title: "Vehicle Inventory",
    icon: "vehicle-inventory",
    centerLabel: "Total Vehicles",
    centerValue: "845",
    slices: [
      { label: "New", value: 371, color: "var(--chart-1)" },
      { label: "Pre-Owned", value: 254, color: "var(--chart-5)" },
      { label: "Certified", value: 175, color: "var(--chart-3)" },
      { label: "BVA", value: 36, color: "var(--chart-2)" },
      { label: "Loaner", value: 11, color: "var(--chart-4)" },
    ],
  },
  lotUtilization: {
    title: "Off-Lots",
    icon: "lot-utilization",
    centerLabel: "Total Off-Lots",
    centerValue: "44",
    slices: [
      { label: "Off-Lot for >24 hr", value: 23, color: "var(--chart-4)" },
      { label: "Off-Lot for <24 hr", value: 11, color: "var(--chart-3)" },
      { label: "On-Lot", value: 742, color: "var(--chart-1)" },
    ],
  },
  lotAgeTiers: {
    title: "Lot Age Tiers",
    subtitle: "Inventory by days on lot",
    tiers: [
      {
        tier: "fresh",
        label: "Fresh",
        dayRangeLabel: "0–45 days",
        count: 89,
        trendLabel: "Up 5 in the last 7 days",
      },
      {
        tier: "moderate",
        label: "Moderate",
        dayRangeLabel: "46–90 days",
        count: 34,
        trendLabel: "Down 3 in the last 7 days",
      },
      {
        tier: "aged",
        label: "Aged",
        dayRangeLabel: "91+ days",
        count: 27,
        trendLabel: "Up 4 in the last 7 days",
      },
    ],
    series: [
      { label: "180d+", fresh: 62, moderate: 28, aged: 18 },
      { label: "150d", fresh: 64, moderate: 30, aged: 19 },
      { label: "120d", fresh: 68, moderate: 31, aged: 21 },
      { label: "90d", fresh: 72, moderate: 32, aged: 22 },
      { label: "75d", fresh: 76, moderate: 33, aged: 23 },
      { label: "60d", fresh: 80, moderate: 33, aged: 24 },
      { label: "45d", fresh: 84, moderate: 34, aged: 25 },
      { label: "30d", fresh: 86, moderate: 34, aged: 26 },
      { label: "21d", fresh: 87, moderate: 34, aged: 26 },
      { label: "14d", fresh: 88, moderate: 34, aged: 27 },
      { label: "7d", fresh: 89, moderate: 34, aged: 27 },
      { label: "Today", fresh: 89, moderate: 34, aged: 27 },
    ],
    footerMessage: "Inventory aging slight increase in the last 7 days",
    ctaLabel: "View Aging Report",
  },
  vehicleAgeDistribution: {
    title: "Vehicle Age Distribution",
    subtitle: "Days on lot — current inventory",
    bins: [
      { daysStart: 0, daysEnd: 15, count: 42, baselineCap: 52 },
      { daysStart: 15, daysEnd: 30, count: 38, baselineCap: 48 },
      { daysStart: 30, daysEnd: 45, count: 36, baselineCap: 46 },
      { daysStart: 45, daysEnd: 60, count: 22, baselineCap: 40 },
      { daysStart: 60, daysEnd: 75, count: 18, baselineCap: 36 },
      { daysStart: 75, daysEnd: 90, count: 14, baselineCap: 32 },
      { daysStart: 90, daysEnd: 105, count: 11, baselineCap: 28 },
      { daysStart: 105, daysEnd: 120, count: 9, baselineCap: 26 },
      { daysStart: 120, daysEnd: 150, count: 7, baselineCap: 22 },
    ],
    tierStats: [
      {
        tier: "fresh",
        label: "Fresh",
        dayRangeLabel: "0–45 days",
        percentLabel: "58%",
        weekDeltaLabel: "+5 this week",
      },
      {
        tier: "moderate",
        label: "Moderate",
        dayRangeLabel: "46–90 days",
        percentLabel: "22%",
        weekDeltaLabel: "−3 this week",
      },
      {
        tier: "aged",
        label: "Aged",
        dayRangeLabel: "91+ days",
        percentLabel: "18%",
        weekDeltaLabel: "Holding cost: $13,600",
      },
    ],
    nextDaysWindow: 15,
    nextWindowVehicleCount: 12,
    nextWindowMessage: "Vehicles moving to Aged category",
    nextWindowHoldingRiskLabel: "Est. holding cost risk: $8,800",
    nearAgedVehicles: [
      { year: 2021, make: "Toyota", model: "Camry", daysOnLot: 88 },
      { year: 2020, make: "Honda", model: "CR-V", daysOnLot: 87 },
      { year: 2022, make: "Ford", model: "F-150", daysOnLot: 86 },
    ],
  },
  devicesSold: {
    title: "Devices Sold",
    icon: "devices-sold",
    periods: [
      {
        label: "Today",
        total: "45",
        slices: [
          { label: "Installed", value: 22, color: "var(--chart-1)" },
          { label: "Activated", value: 14, color: "var(--chart-5)" },
          { label: "Queued", value: 9, color: "var(--chart-4)" },
        ],
      },
      {
        label: "Week",
        total: "127",
        slices: [
          { label: "Installed", value: 63, color: "var(--chart-1)" },
          { label: "Activated", value: 38, color: "var(--chart-5)" },
          { label: "Queued", value: 26, color: "var(--chart-4)" },
        ],
      },
      {
        label: "Month",
        total: "392",
        slices: [
          { label: "Installed", value: 205, color: "var(--chart-1)" },
          { label: "Activated", value: 109, color: "var(--chart-5)" },
          { label: "Queued", value: 78, color: "var(--chart-4)" },
        ],
      },
      {
        label: "YTD",
        total: "2,863",
        slices: [
          { label: "Installed", value: 1510, color: "var(--chart-1)" },
          { label: "Activated", value: 822, color: "var(--chart-5)" },
          { label: "Queued", value: 531, color: "var(--chart-4)" },
        ],
      },
    ],
    tableColumns: [
      { key: "today", label: "Today" },
      { key: "week", label: "This Week" },
      { key: "month", label: "This Month" },
      { key: "ytd", label: "Year to Date" },
    ],
    tableRows: [
      {
        label: "3 Year",
        kind: "breakdown",
        color: "var(--chart-3)",
        values: [6, 19, 64, 548],
      },
      {
        label: "5 Year",
        kind: "breakdown",
        color: "var(--chart-1)",
        values: [11, 41, 96, 1147],
      },
      {
        label: "7 Years",
        kind: "breakdown",
        color: "var(--chart-4)",
        values: [9, 23, 58, 842],
      },
      {
        label: "Dealer Trades",
        kind: "breakdown",
        color: "var(--chart-5)",
        values: [3, 15, 26, 517],
      },
      {
        label: "No Sales Smart Marketing",
        kind: "breakdown",
        color: "var(--chart-2)",
        values: [10, 39, 79, 1083],
      },
      {
        label: "No Sale",
        kind: "breakdown",
        color: "var(--chart-4)",
        values: [6, 16, 34, 237],
      },
      {
        label: "Total",
        kind: "total",
        values: [45, 153, 357, 4374],
      },
      {
        label: "Pen. Rate",
        kind: "penRate",
        values: [null, null, "74.43%", "71.54%"],
      },
    ],
  },
};
