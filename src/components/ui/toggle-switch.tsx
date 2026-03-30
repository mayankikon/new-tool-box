"use client";

import * as React from "react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ToggleSwitchOption {
  value: string;
  label?: string;
  icon?: React.ReactNode;
}

interface ToggleSwitchProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: [ToggleSwitchOption, ToggleSwitchOption];
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const springTransition = {
  type: "spring" as const,
  duration: 0.35,
  bounce: 0,
};

function ToggleSwitch({
  value: controlledValue,
  defaultValue,
  onValueChange,
  options,
  size = "default",
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: ToggleSwitchProps) {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue ?? options[0].value
  );
  const isControlled = controlledValue !== undefined;
  const activeValue = isControlled ? controlledValue : internalValue;

  const layoutId = React.useId();

  const handleSelect = (optionValue: string) => {
    if (disabled || optionValue === activeValue) return;
    if (!isControlled) {
      setInternalValue(optionValue);
    }
    onValueChange?.(optionValue);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent,
    optionValue: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(optionValue);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const otherOption =
        optionValue === options[0].value ? options[1] : options[0];
      handleSelect(otherOption.value);
      const container = event.currentTarget.parentElement;
      const otherButton = container?.querySelector(
        `[data-value="${otherOption.value}"]`
      ) as HTMLElement | null;
      otherButton?.focus();
    }
  };

  const isSmall = size === "sm";
  const isLarge = size === "lg";

  return (
    <LayoutGroup>
      <div
        data-slot="toggle-switch"
        role="radiogroup"
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        className={cn(
          "inline-flex items-center gap-0.5 rounded-[var(--radius-sm)] bg-[var(--theme-background-default)] p-0.5",
          isSmall ? "h-7" : isLarge ? "h-11" : "h-9",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        {options.map((option) => {
          const isActive = activeValue === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={option.label ?? option.value}
              data-value={option.value}
              data-active={isActive || undefined}
              disabled={disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelect(option.value)}
              onKeyDown={(e) => handleKeyDown(e, option.value)}
              className={cn(
                "relative inline-flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "transition-colors duration-150",
                "active:scale-[0.97] active:transition-transform active:duration-75",
                "motion-reduce:active:scale-100",
                isSmall
                  ? "min-w-7 h-6 px-1.5"
                  : isLarge
                    ? "min-w-11 h-10 px-3"
                    : "min-w-9 h-8 px-2",
                isActive
                  ? "text-primary"
                  : "text-[var(--theme-icon-secondary)] hover:text-[var(--theme-icon-primary)]",
                disabled
                  ? "pointer-events-none"
                  : "cursor-pointer"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={`toggle-indicator-${layoutId}`}
                  className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--theme-background-page)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.08),0px_1px_2px_-1px_rgba(0,0,0,0.08)]"
                  transition={springTransition}
                  style={{ willChange: "transform" }}
                />
              )}
              {option.icon != null && (
                <span
                  className={cn(
                    "relative z-[1] [&>svg]:shrink-0",
                    isSmall
                      ? "[&>svg]:size-3.5"
                      : isLarge
                        ? "[&>svg]:size-5"
                        : "[&>svg]:size-[18px]"
                  )}
                  aria-hidden
                >
                  {option.icon}
                </span>
              )}
              {option.label != null && option.icon == null && (
                <span
                  className={cn(
                    "relative z-[1] font-medium select-none",
                    isSmall ? "text-xs" : isLarge ? "text-base" : "text-sm"
                  )}
                >
                  {option.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export { ToggleSwitch };
