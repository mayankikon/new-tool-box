"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

export type TableHeaderSortState = "asc" | "desc" | "inactive"

const TABLE_SORT_ICON_SRC: Record<TableHeaderSortState, string> = {
  asc: "/dealership-icons/table-sort-ascending.svg",
  desc: "/dealership-icons/table-sort-descending.svg",
  inactive: "/dealership-icons/table-sort-inactive.svg",
}

function TableSortIndicatorIcon({ state }: { state: TableHeaderSortState }) {
  return (
    <img
      key={state}
      src={TABLE_SORT_ICON_SRC[state]}
      alt=""
      width={16}
      height={16}
      className="size-4 shrink-0"
      aria-hidden
    />
  )
}

const tableHeaderCellVariants = cva(
  "flex items-center min-h-8 min-w-9 rounded-[var(--radius-xs,4px)]",
  {
    variants: {
      variant: {
        label: "gap-4 px-2.5",
        checkbox: "justify-center",
        icon: "justify-center",
        empty: "",
      },
    },
    defaultVariants: {
      variant: "label",
    },
  }
)

interface TableHeaderCellProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof tableHeaderCellVariants> {
  label?: string
  leadIcon?: React.ReactNode
  tailIcon?: React.ReactNode
  sortable?: boolean
  /** When `sortable`, selects dealership sort glyphs; defaults to `inactive`. */
  sortState?: TableHeaderSortState
  onSort?: () => void
  checked?: boolean
  indeterminate?: boolean
  onCheckedChange?: (checked: boolean) => void
}

function TableHeaderCell({
  className,
  variant = "label",
  label,
  leadIcon,
  tailIcon,
  sortable = false,
  sortState = "inactive",
  onSort,
  checked,
  indeterminate,
  onCheckedChange,
  ...props
}: TableHeaderCellProps) {
  if (variant === "empty") {
    return (
      <div
        data-slot="table-header-cell"
        className={cn("h-8 min-h-8 min-w-9", className)}
        {...props}
      />
    )
  }

  if (variant === "checkbox") {
    return (
      <div
        data-slot="table-header-cell"
        className={cn(tableHeaderCellVariants({ variant }), className)}
        {...props}
      >
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onCheckedChange={(val) => onCheckedChange?.(val as boolean)}
          aria-label="Select all"
        />
      </div>
    )
  }

  if (variant === "icon") {
    return (
      <div
        data-slot="table-header-cell"
        className={cn(tableHeaderCellVariants({ variant }), className)}
        {...props}
      >
        {leadIcon && (
          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
            {leadIcon}
          </span>
        )}
      </div>
    )
  }

  const sortIcon =
    sortable && !tailIcon ? (
      <TableSortIndicatorIcon state={sortState} />
    ) : (
      tailIcon
    )

  return (
    <div
      data-slot="table-header-cell"
      role={sortable ? "button" : undefined}
      tabIndex={sortable ? 0 : undefined}
      onClick={sortable ? onSort : undefined}
      onKeyDown={
        sortable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onSort?.()
              }
            }
          : undefined
      }
      className={cn(
        tableHeaderCellVariants({ variant }),
        sortable && "cursor-pointer select-none",
        className,
      )}
      {...props}
    >
      {leadIcon && (
        <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
          {leadIcon}
        </span>
      )}
      <div className="flex min-h-px min-w-0 flex-1 items-center">
        <span className="min-w-0 truncate text-sm font-medium leading-5 text-foreground">
          {label}
        </span>
        {sortIcon && (
          <span className="ml-1 flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4">
            {sortIcon}
          </span>
        )}
      </div>
    </div>
  )
}

export { TableHeaderCell, tableHeaderCellVariants }
