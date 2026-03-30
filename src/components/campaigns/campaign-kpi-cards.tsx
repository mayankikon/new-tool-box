import {
  InventoryKpiCard,
  type DashboardKpiMetric,
  inventoryDashboardShowcaseWidgetSettings,
} from "@/components/inventory/inventory-dashboard-widgets";
import { DASHBOARD_CHROME_SURFACE_CLASS } from "@/lib/ui/dashboard-chrome-surface";
import type { DashboardMetrics } from "@/lib/campaigns/types";
import {
  BadgeDollarSign,
  ChartColumnIncreasing,
  MailOpen,
  MessageSquareReply,
} from "lucide-react";

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface KpiCardDef {
  label: string;
  icon: typeof BadgeDollarSign;
  value: (metrics: DashboardMetrics) => string;
  caption?: (metrics: DashboardMetrics) => string | undefined;
}

const KPI_CARDS: KpiCardDef[] = [
  {
    label: "Revenue Generated",
    icon: BadgeDollarSign,
    value: (metrics) => formatCurrency(metrics.totalRevenue),
    caption: (metrics) => `${metrics.roiMultiple.toFixed(1)}x ROI`,
  },
  {
    label: "Open Rate",
    icon: MailOpen,
    value: (metrics) => `${metrics.avgOpenRate.toFixed(1)}%`,
    caption: () => "How many recipients open",
  },
  {
    label: "Response Rate",
    icon: MessageSquareReply,
    value: (metrics) => `${metrics.avgResponseRate.toFixed(1)}%`,
    caption: () => "Replied or engaged",
  },
  {
    label: "Conversion Rate",
    icon: ChartColumnIncreasing,
    value: (metrics) => `${metrics.avgConversionRate.toFixed(1)}%`,
    caption: () => "Booked or converted",
  },
];

interface CampaignKpiCardsProps {
  metrics: DashboardMetrics;
}

export function CampaignKpiCards({ metrics }: CampaignKpiCardsProps) {
  const cards: DashboardKpiMetric[] = KPI_CARDS.map(
    ({ label, icon, value, caption }) => ({
      label,
      value: value(metrics),
      icon,
      caption: caption?.(metrics),
    })
  );

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((metric) => (
        <InventoryKpiCard
          key={metric.label}
          metric={metric}
          settings={inventoryDashboardShowcaseWidgetSettings}
          className={DASHBOARD_CHROME_SURFACE_CLASS}
        />
      ))}
    </div>
  );
}
