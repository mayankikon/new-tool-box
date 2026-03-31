import * as React from "react"

import { cn } from "@/lib/utils"
import { StepperVerticalItem } from "./stepper-vertical-item"
import type { StepStatus } from "./stepper-vertical-item"

interface StepperStep {
  label: string
  caption?: string
  supportText?: string
  icon?: React.ReactNode
  content?: React.ReactNode
  actions?: React.ReactNode
}

interface StepperVerticalProps extends React.ComponentProps<"div"> {
  steps: StepperStep[]
  currentStep: number
  align?: "left" | "right"
}

function deriveStatus(index: number, currentStep: number): StepStatus {
  if (index < currentStep) return "completed"
  if (index === currentStep) return "active"
  return "upcoming"
}

function StepperVertical({
  className,
  steps,
  currentStep,
  align = "left",
  ...props
}: StepperVerticalProps) {
  return (
    <div
      data-slot="stepper-vertical"
      role="list"
      aria-label="Progress steps"
      className={cn("flex w-full flex-col", className)}
      {...props}
    >
      {steps.map((step, index) => (
        <StepperVerticalItem
          key={step.label}
          role="listitem"
          aria-current={index === currentStep ? "step" : undefined}
          status={deriveStatus(index, currentStep)}
          stepNumber={index + 1}
          label={step.label}
          caption={step.caption}
          supportText={step.supportText}
          icon={step.icon}
          align={align}
          isLast={index === steps.length - 1}
          actions={step.actions}
        >
          {step.content}
        </StepperVerticalItem>
      ))}
    </div>
  )
}

export { StepperVertical }
export type { StepperVerticalProps, StepperStep }
