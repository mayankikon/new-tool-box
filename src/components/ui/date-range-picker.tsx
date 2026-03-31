"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import {
  subDays,
  subMonths,
  subYears,
  startOfDay,
} from "date-fns"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { DatePickerInput } from "@/components/ui/date-picker-input"
import { PANEL_CLASSES } from "@/components/ui/date-picker"
import {
  InputGroup,
  InputLabel,
  InputHelperText,
} from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePreset {
  label: string
  range: DateRange
}

const DEFAULT_PRESETS: DateRangePreset[] = (() => {
  const today = startOfDay(new Date())
  return [
    { label: "Today", range: { from: today, to: today } },
    { label: "Last 7 days", range: { from: subDays(today, 7), to: today } },
    { label: "Last 30 days", range: { from: subDays(today, 30), to: today } },
    { label: "Last 3 month", range: { from: subMonths(today, 3), to: today } },
    { label: "Last year", range: { from: subYears(today, 1), to: today } },
    { label: "All", range: { from: undefined, to: undefined } },
  ]
})()

/* ---------------------------------------------------------------------------
 * PresetSidebar — quick-preset buttons.
 *
 * Figma (node 13766:21202):
 *   Container: w-[160px], shrink-0, h-full, border-r border-default,
 *              flex flex-col gap-1 (4px) p-2 (8px)
 *   Each item: px-2 (8px) py-1 (4px), rounded-xs, w-full
 *   Selected:  bg-primary (theme; dark #02B689), text white
 *   Default:   text-muted, hover: bg-muted
 * -------------------------------------------------------------------------*/

interface PresetSidebarProps {
  presets: DateRangePreset[]
  selected?: DateRange
  onSelect: (range: DateRange) => void
}

function PresetSidebar({ presets, selected, onSelect }: PresetSidebarProps) {
  const isPresetSelected = (preset: DateRangePreset) => {
    if (!selected?.from && !selected?.to && !preset.range.from && !preset.range.to) {
      return true
    }
    if (!selected?.from || !selected?.to || !preset.range.from || !preset.range.to) {
      return false
    }
    return (
      preset.range.from.getTime() === selected.from.getTime() &&
      preset.range.to.getTime() === selected.to.getTime()
    )
  }

  return (
    <div
      data-slot="date-range-presets"
      className="flex h-full w-[160px] shrink-0 flex-col gap-1 border-r border-border p-2"
    >
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onSelect(preset.range)}
          className={cn(
            "w-full rounded-xs px-2 py-1 text-left text-sm font-medium transition-colors",
            isPresetSelected(preset)
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  presets?: DateRangePreset[]
  showPresets?: boolean
  defaultMonth?: Date
  inputStyle?: "default" | "shadow" | "soft"
  size?: "sm" | "lg"
  label?: string
  labelTrailing?: React.ReactNode
  helperText?: string
  error?: string
  disabled?: boolean
  className?: string
}

function DateRangePicker({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  showPresets = true,
  defaultMonth,
  inputStyle = "default",
  size = "sm",
  label,
  labelTrailing,
  helperText,
  error,
  disabled,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = React.useCallback(
    (range: DateRange | undefined) => {
      onChange?.(range)
    },
    [onChange]
  )

  const handlePresetSelect = React.useCallback(
    (range: DateRange) => {
      onChange?.(range)
    },
    [onChange]
  )

  const hasError = !!error
  const captionText = error || helperText

  return (
    <InputGroup className={className} disabled={disabled}>
      {label && <InputLabel trailing={labelTrailing}>{label}</InputLabel>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <DatePickerInput
              type="range"
              inputStyle={inputStyle}
              size={size}
              value={value?.from}
              endValue={value?.to}
              invalid={hasError}
              isOpen={isOpen}
              disabled={disabled}
            />
          }
        />
        <PopoverContent
          align="start"
          sideOffset={4}
          className={cn(PANEL_CLASSES, "h-[304px]")}
        >
          <div className="flex h-full items-center">
            {showPresets && (
              <PresetSidebar
                presets={presets}
                selected={value}
                onSelect={handlePresetSelect}
              />
            )}
            <Calendar
              mode="range"
              selected={value}
              onSelect={handleSelect}
              numberOfMonths={2}
              defaultMonth={defaultMonth ?? value?.from}
              className="h-full w-auto"
              classNames={{
                months: "flex h-full gap-0",
                month: "flex h-full w-[260px] flex-col overflow-clip first:border-r first:border-border",
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
      {captionText && (
        <InputHelperText variant={hasError ? "error" : "default"}>
          {captionText}
        </InputHelperText>
      )}
    </InputGroup>
  )
}

export { DateRangePicker, DEFAULT_PRESETS }
export type { DateRangePickerProps, DateRangePreset }
