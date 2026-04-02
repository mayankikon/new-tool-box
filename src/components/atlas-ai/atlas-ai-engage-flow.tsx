"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Check, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  buildAtlasTieredOffers,
  buildCouponStrategyFromRows,
  computeEngageKpis,
} from "@/lib/atlas-ai/coupon-strategy";
import type { AtlasAiCampaignSuggestion, AtlasAiCustomerPreviewRow } from "@/lib/atlas-ai/types";
import { cn } from "@/lib/utils";

export function retentionScoreTone(score: number): string {
  if (score < 40) return "text-destructive";
  if (score < 70) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function retentionRingStrokeClass(score: number): string {
  if (score < 40) return "stroke-destructive";
  if (score < 70) return "stroke-amber-500";
  return "stroke-emerald-500";
}

/** Circular gauge: arc length follows retention %; stroke color matches risk band (red / amber / green). */
export function RetentionScoreRing({
  score,
  sizePx = 36,
}: {
  score: number;
  /** Total SVG box (width/height). */
  sizePx?: number;
}) {
  const strokeWidth = 2.5;
  const vb = 36;
  const cx = vb / 2;
  const cy = vb / 2;
  const r = (vb - strokeWidth) / 2 - 0.5;
  const circumference = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(1, score / 100)) * circumference;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: sizePx, height: sizePx }}
      role="img"
      aria-label={`Retention score ${score} out of 100`}
    >
      <svg
        width={sizePx}
        height={sizePx}
        viewBox={`0 0 ${vb} ${vb}`}
        className="absolute inset-0"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          className={cn(retentionRingStrokeClass(score), "transition-[stroke-dasharray] duration-300")}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <span
        className={cn(
          "relative z-[1] text-[11px] font-semibold leading-none tabular-nums",
          retentionScoreTone(score),
        )}
      >
        {score}
      </span>
    </div>
  );
}

const AGGRESSIVENESS_OPTIONS = [
  { id: "conservative" as const, label: "Conservative", offset: -2 },
  { id: "balanced" as const, label: "Balanced", offset: 0 },
  { id: "aggressive" as const, label: "Aggressive", offset: 2 },
] as const;

/** Shared with the main Atlas audience table for consistent Intelligent Coupon styling. */
export function intelligentCouponTierBadgeClassNames(tier: string) {
  if (tier === "aggressive") return "border-destructive/40 bg-destructive/10 text-destructive";
  if (tier === "moderate") return "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-100";
  return "border-emerald-500/35 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100";
}

function formatTierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

/**
 * Sizzle: rotating conic “ring” then the tier badge; panel/deploy: static badge only.
 * Kept in a fixed footprint so the table column width does not jump after reveal.
 */
export function IntelligentCouponRevealCell({
  discountPercent,
  tier,
  badgeClassName,
  rowIndex,
  variant,
}: {
  discountPercent: number;
  tier: string;
  badgeClassName: string;
  rowIndex: number;
  variant: "sizzle" | "static";
}) {
  const label = formatTierLabel(tier);
  const badge = (
    <Badge variant="outline" className={cn("rounded-xs font-normal tabular-nums", badgeClassName)}>
      {discountPercent}% · {label}
    </Badge>
  );

  if (variant === "static") {
    return (
      <div className="flex w-full min-w-0 max-w-full justify-start">{badge}</div>
    );
  }

  const ringFadeDelay = 0.28 + rowIndex * 0.055;
  const badgeRevealDelay = 0.38 + rowIndex * 0.055;

  return (
    <div className="relative flex h-10 w-full min-w-0 max-w-full items-center justify-start">
      <motion.div
        className="pointer-events-none absolute left-0 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: ringFadeDelay, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          className="absolute inset-0 animate-[spin_1.15s_linear_infinite] rounded-full p-[2px]"
          style={{
            background:
              "conic-gradient(from 0deg, hsl(var(--primary) / 0.12), hsl(var(--primary)), hsl(var(--primary) / 0.35), hsl(var(--primary) / 0.12))",
          }}
          aria-hidden
        >
          <span className="flex size-full items-center justify-center rounded-full bg-background shadow-[inset_0_0_0_1px_hsl(var(--border)/0.5)]" />
        </span>
      </motion.div>
      <motion.div
        className="relative z-[1]"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: badgeRevealDelay, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {badge}
      </motion.div>
    </div>
  );
}

interface AtlasAiEngagePanelProps {
  /** Used for KPI and tier summary only; the audience table stays in the main Atlas message. */
  rows: AtlasAiCustomerPreviewRow[];
  campaignTitle: string;
  onCampaignTitleChange: (value: string) => void;
  aggressivenessOffset: number;
  onAggressivenessOffsetChange: (value: number) => void;
  onDeploy: () => void;
  isDeploying: boolean;
  deployCompletedSteps: number;
  deploySteps: string[];
}

export function AtlasAiEngagePanel({
  rows,
  campaignTitle,
  onCampaignTitleChange,
  aggressivenessOffset,
  onAggressivenessOffsetChange,
  onDeploy,
  isDeploying,
  deployCompletedSteps,
  deploySteps,
}: AtlasAiEngagePanelProps) {
  const kpis = useMemo(
    () => computeEngageKpis(rows, aggressivenessOffset),
    [rows, aggressivenessOffset],
  );

  const tierSummary = useMemo(
    () => buildCouponStrategyFromRows(rows, aggressivenessOffset),
    [rows, aggressivenessOffset],
  );

  return (
    <div className="min-w-0 space-y-4 border-t border-border/60 pt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Engage This Audience</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Incentives scale inversely with retention. Adjust aggressiveness to see impact on cost vs. recovery.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <Button
            type="button"
            size="default"
            className="rounded-xs"
            disabled={isDeploying}
            onClick={onDeploy}
            leadingIcon={isDeploying ? <Loader2 className="size-4 animate-spin" /> : undefined}
          >
            {isDeploying ? "Deploying…" : "Deploy Campaign"}
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="atlas-campaign-title">
          Campaign Name
        </label>
        <Input
          id="atlas-campaign-title"
          value={campaignTitle}
          onChange={(e) => onCampaignTitleChange(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div
        className={cn(
          "grid min-w-0 gap-x-4 gap-y-3 sm:gap-y-0",
          "[grid-template-columns:repeat(2,minmax(0,1fr))] sm:[grid-template-columns:repeat(4,minmax(0,1fr))]",
        )}
      >
        <KpiStat label="Audience" value={String(kpis.audienceSize)} />
        <KpiStat label="Est. win-back" value={kpis.estimatedWinBackRate} />
        <KpiStat label="Est. coupon cost" value={kpis.estimatedCouponCost} />
        <KpiStat label="Est. recovery" value={kpis.estimatedRecoveryRevenue} />
      </div>

      <div className="min-w-0 space-y-2">
        <span className="text-xs font-medium text-muted-foreground">Incentive Aggressiveness</span>
        <div
          className="flex w-full max-w-full flex-wrap gap-1 rounded-lg border border-border/80 bg-muted/40 p-1"
          role="group"
          aria-label="Incentive aggressiveness"
        >
          {AGGRESSIVENESS_OPTIONS.map((opt) => {
            const isActive =
              opt.offset < 0
                ? aggressivenessOffset < 0
                : opt.offset > 0
                  ? aggressivenessOffset > 0
                  : aggressivenessOffset === 0;
            return (
              <Button
                key={opt.id}
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 min-w-0 flex-1 px-2 text-xs font-medium sm:min-w-[6.5rem]",
                  isActive && "bg-background shadow-sm",
                )}
                onClick={() => onAggressivenessOffsetChange(opt.offset)}
              >
                {opt.label}
              </Button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {tierSummary.tiers.map((t) => (
            <span key={t.tier} className="mr-3">
              {t.count} {t.tier} ({t.discountPercent}% avg)
            </span>
          ))}
        </p>
      </div>

      {isDeploying ? (
        <DeployStepper steps={deploySteps} completedSteps={deployCompletedSteps} />
      ) : null}
    </div>
  );
}

function KpiStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-border/50 sm:border-l sm:pl-4 sm:first:border-l-0 sm:first:pl-0">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold tabular-nums text-foreground" title={value}>
        {value}
      </p>
    </div>
  );
}

function DeployStepper({
  steps,
  completedSteps,
}: {
  steps: string[];
  /** How many steps are done (0–steps.length); spinner on index === completedSteps when &lt; length. */
  completedSteps: number;
}) {
  return (
    <ul className="space-y-1.5 border-t border-border/60 pt-3 text-xs text-muted-foreground">
      {steps.map((label, i) => {
        const done = i < completedSteps;
        const active = i === completedSteps && completedSteps < steps.length;
        return (
          <li key={label} className="flex items-center gap-2">
            {done ? (
              <Check className="size-3.5 shrink-0 text-emerald-600" />
            ) : active ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
            ) : (
              <span className="size-3.5 shrink-0 rounded-full border border-border" />
            )}
            <span className={done || active ? "text-foreground" : ""}>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function AtlasAiDeploySuccess({
  campaignTitle,
  audienceSize,
  tierSummaryLine,
  onViewCampaigns,
  onBack,
}: {
  campaignTitle: string;
  audienceSize: number;
  tierSummaryLine: string;
  onViewCampaigns: () => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 border-t border-border/60 pt-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <Check className="size-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Campaign Deployed Successfully</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {campaignTitle} · {audienceSize} customers · {tierSummaryLine}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" className="rounded-xs" onClick={onViewCampaigns}>
          View In Campaigns
        </Button>
        <Button type="button" size="sm" variant="secondary" className="rounded-xs" onClick={onBack}>
          Back To Atlas
        </Button>
      </div>
    </motion.div>
  );
}

export const ATLAS_DEPLOY_STEPS = [
  "Creating campaign…",
  "Assigning Intelligent Coupons…",
  "Scheduling delivery…",
  "Campaign live",
];

export function buildWizardDraftFromEngage(
  suggestion: AtlasAiCampaignSuggestion,
  campaignTitle: string,
  aggressivenessOffset: number,
) {
  return {
    name: campaignTitle || suggestion.title,
    type: suggestion.campaignType,
    templateId: suggestion.templateId ?? null,
    audienceSegments: suggestion.audienceSegments,
    audienceSize: suggestion.estimatedReach,
    trigger: suggestion.trigger,
    suggestedOffer: suggestion.suggestedOffer,
    suggestedOffers: buildAtlasTieredOffers(aggressivenessOffset),
  };
}
