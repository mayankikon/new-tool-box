"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Pause, Play, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DropdownButton } from "@/components/ui/dropdown-button";
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { CampaignOverviewV2 } from "./detail/campaign-overview-v2";
import { CampaignAnalyticsV2 } from "./detail/campaign-analytics-v2";
import { CampaignAudienceViewV2 } from "./detail/campaign-audience-view-v2";
import { CampaignMessageViewV2 } from "./detail/campaign-message-view-v2";
import { CampaignDetailSkeletonV2 } from "./campaign-detail-skeleton-v2";
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

interface CampaignDetailV2Props {
  campaign: Campaign;
  onBack: () => void;
}

export function CampaignDetailV2({ campaign, onBack }: CampaignDetailV2Props) {
  const [isLoading, setIsLoading] = useState(true);
  const isActive = campaign.status === "active";
  const isPaused = campaign.status === "paused";

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [campaign.id]);

  if (isLoading) {
    return <CampaignDetailSkeletonV2 />;
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
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
            <DropdownButton
              label="Actions"
              variant="secondary"
              size="sm"
              align="end"
            >
              {(isActive || isPaused) && (
                <DropdownMenuItem>
                  {isActive ? <Pause /> : <Play />}
                  {isActive ? "Pause" : "Resume"}
                </DropdownMenuItem>
              )}
              {campaign.status !== "completed" && (
                <DropdownMenuItem>
                  <Pencil />
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownButton>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          View and manage this campaign
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-4">
        <Tabs defaultValue={0}>
          <TabsList variant="line">
            <TabsTrigger value={0}>Overview</TabsTrigger>
            <TabsTrigger value={1}>Analytics</TabsTrigger>
            <TabsTrigger value={2}>Audience</TabsTrigger>
            <TabsTrigger value={3}>Message</TabsTrigger>
          </TabsList>

          <TabsContent value={0}>
            <CampaignOverviewV2 campaign={campaign} />
          </TabsContent>

          <TabsContent value={1}>
            <CampaignAnalyticsV2 campaign={campaign} />
          </TabsContent>

          <TabsContent value={2}>
            <CampaignAudienceViewV2
              segments={campaign.audienceSegments}
              audienceSize={campaign.audienceSize}
            />
          </TabsContent>

          <TabsContent value={3}>
            <CampaignMessageViewV2
              messages={campaign.messages}
              channels={campaign.channels}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
