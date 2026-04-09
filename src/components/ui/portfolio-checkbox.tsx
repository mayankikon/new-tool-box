"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  PORTFOLIO_CHECKBOX_DEFAULT_VISUALS,
  PORTFOLIO_FORM_CONTROL_BORDER_HEX,
  type PortfolioCheckboxVisuals,
  hexToRgbaString,
} from "@/components/ui/portfolio-form-controls-visuals";

export interface PortfolioCheckboxControlProps
  extends CheckboxPrimitive.Root.Props {
  /** Simulated focus ring for documentation / state matrices. */
  showFocusRing?: boolean;
  /** Gray-out style while keeping control interactive. */
  visualDisabled?: boolean;
  /** Optional visual overrides for the Portfolio 3.0 chrome study. */
  visualSpec?: PortfolioCheckboxVisuals;
}

/**
 * Portfolio 3.0 checkbox: light border, brand green fill when checked or indeterminate,
 * neutral disabled fill. Uses Base UI Checkbox for behavior and a11y.
 * The root is a 24×24px hit target (`size-6`); the drawn control stays 16×16px (`size-4`) centered inside.
 */
function PortfolioCheckboxControl({
  className,
  disabled,
  showFocusRing,
  visualDisabled,
  visualSpec = PORTFOLIO_CHECKBOX_DEFAULT_VISUALS,
  style,
  ...props
}: PortfolioCheckboxControlProps) {
  const isVisuallyDisabled = Boolean(disabled || visualDisabled);

  return (
    <CheckboxPrimitive.Root
      data-slot="portfolio-checkbox"
      data-visual-disabled={visualDisabled ? "true" : undefined}
      disabled={disabled}
      className={cn(
        "group peer relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center outline-none transition-colors",
        "focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-65",
        "data-checked:text-white data-indeterminate:text-white",
        isVisuallyDisabled && "opacity-65",
        className
      )}
      style={
        {
          "--portfolio-checkbox-border": PORTFOLIO_FORM_CONTROL_BORDER_HEX,
          "--portfolio-checkbox-green": visualSpec.accentColor,
          "--portfolio-checkbox-disabled": visualSpec.disabledFillColor,
          "--portfolio-checkbox-surface": visualSpec.surfaceColor,
          ...style,
        } as unknown as React.CSSProperties
      }
      {...props}
    >
      <span
        className={cn(
          "relative size-4 shrink-0 overflow-hidden rounded-[4px]",
          "group-focus-visible:ring-2 group-focus-visible:ring-[#1A9375]/32 group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-background",
          showFocusRing && "ring-2 ring-[#1A9375]/32 ring-offset-1 ring-offset-background"
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 rounded-[4px]"
          style={{
            background: `linear-gradient(to bottom right, ${visualSpec.gradientStartColor} 0%, ${visualSpec.gradientMidColor} 50%, ${visualSpec.gradientEndColor} 100%)`,
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-px z-0 rounded-[3px] bg-[color:var(--portfolio-checkbox-surface)] transition-colors group-data-checked:bg-black group-data-indeterminate:bg-black group-disabled:bg-[#e3e5e8] group-disabled:group-data-checked:bg-[color:var(--portfolio-checkbox-disabled)] group-disabled:group-data-indeterminate:bg-[color:var(--portfolio-checkbox-disabled)] group-data-[visual-disabled=true]:bg-[#e3e5e8] group-data-[visual-disabled=true]:group-data-checked:bg-[color:var(--portfolio-checkbox-disabled)] group-data-[visual-disabled=true]:group-data-indeterminate:bg-[color:var(--portfolio-checkbox-disabled)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-[0.775px] opacity-0 transition-opacity group-data-checked:opacity-100 group-data-indeterminate:opacity-100 group-disabled:opacity-0 group-data-[visual-disabled=true]:opacity-0"
          style={{
            width: visualSpec.glowSizePx,
            height: visualSpec.glowSizePx,
            backgroundColor: hexToRgbaString(
              visualSpec.accentColor,
              visualSpec.glowOpacity
            ),
            filter: `blur(${visualSpec.glowBlurPx}px)`,
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-3 -translate-x-1/2 -translate-y-1/2 bg-[color:var(--portfolio-checkbox-green)] opacity-0 transition-opacity group-data-checked:opacity-100 group-data-indeterminate:opacity-100 group-disabled:bg-[color:var(--portfolio-checkbox-disabled)] group-data-[visual-disabled=true]:bg-[color:var(--portfolio-checkbox-disabled)]"
          style={{
            borderRadius: visualSpec.fillRadiusPx,
          }}
        />
        <CheckboxPrimitive.Indicator
          data-slot="portfolio-checkbox-indicator"
          keepMounted
          className="absolute inset-0 z-10 flex items-center justify-center leading-none text-current group-disabled:text-white/70 group-data-[visual-disabled=true]:text-white/70"
          render={(indicatorProps, state) => (
            <span
              {...indicatorProps}
              className={cn(
                indicatorProps.className,
                "flex size-full items-center justify-center"
              )}
            >
              {state.indeterminate ? (
                <MinusIcon className="block size-2.5 text-white" strokeWidth={2.25} aria-hidden />
              ) : state.checked ? (
                <CheckIcon className="block size-2.5 text-white" strokeWidth={2.25} aria-hidden />
              ) : null}
            </span>
          )}
        />
      </span>
    </CheckboxPrimitive.Root>
  );
}

export { PortfolioCheckboxControl };
