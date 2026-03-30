"use client"

import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const SEGMENT_COUNT = 10

const progressBarVariants = cva("flex w-full flex-col gap-2", {
  variants: {
    variant: {
      linear: "",
      dashed: "",
    },
  },
  defaultVariants: {
    variant: "linear",
  },
})

interface ProgressBarProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof progressBarVariants> {
  value?: number
  label?: string
  caption?: string
  /** Hide the percentage value display */
  hideValue?: boolean
}

function ProgressBar({
  className,
  variant = "linear",
  value = 0,
  label,
  caption,
  hideValue = false,
  ...props
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? "Progress"}
      data-slot="progress-bar"
      className={cn(progressBarVariants({ variant }), className)}
      {...props}
    >
      {(label || !hideValue) && (
        <ProgressBarHeader>
          {label && <ProgressBarLabel>{label}</ProgressBarLabel>}
          {!hideValue && (
            <ProgressBarValue>{clampedValue}%</ProgressBarValue>
          )}
        </ProgressBarHeader>
      )}

      {variant === "dashed" ? (
        <ProgressBarDashedTrack value={clampedValue} />
      ) : (
        <ProgressBarLinearTrack value={clampedValue} />
      )}

      {caption && <ProgressBarCaption>{caption}</ProgressBarCaption>}
    </div>
  )
}

function ProgressBarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="progress-bar-header"
      className={cn("flex w-full items-center justify-between", className)}
      {...props}
    />
  )
}

function ProgressBarLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="progress-bar-label"
      className={cn(
        "text-sm font-medium leading-5 text-[var(--theme-text-primary,#111115)]",
        className
      )}
      {...props}
    />
  )
}

function ProgressBarValue({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="progress-bar-value"
      className={cn(
        "ml-auto text-sm font-normal leading-5 tabular-nums text-[var(--theme-text-secondary,#6f6f77)]",
        className
      )}
      {...props}
    />
  )
}

function ProgressBarLinearTrack({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & { value: number }) {
  return (
    <div
      data-slot="progress-bar-track"
      className={cn(
        "relative h-1 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-bar-indicator"
        className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function ProgressBarDashedTrack({
  className,
  value,
  ...props
}: React.ComponentProps<"div"> & { value: number }) {
  const filledSegments = Math.round((value / 100) * SEGMENT_COUNT)

  return (
    <div
      data-slot="progress-bar-track"
      className={cn(
        "flex h-1 w-full items-center gap-1 overflow-hidden",
        className
      )}
      {...props}
    >
      {Array.from({ length: SEGMENT_COUNT }, (_, i) => (
        <div
          key={i}
          data-slot="progress-bar-segment"
          data-filled={i < filledSegments || undefined}
          className={cn(
            "h-1 min-h-px min-w-px flex-1 rounded-full transition-colors duration-200",
            i < filledSegments ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  )
}

function ProgressBarCaption({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="progress-bar-caption"
      className={cn(
        "text-xs font-normal leading-4 text-[var(--theme-text-secondary,#6f6f77)]",
        className
      )}
      {...props}
    />
  )
}

export {
  ProgressBar,
  ProgressBarHeader,
  ProgressBarLabel,
  ProgressBarValue,
  ProgressBarLinearTrack,
  ProgressBarDashedTrack,
  ProgressBarCaption,
  progressBarVariants,
}
