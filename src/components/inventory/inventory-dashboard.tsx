"use client";

import { CalendarDays, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { TitleBar } from "@/components/app/title-bar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  InventoryDonutCard,
  InventoryKpiCard,
  InventoryStatusCard,
  inventoryDashboardShowcaseWidgetSettings,
} from "@/components/inventory/inventory-dashboard-widgets";
import { InventoryAgingOverviewCard } from "@/components/inventory/lot-age-widgets";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  inventoryDashboardData,
  type InventoryDashboardData,
} from "@/lib/inventory/dashboard-data";
import { DASHBOARD_CHROME_SURFACE_CLASS } from "@/lib/ui/dashboard-chrome-surface";

type DashboardMonthKey =
  | "2026-03"
  | "2026-02"
  | "2026-01"
  | "2025-12"
  | "2025-11";

const DASHBOARD_MONTHS = [
  { value: "2026-03", label: "March 2026" },
  { value: "2026-02", label: "February 2026" },
  { value: "2026-01", label: "January 2026" },
  { value: "2025-12", label: "December 2025" },
  { value: "2025-11", label: "November 2025" },
] as const;

const DASHBOARD_MONTH_BUTTON_SHELL =
  "inline-flex items-center overflow-hidden rounded-sm border border-[#DADADB] bg-white text-foreground shadow-sm dark:border-border dark:bg-secondary dark:text-secondary-foreground";

const DASHBOARD_MONTH_VARIANTS: Record<
  DashboardMonthKey,
  {
    kpis: string[];
    gpsPairingRate: number;
    gpsSegments: [number, number, number];
    keyPairingRate: number;
    keySegments: [number, number, number];
    vehicleInventoryTotal: string;
    vehicleInventorySlices: [number, number, number, number, number];
    offLotTotal: string;
    offLotSlices: [number, number, number];
    lotAgeCounts: [number, number, number];
    lotAgeFooter: string;
    vehicleAgeRisk: string;
  }
> = {
  "2026-03": {
    kpis: ["17", "23", "14", "8"],
    gpsPairingRate: 92,
    gpsSegments: [814, 37, 851],
    keyPairingRate: 63,
    keySegments: [537, 314, 851],
    vehicleInventoryTotal: "845",
    vehicleInventorySlices: [371, 254, 175, 36, 11],
    offLotTotal: "44",
    offLotSlices: [23, 11, 742],
    lotAgeCounts: [89, 34, 27],
    lotAgeFooter: "Inventory aging slight increase in the last 7 days",
    vehicleAgeRisk: "Est. holding cost risk: $8,800",
  },
  "2026-02": {
    kpis: ["20", "21", "16", "11"],
    gpsPairingRate: 90,
    gpsSegments: [786, 51, 837],
    keyPairingRate: 61,
    keySegments: [511, 326, 837],
    vehicleInventoryTotal: "828",
    vehicleInventorySlices: [358, 246, 170, 39, 15],
    offLotTotal: "51",
    offLotSlices: [27, 14, 717],
    lotAgeCounts: [84, 38, 31],
    lotAgeFooter: "Older inventory climbed during February closeout",
    vehicleAgeRisk: "Est. holding cost risk: $9,600",
  },
  "2026-01": {
    kpis: ["15", "18", "12", "7"],
    gpsPairingRate: 93,
    gpsSegments: [801, 28, 829],
    keyPairingRate: 66,
    keySegments: [547, 282, 829],
    vehicleInventoryTotal: "812",
    vehicleInventorySlices: [346, 241, 162, 41, 22],
    offLotTotal: "39",
    offLotSlices: [18, 9, 729],
    lotAgeCounts: [92, 30, 24],
    lotAgeFooter: "January refreshed the front half of the lot",
    vehicleAgeRisk: "Est. holding cost risk: $7,900",
  },
  "2025-12": {
    kpis: ["22", "27", "19", "10"],
    gpsPairingRate: 88,
    gpsSegments: [769, 101, 870],
    keyPairingRate: 59,
    keySegments: [513, 357, 870],
    vehicleInventoryTotal: "867",
    vehicleInventorySlices: [382, 258, 179, 34, 14],
    offLotTotal: "57",
    offLotSlices: [31, 16, 744],
    lotAgeCounts: [78, 41, 35],
    lotAgeFooter: "Year-end traffic pushed more units into aged status",
    vehicleAgeRisk: "Est. holding cost risk: $10,400",
  },
  "2025-11": {
    kpis: ["19", "24", "17", "9"],
    gpsPairingRate: 89,
    gpsSegments: [755, 89, 844],
    keyPairingRate: 60,
    keySegments: [506, 338, 844],
    vehicleInventoryTotal: "854",
    vehicleInventorySlices: [374, 249, 181, 32, 18],
    offLotTotal: "48",
    offLotSlices: [24, 12, 736],
    lotAgeCounts: [81, 39, 32],
    lotAgeFooter: "Pre-holiday demand tightened the fresh inventory mix",
    vehicleAgeRisk: "Est. holding cost risk: $9,900",
  },
};

function buildDashboardMonthData(month: DashboardMonthKey): InventoryDashboardData {
  const variant = DASHBOARD_MONTH_VARIANTS[month];
  const base = inventoryDashboardData;

  return {
    ...base,
    kpis: base.kpis.map((metric, index) => ({
      ...metric,
      value: variant.kpis[index] ?? metric.value,
    })),
    statusCards: [
      {
        ...base.statusCards[0],
        value: variant.gpsPairingRate,
        valueLabel: `${variant.gpsPairingRate}%`,
        segments: [
          {
            ...base.statusCards[0].segments[0],
            value: variant.gpsSegments[0],
          },
          {
            ...base.statusCards[0].segments[1],
            value: variant.gpsSegments[1],
          },
          {
            ...base.statusCards[0].segments[2],
            value: variant.gpsSegments[2],
          },
        ],
      },
      {
        ...base.statusCards[1],
        value: variant.keyPairingRate,
        valueLabel: `${variant.keyPairingRate}%`,
        segments: [
          {
            ...base.statusCards[1].segments[0],
            value: variant.keySegments[0],
          },
          {
            ...base.statusCards[1].segments[1],
            value: variant.keySegments[1],
          },
          {
            ...base.statusCards[1].segments[2],
            value: variant.keySegments[2],
          },
        ],
      },
    ],
    inventoryBreakdown: {
      ...base.inventoryBreakdown,
      centerValue: variant.vehicleInventoryTotal,
      slices: base.inventoryBreakdown.slices.map((slice, index) => ({
        ...slice,
        value: variant.vehicleInventorySlices[index] ?? slice.value,
      })),
    },
    lotUtilization: {
      ...base.lotUtilization,
      centerValue: variant.offLotTotal,
      slices: base.lotUtilization.slices.map((slice, index) => ({
        ...slice,
        value: variant.offLotSlices[index] ?? slice.value,
      })),
    },
    lotAgeTiers: {
      ...base.lotAgeTiers,
      tiers: base.lotAgeTiers.tiers.map((tier, index) => ({
        ...tier,
        count: variant.lotAgeCounts[index] ?? tier.count,
      })),
      footerMessage: variant.lotAgeFooter,
    },
    vehicleAgeDistribution: {
      ...base.vehicleAgeDistribution,
      nextWindowHoldingRiskLabel: variant.vehicleAgeRisk,
    },
  };
}

function monthKeyToDate(month: DashboardMonthKey): Date {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1, 1);
}

export function InventoryDashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<DashboardMonthKey>("2026-03");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const dashboardData = useMemo(
    () => buildDashboardMonthData(selectedMonth),
    [selectedMonth],
  );
  const selectedMonthDate = monthKeyToDate(selectedMonth);
  const currentMonthLabel =
    DASHBOARD_MONTHS.find((month) => month.value === selectedMonth)?.label ??
    "Select month";

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-auto">
      <div className="flex w-full flex-col px-8 pb-10 pt-10">
        <div className="w-full">
          <TitleBar
            title="Dashboard"
            className="min-h-[52px] gap-0 px-0 pt-0 pb-0"
            right={
              <>
                <div className={DASHBOARD_MONTH_BUTTON_SHELL}>
                  <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
                    <PopoverTrigger
                      type="button"
                      aria-label="Choose month"
                      className="inline-flex h-9 min-w-0 max-w-[220px] shrink items-center justify-center gap-1.5 px-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-[var(--theme-background-button-secondary-hover)]"
                    >
                      <CalendarDays className="size-4 shrink-0" />
                      <span className="truncate">{currentMonthLabel}</span>
                    </PopoverTrigger>
                    <PopoverContent
                      align="end"
                      side="bottom"
                      sideOffset={6}
                      collisionPadding={12}
                      collisionAvoidance={{ side: "flip", align: "shift" }}
                      className="w-auto max-w-[min(100vw-1.5rem,280px)] rounded-[var(--radius-Card-sm,8px)] border-0 bg-card p-0 shadow-[0px_0px_0px_1px_var(--border),0px_12px_12px_-6px_rgba(0,0,0,0.04),0px_6px_6px_-3px_rgba(0,0,0,0.04),0px_3px_3px_-1.5px_rgba(0,0,0,0.04),0px_1px_1px_-0.5px_rgba(0,0,0,0.04),inset_0px_-1px_0px_0px_var(--input)] ring-0"
                    >
                      <Calendar
                        mode="single"
                        selected={selectedMonthDate}
                        defaultMonth={selectedMonthDate}
                        onSelect={(date) => {
                          if (!date) return;
                          const monthKey = `${date.getFullYear()}-${String(
                            date.getMonth() + 1,
                          ).padStart(2, "0")}` as DashboardMonthKey;
                          if (
                            DASHBOARD_MONTHS.some((month) => month.value === monthKey)
                          ) {
                            setSelectedMonth(monthKey);
                            setIsMonthPickerOpen(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button size="header" leadingIcon={<Download />}>
                  Export CSV
                </Button>
              </>
            }
          />
        </div>
        <div className="grid gap-4 pt-4 xl:grid-cols-4">
          {dashboardData.kpis.map((metric) => (
            <InventoryKpiCard
              key={metric.label}
              metric={metric}
              settings={inventoryDashboardShowcaseWidgetSettings}
              className={DASHBOARD_CHROME_SURFACE_CLASS}
            />
          ))}
        </div>

        <div className="grid gap-4 pt-4 xl:grid-cols-2">
          {dashboardData.statusCards.map((metric) => (
            <InventoryStatusCard
              key={metric.title}
              metric={metric}
              settings={inventoryDashboardShowcaseWidgetSettings}
              className={DASHBOARD_CHROME_SURFACE_CLASS}
            />
          ))}
        </div>

        <div className="grid gap-4 pt-4 xl:grid-cols-2">
          <InventoryDonutCard
            metric={dashboardData.inventoryBreakdown}
            settings={inventoryDashboardShowcaseWidgetSettings}
            className={DASHBOARD_CHROME_SURFACE_CLASS}
          />
          <InventoryDonutCard
            metric={dashboardData.lotUtilization}
            settings={inventoryDashboardShowcaseWidgetSettings}
            className={DASHBOARD_CHROME_SURFACE_CLASS}
          />
        </div>

        <div className="grid gap-4 pt-4 xl:grid-cols-2">
          <div className="min-w-0">
            <InventoryAgingOverviewCard
              lotAge={dashboardData.lotAgeTiers}
              vehicleAge={dashboardData.vehicleAgeDistribution}
              settings={inventoryDashboardShowcaseWidgetSettings}
              className={DASHBOARD_CHROME_SURFACE_CLASS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
