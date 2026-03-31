"use client";

import {
  Eye,
  MousePointerClick,
  MessageSquare,
  TrendingUp,
  DollarSign,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProgressBar } from "@/components/ui/progress";
import { InlineTip } from "@/components/ui/inline-tip";
import type { Campaign, Channel } from "@/lib/campaigns/types";

const CHANNEL_LABELS: Record<Channel, string> = {
  sms: "SMS",
  email: "Email",
  push: "Push",
  "in-app": "In-App",
};

interface PerformanceMetricProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

function PerformanceMetric({
  label,
  value,
  icon: Icon,
  trend = "neutral",
  trendValue,
}: PerformanceMetricProps) {
  const trendColorClass =
    trend === "up"
      ? "text-[var(--theme-text-success)]"
      : trend === "down"
        ? "text-[var(--theme-text-destructive)]"
        : "text-muted-foreground";

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-semibold font-headline tracking-tight">
          {value}
        </p>
        {trendValue && (
          <p className={`flex items-center gap-1 text-xs ${trendColorClass}`}>
            {trend === "up" && <TrendingUp className="size-3" />}
            {trend === "down" && (
              <TrendingUp className="size-3 rotate-180" />
            )}
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface CampaignAnalyticsV2Props {
  campaign: Campaign;
}

export function CampaignAnalyticsV2({ campaign }: CampaignAnalyticsV2Props) {
  const { metrics, channels } = campaign;
  const hasMetrics = metrics.reach > 0;
  const enabledChannels = channels.filter((ch) => ch.isEnabled);
  const maxChannelReach = Math.max(
    ...enabledChannels.map((ch) => ch.estimatedReach),
    1
  );

  if (!hasMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <TrendingUp className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-base font-medium">No analytics yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Analytics data will appear here once the campaign has been launched
          and starts collecting engagement data.
        </p>
      </div>
    );
  }

  const openRate = metrics.openRate ?? 0;
  const engagementRate = metrics.engagementRate ?? 0;

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {openRate > 0 && (
          <PerformanceMetric
            label="Open Rate"
            value={`${openRate}%`}
            icon={Eye}
            trend="up"
            trendValue={`${(openRate * 0.08).toFixed(1)}% vs. avg`}
          />
        )}
        {engagementRate > 0 && (
          <PerformanceMetric
            label="Engagement Rate"
            value={`${engagementRate}%`}
            icon={MousePointerClick}
            trend="up"
            trendValue={`${(engagementRate * 0.12).toFixed(1)}% vs. avg`}
          />
        )}
        <PerformanceMetric
          label="Response Rate"
          value={`${metrics.responseRate}%`}
          icon={MessageSquare}
          trend="up"
          trendValue={`${(metrics.responseRate * 0.1).toFixed(1)}% vs. avg`}
        />
        <PerformanceMetric
          label="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          trend="up"
          trendValue={`${(metrics.conversionRate * 0.15).toFixed(1)}% vs. avg`}
        />
        <PerformanceMetric
          label="Revenue Generated"
          value={formatCurrency(metrics.revenue)}
          icon={DollarSign}
          trend="up"
          trendValue="Above forecast"
        />
        <PerformanceMetric
          label="Appointments Booked"
          value={metrics.appointments.toLocaleString()}
          icon={CalendarCheck}
          trend="up"
          trendValue={`${((metrics.appointments / metrics.reach) * 100).toFixed(1)}% of reached`}
        />
      </div>

      <InlineTip variant="success" title="Performance insight:">
        This campaign is performing above average across all key metrics.
        Consider allocating more budget to similar campaigns.
      </InlineTip>

      <Separator />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Channel Reach</CardTitle>
            <CardDescription>Estimated reach by channel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enabledChannels.map((ch) => {
              const percentage =
                maxChannelReach > 0
                  ? (ch.estimatedReach / maxChannelReach) * 100
                  : 0;
              return (
                <ProgressBar
                  key={ch.channel}
                  label={CHANNEL_LABELS[ch.channel]}
                  value={Math.max(percentage, 2)}
                  caption={`${ch.estimatedReach.toLocaleString()} reached`}
                />
              );
            })}
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              Customer journey through the campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProgressBar
              label="Reached"
              value={100}
              caption={`${metrics.reach.toLocaleString()} (100%)`}
            />
            {openRate > 0 && (
              <ProgressBar
                label="Opened"
                value={openRate}
                caption={`${Math.round((metrics.reach * openRate) / 100).toLocaleString()} (${openRate}%)`}
              />
            )}
            {engagementRate > 0 && (
              <ProgressBar
                label="Engaged"
                value={engagementRate}
                caption={`${Math.round((metrics.reach * engagementRate) / 100).toLocaleString()} (${engagementRate}%)`}
              />
            )}
            <ProgressBar
              label="Responded"
              value={metrics.responseRate}
              caption={`${Math.round((metrics.reach * metrics.responseRate) / 100).toLocaleString()} (${metrics.responseRate}%)`}
            />
            <ProgressBar
              label="Converted"
              value={metrics.conversionRate}
              caption={`${Math.round((metrics.reach * metrics.conversionRate) / 100).toLocaleString()} (${metrics.conversionRate}%)`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
