"use client";

import { cn } from "@/lib/utils";
import {
  COUPON_ACCENT_CLASSES,
  COUPON_BADGE_LABELS,
  formatCouponExpirationSummary,
} from "@/lib/campaigns/coupon-templates";
import type { CampaignOffer } from "@/lib/campaigns/types";

export interface CouponCardPreviewProps {
  offer: CampaignOffer;
  /** Smaller type and padding for message chips */
  compact?: boolean;
  className?: string;
  /** Shown when no logoUrl on visual */
  dealershipDisplayName?: string;
}

function shouldShowCouponLogo(visual: CampaignOffer["visual"]): boolean {
  return visual.showLogoOnCoupon !== false;
}

function shouldShowCouponVehicle(visual: CampaignOffer["visual"]): boolean {
  return visual.showVehicleOnCoupon !== false;
}

type CouponLogoMarkSize = "compact" | "standard" | "prominent";

function logoMarkImageClass(
  compact: boolean | undefined,
  logoMarkSize: CouponLogoMarkSize,
): string {
  if (compact) {
    return cn(
      "max-h-4 max-w-[3.5rem]",
      logoMarkSize === "prominent" && "max-h-5 max-w-[4rem]",
    );
  }
  switch (logoMarkSize) {
    case "prominent":
      return "max-h-8 max-w-[6.5rem] sm:max-h-9 sm:max-w-[7.5rem]";
    case "standard":
      return "max-h-5 max-w-[4.5rem] sm:max-h-6 sm:max-w-[5.5rem]";
    default:
      return "max-h-4 max-w-[3.75rem] sm:max-h-5 sm:max-w-[4.25rem]";
  }
}

function logoMarkNameClass(
  compact: boolean | undefined,
  logoMarkSize: CouponLogoMarkSize,
): string {
  if (compact) {
    return cn(
      "max-w-[3.5rem] text-[7px] leading-tight",
      logoMarkSize === "prominent" && "max-w-[4rem] text-[8px]",
    );
  }
  switch (logoMarkSize) {
    case "prominent":
      return "max-w-[8rem] text-[9px] leading-tight sm:max-w-[9rem] sm:text-[10px]";
    case "standard":
      return "max-w-[5.5rem] text-[8px] leading-tight sm:max-w-[6rem] sm:text-[9px]";
    default:
      return "max-w-[4.25rem] text-[7px] leading-tight sm:max-w-[5rem] sm:text-[8px]";
  }
}

/** Small dealership mark: logo image or name fallback (gated by `showLogoOnCoupon`) */
function DealershipLogoMark({
  offer,
  compact,
  dealershipDisplayName,
  invertOnAccent,
  tone = "default",
  logoMarkSize = "standard",
}: {
  offer: CampaignOffer;
  compact?: boolean;
  dealershipDisplayName?: string;
  /** White logo on colored header bands */
  invertOnAccent?: boolean;
  /** `muted` = minimal card; `dark` = dark-accent template */
  tone?: "default" | "muted" | "dark";
  /** Tighter chips use `compact`; card layouts use `standard` or `prominent` for readability */
  logoMarkSize?: CouponLogoMarkSize;
}) {
  const { visual } = offer;
  if (!shouldShowCouponLogo(visual)) {
    return null;
  }
  const logoUrl = visual.logoUrl?.trim();
  if (logoUrl) {
    /* On saturated accent bands, do not use brightness/invert — logos on white or
       light backings become a solid white rectangle. Use a light chip so full-color
       marks stay visible. */
    if (invertOnAccent) {
      return (
        <span
          className={cn(
            "inline-flex max-w-full items-center justify-center rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/10",
            compact ? "min-h-7 min-w-[2.75rem]" : "min-h-9 min-w-[3.25rem]",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt=""
            className={cn(
              "max-h-full w-auto shrink-0 object-contain object-center",
              logoMarkImageClass(compact, logoMarkSize),
            )}
          />
        </span>
      );
    }
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={logoUrl}
        alt=""
        className={cn(
          "w-auto shrink-0 object-contain",
          tone === "dark" && "opacity-95",
          logoMarkImageClass(compact, logoMarkSize),
        )}
      />
    );
  }
  const nameTone =
    tone === "muted"
      ? "text-muted-foreground"
      : tone === "dark"
        ? "text-zinc-400"
        : invertOnAccent
          ? "text-primary-foreground"
          : "text-foreground";
  return (
    <span
      className={cn(
        "shrink-0 truncate font-medium opacity-90",
        nameTone,
        logoMarkNameClass(compact, logoMarkSize),
      )}
    >
      {dealershipDisplayName ?? "Your dealership"}
    </span>
  );
}

function cornerClass(corner: CampaignOffer["visual"]["cornerStyle"]): string {
  switch (corner) {
    case "sharp":
      return "rounded-none";
    case "pill":
      return "rounded-3xl";
    default:
      return "rounded-xl";
  }
}

function BadgeChip({
  offer,
  compact,
  onDarkBand,
}: {
  offer: CampaignOffer;
  compact?: boolean;
  /** Light badge on saturated header bands */
  onDarkBand?: boolean;
}) {
  const { visual } = offer;
  const label =
    visual.badge === "custom" && visual.customBadgeLabel?.trim()
      ? visual.customBadgeLabel
      : COUPON_BADGE_LABELS[visual.badge];
  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold uppercase tracking-wide",
        compact ? "rounded-sm px-1.5 py-0.5 text-[7px]" : "rounded-md px-2 py-0.5 text-[8px]",
        onDarkBand
          ? "bg-white/20 text-white"
          : cn("text-primary-foreground", COUPON_ACCENT_CLASSES[visual.accentPreset].bg),
      )}
    >
      {label}
    </span>
  );
}

function ValueBlock({
  offer,
  compact,
}: {
  offer: CampaignOffer;
  compact?: boolean;
}) {
  return (
    <p
      className={cn(
        "font-medium tabular-nums tracking-tight",
        compact ? "text-sm" : "text-lg",
      )}
    >
      {offer.valueLabel}
    </p>
  );
}

function UrgencyLine({
  offer,
  compact,
}: {
  offer: CampaignOffer;
  compact?: boolean;
}) {
  if (!offer.visual.showUrgencyLine || !offer.visual.urgencyLine?.trim()) {
    return null;
  }
  return (
    <p
      className={cn(
        "font-medium text-amber-700",
        compact ? "text-[8px]" : "text-[10px]",
      )}
    >
      {offer.visual.urgencyLine}
    </p>
  );
}

/** Catalog vehicle image + caption saved on `offer.visual` */
function CouponVehicleStrip({
  offer,
  compact,
  tone = "default",
}: {
  offer: CampaignOffer;
  compact?: boolean;
  tone?: "default" | "dark";
}) {
  if (!shouldShowCouponVehicle(offer.visual)) {
    return null;
  }
  const url = offer.visual.vehicleImageUrl?.trim();
  if (!url) return null;
  const caption = offer.visual.vehicleCaption?.trim();
  const shell =
    tone === "dark"
      ? "border-zinc-700/80 bg-zinc-900/60"
      : "border-border/50 bg-muted/25";
  const captionClass =
    tone === "dark"
      ? "text-zinc-300"
      : "text-foreground/90";
  const innerBg = tone === "dark" ? "bg-zinc-800" : "bg-background";
  return (
    <div
      className={cn(
        "flex w-full max-w-full items-stretch gap-1.5 rounded-md border p-1",
        compact && "gap-1 p-0.5",
        shell,
      )}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden rounded p-0.5",
          innerBg,
          compact ? "h-7 w-11" : "h-9 w-[3.25rem] sm:h-10 sm:w-14",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="max-h-full max-w-full object-contain object-center"
        />
      </div>
      {caption ? (
        <div className="flex min-w-0 flex-1 items-center">
          <p
            className={cn(
              "line-clamp-2 font-medium leading-snug",
              compact ? "text-[6px]" : "text-[8px] sm:text-[9px]",
              captionClass,
            )}
          >
            {caption}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function TemplateHeroBanner({
  offer,
  compact,
  dealershipDisplayName,
  radius,
}: CouponCardPreviewProps & { radius: string }) {
  const { visual } = offer;
  const accent = COUPON_ACCENT_CLASSES[visual.accentPreset];
  return (
    <div
      className={cn(
        "overflow-hidden border border-border/60 bg-card shadow-sm",
        radius,
      )}
    >
      <div
        className={cn(
          "px-3 py-2 text-primary-foreground",
          accent.bg,
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <BadgeChip offer={offer} compact={compact} onDarkBand />
          <DealershipLogoMark
            offer={offer}
            compact={compact}
            dealershipDisplayName={dealershipDisplayName}
            invertOnAccent
            logoMarkSize="prominent"
          />
        </div>
        <div className="text-primary-foreground">
          <ValueBlock offer={offer} compact={compact} />
        </div>
      </div>
      <div className="space-y-1 px-3 py-2">
        <p
          className={cn(
            "font-medium leading-snug text-foreground",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          {visual.headline}
        </p>
        <p
          className={cn(
            "font-medium text-muted-foreground",
            compact ? "text-[8px] leading-snug" : "text-[10px] leading-snug",
          )}
        >
          {visual.subheadline}
        </p>
        <CouponVehicleStrip offer={offer} compact={compact} />
        <UrgencyLine offer={offer} compact={compact} />
        <p
          className={cn(
            "text-muted-foreground",
            compact ? "text-[7px]" : "text-[9px]",
          )}
        >
          {formatCouponExpirationSummary(offer)}
        </p>
        <div
          className={cn(
            "mt-1 inline-flex font-medium text-primary-foreground",
            accent.bg,
            compact ? "rounded-sm px-2 py-1 text-[8px]" : "rounded-md px-2.5 py-1.5 text-[10px]",
          )}
        >
          {visual.ctaLabel}
        </div>
      </div>
    </div>
  );
}

function TemplateTicketStub(props: CouponCardPreviewProps & { radius: string }) {
  const { offer, compact, radius, dealershipDisplayName } = props;
  const { visual } = offer;
  const accent = COUPON_ACCENT_CLASSES[visual.accentPreset];
  return (
    <div
      className={cn(
        "relative overflow-hidden border-2 border-dashed border-border bg-card",
        radius,
      )}
    >
      <div className="absolute left-0 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background ring-2 ring-border" />
      <div className="absolute right-0 top-1/2 size-2 translate-x-1/2 -translate-y-1/2 rounded-full bg-background ring-2 ring-border" />
      <div className={cn("border-b border-dashed border-border/80 px-3 py-2", accent.soft)}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <BadgeChip offer={offer} compact={compact} />
            <ValueBlock offer={offer} compact={compact} />
          </div>
          <div className="flex justify-end">
            <DealershipLogoMark
              offer={offer}
              compact={compact}
              dealershipDisplayName={dealershipDisplayName}
              logoMarkSize="standard"
            />
          </div>
        </div>
      </div>
      <div className="space-y-1 px-3 py-2">
        <p
          className={cn(
            "font-medium text-foreground",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          {visual.headline}
        </p>
        <p className={cn("font-medium text-muted-foreground", compact ? "text-[8px]" : "text-[10px]")}>
          {visual.subheadline}
        </p>
        <CouponVehicleStrip offer={offer} compact={compact} />
        <UrgencyLine offer={offer} compact={compact} />
        <p className={cn("text-muted-foreground", compact ? "text-[7px]" : "text-[9px]")}>
          {formatCouponExpirationSummary(offer)}
        </p>
        <span
          className={cn(
            "mt-1 inline-block border-2 border-dashed font-medium",
            accent.text,
            accent.border,
            compact ? "px-2 py-0.5 text-[8px]" : "px-2.5 py-1 text-[10px]",
          )}
        >
          {visual.ctaLabel}
        </span>
      </div>
    </div>
  );
}

function TemplateMinimalCard(props: CouponCardPreviewProps & { radius: string }) {
  const { offer, compact, radius, dealershipDisplayName } = props;
  const { visual } = offer;
  const accent = COUPON_ACCENT_CLASSES[visual.accentPreset];
  return (
    <div
      className={cn(
        "space-y-2 border border-border/80 bg-card p-3 shadow-sm",
        radius,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <BadgeChip offer={offer} compact={compact} />
        <DealershipLogoMark
          offer={offer}
          compact={compact}
          dealershipDisplayName={dealershipDisplayName}
          tone="muted"
          logoMarkSize="prominent"
        />
      </div>
      <ValueBlock offer={offer} compact={compact} />
      <p
        className={cn(
          "font-medium text-foreground",
          compact ? "text-[10px]" : "text-xs",
        )}
      >
        {visual.headline}
      </p>
      <p className={cn("font-medium text-muted-foreground", compact ? "text-[8px]" : "text-[10px]")}>
        {visual.subheadline}
      </p>
      <CouponVehicleStrip offer={offer} compact={compact} />
      <UrgencyLine offer={offer} compact={compact} />
      <p className={cn("text-muted-foreground", compact ? "text-[7px]" : "text-[9px]")}>
        {formatCouponExpirationSummary(offer)}
      </p>
      <div
        className={cn(
          "text-center font-medium text-primary-foreground",
          accent.bg,
          compact ? "rounded-sm py-1 text-[8px]" : "rounded-md py-1.5 text-[10px]",
        )}
      >
        {visual.ctaLabel}
      </div>
    </div>
  );
}

function TemplateSplitBand(props: CouponCardPreviewProps & { radius: string }) {
  const { offer, compact, radius, dealershipDisplayName } = props;
  const { visual } = offer;
  const accent = COUPON_ACCENT_CLASSES[visual.accentPreset];
  return (
    <div className={cn("flex overflow-hidden border border-border/60", radius)}>
      <div
        className={cn(
          "flex w-[38%] flex-col justify-center gap-1 px-2 py-2 text-primary-foreground",
          accent.bg,
        )}
      >
        <div className="text-primary-foreground">
          <ValueBlock offer={offer} compact={compact} />
        </div>
        <BadgeChip offer={offer} compact={compact} onDarkBand />
        <div className="flex min-h-0 justify-center pt-0.5">
          <DealershipLogoMark
            offer={offer}
            compact={compact}
            dealershipDisplayName={dealershipDisplayName}
            invertOnAccent
            logoMarkSize="standard"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-1 bg-card px-2 py-2">
        <CouponVehicleStrip offer={offer} compact={compact} />
        <p
          className={cn(
            "font-medium leading-tight text-foreground",
            compact ? "text-[9px]" : "text-[11px]",
          )}
        >
          {visual.headline}
        </p>
        <p className={cn("font-medium text-muted-foreground", compact ? "text-[7px]" : "text-[9px]")}>
          {visual.subheadline}
        </p>
        <UrgencyLine offer={offer} compact={compact} />
        <p className={cn("text-muted-foreground", compact ? "text-[7px]" : "text-[8px]")}>
          {formatCouponExpirationSummary(offer)}
        </p>
        <span className={cn("font-medium", accent.text, compact ? "text-[8px]" : "text-[10px]")}>
          {visual.ctaLabel} →
        </span>
      </div>
    </div>
  );
}

function TemplateBadgeRibbon(props: CouponCardPreviewProps & { radius: string }) {
  const { offer, compact, radius, dealershipDisplayName } = props;
  const { visual } = offer;
  const accent = COUPON_ACCENT_CLASSES[visual.accentPreset];
  return (
    <div className={cn("relative overflow-hidden border border-border/60 bg-card", radius)}>
      <div
        className={cn(
          "absolute -right-8 top-3 rotate-45 px-10 py-0.5 text-center text-[7px] font-bold uppercase text-primary-foreground",
          accent.bg,
        )}
      >
        Special
      </div>
      <div className="space-y-1 p-3 pr-14">
        <div className="flex items-start justify-between gap-2">
          <BadgeChip offer={offer} compact={compact} />
          <DealershipLogoMark
            offer={offer}
            compact={compact}
            dealershipDisplayName={dealershipDisplayName}
            logoMarkSize="standard"
          />
        </div>
        <ValueBlock offer={offer} compact={compact} />
        <p
          className={cn(
            "font-medium text-foreground",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          {visual.headline}
        </p>
        <p className={cn("font-medium text-muted-foreground", compact ? "text-[8px]" : "text-[10px]")}>
          {visual.subheadline}
        </p>
        <CouponVehicleStrip offer={offer} compact={compact} />
        <UrgencyLine offer={offer} compact={compact} />
        <p className={cn("text-muted-foreground", compact ? "text-[7px]" : "text-[9px]")}>
          {formatCouponExpirationSummary(offer)}
        </p>
        <div
          className={cn(
            "inline-flex font-medium text-primary-foreground",
            accent.bg,
            compact ? "rounded-sm px-2 py-0.5 text-[8px]" : "rounded-md px-2.5 py-1 text-[10px]",
          )}
        >
          {visual.ctaLabel}
        </div>
      </div>
    </div>
  );
}

function TemplateDarkAccent(props: CouponCardPreviewProps & { radius: string }) {
  const { offer, compact, radius, dealershipDisplayName } = props;
  const { visual } = offer;
  const accent = COUPON_ACCENT_CLASSES[visual.accentPreset];
  return (
    <div
      className={cn(
        "overflow-hidden border border-border/60 bg-card text-foreground shadow-sm",
        radius,
      )}
    >
      <div className={cn("h-1 w-full", accent.bg)} />
      <div className="space-y-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <DealershipLogoMark
            offer={offer}
            compact={compact}
            dealershipDisplayName={dealershipDisplayName}
            tone="muted"
            logoMarkSize="prominent"
          />
          <BadgeChip offer={offer} compact={compact} />
        </div>
        <div className="text-foreground">
          <ValueBlock offer={offer} compact={compact} />
        </div>
        <p
          className={cn(
            "font-medium text-foreground",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          {visual.headline}
        </p>
        <p className={cn("font-medium text-muted-foreground", compact ? "text-[8px]" : "text-[10px]")}>
          {visual.subheadline}
        </p>
        <CouponVehicleStrip offer={offer} compact={compact} />
        <UrgencyLine offer={offer} compact={compact} />
        <p className={cn("text-muted-foreground", compact ? "text-[7px]" : "text-[9px]")}>
          {formatCouponExpirationSummary(offer)}
        </p>
        <div
          className={cn(
            "text-center font-medium text-primary-foreground",
            compact ? "rounded-sm py-1 text-[8px]" : "rounded-md py-1.5 text-[10px]",
            accent.bg,
          )}
        >
          {visual.ctaLabel}
        </div>
      </div>
    </div>
  );
}

export function CouponCardPreview({
  offer,
  compact,
  className,
  dealershipDisplayName,
}: CouponCardPreviewProps) {
  const radius = cornerClass(offer.visual.cornerStyle);
  const common = {
    offer,
    compact,
    dealershipDisplayName,
    radius,
  } satisfies CouponCardPreviewProps & { radius: string };

  const inner = (() => {
    switch (offer.visual.templateId) {
      case "ticket-stub":
        return <TemplateTicketStub {...common} />;
      case "minimal-card":
        return <TemplateMinimalCard {...common} />;
      case "split-band":
        return <TemplateSplitBand {...common} />;
      case "badge-ribbon":
        return <TemplateBadgeRibbon {...common} />;
      case "dark-accent":
        return <TemplateDarkAccent {...common} />;
      case "hero-banner":
      default:
        return <TemplateHeroBanner {...common} />;
    }
  })();

  return (
    <div className={cn("sm-coupon-card-surface", className)}>{inner}</div>
  );
}
