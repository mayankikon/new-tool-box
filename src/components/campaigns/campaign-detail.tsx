"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Pause, Play, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CampaignOverview } from "./detail/campaign-overview";
import { CampaignAnalytics } from "./detail/campaign-analytics";
import { CampaignAudienceView } from "./detail/campaign-audience-view";
import { CampaignMessageView } from "./detail/campaign-message-view";
import { CampaignDetailSkeleton } from "./campaign-detail-skeleton";
import type { Campaign, CampaignStatus } from "@/lib/campaigns/types";

const STATUS_BADGE_VARIANT: Record<
  CampaignStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  active: "default",
  scheduled: "secondary",
  draft: "outline",
  completed: "secondary",
  paused: "destructive",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  draft: "Draft",
  completed: "Completed",
  paused: "Paused",
};

interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
}

export function CampaignDetail({ campaign, onBack }: CampaignDetailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const isActive = campaign.status === "active";
  const isPaused = campaign.status === "paused";

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [campaign.id]);

  if (isLoading) {
    return <CampaignDetailSkeleton />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page header: same layout as campaigns list — title + description left, actions right */}
      <header className="flex flex-col gap-1 border-b border-border px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={onBack}>
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="font-headline text-2xl font-semibold text-foreground tracking-tight">
              {campaign.name}
            </h1>
            <Badge variant={STATUS_BADGE_VARIANT[campaign.status]}>
              {STATUS_LABELS[campaign.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {(isActive || isPaused) && (
              <Button variant="outline" size="sm">
                {isActive ? (
                  <Pause className="size-3.5" />
                ) : (
                  <Play className="size-3.5" />
                )}
                {isActive ? "Pause" : "Resume"}
              </Button>
            )}
            {campaign.status !== "completed" && (
              <Button variant="outline" size="sm">
                <Pencil className="size-3.5" />
                Edit
              </Button>
            )}
            <Button variant="destructive" size="sm">
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          View and manage this campaign
        </p>
      </header>

      {/* Tabs section */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <Tabs defaultValue={0}>
          <TabsList variant="line">
            <TabsTrigger value={0}>Overview</TabsTrigger>
            <TabsTrigger value={1}>Analytics</TabsTrigger>
            <TabsTrigger value={2}>Audience</TabsTrigger>
            <TabsTrigger value={3}>Message</TabsTrigger>
          </TabsList>

          <TabsContent value={0}>
            <CampaignOverview campaign={campaign} />
          </TabsContent>

          <TabsContent value={1}>
            <CampaignAnalytics campaign={campaign} />
          </TabsContent>

          <TabsContent value={2}>
            <CampaignAudienceView
              segments={campaign.audienceSegments}
              audienceSize={campaign.audienceSize}
            />
          </TabsContent>

          <TabsContent value={3}>
            <CampaignMessageView
              messages={campaign.messages}
              channels={campaign.channels}
              offers={campaign.offers}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
