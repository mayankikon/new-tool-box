"use client";

import * as React from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";

import { cn } from "@/lib/utils";

import { PORTFOLIO_FORM_CONTROL_DISABLED_FILL_HEX } from "@/components/ui/portfolio-checkbox";

/** Portfolio 3.0 — selected ring and inner dot (requested product accent). */
export const PORTFOLIO_RADIO_ACCENT_HEX = "#01AC81";

const BORDER_HEX = "#ebeced";

export interface PortfolioRadioButtonProps extends RadioPrimitive.Root.Props {
  /** Simulated focus ring for documentation / state matrices. */
  showFocusRing?: boolean;
  /** Gray-out style while keeping control interactive. */
  visualDisabled?: boolean;
}

/**
 * Inner dot for the selected state (same accent as outer ring).
 */
function PortfolioRadioInnerDot({ className }: { className?: string }) {
  return (
    <span
      data-slot="portfolio-radio-inner-dot"
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 size-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--portfolio-radio-accent)] opacity-0 transition-opacity group-data-checked:opacity-100 group-data-[visual-disabled=true]:bg-[color:var(--portfolio-radio-disabled)]",
        className
      )}
      aria-hidden
    />
  );
}

/**
 * Soft outer glow layer (Portfolio-style emphasis) — CSS shadow, no SVG blur filter.
 */
function PortfolioRadioBlurLayer() {
  return (
    <span
      className="pointer-events-none absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--portfolio-radio-accent)] blur-[2px] opacity-0 transition-opacity group-data-checked:opacity-100 group-disabled:opacity-0 group-data-[visual-disabled=true]:opacity-0"
      aria-hidden
    />
  );
}

/**
 * Portfolio 3.0 radio: light border, teal accent when selected. Uses Base UI Radio.
 */
function PortfolioRadioButton({
  className,
  disabled,
  showFocusRing,
  visualDisabled,
  ...props
}: PortfolioRadioButtonProps) {
  const disabledFill = PORTFOLIO_FORM_CONTROL_DISABLED_FILL_HEX;
  const isVisuallyDisabled = Boolean(disabled || visualDisabled);

  return (
    <RadioPrimitive.Root
      data-slot="portfolio-radio"
      data-visual-disabled={visualDisabled ? "true" : undefined}
      disabled={disabled}
      className={cn(
        "group peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full outline-none transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#01AC81]/32 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-65",
        "data-disabled:[&_[data-slot=portfolio-radio-inner-dot]]:bg-[color:var(--portfolio-radio-disabled)]",
        showFocusRing && "ring-1 ring-[#01AC81]/32 ring-offset-1 ring-offset-background",
        isVisuallyDisabled && "opacity-65",
        className
      )}
      style={
        {
          "--portfolio-radio-border": BORDER_HEX,
          "--portfolio-radio-accent": PORTFOLIO_RADIO_ACCENT_HEX,
          "--portfolio-radio-disabled": disabledFill,
        } as React.CSSProperties
      }
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-full bg-[linear-gradient(to_bottom_right,#ECECED_0%,#7A7B7F_50%,#ECECED_100%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-px z-0 rounded-full bg-[#fafafa] transition-colors group-data-checked:bg-black group-disabled:bg-[#e3e5e8] group-disabled:group-data-checked:bg-[color:var(--portfolio-radio-disabled)] group-data-[visual-disabled=true]:bg-[#e3e5e8] group-data-[visual-disabled=true]:group-data-checked:bg-[color:var(--portfolio-radio-disabled)]"
      />
      <PortfolioRadioBlurLayer />
      <RadioPrimitive.Indicator
        data-slot="portfolio-radio-indicator"
        className="flex size-4 items-center justify-center"
      >
        <PortfolioRadioInnerDot />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { PortfolioRadioBlurLayer, PortfolioRadioInnerDot, PortfolioRadioButton };
