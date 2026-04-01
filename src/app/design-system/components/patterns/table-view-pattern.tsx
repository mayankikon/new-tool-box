"use client";

import { useCallback, useMemo, useState } from "react";
import { useTheme } from "next-themes";

import type { DashPreviewSurface } from "@/app/design-playground/components/dash-preview-canvas";
import { FileCabinetTableChrome } from "@/app/design-playground/components/file-cabinet-table-chrome";
import { DesignSystemTableShellNoTabs } from "@/components/chrome/design-system-table-shell-no-tabs";
import { CustomersFileCabinetTable } from "@/components/customers/customers-file-cabinet-table";
import {
  compareCustomerValues,
  CUSTOMER_DECK_TAB_LABELS,
  CUSTOMER_ROWS,
  CUSTOMER_TAB_FILTER,
  type CustomerSortKey,
} from "@/components/customers/customers-table-model";
import { Paginator } from "@/components/ui/paginator";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";

const { underGlowPx, tabAccent, tabTopRadiusPx } = FILE_CABINET_BILLING_TABLE_DEFAULTS;

/**
 * **Table with tabs**: file-cabinet shell (folder tabs, Preset + LED under labels, fused SVG stroke),
 * sortable grid, inline {@link Paginator} below the grid (trailing end). Tab folder motion uses the production
 * sink-rise treatment (`tabMotionVariant="sink-rise"`).
 */
export function DesignSystemTableViewPattern() {
  const { resolvedTheme } = useTheme();
  const previewSurface: DashPreviewSurface =
    resolvedTheme === "dark" ? "dark" : "light";

  const [deckTab, setDeckTab] = useState("drive");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: CustomerSortKey;
    direction: "asc" | "desc";
  }>({ key: "vin", direction: "asc" });

  const filteredByTab = useMemo(() => {
    const filterFn = CUSTOMER_TAB_FILTER[deckTab] ?? CUSTOMER_TAB_FILTER.drive;
    return CUSTOMER_ROWS.filter(filterFn);
  }, [deckTab]);

  const sortedCustomers = useMemo(
    () =>
      [...filteredByTab].sort((left, right) =>
        compareCustomerValues(left, right, sortConfig.key, sortConfig.direction),
      ),
    [filteredByTab, sortConfig.direction, sortConfig.key],
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedCustomers = sortedCustomers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const handleDeckTabChange = useCallback((next: string) => {
    setDeckTab(next);
    setCurrentPage(1);
  }, []);

  return (
    <div className="flex min-h-[min(28rem,70vh)] min-w-0 w-full flex-col">
      <FileCabinetTableChrome
        className="flex min-h-[280px] min-w-0 flex-1 flex-col"
        value={deckTab}
        onValueChange={handleDeckTabChange}
        labels={CUSTOMER_DECK_TAB_LABELS}
        surface={previewSurface}
        underGlowPx={underGlowPx}
        accent={tabAccent}
        tabTopRadiusPx={tabTopRadiusPx}
        showLeftLamp={false}
        noLeftLampBelowStyle="preset-led"
        tabMotionVariant="sink-rise"
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-2 pt-[4px]">
          <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
            <CustomersFileCabinetTable
              rows={pagedCustomers}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
            />
          </div>
          <div className="flex min-w-0 shrink-0 justify-end px-2 pt-2">
            <Paginator
              variant="inline"
              currentPage={safeCurrentPage}
              totalPages={totalPages}
              totalItems={sortedCustomers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </FileCabinetTableChrome>
    </div>
  );
}

/**
 * **Table** (no tabs): same {@link CustomersFileCabinetTable} body as {@link DesignSystemTableViewPattern},
 * without folder tabs or file-cabinet SVG chrome. {@link Paginator} below the grid; same table card fill as
 * **Table with tabs** via {@link SimpleInventoryTableShell} **`surface`**.
 */
export function DesignSystemTableViewPatternNoTabs() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: CustomerSortKey;
    direction: "asc" | "desc";
  }>({ key: "vin", direction: "asc" });

  const sortedCustomers = useMemo(
    () =>
      [...CUSTOMER_ROWS].sort((left, right) =>
        compareCustomerValues(left, right, sortConfig.key, sortConfig.direction),
      ),
    [sortConfig.direction, sortConfig.key],
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedCustomers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedCustomers = sortedCustomers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  return (
    <DesignSystemTableShellNoTabs
      className="min-h-[min(28rem,70vh)]"
      pagination={
        <Paginator
          variant="inline"
          currentPage={safeCurrentPage}
          totalPages={totalPages}
          totalItems={sortedCustomers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      }
    >
      <CustomersFileCabinetTable
        rows={pagedCustomers}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
      />
    </DesignSystemTableShellNoTabs>
  );
}
