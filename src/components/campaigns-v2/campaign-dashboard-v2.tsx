"use client";

import { useState, useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SuggestedCampaignTicker } from "@/components/campaigns/suggested-campaigns-ticker";
import { CampaignKpiCardsV2 } from "@/components/campaigns-v2/campaign-kpi-cards-v2";
import { CampaignTableV2 } from "@/components/campaigns-v2/campaign-table-v2";
import { CampaignDashboardSkeletonV2 } from "@/components/campaigns-v2/campaign-dashboard-skeleton-v2";
import { CampaignEmptyStateV2 } from "@/components/campaigns-v2/campaign-empty-state-v2";
import {
  MOCK_CAMPAIGNS,
  CAMPAIGN_RECOMMENDATIONS,
  computeDashboardMetrics,
} from "@/lib/campaigns/mock-data";
import type { Campaign } from "@/lib/campaigns/types";
import {
  Gauge,
  Shield,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const RECOMMENDATION_ICON_BY_ID: Record<string, LucideIcon> = {
  "rec-1": Gauge,
  "rec-2": Sparkles,
  "rec-3": Shield,
  "rec-4": Sparkles,
  "rec-5": Gauge,
};

function formatCurrency(value: number): string {
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

interface CampaignDashboardV2Props {
  campaigns?: Campaign[];
  onCreateCampaign?: () => void;
  onViewCampaign?: (campaignId: string) => void;
}

export function CampaignDashboardV2({
  campaigns: campaignsProp,
  onCreateCampaign,
  onViewCampaign,
}: CampaignDashboardV2Props) {
  const [isLoading, setIsLoading] = useState(true);

  const campaigns = campaignsProp ?? MOCK_CAMPAIGNS;
  const metrics = useMemo(
    () => computeDashboardMetrics(campaigns),
    [campaigns]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <CampaignDashboardSkeletonV2 />;
  }

  if (campaigns.length === 0) {
    return (
      <CampaignEmptyStateV2
        onCreateCampaign={() => onCreateCampaign?.()}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-8 py-6">
      <section className="space-y-4">
        <h2 className="font-headline text-base font-semibold text-foreground">
          Campaign Performance
        </h2>
        <CampaignKpiCardsV2 metrics={metrics} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-headline text-base font-medium text-foreground">
              Suggested Campaigns
            </h2>
            <span className="text-sm text-muted-foreground">
              AI Insights · Based on connected vehicle data
            </span>
          </div>
        </div>
        <SuggestedCampaignTicker
          items={CAMPAIGN_RECOMMENDATIONS}
          getItemKey={(suggestion) => suggestion.id}
          ariaLabel="Suggested campaigns ticker"
          renderItem={(suggestion) => (
            <Card className="min-w-[300px] max-w-[300px] shrink-0 border border-border bg-card shadow-sm">
              <CardContent className="flex flex-col gap-4 py-2">
                <div className="flex items-start gap-2">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-xs)] bg-primary/10">
                    {(RECOMMENDATION_ICON_BY_ID[suggestion.id] ?? Sparkles)({
                      className: "size-5 text-primary",
                    })}
                  </div>
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
                    {formatCurrency(suggestion.estimatedRevenue)} est.
                    revenue
                  </span>
                  <span className="text-muted-foreground">
                    {formatCompactNumber(suggestion.estimatedReach)}{" "}
                    audience
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
          )}
        />
      </section>

      <section>
        <CampaignTableV2
          campaigns={campaigns}
          onViewCampaign={onViewCampaign}
        />
      </section>
    </div>
  );
}
