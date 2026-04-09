"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none",
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "relative flex aspect-square size-4 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-input transition-colors outline-none",
          "group-focus-visible/radio-group-item:ring-4 group-focus-visible/radio-group-item:ring-ring/50 group-focus-visible/radio-group-item:ring-offset-1 group-focus-visible/radio-group-item:ring-offset-background",
          "group-hover/radio-group-item:border-input-hover group-hover/radio-group-item:bg-accent/50",
          "group-focus-visible/radio-group-item:border-ring",
          "group-disabled/radio-group-item:cursor-not-allowed group-disabled/radio-group-item:opacity-50 group-disabled/radio-group-item:hover:border-input group-disabled/radio-group-item:hover:bg-transparent",
          "group-aria-invalid/radio-group-item:border-destructive group-aria-invalid/radio-group-item:ring-3 group-aria-invalid/radio-group-item:ring-destructive/20 group-aria-invalid/radio-group-item:aria-checked:border-primary",
          "dark:bg-input/30 dark:group-hover/radio-group-item:border-input-hover dark:group-hover/radio-group-item:bg-accent/30 dark:group-aria-invalid/radio-group-item:border-destructive/50 dark:group-aria-invalid/radio-group-item:ring-destructive/40",
          "group-data-checked/radio-group-item:border-primary group-data-checked/radio-group-item:bg-primary group-data-checked/radio-group-item:text-primary-foreground group-data-checked/radio-group-item:hover:bg-[var(--primary-hover)] group-data-checked/radio-group-item:hover:border-[var(--primary-hover)] dark:group-data-checked/radio-group-item:bg-primary",
        )}
      >
        <RadioPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="flex size-4 items-center justify-center"
        >
          <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
        </RadioPrimitive.Indicator>
      </span>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
