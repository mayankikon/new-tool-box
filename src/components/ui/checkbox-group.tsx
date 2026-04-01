"use client";

import * as React from "react";
import { CheckboxGroup as CheckboxGroupPrimitive } from "@base-ui/react/checkbox-group";

import { PortfolioCheckboxControl } from "@/components/ui/portfolio-checkbox";
import { cn } from "@/lib/utils";

/**
 * Manages multiple checkboxes (value = string[]).
 * Use with PortfolioCheckboxControl (with value prop) or CheckboxGroupItemWithDescription.
 */
function CheckboxGroup({
  className,
  ...props
}: CheckboxGroupPrimitive.Props) {
  return (
    <CheckboxGroupPrimitive
      data-slot="checkbox-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  );
}

interface CheckboxGroupItemWithDescriptionProps
  extends Omit<React.ComponentProps<typeof PortfolioCheckboxControl>, "children"> {
  label: string;
  description?: string;
}

function CheckboxGroupItemWithDescription({
  className,
  label,
  description,
  id: idProp,
  ...props
}: CheckboxGroupItemWithDescriptionProps) {
  const generatedId = React.useId();
  const id =
    idProp ??
    `checkbox-${String(props.value ?? "").replace(/\s/g, "-")}-${generatedId.replace(/:/g, "")}`;
  const descriptionId = description ? `${id}-desc` : undefined;

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md py-1 -my-1 transition-colors",
        "hover:bg-accent/50",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className
      )}
    >
      <PortfolioCheckboxControl
        id={id}
        aria-describedby={descriptionId}
        {...props}
        className="mt-0.5 shrink-0"
      />
      <span className="flex flex-col gap-0.5">
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
    </label>
  );
}

export { CheckboxGroup, CheckboxGroupItemWithDescription };
