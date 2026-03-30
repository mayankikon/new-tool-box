"use client";

import type { ReactNode } from "react";
import {
  BadgePercent,
  CalendarClock,
  CarFront,
  FileText,
  Handshake,
  MessageSquareText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  MarketingTemplateCard,
  TemplateAccentVariant,
  TemplateIconKey,
} from "@/lib/templates/mock-data";

export const marketingTemplateIconMap: Record<TemplateIconKey, LucideIcon> = {
  handshake: Handshake,
  calendar: CalendarClock,
  sparkles: Sparkles,
  wrench: Wrench,
  shield: ShieldCheck,
  "message-square": MessageSquareText,
  "badge-percent": BadgePercent,
  "car-front": CarFront,
  refresh: RefreshCw,
  search: Search,
  star: Star,
};

const accentClassMap: Record<TemplateAccentVariant, string> = {
  primary: "from-primary/14 via-primary/8 to-transparent",
  sky: "from-sky-500/12 via-primary/8 to-transparent",
  amber: "from-amber-500/14 via-primary/8 to-transparent",
  emerald: "from-emerald-500/14 via-primary/8 to-transparent",
  teal: "from-teal-500/12 via-primary/8 to-transparent",
  rose: "from-rose-500/14 via-primary/8 to-transparent",
};

const accentGlowClassMap: Record<TemplateAccentVariant, string> = {
  primary: cn(
    "bg-[radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.08),transparent_42%)]",
    "dark:bg-[radial-gradient(circle_at_bottom_right,color-mix(in_oklab,var(--primary)_38%,transparent),transparent_52%)]",
  ),
  sky: cn(
    "bg-[radial-gradient(circle_at_bottom_right,rgba(14,116,144,0.08),transparent_42%)]",
    "dark:bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.14),transparent_52%)]",
  ),
  amber: cn(
    "bg-[radial-gradient(circle_at_bottom_right,rgba(217,119,6,0.08),transparent_42%)]",
    "dark:bg-[radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_52%)]",
  ),
  emerald: cn(
    "bg-[radial-gradient(circle_at_bottom_right,rgba(5,150,105,0.08),transparent_42%)]",
    "dark:bg-[radial-gradient(circle_at_bottom_right,rgba(52,211,153,0.12),transparent_52%)]",
  ),
  teal: cn(
    "bg-[radial-gradient(circle_at_bottom_right,rgba(13,148,136,0.08),transparent_42%)]",
    "dark:bg-[radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.14),transparent_52%)]",
  ),
  rose: cn(
    "bg-[radial-gradient(circle_at_bottom_right,rgba(225,29,72,0.08),transparent_42%)]",
    "dark:bg-[radial-gradient(circle_at_bottom_right,rgba(251,113,133,0.12),transparent_52%)]",
  ),
};

/** Light: soft wash behind the preview; dark: diagonal deep surfaces with a hint of accent hue. */
const previewSurfaceClassMap: Record<TemplateAccentVariant, string> = {
  primary: cn(
    "bg-[linear-gradient(180deg,rgba(245,247,250,0.98),rgba(238,242,247,0.95))]",
    "dark:bg-[linear-gradient(165deg,rgb(28_40_42)_0%,rgb(22_28_30)_48%,rgb(16_20_22)_100%)]",
  ),
  sky: cn(
    "bg-[linear-gradient(180deg,rgba(245,247,250,0.98),rgba(238,242,247,0.95))]",
    "dark:bg-[linear-gradient(165deg,rgb(26_34_44)_0%,rgb(22_26_34)_48%,rgb(16_20_26)_100%)]",
  ),
  amber: cn(
    "bg-[linear-gradient(180deg,rgba(250,249,244,0.98),rgba(246,243,232,0.95))]",
    "dark:bg-[linear-gradient(165deg,rgb(38_34_28)_0%,rgb(28_26_22)_48%,rgb(20_18_16)_100%)]",
  ),
  emerald: cn(
    "bg-[linear-gradient(180deg,rgba(244,248,246,0.98),rgba(235,242,238,0.95))]",
    "dark:bg-[linear-gradient(165deg,rgb(24_36_32)_0%,rgb(20_28_26)_48%,rgb(14_20_18)_100%)]",
  ),
  teal: cn(
    "bg-[linear-gradient(180deg,rgba(243,247,247,0.98),rgba(234,240,240,0.95))]",
    "dark:bg-[linear-gradient(165deg,rgb(24_38_38)_0%,rgb(20_30_30)_48%,rgb(14_22_22)_100%)]",
  ),
  rose: cn(
    "bg-[linear-gradient(180deg,rgba(249,245,247,0.98),rgba(243,236,240,0.95))]",
    "dark:bg-[linear-gradient(165deg,rgb(40_28_34)_0%,rgb(30_22_26)_48%,rgb(20_16_18)_100%)]",
  ),
};

const previewBubbleClassMap: Record<TemplateAccentVariant, string> = {
  primary: cn(
    "bg-[#dce7ff] text-[#1b2a44]",
    "dark:bg-blue-950/55 dark:text-blue-100",
  ),
  sky: cn(
    "bg-[#ddeaff] text-[#1f314e]",
    "dark:bg-sky-950/50 dark:text-sky-100",
  ),
  amber: cn(
    "bg-[#fff0bf] text-[#4f3a0a]",
    "dark:bg-amber-950/45 dark:text-amber-100",
  ),
  emerald: cn(
    "bg-[#dff2e8] text-[#1d4130]",
    "dark:bg-emerald-950/45 dark:text-emerald-100",
  ),
  teal: cn(
    "bg-[#dcefed] text-[#193d39]",
    "dark:bg-teal-950/45 dark:text-teal-100",
  ),
  rose: cn(
    "bg-[#f8dceb] text-[#4a2136]",
    "dark:bg-rose-950/45 dark:text-rose-100",
  ),
};

const previewPaperClassMap: Record<TemplateAccentVariant, string> = {
  primary: cn("bg-white text-foreground"),
  sky: cn("bg-white text-foreground"),
  amber: cn(
    "bg-[#fffdfa] text-[#2b2419]",
    "dark:bg-zinc-900 dark:text-zinc-100",
  ),
  emerald: cn(
    "bg-[#fffefe] text-[#1f2723]",
    "dark:bg-zinc-900 dark:text-zinc-100",
  ),
  teal: cn(
    "bg-[#fffefe] text-[#1f2626]",
    "dark:bg-zinc-900 dark:text-zinc-100",
  ),
  rose: cn(
    "bg-[#fffdfd] text-[#2c2127]",
    "dark:bg-zinc-900 dark:text-zinc-100",
  ),
};

export function MarketingTemplatePreviewArtifact({
  template,
  className,
}: {
  template: MarketingTemplateCard;
  className?: string;
}) {
  const Icon = marketingTemplateIconMap[template.iconKey];
  return (
    <div
      className={cn(
        "relative flex min-h-[92px] w-[82%] max-w-[278px] flex-col justify-center rounded-[16px] border border-border px-4 py-3 text-left shadow-[0_16px_35px_rgba(17,24,39,0.12),0_2px_6px_rgba(17,24,39,0.06)]",
        "dark:shadow-[0_16px_35px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.35)]",
        previewPaperClassMap[template.accentVariant],
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
            previewBubbleClassMap[template.accentVariant],
          )}
        >
          <Icon className="size-4" />
        </div>
        <p className="line-clamp-3 pt-0.5 text-[11px] leading-4 text-foreground/80">
          {template.previewContent}
        </p>
      </div>
    </div>
  );
}

/** Neutral preview strip for “start from scratch” — matches library card layout with a blank canvas. */
export function WizardScratchPreviewStrip() {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border/60 px-3 py-4",
        "bg-[linear-gradient(180deg,rgba(250,250,250,1),rgba(245,245,246,0.98))]",
        "dark:bg-[linear-gradient(165deg,rgb(30_30_32)_0%,rgb(22_22_24)_100%)]",
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-90",
          "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.9),transparent_50%)]",
          "dark:bg-[radial-gradient(ellipse_120%_90%_at_0%_0%,color-mix(in_oklab,var(--muted)_18%,transparent),transparent_55%)]",
        )}
      />
      <div className="relative flex min-h-[120px] items-center justify-center">
        <div
          className={cn(
            "relative flex min-h-[92px] w-[82%] max-w-[278px] flex-col items-center justify-center rounded-[16px] border border-border bg-white px-4 py-3 text-center shadow-[0_16px_35px_rgba(17,24,39,0.12),0_2px_6px_rgba(17,24,39,0.06)]",
            "dark:bg-zinc-900 dark:shadow-[0_16px_35px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.35)]",
          )}
        >
          <div className="flex size-10 items-center justify-center rounded-full bg-muted/80 text-muted-foreground dark:bg-zinc-800 dark:text-zinc-400">
            <FileText className="size-5" />
          </div>
          <p className="mt-2 text-[11px] leading-4 text-muted-foreground">
            Blank campaign — you choose every channel
          </p>
        </div>
      </div>
    </div>
  );
}

export function MarketingTemplateLibraryHeroStrip({
  template,
  children,
  minHeightClassName = "min-h-[158px]",
}: {
  template: MarketingTemplateCard;
  children: ReactNode;
  minHeightClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border/60 px-3 py-4",
        accentClassMap[template.accentVariant],
        previewSurfaceClassMap[template.accentVariant],
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-90",
          "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.82),transparent_48%)]",
          "dark:bg-[radial-gradient(ellipse_120%_90%_at_0%_0%,color-mix(in_oklab,var(--primary)_26%,transparent),transparent_58%)] dark:opacity-100",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-90",
          accentGlowClassMap[template.accentVariant],
        )}
      />
      <div
        className={cn(
          "relative flex items-center justify-center",
          minHeightClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
