"use client";

import * as React from "react";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { PortfolioCheckboxControl } from "@/components/ui/portfolio-checkbox";
import { cn } from "@/lib/utils";

interface CheckboxCardGroupProps
  extends React.ComponentProps<typeof CheckboxGroup> {
  className?: string;
  children?: React.ReactNode;
}

function CheckboxCardGroup({ className, ...props }: CheckboxCardGroupProps) {
  return (
    <CheckboxGroup
      data-slot="checkbox-card-group"
      className={cn("grid gap-2 sm:grid-cols-2", className)}
      {...props}
    />
  );
}

interface CheckboxCardOptionProps
  extends Omit<React.ComponentProps<typeof PortfolioCheckboxControl>, "children"> {
  title: string;
  description?: string;
  subDetail?: string;
  trailing?: React.ReactNode;
  id?: string;
}

function CheckboxCardOption({
  className,
  title,
  description,
  subDetail,
  trailing,
  id: idProp,
  ...props
}: CheckboxCardOptionProps) {
  const generatedId = React.useId();
  const id =
    idProp ??
    `checkbox-card-${String(props.value ?? "").replace(/\s/g, "-")}-${generatedId.replace(/:/g, "")}`;
  const descriptionId = description ? `${id}-desc` : undefined;

  return (
    <label
      htmlFor={id}
      className={cn(
        "group/card-option flex cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-card text-left transition-colors",
        "hover:bg-accent/30 hover:border-border",
        "has-[[data-checked]]:border-primary has-[[data-checked]]:bg-primary/5",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        "[&_[data-slot=checkbox-card-trailing]]:text-muted-foreground has-[[data-checked]]:[&_[data-slot=checkbox-card-trailing]]:text-primary",
        "[&_[data-slot=checkbox-card-trailing]_[data-slot=badge]]:font-headline [&_[data-slot=checkbox-card-trailing]_[data-slot=badge]]:tracking-normal",
        className
      )}
    >
      <div className="relative flex flex-col gap-1 p-4">
        <div className="flex items-start gap-2">
          <div className="flex items-start gap-3">
            <PortfolioCheckboxControl
              id={id}
              aria-describedby={descriptionId}
              {...props}
              className="mt-0.5 shrink-0"
            />
            <div
              className={cn(
                "min-w-0 flex-1 flex flex-col gap-0.5",
                trailing != null && "pr-20"
              )}
            >
              <span className="text-sm font-medium leading-snug text-foreground">
                {title}
              </span>
              {description ? (
                <span
                  id={descriptionId}
                  className="text-sm text-muted-foreground leading-snug"
                >
                  {description}
                </span>
              ) : null}
            </div>
          </div>
          {trailing != null ? (
            <span
              data-slot="checkbox-card-trailing"
              className="absolute top-2 right-2 shrink-0 transition-colors"
            >
              {trailing}
            </span>
          ) : null}
        </div>
        {subDetail ? (
          <p className="text-xs text-muted-foreground pl-7">{subDetail}</p>
        ) : null}
      </div>
    </label>
  );
}

export { CheckboxCardGroup, CheckboxCardOption };
