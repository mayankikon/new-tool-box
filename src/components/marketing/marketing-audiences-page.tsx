"use client";

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Download, Search, Upload } from "lucide-react";
import { useTheme } from "@/components/theme/app-theme-provider";

import type { DashPreviewSurface } from "@/app/design-playground/components/dash-preview-canvas";
import { FileCabinetTableChrome } from "@/app/design-playground/components/file-cabinet-table-chrome";
import { TopBar } from "@/components/app/top-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, InputContainer, InputIcon } from "@/components/ui/input";
import { Paginator } from "@/components/ui/paginator";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";

import { MarketingAudiencesFileCabinetTable } from "./marketing-audiences-file-cabinet-table";
import {
  compareMarketingAudienceValues,
  filterMarketingAudienceRows,
  MARKETING_AUDIENCE_ROWS,
  MARKETING_AUDIENCE_TAB_LABELS,
  MARKETING_AUDIENCE_TAB_VALUES,
  serializeMarketingAudienceRowsToCsv,
  type MarketingAudienceSortKey,
  type MarketingAudienceTabValue,
} from "./marketing-audiences-table-model";

const { underGlowPx, tabAccent, tabTopRadiusPx } =
  FILE_CABINET_BILLING_TABLE_DEFAULTS;

export function MarketingAudiencesPage({
  initialTab,
}: {
  initialTab?: MarketingAudienceTabValue;
}) {
  const { resolvedTheme } = useTheme();
  const previewSurface: DashPreviewSurface =
    resolvedTheme === "dark" ? "dark" : "light";

  const [searchQuery, setSearchQuery] = useState("");
  const [deckTab, setDeckTab] = useState<MarketingAudienceTabValue>(
    initialTab ?? "all-services",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: MarketingAudienceSortKey;
    direction: "asc" | "desc";
  }>({ key: "customerName", direction: "asc" });
  const [pushDialogOpen, setPushDialogOpen] = useState(false);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredRows = useMemo(
    () =>
      filterMarketingAudienceRows(
        MARKETING_AUDIENCE_ROWS,
        deckTab,
        deferredSearchQuery,
      ),
    [deckTab, deferredSearchQuery],
  );

  const sortedRows = useMemo(
    () =>
      [...filteredRows].sort((left, right) =>
        compareMarketingAudienceValues(
          left,
          right,
          sortConfig.key,
          sortConfig.direction,
        ),
      ),
    [filteredRows, sortConfig.direction, sortConfig.key],
  );

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const handleDeckTabChange = useCallback((next: string) => {
    setDeckTab(next as MarketingAudienceTabValue);
    setCurrentPage(1);
    setSortConfig({ key: "customerName", direction: "asc" });
  }, []);

  const handleExportCsv = useCallback(() => {
    const csv = serializeMarketingAudienceRowsToCsv(sortedRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smart-marketing-audiences.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, [sortedRows]);

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
      <TopBar
        title="Audiences"
        right={
          <>
            <Button
              variant="secondary"
              size="header"
              leadingIcon={<Download />}
              onClick={handleExportCsv}
            >
              Export CSV
            </Button>
            <Button
              size="header"
              leadingIcon={<Upload />}
              onClick={() => setPushDialogOpen(true)}
            >
              Push to CDP
            </Button>
          </>
        }
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 px-8 pb-8 pt-6">
        <div className="flex shrink-0 items-center gap-2.5">
          <InputContainer size="lg" className="w-full max-w-sm">
            <InputIcon position="lead">
              <Search className="size-4" />
            </InputIcon>
            <Input
              standalone={false}
              size="lg"
              aria-label="Search audiences"
              placeholder="Search audiences"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
            />
          </InputContainer>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <FileCabinetTableChrome
            className="flex min-h-[280px] min-w-0 flex-1 flex-col"
            value={deckTab}
            onValueChange={handleDeckTabChange}
            labels={MARKETING_AUDIENCE_TAB_LABELS}
            tabValues={MARKETING_AUDIENCE_TAB_VALUES}
            surface={previewSurface}
            underGlowPx={underGlowPx}
            accent={tabAccent}
            tabTopRadiusPx={tabTopRadiusPx}
            showLeftLamp={false}
            noLeftLampBelowStyle="preset-led"
            tabMotionVariant="sink-rise"
          >
            <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-2">
              <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
                <MarketingAudiencesFileCabinetTable
                  rows={pagedRows}
                  activeTab={deckTab}
                  sortConfig={sortConfig}
                  setSortConfig={setSortConfig}
                />
              </div>
              <div className="flex min-w-0 shrink-0 justify-end px-2 pt-2">
                <Paginator
                  variant="inline"
                  currentPage={safeCurrentPage}
                  totalPages={totalPages}
                  totalItems={sortedRows.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </FileCabinetTableChrome>
        </div>
      </div>

      <Dialog open={pushDialogOpen} onOpenChange={setPushDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Push to CDP</DialogTitle>
            <DialogDescription>
              This is a placeholder action for now. We are not sending any live
              data yet.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Ready to push {sortedRows.length} filtered audience
            {sortedRows.length === 1 ? "" : "s"} in a future integration flow.
          </p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setPushDialogOpen(false)}
            >
              Close
            </Button>
            <Button onClick={() => setPushDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
