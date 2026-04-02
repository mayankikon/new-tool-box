"use client"

import * as React from "react"
import {
  DayPicker,
  type DayPickerProps,
} from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

/* ---------------------------------------------------------------------------
 * Calendar — month grid panel built on react-day-picker v9.
 *
 * Figma specifications (Date Picker Panel, node 13766:21141):
 *   Panel:      bg-card, rounded-card-sm (8px), h-[304px], overflow-clip
 *   Width:      250px per month
 *   Header:     border-b border-default, p-2 (8px), gap-2 (8px)
 *               Month name: text-sm font-medium text-foreground, centered
 *               Chevrons: 24x24 ghost buttons, rounded-sm, 16px icon
 *   Grid body:  flex-col gap-1 (4px) p-2 (8px) — weekdays AND day rows
 *               are siblings in the same container, same gap
 *   Each cell:  flex-1 (fluid), p-2 (8px), rounded-xs (4px)
 *               text-xs font-medium, centered
 *     Default:  text-foreground, bg transparent
 *     Today:    21px red circle (#e74341) absolutely positioned, white text
 *     Selected: full cell fill bg-primary (#1AB994 dark / theme), white text — NOT a circle
 *     Range middle: bg-primary/10 full cell, text-primary
 *     Outside:  text-foreground/30 (hint opacity)
 *     Hover:    bg-muted
 * -------------------------------------------------------------------------*/

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: DayPickerProps) {
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      className={cn("w-[250px]", className)}
      classNames={{
        root: "p-0",
        months: "flex gap-0",
        month: "flex h-[304px] w-[250px] flex-col overflow-clip",
        month_caption:
          "flex shrink-0 items-center justify-center gap-2 border-b border-border p-2",
        caption_label:
          "flex-1 text-center text-sm font-medium text-foreground",
        nav: "contents",
        button_previous:
          "inline-flex size-6 shrink-0 items-center justify-center rounded-sm bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        button_next:
          "inline-flex size-6 shrink-0 items-center justify-center rounded-sm bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        month_grid: "flex flex-1 flex-col gap-1 p-2",
        weekdays: "flex flex-1 gap-1",
        weekday:
          "flex flex-1 items-center justify-center rounded-xs p-2 text-center text-xs font-medium text-foreground/30",
        weeks: "contents",
        week: "flex flex-1 gap-1",
        day: cn(
          "relative flex flex-1 items-center justify-center rounded-xs p-0 text-center text-xs font-medium text-foreground",
          "has-[button]:hover:bg-muted",
          "[&:has([aria-selected])]:bg-primary/10",
          "[&:has([aria-selected].range_start)]:rounded-l-xs [&:has([aria-selected].range_start)]:rounded-r-none",
          "[&:has([aria-selected].range_end)]:rounded-r-xs [&:has([aria-selected].range_end)]:rounded-l-none",
          "[&:has([aria-selected].range_start.range_end)]:rounded-xs",
        ),
        day_button: cn(
          "inline-flex size-full items-center justify-center rounded-xs text-xs font-medium transition-colors",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        ),
        today: cn(
          "[&>button]:relative [&>button]:z-10",
          "[&>button]:before:absolute [&>button]:before:size-[21px] [&>button]:before:rounded-full [&>button]:before:bg-[#e74341]",
          "[&>button]:before:left-1/2 [&>button]:before:top-1/2 [&>button]:before:-translate-x-1/2 [&>button]:before:-translate-y-1/2",
          "[&>button]:text-white [&>button]:hover:text-white [&>button]:hover:bg-transparent",
          "[&>button[aria-selected]]:before:hidden",
        ),
        outside:
          "text-foreground/30 [&>button]:text-foreground/30 [&>button]:hover:text-foreground/50",
        disabled: "text-foreground/20 pointer-events-none",
        hidden: "invisible",
        selected: cn(
          "[&:not(.range_middle)]:bg-primary [&:not(.range_middle)]:rounded-xs",
          "[&:not(.range_middle)>button]:text-primary-foreground [&:not(.range_middle)>button]:hover:bg-primary [&:not(.range_middle)>button]:hover:text-primary-foreground",
        ),
        range_start: "range_start",
        range_end: "range_end",
        range_middle: cn(
          "range_middle",
          "[&>button]:bg-transparent [&>button]:text-primary [&>button]:hover:bg-primary/20 [&>button]:hover:text-primary",
        ),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="size-4" />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
