"use client";

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { List, Map } from "lucide-react";
import { MapViewTooltip } from "@/components/ui/map-view-tooltip";
import { cn } from "@/lib/utils";

export type InventoryViewModeToggleValue = "map" | "table";

interface InventoryViewModeToggleProps {
  value: InventoryViewModeToggleValue;
  onValueChange: (value: InventoryViewModeToggleValue) => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

const springTransition = {
  type: "spring" as const,
  duration: 0.35,
  bounce: 0,
};

const OPTIONS: Array<{
  value: InventoryViewModeToggleValue;
  label: string;
  icon: React.ReactNode;
}> = [
  { value: "map", label: "Map view", icon: <Map className="size-[18px]" /> },
  { value: "table", label: "Table view", icon: <List className="size-[18px]" /> },
];

export function InventoryViewModeToggle({
  value,
  onValueChange,
  className,
  disabled = false,
  "aria-label": ariaLabel = "Inventory view mode",
}: InventoryViewModeToggleProps) {
  const [hoveredOption, setHoveredOption] =
    React.useState<InventoryViewModeToggleValue | null>(null);
  const layoutId = React.useId();

  const handleSelect = (nextValue: InventoryViewModeToggleValue) => {
    if (disabled || nextValue === value) return;
    onValueChange(nextValue);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    optionValue: InventoryViewModeToggleValue
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(optionValue);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const nextValue = optionValue === "map" ? "table" : "map";
      handleSelect(nextValue);
      const container = event.currentTarget.parentElement;
      const nextButton = container?.querySelector(
        `[data-view-mode-value="${nextValue}"]`
      ) as HTMLButtonElement | null;
      nextButton?.focus();
    }
  };

  return (
    <LayoutGroup>
      <div className={cn("relative inline-flex", className)}>
        <div
          data-slot="inventory-view-mode-toggle"
          role="radiogroup"
          aria-label={ariaLabel}
          aria-disabled={disabled || undefined}
          className={cn(
            "inline-flex h-9 items-center gap-0.5 rounded-[var(--radius-sm)] bg-[var(--theme-background-default)] p-0.5",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {OPTIONS.map((option) => {
            const isActive = value === option.value;
            const showTooltip =
              hoveredOption === option.value && option.value !== value;
            return (
              <div key={option.value} className="relative inline-flex">
                <AnimatePresence mode="wait" initial={false}>
                  {showTooltip ? (
                    <motion.div
                      key={`${option.value}-tooltip`}
                      className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2"
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.985 }}
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <MapViewTooltip variant={option.value} />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  aria-label={option.label}
                  data-view-mode-value={option.value}
                  data-active={isActive || undefined}
                  disabled={disabled}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleSelect(option.value)}
                  onKeyDown={(event) => handleKeyDown(event, option.value)}
                  onMouseEnter={() => setHoveredOption(option.value)}
                  onMouseLeave={() => setHoveredOption((current) => (current === option.value ? null : current))}
                  onFocus={() => setHoveredOption(option.value)}
                  onBlur={() => setHoveredOption((current) => (current === option.value ? null : current))}
                  className={cn(
                    "relative inline-flex h-8 min-w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] px-2 outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                    "transition-colors duration-150",
                    "active:scale-[0.97] active:transition-transform active:duration-75 motion-reduce:active:scale-100",
                    isActive
                      ? "text-primary"
                      : "text-[var(--theme-icon-secondary)] hover:text-[var(--theme-icon-primary)]",
                    disabled ? "pointer-events-none" : "cursor-pointer"
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId={`toggle-indicator-${layoutId}`}
                      className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--theme-background-page)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08)]"
                      transition={springTransition}
                      style={{ willChange: "transform" }}
                    />
                  ) : null}
                  <span className="relative z-[1] [&>svg]:shrink-0" aria-hidden>
                    {option.icon}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </LayoutGroup>
  );
}
