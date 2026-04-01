import * as React from "react"

import { cn } from "@/lib/utils"
import { StepperHorizontalItem } from "./stepper-horizontal-item"
import type { StepStatus } from "./stepper-vertical-item"
import type { StepperStep } from "./stepper-vertical"

interface StepperHorizontalProps extends React.ComponentProps<"div"> {
  steps: StepperStep[]
  currentStep: number
  position?: "top" | "bottom"
  align?: "left" | "center" | "right"
}

function deriveStatus(index: number, currentStep: number): StepStatus {
  if (index < currentStep) return "completed"
  if (index === currentStep) return "active"
  return "upcoming"
}

function StepperHorizontal({
  className,
  steps,
  currentStep,
  position = "top",
  align = "left",
  ...props
}: StepperHorizontalProps) {
  return (
    <div
      data-slot="stepper-horizontal"
      role="list"
      aria-label="Progress steps"
      className={cn("flex w-full items-start", className)}
      {...props}
    >
      {steps.map((step, index) => (
        <StepperHorizontalItem
          key={step.label}
          role="listitem"
          aria-current={index === currentStep ? "step" : undefined}
          status={deriveStatus(index, currentStep)}
          stepNumber={index + 1}
          label={step.label}
          caption={step.caption}
          icon={step.icon}
          position={position}
          align={align}
          isFirst={index === 0}
          isLast={index === steps.length - 1}
          segmentBeforeCompleted={index > 0 && index <= currentStep}
          segmentAfterCompleted={index < currentStep}
        />
      ))}
    </div>
  )
}

export { StepperHorizontal }
export type { StepperHorizontalProps }
