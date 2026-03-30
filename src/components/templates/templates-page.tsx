"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgePercent,
  CalendarClock,
  CarFront,
  ChevronDown,
  Handshake,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  WandSparkles,
  Wrench,
} from "lucide-react";

import {
  MarketingTemplateLibraryHeroStrip,
  MarketingTemplatePreviewArtifact,
} from "@/components/templates/marketing-template-preview-artifact";

import { TopBar } from "@/components/app/top-bar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input, InputContainer, InputIcon } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DEFAULT_PROXIMITY_RADIUS_MILES } from "@/lib/campaigns/proximity-trigger-defaults";
import type { CampaignTrigger } from "@/lib/campaigns/types";
import type { CampaignStatus } from "@/lib/campaigns/types";
import {
  MARKETING_TEMPLATE_LIBRARY,
  TEMPLATE_FILTERS,
  type MarketingTemplateCard,
  type TemplateChannel,
  type TemplateFilterOption,
} from "@/lib/templates/mock-data";
import {
  ALL_TEMPLATE_CHANNELS,
  formatTriggerSummary,
  getResolvedMarketingTemplateConfig,
  listCampaignsUsingLibraryTemplate,
  TRIGGER_TYPES,
  TRIGGER_TYPE_LABELS,
} from "@/lib/templates/template-config";

const lifecycleLabelMap = {
  onboarding: "Onboarding",
  "service-revenue": "Service Revenue",
  "research-education": "Research & Education",
  "win-back-retention": "Win-Back & Retention",
} as const;

const templateMetaChipClass =
  "inline-flex h-6 items-center rounded-sm border border-border/60 bg-muted/50 px-2.5 text-[11px] font-medium text-foreground";

const MERGE_PLACEHOLDER_HINT =
  "{{customer_name}}, {{vehicle_year}}, {{vehicle_make}}, {{vehicle_model}}, {{dealership_name}}";

const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  scheduled: "Scheduled",
  completed: "Completed",
  draft: "Draft",
  paused: "Paused",
};

function getTemplateSubtitle(template: MarketingTemplateCard): string {
  const lifecycle = lifecycleLabelMap[template.lifecycleStage];
  if (lifecycle === template.templateType) {
    return lifecycle;
  }
  return `${lifecycle} • ${template.templateType}`;
}

const emptyTriggerFallback: CampaignTrigger = {
  type: "time-based",
  isRecurring: false,
  config: {},
};

function defaultConfigForTriggerType(
  type: CampaignTrigger["type"],
): Record<string, unknown> {
  switch (type) {
    case "time-based":
      return { delayDays: 7 };
    case "mileage":
      return { intervalMiles: 5000 };
    case "seasonal":
      return { season: "spring" };
    case "diagnostic":
      return { reason: "scheduled_check" };
    case "health":
      return { healthThreshold: 40 };
    case "proximity":
      return { radiusMiles: DEFAULT_PROXIMITY_RADIUS_MILES };
    default:
      return {};
  }
}

const channelLabelMap = {
  sms: "SMS",
  email: "Email",
  push: "Push",
} as const;

function matchesFilter(
  template: MarketingTemplateCard,
  filterId: TemplateFilterOption["id"],
) {
  if (filterId === "all") return true;
  return template.lifecycleStage === filterId;
}

function matchesTemplateSearch(
  template: MarketingTemplateCard,
  normalizedQuery: string,
) {
  const segments = [
    template.title,
    template.description,
    template.templateType,
    template.previewContent,
    template.draftContent,
    template.draftNotes ?? "",
    lifecycleLabelMap[template.lifecycleStage],
    ...template.channels.map((channel) => channelLabelMap[channel]),
  ];
  return segments.some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}

function TemplateCard({
  template,
  index,
  onSelect,
}: {
  template: MarketingTemplateCard;
  index: number;
  onSelect: (templateId: string) => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(template.id)}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.025, ease: "easeOut" }}
      className="group overflow-hidden rounded-md border border-border/70 bg-card/70 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card hover:shadow-[0_6px_18px_rgba(16,24,40,0.07)] focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
    >
      <MarketingTemplateLibraryHeroStrip template={template}>
        <motion.div
          animate={{ y: [0, -1.5, 0] }}
          transition={{
            duration: 4.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.05,
          }}
          className="flex w-full items-center justify-center"
        >
          <MarketingTemplatePreviewArtifact template={template} />
        </motion.div>
      </MarketingTemplateLibraryHeroStrip>

      <div className="space-y-3 px-4 py-3.5">
        <div className="space-y-1.5">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{template.title}</p>
            <p className="text-xs leading-5 text-muted-foreground">
              {template.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={templateMetaChipClass}>{template.templateType}</span>
          {template.channels.map((channel) => (
            <span key={channel} className={templateMetaChipClass}>
              {channelLabelMap[channel]}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}

interface TemplateDetailPageProps {
  template: MarketingTemplateCard | undefined;
  draftValue: string;
  selectedChannels: TemplateChannel[];
  triggerValue: CampaignTrigger;
  onBack: () => void;
  onDraftChange: (value: string) => void;
  onChannelsChange: (channels: TemplateChannel[]) => void;
  onTriggerChange: (trigger: CampaignTrigger) => void;
  onResetToLibraryDefaults: () => void;
  onOpenCampaign?: (campaignId: string) => void;
}

function TemplateDetailPage({
  template,
  draftValue,
  selectedChannels,
  triggerValue,
  onBack,
  onDraftChange,
  onChannelsChange,
  onTriggerChange,
  onResetToLibraryDefaults,
  onOpenCampaign,
}: TemplateDetailPageProps) {
  const [isTriggerEditorOpen, setIsTriggerEditorOpen] = useState(false);
  const campaignsUsing = useMemo(
    () => (template ? listCampaignsUsingLibraryTemplate(template.id) : []),
    [template?.id],
  );

  if (!template) {
    return (
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
        <TopBar
          breadcrumbs={[
            { label: "Templates" },
            { label: "Missing template" },
          ]}
          title="Template not found"
          subtitle="The selected template could not be loaded. Return to the library and choose another template."
          right={
            <Button variant="secondary" size="header" onClick={onBack}>
              Back to Templates
            </Button>
          }
        />
        <div className="flex flex-1 items-start px-8 pb-10 pt-6">
          <div className="w-full max-w-3xl rounded-md border border-dashed border-border bg-card/60 p-6">
            <p className="text-sm text-muted-foreground">
              This template may have been removed or the selected id may be invalid.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
      <TopBar
        breadcrumbs={[
          { label: "Templates" },
          { label: template.title },
        ]}
        title={template.title}
        subtitle={getTemplateSubtitle(template)}
        right={
          <Button
            variant="secondary"
            size="header"
            leadingIcon={<ArrowLeft />}
            onClick={onBack}
          >
            Back to Templates
          </Button>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-auto px-8 pb-10 pt-6">
        <section className="w-full max-w-4xl rounded-md border border-border/70 bg-card/80 p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={templateMetaChipClass}>{template.templateType}</span>
                {selectedChannels.map((channel) => (
                  <span key={channel} className={templateMetaChipClass}>
                    {channelLabelMap[channel]}
                  </span>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-sm"
                onClick={onResetToLibraryDefaults}
              >
                Reset to library defaults
              </Button>
            </div>

            {template.draftNotes ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Note for your team
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {template.draftNotes}
                </p>
              </div>
            ) : null}

            <div className="space-y-3 rounded-md border border-border/60 bg-muted/20 p-4">
              <h3 className="text-sm font-medium text-foreground">
                Distribution channels
              </h3>
              <p className="text-xs text-muted-foreground">
                Choose where this template is intended to send. At least one channel
                must stay enabled.
              </p>
              <div className="flex flex-wrap gap-4">
                {ALL_TEMPLATE_CHANNELS.map((channel) => (
                  <label
                    key={channel}
                    className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                  >
                    <Checkbox
                      checked={selectedChannels.includes(channel)}
                      onCheckedChange={(checked) => {
                        const isOn = checked === true;
                        if (isOn) {
                          if (!selectedChannels.includes(channel)) {
                            onChannelsChange([...selectedChannels, channel]);
                          }
                          return;
                        }
                        const next = selectedChannels.filter((c) => c !== channel);
                        if (next.length === 0) {
                          return;
                        }
                        onChannelsChange(next);
                      }}
                    />
                    {channelLabelMap[channel]}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 rounded-md border border-border/60 bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-foreground">
                  Default trigger
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-sm"
                  onClick={() => setIsTriggerEditorOpen((open) => !open)}
                >
                  {isTriggerEditorOpen ? "Close editor" : "Edit trigger"}
                  <ChevronDown
                    className={cn(
                      "ml-1 size-4 transition-transform",
                      isTriggerEditorOpen && "rotate-180",
                    )}
                  />
                </Button>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                {formatTriggerSummary(triggerValue)}
              </p>
              {isTriggerEditorOpen ? (
                <div className="space-y-4 border-t border-border/60 pt-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`trigger-type-${template.id}`}>Trigger type</Label>
                      <Select
                        value={triggerValue.type}
                        onValueChange={(value) => {
                          const nextType = value as CampaignTrigger["type"];
                          onTriggerChange({
                            type: nextType,
                            isRecurring: triggerValue.isRecurring,
                            config: defaultConfigForTriggerType(nextType),
                          });
                        }}
                      >
                        <SelectTrigger
                          id={`trigger-type-${template.id}`}
                          className="w-full min-w-0"
                          size="sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRIGGER_TYPES.map((triggerType) => (
                            <SelectItem key={triggerType} value={triggerType}>
                              {TRIGGER_TYPE_LABELS[triggerType]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <label className="flex items-center gap-2 pt-7 text-sm text-foreground">
                      <Checkbox
                        checked={triggerValue.isRecurring}
                        onCheckedChange={(checked) =>
                          onTriggerChange({
                            ...triggerValue,
                            isRecurring: checked === true,
                          })
                        }
                      />
                      Recurring
                    </label>
                  </div>
                  {triggerValue.type === "time-based" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`delay-days-${template.id}`}>
                        Delay (days after event)
                      </Label>
                      <input
                        id={`delay-days-${template.id}`}
                        type="number"
                        min={0}
                        className="h-8 w-full max-w-[200px] rounded-sm border border-input bg-background px-2 text-sm"
                        value={
                          typeof triggerValue.config.delayDays === "number"
                            ? triggerValue.config.delayDays
                            : ""
                        }
                        onChange={(event) => {
                          const value = event.target.value;
                          onTriggerChange({
                            ...triggerValue,
                            config: {
                              ...triggerValue.config,
                              delayDays:
                                value === "" ? 0 : Number.parseInt(value, 10) || 0,
                            },
                          });
                        }}
                      />
                    </div>
                  ) : null}
                  {triggerValue.type === "mileage" ? (
                    <div className="space-y-2">
                      <Label htmlFor={`interval-miles-${template.id}`}>
                        Interval (miles)
                      </Label>
                      <input
                        id={`interval-miles-${template.id}`}
                        type="number"
                        min={0}
                        className="h-8 w-full max-w-[200px] rounded-sm border border-input bg-background px-2 text-sm"
                        value={
                          typeof triggerValue.config.intervalMiles === "number"
                            ? triggerValue.config.intervalMiles
                            : ""
                        }
                        onChange={(event) => {
                          const value = event.target.value;
                          onTriggerChange({
                            ...triggerValue,
                            config: {
                              ...triggerValue.config,
                              intervalMiles:
                                value === "" ? 0 : Number.parseInt(value, 10) || 0,
                            },
                          });
                        }}
                      />
                    </div>
                  ) : null}
                  <p className="text-[11px] text-muted-foreground">
                    Full audience rules and advanced trigger options are configured
                    when you create or edit a live campaign.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="space-y-3 rounded-md border border-border/60 bg-muted/20 p-4">
              <h3 className="text-sm font-medium text-foreground">
                Audience & exclusions (intent)
              </h3>
              <div className="space-y-2 text-sm leading-6 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Audience: </span>
                  {getResolvedMarketingTemplateConfig(template).defaultAudienceSummary}
                </p>
                <p>
                  <span className="font-medium text-foreground">Exclusions: </span>
                  {getResolvedMarketingTemplateConfig(template).defaultExclusionsSummary}
                </p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Segment builder lives in the campaign wizard; this is a quick reference
                for marketers using the library.
              </p>
            </div>

            <div className="space-y-3 rounded-md border border-border/60 bg-muted/20 p-4">
              <h3 className="text-sm font-medium text-foreground">
                Used in campaigns
              </h3>
              {campaignsUsing.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Not linked to any mock campaigns yet. When you create a campaign
                  from this template, it will appear here.
                </p>
              ) : (
                <ul className="space-y-2">
                  {campaignsUsing.map((campaign) => (
                    <li
                      key={campaign.id}
                      className="flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {campaign.name}
                        </span>
                        <span className={templateMetaChipClass}>
                          {CAMPAIGN_STATUS_LABELS[campaign.status]}
                        </span>
                      </div>
                      {onOpenCampaign ? (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto shrink-0 p-0 text-xs"
                          onClick={() => onOpenCampaign(campaign.id)}
                        >
                          Open in Campaigns
                        </Button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor={`template-draft-${template.id}`}
                className="text-sm font-medium text-foreground"
              >
                Draft content
              </label>
              <p className="text-xs text-muted-foreground">
                Placeholders: {MERGE_PLACEHOLDER_HINT}
              </p>
              <Textarea
                id={`template-draft-${template.id}`}
                value={draftValue}
                onChange={(event) => onDraftChange(event.target.value)}
                className="min-h-[280px] resize-y bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Edits to draft copy, channels, and trigger defaults apply only in this
                browser session until library saves are wired to the backend.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function TemplatesPage({
  onOpenCampaign,
}: {
  onOpenCampaign?: (campaignId: string) => void;
} = {}) {
  const [activeFilter, setActiveFilter] = useState<TemplateFilterOption["id"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [draftValues, setDraftValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      MARKETING_TEMPLATE_LIBRARY.map((template) => [template.id, template.draftContent]),
    ),
  );
  const [channelSelections, setChannelSelections] = useState<
    Record<string, TemplateChannel[]>
  >(() =>
    Object.fromEntries(
      MARKETING_TEMPLATE_LIBRARY.map((template) => [
        template.id,
        [...template.channels],
      ]),
    ),
  );
  const [triggerSelections, setTriggerSelections] = useState<
    Record<string, CampaignTrigger>
  >(() =>
    Object.fromEntries(
      MARKETING_TEMPLATE_LIBRARY.map((template) => [
        template.id,
        getResolvedMarketingTemplateConfig(template).defaultTrigger,
      ]),
    ),
  );

  const visibleTemplates = useMemo(() => {
    const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
    return MARKETING_TEMPLATE_LIBRARY.filter((template) => {
      if (!matchesFilter(template, activeFilter)) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }
      return matchesTemplateSearch(template, normalizedQuery);
    });
  }, [activeFilter, deferredSearchQuery]);

  const selectedTemplate = useMemo(
    () =>
      selectedTemplateId == null
        ? undefined
        : MARKETING_TEMPLATE_LIBRARY.find((template) => template.id === selectedTemplateId),
    [selectedTemplateId],
  );

  const handleResetTemplateDefaults = (templateId: string) => {
    const libraryRow = MARKETING_TEMPLATE_LIBRARY.find((row) => row.id === templateId);
    if (!libraryRow) {
      return;
    }
    setDraftValues((current) => ({
      ...current,
      [templateId]: libraryRow.draftContent,
    }));
    setChannelSelections((current) => ({
      ...current,
      [templateId]: [...libraryRow.channels],
    }));
    setTriggerSelections((current) => ({
      ...current,
      [templateId]: getResolvedMarketingTemplateConfig(libraryRow).defaultTrigger,
    }));
  };

  if (selectedTemplateId != null) {
    return (
      <TemplateDetailPage
        template={selectedTemplate}
        draftValue={
          selectedTemplate
            ? (draftValues[selectedTemplate.id] ?? selectedTemplate.draftContent)
            : ""
        }
        selectedChannels={
          selectedTemplate
            ? (channelSelections[selectedTemplate.id] ?? selectedTemplate.channels)
            : []
        }
        triggerValue={
          selectedTemplate
            ? (triggerSelections[selectedTemplate.id] ??
              getResolvedMarketingTemplateConfig(selectedTemplate).defaultTrigger)
            : emptyTriggerFallback
        }
        onBack={() => setSelectedTemplateId(null)}
        onDraftChange={(value) => {
          if (!selectedTemplate) return;
          setDraftValues((current) => ({
            ...current,
            [selectedTemplate.id]: value,
          }));
        }}
        onChannelsChange={(channels) => {
          if (!selectedTemplate) return;
          setChannelSelections((current) => ({
            ...current,
            [selectedTemplate.id]: channels,
          }));
        }}
        onTriggerChange={(trigger) => {
          if (!selectedTemplate) return;
          setTriggerSelections((current) => ({
            ...current,
            [selectedTemplate.id]: trigger,
          }));
        }}
        onResetToLibraryDefaults={() => {
          if (!selectedTemplate) return;
          handleResetTemplateDefaults(selectedTemplate.id);
        }}
        onOpenCampaign={onOpenCampaign}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
      <TopBar
        title="Templates"
        subtitle="Build reusable dealership messaging across the full owner lifecycle, from purchase to retention."
        right={
          <Button
            size="header"
            leadingIcon={<WandSparkles />}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create New Template
          </Button>
        }
      />

      <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-auto px-8 pb-10 pt-6">
        <InputContainer className="w-full max-w-sm" size="lg">
          <InputIcon position="lead">
            <Search className="size-4" aria-hidden />
          </InputIcon>
          <Input
            standalone={false}
            size="lg"
            aria-label="Search templates"
            placeholder="Search templates"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </InputContainer>

        <div className="flex flex-wrap items-center gap-2">
          {TEMPLATE_FILTERS.map((filter) => {
            const isActive = filter.id === activeFilter;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "inline-flex h-8 items-center rounded-sm border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "border-foreground/15 bg-foreground/6 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground",
                )}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="space-y-8">
          {visibleTemplates.length > 0 ? (
            <section>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {visibleTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    onSelect={setSelectedTemplateId}
                  />
                ))}
              </div>
            </section>
          ) : (
            <section className="rounded-md border border-dashed border-border bg-card/60 px-5 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                {searchQuery.trim()
                  ? "No templates match your search."
                  : "No templates match this lifecycle filter yet."}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery.trim()
                  ? "Try different keywords, clear the search, or pick another lifecycle tab."
                  : "Try another segment or use this library as the starting point for a future custom template builder."}
              </p>
            </section>
          )}
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg gap-5 p-0">
          <div className="relative overflow-hidden rounded-t-md border-b border-border/60 bg-gradient-to-br from-primary/16 via-primary/8 to-transparent px-5 py-5 dark:from-primary/12 dark:via-muted/40 dark:to-card">
            <div
              className={cn(
                "pointer-events-none absolute inset-0 opacity-80",
                "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.78),transparent_48%)]",
                "dark:bg-[radial-gradient(ellipse_110%_85%_at_0%_0%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_55%)] dark:opacity-100",
              )}
            />
            <div className="relative flex items-center gap-3">
              <div className="flex items-center justify-center text-primary">
                <WandSparkles className="size-6" aria-hidden />
              </div>
              <div className="space-y-1">
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Start a reusable message flow for a future campaign.
                </DialogDescription>
              </div>
            </div>
          </div>

          <DialogHeader className="px-5 pt-1">
            <div className="space-y-3">
              <p className="text-sm leading-6 text-muted-foreground">
                The full template builder is the next step. This placeholder keeps
                the entry point real while we shape the creation workflow around
                dealership lifecycle moments, channel mix, and reusable copy.
              </p>
              <div className="rounded-md border border-border/70 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Planned builder inputs
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[
                    "Lifecycle stage",
                    "Template type",
                    "Channel mix",
                    "Starter copy",
                    "Offer logic",
                    "Save to library",
                  ].map((item) => (
                    <Badge
                      key={item}
                      variant="secondary"
                      className="h-6 rounded-sm px-2.5 text-[11px]"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter showCloseButton className="mt-1">
            <Button
              variant="default"
              leadingIcon={<WandSparkles />}
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Continue exploring templates
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
