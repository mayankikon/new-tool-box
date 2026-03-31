"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo, useState } from "react";
import { useTheme } from "next-themes";

import type { DashPreviewSurface } from "@/app/design-playground/components/dash-preview-canvas";
import { FileCabinetTableChrome } from "@/app/design-playground/components/file-cabinet-table-chrome";
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
import { TableHeaderCell } from "@/components/ui/table-header-cell";
import { TableSlotCell } from "@/components/ui/table-slot-cell";
import { Paginator } from "@/components/ui/paginator";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";
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

const CAMPAIGN_TYPE_ICONS: Record<CampaignType, React.ComponentType<{ className?: string }>> = {
  "service-reminder": Gauge,
  "new-owner": UserPlus,
  "oil-change": Droplet,
  "battery-health": Battery,
  "warranty-expiration": Shield,
  "seasonal-promotion": Megaphone,
  "lease-renewal": RefreshCw,
  "vehicle-trade-in": Car,
  "recall": AlertTriangle,
  custom: FileText,
};

const ROW_HOVER_SURFACE =
  "bg-[color-mix(in_srgb,var(--theme-background-button-secondary-default)_78%,var(--theme-background-page)_22%)]";

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

const {
  underGlowPx,
  tabAccent,
  tabTopRadiusPx,
  headerCellHeightPx,
  bodyCellHeightPx,
  cellPaddingXPx,
} = FILE_CABINET_BILLING_TABLE_DEFAULTS;

const ROW_STROKE_LIGHT =
  "var(--theme-stroke-subtle, var(--theme-stroke-default))";
const BODY_CELL_DIVIDER =
  "border-b border-solid border-[var(--theme-stroke-subtle,var(--theme-stroke-default))]";

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

const CAMPAIGN_DECK_TAB_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_TABS.map((tab) => [tab.value, tab.label]),
) as Record<string, string>;

const CAMPAIGN_DECK_TAB_VALUES = STATUS_TABS.map((t) => t.value) as readonly string[];

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
    "inline-flex size-8 items-center justify-center rounded-md text-emerald-700 outline-none transition-colors hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300";

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
          className="inline-flex size-8 items-center justify-center rounded-md text-emerald-700 outline-none hover:bg-emerald-500/10 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
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

  const headerThStyle = useMemo(
    (): CSSProperties => ({
      backgroundColor: "transparent",
      borderWidth: 0,
      borderStyle: "solid",
      borderColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: ROW_STROKE_LIGHT,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      height: headerCellHeightPx,
      minHeight: headerCellHeightPx,
      maxHeight: headerCellHeightPx,
      boxSizing: "border-box",
      verticalAlign: "middle",
    }),
    [],
  );

  const headerLabelOverrideClass =
    "[&_span.truncate]:text-sm [&_span.truncate]:leading-5";
  const slotLabelOverrideClass =
    "[&_span.truncate]:text-sm [&_span.truncate]:leading-5";
  const cellTextClassName = "text-sm";

  const innerRowStyle: CSSProperties = useMemo(
    () => ({
      height: bodyCellHeightPx,
      minHeight: bodyCellHeightPx,
      maxHeight: bodyCellHeightPx,
      paddingLeft: cellPaddingXPx,
      paddingRight: cellPaddingXPx,
      boxSizing: "border-box",
    }),
    [bodyCellHeightPx, cellPaddingXPx],
  );

  const slotClass = cn("text-foreground", slotLabelOverrideClass);

  return (
    <div className="flex flex-col overflow-hidden border-0 bg-transparent">
      <div className="min-w-0 bg-transparent">
        <Table
          className={cn(
            cellTextClassName,
            "border-separate border-spacing-0 bg-transparent",
          )}
        >
          <TableHeader className="[&_tr]:border-0 [&_tr]:bg-transparent [&_tr]:hover:bg-transparent">
            <TableRow size="compact" className="!border-0 hover:bg-transparent">
              <TableHead
                className="min-w-[200px] w-[320px] p-0 align-middle"
                style={headerThStyle}
              >
                <TableHeaderCell
                  variant="label"
                  label="Campaign"
                  className={cn(
                    headerLabelOverrideClass,
                    "h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none",
                  )}
                  style={{
                    height: headerCellHeightPx,
                    minHeight: headerCellHeightPx,
                    maxHeight: headerCellHeightPx,
                    boxSizing: "border-box",
                  }}
                />
              </TableHead>
              <TableHead
                className="min-w-[100px] w-[140px] p-0 align-middle"
                style={headerThStyle}
              >
                <TableHeaderCell
                  variant="label"
                  label="Status"
                  className={cn(
                    headerLabelOverrideClass,
                    "h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none",
                  )}
                  style={{
                    height: headerCellHeightPx,
                    minHeight: headerCellHeightPx,
                    maxHeight: headerCellHeightPx,
                    boxSizing: "border-box",
                  }}
                />
              </TableHead>
              <TableHead
                className="min-w-[88px] w-[120px] p-0 align-middle"
                style={headerThStyle}
              >
                <TableHeaderCell
                  variant="label"
                  label="Audience"
                  className={cn(
                    headerLabelOverrideClass,
                    "h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none",
                  )}
                  style={{
                    height: headerCellHeightPx,
                    minHeight: headerCellHeightPx,
                    maxHeight: headerCellHeightPx,
                    boxSizing: "border-box",
                  }}
                />
              </TableHead>
              <TableHead
                className="min-w-[120px] w-[150px] p-0 align-middle"
                style={headerThStyle}
              >
                <TableHeaderCell
                  variant="label"
                  label="Channels"
                  className={cn(
                    headerLabelOverrideClass,
                    "h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none",
                  )}
                  style={{
                    height: headerCellHeightPx,
                    minHeight: headerCellHeightPx,
                    maxHeight: headerCellHeightPx,
                    boxSizing: "border-box",
                  }}
                />
              </TableHead>
              <TableHead
                className="min-w-[88px] w-[120px] p-0 align-middle"
                style={headerThStyle}
              >
                <TableHeaderCell
                  variant="label"
                  label="Conv. %"
                  className={cn(
                    headerLabelOverrideClass,
                    "h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none",
                  )}
                  style={{
                    height: headerCellHeightPx,
                    minHeight: headerCellHeightPx,
                    maxHeight: headerCellHeightPx,
                    boxSizing: "border-box",
                  }}
                />
              </TableHead>
              <TableHead
                className="min-w-[120px] w-[150px] p-0 align-middle"
                style={headerThStyle}
              >
                <TableHeaderCell
                  variant="label"
                  label="Date"
                  className={cn(
                    headerLabelOverrideClass,
                    "h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none",
                  )}
                  style={{
                    height: headerCellHeightPx,
                    minHeight: headerCellHeightPx,
                    maxHeight: headerCellHeightPx,
                    boxSizing: "border-box",
                  }}
                />
              </TableHead>
              <TableHead
                className="min-w-[72px] w-[72px] p-0 align-middle"
                style={headerThStyle}
              >
                <TableHeaderCell
                  variant="empty"
                  className="h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none"
                  style={{
                    height: headerCellHeightPx,
                    minHeight: headerCellHeightPx,
                    maxHeight: headerCellHeightPx,
                    boxSizing: "border-box",
                  }}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow
                size="default"
                className="!border-0 !bg-transparent hover:!bg-transparent"
              >
                <TableCell
                  colSpan={7}
                  className="h-24 px-4 text-center text-muted-foreground"
                >
                  No campaigns found.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((campaign, rowIndex) => {
                const TypeIcon = CAMPAIGN_TYPE_ICONS[campaign.type] ?? FileText;
                const isHovered = hoveredRowId === campaign.id;
                const convRate = campaign.metrics.conversionRate;
                const isStrongConversion =
                  convRate >= CONVERSION_STRONG_THRESHOLD && convRate > 0;
                const activeChannels = campaign.channels.filter((c) => c.isEnabled);
                const isLastRow = rowIndex === campaigns.length - 1;
                const cellFrame = cn(
                  "p-0 align-middle transition-colors",
                  isHovered && ROW_HOVER_SURFACE,
                  !isLastRow && BODY_CELL_DIVIDER
                );

                return (
                  <TableRow
                    key={campaign.id}
                    size="default"
                    className="!border-0 !bg-transparent hover:!bg-transparent"
                    style={{ minHeight: bodyCellHeightPx }}
                  >
                    <TableCell
                      className={cn(cellFrame, "cursor-pointer")}
                      onClick={() => onViewCampaign?.(campaign.id)}
                      onMouseEnter={() => setHoveredRowId(campaign.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <div className="flex items-center" style={innerRowStyle}>
                        <div className="inline-flex max-w-full items-center gap-2">
                          <span
                            className="inline-flex size-7 shrink-0 items-center justify-center text-[var(--theme-text-secondary)]"
                          >
                            <TypeIcon className="size-3.5" />
                          </span>
                          <span
                            className={cn(
                              "truncate font-medium leading-5 text-foreground",
                              cellTextClassName,
                            )}
                          >
                            {campaign.name}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(cellFrame, "cursor-pointer")}
                      onClick={() => onViewCampaign?.(campaign.id)}
                      onMouseEnter={() => setHoveredRowId(campaign.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <div className="flex items-center" style={innerRowStyle}>
                        <Badge
                          variant="soft"
                          tone={STATUS_BADGE_TONES[campaign.status]}
                          leadingVisual={
                            <BadgeDot tone={STATUS_BADGE_TONES[campaign.status]} />
                          }
                          className="shadow-none"
                        >
                          {STATUS_LABELS[campaign.status]}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(cellFrame, "cursor-pointer")}
                      onClick={() => onViewCampaign?.(campaign.id)}
                      onMouseEnter={() => setHoveredRowId(campaign.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <TableSlotCell
                        label={
                          campaign.audienceSize > 0
                            ? formatCompactNumber(campaign.audienceSize)
                            : "—"
                        }
                        className={cn(slotClass, "tabular-nums")}
                        style={innerRowStyle}
                      />
                    </TableCell>
                    <TableCell
                      className={cn(cellFrame, "cursor-pointer")}
                      onClick={() => onViewCampaign?.(campaign.id)}
                      onMouseEnter={() => setHoveredRowId(campaign.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <div className="flex items-center" style={innerRowStyle}>
                        <div className="inline-flex max-w-full items-center gap-2">
                          {activeChannels.length > 0 ? (
                            activeChannels.map((ch) => {
                              const Icon = CHANNEL_ICONS[ch.channel];
                              return Icon ? (
                                <span
                                  key={ch.channel}
                                  className="inline-flex shrink-0"
                                  title={CHANNEL_LABELS[ch.channel]}
                                >
                                  <Icon
                                    className="size-4 text-muted-foreground"
                                    aria-hidden
                                  />
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(cellFrame, "cursor-pointer")}
                      onClick={() => onViewCampaign?.(campaign.id)}
                      onMouseEnter={() => setHoveredRowId(campaign.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <TableSlotCell
                        label={convRate > 0 ? `${convRate.toFixed(1)}%` : "—"}
                        className={cn(
                          slotClass,
                          "tabular-nums",
                          isStrongConversion
                            ? "text-[var(--theme-text-success)] font-medium"
                            : "",
                        )}
                        style={innerRowStyle}
                      />
                    </TableCell>
                    <TableCell
                      className={cn(cellFrame, "cursor-pointer")}
                      onClick={() => onViewCampaign?.(campaign.id)}
                      onMouseEnter={() => setHoveredRowId(campaign.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <TableSlotCell
                        label={formatDate(
                          campaign.launchedAt ??
                            campaign.scheduledAt ??
                            campaign.createdAt
                        )}
                        className={slotClass}
                        style={innerRowStyle}
                      />
                    </TableCell>
                    <TableCell
                      className={cn(cellFrame, "p-0 align-middle")}
                      onMouseEnter={() => setHoveredRowId(campaign.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <div
                        className="flex items-center justify-center"
                        style={innerRowStyle}
                      >
                        <CampaignRowActions
                          campaign={campaign}
                          visible={isHovered}
                          onEdit={() => {}}
                          onPauseResume={() => {}}
                          onViewAnalytics={() => onViewCampaign?.(campaign.id)}
                          onDelete={() => {}}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

interface CampaignTableProps {
  campaigns: Campaign[];
  onViewCampaign?: (campaignId: string) => void;
}

export function CampaignTable({
  campaigns,
  onViewCampaign,
}: CampaignTableProps) {
  const { resolvedTheme } = useTheme();
  const previewSurface: DashPreviewSurface =
    resolvedTheme === "dark" ? "dark" : "light";

  const [deckTab, setDeckTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filterFn = useMemo(() => {
    const tab = STATUS_TABS.find((t) => t.value === deckTab);
    return tab?.filterFn ?? (() => true);
  }, [deckTab]);

  const filteredCampaigns = useMemo(
    () => campaigns.filter(filterFn),
    [campaigns, filterFn],
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredCampaigns.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedCampaigns = filteredCampaigns.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const handleDeckTabChange = useCallback((next: string) => {
    setDeckTab(next);
    setCurrentPage(1);
  }, []);

  return (
    <div className="flex min-h-[min(28rem,70vh)] min-w-0 w-full flex-col">
      <FileCabinetTableChrome
        className="flex min-h-[280px] min-w-0 flex-1 flex-col"
        value={deckTab}
        onValueChange={handleDeckTabChange}
        labels={CAMPAIGN_DECK_TAB_LABELS}
        tabValues={CAMPAIGN_DECK_TAB_VALUES}
        surface={previewSurface}
        underGlowPx={underGlowPx}
        accent={tabAccent}
        tabTopRadiusPx={tabTopRadiusPx}
        showLeftLamp={false}
        noLeftLampBelowStyle="preset-led"
        tabMotionVariant="sink-rise"
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col px-2 pb-2 pt-[4px]">
          <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain pr-px">
            <CampaignTableView
              campaigns={pagedCampaigns}
              onViewCampaign={onViewCampaign}
            />
          </div>
          <div className="flex min-w-0 shrink-0 justify-end pt-2">
            <Paginator
              variant="inline"
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={filteredCampaigns.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </FileCabinetTableChrome>
    </div>
  );
}
