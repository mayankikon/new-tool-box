import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const stepperIndicatorVariants = cva(
  "inline-flex items-center justify-center rounded-full border box-border shrink-0 font-semibold",
  {
    variants: {
      status: {
        completed:
          "border-transparent bg-primary text-primary-foreground",
        active:
          "border-2 border-primary bg-background text-primary",
        upcoming:
          "border-[var(--theme-stroke-default)] bg-[var(--theme-background-container)] text-[var(--theme-text-tertiary)]",
      },
      size: {
        sm: "size-6 text-xs",
        md: "size-10 text-base",
      },
    },
    defaultVariants: {
      status: "upcoming",
      size: "sm",
    },
  }
)

interface StepperIndicatorProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof stepperIndicatorVariants> {
  stepNumber?: number
  icon?: React.ReactNode
}

function StepperIndicator({
  className,
  status = "upcoming",
  size = "sm",
  stepNumber,
  icon,
  ...props
}: StepperIndicatorProps) {
  const iconSize = size === "sm" ? "size-3.5" : "size-5"

  return (
    <div
      data-slot="stepper-indicator"
      data-status={status}
      className={cn(stepperIndicatorVariants({ status, size }), className)}
      {...props}
    >
      {status === "completed" ? (
        <Check className={iconSize} strokeWidth={2.5} aria-hidden />
      ) : icon ? (
        <span className={cn("flex items-center justify-center", iconSize)}>
          {icon}
        </span>
      ) : (
        <span>{stepNumber}</span>
      )}
    </div>
  )
}

export { StepperIndicator, stepperIndicatorVariants }
export type { StepperIndicatorProps }
