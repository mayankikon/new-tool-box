"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface SimpleInventoryTableShellProps {
  /** Typically `Paginator` with `variant="inline"`. */
  pagination: React.ReactNode;
  /** Scrollable table markup (e.g. `CustomersFileCabinetTable` or `Table`). */
  children: React.ReactNode;
  /** Merged onto the outer flex column (e.g. `min-h-0 flex-1`). */
  className?: string;
  /**
   * `"top"` (default): pagination above the card, trailing end — Customers / Billing.
   * `"bottom"`: pagination inside the card below the scroll region — design-system **Table** showcase.
   */
  paginationPlacement?: "top" | "bottom";
  /**
   * When set, table card fill matches {@link FileCabinetTableChrome} (`bg-white` / `bg-sidebar` in dark).
   * Omit for semantic `bg-card` (Customers, Billing).
   */
  surface?: "light" | "dark";
}

/**
 * Product **Table** layout (no file-cabinet tabs): `border-border` card with inner scroll.
 * Default fill **`bg-card`**; pass **`surface`** to match **Table with tabs** / file-cabinet card.
 * Default **`paginationPlacement="top"`** when used directly; **`DesignSystemTableShellNoTabs`** sets **`"bottom"`** (Customers, Billing, Staff, Inventory table, design-system **Table** pattern).
 */
export function SimpleInventoryTableShell({
  pagination,
  children,
  className,
  paginationPlacement = "top",
  surface,
}: SimpleInventoryTableShellProps) {
  const cardSurfaceClass =
    surface === "light"
      ? "bg-white"
      : surface === "dark"
        ? "bg-sidebar"
        : "bg-card";

  const cardShellClass = cn(
    "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-border",
    cardSurfaceClass,
  );

  const cardBody = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col px-2 pb-2 pt-[4px]">
      <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain pr-px">
        {children}
      </div>
    </div>
  );

  if (paginationPlacement === "bottom") {
    return (
      <div
        className={cn(
          "flex min-h-0 min-w-0 w-full flex-col gap-[2px]",
          className,
        )}
      >
        <div className={cardShellClass}>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-2 pt-[4px] pb-0">
            <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain pr-px">
              {children}
            </div>
            <div className="flex min-w-0 shrink-0 justify-end pb-2 pt-2">
              {pagination}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 w-full flex-col gap-[2px]",
        className,
      )}
    >
      <div className="flex min-w-0 shrink-0 justify-end">{pagination}</div>
      <div className={cardShellClass}>
        {cardBody}
      </div>
    </div>
  );
}
