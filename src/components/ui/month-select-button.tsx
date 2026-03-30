"use client";

import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface MonthSelectOption {
  value: string;
  label: string;
}

interface MonthSelectButtonProps {
  months: MonthSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  size?: ButtonProps["size"];
  className?: string;
  align?: "start" | "center" | "end";
}

export function MonthSelectButton({
  months,
  value,
  onValueChange,
  size = "header",
  className,
  align = "end",
}: MonthSelectButtonProps) {
  const currentIndex = Math.max(
    0,
    months.findIndex((month) => month.value === value),
  );
  const currentMonth = months[currentIndex] ?? months[0];
  const previousMonth = currentIndex > 0 ? months[currentIndex - 1] : null;
  const nextMonth = currentIndex < months.length - 1 ? months[currentIndex + 1] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="secondary"
            size={size}
            className={cn("min-w-[168px] justify-between", className)}
          />
        }
      >
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4" />
          <span>{currentMonth?.label ?? "Select month"}</span>
        </span>
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} side="bottom" sideOffset={6} className="w-56">
        <DropdownMenuItem
          disabled={!previousMonth}
          onClick={() => {
            if (previousMonth) onValueChange(previousMonth.value);
          }}
        >
          <ChevronLeft className="size-4" />
          Previous month
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={!nextMonth}
          onClick={() => {
            if (nextMonth) onValueChange(nextMonth.value);
          }}
        >
          <ChevronRight className="size-4" />
          Next month
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={value}>
          {months.map((month) => (
            <DropdownMenuRadioItem
              key={month.value}
              value={month.value}
              onClick={() => onValueChange(month.value)}
            >
              {month.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
