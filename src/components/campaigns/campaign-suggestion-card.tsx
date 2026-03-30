"use client";

import type { CSSProperties, ComponentType } from "react";
import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DASHBOARD_CHROME_SURFACE_CLASS } from "@/lib/ui/dashboard-chrome-surface";
import { cn } from "@/lib/utils";
import type {
  CampaignRecommendation,
} from "@/lib/campaigns/mock-data";

export interface CampaignSuggestionCardSettings {
  layout?: {
    cardWidth?: number;
    cardMinHeight?: number;
    cardRadius?: number;
    iconTileRadius?: number;
    cardPadding?: number;
    iconTileSize?: number;
    iconSize?: number;
    sectionGap?: number;
    statsGap?: number;
    buttonTopGap?: number;
  };
  typography?: {
    titleSize?: number;
    descriptionSize?: number;
    statSize?: number;
  };
  appearance?: {
    cardBorderOpacity?: number;
    iconTileTint?: number;
    buttonVariant?: ButtonProps["variant"] | "custom-green";
    buttonFill?: number;
    buttonBorder?: number;
    buttonText?: number;
  };
}

const defaultCampaignSuggestionCardSettings: Required<CampaignSuggestionCardSettings> = {
  layout: {
    cardWidth: 328,
    cardMinHeight: 254,
    cardRadius: 8,
    iconTileRadius: 6,
    cardPadding: 16,
    iconTileSize: 46,
    iconSize: 20,
    sectionGap: 16,
    statsGap: 12,
    buttonTopGap: 16,
  },
  typography: {
    titleSize: 16,
    descriptionSize: 14,
    statSize: 14,
  },
  appearance: {
    cardBorderOpacity: 16,
    iconTileTint: 16,
    buttonVariant: "secondary",
    buttonFill: 24,
    buttonBorder: 8,
    buttonText: 64,
  },
};

function mergeSettings(
  settings?: CampaignSuggestionCardSettings,
): Required<CampaignSuggestionCardSettings> {
  return {
    layout: {
      ...defaultCampaignSuggestionCardSettings.layout,
      ...settings?.layout,
    },
    typography: {
      ...defaultCampaignSuggestionCardSettings.typography,
      ...settings?.typography,
    },
    appearance: {
      ...defaultCampaignSuggestionCardSettings.appearance,
      ...settings?.appearance,
    },
  };
}

function formatCurrency(value: number): string {
  if (value >= 10_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString("en-US")}`;
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

interface CampaignSuggestionCardProps {
  suggestion: CampaignRecommendation;
  icon?: LucideIcon | ComponentType<{ className?: string }>;
  ctaLabel?: string;
  onCreateCampaign?: () => void;
  settings?: CampaignSuggestionCardSettings;
  className?: string;
  style?: CSSProperties;
}

export function CampaignSuggestionCard({
  suggestion,
  icon: Icon = Sparkles,
  ctaLabel = "Create Campaign",
  onCreateCampaign,
  settings,
  className,
  style,
}: CampaignSuggestionCardProps) {
  const dial = mergeSettings(settings);
  const {
    cardWidth,
    cardMinHeight,
    cardRadius,
    iconTileRadius,
    cardPadding,
    iconTileSize,
    iconSize,
    sectionGap,
    statsGap,
    buttonTopGap,
  } = dial.layout;
  const { titleSize, descriptionSize, statSize } = dial.typography;
  const {
    cardBorderOpacity,
    iconTileTint,
    buttonVariant,
    buttonFill,
    buttonBorder,
    buttonText,
  } = dial.appearance;

  const buttonStyle: CSSProperties | undefined =
    buttonVariant === "custom-green"
      ? {
          backgroundColor: `color-mix(in oklab, var(--primary) ${buttonFill}%, var(--card))`,
          borderColor: `color-mix(in oklab, var(--primary) ${buttonBorder}%, var(--card))`,
          color: `color-mix(in oklab, var(--primary) ${buttonText}%, var(--foreground))`,
        }
      : undefined;

  return (
    <Card
      className={cn(
        "shrink-0 py-0 shadow-none",
        DASHBOARD_CHROME_SURFACE_CLASS,
        className,
      )}
      style={{
        minWidth: cardWidth,
        maxWidth: cardWidth,
        minHeight: cardMinHeight,
        borderRadius: cardRadius,
        borderColor: `color-mix(in oklab, var(--foreground) ${cardBorderOpacity}%, var(--card))`,
        ...style,
      }}
    >
      <CardContent
        className="h-full p-0"
        style={{
          paddingTop: cardPadding,
          paddingRight: cardPadding,
          paddingBottom: cardPadding,
          paddingLeft: cardPadding,
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start gap-3">
            <div
              className="flex shrink-0 items-center justify-center"
              style={{
                width: iconTileSize,
                height: iconTileSize,
                borderRadius: iconTileRadius,
                backgroundColor: `color-mix(in oklab, var(--primary) ${iconTileTint}%, var(--card))`,
              }}
            >
              <Icon
                className="text-primary"
                style={{ width: iconSize, height: iconSize }}
              />
            </div>
          </div>

          <div style={{ marginTop: sectionGap }}>
            <h3
              className="line-clamp-2 font-medium tracking-[-0.03em] text-foreground"
              style={{
                fontSize: titleSize ?? 16,
                lineHeight: `${Math.round((titleSize ?? 16) * 1.22)}px`,
              }}
            >
              {suggestion.title}
            </h3>
            <p
              className="mt-3 line-clamp-2 text-muted-foreground"
              style={{
                fontSize: descriptionSize ?? 14,
                lineHeight: `${Math.round((descriptionSize ?? 14) * 1.55)}px`,
              }}
            >
              {suggestion.description}
            </p>
          </div>

          <div
            className="flex flex-wrap items-center text-muted-foreground"
            style={{
              marginTop: sectionGap,
              columnGap: statsGap,
              rowGap: 8,
              fontSize: statSize ?? 14,
              lineHeight: `${Math.round((statSize ?? 14) * 1.3)}px`,
            }}
          >
            <span className="font-semibold text-[var(--theme-text-success)]">
              {formatCurrency(suggestion.estimatedRevenue)} est. revenue
            </span>
            <span>{formatCompactNumber(suggestion.estimatedReach)} audience</span>
          </div>

          <div className="mt-auto" style={{ paddingTop: buttonTopGap }}>
            <Button
              size="sm"
              variant={buttonVariant === "custom-green" ? "secondary" : buttonVariant}
              className={cn(
                "w-fit shadow-none",
                buttonVariant === "custom-green" &&
                  "hover:opacity-95 active:opacity-95",
              )}
              style={buttonStyle}
              onClick={onCreateCampaign}
            >
              {ctaLabel}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { defaultCampaignSuggestionCardSettings };
