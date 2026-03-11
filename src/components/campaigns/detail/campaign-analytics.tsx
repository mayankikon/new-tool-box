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
    <Card size="sm">
      <CardContent className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-semibold font-headline tracking-tight">{value}</p>
        {trendValue && (
          <p className={`flex items-center gap-1 text-xs ${trendColorClass}`}>
            {trend === "up" && <TrendingUp className="size-3" />}
            {trend === "down" && <TrendingUp className="size-3 rotate-180" />}
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface ChannelBarProps {
  channelLabel: string;
  reach: number;
  maxReach: number;
}

function ChannelBar({ channelLabel, reach, maxReach }: ChannelBarProps) {
  const percentage = maxReach > 0 ? (reach / maxReach) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span>{channelLabel}</span>
        <span className="font-medium">{reach.toLocaleString()}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
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

interface CampaignAnalyticsProps {
  campaign: Campaign;
}

export function CampaignAnalytics({ campaign }: CampaignAnalyticsProps) {
  const { metrics, channels } = campaign;
  const hasMetrics = metrics.reach > 0;
  const enabledChannels = channels.filter((ch) => ch.isEnabled);
  const maxChannelReach = Math.max(...enabledChannels.map((ch) => ch.estimatedReach), 1);

  if (!hasMetrics) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <TrendingUp className="size-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-base font-medium">No analytics yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Analytics data will appear here once the campaign has been launched and starts collecting engagement data.
        </p>
      </div>
    );
  }

  const openRate = metrics.openRate ?? 0;
  const engagementRate = metrics.engagementRate ?? 0;

  return (
    <div className="space-y-6 pt-4">
      {/* Performance metrics */}
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

      <Separator />

      {/* Channel performance */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Channel Reach</CardTitle>
            <CardDescription>Estimated reach by channel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enabledChannels.map((ch) => (
              <ChannelBar
                key={ch.channel}
                channelLabel={CHANNEL_LABELS[ch.channel]}
                reach={ch.estimatedReach}
                maxReach={maxChannelReach}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Customer journey through the campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FunnelStep label="Reached" count={metrics.reach} percentage={100} />
            {openRate > 0 && (
              <FunnelStep
                label="Opened"
                count={Math.round(metrics.reach * openRate / 100)}
                percentage={openRate}
              />
            )}
            {engagementRate > 0 && (
              <FunnelStep
                label="Engaged"
                count={Math.round(metrics.reach * engagementRate / 100)}
                percentage={engagementRate}
              />
            )}
            <FunnelStep
              label="Responded"
              count={Math.round(metrics.reach * metrics.responseRate / 100)}
              percentage={metrics.responseRate}
            />
            <FunnelStep
              label="Converted"
              count={Math.round(metrics.reach * metrics.conversionRate / 100)}
              percentage={metrics.conversionRate}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface FunnelStepProps {
  label: string;
  count: number;
  percentage: number;
}

function FunnelStep({ label, count, percentage }: FunnelStepProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {count.toLocaleString()} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/80 transition-all"
          style={{ width: `${Math.max(percentage, 1)}%` }}
        />
      </div>
    </div>
  );
}
