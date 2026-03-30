"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon, MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Portfolio 3.0 form control — checkbox border (Figma reference). */
export const PORTFOLIO_CHECKBOX_BORDER_HEX = "#ebeced";
/** Portfolio 3.0 — checked / indeterminate fill. */
export const PORTFOLIO_FORM_CONTROL_GREEN_HEX = "#01AC81";
/** Portfolio 3.0 — disabled fill. */
export const PORTFOLIO_FORM_CONTROL_DISABLED_FILL_HEX = "#a3a3a3";

export interface PortfolioCheckboxControlProps
  extends CheckboxPrimitive.Root.Props {
  /** Simulated focus ring for documentation / state matrices. */
  showFocusRing?: boolean;
  /** Gray-out style while keeping control interactive. */
  visualDisabled?: boolean;
}

/**
 * Portfolio 3.0 checkbox: light border, brand green fill when checked or indeterminate,
 * neutral disabled fill. Uses Base UI Checkbox for behavior and a11y.
 */
function PortfolioCheckboxControl({
  className,
  disabled,
  showFocusRing,
  visualDisabled,
  ...props
}: PortfolioCheckboxControlProps) {
  const isVisuallyDisabled = Boolean(disabled || visualDisabled);

  return (
    <CheckboxPrimitive.Root
      data-slot="portfolio-checkbox"
      data-visual-disabled={visualDisabled ? "true" : undefined}
      disabled={disabled}
      className={cn(
        "group peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] outline-none transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#01AC81]/32 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-65",
        "data-checked:text-white data-indeterminate:text-white",
        showFocusRing && "ring-1 ring-[#01AC81]/32 ring-offset-1 ring-offset-background",
        isVisuallyDisabled && "opacity-65",
        className
      )}
      style={
        {
          "--portfolio-checkbox-border": PORTFOLIO_CHECKBOX_BORDER_HEX,
          "--portfolio-checkbox-green": PORTFOLIO_FORM_CONTROL_GREEN_HEX,
          "--portfolio-checkbox-disabled": PORTFOLIO_FORM_CONTROL_DISABLED_FILL_HEX,
        } as React.CSSProperties
      }
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[4px] bg-[linear-gradient(to_bottom_right,#ECECED_0%,#7A7B7F_50%,#ECECED_100%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-px z-0 rounded-[3px] bg-[#fafafa] transition-colors group-data-checked:bg-black group-data-indeterminate:bg-black group-disabled:bg-[#e3e5e8] group-disabled:group-data-checked:bg-[color:var(--portfolio-checkbox-disabled)] group-disabled:group-data-indeterminate:bg-[color:var(--portfolio-checkbox-disabled)] group-data-[visual-disabled=true]:bg-[#e3e5e8] group-data-[visual-disabled=true]:group-data-checked:bg-[color:var(--portfolio-checkbox-disabled)] group-data-[visual-disabled=true]:group-data-indeterminate:bg-[color:var(--portfolio-checkbox-disabled)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[0.775px] bg-[color:var(--portfolio-checkbox-green)] blur-[2px] opacity-0 transition-opacity group-data-checked:opacity-100 group-data-indeterminate:opacity-100 group-disabled:opacity-0 group-data-[visual-disabled=true]:opacity-0"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-3 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-[color:var(--portfolio-checkbox-green)] opacity-0 transition-opacity group-data-checked:opacity-100 group-data-indeterminate:opacity-100 group-disabled:bg-[color:var(--portfolio-checkbox-disabled)] group-data-[visual-disabled=true]:bg-[color:var(--portfolio-checkbox-disabled)]"
      />
      <CheckboxPrimitive.Indicator
        data-slot="portfolio-checkbox-indicator"
        keepMounted
        className="relative z-10 grid place-content-center text-current group-disabled:text-white/70 group-data-[visual-disabled=true]:text-white/70 [&_svg]:size-2.5"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <MinusIcon className="text-white" strokeWidth={2.25} aria-hidden />
            ) : state.checked ? (
              <CheckIcon className="text-white" strokeWidth={2.25} aria-hidden />
            ) : null}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  );
}

export { PortfolioCheckboxControl };
