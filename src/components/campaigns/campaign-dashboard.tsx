"use client";

import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CampaignKpiCards } from "@/components/campaigns/campaign-kpi-cards";
import { CampaignTable } from "@/components/campaigns/campaign-table";
import { CampaignDashboardSkeleton } from "@/components/campaigns/campaign-dashboard-skeleton";
import { CampaignEmptyState } from "@/components/campaigns/campaign-empty-state";
import {
  MOCK_CAMPAIGNS,
  computeDashboardMetrics,
} from "@/lib/campaigns/mock-data";
import { cn } from "@/lib/utils";
import {
  Gauge,
  Battery,
  Shield,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";

interface SuggestedCampaign {
  id: string;
  title: string;
  description: string;
  estimatedRevenue: number;
  estimatedReach: number;
  icon: typeof Gauge;
  opportunity: "high" | "medium" | "low";
}

const SUGGESTED_CAMPAIGNS: SuggestedCampaign[] = [
  {
    id: "sug-1",
    title: "30K Mile Service Push",
    description: "420 vehicles approaching 30,000-mile service interval",
    estimatedRevenue: 18500,
    estimatedReach: 420,
    icon: Gauge,
    opportunity: "high",
  },
  {
    id: "sug-2",
    title: "Battery Health Alert",
    description: "180 vehicles with battery health below 40%",
    estimatedRevenue: 7200,
    estimatedReach: 180,
    icon: Battery,
    opportunity: "medium",
  },
  {
    id: "sug-3",
    title: "Warranty Expiration Notice",
    description: "95 warranties expiring within 60 days",
    estimatedRevenue: 12800,
    estimatedReach: 95,
    icon: Shield,
    opportunity: "high",
  },
];

function formatCurrency(value: number): string {
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

const OPPORTUNITY_STYLES: Record<
  SuggestedCampaign["opportunity"],
  { label: string; className: string }
> = {
  high: {
    label: "High Opportunity",
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  medium: {
    label: "Medium Opportunity",
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  low: {
    label: "Low Opportunity",
    className: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  },
};

interface CampaignDashboardProps {
  onCreateCampaign?: () => void;
  onViewCampaign?: (campaignId: string) => void;
}

export function CampaignDashboard({
  onCreateCampaign,
  onViewCampaign,
}: CampaignDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);

  const metrics = useMemo(() => computeDashboardMetrics(MOCK_CAMPAIGNS), []);
  const campaigns = MOCK_CAMPAIGNS;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <CampaignDashboardSkeleton />;
  }

  if (campaigns.length === 0) {
    return <CampaignEmptyState onCreateCampaign={() => onCreateCampaign?.()} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-8 py-6">
      {/* Page header: title, description, and primary CTA below the top bar */}
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-headline text-2xl font-semibold text-foreground">
            Campaigns
          </h1>
          <Button size="lg" onClick={() => onCreateCampaign?.()}>
            <Plus data-icon="inline-start" />
            Create Campaign
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage and monitor your marketing campaigns
        </p>
      </header>

      {/* Section: Campaign Performance */}
      <section className="space-y-4">
        <h2 className="font-headline text-base font-semibold text-foreground">
          Campaign Performance
        </h2>
        <CampaignKpiCards metrics={metrics} />
      </section>

      {/* Section: Suggested Campaigns (AI Insights) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h2 className="font-headline text-base font-semibold text-foreground">
            Suggested Campaigns
          </h2>
          <span className="text-sm text-muted-foreground">
            AI Insights · Based on connected vehicle data
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {SUGGESTED_CAMPAIGNS.map((suggestion) => {
            const Icon = suggestion.icon;
            const opp = OPPORTUNITY_STYLES[suggestion.opportunity];
            return (
              <Card
                key={suggestion.id}
                size="sm"
                className="border border-border bg-white ring-0 shadow-none dark:bg-card"
              >
                <CardContent className="flex flex-col gap-4 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-medium",
                        opp.className
                      )}
                    >
                      {opp.label}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {suggestion.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="font-semibold text-[var(--theme-text-success)]">
                      {formatCurrency(suggestion.estimatedRevenue)} est. revenue
                    </span>
                    <span className="text-muted-foreground">
                      {formatCompactNumber(suggestion.estimatedReach)} audience
                    </span>
                  </div>
                  <Button
                    className="mt-1 w-fit"
                    size="sm"
                    onClick={() => onCreateCampaign?.()}
                  >
                    Create Campaign
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Section: Campaigns Table */}
      <section className="space-y-4">
        <h2 className="font-headline text-base font-semibold text-foreground">
          Campaigns Table
        </h2>
        <CampaignTable campaigns={campaigns} onViewCampaign={onViewCampaign} />
      </section>
    </div>
  );
}
