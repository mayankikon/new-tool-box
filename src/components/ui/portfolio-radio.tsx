"use client";

import * as React from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";

import { cn } from "@/lib/utils";
import {
  PORTFOLIO_FORM_CONTROL_BORDER_HEX,
  PORTFOLIO_RADIO_DEFAULT_VISUALS,
  type PortfolioRadioVisuals,
  hexToRgbaString,
} from "@/components/ui/portfolio-form-controls-visuals";

export interface PortfolioRadioButtonProps extends RadioPrimitive.Root.Props {
  /** Simulated focus ring for documentation / state matrices. */
  showFocusRing?: boolean;
  /** Gray-out style while keeping control interactive. */
  visualDisabled?: boolean;
  /** Optional visual overrides for the Portfolio 3.0 chrome study. */
  visualSpec?: PortfolioRadioVisuals;
}

/**
 * Inner dot for the selected state (same accent as outer ring).
 */
function PortfolioRadioInnerDot({ className }: { className?: string }) {
  return (
    <span
      data-slot="portfolio-radio-inner-dot"
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--portfolio-radio-accent)] opacity-0 transition-opacity group-data-checked:opacity-100 group-data-[visual-disabled=true]:bg-[color:var(--portfolio-radio-disabled)]",
        className
      )}
      style={{
        width: "var(--portfolio-radio-dot-size)",
        height: "var(--portfolio-radio-dot-size)",
      }}
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
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity group-data-checked:opacity-100 group-disabled:opacity-0 group-data-[visual-disabled=true]:opacity-0"
      style={{
        width: "var(--portfolio-radio-glow-size)",
        height: "var(--portfolio-radio-glow-size)",
        backgroundColor: "var(--portfolio-radio-glow-color)",
        filter: "blur(var(--portfolio-radio-glow-blur))",
      }}
      aria-hidden
    />
  );
}

/**
 * Portfolio 3.0 radio: light border, teal accent when selected. Uses Base UI Radio.
 * The root is a 24×24px hit target (`size-6`); the drawn control stays 16×16px (`size-4`) centered inside.
 */
function PortfolioRadioButton({
  className,
  disabled,
  showFocusRing,
  visualDisabled,
  visualSpec = PORTFOLIO_RADIO_DEFAULT_VISUALS,
  style,
  ...props
}: PortfolioRadioButtonProps) {
  const isVisuallyDisabled = Boolean(disabled || visualDisabled);

  return (
    <RadioPrimitive.Root
      data-slot="portfolio-radio"
      data-visual-disabled={visualDisabled ? "true" : undefined}
      disabled={disabled}
      className={cn(
        "group peer relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none transition-colors",
        "focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-65",
        "data-disabled:[&_[data-slot=portfolio-radio-inner-dot]]:bg-[color:var(--portfolio-radio-disabled)]",
        isVisuallyDisabled && "opacity-65",
        className
      )}
      style={
        {
          "--portfolio-radio-border": PORTFOLIO_FORM_CONTROL_BORDER_HEX,
          "--portfolio-radio-accent": visualSpec.accentColor,
          "--portfolio-radio-disabled": visualSpec.disabledFillColor,
          "--portfolio-radio-surface": visualSpec.surfaceColor,
          "--portfolio-radio-dot-size": `${visualSpec.dotSizePx}px`,
          "--portfolio-radio-glow-size": `${visualSpec.glowSizePx}px`,
          "--portfolio-radio-glow-blur": `${visualSpec.glowBlurPx}px`,
          "--portfolio-radio-glow-color": hexToRgbaString(
            visualSpec.accentColor,
            visualSpec.glowOpacity
          ),
          ...style,
        } as unknown as React.CSSProperties
      }
      {...props}
    >
      <span
        className={cn(
          "relative size-4 shrink-0 overflow-hidden rounded-full",
          "group-focus-visible:ring-2 group-focus-visible:ring-[#1A9375]/32 group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-background",
          showFocusRing && "ring-2 ring-[#1A9375]/32 ring-offset-1 ring-offset-background"
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-full"
          style={{
            background: `linear-gradient(to bottom right, ${visualSpec.gradientStartColor} 0%, ${visualSpec.gradientMidColor} 50%, ${visualSpec.gradientEndColor} 100%)`,
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-px z-0 rounded-full bg-[color:var(--portfolio-radio-surface)] transition-colors group-data-checked:bg-black group-disabled:bg-[#e3e5e8] group-disabled:group-data-checked:bg-[color:var(--portfolio-radio-disabled)] group-data-[visual-disabled=true]:bg-[#e3e5e8] group-data-[visual-disabled=true]:group-data-checked:bg-[color:var(--portfolio-radio-disabled)]"
        />
        <PortfolioRadioBlurLayer />
        <RadioPrimitive.Indicator
          data-slot="portfolio-radio-indicator"
          className="flex size-4 items-center justify-center"
        >
          <PortfolioRadioInnerDot />
        </RadioPrimitive.Indicator>
      </span>
    </RadioPrimitive.Root>
  );
}

export { PortfolioRadioBlurLayer, PortfolioRadioInnerDot, PortfolioRadioButton };
