import * as React from "react"

import { cn } from "@/lib/utils"
import { StepperIndicator } from "./stepper-indicator"
import { StepperConnector } from "./stepper-connector"

type StepStatus = "completed" | "active" | "upcoming"

interface StepperVerticalItemProps extends React.ComponentProps<"div"> {
  status: StepStatus
  stepNumber: number
  label: string
  caption?: string
  supportText?: string
  align?: "left" | "right"
  icon?: React.ReactNode
  isLast?: boolean
  actions?: React.ReactNode
}

function StepperVerticalItem({
  className,
  status,
  stepNumber,
  label,
  caption,
  supportText,
  align = "left",
  icon,
  isLast = false,
  actions,
  children,
  ...props
}: StepperVerticalItemProps) {
  const indicatorColumn = (
    <div
      data-slot="stepper-vertical-indicator-column"
      className="flex w-6 shrink-0 flex-col items-center"
    >
      <StepperIndicator
        status={status}
        stepNumber={stepNumber}
        icon={icon}
        size="sm"
      />
      {!isLast && (
        <StepperConnector
          orientation="vertical"
          isCompleted={status === "completed"}
        />
      )}
    </div>
  )

  const contentColumn = (
    <div
      data-slot="stepper-vertical-content"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-3",
        align === "right" && "items-end text-right"
      )}
    >
      <div className="flex w-full flex-col gap-1">
        <div className="flex w-full items-center gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 text-base font-medium leading-6 text-[var(--theme-text-primary)]",
              align === "right" && "text-right"
            )}
          >
            {label}
          </span>
          {supportText && (
            <span className="shrink-0 text-sm leading-5 text-[var(--theme-text-secondary)]">
              {supportText}
            </span>
          )}
        </div>
        {caption && (
          <p className="text-sm leading-5 text-[var(--theme-text-secondary)]">
            {caption}
          </p>
        )}
      </div>

      {children && (
        <div data-slot="stepper-vertical-slot" className="w-full">
          {children}
        </div>
      )}

      {actions && (
        <div
          data-slot="stepper-vertical-actions"
          className="flex w-full items-start gap-1"
        >
          {actions}
        </div>
      )}

      {!isLast && <div className="h-6 w-full shrink-0" aria-hidden="true" />}
    </div>
  )

  return (
    <div
      data-slot="stepper-vertical-item"
      data-status={status}
      className={cn(
        "flex w-full items-start gap-6",
        align === "right" && "flex-row-reverse",
        className
      )}
      {...props}
    >
      {indicatorColumn}
      {contentColumn}
    </div>
  )
}

export { StepperVerticalItem }
export type { StepperVerticalItemProps, StepStatus }
