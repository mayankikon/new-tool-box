"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Calendar, ArrowRight } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"

/* ---------------------------------------------------------------------------
 * Container — the bordered shell wrapping the date segments and icon.
 * Mirrors the Input component's inputContainerVariants but with
 * date-picker-specific adjustments from Figma.
 *
 * Figma tokens:
 *   Default:  bg-input (white), border-darker (rgba(39,39,42,0.15)), 1px, rounded-md (8px)
 *   Shadow:   same as Default + shadow(0,1,2 @ 0.05) + inner-shadow(0,-1,0 @ 0.08)
 *   Soft:     bg-input-soft (rgba(39,39,42,0.06)), no border, rounded-md
 *   Size lg:  p-2 (8px)
 *   Size sm:  p-1.5 (6px)
 * -------------------------------------------------------------------------*/

const datePickerContainerVariants = cva(
  "group/date-picker flex w-full cursor-pointer items-center gap-1.5 overflow-clip rounded-md transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      inputStyle: {
        default:
          "border border-input bg-white hover:border-input-hover hover:bg-[var(--theme-background-input-hover)] dark:bg-sidebar",
        shadow:
          "relative border border-input bg-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] hover:border-input-hover hover:bg-[var(--theme-background-input-hover)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0px_-1px_0px_0px_rgba(0,0,0,0.08)] dark:bg-sidebar dark:shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)]",
        soft: "border border-transparent bg-white hover:bg-[var(--theme-background-input-hover)] dark:bg-sidebar",
      },
      size: {
        sm: "p-1.5",
        lg: "p-2",
      },
    },
    defaultVariants: {
      inputStyle: "default",
      size: "sm",
    },
  }
)

/* ---------------------------------------------------------------------------
 * DateSegment — a single dd / mm / yyyy field.
 *
 * Figma tokens:
 *   Placeholder:  text/muted (#6f6f77), font-normal 14px/20px
 *   Filled:       text/default (#111115), font-normal 14px/20px
 *   Disabled:     text/hint (rgba(39,39,42,0.3))
 *   Width:  dd=26px, mm=33px, yyyy=40px
 *   Padding: px-1 (4px)
 *   Border-radius: rounded-xs (4px)
 * -------------------------------------------------------------------------*/

function DateSegment({
  value,
  placeholder,
  width,
  isDisabled,
}: {
  value?: string
  placeholder: string
  width: string
  isDisabled?: boolean
}) {
  const isFilled = value !== undefined && value !== ""
  return (
    <span
      data-slot="date-segment"
      className={cn(
        "inline-flex items-center justify-center rounded-xs px-1 text-sm leading-5 tabular-nums",
        isDisabled
          ? "text-foreground/30"
          : isFilled
            ? "text-foreground"
            : "text-muted-foreground",
        width
      )}
    >
      {isFilled ? value : placeholder}
    </span>
  )
}

/* ---------------------------------------------------------------------------
 * DateSegmentSeparator — the `/` between segments.
 * Figma: text/hint rgba(39,39,42,0.3), 14px
 * -------------------------------------------------------------------------*/

function DateSegmentSeparator() {
  return (
    <span aria-hidden className="text-sm leading-5 text-foreground/30 select-none">
      /
    </span>
  )
}

/* ---------------------------------------------------------------------------
 * DateSegmentGroup — dd / mm / yyyy triplet.
 * Figma: gap-0.5 (2px) between segments.
 * -------------------------------------------------------------------------*/

function DateSegmentGroup({
  value,
  isDisabled,
  className,
}: {
  value?: Date | null
  isDisabled?: boolean
  className?: string
}) {
  const day = value ? format(value, "dd") : undefined
  const month = value ? format(value, "MM") : undefined
  const year = value ? format(value, "yyyy") : undefined

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <DateSegment value={day} placeholder="dd" width="w-[26px]" isDisabled={isDisabled} />
      <DateSegmentSeparator />
      <DateSegment value={month} placeholder="mm" width="w-[33px]" isDisabled={isDisabled} />
      <DateSegmentSeparator />
      <DateSegment value={year} placeholder="yyyy" width="w-[40px]" isDisabled={isDisabled} />
    </span>
  )
}

/* ---------------------------------------------------------------------------
 * DatePickerInput — the trigger button.
 *
 * Figma states:
 *   Active:   components/input-focus = shadow(border-default 0,0 spread:3)
 *             + inner-shadow(border-input-highlight 0,0 spread:1)
 *   Failed:   border-destructive (#e74341), NO ring
 *   Disabled: bg-input-disabled (rgba(39,39,42,0.06)),
 *             border-default (rgba(39,39,42,0.1)),
 *             text/hint for segments, pointer-events-none
 * -------------------------------------------------------------------------*/

interface DatePickerInputProps
  extends Omit<React.ComponentProps<"button">, "type" | "value">,
    VariantProps<typeof datePickerContainerVariants> {
  type?: "default" | "range"
  value?: Date | null
  endValue?: Date | null
  invalid?: boolean
  isOpen?: boolean
}

function DatePickerInput({
  className,
  type = "default",
  inputStyle = "default",
  size = "sm",
  value,
  endValue,
  invalid,
  isOpen,
  disabled,
  ...props
}: DatePickerInputProps) {
  return (
    <button
      type="button"
      data-slot="date-picker-input"
      disabled={disabled}
      aria-invalid={invalid || undefined}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        datePickerContainerVariants({ inputStyle, size }),
        isOpen &&
          "border-ring-input ring-3 ring-ring-input/50",
        invalid &&
          !isOpen &&
          "border-destructive",
        disabled &&
          "pointer-events-none border-border bg-muted shadow-none after:hidden hover:bg-muted",
        className
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-0.5">
        <DateSegmentGroup value={value} isDisabled={disabled} />
        {type === "range" && (
          <>
            <ArrowRight className="mx-0.5 size-4 shrink-0 text-muted-foreground" />
            <DateSegmentGroup value={endValue} isDisabled={disabled} />
          </>
        )}
      </span>
      <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
        <Calendar className="size-4" />
      </span>
    </button>
  )
}

export {
  DatePickerInput,
  datePickerContainerVariants,
  DateSegmentGroup,
}
