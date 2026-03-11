"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Campaign, CampaignStatus, CampaignType, Channel } from "@/lib/campaigns/types";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Pencil,
  Pause,
  Play,
  Trash2,
  Gauge,
  Battery,
  Shield,
  Megaphone,
  UserPlus,
  Droplet,
  FileText,
  Mail,
  MessageSquare,
  Smartphone,
  LayoutGrid,
  BarChart3,
} from "lucide-react";

const STATUS_BADGE_STYLES: Record<CampaignStatus, string> = {
  active:
    "bg-emerald-500/12 text-emerald-700 font-medium dark:text-emerald-400",
  scheduled:
    "bg-blue-500/12 text-blue-700 font-medium dark:text-blue-400",
  completed:
    "bg-slate-500/12 text-slate-600 font-medium dark:text-slate-400",
  draft:
    "bg-amber-500/12 text-amber-700 font-medium dark:text-amber-400",
  paused:
    "bg-red-500/12 text-red-700 font-medium dark:text-red-400",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  completed: "Completed",
  draft: "Draft",
  paused: "Paused",
};

const CAMPAIGN_TYPE_ICONS: Record<CampaignType, React.ComponentType<{ className?: string }>> = {
  "service-reminder": Gauge,
  "new-owner": UserPlus,
  "oil-change": Droplet,
  "battery-health": Battery,
  "warranty-expiration": Shield,
  "seasonal-promotion": Megaphone,
  custom: FileText,
};

/** Semantic icon colors by campaign type (aligned with template picker). */
const CAMPAIGN_TYPE_ICON_CLASSES: Record<CampaignType, string> = {
  "new-owner": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "service-reminder": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "oil-change": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "battery-health": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "warranty-expiration": "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  "seasonal-promotion": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  custom: "bg-muted text-muted-foreground",
};

const CHANNEL_ICONS: Record<Channel, React.ComponentType<{ className?: string }>> = {
  sms: MessageSquare,
  email: Mail,
  push: Smartphone,
  "in-app": LayoutGrid,
};

const CHANNEL_LABELS: Record<Channel, string> = {
  sms: "SMS",
  email: "Email",
  push: "Push",
  "in-app": "In-App",
};

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(isoDate));
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

interface StatusTabDef {
  value: string;
  label: string;
  filterFn: (c: Campaign) => boolean;
}

const STATUS_TABS: StatusTabDef[] = [
  { value: "all", label: "All", filterFn: () => true },
  { value: "active", label: "Active", filterFn: (c) => c.status === "active" },
  { value: "scheduled", label: "Scheduled", filterFn: (c) => c.status === "scheduled" },
  { value: "completed", label: "Completed", filterFn: (c) => c.status === "completed" },
  { value: "draft", label: "Draft", filterFn: (c) => c.status === "draft" },
];

interface CampaignTableProps {
  campaigns: Campaign[];
  onViewCampaign?: (campaignId: string) => void;
}

const CONVERSION_STRONG_THRESHOLD = 8;

function CampaignRowActions({
  campaign,
  visible,
  onEdit,
  onPauseResume,
  onViewAnalytics,
  onDelete,
}: {
  campaign: Campaign;
  visible: boolean;
  onEdit?: () => void;
  onPauseResume?: () => void;
  onViewAnalytics?: () => void;
  onDelete?: () => void;
}) {
  const isPausedOrActive =
    campaign.status === "paused" || campaign.status === "active";
  const isPaused = campaign.status === "paused";

  const buttonClass =
    "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground";

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 transition-opacity",
        visible ? "opacity-100" : "opacity-0"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={onEdit}
        aria-label="Edit campaign"
      >
        <Pencil className="size-4" />
      </button>
      {isPausedOrActive && (
        <button
          type="button"
          className={buttonClass}
          onClick={onPauseResume}
          aria-label={isPaused ? "Resume campaign" : "Pause campaign"}
        >
          {isPaused ? (
            <Play className="size-4" />
          ) : (
            <Pause className="size-4" />
          )}
        </button>
      )}
      <button
        type="button"
        className={buttonClass}
        onClick={onViewAnalytics}
        aria-label="View analytics"
      >
        <BarChart3 className="size-4" />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
          aria-label="More actions"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          {isPausedOrActive && (
            <DropdownMenuItem onClick={onPauseResume}>
              {isPaused ? <Play /> : <Pause />}
              {isPaused ? "Resume" : "Pause"}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function CampaignTableView({
  campaigns,
  onViewCampaign,
}: {
  campaigns: Campaign[];
  onViewCampaign?: (id: string) => void;
}) {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-lg border border-[#F1F3F5] border-t-0 border-l-0 rounded-t-none dark:border-border dark:border-t-0 dark:border-l-0">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-[#F1F3F5] hover:bg-transparent dark:border-border">
            <TableHead className="h-12 px-4 font-medium text-muted-foreground">
              Campaign
            </TableHead>
            <TableHead className="h-12 px-4 font-medium text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="h-12 px-4 text-right font-medium text-muted-foreground">
              Audience
            </TableHead>
            <TableHead className="h-12 px-4 font-medium text-muted-foreground">
              Channels
            </TableHead>
            <TableHead className="h-12 px-4 text-right font-medium text-muted-foreground">
              Conv. %
            </TableHead>
            <TableHead className="h-12 px-4 font-medium text-muted-foreground">
              Date
            </TableHead>
            <TableHead className="w-[180px] px-4" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length === 0 ? (
            <TableRow className="border-b border-[#F1F3F5] dark:border-border">
              <TableCell
                colSpan={7}
                className="h-24 px-4 text-center text-muted-foreground"
              >
                No campaigns found.
              </TableCell>
            </TableRow>
          ) : (
            campaigns.map((campaign) => {
              const TypeIcon = CAMPAIGN_TYPE_ICONS[campaign.type] ?? FileText;
              const isHovered = hoveredRowId === campaign.id;
              const convRate = campaign.metrics.conversionRate;
              const isStrongConversion =
                convRate >= CONVERSION_STRONG_THRESHOLD && convRate > 0;

              return (
                <TableRow
                  key={campaign.id}
                  className={cn(
                    "h-14 cursor-pointer border-b border-[#F1F3F5] transition-colors dark:border-border",
                    isHovered && "bg-muted/50"
                  )}
                  onClick={() => onViewCampaign?.(campaign.id)}
                  onMouseEnter={() => setHoveredRowId(campaign.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-md",
                          CAMPAIGN_TYPE_ICON_CLASSES[campaign.type],
                        )}
                      >
                        <TypeIcon className="size-4" />
                      </div>
                      <span
                        className="text-foreground"
                        style={{ fontWeight: "var(--font-weight-semibold)" }}
                      >
                        {campaign.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge
                      className={cn(
                        "border-0 font-medium",
                        STATUS_BADGE_STYLES[campaign.status]
                      )}
                    >
                      {STATUS_LABELS[campaign.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums px-4 py-3">
                    {campaign.audienceSize > 0
                      ? formatCompactNumber(campaign.audienceSize)
                      : "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {campaign.channels
                        .filter((c) => c.isEnabled)
                        .map((ch) => {
                          const Icon = CHANNEL_ICONS[ch.channel];
                          return Icon ? (
                            <span
                              key={ch.channel}
                              className="inline-flex size-6 items-center justify-center rounded text-muted-foreground"
                              title={CHANNEL_LABELS[ch.channel]}
                            >
                              <Icon className="size-3.5" />
                            </span>
                          ) : null;
                        })}
                      {campaign.channels.filter((c) => c.isEnabled).length ===
                        0 && "—"}
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums px-4 py-3",
                      isStrongConversion &&
                        "font-medium text-[var(--theme-text-success)]"
                    )}
                  >
                    {convRate > 0
                      ? `${convRate.toFixed(1)}%`
                      : "—"}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-muted-foreground">
                    {formatDate(
                      campaign.launchedAt ??
                        campaign.scheduledAt ??
                        campaign.createdAt
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <CampaignRowActions
                      campaign={campaign}
                      visible={isHovered}
                      onEdit={() => {}}
                      onPauseResume={() => {}}
                      onViewAnalytics={() => onViewCampaign?.(campaign.id)}
                      onDelete={() => {}}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function CampaignTable({
  campaigns,
  onViewCampaign,
}: CampaignTableProps) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="all">
        <TabsList
          variant="line"
          className="h-11 gap-0 bg-transparent p-0"
        >
          {STATUS_TABS.map(({ value, label, filterFn }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-1.5 px-4 py-2.5 text-sm font-semibold focus-visible:ring-0 focus-visible:outline-none data-[active]:text-foreground data-[active]:shadow-none"
            >
              {label}
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
                {campaigns.filter(filterFn).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map(({ value, filterFn }) => (
          <TabsContent key={value} value={value} className="mt-0">
            <CampaignTableView
              campaigns={campaigns.filter(filterFn)}
              onViewCampaign={onViewCampaign}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
