import * as React from "react"

import { cn } from "@/lib/utils"
import { StepperIndicator } from "./stepper-indicator"
import { StepperConnector } from "./stepper-connector"
import type { StepStatus } from "./stepper-vertical-item"

interface StepperHorizontalItemProps extends React.ComponentProps<"div"> {
  status: StepStatus
  stepNumber: number
  label: string
  caption?: string
  position?: "top" | "bottom"
  align?: "left" | "center" | "right"
  icon?: React.ReactNode
  isFirst?: boolean
  isLast?: boolean
  /** Segment from previous step to this step (leading connector). */
  segmentBeforeCompleted?: boolean
  /** Segment from this step to the next (trailing connector). */
  segmentAfterCompleted?: boolean
}

function StepperHorizontalItem({
  className,
  status,
  stepNumber,
  label,
  caption,
  position = "top",
  align = "left",
  icon,
  isFirst = false,
  isLast = false,
  segmentBeforeCompleted = false,
  segmentAfterCompleted = false,
  ...props
}: StepperHorizontalItemProps) {
  const indicatorRow = (
    <div
      data-slot="stepper-horizontal-indicator-row"
      className="flex w-full shrink-0 items-center gap-2"
    >
      {align === "right" && !isFirst && (
        <StepperConnector
          orientation="horizontal"
          isCompleted={segmentBeforeCompleted}
        />
      )}
      {align === "center" && !isFirst && (
        <StepperConnector
          orientation="horizontal"
          isCompleted={segmentBeforeCompleted}
        />
      )}

      <StepperIndicator
        status={status}
        stepNumber={stepNumber}
        icon={icon}
        size="sm"
      />

      {align === "left" && !isLast && (
        <StepperConnector
          orientation="horizontal"
          isCompleted={segmentAfterCompleted}
        />
      )}
      {align === "center" && !isLast && (
        <StepperConnector
          orientation="horizontal"
          isCompleted={segmentAfterCompleted}
        />
      )}
    </div>
  )

  const textBlock = (
    <div
      data-slot="stepper-horizontal-text"
      className={cn(
        "flex w-full flex-col gap-1",
        align === "left" && "items-start pr-4",
        align === "center" && "items-center px-2 text-center",
        align === "right" && "items-end pl-4 text-right"
      )}
    >
      <span className="w-full text-base font-medium leading-6 text-[var(--theme-text-primary)]">
        {label}
      </span>
      {caption && (
        <p className="w-full text-sm leading-5 text-[var(--theme-text-secondary)]">
          {caption}
        </p>
      )}
    </div>
  )

  return (
    <div
      data-slot="stepper-horizontal-item"
      data-status={status}
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-4",
        className
      )}
      {...props}
    >
      {position === "top" ? (
        <>
          {indicatorRow}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {indicatorRow}
        </>
      )}
    </div>
  )
}

export { StepperHorizontalItem }
export type { StepperHorizontalItemProps }
