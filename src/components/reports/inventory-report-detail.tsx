"use client";

import { useCallback, useMemo, useState } from "react";
import { useTheme } from "@/components/theme/app-theme-provider";
import { LocateFixed, Search } from "lucide-react";

import type { DashPreviewSurface } from "@/app/design-playground/components/dash-preview-canvas";
import { FileCabinetTableChrome } from "@/app/design-playground/components/file-cabinet-table-chrome";
import { TopBar } from "@/components/app/top-bar";
import { DesignSystemTableShellNoTabs } from "@/components/chrome/design-system-table-shell-no-tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Input,
  InputContainer,
  InputGroup,
  InputIcon,
  InputLabel,
} from "@/components/ui/input";
import { Paginator } from "@/components/ui/paginator";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";
import type { InventoryReportId } from "@/lib/inventory/report-catalog";
import { inventoryReportCatalog } from "@/lib/inventory/report-catalog";
import { REPORT_TABLE_CONFIG } from "@/lib/inventory/report-table-config";
import type { InstalledDevicesTimeFrame } from "@/lib/inventory/report-table-helpers";
import type { UninstalledHistoryTimeFrame } from "@/lib/inventory/report-table-helpers";
import { sortInventoryReportRows } from "@/lib/inventory/report-table-helpers";
import {
  filterInstalledDevicesTimeframe,
  filterOffLotRowsByTimeframe,
  filterPendingInstallationTab,
  filterUninstalledHistoryTimeframe,
  getLocationHistoryPingsForVin,
  getMockRowsForReport,
  type InventoryReportRow,
} from "@/lib/inventory/report-mock-data";

import {
  InventoryReportDataTable,
  type InventoryReportSortState,
} from "./inventory-report-data-table";

const { underGlowPx, tabAccent, tabTopRadiusPx } = FILE_CABINET_BILLING_TABLE_DEFAULTS;

const PAGE_SIZE = 10;

const DATE_RANGE_TABS = new Set([
  "all",
  "today",
  "yesterday",
  "last-7",
  "last-14",
  "last-30",
]);

const UNINSTALLED_HISTORY_TABS = new Set([
  "all",
  "last-7",
  "last-15",
  "last-30",
]);

interface InventoryReportDetailProps {
  reportId: InventoryReportId;
  onBack: () => void;
}

export function InventoryReportDetail({
  reportId,
  onBack,
}: InventoryReportDetailProps) {
  const { resolvedTheme } = useTheme();
  const previewSurface: DashPreviewSurface =
    resolvedTheme === "dark" ? "dark" : "light";

  const reportMeta = useMemo(
    () => inventoryReportCatalog.find((r) => r.id === reportId),
    [reportId],
  );
  const config = REPORT_TABLE_CONFIG[reportId];

  const [sortConfig, setSortConfig] = useState<InventoryReportSortState>(() => ({
    key: config.columns[0]?.key ?? "id",
    direction: "asc",
  }));

  const [currentPage, setCurrentPage] = useState(1);
  const [deckTab, setDeckTab] = useState(
    () => config.deckTabs?.[0]?.value ?? "",
  );

  const [locationVinQuery, setLocationVinQuery] = useState("");
  const [locationVinSubmitted, setLocationVinSubmitted] = useState("");
  const [locationVinModalOpen, setLocationVinModalOpen] = useState(
    () => reportId === "location-history",
  );

  const baseRows = useMemo(() => getMockRowsForReport(reportId), [reportId]);

  const filteredRows = useMemo(() => {
    if (reportId === "off-lot") {
      const timeframe = DATE_RANGE_TABS.has(deckTab)
        ? (deckTab as InstalledDevicesTimeFrame)
        : "all";
      return filterOffLotRowsByTimeframe(baseRows, timeframe);
    }
    if (reportId === "installed-devices") {
      const timeframe = DATE_RANGE_TABS.has(deckTab)
        ? (deckTab as InstalledDevicesTimeFrame)
        : "all";
      return filterInstalledDevicesTimeframe(baseRows, timeframe);
    }
    if (reportId === "uninstalled-history") {
      const timeframe = UNINSTALLED_HISTORY_TABS.has(deckTab)
        ? (deckTab as UninstalledHistoryTimeFrame)
        : "all";
      return filterUninstalledHistoryTimeframe(baseRows, timeframe);
    }
    if (reportId === "pending-installations") {
      return filterPendingInstallationTab(
        baseRows,
        deckTab === "no-key" ? "no-key" : "no-gps",
      );
    }
    return baseRows;
  }, [baseRows, deckTab, reportId]);

  const locationHistoryRows = useMemo(() => {
    if (reportId !== "location-history") {
      return [] as InventoryReportRow[];
    }
    if (!locationVinSubmitted.trim()) {
      return [];
    }
    return getLocationHistoryPingsForVin(locationVinSubmitted);
  }, [reportId, locationVinSubmitted]);

  const locationHistoryEmpty =
    reportId === "location-history" &&
    locationVinSubmitted.trim() !== "" &&
    locationHistoryRows.length === 0;

  const tableRows =
    reportId === "location-history" ? locationHistoryRows : filteredRows;

  const sortedTableRows = useMemo(
    () =>
      sortInventoryReportRows(
        tableRows,
        config.columns,
        sortConfig.key,
        sortConfig.direction,
      ),
    [config.columns, sortConfig.direction, sortConfig.key, tableRows],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedTableRows.length / PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedTableRows.slice(start, start + PAGE_SIZE);
  }, [safePage, sortedTableRows]);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const handleDeckChange = useCallback(
    (next: string) => {
      setDeckTab(next);
      resetPage();
    },
    [resetPage],
  );

  const handleSearchLocationHistory = useCallback(() => {
    const trimmed = locationVinQuery.trim();
    if (!trimmed) {
      return;
    }
    setLocationVinSubmitted(trimmed);
    setLocationVinModalOpen(false);
    setCurrentPage(1);
  }, [locationVinQuery]);

  const handleOpenLocationVinModal = useCallback(() => {
    setLocationVinModalOpen(true);
  }, []);

  const deckTabLabels = useMemo(() => {
    const tabs = config.deckTabs;
    if (!tabs) {
      return {} as Record<string, string>;
    }
    return Object.fromEntries(tabs.map((t) => [t.value, t.label]));
  }, [config.deckTabs]);

  const deckTabValues = useMemo(
    () => config.deckTabs?.map((t) => t.value) ?? [],
    [config.deckTabs],
  );

  const paginationEl = (
    <Paginator
      variant="inline"
      currentPage={safePage}
      totalPages={totalPages}
      totalItems={sortedTableRows.length}
      pageSize={PAGE_SIZE}
      onPageChange={setCurrentPage}
    />
  );

  const tableBlock = (
    <div className="flex min-h-[min(20rem,55vh)] min-w-0 flex-1 flex-col">
      {reportId === "location-history" && locationVinSubmitted ? (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing ping history for{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              {locationVinSubmitted}
            </code>
          </p>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleOpenLocationVinModal}
          >
            Change VIN
          </Button>
        </div>
      ) : null}

      {locationHistoryEmpty ? (
        <p className="text-sm text-muted-foreground">
          No ping history found for that VIN (mock data includes sample VIN{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">1HGCM82633A004352</code>
          ).
        </p>
      ) : reportId === "location-history" &&
        !locationVinSubmitted &&
        !locationVinModalOpen ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Enter a VIN to load ping history for devices paired to that vehicle.
          </p>
          <div>
            <Button type="button" size="lg" onClick={handleOpenLocationVinModal}>
              Enter VIN
            </Button>
          </div>
        </div>
      ) : reportId === "location-history" && !locationVinSubmitted ? (
        // Modal is open collecting VIN; avoid rendering an empty table shell behind it.
        <div className="min-h-[min(12rem,40vh)] min-w-0" aria-hidden />
      ) : config.deckTabs ? (
        <FileCabinetTableChrome
          className="flex min-h-[min(20rem,55vh)] min-w-0 flex-1 flex-col"
          value={deckTab}
          onValueChange={handleDeckChange}
          labels={deckTabLabels}
          tabValues={deckTabValues}
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
              <InventoryReportDataTable
                columns={config.columns}
                rows={pagedRows}
                sortConfig={sortConfig}
                setSortConfig={setSortConfig}
              />
            </div>
            <div className="flex min-w-0 shrink-0 justify-end px-2 pt-2">{paginationEl}</div>
          </div>
        </FileCabinetTableChrome>
      ) : (
        <DesignSystemTableShellNoTabs
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          pagination={paginationEl}
        >
          <InventoryReportDataTable
            columns={config.columns}
            rows={pagedRows}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
          />
        </DesignSystemTableShellNoTabs>
      )}
    </div>
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 pt-6">
        <TopBar
          className="pb-0"
          breadcrumbs={[
            { label: "Reports", onClick: onBack },
            { label: reportMeta?.title ?? "Report" },
          ]}
          title={reportMeta?.title ?? "Report"}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pb-16 pt-6">
        <div className="flex w-full max-w-none flex-col gap-6">{tableBlock}</div>
      </div>
    </div>
  );
}
