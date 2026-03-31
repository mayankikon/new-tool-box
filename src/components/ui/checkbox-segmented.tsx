"use client";

import * as React from "react";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface CheckboxSegmentedOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CheckboxSegmentedProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  options: CheckboxSegmentedOption[];
  className?: string;
  disabled?: boolean;
}

function CheckboxSegmented({
  value,
  defaultValue,
  onValueChange,
  options,
  className,
  disabled,
}: CheckboxSegmentedProps) {
  return (
    <CheckboxGroup
      data-slot="checkbox-segmented"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn(
        "inline-flex h-9 w-fit items-center gap-1 rounded-[var(--radius-md)] border border-border bg-muted/50 p-1",
        className
      )}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "relative flex cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1.5 text-sm font-medium transition-colors",
            "text-muted-foreground hover:text-foreground",
            "has-[[data-checked]]:bg-primary has-[[data-checked]]:text-primary-foreground has-[[data-checked]]:hover:bg-primary has-[[data-checked]]:hover:text-primary-foreground",
            "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
          )}
        >
          <Checkbox
            value={option.value}
            disabled={disabled}
            className="peer sr-only"
          />
          {option.icon != null ? (
            <span className="[&>svg]:size-4 [&>svg]:shrink-0" aria-hidden>
              {option.icon}
            </span>
          ) : null}
          <span>{option.label}</span>
        </label>
      ))}
    </CheckboxGroup>
  );
}

export { CheckboxSegmented };
