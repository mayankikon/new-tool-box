"use client";

import * as React from "react";
import { useTheme } from "@/components/theme/app-theme-provider";

import type { DashPreviewSurface } from "@/app/design-playground/components/dash-preview-canvas";
import { SimpleInventoryTableShell } from "@/components/chrome/simple-inventory-table-shell";

export interface DesignSystemTableShellNoTabsProps {
  /** Typically {@link Paginator} with `variant="inline"`. */
  pagination: React.ReactNode;
  /** Scrollable table markup (e.g. `CustomersFileCabinetTable` or sortable `Table`). */
  children: React.ReactNode;
  className?: string;
}

/**
 * Product **Table** layout matching design-system **Patterns → Table** (no file-cabinet tabs):
 * bordered card, theme `surface` fill (aligned with tabbed table chrome), inline paginator below the grid.
 */
export function DesignSystemTableShellNoTabs({
  pagination,
  children,
  className,
}: DesignSystemTableShellNoTabsProps) {
  const { resolvedTheme } = useTheme();
  const surface: DashPreviewSurface =
    resolvedTheme === "dark" ? "dark" : "light";

  return (
    <SimpleInventoryTableShell
      className={className}
      paginationPlacement="bottom"
      surface={surface}
      pagination={pagination}
    >
      {children}
    </SimpleInventoryTableShell>
  );
}
