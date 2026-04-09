"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center outline-none",
        "focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        "group-has-disabled/field:opacity-50",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "relative flex size-4 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[4px] border border-input transition-colors outline-none",
          "group-focus-visible:ring-4 group-focus-visible:ring-ring/50 group-focus-visible:ring-offset-1 group-focus-visible:ring-offset-background",
          "group-hover:border-input-hover group-hover:bg-accent/50",
          "group-focus-visible:border-ring",
          "group-disabled:cursor-not-allowed group-disabled:opacity-50 group-disabled:hover:border-input group-disabled:hover:bg-transparent",
          "group-aria-invalid:border-destructive group-aria-invalid:ring-3 group-aria-invalid:ring-destructive/20 group-aria-invalid:group-data-checked:border-primary",
          "dark:bg-input/30 dark:group-hover:border-input-hover dark:group-hover:bg-accent/30 dark:group-aria-invalid:border-destructive/50 dark:group-aria-invalid:ring-destructive/40",
          "group-data-checked:border-primary group-data-checked:bg-primary group-data-checked:text-primary-foreground group-data-checked:hover:bg-[var(--primary-hover)] group-data-checked:hover:border-[var(--primary-hover)] dark:group-data-checked:bg-primary",
        )}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="absolute inset-0 flex items-center justify-center leading-none text-current transition-none"
        >
          <CheckIcon className="block size-3.5" aria-hidden />
        </CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
