"use client";

import {
  Battery,
  CircleDot,
  Disc2,
  Droplets,
  PenLine,
  Wrench,
} from "lucide-react";
import { accentPresetTitle, cornerStyleTitle } from "@/lib/campaigns/coupon-builder-copy";
import {
  COUPON_ACCENT_CLASSES,
  COUPON_BADGE_LABELS,
} from "@/lib/campaigns/coupon-templates";
import type {
  CouponAccentPreset,
  CouponBadgeKind,
  CouponCornerStyle,
} from "@/lib/campaigns/types";
import { cn } from "@/lib/utils";

const BADGE_KINDS: CouponBadgeKind[] = [
  "oil",
  "brake",
  "battery",
  "tire",
  "general",
  "custom",
];

const BADGE_ICONS: Record<CouponBadgeKind, typeof Droplets> = {
  oil: Droplets,
  brake: Disc2,
  battery: Battery,
  tire: CircleDot,
  general: Wrench,
  custom: PenLine,
};

const ACCENT_PRESETS: CouponAccentPreset[] = [
  "blue",
  "emerald",
  "amber",
  "rose",
  "slate",
  "violet",
];

const CORNER_ORDER: CouponCornerStyle[] = ["sharp", "rounded", "pill"];

const optionButtonBase =
  "rounded-lg border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function CornerShapePreview({ style }: { style: CouponCornerStyle }) {
  if (style === "pill") {
    return (
      <div
        className="h-8 w-[4.5rem] rounded-full border-2 border-muted-foreground/40 bg-background shadow-sm"
        aria-hidden
      />
    );
  }
  if (style === "sharp") {
    return (
      <div
        className="h-8 w-[4.5rem] rounded-none border-2 border-muted-foreground/40 bg-background shadow-sm"
        aria-hidden
      />
    );
  }
  return (
    <div
      className="h-8 w-[4.5rem] rounded-xl border-2 border-muted-foreground/40 bg-background shadow-sm"
      aria-hidden
    />
  );
}

export function CouponBadgeKindPicker({
  value,
  onChange,
  className,
}: {
  value: CouponBadgeKind;
  onChange: (next: CouponBadgeKind) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Coupon badge type"
      className={cn("flex flex-wrap gap-2", className)}
    >
      {BADGE_KINDS.map((kind) => {
        const Icon = BADGE_ICONS[kind];
        const selected = value === kind;
        const label = COUPON_BADGE_LABELS[kind];
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(kind)}
            className={cn(
              optionButtonBase,
              "flex min-w-[4.75rem] flex-col items-center gap-1.5 px-2 py-2.5",
              selected
                ? "border-primary bg-primary/[0.07] shadow-sm"
                : "border-border bg-card hover:bg-muted/45",
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0",
                selected ? "text-primary" : "text-muted-foreground",
              )}
              aria-hidden
            />
            <span className="text-[11px] font-medium leading-tight text-foreground">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function CouponAccentPresetPicker({
  value,
  onChange,
  className,
}: {
  value: CouponAccentPreset;
  onChange: (next: CouponAccentPreset) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Accent color"
      className={cn("grid grid-cols-3 gap-2 sm:grid-cols-6", className)}
    >
      {ACCENT_PRESETS.map((preset) => {
        const selected = value === preset;
        const accent = COUPON_ACCENT_CLASSES[preset];
        const title = accentPresetTitle(preset);
        return (
          <button
            key={preset}
            type="button"
            aria-pressed={selected}
            aria-label={title}
            onClick={() => onChange(preset)}
            className={cn(
              optionButtonBase,
              "flex flex-col items-center gap-2 px-2 py-2.5",
              selected
                ? "border-primary bg-primary/[0.07] shadow-sm"
                : "border-border bg-card hover:bg-muted/45",
            )}
          >
            <span
              className={cn(
                "size-9 shrink-0 rounded-full border border-border/80 shadow-sm",
                accent.bg,
              )}
              aria-hidden
            />
            <span className="text-[11px] font-medium leading-tight text-foreground">
              {title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function CouponCornerStylePicker({
  value,
  onChange,
  className,
}: {
  value: CouponCornerStyle;
  onChange: (next: CouponCornerStyle) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label="Corner radius"
      className={cn("flex flex-wrap gap-3", className)}
    >
      {CORNER_ORDER.map((style) => {
        const selected = value === style;
        const title = cornerStyleTitle(style);
        return (
          <button
            key={style}
            type="button"
            aria-pressed={selected}
            aria-label={title}
            onClick={() => onChange(style)}
            className={cn(
              optionButtonBase,
              "flex min-w-[6.25rem] flex-col items-center gap-2 px-3 py-3",
              selected
                ? "border-primary bg-primary/[0.07] shadow-sm"
                : "border-border bg-card hover:bg-muted/45",
            )}
          >
            <CornerShapePreview style={style} />
            <span className="text-[11px] font-medium leading-tight text-foreground">
              {title}
            </span>
          </button>
        );
      })}
    </div>
  );
}
