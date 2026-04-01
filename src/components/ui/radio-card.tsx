"use client"

import * as React from "react"
import { RadioGroup } from "@/components/ui/radio-group"
import { PortfolioRadioButton } from "@/components/ui/portfolio-radio"
import { cn } from "@/lib/utils"

interface RadioCardGroupProps extends React.ComponentProps<typeof RadioGroup> {
  className?: string
  children?: React.ReactNode
}

function RadioCardGroup({ className, ...props }: RadioCardGroupProps) {
  return (
    <RadioGroup
      data-slot="radio-card-group"
      className={cn("grid gap-2 sm:grid-cols-2", className)}
      {...props}
    />
  )
}

interface RadioCardOptionProps
  extends Omit<React.ComponentProps<typeof PortfolioRadioButton>, "children"> {
  title: string
  description?: string
  subDetail?: string
  /** Full-width block above the label row (e.g. template preview strip). */
  media?: React.ReactNode
  trailing?: React.ReactNode
  id?: string
}

function RadioCardOption({
  className,
  title,
  description,
  subDetail,
  media,
  trailing,
  id: idProp,
  ...props
}: RadioCardOptionProps) {
  const generatedId = React.useId()
  const id =
    idProp ??
    `radio-card-${String(props.value).replace(/\s/g, "-")}-${generatedId.replace(/:/g, "")}`
  const descriptionId = description ? `${id}-desc` : undefined

  return (
    <label
      htmlFor={id}
      className={cn(
        "group/card-option flex cursor-pointer flex-col overflow-hidden rounded-md border border-border bg-card text-left transition-colors",
        media != null && "bg-white dark:bg-zinc-950",
        media == null && "hover:bg-accent/30 hover:border-border",
        media != null && "hover:border-primary/40 hover:shadow-sm",
        "has-data-[checked]:border-primary has-data-[checked]:bg-primary/5",
        media != null &&
          "has-data-[checked]:bg-white dark:has-data-[checked]:bg-zinc-950",
        media != null && "hover:bg-white dark:hover:bg-zinc-950",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        "[&_[data-slot=radio-card-trailing]]:text-muted-foreground has-data-[checked]:[&_[data-slot=radio-card-trailing]]:text-primary",
        "[&_[data-slot=radio-card-trailing]_[data-slot=badge]]:font-headline [&_[data-slot=radio-card-trailing]_[data-slot=badge]]:tracking-normal",
        className
      )}
    >
      {media != null ? (
        <div className="w-full shrink-0 border-b border-border/60">{media}</div>
      ) : null}
      <div className="relative flex flex-col gap-1 p-4">
        <div className="flex items-start gap-2">
          <div className="flex items-start gap-3">
            <PortfolioRadioButton
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
              data-slot="radio-card-trailing"
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
  )
}

export { RadioCardGroup, RadioCardOption }
