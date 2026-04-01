/**
 * Locked tuning for **file cabinet** chrome (`FileCabinetTableChrome` / `FileCabinetTabRow`) and shared
 * table metrics (`customers-file-cabinet-table.tsx` row heights / padding). Product **Customers** and
 * **Billing**, **Customers**, **Staff**, and inventory **table** view use **`DesignSystemTableShellNoTabs`**
 * (`SimpleInventoryTableShell` with bottom inline pagination + `surface`); **Campaigns**
 * (campaign table), and the design-system **Table with tabs** demo pass these into the file-cabinet components.
 *
 * Implementation: `src/app/design-playground/components/file-cabinet-table-chrome.tsx`
 */
export const FILE_CABINET_BILLING_TABLE_DEFAULTS = {
  /** Outer blur radius (px) for the active left lamp glow; passed to `FileCabinetTabRow`. */
  underGlowPx: 2,
  /** Shared corner radius (px) for folder tabs, card outline, and header band corners. */
  tabTopRadiusPx: 6,
  /** Theme primary — emerald left lamp + underline (not amber). */
  tabAccent: "primary" as const,
  headerCellHeightPx: 44,
  bodyCellHeightPx: 40,
  /** Horizontal inset per column (px); keep in sync with `px-3` on {@link TableHeaderCell} / {@link TableSlotCell}. */
  cellPaddingXPx: 12,
  showLeftLamp: true,
} as const;

export type FileCabinetBillingTableDefaults = typeof FILE_CABINET_BILLING_TABLE_DEFAULTS;
