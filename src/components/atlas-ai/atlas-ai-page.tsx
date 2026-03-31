"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  Coins,
  FileSpreadsheet,
  Gauge,
  MapPinned,
  Megaphone,
  MessageSquareShare,
  PhoneCall,
  Route,
  ShieldAlert,
  Square,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  tableRowVariants,
} from "@/components/ui/table";
import {
  AiTextArea,
  AiTextAreaInput,
  AiTextAreaSubmit,
  AiTextAreaToolbar,
  AiTextAreaToolbarGroup,
} from "@/components/ui/ai-textarea";
import { ShimmeringText } from "@/components/shimmering-text/shimmering-text";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media-paths";
import {
  ATLAS_AI_HEADLINES,
  ATLAS_AI_HOME_MODULES,
  getAtlasAiResponse,
} from "@/lib/atlas-ai/mock-data";
import { mergePartialCampaignOffer } from "@/lib/campaigns/coupon-templates";
import type {
  AtlasAiCampaignSuggestion,
  AtlasAiCustomerPreviewRow,
  AtlasAiHomeModule,
  AtlasAiMessage,
  AtlasAiPromptSuggestion,
  AtlasAiResponse,
} from "@/lib/atlas-ai/types";
import { CouponCardPreview } from "@/components/campaigns/coupon-builder";
import type { AudienceSegment } from "@/lib/campaigns/types";

interface AtlasAiCampaignDraft {
  name: string;
  type: AtlasAiCampaignSuggestion["campaignType"];
  templateId: string | null;
  audienceSegments: AudienceSegment[];
  audienceSize: number;
  trigger?: AtlasAiCampaignSuggestion["trigger"];
  suggestedOffer?: AtlasAiCampaignSuggestion["suggestedOffer"];
}

interface AtlasAiPageProps {
  onCreateCampaign: (draft: AtlasAiCampaignDraft) => void;
}

/** Full-audience table collapses with a fade when this many or more rows (after priority cards). */
const ATLAS_AUDIENCE_TABLE_COLLAPSE_ROW_THRESHOLD = 3;

interface AtlasAiLoadingStep {
  id: string;
  label: string;
  detail: string;
  durationMs: number;
}

const homeModuleIcons: Record<string, LucideIcon> = {
  gauge: Gauge,
  shield: ShieldAlert,
  coins: Coins,
  route: Route,
  map: MapPinned,
  phone: PhoneCall,
};

const layoutSpringTransition = {
  type: "spring" as const,
  stiffness: 280,
  damping: 28,
  mass: 0.82,
};

const composerLayoutTransition = {
  type: "spring" as const,
  stiffness: 210,
  damping: 30,
  mass: 0.92,
};

function AtlasAiLogo({
  className,
  imageClassName,
}: {
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={mediaUrl("logos/ikon-mark.svg")}
        alt="Atlas AI"
        className={cn("size-8", imageClassName)}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}

function priorityBadgeVariant(priority: AtlasAiCustomerPreviewRow["priority"]) {
  switch (priority) {
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    default:
      return "outline";
  }
}

function priorityLabel(priority: AtlasAiCustomerPreviewRow["priority"]) {
  switch (priority) {
    case "high":
      return "High priority";
    case "medium":
      return "Medium priority";
    default:
      return "Low priority";
  }
}

function serializeRowsToCsv(rows: AtlasAiCustomerPreviewRow[]) {
  const header = ["Name", "Vehicle", "Last Service Date", "Mileage", "Reason", "Priority"];
  const lines = rows.map((row) =>
    [
      row.name,
      row.vehicle,
      row.lastServiceDate ?? "",
      row.mileage ?? "",
      row.serviceDueReason ?? "",
      row.priority,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );

  return [header.join(","), ...lines].join("\n");
}

function hashQuery(query: string) {
  return Array.from(query).reduce((accumulator, character) => {
    return (accumulator * 31 + character.charCodeAt(0)) % 2147483647;
  }, 7);
}

function pickStep(
  options: Array<{ id: string; label: string; detail: string; durationMs: number }>,
  seed: number,
) {
  return options[seed % options.length];
}

function buildLoadingSteps(query: string): AtlasAiLoadingStep[] {
  const normalizedQuery = query.toLowerCase();
  const seed = hashQuery(normalizedQuery);

  const foundationSteps = [
    {
      id: "customer-graph",
      label: "Reading customer and vehicle history across your lane",
      detail: "Linking owner, VIN, and recent service activity into one view.",
      durationMs: 1600 + (seed % 4) * 220,
    },
    {
      id: "audience-query",
      label: "Finding owners who are slipping out of retention",
      detail: "Comparing recent service cadence against normal comeback behavior.",
      durationMs: 1400 + ((seed >> 1) % 4) * 180,
    },
    {
      id: "household-signals",
      label: "Matching household movement, VIN, and visit signals",
      detail: "Checking market movement, ownership shifts, and service-lane activity.",
      durationMs: 1500 + ((seed >> 2) % 4) * 190,
    },
  ];

  const serviceSteps = [
    {
      id: "vin-signals",
      label: "Checking maintenance timing, mileage, and service momentum",
      detail: "Looking for customers whose timing suggests a near-term service need.",
      durationMs: 1650 + ((seed >> 3) % 3) * 180,
    },
    {
      id: "appointment-patterns",
      label: "Reviewing prior service cadence and booking patterns",
      detail: "Separating habitual bookers from owners who need a stronger nudge.",
      durationMs: 1500 + ((seed >> 4) % 3) * 170,
    },
  ];

  const recallSteps = [
    {
      id: "recall-check",
      label: "Checking recall urgency across your customer base",
      detail: "Finding owners who need immediate outreach before urgency cools off.",
      durationMs: 1700 + ((seed >> 2) % 3) * 200,
    },
    {
      id: "repair-readiness",
      label: "Sizing the service follow-up value around those recall owners",
      detail: "Estimating which recall visits can unlock additional fixed-ops revenue.",
      durationMs: 1500 + ((seed >> 3) % 3) * 180,
    },
  ];

  const warrantySteps = [
    {
      id: "warranty-window",
      label: "Finding owners entering a near-term warranty window",
      detail: "Looking for protection-plan timing and service retention opportunity.",
      durationMs: 1750 + ((seed >> 2) % 3) * 200,
    },
    {
      id: "protection-fit",
      label: "Scoring protection-plan fit and retention value",
      detail: "Highlighting the owners most likely to convert before coverage ends.",
      durationMs: 1500 + ((seed >> 3) % 3) * 160,
    },
  ];

  const leaseSteps = [
    {
      id: "lease-window",
      label: "Looking for lease-end owners who could slip out of lane",
      detail: "Finding owners who need engagement before they drift to another store.",
      durationMs: 1700 + ((seed >> 2) % 3) * 210,
    },
    {
      id: "lane-stickiness",
      label: "Scoring lease customers most likely to stay in-lane",
      detail: "Prioritizing owners with both service value and renewal opportunity.",
      durationMs: 1480 + ((seed >> 3) % 3) * 160,
    },
  ];

  const batterySteps = [
    {
      id: "battery-signals",
      label: "Finding EV and hybrid owners with battery-health opportunity",
      detail: "Checking powertrain signals that warrant proactive outreach.",
      durationMs: 1750 + ((seed >> 2) % 3) * 210,
    },
    {
      id: "powertrain-risk",
      label: "Comparing EV and hybrid powertrain service risk",
      detail: "Separating routine EV questions from higher-value diagnostic opportunity.",
      durationMs: 1520 + ((seed >> 3) % 3) * 170,
    },
  ];

  const revenueSteps = [
    {
      id: "revenue-score",
      label: "Sizing revenue upside and comeback likelihood",
      detail: "Estimating what this audience could still return to your lane.",
      durationMs: 1500 + ((seed >> 4) % 3) * 180,
    },
    {
      id: "campaign-revenue",
      label: "Modeling what this audience could return to the lane",
      detail: "Comparing the list size with likely service-booking lift.",
      durationMs: 1580 + ((seed >> 5) % 3) * 170,
    },
  ];

  const closingSteps = normalizedQuery.includes("campaign")
    ? [
        {
          id: "campaign-recommendation",
          label: "Turning the audience into a campaign-ready segment",
          detail: "Bundling the best-fit owners into a reusable activation path.",
          durationMs: 1550 + ((seed >> 6) % 3) * 180,
        },
        {
          id: "campaign-package",
          label: "Packaging the segment and next-best creative direction",
          detail: "Summarizing the offer, timing, and audience rationale.",
          durationMs: 1450 + ((seed >> 7) % 3) * 160,
        },
      ]
    : [
        {
          id: "audience-preview",
          label: "Preparing the next best action and the owners to act on",
          detail: "Bringing forward the customers most worth acting on first.",
          durationMs: 1480 + ((seed >> 6) % 3) * 170,
        },
        {
          id: "bdc-package",
          label: "Packaging the audience for BDC, export, or activation",
          detail: "Turning the audience into something your team can work immediately.",
          durationMs: 1380 + ((seed >> 7) % 3) * 160,
        },
      ];

  const steps: AtlasAiLoadingStep[] = [];
  steps.push(foundationSteps[0]);
  steps.push(pickStep([foundationSteps[1], foundationSteps[2]], seed >> 1));

  if (normalizedQuery.includes("recall")) {
    steps.push(...recallSteps);
  } else if (normalizedQuery.includes("warranty")) {
    steps.push(...warrantySteps);
  } else if (normalizedQuery.includes("lease")) {
    steps.push(...leaseSteps);
  } else if (normalizedQuery.includes("battery")) {
    steps.push(...batterySteps);
  } else {
    steps.push(pickStep(serviceSteps, seed >> 2));
  }

  const includeRevenueModeling =
    normalizedQuery.includes("revenue") ||
    normalizedQuery.includes("campaign") ||
    normalizedQuery.includes("warranty") ||
    normalizedQuery.includes("recall") ||
    normalizedQuery.includes("30k") ||
    normalizedQuery.includes("30 k") ||
    (seed % 3 === 0);

  steps.push(revenueSteps[0]);

  if (includeRevenueModeling) {
    steps.push(revenueSteps[1]);
  }

  const includeClosingPair =
    normalizedQuery.includes("campaign") ||
    normalizedQuery.includes("bdc") ||
    normalizedQuery.includes("call") ||
    (seed % 2 === 0);

  steps.push(closingSteps[0]);

  if (includeClosingPair) {
    steps.push(closingSteps[1]);
  }

  const capped = steps.slice(0, Math.min(steps.length, 7));
  return capped.map((step) => ({
    ...step,
    durationMs: Math.round(step.durationMs / 2),
  }));
}

export function AtlasAiPage({ onCreateCampaign }: AtlasAiPageProps) {
  const [messages, setMessages] = useState<AtlasAiMessage[]>([]);
  const [query, setQuery] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [typedHeadline, setTypedHeadline] = useState(ATLAS_AI_HEADLINES[0]);
  const [isDeletingHeadline, setIsDeletingHeadline] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<AtlasAiLoadingStep[]>([]);
  const [visibleLoadingStepCount, setVisibleLoadingStepCount] = useState(0);
  const [activeLoadingStep, setActiveLoadingStep] = useState(0);
  const [revealedSectionsByMessage, setRevealedSectionsByMessage] = useState<
    Record<string, number>
  >({});
  const [revealedRowsByMessage, setRevealedRowsByMessage] = useState<Record<string, number>>({});
  const [audienceTableExpandedByMessage, setAudienceTableExpandedByMessage] = useState<
    Record<string, boolean>
  >({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeResponse, setActiveResponse] = useState<AtlasAiResponse | null>(null);
  const revealTimeoutsRef = useRef<number[]>([]);
  const generationRunIdRef = useRef(0);

  useEffect(() => {
    return () => {
      revealTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      revealTimeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) return;

    const fullHeadline = ATLAS_AI_HEADLINES[headlineIndex];

    if (isComposerFocused) return;

    let timeoutId: number | undefined;

    if (!isDeletingHeadline && typedHeadline !== fullHeadline) {
      timeoutId = window.setTimeout(() => {
        setTypedHeadline(fullHeadline.slice(0, typedHeadline.length + 1));
      }, 28);
    } else if (!isDeletingHeadline && typedHeadline === fullHeadline) {
      timeoutId = window.setTimeout(() => {
        setIsDeletingHeadline(true);
      }, 3400);
    } else if (isDeletingHeadline && typedHeadline.length > 0) {
      timeoutId = window.setTimeout(() => {
        setTypedHeadline(fullHeadline.slice(0, typedHeadline.length - 1));
      }, 16);
    } else if (isDeletingHeadline && typedHeadline.length === 0) {
      timeoutId = window.setTimeout(() => {
        setIsDeletingHeadline(false);
        setHeadlineIndex((current) => (current + 1) % ATLAS_AI_HEADLINES.length);
      }, 0);
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [headlineIndex, isComposerFocused, isDeletingHeadline, messages.length, typedHeadline]);

  const handleCreateCampaign = useCallback(
    (suggestion?: AtlasAiCampaignSuggestion) => {
      if (!suggestion) return;

      onCreateCampaign({
        name: suggestion.title,
        type: suggestion.campaignType,
        templateId: suggestion.templateId ?? null,
        audienceSegments: suggestion.audienceSegments,
        audienceSize: suggestion.estimatedReach,
        trigger: suggestion.trigger,
        suggestedOffer: suggestion.suggestedOffer,
      });
    },
    [onCreateCampaign],
  );

  const handleExportCsv = useCallback(() => {
    if (!activeResponse?.audiencePreview) return;

    const csv = serializeRowsToCsv(activeResponse.audiencePreview.rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "atlas-ai-audience.csv";
    link.click();
    URL.revokeObjectURL(url);

    setDialogOpen(false);
  }, [activeResponse]);

  const handleCreateBdcHandoff = useCallback(() => {
    if (!activeResponse?.audiencePreview) return;

    setDialogOpen(false);
  }, [activeResponse]);

  const handleBackToHome = useCallback(() => {
    generationRunIdRef.current += 1;
    revealTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    revealTimeoutsRef.current = [];
    setMessages([]);
    setQuery("");
    setIsThinking(false);
    setRevealedSectionsByMessage({});
    setRevealedRowsByMessage({});
    setAudienceTableExpandedByMessage({});
    setLoadingSteps([]);
    setVisibleLoadingStepCount(0);
    setActiveLoadingStep(0);
    setActiveResponse(null);
    setDialogOpen(false);
  }, []);

  const handleInterruptGeneration = useCallback(() => {
    generationRunIdRef.current += 1;
    revealTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    revealTimeoutsRef.current = [];
    setIsThinking(false);
    setLoadingSteps([]);
    setVisibleLoadingStepCount(0);
    setActiveLoadingStep(0);
  }, []);

  const scheduleAssistantReveal = useCallback(
    (messageId: string, response: AtlasAiResponse) => {
      setRevealedSectionsByMessage((current) => ({ ...current, [messageId]: 1 }));

      if (response.audiencePreview) {
        setRevealedRowsByMessage((current) => ({ ...current, [messageId]: 0 }));
      }

      let delay = 350;
      const whyTimeoutId = window.setTimeout(() => {
        setRevealedSectionsByMessage((current) => ({
          ...current,
          [messageId]: 2,
        }));
      }, delay);
      revealTimeoutsRef.current.push(whyTimeoutId);
      delay += 210;

      if (response.audiencePreview) {
        const audienceCardTimeoutId = window.setTimeout(() => {
          setRevealedSectionsByMessage((current) => ({
            ...current,
            [messageId]: 3,
          }));
        }, delay);
        revealTimeoutsRef.current.push(audienceCardTimeoutId);

        const rowStartDelay = delay + 140;
        response.audiencePreview.rows.forEach((_, index) => {
          const timeoutId = window.setTimeout(() => {
            setRevealedRowsByMessage((current) => ({
              ...current,
              [messageId]: index + 1,
            }));
          }, rowStartDelay + index * 75);
          revealTimeoutsRef.current.push(timeoutId);
        });

        delay = rowStartDelay + response.audiencePreview.rows.length * 75 + 130;
      }

      const remainingSectionCount =
        1 + (response.campaignSuggestion ? 1 : 0) + (response.followUpPrompts.length ? 1 : 0);

      const startingSection = response.audiencePreview ? 4 : 3;

      for (
        let nextSection = startingSection;
        nextSection < startingSection + remainingSectionCount;
        nextSection += 1
      ) {
        const timeoutId = window.setTimeout(() => {
          setRevealedSectionsByMessage((current) => ({
            ...current,
            [messageId]: nextSection,
          }));
        }, delay);
        revealTimeoutsRef.current.push(timeoutId);
        delay += nextSection === startingSection ? 240 : 180;
      }
    },
    [],
  );

  const submitQuery = useCallback(
    async (nextQuery: string) => {
      const trimmed = nextQuery.trim();
      if (!trimmed || isThinking) return;
      const runId = generationRunIdRef.current + 1;
      generationRunIdRef.current = runId;

      const userMessage: AtlasAiMessage = {
        id: `atlas-user-${Date.now()}`,
        role: "user",
        text: trimmed,
      };

      setMessages((current) => [...current, userMessage]);
      setQuery("");
      setIsThinking(true);
      const steps = buildLoadingSteps(trimmed);
      setLoadingSteps(steps);
      setVisibleLoadingStepCount(1);
      setActiveLoadingStep(0);

      for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
        if (generationRunIdRef.current !== runId) {
          return;
        }
        setActiveLoadingStep(stepIndex);
        setVisibleLoadingStepCount(stepIndex + 1);
        await new Promise((resolve) =>
          setTimeout(resolve, steps[stepIndex]?.durationMs ?? 200),
        );
        if (generationRunIdRef.current !== runId) {
          return;
        }
      }

      if (generationRunIdRef.current !== runId) {
        return;
      }

      const response = getAtlasAiResponse(trimmed);
      const assistantMessage: AtlasAiMessage = {
        id: `atlas-assistant-${Date.now()}`,
        role: "assistant",
        text: response.summary,
        response,
      };

      setMessages((current) => [...current, assistantMessage]);
      setIsThinking(false);
      setLoadingSteps([]);
      setVisibleLoadingStepCount(0);
      setActiveLoadingStep(0);
      scheduleAssistantReveal(assistantMessage.id, response);
    },
    [isThinking, scheduleAssistantReveal],
  );

  const openBdcDialog = useCallback((response: AtlasAiResponse) => {
    setActiveResponse(response);
    setDialogOpen(true);
  }, []);

  const renderPromptChips = useCallback(
    (
      prompts: AtlasAiPromptSuggestion[],
      {
        compact = false,
        centered = false,
      }: { compact?: boolean; centered?: boolean } = {},
    ) => (
      <div
        className={cn(
          "flex flex-wrap gap-2",
          centered ? "justify-center" : "justify-start",
        )}
      >
        {prompts.map((prompt) => (
          <Button
            key={prompt.id}
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={() => void submitQuery(prompt.prompt)}
            className={cn(
              "h-auto max-w-full justify-start rounded-xs text-left whitespace-normal",
              compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm",
              centered && "text-center",
            )}
          >
            {prompt.label}
          </Button>
        ))}
      </div>
    ),
    [submitQuery],
  );

  const renderHomeModules = useCallback(
    (modules: AtlasAiHomeModule[]) => (
      <div className="mx-auto grid w-full max-w-3xl gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => {
          const Icon = module.iconKey ? homeModuleIcons[module.iconKey] : Sparkles;
          const accentClasses = [
            "from-primary/14 via-primary/8 to-transparent dark:from-primary/[0.12] dark:via-muted/50 dark:to-card",
            "from-sky-500/12 via-primary/8 to-transparent dark:from-sky-500/[0.14] dark:via-muted/50 dark:to-card",
            "from-amber-500/12 via-primary/8 to-transparent dark:from-amber-500/[0.12] dark:via-muted/50 dark:to-card",
            "from-emerald-500/12 via-primary/8 to-transparent dark:from-emerald-500/[0.12] dark:via-muted/50 dark:to-card",
            "from-primary/12 via-teal-500/8 to-transparent dark:from-teal-500/[0.12] dark:via-muted/50 dark:to-card",
            "from-cyan-500/12 via-primary/8 to-transparent dark:from-cyan-500/[0.12] dark:via-muted/50 dark:to-card",
          ];
          const accentClass = accentClasses[index % accentClasses.length];

          return (
            <motion.button
              key={module.id}
              type="button"
              layout="position"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.995 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setQuery(module.prompt)}
              className="group overflow-hidden rounded-md border border-border/70 bg-card/70 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,background-color,transform,box-shadow] duration-200 hover:border-primary/25 hover:bg-card hover:shadow-[0_6px_18px_rgba(16,24,40,0.07)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
            >
              <div
                className={cn(
                  "relative overflow-hidden border-b border-border/60 bg-gradient-to-br px-3 py-3",
                  accentClass,
                )}
              >
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-80",
                    "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_48%)]",
                    "dark:bg-[radial-gradient(ellipse_120%_90%_at_0%_0%,color-mix(in_oklab,var(--primary)_24%,transparent),transparent_58%)] dark:opacity-100",
                  )}
                />
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-90",
                    "bg-[radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.08),transparent_42%)]",
                    "dark:bg-[radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--primary)_34%,transparent),transparent_52%)]",
                  )}
                />
                <div className="relative flex min-h-[74px] items-center justify-center">
                  <motion.div
                    className="relative flex items-center justify-center text-primary"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.04 }}
                  >
                    <Icon className="size-6" aria-hidden />
                  </motion.div>
                </div>
              </div>
              <div className="space-y-1.5 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{module.title}</p>
                </div>
                <p className="text-xs leading-5 text-muted-foreground">{module.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    ),
    [],
  );

  const renderComposer = useCallback(
    ({
      layoutId,
      sticky = false,
    }: {
      layoutId?: string;
      sticky?: boolean;
    } = {}) => (
      <motion.div
        layout="position"
        layoutId={layoutId}
        transition={composerLayoutTransition}
        className={cn("mx-auto w-full max-w-3xl flex-none", sticky && "origin-bottom")}
      >
        <AiTextArea variant="default" className="gap-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submitQuery(query);
            }}
          >
            <AiTextAreaInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                setIsComposerFocused(true);
                setTypedHeadline(ATLAS_AI_HEADLINES[headlineIndex]);
                setIsDeletingHeadline(false);
              }}
              onBlur={() => setIsComposerFocused(false)}
              placeholder="Ask about recalls, defection, relocated owners, revenue upside, or who to target next…"
              disabled={isThinking}
              className="min-h-[56px] px-4 pt-3 text-sm"
            />
            <AiTextAreaToolbar className="justify-end px-4 pb-4">
              <AiTextAreaToolbarGroup>
                {isThinking ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    aria-label="Pause Atlas AI generation"
                    className="size-8 rounded-full"
                    onClick={handleInterruptGeneration}
                  >
                    <Square className="size-3.5 fill-current" />
                  </Button>
                ) : (
                  <AiTextAreaSubmit
                    shape="icon"
                    aria-label="Submit Atlas AI query"
                    disabled={!query.trim()}
                  >
                    <ArrowUp className="size-4" />
                  </AiTextAreaSubmit>
                )}
              </AiTextAreaToolbarGroup>
            </AiTextAreaToolbar>
          </form>
        </AiTextArea>
      </motion.div>
    ),
    [handleInterruptGeneration, headlineIndex, isThinking, query, submitQuery],
  );

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-background px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div
            className={cn(
              "mx-auto flex w-full max-w-5xl flex-col gap-5 px-1 pb-5 pt-1 sm:px-2 sm:pb-8 sm:pt-2",
              messages.length === 0 && "min-h-full justify-start pt-4 sm:pt-6",
            )}
          >
            {messages.length > 0 ? (
              <div className="mx-auto flex w-full max-w-3xl justify-start px-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leadingIcon={<ArrowLeft />}
                  className="rounded-xs"
                  onClick={handleBackToHome}
                >
                  Back to search home
                </Button>
              </div>
            ) : null}

            {messages.length === 0 ? (
              <motion.div
                layout="position"
                transition={composerLayoutTransition}
                className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-4 text-center sm:px-5 sm:py-5"
              >
                <EmptyState className="w-full gap-4 text-center">
                  <EmptyStateIcon className="flex items-center justify-center">
                    <AtlasAiLogo className="size-24" imageClassName="size-18" />
                  </EmptyStateIcon>
                  <EmptyStateContent className="min-h-[44px] space-y-1.5">
                    <EmptyStateTitle className="text-3xl leading-tight">
                      {typedHeadline}
                      {!isComposerFocused ? (
                        <motion.span
                          aria-hidden
                          className="ml-0.5 inline-block h-[1.05em] w-px bg-foreground/70 align-[-0.12em]"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                        />
                      ) : null}
                    </EmptyStateTitle>
                  </EmptyStateContent>
                  <motion.div
                    layout="position"
                    className="w-full pt-1"
                    transition={composerLayoutTransition}
                  >
                    {renderComposer({ layoutId: "atlas-query-composer" })}
                  </motion.div>
                  <div className="w-full pt-1">{renderHomeModules(ATLAS_AI_HOME_MODULES)}</div>
                </EmptyState>
              </motion.div>
            ) : null}

            {messages.map((message) =>
              message.role === "user" ? (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={layoutSpringTransition}
                  className="mx-auto flex w-full max-w-3xl justify-end pl-10 sm:pl-16"
                >
                  <Card
                    size="sm"
                    className="max-w-2xl border-border/80 bg-card py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                  >
                    <CardContent className="px-4 py-1 text-sm leading-6 text-foreground">
                      {message.text}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={layoutSpringTransition}
                  className="mx-auto w-full max-w-3xl space-y-4"
                >
                  <motion.div
                    layout
                    layoutId="atlas-assistant-header"
                    transition={layoutSpringTransition}
                    className="flex items-center gap-3 pl-[calc(theme(spacing.1)-6px)] pr-1"
                  >
                    <motion.div layoutId="atlas-assistant-logo" transition={layoutSpringTransition}>
                      <AtlasAiLogo className="size-10" imageClassName="size-8" />
                    </motion.div>
                    <div className="min-w-0">
                      <motion.p
                        layoutId="atlas-assistant-title"
                        transition={layoutSpringTransition}
                        className="text-sm font-medium text-foreground"
                      >
                        Atlas AI
                      </motion.p>
                      <p className="text-xs text-muted-foreground">
                        Customer discovery summary
                      </p>
                    </div>
                  </motion.div>

                  <motion.div layout transition={layoutSpringTransition} className="grid gap-4">
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...layoutSpringTransition, delay: 0.06 }}
                    >
                      <Card
                        size="sm"
                        className="overflow-hidden border-border/80 bg-card/80 py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Atlas found</CardTitle>
                          <CardDescription>
                            {message.response?.headline}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-4">
                          <p className="text-sm leading-6 text-foreground">{message.response?.summary}</p>
                          {message.response?.insightTags?.length ? (
                            <div className="flex flex-wrap gap-2">
                              {message.response.insightTags.map((tag) => (
                                <Badge key={tag} variant="outline" className="rounded-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          {message.response?.metrics.length ? (
                            <div className="flex flex-wrap gap-2">
                              {message.response.metrics.map((metric) => (
                                <Badge
                                  key={metric.id}
                                  variant="secondary"
                                  className="h-auto rounded-xs px-2.5 py-1"
                                >
                                  <span className="text-muted-foreground">{metric.label}:</span> {metric.value}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </CardContent>
                        <AnimatePresence initial={false}>
                          {(revealedSectionsByMessage[message.id] ?? 999) >= 2 ? (
                            <motion.div
                              key={`${message.id}-why-inline`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={layoutSpringTransition}
                              className="border-t border-border/60 px-3 py-4"
                            >
                              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                Why it matters
                              </p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {message.response?.whyItMatters}
                              </p>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                        <AnimatePresence initial={false}>
                          {(revealedSectionsByMessage[message.id] ?? 999) >=
                          (message.response?.audiencePreview ? 4 : 3) ? (
                            <motion.div
                              key={`${message.id}-actions-inline`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={layoutSpringTransition}
                              className="border-t border-border/60 px-3 py-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div className="space-y-1">
                                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                    What Atlas recommends next
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {message.response?.nextBestActionLabel ?? "Next best action"}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  {message.response?.recommendedActions.map((action) =>
                                    action.kind === "campaign" ? (
                                      <Button
                                        key={action.id}
                                        variant="secondary"
                                        leadingIcon={<Megaphone />}
                                        className="rounded-xs"
                                        onClick={() =>
                                          handleCreateCampaign(message.response?.campaignSuggestion)
                                        }
                                      >
                                        {action.label}
                                      </Button>
                                    ) : (
                                      <Button
                                        key={action.id}
                                        variant={action.emphasis === "primary" ? "default" : "secondary"}
                                        leadingIcon={<MessageSquareShare />}
                                        className="rounded-xs"
                                        onClick={() => openBdcDialog(message.response as AtlasAiResponse)}
                                      >
                                        {action.label}
                                      </Button>
                                    ),
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </Card>
                    </motion.div>

                    <AnimatePresence initial={false} mode="popLayout">
                      {message.response?.audiencePreview &&
                      (revealedSectionsByMessage[message.id] ?? 999) >= 3 ? (
                        <motion.div
                          key={`${message.id}-audience`}
                          layout
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={layoutSpringTransition}
                        >
                          <Card size="sm" className="py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            Customers to act on
                          </CardTitle>
                          <CardDescription>
                            {message.response.audiencePreview.description}
                          </CardDescription>
                          <CardAction>
                            <Badge variant="outline" className="rounded-xs">
                              {message.response.audiencePreview.totalCount} matched
                            </Badge>
                          </CardAction>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-4">
                          {(() => {
                            const visibleRows = message.response.audiencePreview.rows.slice(
                              0,
                              revealedRowsByMessage[message.id] ??
                                message.response.audiencePreview.rows.length,
                            );
                            const featuredRows = visibleRows.slice(0, 3);
                            const remainingRows = visibleRows.slice(3);
                            const totalAudienceRows = message.response.audiencePreview.rows.length;
                            const revealedAudienceRowCount =
                              revealedRowsByMessage[message.id] ?? totalAudienceRows;
                            const isAudienceRevealComplete =
                              revealedAudienceRowCount >= totalAudienceRows;
                            const isAudienceTableExpanded =
                              audienceTableExpandedByMessage[message.id] ?? false;
                            const shouldCollapseAudienceTable =
                              remainingRows.length >= ATLAS_AUDIENCE_TABLE_COLLAPSE_ROW_THRESHOLD &&
                              isAudienceRevealComplete &&
                              !isAudienceTableExpanded;

                            return (
                              <>
                                <div className="space-y-2">
                                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                    Priority queue
                                  </p>
                                  <div className="grid gap-2">
                                    {featuredRows.map((row, index) => {
                                      const isNewestRow = index === featuredRows.length - 1;

                                      return (
                                        <motion.div
                                          key={`${row.id}-queue`}
                                          layout="position"
                                          initial={{ opacity: 0, y: 6 }}
                                          animate={{
                                            opacity: 1,
                                            y: 0,
                                          }}
                                          transition={{
                                            opacity: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                                            y: { duration: 0.26, ease: [0.22, 1, 0.36, 1] },
                                          }}
                                          className={cn(
                                            "rounded-md border border-border/70 bg-card/70 px-3 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]",
                                            isNewestRow && "border-primary/25",
                                          )}
                                        >
                                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="space-y-1">
                                              <p className="text-sm font-medium text-foreground">
                                                {row.name}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                {row.vehicle}
                                              </p>
                                            </div>
                                            <Badge
                                              variant={priorityBadgeVariant(row.priority)}
                                              className="w-fit rounded-xs"
                                            >
                                              {priorityLabel(row.priority)}
                                            </Badge>
                                          </div>
                                          <div className="mt-2 grid gap-2 sm:grid-cols-[140px_1fr]">
                                            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                              Last service
                                            </div>
                                            <div className="text-sm text-foreground">
                                              {row.lastServiceDate ?? "N/A"}
                                            </div>
                                            <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                              Why Atlas surfaced this
                                            </div>
                                            <div className="text-sm leading-6 text-muted-foreground">
                                              {row.serviceDueReason ?? "No additional detail"}
                                            </div>
                                          </div>
                                        </motion.div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <AnimatePresence initial={false}>
                                  {remainingRows.length > 0 ? (
                                    <motion.div
                                      key={`${message.id}-audience-table`}
                                      initial={{ opacity: 0, y: 12 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -4 }}
                                      transition={layoutSpringTransition}
                                      className="space-y-2"
                                    >
                                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                        Full audience
                                      </p>
                                      <div className="relative">
                                        <div
                                          id={`atlas-audience-table-${message.id}`}
                                          className={cn(
                                            shouldCollapseAudienceTable &&
                                              "max-h-[min(11.5rem,45vh)] overflow-hidden",
                                          )}
                                        >
                                          <Table>
                                            <TableHeader>
                                              <TableRow size="compact">
                                                <TableHead>Customer</TableHead>
                                                <TableHead>Vehicle</TableHead>
                                                <TableHead>Last Service</TableHead>
                                                <TableHead>Reason</TableHead>
                                                <TableHead>Priority</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {remainingRows.map((row, index) => {
                                                const isNewestRow = index === remainingRows.length - 1;

                                                return (
                                                  <motion.tr
                                                    key={row.id}
                                                    layout="position"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{
                                                      opacity: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                                                      y: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                                                    }}
                                                    className={cn(
                                                      tableRowVariants({ size: "compact" }),
                                                      isNewestRow && "bg-primary/3",
                                                    )}
                                                  >
                                                    <TableCell className="font-medium">
                                                      <motion.div
                                                        initial={isNewestRow ? { opacity: 0, clipPath: "inset(0 100% 0 0)" } : false}
                                                        animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                                                        transition={{ duration: 0.28, delay: 0.02, ease: [0.22, 1, 0.36, 1] }}
                                                      >
                                                        {row.name}
                                                      </motion.div>
                                                    </TableCell>
                                                    <TableCell>
                                                      <motion.div
                                                        initial={isNewestRow ? { opacity: 0, clipPath: "inset(0 100% 0 0)" } : false}
                                                        animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                                                        transition={{ duration: 0.28, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                                                      >
                                                        {row.vehicle}
                                                      </motion.div>
                                                    </TableCell>
                                                    <TableCell>
                                                      <motion.div
                                                        initial={isNewestRow ? { opacity: 0, clipPath: "inset(0 100% 0 0)" } : false}
                                                        animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                                                        transition={{ duration: 0.28, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                                                      >
                                                        {row.lastServiceDate ?? "N/A"}
                                                      </motion.div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[240px] whitespace-normal text-muted-foreground">
                                                      <motion.div
                                                        initial={isNewestRow ? { opacity: 0, clipPath: "inset(0 100% 0 0)" } : false}
                                                        animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                                                        transition={{ duration: 0.28, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                                      >
                                                        {row.serviceDueReason ?? "No additional detail"}
                                                      </motion.div>
                                                    </TableCell>
                                                    <TableCell>
                                                      <motion.div
                                                        initial={isNewestRow ? { opacity: 0, clipPath: "inset(0 100% 0 0)" } : false}
                                                        animate={{ opacity: 1, clipPath: "inset(0 0% 0 0)" }}
                                                        transition={{ duration: 0.28, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
                                                      >
                                                        <Badge
                                                          variant={priorityBadgeVariant(row.priority)}
                                                          className="rounded-xs"
                                                        >
                                                          {priorityLabel(row.priority)}
                                                        </Badge>
                                                      </motion.div>
                                                    </TableCell>
                                                  </motion.tr>
                                                );
                                              })}
                                            </TableBody>
                                          </Table>
                                        </div>
                                        {shouldCollapseAudienceTable ? (
                                          <div
                                            className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-card via-card/85 to-transparent pb-1 pt-16"
                                            aria-hidden
                                          >
                                            <div className="pointer-events-auto flex justify-center px-2">
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xs text-muted-foreground hover:text-foreground"
                                                aria-expanded={false}
                                                aria-controls={`atlas-audience-table-${message.id}`}
                                                leadingIcon={<ChevronDown className="size-4" />}
                                                onClick={() =>
                                                  setAudienceTableExpandedByMessage((current) => ({
                                                    ...current,
                                                    [message.id]: true,
                                                  }))
                                                }
                                              >
                                                Expand table
                                                <span className="ml-1.5 text-xs font-normal text-muted-foreground tabular-nums">
                                                  · {remainingRows.length} rows
                                                </span>
                                              </Button>
                                            </div>
                                          </div>
                                        ) : null}
                                      </div>
                                    </motion.div>
                                  ) : null}
                                </AnimatePresence>
                              </>
                            );
                          })()}
                        </CardContent>
                      </Card>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    <AnimatePresence initial={false} mode="popLayout">
                      {message.response?.campaignSuggestion &&
                      (revealedSectionsByMessage[message.id] ?? 999) >=
                        (message.response?.audiencePreview ? 5 : 4) ? (
                        <motion.div
                          key={`${message.id}-campaign`}
                          layout
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={layoutSpringTransition}
                        >
                          <Card
                            size="sm"
                            className="border-primary/15 bg-primary/5 py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                          >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <Sparkles className="size-4 text-primary" />
                            Campaign recommendation
                          </CardTitle>
                          <CardDescription>
                            Suggested follow-up campaign based on this audience.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-4">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">
                              {message.response.campaignSuggestion.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {message.response.campaignSuggestion.description}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary" className="rounded-xs">
                              Reach: {message.response.campaignSuggestion.estimatedReach}
                            </Badge>
                            {message.response.campaignSuggestion.estimatedRevenue != null ? (
                              <Badge variant="secondary" className="rounded-xs">
                                Revenue: $
                                {message.response.campaignSuggestion.estimatedRevenue.toLocaleString()}
                              </Badge>
                            ) : null}
                          </div>
                          {message.response.campaignSuggestion.suggestedOffer ? (
                            <div className="space-y-1.5">
                              <p className="text-xs font-medium text-muted-foreground">
                                Suggested coupon
                              </p>
                              <div className="max-w-[280px] rounded-md border bg-background/80 p-2">
                                <CouponCardPreview
                                  offer={mergePartialCampaignOffer({
                                    id: "atlas-preview",
                                    ...message.response.campaignSuggestion.suggestedOffer,
                                  })}
                                  compact
                                />
                              </div>
                            </div>
                          ) : null}
                          <Button
                            variant="secondary"
                            leadingIcon={<Megaphone />}
                            className="rounded-xs"
                            onClick={() => handleCreateCampaign(message.response?.campaignSuggestion)}
                          >
                            Create campaign for this audience
                          </Button>
                        </CardContent>
                      </Card>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>

                    <AnimatePresence initial={false} mode="popLayout">
                      {message.response?.followUpPrompts.length &&
                      (revealedSectionsByMessage[message.id] ?? 999) >=
                        (message.response?.campaignSuggestion
                          ? message.response?.audiencePreview
                            ? 6
                            : 4
                          : message.response?.audiencePreview
                            ? 5
                            : 3) ? (
                        <motion.div
                          key={`${message.id}-followups`}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={layoutSpringTransition}
                          className="space-y-2 px-1"
                        >
                        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                          Suggested next question
                        </p>
                        {renderPromptChips(message.response.followUpPrompts, { compact: true })}
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ),
            )}

            <AnimatePresence mode="wait" initial={false}>
              {isThinking ? (
                <motion.div
                  key="atlas-thinking"
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={layoutSpringTransition}
                  className="mx-auto w-full max-w-3xl"
                >
                  <div className="w-full py-4">
                    <motion.div layout transition={layoutSpringTransition} className="space-y-4">
                    <motion.div
                      layout
                      layoutId="atlas-assistant-header"
                      transition={layoutSpringTransition}
                      className="flex items-center gap-3 pl-[calc(theme(spacing.1)-6px)] pr-1"
                    >
                      <div className="relative flex size-10 items-center justify-center">
                        {[0, 1, 2].map((ring) => (
                          <motion.span
                            key={ring}
                            className="absolute inset-0 rounded-full border border-primary/25"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: [0.92, 1.34, 1.58], opacity: [0, 0.32, 0] }}
                            transition={{
                              duration: 2.8,
                              ease: [0.22, 1, 0.36, 1],
                              repeat: Infinity,
                              repeatDelay: 0.12,
                              delay: ring * 0.34,
                            }}
                          />
                        ))}
                        <motion.div
                          className="absolute inset-[-8px] rounded-full bg-primary/10 blur-2xl"
                          animate={{ scale: [0.96, 1.08, 0.98], opacity: [0.2, 0.34, 0.22] }}
                          transition={{
                            duration: 2.4,
                            ease: [0.22, 1, 0.36, 1],
                            repeat: Infinity,
                          }}
                        />
                        <motion.div
                          layoutId="atlas-assistant-logo"
                          transition={layoutSpringTransition}
                        >
                          <AtlasAiLogo
                            className="relative z-10 size-10"
                            imageClassName="size-8 drop-shadow-[0_0_16px_rgba(26,147,117,0.28)]"
                          />
                        </motion.div>
                      </div>
                      <div className="min-w-0">
                        <motion.p
                          layoutId="atlas-assistant-title"
                          transition={layoutSpringTransition}
                          className="text-sm font-medium text-foreground"
                        >
                          Atlas AI is generating your result
                        </motion.p>
                        <p className="text-xs text-muted-foreground">
                          Thinking through your audience and building the response
                        </p>
                      </div>
                    </motion.div>

                    <motion.div layout transition={layoutSpringTransition} className="pl-1">
                      <p className="text-sm leading-6 text-muted-foreground">
                        Reading dealership signals, sizing opportunity, and lining up the
                        next best move for your team.
                      </p>
                    </motion.div>

                    <motion.div
                      layout="position"
                      transition={layoutSpringTransition}
                      className="w-full max-w-xl space-y-2 text-left"
                    >
                      {(() => {
                        const visibleSteps = loadingSteps.slice(0, visibleLoadingStepCount);
                        const activeStepDetail = visibleSteps[activeLoadingStep]?.detail;

                        return (
                          <>
                            {visibleSteps.map((step, index) => {
                              const isComplete = index < activeLoadingStep;
                              const isActive = index === activeLoadingStep;
                              const isLast = index === visibleSteps.length - 1;
                              const connectorActive = isComplete || isActive;

                              return (
                                <motion.div
                                  key={step.id}
                                  layout="position"
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.28,
                                    ease: [0.22, 1, 0.36, 1],
                                    delay: index * 0.03,
                                  }}
                                  className={cn(
                                    "relative flex min-h-10 items-stretch gap-3 px-2 py-1.5",
                                    isActive ? "text-foreground" : "text-muted-foreground",
                                  )}
                                >
                                  {/* pt-0.5 + size-4 = circle bottom; line runs to next row's circle (span row paddings). */}
                                  <div className="relative flex w-4 shrink-0 flex-col items-center self-stretch pt-0.5">
                                    {!isLast ? (
                                      <div
                                        className="pointer-events-none absolute left-1/2 top-[calc(0.125rem+1rem)] bottom-[-0.875rem] w-px -translate-x-1/2 overflow-hidden rounded-full"
                                        aria-hidden
                                      >
                                        <span className="absolute inset-0 bg-border/50" />
                                        <motion.span
                                          className="absolute inset-0 origin-top bg-primary/45"
                                          initial={false}
                                          animate={{
                                            scaleY: connectorActive ? 1 : 0,
                                            opacity: connectorActive ? 1 : 0.25,
                                          }}
                                          transition={{
                                            duration: 0.28,
                                            ease: [0.22, 1, 0.36, 1],
                                          }}
                                        />
                                      </div>
                                    ) : null}
                                    <div
                                      className={cn(
                                        "relative z-10 flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-full",
                                        isActive
                                          ? "bg-primary/15 text-primary"
                                          : isComplete
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground",
                                      )}
                                    >
                                      {isComplete ? (
                                        <>
                                          <motion.span
                                            className="absolute inset-0 rounded-full bg-primary/20"
                                            initial={{ scale: 0.25, opacity: 0.75 }}
                                            animate={{ scale: 1.15, opacity: 0 }}
                                            transition={{ duration: 0.38, ease: "easeOut" }}
                                          />
                                          <motion.span
                                            className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/65 to-transparent"
                                            initial={{ x: "-120%", opacity: 0 }}
                                            animate={{ x: "250%", opacity: [0, 1, 0] }}
                                            transition={{
                                              duration: 0.52,
                                              ease: [0.22, 1, 0.36, 1],
                                              delay: 0.05,
                                            }}
                                          />
                                          <motion.div
                                            initial={{ scale: 0.72, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                                          >
                                            <Check className="size-2.5" />
                                          </motion.div>
                                        </>
                                      ) : (
                                        <motion.span
                                          className={cn(
                                            "size-1.5 rounded-full",
                                            isActive ? "bg-primary" : "bg-muted-foreground/35",
                                          )}
                                          animate={isActive ? { opacity: [0.45, 1, 0.45] } : undefined}
                                          transition={
                                            isActive
                                              ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
                                              : undefined
                                          }
                                        />
                                      )}
                                    </div>
                                  </div>
                                  <div className="min-w-0 flex-1 text-sm leading-5">
                                    {isActive ? (
                                      <ShimmeringText
                                        text={step.label}
                                        duration={1.7}
                                        className="text-sm leading-5 [--color:var(--foreground)] [--shimmering-color:var(--foreground)]"
                                      />
                                    ) : (
                                      <span className={cn(isComplete ? "text-foreground/80" : "text-muted-foreground")}>
                                        {step.label}
                                      </span>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                            <AnimatePresence mode="wait" initial={false}>
                              {activeStepDetail ? (
                                <motion.div
                                  key={`${visibleSteps[activeLoadingStep]?.id}-detail`}
                                  layout="position"
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  transition={{ duration: 0.22, ease: "easeOut" }}
                                  className="pl-9 pr-2 text-xs leading-5 text-muted-foreground"
                                >
                                  {activeStepDetail}
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </>
                        );
                      })()}
                    </motion.div>
                  </motion.div>
                </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence initial={false} mode="popLayout">
          {messages.length > 0 ? (
            <motion.div
              key="atlas-sticky-composer"
              layout="position"
              transition={composerLayoutTransition}
              className="relative px-1 pb-1 pt-4 sm:px-2 sm:pb-2 sm:pt-5"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-b from-transparent via-background/88 to-background" />
              {renderComposer({ layoutId: "atlas-query-composer", sticky: true })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send to BDC / Export list</DialogTitle>
            <DialogDescription>
              Package this audience for your team or export the preview rows as a CSV.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={handleExportCsv}
              className="rounded-xs border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xs bg-primary/10 text-primary">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Export CSV</p>
                  <p className="text-sm text-muted-foreground">
                    Download the preview list for ops, reporting, or your BDC workflow.
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleCreateBdcHandoff}
              className="rounded-xs border border-border p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xs bg-primary/10 text-primary">
                  <Users className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Create BDC handoff</p>
                  <p className="text-sm text-muted-foreground">
                    Log this audience as a handoff so your BDC team can work the list next.
                  </p>
                </div>
              </div>
            </button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
