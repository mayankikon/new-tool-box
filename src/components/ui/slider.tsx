"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

const thumbVariants = cva(
  [
    "block shrink-0 origin-center rounded-full border-2 border-primary bg-background shadow-sm",
    "cursor-grab touch-manipulation transition-[box-shadow,transform] duration-200 ease-out",
    /* Slight “drawer handle” lift: hover / focus-within ~4%, press ~5%, drag ~8% */
    "hover:scale-[1.04] hover:ring-2 hover:ring-ring/30",
    "active:scale-[1.05] active:cursor-grabbing",
    "focus-within:scale-[1.04] focus-visible:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
    "data-[dragging]:scale-[1.08] data-[dragging]:cursor-grabbing data-[dragging]:shadow-md",
    "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 motion-reduce:focus-within:scale-100 motion-reduce:data-[dragging]:scale-100",
    "disabled:pointer-events-none",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "size-3",
        md: "size-4",
      },
    },
    defaultVariants: { size: "md" },
  }
)

function valueToPercent(value: number, min: number, max: number): number {
  if (max === min) return 0
  return ((value - min) / (max - min)) * 100
}

/** Build sorted unique tick values from min→max using `markStep` spacing (always includes min and max). */
function buildMarkValues(
  min: number,
  max: number,
  markStep: number
): number[] {
  if (markStep <= 0 || max < min) return [min, max]
  const out: number[] = []
  for (let v = min; v < max; v += markStep) {
    out.push(Math.round((v + Number.EPSILON) * 1000) / 1000)
  }
  if (out[out.length - 1] !== max) out.push(max)
  return [...new Set(out)].sort((a, b) => a - b)
}

function defaultMarkStep(min: number, max: number, sliderStep: number): number {
  const span = max - min
  if (span <= 0) return sliderStep
  if (span <= 10) return Math.max(1, sliderStep)
  if (span <= 40) return Math.max(2, sliderStep)
  if (span <= 100) return Math.max(5, sliderStep)
  return Math.max(10, sliderStep)
}

function resolveMarks(
  min: number,
  max: number,
  sliderStep: number,
  marks: boolean,
  markValues: readonly number[] | undefined,
  markStep: number | undefined
): number[] | null {
  if (!marks && !markValues?.length) return null
  if (markValues?.length) {
    return [...new Set(markValues.map((v) => clamp(v, min, max)))].sort(
      (a, b) => a - b
    )
  }
  const step = markStep ?? defaultMarkStep(min, max, sliderStep)
  return buildMarkValues(min, max, step)
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

interface SliderMarksProps {
  min: number
  max: number
  values: readonly number[]
  formatMark: (n: number) => string
  size: "sm" | "md"
  /** Horizontal padding matching the slider control (thumb inset). */
  insetClassName: string
  showTicks?: boolean
}

function SliderMarks({
  min,
  max,
  values,
  formatMark,
  size,
  insetClassName,
  showTicks = true,
}: SliderMarksProps) {
  const labelClass =
    size === "sm"
      ? "text-[11px] leading-4 text-[var(--theme-text-tertiary)]"
      : "text-xs leading-4 text-[var(--theme-text-tertiary)]"

  return (
    <div className={cn("flex w-full flex-col gap-1", insetClassName)}>
      {showTicks && (
        <div
          className="relative h-2 w-full shrink-0"
          aria-hidden="true"
          data-slot="slider-mark-ticks"
        >
          {values.map((v) => (
            <span
              key={`tick-${v}`}
              className="absolute bottom-0 w-px translate-x-[-50%] bg-[var(--theme-stroke-default)]"
              style={{
                left: `${valueToPercent(v, min, max)}%`,
                height: size === "sm" ? 6 : 8,
              }}
            />
          ))}
        </div>
      )}
      <div
        className="relative h-4 w-full shrink-0"
        data-slot="slider-mark-labels"
        aria-hidden="true"
      >
        {values.map((v) => (
          <span
            key={`label-${v}`}
            className={cn(
              "absolute top-0 -translate-x-1/2 tabular-nums",
              labelClass
            )}
            style={{ left: `${valueToPercent(v, min, max)}%` }}
          >
            {formatMark(v)}
          </span>
        ))}
      </div>
    </div>
  )
}

type SliderRootSingleProps = SliderPrimitive.Root.Props<number>

type SliderMarksInput =
  | true
  | readonly number[]
  | { values: readonly number[]; showTicks?: boolean }

interface SliderProps
  extends Omit<SliderRootSingleProps, "children" | "thumbAlignment"> {
  className?: string
  /** `true`: auto ticks from `markStep` or a sensible default. Array: explicit values. Object: explicit values + tick visibility. Omit for no scale. */
  marks?: SliderMarksInput
  /** Space between numeric labels when `marks={true}`. */
  markStep?: number
  formatMark?: (value: number) => string
  size?: "sm" | "md"
  /** Optional field label (Sort UI input pattern). */
  label?: string
  /** Caption under the control. */
  helperText?: string
  /** Show small tick lines above numeric labels. Default true when marks are shown. */
  showMarkTicks?: boolean
  /** Merged onto each thumb; use for playground / brand-specific thumb chrome. */
  thumbClassName?: string
}

function isExplicitMarksObject(
  marks: Exclude<SliderMarksInput, true>
): marks is { values: readonly number[]; showTicks?: boolean } {
  return typeof marks === "object" && marks !== null && !Array.isArray(marks)
}

function normalizeMarksInput(
  marks: SliderMarksInput | undefined
): {
  enabled: boolean
  values?: readonly number[]
  showTicks?: boolean
} {
  if (marks == null) return { enabled: false }
  if (marks === true) return { enabled: true }
  if (Array.isArray(marks)) return { enabled: true, values: marks }
  if (isExplicitMarksObject(marks)) {
    return {
      enabled: true,
      values: marks.values,
      showTicks: marks.showTicks,
    }
  }
  return { enabled: false }
}

/** Single-thumb slider with optional numeric scale (marks + labels below), sizes, and field chrome. */
function Slider({
  className,
  disabled,
  marks: marksProp,
  markStep,
  formatMark = (v) => String(v),
  size = "md",
  label,
  helperText,
  showMarkTicks,
  thumbClassName,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: SliderProps) {
  const marksNorm = normalizeMarksInput(marksProp)
  const markList = resolveMarks(
    min,
    max,
    step,
    marksNorm.enabled,
    marksNorm.values,
    markStep
  )
  const ticksVisible =
    showMarkTicks ?? (markList != null && marksNorm.showTicks !== false)

  const insetClass = size === "sm" ? "px-1.5" : "px-2"
  const trackH = size === "sm" ? "h-1" : "h-1.5"
  const controlH = size === "sm" ? "min-h-9 py-1.5" : "min-h-10 py-2"

  const id = React.useId()
  const labelId = label ? `${id}-label` : undefined
  const helperId = helperText ? `${id}-helper` : undefined

  return (
    <div
      data-slot="slider-field"
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      {label && (
        <span
          id={labelId}
          className="text-sm font-medium leading-5 text-[var(--theme-text-primary)]"
        >
          {label}
        </span>
      )}
      <SliderPrimitive.Root
        className={cn(
          "relative flex w-full touch-none select-none flex-col gap-0",
          disabled && "pointer-events-none opacity-50"
        )}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        thumbAlignment="edge"
        aria-labelledby={labelId}
        aria-describedby={helperId}
        {...props}
      >
        {/* Horizontal inset on wrapper so Control width matches Track (Base UI edge-aligned thumbs). */}
        <div className={cn("flex w-full flex-col gap-0", insetClass)}>
          <SliderPrimitive.Control
            className={cn(
              "relative flex w-full cursor-grab items-center active:cursor-grabbing",
              controlH
            )}
            data-slot="slider-control"
          >
            <SliderPrimitive.Track
              className={cn(
                "relative w-full grow overflow-hidden rounded-full bg-muted",
                trackH
              )}
              data-slot="slider-track"
            >
              <SliderPrimitive.Indicator
                className="absolute h-full rounded-full bg-primary"
                data-slot="slider-indicator"
              />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              index={0}
              className={cn(thumbVariants({ size }), thumbClassName)}
              data-slot="slider-thumb"
            />
          </SliderPrimitive.Control>
          {markList && markList.length > 0 && (
            <SliderMarks
              min={min}
              max={max}
              values={markList}
              formatMark={formatMark}
              size={size}
              insetClassName=""
              showTicks={ticksVisible}
            />
          )}
        </div>
      </SliderPrimitive.Root>
      {helperText && (
        <p
          id={helperId}
          className="text-xs leading-4 text-[var(--theme-text-secondary)]"
        >
          {helperText}
        </p>
      )}
    </div>
  )
}

type SliderRootRangeProps = SliderPrimitive.Root.Props<readonly [number, number]>

interface RangeSliderProps
  extends Omit<SliderRootRangeProps, "children" | "thumbAlignment"> {
  className?: string
  marks?: SliderMarksInput
  markStep?: number
  formatMark?: (value: number) => string
  size?: "sm" | "md"
  label?: string
  helperText?: string
  showMarkTicks?: boolean
  /** Merged onto each thumb; use for playground / brand-specific thumb chrome. */
  thumbClassName?: string
}

/** Range slider with two thumbs; supports the same marks / labels / sizes as `Slider`. */
function RangeSlider({
  className,
  disabled,
  marks: marksProp,
  markStep,
  formatMark = (v) => String(v),
  size = "md",
  label,
  helperText,
  showMarkTicks,
  thumbClassName,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: RangeSliderProps) {
  const marksNorm = normalizeMarksInput(marksProp)
  const markList = resolveMarks(
    min,
    max,
    step,
    marksNorm.enabled,
    marksNorm.values,
    markStep
  )
  const ticksVisible =
    showMarkTicks ?? (markList != null && marksNorm.showTicks !== false)

  const insetClass = size === "sm" ? "px-1.5" : "px-2"
  const trackH = size === "sm" ? "h-1" : "h-1.5"
  const controlH = size === "sm" ? "min-h-9 py-1.5" : "min-h-10 py-2"

  const id = React.useId()
  const labelId = label ? `${id}-label` : undefined
  const helperId = helperText ? `${id}-helper` : undefined

  return (
    <div
      data-slot="slider-range-field"
      className={cn("flex w-full flex-col gap-1.5", className)}
    >
      {label && (
        <span
          id={labelId}
          className="text-sm font-medium leading-5 text-[var(--theme-text-primary)]"
        >
          {label}
        </span>
      )}
      <SliderPrimitive.Root
        className={cn(
          "relative flex w-full touch-none select-none flex-col gap-0",
          disabled && "pointer-events-none opacity-50"
        )}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        minStepsBetweenValues={1}
        thumbAlignment="edge"
        aria-labelledby={labelId}
        aria-describedby={helperId}
        {...props}
      >
        {/* Same inset wrapper as `Slider` — keeps thumb and fill aligned for edge mode. */}
        <div className={cn("flex w-full flex-col gap-0", insetClass)}>
          <SliderPrimitive.Control
            className={cn(
              "relative flex w-full cursor-grab items-center active:cursor-grabbing",
              controlH
            )}
            data-slot="slider-range-control"
          >
            <SliderPrimitive.Track
              className={cn(
                "relative w-full grow overflow-hidden rounded-full bg-muted",
                trackH
              )}
              data-slot="slider-range-track"
            >
              <SliderPrimitive.Indicator
                className="absolute h-full rounded-full bg-primary"
                data-slot="slider-range-indicator"
              />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              index={0}
              className={cn(thumbVariants({ size }), thumbClassName)}
              data-slot="slider-range-thumb-0"
            />
            <SliderPrimitive.Thumb
              index={1}
              className={cn(thumbVariants({ size }), thumbClassName)}
              data-slot="slider-range-thumb-1"
            />
          </SliderPrimitive.Control>
          {markList && markList.length > 0 && (
            <SliderMarks
              min={min}
              max={max}
              values={markList}
              formatMark={formatMark}
              size={size}
              insetClassName=""
              showTicks={ticksVisible}
            />
          )}
        </div>
      </SliderPrimitive.Root>
      {helperText && (
        <p
          id={helperId}
          className="text-xs leading-4 text-[var(--theme-text-secondary)]"
        >
          {helperText}
        </p>
      )}
    </div>
  )
}

export { Slider, RangeSlider, buildMarkValues, valueToPercent }
export type { SliderProps, RangeSliderProps, SliderMarksInput }
