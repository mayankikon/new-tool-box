"use client";

import { useState, useMemo, useEffect } from "react";

import { CampaignKpiCards } from "@/components/campaigns/campaign-kpi-cards";
import { CampaignSuggestionCard } from "@/components/campaigns/campaign-suggestion-card";
import { SuggestedCampaignTicker } from "@/components/campaigns/suggested-campaigns-ticker";
import { CampaignTable } from "@/components/campaigns/campaign-table";
import { CampaignDashboardSkeleton } from "@/components/campaigns/campaign-dashboard-skeleton";
import { CampaignEmptyState } from "@/components/campaigns/campaign-empty-state";
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
  type LucideIcon,
} from "lucide-react";

const RECOMMENDATION_ICON_BY_ID: Record<string, LucideIcon> = {
  "rec-1": Gauge,
  "rec-2": Sparkles,
  "rec-3": Shield,
  "rec-4": Sparkles,
  "rec-5": Gauge,
};

interface CampaignDashboardProps {
  /** When provided, used for table and metrics; otherwise MOCK_CAMPAIGNS. */
  campaigns?: Campaign[];
  onCreateCampaign?: () => void;
  onViewCampaign?: (campaignId: string) => void;
}
export function CampaignDashboard({
  campaigns: campaignsProp,
  onCreateCampaign,
  onViewCampaign,
}: CampaignDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);

  const campaigns = campaignsProp ?? MOCK_CAMPAIGNS;
  const metrics = useMemo(
    () => computeDashboardMetrics(campaigns),
    [campaigns],
  );

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
      <section>
        <CampaignKpiCards metrics={metrics} />
      </section>

      {/* Section: Suggested Campaigns (carousel) */}
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
            <CampaignSuggestionCard
              suggestion={suggestion}
              icon={RECOMMENDATION_ICON_BY_ID[suggestion.id] ?? Sparkles}
              onCreateCampaign={() => onCreateCampaign?.()}
              settings={{
                appearance: {
                  buttonVariant: "secondary",
                },
              }}
            />
          )}
        />
      </section>

      <section>
        <CampaignTable campaigns={campaigns} onViewCampaign={onViewCampaign} />
      </section>
    </div>
  );
}
