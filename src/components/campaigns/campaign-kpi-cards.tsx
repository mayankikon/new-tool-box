import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetrics } from "@/lib/campaigns/types";
import { cn } from "@/lib/utils";
import { Target, TrendingUp, Users, DollarSign, ArrowUpRight } from "lucide-react";

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

interface KpiCardDef {
  key: keyof DashboardMetrics;
  label: string;
  icon: typeof Target;
  format: (value: number) => string;
  /** Icon container and icon color: bg-* and text-* classes */
  iconClass: string;
}

const KPI_CARDS: KpiCardDef[] = [
  {
    key: "totalRevenue",
    label: "Revenue Generated",
    icon: DollarSign,
    format: formatCurrency,
    iconClass: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400",
  },
  {
    key: "activeCampaigns",
    label: "Active Campaigns",
    icon: Target,
    format: (v) => v.toString(),
    iconClass: "bg-blue-500/12 text-blue-700 dark:text-blue-400",
  },
  {
    key: "avgConversionRate",
    label: "Conversion Rate",
    icon: TrendingUp,
    format: (v) => `${v.toFixed(1)}%`,
    iconClass: "bg-amber-500/12 text-amber-700 dark:text-amber-400",
  },
  {
    key: "totalReached",
    label: "People Reached",
    icon: Users,
    format: formatCompactNumber,
    iconClass: "bg-violet-500/12 text-violet-700 dark:text-violet-400",
  },
];

const CARD_CLASS =
  "border border-border bg-white ring-0 shadow-none dark:bg-card";

interface CampaignKpiCardsProps {
  metrics: DashboardMetrics;
}

export function CampaignKpiCards({ metrics }: CampaignKpiCardsProps) {
  const trend = metrics.revenueTrendPercent;
  const trendLabel =
    trend !== undefined
      ? `${trend >= 0 ? "+" : ""}${trend}% vs last month`
      : null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {KPI_CARDS.map(({ key, label, icon: Icon, format, iconClass }) => {
        const isRevenue = key === "totalRevenue";
        return (
          <Card
            key={key}
            size="sm"
            className={cn(CARD_CLASS, "flex flex-col justify-center py-0")}
          >
            <CardContent className="flex items-center gap-3 py-0.5">
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-md",
                  isRevenue ? "size-10" : "size-9",
                  iconClass
                )}
              >
                <Icon className={isRevenue ? "size-5" : "size-4"} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-base font-semibold leading-tight">
                  {format(metrics[key] as number)}
                </p>
                {isRevenue && trendLabel && (
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="size-3" />
                    {trendLabel}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
