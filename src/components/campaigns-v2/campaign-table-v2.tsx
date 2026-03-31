"use client";

import { useState } from "react";
import { Badge, BadgeDot, type BadgeTone } from "@/components/ui/badge";
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
import { FilterButton } from "@/components/ui/filter-button";
import { Paginator } from "@/components/ui/paginator";
import type {
  Campaign,
  CampaignStatus,
  CampaignType,
  Channel,
} from "@/lib/campaigns/types";
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
  RefreshCw,
  Car,
  AlertTriangle,
  FileText,
  Mail,
  MessageSquare,
  Smartphone,
  LayoutGrid,
  BarChart3,
} from "lucide-react";

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  completed: "Completed",
  draft: "Draft",
  paused: "Paused",
};

const STATUS_BADGE_TONES: Record<CampaignStatus, BadgeTone> = {
  active: "green",
  scheduled: "blue",
  completed: "gray",
  draft: "amber",
  paused: "red",
};

const CAMPAIGN_TYPE_ICONS: Record<
  CampaignType,
  React.ComponentType<{ className?: string }>
> = {
  "service-reminder": Gauge,
  "new-owner": UserPlus,
  "oil-change": Droplet,
  "battery-health": Battery,
  "warranty-expiration": Shield,
  "seasonal-promotion": Megaphone,
  "lease-renewal": RefreshCw,
  "vehicle-trade-in": Car,
  recall: AlertTriangle,
  custom: FileText,
};

const CAMPAIGN_TYPE_ICON_CLASSES: Record<CampaignType, string> = {
  "new-owner": "text-blue-600 dark:text-blue-400",
  "service-reminder": "text-amber-600 dark:text-amber-400",
  "oil-change": "text-amber-600 dark:text-amber-400",
  "battery-health": "text-orange-600 dark:text-orange-400",
  "warranty-expiration": "text-indigo-600 dark:text-indigo-400",
  "seasonal-promotion": "text-emerald-600 dark:text-emerald-400",
  "lease-renewal": "text-violet-600 dark:text-violet-400",
  "vehicle-trade-in": "text-sky-600 dark:text-sky-400",
  recall: "text-rose-600 dark:text-rose-400",
  custom: "text-muted-foreground",
};

const CHANNEL_ICONS: Record<
  Channel,
  React.ComponentType<{ className?: string }>
> = {
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

interface StatusFilterDef {
  value: string;
  label: string;
  filterFn: (c: Campaign) => boolean;
}

const STATUS_FILTERS: StatusFilterDef[] = [
  { value: "all", label: "All", filterFn: () => true },
  {
    value: "active",
    label: "Active",
    filterFn: (c) => c.status === "active",
  },
  {
    value: "scheduled",
    label: "Scheduled",
    filterFn: (c) => c.status === "scheduled",
  },
  {
    value: "completed",
    label: "Completed",
    filterFn: (c) => c.status === "completed",
  },
  { value: "draft", label: "Draft", filterFn: (c) => c.status === "draft" },
];

const PAGE_SIZE = 5;
const CONVERSION_STRONG_THRESHOLD = 8;

interface CampaignTableV2Props {
  campaigns: Campaign[];
  onViewCampaign?: (campaignId: string) => void;
}

export function CampaignTableV2({
  campaigns,
  onViewCampaign,
}: CampaignTableV2Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const filterDef = STATUS_FILTERS.find((f) => f.value === activeFilter);
  const filteredCampaigns = filterDef
    ? campaigns.filter(filterDef.filterFn)
    : campaigns;

  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * PAGE_SIZE;
  const paginatedCampaigns = filteredCampaigns.slice(
    startIdx,
    startIdx + PAGE_SIZE
  );

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map(({ value, label }) => (
          <FilterButton
            key={value}
            label={label}
            selected={activeFilter === value}
            onClick={() => handleFilterChange(value)}
            leadIcon={null}
            size="md"
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-[var(--radius-Card-sm)] border border-border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
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
              <TableHead className="w-[140px] px-4" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCampaigns.length === 0 ? (
              <TableRow className="border-b border-border">
                <TableCell
                  colSpan={7}
                  className="h-24 px-4 text-center text-muted-foreground"
                >
                  No campaigns found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCampaigns.map((campaign) => {
                const TypeIcon =
                  CAMPAIGN_TYPE_ICONS[campaign.type] ?? FileText;
                const isHovered = hoveredRowId === campaign.id;
                const convRate = campaign.metrics.conversionRate;
                const isStrongConversion =
                  convRate >= CONVERSION_STRONG_THRESHOLD && convRate > 0;
                const isPausedOrActive =
                  campaign.status === "paused" || campaign.status === "active";
                const isPaused = campaign.status === "paused";

                return (
                  <TableRow
                    key={campaign.id}
                    className={cn(
                      "h-14 cursor-pointer border-b border-border transition-colors",
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
                            "flex size-8 shrink-0 items-center justify-center",
                            CAMPAIGN_TYPE_ICON_CLASSES[campaign.type]
                          )}
                        >
                          <TypeIcon className="size-4" />
                        </div>
                        <span className="font-semibold text-foreground">
                          {campaign.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="soft"
                        tone={STATUS_BADGE_TONES[campaign.status]}
                        leadingVisual={
                          <BadgeDot tone={STATUS_BADGE_TONES[campaign.status]} />
                        }
                      >
                        {STATUS_LABELS[campaign.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right tabular-nums">
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
                        {campaign.channels.filter((c) => c.isEnabled)
                          .length === 0 && "—"}
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-4 py-3 text-right tabular-nums",
                        isStrongConversion &&
                          "font-medium text-[var(--theme-text-success)]"
                      )}
                    >
                      {convRate > 0 ? `${convRate.toFixed(1)}%` : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">
                      {formatDate(
                        campaign.launchedAt ??
                          campaign.scheduledAt ??
                          campaign.createdAt
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div
                        className={cn(
                          "flex items-center justify-end gap-0.5 transition-opacity",
                          isHovered ? "opacity-100" : "opacity-0"
                        )}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
                            aria-label="Campaign actions"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" side="bottom">
                            <DropdownMenuItem>
                              <Pencil />
                              Edit
                            </DropdownMenuItem>
                            {isPausedOrActive && (
                              <DropdownMenuItem>
                                {isPaused ? <Play /> : <Pause />}
                                {isPaused ? "Resume" : "Pause"}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() =>
                                onViewCampaign?.(campaign.id)
                              }
                            >
                              <BarChart3 />
                              Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive">
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filteredCampaigns.length > PAGE_SIZE && (
        <div className="flex justify-end">
          <Paginator
            variant="numbered"
            currentPage={safePage}
            totalPages={totalPages}
            totalItems={filteredCampaigns.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
