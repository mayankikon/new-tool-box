"use client";

import {
  Users,
  TrendingUp,
  DollarSign,
  CalendarClock,
  Radio,
  Zap,
  Clock,
  CalendarDays,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Campaign, Channel } from "@/lib/campaigns/types";

const CHANNEL_LABELS: Record<Channel, string> = {
  sms: "SMS",
  email: "Email",
  push: "Push Notification",
  "in-app": "In-App",
};

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  "time-based": "Time-Based",
  mileage: "Mileage Threshold",
  diagnostic: "Diagnostic Event",
  health: "Health Score",
  proximity: "Proximity",
  seasonal: "Seasonal",
};

interface MetricCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  subtitle?: string;
}

function MetricCard({ label, value, icon: Icon, subtitle }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-primary/10">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold font-headline tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toLocaleString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

interface CampaignOverviewProps {
  campaign: Campaign;
}

export function CampaignOverview({ campaign }: CampaignOverviewProps) {
  const { metrics, trigger, channels, audienceSegments, audienceSize } = campaign;
  const enabledChannels = channels.filter((ch) => ch.isEnabled);
  const hasMetrics = metrics.reach > 0;

  return (
    <div className="space-y-6 pt-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <MetricCard
          label="Total Reach"
          value={formatNumber(metrics.reach)}
          icon={Users}
          subtitle={hasMetrics ? "unique customers" : undefined}
        />
        <MetricCard
          label="Response Rate"
          value={hasMetrics ? `${metrics.responseRate}%` : "—"}
          icon={TrendingUp}
        />
        <MetricCard
          label="Conversion Rate"
          value={hasMetrics ? `${metrics.conversionRate}%` : "—"}
          icon={TrendingUp}
        />
        <MetricCard
          label="Revenue"
          value={hasMetrics ? formatCurrency(metrics.revenue) : "—"}
          icon={DollarSign}
        />
        <MetricCard
          label="Appointments"
          value={hasMetrics ? formatNumber(metrics.appointments) : "—"}
          icon={CalendarClock}
        />
      </div>

      <Separator />

      {/* Configuration summary */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trigger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="size-4 text-muted-foreground" />
              Trigger
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Type</span>
              <Badge variant="secondary">
                {TRIGGER_TYPE_LABELS[trigger.type] ?? trigger.type}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Recurring</span>
              <span className="text-sm font-medium">
                {trigger.isRecurring ? "Yes" : "One-time"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Audience summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Segments</span>
              <span className="text-sm font-medium">
                {audienceSegments.length} filter{audienceSegments.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Est. Audience</span>
              <span className="text-sm font-semibold">{formatNumber(audienceSize)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="size-4 text-muted-foreground" />
              Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enabledChannels.length === 0 ? (
              <p className="text-sm text-muted-foreground">No channels configured</p>
            ) : (
              <div className="space-y-2">
                {enabledChannels.map((ch) => (
                  <div key={ch.channel} className="flex items-center justify-between">
                    <span className="text-sm">{CHANNEL_LABELS[ch.channel]}</span>
                    <span className="text-xs text-muted-foreground">
                      {ch.estimatedReach > 0
                        ? `~${formatNumber(ch.estimatedReach)} reach`
                        : "Not estimated"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Schedule / Dates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-3" /> Created
              </span>
              <span className="text-sm">{formatDate(campaign.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="size-3" /> Updated
              </span>
              <span className="text-sm">{formatDate(campaign.updatedAt)}</span>
            </div>
            {campaign.scheduledAt && (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarClock className="size-3" /> Scheduled
                </span>
                <span className="text-sm font-medium">{formatDate(campaign.scheduledAt)}</span>
              </div>
            )}
            {campaign.completedAt && (
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarClock className="size-3" /> Completed
                </span>
                <span className="text-sm">{formatDate(campaign.completedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
