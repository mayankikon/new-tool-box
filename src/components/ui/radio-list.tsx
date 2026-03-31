"use client"

import * as React from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

interface RadioListProps extends React.ComponentProps<typeof RadioGroup> {
  className?: string
  children?: React.ReactNode
}

function RadioList({ className, ...props }: RadioListProps) {
  return (
    <RadioGroup
      data-slot="radio-list"
      className={cn("flex flex-col gap-0", className)}
      {...props}
    />
  )
}

interface RadioListItemProps
  extends Omit<React.ComponentProps<typeof RadioGroupItem>, "children"> {
  label: string
  description?: string
  right?: React.ReactNode
  id?: string
}

function RadioListItem({
  className,
  label,
  description,
  right,
  id: idProp,
  ...props
}: RadioListItemProps) {
  const generatedId = React.useId()
  const id =
    idProp ?? `radio-list-${String(props.value).replace(/\s/g, "-")}-${generatedId.replace(/:/g, "")}`
  const descriptionId = description ? `${id}-desc` : undefined

  return (
    <label
      htmlFor={id}
      className={cn(
        "group/list-item flex cursor-pointer items-start gap-3 rounded-md border border-transparent px-3 py-2.5 transition-colors",
        "hover:bg-accent/50",
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        "[&_[data-slot=radio-list-item-right]]:text-muted-foreground group-has-data-[checked]/list-item:[&_[data-slot=radio-list-item-right]]:text-primary",
        className
      )}
    >
      <RadioGroupItem
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
          data-slot="radio-list-item-right"
          className="shrink-0 transition-colors"
        >
          {right}
        </span>
      ) : null}
    </label>
  )
}

export { RadioList, RadioListItem }
