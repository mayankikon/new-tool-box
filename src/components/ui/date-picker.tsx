"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { DatePickerInput } from "@/components/ui/date-picker-input"
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

/* ---------------------------------------------------------------------------
 * Figma panel shadow: shadows/modal-sm
 *   DROP_SHADOW(border-default, 0,0, spread:1)
 *   DROP_SHADOW(#0000000A, 0,12, blur:12, spread:-6)
 *   DROP_SHADOW(#0000000A, 0,6,  blur:6,  spread:-3)
 *   DROP_SHADOW(#0000000A, 0,3,  blur:3,  spread:-1.5)
 *   DROP_SHADOW(#0000000A, 0,1,  blur:1,  spread:-0.5)
 *   INNER_SHADOW(border-darker, 0,-1, spread:0)
 * -------------------------------------------------------------------------*/
const PANEL_CLASSES =
  "w-auto overflow-clip rounded-[var(--radius-Card-sm,8px)] border-0 bg-card p-0 shadow-[0px_0px_0px_1px_var(--border),0px_12px_12px_-6px_rgba(0,0,0,0.04),0px_6px_6px_-3px_rgba(0,0,0,0.04),0px_3px_3px_-1.5px_rgba(0,0,0,0.04),0px_1px_1px_-0.5px_rgba(0,0,0,0.04),inset_0px_-1px_0px_0px_var(--input)] ring-0"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
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

function DatePicker({
  value,
  onChange,
  defaultMonth,
  inputStyle = "default",
  size = "sm",
  label,
  labelTrailing,
  helperText,
  error,
  disabled,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleSelect = React.useCallback(
    (date: Date | undefined) => {
      onChange?.(date)
      setIsOpen(false)
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
              type="default"
              inputStyle={inputStyle}
              size={size}
              value={value}
              invalid={hasError}
              isOpen={isOpen}
              disabled={disabled}
            />
          }
        />
        <PopoverContent
          align="start"
          sideOffset={4}
          className={cn(PANEL_CLASSES)}
        >
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            defaultMonth={defaultMonth ?? value}
          />
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

export { DatePicker, PANEL_CLASSES }
export type { DatePickerProps }
