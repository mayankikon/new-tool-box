"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  ChevronDown,
  Coins,
  Download,
  Gauge,
  MapPinned,
  PhoneCall,
  Route,
  ShieldAlert,
  Square,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import type {
  AtlasAiCampaignSuggestion,
  AtlasAiCustomerPreviewRow,
  AtlasAiHomeModule,
  AtlasAiMessage,
  AtlasAiResponse,
} from "@/lib/atlas-ai/types";
import type { AudienceSegment, CampaignOffer } from "@/lib/campaigns/types";
import {
  ATLAS_DEPLOY_STEPS,
  AtlasAiDeploySuccess,
  AtlasAiEngagePanel,
  IntelligentCouponRevealCell,
  intelligentCouponTierBadgeClassNames,
  RetentionScoreRing,
} from "@/components/atlas-ai/atlas-ai-engage-flow";
import {
  buildCouponStrategyFromRows,
  computeIntelligentCoupon,
  estimateCouponValueDollars,
} from "@/lib/atlas-ai/coupon-strategy";

interface AtlasAiCampaignDraft {
  name: string;
  type: AtlasAiCampaignSuggestion["campaignType"];
  templateId: string | null;
  audienceSegments: AudienceSegment[];
  audienceSize: number;
  trigger?: AtlasAiCampaignSuggestion["trigger"];
  suggestedOffer?: AtlasAiCampaignSuggestion["suggestedOffer"];
  suggestedOffers?: Partial<CampaignOffer>[];
}

type AtlasEngagePhase = "idle" | "sizzling" | "panel" | "deploying" | "success";

interface AtlasMessageEngageState {
  phase: AtlasEngagePhase;
  aggressivenessOffset: number;
  campaignTitle: string;
  deployStep: number;
}

interface AtlasAiPageProps {
  /** Reserved for future flows that open the campaign wizard from Atlas (e.g. deep links). */
  onCreateCampaign?: (draft: AtlasAiCampaignDraft) => void;
  /** Optional: after deploy success, jump to Campaigns tab */
  onNavigateToCampaigns?: () => void;
}

/** Show this many rows before the gradient + Expand Table control (after row reveal completes). */
const ATLAS_AUDIENCE_COLLAPSED_VISIBLE_ROWS = 5;

/**
 * Shared max width for Ask Atlas (home modules, composer, messages, thinking).
 * Uses `max-w-5xl` so the audience table keeps room when Intelligent Coupon / Est. Value columns appear.
 */
const ATLAS_CONTENT_MAX_WIDTH_CLASS = "max-w-5xl";

function downloadAtlasAudiencePreviewCsv(rows: AtlasAiCustomerPreviewRow[]) {
  const headers = [
    "Customer",
    "Vehicle",
    "Retention score",
    "Last service",
    "Reason",
    "Priority",
  ] as const;

  const escapeCell = (value: string | number | undefined) => {
    const raw = value == null ? "" : String(value);
    if (/[",\n\r]/.test(raw)) {
      return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.name,
        row.vehicle,
        row.retentionScore,
        row.lastServiceDate ?? "",
        row.serviceDueReason ?? "",
        row.priority,
      ]
        .map(escapeCell)
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `atlas-audience-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

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
  "triangle-alert": TriangleAlert,
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

  if (normalizedQuery.includes("dtc") || normalizedQuery.includes("error code") || normalizedQuery.includes("diagnostic trouble")) {
    steps.push(
      {
        id: "dtc-scan",
        label: "Scanning recent diagnostic trouble code activity across your fleet",
        detail: "Checking VIN-level DTC triggers from the past week.",
        durationMs: 1700 + ((seed >> 2) % 3) * 200,
      },
      {
        id: "dtc-severity",
        label: "Ranking DTC severity and service urgency",
        detail: "Mapping codes to repair categories and estimating diagnostic revenue.",
        durationMs: 1500 + ((seed >> 3) % 3) * 180,
      },
    );
  } else if (normalizedQuery.includes("recall")) {
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

export function AtlasAiPage({ onNavigateToCampaigns }: AtlasAiPageProps) {
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
  const [engageByMessage, setEngageByMessage] = useState<
    Record<string, AtlasMessageEngageState>
  >({});
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
    setEngageByMessage({});
    setLoadingSteps([]);
    setVisibleLoadingStepCount(0);
    setActiveLoadingStep(0);
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

  const engageSizzleTimersRef = useRef<Record<string, number>>({});

  const handleExportAudiencePreview = useCallback((rows: AtlasAiCustomerPreviewRow[]) => {
    downloadAtlasAudiencePreviewCsv(rows);
  }, []);

  const startEngageAudience = useCallback(
    (messageId: string, response: AtlasAiResponse) => {
      const rows = response.audiencePreview?.rows;
      if (!rows?.length) return;

      const title = response.headline.slice(0, 120);
      setEngageByMessage((prev) => ({
        ...prev,
        [messageId]: {
          phase: "sizzling",
          aggressivenessOffset: 0,
          campaignTitle: title,
          deployStep: 0,
        },
      }));

      const ms = Math.min(rows.length * 72 + 800, 3200);
      const tid = window.setTimeout(() => {
        setEngageByMessage((prev) => {
          const cur = prev[messageId];
          if (!cur || cur.phase !== "sizzling") {
            return prev;
          }
          return {
            ...prev,
            [messageId]: { ...cur, phase: "panel" },
          };
        });
      }, ms);
      engageSizzleTimersRef.current[messageId] = tid;
    },
    [],
  );

  const handleDeployFromEngage = useCallback(async (messageId: string) => {
    setEngageByMessage((prev) => {
      const cur = prev[messageId];
      if (!cur) return prev;
      return {
        ...prev,
        [messageId]: { ...cur, phase: "deploying", deployStep: 0 },
      };
    });

    for (let completed = 0; completed < 4; completed += 1) {
      await new Promise((resolve) => {
        window.setTimeout(resolve, 700);
      });
      setEngageByMessage((prev) => {
        const cur = prev[messageId];
        if (!cur || cur.phase !== "deploying") {
          return prev;
        }
        return {
          ...prev,
          [messageId]: { ...cur, deployStep: completed + 1 },
        };
      });
    }

    setEngageByMessage((prev) => {
      const cur = prev[messageId];
      if (!cur) return prev;
      return {
        ...prev,
        [messageId]: { ...cur, phase: "success" },
      };
    });
  }, []);

  const handleBackFromEngageSuccess = useCallback((messageId: string) => {
    setEngageByMessage((prev) => {
      const next = { ...prev };
      delete next[messageId];
      return next;
    });
  }, []);

  const scheduleAssistantReveal = useCallback(
    (messageId: string, response: AtlasAiResponse) => {
      setRevealedSectionsByMessage((current) => ({ ...current, [messageId]: 1 }));

      const delay = 400;

      if (response.audiencePreview) {
        const rowCount = response.audiencePreview.rows.length;
        const audienceCardTimeoutId = window.setTimeout(() => {
          setRevealedSectionsByMessage((current) => ({
            ...current,
            [messageId]: 2,
          }));
          setRevealedRowsByMessage((current) => ({
            ...current,
            [messageId]: rowCount,
          }));
        }, delay);
        revealTimeoutsRef.current.push(audienceCardTimeoutId);
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

  const renderHomeModules = useCallback(
    (modules: AtlasAiHomeModule[]) => (
      <div
        className={cn(
          "mx-auto grid w-full gap-2.5 sm:grid-cols-2 lg:grid-cols-3",
          ATLAS_CONTENT_MAX_WIDTH_CLASS,
        )}
      >
        {modules.map((module, index) => {
          const Icon = module.iconKey ? homeModuleIcons[module.iconKey] : Sparkles;
          const accentClasses = [
            "bg-[linear-gradient(135deg,rgba(226,239,236,0.96)_0%,rgba(233,243,241,0.98)_52%,rgba(223,235,232,0.98)_100%)] dark:bg-[linear-gradient(135deg,rgba(16,24,24,0.72)_0%,rgba(22,32,31,0.62)_52%,rgba(16,24,24,0.72)_100%)]",
            "bg-[linear-gradient(135deg,rgba(223,238,237,0.97)_0%,rgba(232,242,241,0.98)_52%,rgba(220,233,231,0.98)_100%)] dark:bg-[linear-gradient(135deg,rgba(16,24,24,0.72)_0%,rgba(22,32,31,0.62)_52%,rgba(16,24,24,0.72)_100%)]",
            "bg-[linear-gradient(135deg,rgba(228,240,235,0.96)_0%,rgba(234,243,239,0.98)_52%,rgba(223,236,231,0.98)_100%)] dark:bg-[linear-gradient(135deg,rgba(20,24,20,0.72)_0%,rgba(30,34,27,0.62)_52%,rgba(20,24,20,0.72)_100%)]",
            "bg-[linear-gradient(135deg,rgba(223,240,233,0.96)_0%,rgba(232,243,238,0.98)_52%,rgba(219,234,227,0.98)_100%)] dark:bg-[linear-gradient(135deg,rgba(16,24,20,0.72)_0%,rgba(20,33,28,0.62)_52%,rgba(16,24,20,0.72)_100%)]",
            "bg-[linear-gradient(135deg,rgba(223,239,236,0.97)_0%,rgba(232,242,240,0.98)_52%,rgba(220,233,230,0.98)_100%)] dark:bg-[linear-gradient(135deg,rgba(16,24,24,0.72)_0%,rgba(20,32,32,0.62)_52%,rgba(16,24,24,0.72)_100%)]",
            "bg-[linear-gradient(135deg,rgba(223,239,239,0.97)_0%,rgba(232,242,242,0.98)_52%,rgba(220,233,233,0.98)_100%)] dark:bg-[linear-gradient(135deg,rgba(16,24,24,0.72)_0%,rgba(20,31,34,0.62)_52%,rgba(16,24,24,0.72)_100%)]",
          ];
          const recallOpportunityAccentClass = accentClasses[1];
          const accentClass =
            module.id === "atlas-home-defection"
              ? recallOpportunityAccentClass
              : accentClasses[index % accentClasses.length];

          return (
            <motion.button
              key={module.id}
              type="button"
              layout="position"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.995 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setQuery(module.prompt)}
              className="group overflow-hidden rounded-md border border-border/70 bg-card text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-[border-color,background-color,transform,box-shadow] duration-200 hover:border-primary/25 hover:bg-card hover:shadow-[0_6px_18px_rgba(16,24,40,0.07)] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.45)]"
            >
              <div
                className={cn(
                  "relative overflow-hidden border-b border-border/60 px-3 py-2",
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
                <div className="relative flex min-h-[56px] items-center justify-center">
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
        className={cn(
          "mx-auto w-full flex-none",
          ATLAS_CONTENT_MAX_WIDTH_CLASS,
          sticky && "origin-bottom",
        )}
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
              "mx-auto flex w-full flex-col gap-5 px-1 pb-5 pt-1 sm:px-2 sm:pb-8 sm:pt-2",
              ATLAS_CONTENT_MAX_WIDTH_CLASS,
              messages.length === 0 && "min-h-full justify-start pt-4 sm:pt-6",
            )}
          >
            {messages.length > 0 ? (
              <div
                className={cn(
                  "mx-auto flex w-full justify-start px-1",
                  ATLAS_CONTENT_MAX_WIDTH_CLASS,
                )}
              >
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
                className={cn(
                  "mx-auto flex w-full flex-col items-center px-4 py-4 text-center sm:px-5 sm:py-5",
                  ATLAS_CONTENT_MAX_WIDTH_CLASS,
                )}
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
                <div
                  key={message.id}
                  className={cn(
                    "mx-auto flex w-full justify-end pl-10 sm:pl-16",
                    ATLAS_CONTENT_MAX_WIDTH_CLASS,
                  )}
                >
                  <Card
                    size="sm"
                    className="max-w-3xl border-border/80 bg-card py-0 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                  >
                    <CardContent className="px-4 py-1 text-sm leading-6 text-foreground">
                      {message.text}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div
                  key={message.id}
                  className={cn(
                    "mx-auto w-full min-w-0 space-y-4",
                    ATLAS_CONTENT_MAX_WIDTH_CLASS,
                  )}
                >
                  <div className="flex items-center gap-3 pl-[calc(theme(spacing.1)-6px)] pr-1">
                    <AtlasAiLogo className="size-10" imageClassName="size-8" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">Atlas AI</p>
                      <p className="text-xs text-muted-foreground">
                        Customer discovery summary
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <h3 className="text-base font-semibold text-foreground">Atlas Found</h3>
                          <p className="text-sm text-muted-foreground">{message.response?.headline}</p>
                        </div>
                        <p className="text-sm leading-6 text-foreground">{message.response?.summary}</p>
                      </div>
                    </div>

                    {message.response?.audiencePreview &&
                    (revealedSectionsByMessage[message.id] ?? 999) >= 2 &&
                    engageByMessage[message.id]?.phase !== "success" ? (
                      <div>
                          {(() => {
                            const engagePhase = engageByMessage[message.id]?.phase ?? "idle";
                            const aggressivenessForCoupons =
                              engagePhase === "panel" || engagePhase === "deploying"
                                ? (engageByMessage[message.id]?.aggressivenessOffset ?? 0)
                                : 0;

                            const visibleRows = message.response!.audiencePreview!.rows.slice(
                              0,
                              revealedRowsByMessage[message.id] ??
                                message.response!.audiencePreview!.rows.length,
                            );
                            const totalAudienceRows = message.response!.audiencePreview!.rows.length;
                            const revealedAudienceRowCount =
                              revealedRowsByMessage[message.id] ?? totalAudienceRows;
                            const isAudienceRevealComplete =
                              revealedAudienceRowCount >= totalAudienceRows;
                            const isAudienceTableExpanded =
                              audienceTableExpandedByMessage[message.id] ?? false;
                            const shouldCollapseAudienceTable =
                              visibleRows.length > ATLAS_AUDIENCE_COLLAPSED_VISIBLE_ROWS &&
                              isAudienceRevealComplete &&
                              !isAudienceTableExpanded;

                            const showIntelligentCouponColumn =
                              engagePhase === "sizzling" ||
                              engagePhase === "panel" ||
                              engagePhase === "deploying";
                            const showEstValueColumn =
                              engagePhase === "panel" || engagePhase === "deploying";

                            const totalCount = message.response!.audiencePreview!.totalCount;

                            const showEngageControls =
                              engagePhase === "panel" || engagePhase === "deploying";

                            return (
                              <div className="min-w-0 w-full max-w-full space-y-3">
                                {showEngageControls && message.response ? (
                                  <AtlasAiEngagePanel
                                    rows={message.response.audiencePreview!.rows}
                                    campaignTitle={engageByMessage[message.id]!.campaignTitle}
                                    onCampaignTitleChange={(value) => {
                                      setEngageByMessage((prev) => {
                                        const cur = prev[message.id];
                                        if (!cur) return prev;
                                        return {
                                          ...prev,
                                          [message.id]: { ...cur, campaignTitle: value },
                                        };
                                      });
                                    }}
                                    aggressivenessOffset={engageByMessage[message.id]!.aggressivenessOffset}
                                    onAggressivenessOffsetChange={(value) => {
                                      setEngageByMessage((prev) => {
                                        const cur = prev[message.id];
                                        if (!cur) return prev;
                                        return {
                                          ...prev,
                                          [message.id]: { ...cur, aggressivenessOffset: value },
                                        };
                                      });
                                    }}
                                    onDeploy={() => void handleDeployFromEngage(message.id)}
                                    isDeploying={engageByMessage[message.id]!.phase === "deploying"}
                                    deployCompletedSteps={engageByMessage[message.id]!.deployStep}
                                    deploySteps={ATLAS_DEPLOY_STEPS}
                                  />
                                ) : null}

                                <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-x-6 sm:gap-y-0">
                                  <div className="min-w-0 space-y-1">
                                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                                      Customers To Act On
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      <span className="font-medium text-foreground">{totalCount}</span>{" "}
                                      customers matched
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:justify-end sm:pt-0.5">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="secondary"
                                      className="rounded-xs"
                                      leadingIcon={<Download className="size-3.5" />}
                                      onClick={() =>
                                        handleExportAudiencePreview(
                                          message.response!.audiencePreview!.rows,
                                        )
                                      }
                                    >
                                      Export
                                    </Button>
                                    {engagePhase === "idle" || engageByMessage[message.id] == null ? (
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="default"
                                        className="rounded-xs"
                                        leadingIcon={<Sparkles className="size-3.5" />}
                                        onClick={() =>
                                          message.response &&
                                          startEngageAudience(message.id, message.response)
                                        }
                                      >
                                        Engage Audience
                                      </Button>
                                    ) : engagePhase === "sizzling" ? (
                                      <span className="flex items-center gap-1.5 text-xs text-primary">
                                        <Sparkles className="size-3.5 shrink-0 text-primary" />
                                        Assigning Intelligent Coupons…
                                      </span>
                                    ) : null}
                                  </div>
                                </div>

                                {message.response!.couponStrategy &&
                                isAudienceRevealComplete &&
                                engagePhase === "idle" ? (
                                  <p className="text-xs text-muted-foreground">
                                    Baseline recovery estimate{" "}
                                    <span className="font-medium text-foreground">
                                      {message.response.couponStrategy.estimatedRecoveryRevenue}
                                    </span>{" "}
                                    at estimated coupon cost{" "}
                                    <span className="font-medium text-foreground">
                                      {message.response.couponStrategy.estimatedCouponCost}
                                    </span>
                                    . Engage to tune incentives.
                                  </p>
                                ) : null}

                                <div className="relative min-w-0">
                                  <div
                                    id={`atlas-audience-table-${message.id}`}
                                    className={cn(
                                      shouldCollapseAudienceTable &&
                                        "max-h-[min(23rem,68vh)] overflow-hidden",
                                    )}
                                  >
                                    <Table
                                      containerClassName="min-w-0 max-w-full"
                                      className="w-full min-w-0 table-auto"
                                    >
                                      <TableHeader>
                                        <TableRow size="compact">
                                          <TableHead className="min-w-[7rem] max-w-[11rem]">
                                            Customer
                                          </TableHead>
                                          <TableHead className="min-w-[7rem] max-w-[10rem]">
                                            Vehicle
                                          </TableHead>
                                          <TableHead className="w-[4.5rem] min-w-[4.5rem]">
                                            Retention
                                          </TableHead>
                                          <TableHead className="min-w-[7.5rem] whitespace-nowrap">
                                            Last Service
                                          </TableHead>
                                          <TableHead className="min-w-[9rem] max-w-[16rem]">
                                            Reason
                                          </TableHead>
                                          <TableHead className="min-w-[6.5rem] whitespace-nowrap">
                                            Priority
                                          </TableHead>
                                          {showIntelligentCouponColumn ? (
                                            <TableHead className="min-w-[12rem] max-w-[14rem] whitespace-normal text-left leading-tight">
                                              Intelligent Coupon
                                            </TableHead>
                                          ) : null}
                                          {showEstValueColumn ? (
                                            <TableHead className="min-w-[6rem] whitespace-nowrap text-right">
                                              Est. Value
                                            </TableHead>
                                          ) : null}
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {visibleRows.map((row, rowIndex) => {
                                          const coupon = computeIntelligentCoupon(
                                            row.retentionScore,
                                            aggressivenessForCoupons,
                                          );
                                          return (
                                            <TableRow key={row.id} size="compact">
                                              <TableCell className="max-w-[11rem] truncate font-medium">
                                                {row.name}
                                              </TableCell>
                                              <TableCell className="max-w-[10rem] truncate">
                                                {row.vehicle}
                                              </TableCell>
                                              <TableCell className="w-[4.5rem]">
                                                <RetentionScoreRing score={row.retentionScore} />
                                              </TableCell>
                                              <TableCell className="min-w-[7.5rem] whitespace-nowrap tabular-nums text-muted-foreground">
                                                {row.lastServiceDate ?? "N/A"}
                                              </TableCell>
                                              <TableCell className="max-w-[16rem] whitespace-normal text-muted-foreground">
                                                {row.serviceDueReason ?? "No additional detail"}
                                              </TableCell>
                                              <TableCell className="min-w-[6.5rem] whitespace-nowrap align-middle">
                                                <Badge
                                                  variant={priorityBadgeVariant(row.priority)}
                                                  className="rounded-xs whitespace-nowrap"
                                                >
                                                  {priorityLabel(row.priority)}
                                                </Badge>
                                              </TableCell>
                                              {showIntelligentCouponColumn ? (
                                                <TableCell className="min-w-[12rem] max-w-[14rem] align-middle">
                                                  <IntelligentCouponRevealCell
                                                    discountPercent={coupon.discountPercent}
                                                    tier={coupon.tier}
                                                    badgeClassName={intelligentCouponTierBadgeClassNames(
                                                      coupon.tier,
                                                    )}
                                                    rowIndex={rowIndex}
                                                    variant={
                                                      engagePhase === "sizzling" ? "sizzle" : "static"
                                                    }
                                                  />
                                                </TableCell>
                                              ) : null}
                                              {showEstValueColumn ? (
                                                <TableCell className="min-w-[6rem] whitespace-nowrap text-right tabular-nums text-muted-foreground">
                                                  ${estimateCouponValueDollars(row, aggressivenessForCoupons)}
                                                </TableCell>
                                              ) : null}
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                  {shouldCollapseAudienceTable ? (
                                    <div
                                      className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/90 to-transparent pb-1 pt-16"
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
                                          Expand Table
                                          <span className="ml-1.5 text-xs font-normal text-muted-foreground tabular-nums">
                                            · {visibleRows.length} Rows
                                          </span>
                                        </Button>
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })()}
                      </div>
                    ) : null}

                    {message.response?.audiencePreview &&
                    engageByMessage[message.id]?.phase === "success" ? (
                      <div className="px-1">
                        <AtlasAiDeploySuccess
                          campaignTitle={
                            engageByMessage[message.id]?.campaignTitle ?? "Atlas campaign"
                          }
                          audienceSize={message.response.audiencePreview.rows.length}
                          tierSummaryLine={buildCouponStrategyFromRows(
                            message.response.audiencePreview.rows,
                            engageByMessage[message.id]?.aggressivenessOffset ?? 0,
                          )
                            .tiers.map((t) => `${t.count} ${t.tier} (${t.discountPercent}%)`)
                            .join(" · ")}
                          onViewCampaigns={() => {
                            onNavigateToCampaigns?.();
                            handleBackFromEngageSuccess(message.id);
                          }}
                          onBack={() => handleBackFromEngageSuccess(message.id)}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ),
            )}

            <AnimatePresence mode="wait" initial={false}>
              {isThinking ? (
                <motion.div
                  key="atlas-thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className={cn("mx-auto w-full", ATLAS_CONTENT_MAX_WIDTH_CLASS)}
                >
                  <div className="w-full py-4">
                    <div className="space-y-4">
                    <div className="flex items-center gap-3 pl-[calc(theme(spacing.1)-6px)] pr-1">
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
                        <AtlasAiLogo
                          className="relative z-10 size-10"
                          imageClassName="size-8 drop-shadow-[0_0_16px_rgba(26,147,117,0.28)]"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          Atlas AI is generating your result
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Thinking through your audience and building the response
                        </p>
                      </div>
                    </div>

                    <div className="pl-1">
                      <p className="text-sm leading-6 text-muted-foreground">
                        Reading dealership signals, sizing opportunity, and lining up the
                        next best move for your team.
                      </p>
                    </div>

                    <div className="w-full max-w-3xl space-y-2 text-left">
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
                                  <div className="relative flex w-4 shrink-0 flex-col items-center self-stretch pt-0.5">
                                    {!isLast ? (
                                      <div
                                        className="pointer-events-none absolute left-1/2 top-[calc(0.125rem+1rem-1px)] bottom-[-1.5rem] w-px -translate-x-1/2 overflow-hidden rounded-full"
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
                    </div>
                  </div>
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
    </div>
  );
}
