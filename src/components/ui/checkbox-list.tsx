"use client";

import * as React from "react";
import { CheckboxGroup } from "@/components/ui/checkbox-group";
import { PortfolioCheckboxControl } from "@/components/ui/portfolio-checkbox";
import { cn } from "@/lib/utils";

interface CheckboxListProps
  extends React.ComponentProps<typeof CheckboxGroup> {
  className?: string;
  children?: React.ReactNode;
}

function CheckboxList({ className, ...props }: CheckboxListProps) {
  return (
    <CheckboxGroup
      data-slot="checkbox-list"
      className={cn("flex flex-col gap-0", className)}
      {...props}
    />
  );
}

interface CheckboxListItemProps
  extends Omit<React.ComponentProps<typeof PortfolioCheckboxControl>, "children"> {
  label: string;
  description?: string;
  right?: React.ReactNode;
  id?: string;
}

function CheckboxListItem({
  className,
  label,
  description,
  right,
  id: idProp,
  ...props
}: CheckboxListItemProps) {
  const generatedId = React.useId();
  const id =
    idProp ??
    `checkbox-list-${String(props.value ?? "").replace(/\s/g, "-")}-${generatedId.replace(/:/g, "")}`;
  const descriptionId = description ? `${id}-desc` : undefined;

  return (
    <label
      htmlFor={id}
      className={cn(
        "group/list-item flex cursor-pointer items-start gap-3 rounded-md border border-transparent px-3 py-2.5 transition-colors",
        "hover:bg-accent/50",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        "[&_[data-slot=checkbox-list-item-right]]:text-muted-foreground group-has-[[data-checked]]/list-item:[&_[data-slot=checkbox-list-item-right]]:text-primary",
        className
      )}
    >
      <PortfolioCheckboxControl
        id={id}
        aria-describedby={descriptionId}
        {...props}
        className="mt-0.5 shrink-0"
      />
      <span className="min-w-0 flex-1 flex flex-col gap-0.5">
        <span className="text-sm font-medium leading-none text-foreground">
          {label}
        </span>
        {description ? (
          <span
            id={descriptionId}
            className="text-sm text-muted-foreground leading-snug"
          >
            {description}
          </span>
        ) : null}
      </span>
      {right != null ? (
        <span
          data-slot="checkbox-list-item-right"
          className="shrink-0 transition-colors"
        >
          {right}
        </span>
      ) : null}
    </label>
  );
}

export { CheckboxList, CheckboxListItem };
