"use client";

import { cn } from "@/lib/utils";

export interface VariantOption {
  id: string;
  label: string;
  hint?: string;
}

interface VariantPickerProps {
  options: VariantOption[];
  value: string;
  onValueChange: (id: string) => void;
  className?: string;
}

export function VariantPicker({
  options,
  value,
  onValueChange,
  className,
}: VariantPickerProps) {
  return (
    <div
      className={cn("grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5", className)}
      role="listbox"
      aria-label="Visual variant"
    >
      {options.map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => onValueChange(opt.id)}
            className={cn(
              "rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "border-primary/60 bg-primary/10 text-foreground"
                : "border-border bg-card/60 text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground"
            )}
          >
            <span className="font-medium">{opt.label}</span>
            {opt.hint ? (
              <span className="mt-0.5 block text-xs text-muted-foreground">{opt.hint}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
