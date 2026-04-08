"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Filter, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const filterButtonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-sm,6px)] border-0 font-medium transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      selected: {
        false: "bg-background text-muted-foreground hover:bg-muted/50",
        true:
          "bg-background text-muted-foreground shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:bg-muted/50",
      },
      size: {
        xs: "px-1.5 py-1 text-xs leading-4 gap-1",
        md: "px-2 py-1 text-sm leading-5",
        lg: "px-2.5 py-1.5 text-sm leading-5",
      },
    },
    defaultVariants: {
      selected: false,
      size: "md",
    },
  }
);

export interface FilterButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof filterButtonVariants> {
  /** Label shown on the button (e.g. "Filter"). */
  label?: string;
  /** When selected, optional value label shown after a divider (e.g. "Last 2 days"). Rendered in primary color. */
  valueLabel?: string;
  /** Optional custom lead icon. Defaults to Filter icon when undefined. */
  leadIcon?: React.ReactNode;
  /** When selected, show trailing chevron. Default true when valueLabel is provided. */
  showChevron?: boolean;
}

function FilterButton({
  className,
  label = "Filter",
  valueLabel,
  selected = false,
  size = "md",
  leadIcon,
  showChevron,
  ...props
}: FilterButtonProps) {
  const shouldShowChevron =
    showChevron !== undefined
      ? showChevron
      : selected && (valueLabel !== undefined && valueLabel !== "");

  return (
    <button
      type="button"
      data-slot="filter-button"
      aria-pressed={selected ?? undefined}
      className={cn(filterButtonVariants({ selected, size }), className)}
      {...props}
    >
      <span className="shrink-0" aria-hidden>
        {leadIcon ?? <Filter className="size-4" />}
      </span>
      <span className="flex items-center gap-1.5 px-0.5">
        <span>{label}</span>
        {selected && valueLabel ? (
          <>
            <span
              className="h-4 w-px shrink-0 bg-border"
              aria-hidden
              role="presentation"
            />
            <span className="text-primary whitespace-nowrap">{valueLabel}</span>
          </>
        ) : null}
      </span>
      {shouldShowChevron ? (
        <span className="shrink-0" aria-hidden>
          <ChevronDown className="size-4" />
        </span>
      ) : null}
    </button>
  );
}

export { FilterButton, filterButtonVariants };
