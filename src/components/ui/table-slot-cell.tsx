"use client"

import * as React from "react"
import Image from "next/image"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const tableSlotCellVariants = cva(
  "relative flex items-center min-h-8 min-w-9",
  {
    variants: {
      variant: {
        default: "gap-2 px-2.5",
        media: "gap-3 px-2.5",
        avatar: "gap-2 px-2.5",
        badge: "gap-1 px-2.5",
        progress: "gap-2 px-2.5",
        checkbox: "justify-center",
        icon: "justify-center",
        number: "justify-center px-2.5",
        empty: "",
      },
      state: {
        default: "",
        selected:
          "rounded-[var(--radius-2xs,2px)] border border-[var(--theme-stroke-accent,#437dfc)] bg-background",
        failed:
          "rounded-[var(--radius-2xs,2px)] border border-destructive bg-background",
      },
    },
    defaultVariants: {
      variant: "default",
      state: "default",
    },
  }
)

interface TableSlotCellBaseProps
  extends Omit<React.ComponentProps<"div">, "children">,
    VariantProps<typeof tableSlotCellVariants> {}

interface TableSlotCellDefaultProps extends TableSlotCellBaseProps {
  variant?: "default"
  label?: string
  leadIcon?: React.ReactNode
  tailIcon?: React.ReactNode
}

interface TableSlotCellAvatarProps extends TableSlotCellBaseProps {
  variant: "avatar"
  label?: string
  avatarSrc?: string
  avatarFallback?: string
  tailIcon?: React.ReactNode
}

interface TableSlotCellMediaProps extends TableSlotCellBaseProps {
  variant: "media"
  label?: string
  description?: string
  thumbnailSrc?: string
  thumbnailAlt?: string
  thumbnailClassName?: string
  tailIcon?: React.ReactNode
}

interface TableSlotCellBadgeProps extends TableSlotCellBaseProps {
  variant: "badge"
  badgeLabel?: string
  badgeIcon?: React.ReactNode
  badgeClassName?: string
  tailIcon?: React.ReactNode
}

interface TableSlotCellProgressProps extends TableSlotCellBaseProps {
  variant: "progress"
  progressValue?: number
  tailIcon?: React.ReactNode
}

interface TableSlotCellCheckboxProps extends TableSlotCellBaseProps {
  variant: "checkbox"
  checked?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
}

interface TableSlotCellIconProps extends TableSlotCellBaseProps {
  variant: "icon"
  icon?: React.ReactNode
}

interface TableSlotCellNumberProps extends TableSlotCellBaseProps {
  variant: "number"
  value?: string | number
}

interface TableSlotCellEmptyProps extends TableSlotCellBaseProps {
  variant: "empty"
}

type TableSlotCellProps =
  | TableSlotCellDefaultProps
  | TableSlotCellMediaProps
  | TableSlotCellAvatarProps
  | TableSlotCellBadgeProps
  | TableSlotCellProgressProps
  | TableSlotCellCheckboxProps
  | TableSlotCellIconProps
  | TableSlotCellNumberProps
  | TableSlotCellEmptyProps

/** Keys consumed by TableSlotCell; remainder are safe to forward to the root div. */
const TABLE_SLOT_CELL_OWN_KEYS = new Set([
  "variant",
  "state",
  "className",
  "label",
  "leadIcon",
  "tailIcon",
  "badgeLabel",
  "badgeIcon",
  "badgeClassName",
  "progressValue",
  "checked",
  "indeterminate",
  "onCheckedChange",
  "avatarSrc",
  "avatarFallback",
  "description",
  "thumbnailSrc",
  "thumbnailAlt",
  "thumbnailClassName",
  "icon",
  "value",
])

function getTableSlotCellRootDivProps(
  props: TableSlotCellProps,
): Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(props)) {
    if (!TABLE_SLOT_CELL_OWN_KEYS.has(key)) {
      out[key] = val
    }
  }
  return out as Omit<React.ComponentPropsWithoutRef<"div">, "className">
}

function SelectionHandle({ variant }: { variant: "selected" | "failed" }) {
  return (
    <div
      className={cn(
        "absolute -right-[3.5px] -bottom-[3.5px] size-1.5 rounded-[var(--radius-2xs,2px)] border bg-background",
        variant === "selected"
          ? "border-[var(--theme-stroke-accent,#437dfc)]"
          : "border-destructive"
      )}
    />
  )
}

function TableSlotCell(props: TableSlotCellProps) {
  const { className, variant = "default", state = "default" } = props
  const rootDivProps = getTableSlotCellRootDivProps(props)
  const showHandle = state === "selected" || state === "failed"

  if (variant === "empty") {
    return (
      <div
        data-slot="table-slot-cell"
        className={cn(
          "h-8 min-h-8 min-w-9",
          state === "selected" &&
            "rounded-[var(--radius-2xs,2px)] border border-[var(--theme-stroke-accent,#437dfc)] bg-background",
          state === "failed" &&
            "rounded-[var(--radius-2xs,2px)] border border-destructive bg-background",
          className,
        )}
        {...rootDivProps}
      />
    )
  }

  if (variant === "checkbox") {
    const { checked, indeterminate, onCheckedChange } =
      props as TableSlotCellCheckboxProps
    return (
      <div
        data-slot="table-slot-cell"
        className={cn(tableSlotCellVariants({ variant, state }), className)}
        {...rootDivProps}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(val) => onCheckedChange?.(val as boolean)}
        />
        {showHandle && <SelectionHandle variant={state!} />}
      </div>
    )
  }

  if (variant === "icon") {
    const { icon } = props as TableSlotCellIconProps
    return (
      <div
        data-slot="table-slot-cell"
        className={cn(tableSlotCellVariants({ variant, state }), className)}
        {...rootDivProps}
      >
        {icon && (
          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
            {icon}
          </span>
        )}
        {showHandle && <SelectionHandle variant={state!} />}
      </div>
    )
  }

  if (variant === "number") {
    const { value } = props as TableSlotCellNumberProps
    return (
      <div
        data-slot="table-slot-cell"
        className={cn(tableSlotCellVariants({ variant, state }), className)}
        {...rootDivProps}
      >
        <div className="flex min-h-px min-w-px flex-1 items-center justify-center">
          <span className="truncate text-xs font-normal leading-4 text-muted-foreground tabular-nums">
            {value}
          </span>
        </div>
        {showHandle && <SelectionHandle variant={state!} />}
      </div>
    )
  }

  if (variant === "avatar") {
    const { label, avatarSrc, avatarFallback, tailIcon } =
      props as TableSlotCellAvatarProps
    return (
      <div
        data-slot="table-slot-cell"
        className={cn(tableSlotCellVariants({ variant, state }), className)}
        {...rootDivProps}
      >
        <Avatar size="sm" className="size-4">
          {avatarSrc && <AvatarImage src={avatarSrc} alt={label ?? ""} />}
          <AvatarFallback className="text-[8px]">
            {avatarFallback ?? label?.charAt(0)?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-h-px min-w-px flex-1 items-center">
          <span className="truncate text-xs font-normal leading-4 text-foreground">
            {label}
          </span>
        </div>
        {tailIcon && (
          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
            {tailIcon}
          </span>
        )}
        {showHandle && <SelectionHandle variant={state!} />}
      </div>
    )
  }

  if (variant === "media") {
    const {
      label,
      description,
      thumbnailSrc,
      thumbnailAlt,
      thumbnailClassName,
      tailIcon,
    } = props as TableSlotCellMediaProps

    return (
      <div
        data-slot="table-slot-cell"
        className={cn(tableSlotCellVariants({ variant, state }), className)}
        {...rootDivProps}
      >
        <div
          className={cn(
            "flex h-14 w-18 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-transparent",
            thumbnailClassName,
          )}
        >
          {thumbnailSrc ? (
            <Image
              src={thumbnailSrc}
              alt={thumbnailAlt ?? label ?? ""}
              width={72}
              height={56}
              className="h-full w-full object-contain"
            />
          ) : null}
        </div>
        <div className="flex min-h-px min-w-px flex-1 flex-col justify-center gap-0.5">
          <span className="truncate text-sm font-medium leading-5 text-foreground">
            {label}
          </span>
          {description ? (
            <span className="truncate text-xs font-normal leading-4 text-muted-foreground">
              {description}
            </span>
          ) : null}
        </div>
        {tailIcon && (
          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
            {tailIcon}
          </span>
        )}
        {showHandle && <SelectionHandle variant={state!} />}
      </div>
    )
  }

  if (variant === "badge") {
    const { badgeLabel, badgeIcon, badgeClassName, tailIcon } =
      props as TableSlotCellBadgeProps
    return (
      <div
        data-slot="table-slot-cell"
        className={cn(tableSlotCellVariants({ variant, state }), className)}
        {...rootDivProps}
      >
        <div className="flex h-5 min-h-px min-w-px flex-1 items-center">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium leading-4 backdrop-blur-[2px]",
              "bg-muted/70 text-muted-foreground",
              badgeClassName,
            )}
          >
            {badgeIcon && (
              <span className="flex size-4 shrink-0 items-center justify-center [&>svg]:size-3">
                {badgeIcon}
              </span>
            )}
            {badgeLabel}
          </span>
        </div>
        {tailIcon && (
          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
            {tailIcon}
          </span>
        )}
        {showHandle && <SelectionHandle variant={state!} />}
      </div>
    )
  }

  if (variant === "progress") {
    const { progressValue = 0, tailIcon } =
      props as TableSlotCellProgressProps
    return (
      <div
        data-slot="table-slot-cell"
        className={cn(tableSlotCellVariants({ variant, state }), className)}
        {...rootDivProps}
      >
        <span className="w-8 shrink-0 truncate text-xs font-normal leading-4 text-muted-foreground tabular-nums">
          {progressValue}%
        </span>
        <div className="flex min-h-px min-w-px flex-1 flex-col items-start">
          <div className="flex h-1 w-full items-center overflow-clip rounded-full bg-muted">
            <div
              className="h-1 rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
            />
          </div>
        </div>
        {tailIcon && (
          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
            {tailIcon}
          </span>
        )}
        {showHandle && <SelectionHandle variant={state!} />}
      </div>
    )
  }

  // variant === "default"
  const { label, leadIcon, tailIcon } = props as TableSlotCellDefaultProps
  return (
    <div
      data-slot="table-slot-cell"
      className={cn(tableSlotCellVariants({ variant, state }), className)}
      {...rootDivProps}
    >
      {leadIcon && (
        <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
          {leadIcon}
        </span>
      )}
      <div className="flex min-h-px min-w-px flex-1 items-center">
        <span className="truncate text-sm font-normal leading-5 text-foreground">
          {label}
        </span>
      </div>
      {tailIcon && (
        <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
          {tailIcon}
        </span>
      )}
      {showHandle && <SelectionHandle variant={state!} />}
    </div>
  )
}

export { TableSlotCell, tableSlotCellVariants, type TableSlotCellProps }
