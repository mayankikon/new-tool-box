"use client";

import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { useMemo } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableHeaderCell } from "@/components/ui/table-header-cell";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";
import {
  DATA_TABLE_CELL_INNER_HOVER_CLASS,
  DATA_TABLE_HEADER_ROW_BACKGROUND_CLASS,
  DATA_TABLE_ROW_GROUP_CLASS,
  DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
} from "@/lib/data-table-row-hover";
import { cn } from "@/lib/utils";

import type {
  MarketingAudienceRow,
  MarketingAudienceSortKey,
  MarketingAudienceTabValue,
} from "./marketing-audiences-table-model";
import {
  campaignsLabel,
  vehicleLabel,
  vehicleStatusLabel,
} from "./marketing-audiences-table-model";

interface ColumnDef {
  key: MarketingAudienceSortKey;
  label: string;
  widthClassName: string;
}

const BASE_HEADERS: ColumnDef[] = [
  {
    key: "customerName",
    label: "Customer",
    widthClassName: "min-w-[180px] w-[220px]",
  },
  {
    key: "vehicle",
    label: "Vehicle",
    widthClassName: "min-w-[190px] w-[230px]",
  },
  {
    key: "vehicleStatus",
    label: "Status",
    widthClassName: "min-w-[140px] w-[170px]",
  },
  {
    key: "campaigns",
    label: "Campaigns",
    widthClassName: "min-w-[200px] w-[260px]",
  },
];

const CONDITIONAL_COLUMN: Partial<Record<MarketingAudienceTabValue, ColumnDef>> = {
  due: {
    key: "milesUntilService",
    label: "Miles Until Service",
    widthClassName: "min-w-[160px] w-[190px]",
  },
  "defection-risk": {
    key: "defectedDealership",
    label: "Defected To",
    widthClassName: "min-w-[180px] w-[220px]",
  },
  "open-recall": {
    key: "recallUrgency",
    label: "Urgency",
    widthClassName: "min-w-[120px] w-[150px]",
  },
  "ownership-change": {
    key: "transferDate",
    label: "Date Transferred",
    widthClassName: "min-w-[160px] w-[190px]",
  },
  "geographically-relocated": {
    key: "relocatedState",
    label: "Relocated To",
    widthClassName: "min-w-[140px] w-[170px]",
  },
};

const { headerCellHeightPx, bodyCellHeightPx, cellPaddingXPx } =
  FILE_CABINET_BILLING_TABLE_DEFAULTS;

const ROW_STROKE_LIGHT =
  "var(--theme-stroke-subtle, var(--theme-stroke-default))";

const BODY_CELL_DIVIDER =
  "border-b border-solid border-[var(--theme-stroke-subtle,var(--theme-stroke-default))]";

function conditionalCellContent(
  row: MarketingAudienceRow,
  key: MarketingAudienceSortKey,
): string {
  switch (key) {
    case "milesUntilService":
      return row.milesUntilService != null
        ? `${row.milesUntilService.toLocaleString()} mi`
        : "\u2014";
    case "defectedDealership":
      return row.defectedDealership ?? "\u2014";
    case "recallUrgency":
      if (!row.recallUrgency) return "\u2014";
      return row.recallUrgency === "urgent" ? "Urgent" : "Open";
    case "transferDate": {
      if (!row.transferDate) return "\u2014";
      const date = new Date(row.transferDate + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    case "relocatedState":
      return row.relocatedState ?? "\u2014";
    default:
      return "\u2014";
  }
}

export function MarketingAudiencesFileCabinetTable({
  rows,
  activeTab,
  sortConfig,
  setSortConfig,
}: {
  rows: MarketingAudienceRow[];
  activeTab: MarketingAudienceTabValue;
  sortConfig: { key: MarketingAudienceSortKey; direction: "asc" | "desc" };
  setSortConfig: Dispatch<
    SetStateAction<{
      key: MarketingAudienceSortKey;
      direction: "asc" | "desc";
    }>
  >;
}) {
  const conditionalCol = CONDITIONAL_COLUMN[activeTab] ?? null;

  const headers = useMemo(
    () => (conditionalCol ? [...BASE_HEADERS, conditionalCol] : BASE_HEADERS),
    [conditionalCol],
  );

  const headerThStyle = useMemo(
    (): CSSProperties => ({
      backgroundColor: "transparent",
      borderWidth: 0,
      borderStyle: "solid",
      borderColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: ROW_STROKE_LIGHT,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      height: headerCellHeightPx,
      minHeight: headerCellHeightPx,
      maxHeight: headerCellHeightPx,
      boxSizing: "border-box",
      verticalAlign: "middle",
    }),
    [],
  );

  const headerLabelOverrideClass =
    "[&_span.truncate]:text-sm [&_span.truncate]:leading-5";

  const cellTextClassName = "text-sm";

  return (
    <div className="flex flex-col overflow-hidden border-0 bg-transparent">
      <div className="min-w-0 bg-transparent">
        <Table
          className={cn(
            cellTextClassName,
            "border-separate border-spacing-0 bg-transparent",
          )}
        >
          <TableHeader className="[&_tr]:border-0 [&_tr]:bg-transparent [&_tr]:hover:bg-transparent">
            <TableRow
              size="compact"
              className={cn("!border-0", DATA_TABLE_HEADER_ROW_BACKGROUND_CLASS)}
            >
              {headers.map((header) => (
                <TableHead
                  key={header.key}
                  className={cn(
                    header.widthClassName,
                    "h-auto p-0 align-middle",
                  )}
                  style={headerThStyle}
                >
                  <TableHeaderCell
                    variant="label"
                    label={header.label}
                    sortable
                    sortState={
                      sortConfig.key === header.key
                        ? sortConfig.direction === "asc"
                          ? "asc"
                          : "desc"
                        : "inactive"
                    }
                    className={cn(
                      headerLabelOverrideClass,
                      "h-full min-h-0 w-full rounded-none border-0 bg-transparent shadow-none",
                    )}
                    style={{
                      height: headerCellHeightPx,
                      minHeight: headerCellHeightPx,
                      maxHeight: headerCellHeightPx,
                      boxSizing: "border-box",
                    }}
                    onSort={() => {
                      setSortConfig((current) => ({
                        key: header.key,
                        direction:
                          current.key === header.key &&
                          current.direction === "asc"
                            ? "desc"
                            : "asc",
                      }));
                    }}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <AudienceTableRow
                key={row.id}
                row={row}
                conditionalColumnKey={conditionalCol?.key ?? null}
                bodyCellHeightPx={bodyCellHeightPx}
                cellPaddingXPx={cellPaddingXPx}
                cellTextClassName={cellTextClassName}
                isLastRow={index === rows.length - 1}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AudienceTableRow({
  row,
  conditionalColumnKey,
  bodyCellHeightPx,
  cellPaddingXPx,
  cellTextClassName,
  isLastRow,
}: {
  row: MarketingAudienceRow;
  conditionalColumnKey: MarketingAudienceSortKey | null;
  bodyCellHeightPx: number;
  cellPaddingXPx: number;
  cellTextClassName: string;
  isLastRow: boolean;
}) {
  const innerStyle: CSSProperties = {
    height: bodyCellHeightPx,
    minHeight: bodyCellHeightPx,
    maxHeight: bodyCellHeightPx,
    paddingLeft: cellPaddingXPx,
    paddingRight: cellPaddingXPx,
    boxSizing: "border-box",
  };

  const cellFrame = cn("p-0 align-middle", !isLastRow && BODY_CELL_DIVIDER);

  return (
    <TableRow
      size="default"
      className={cn(
        DATA_TABLE_ROW_GROUP_CLASS,
        "!border-0 !bg-transparent",
        DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS,
      )}
      style={{ minHeight: bodyCellHeightPx }}
    >
      {/* Customer Name */}
      <TableCell className={cellFrame}>
        <div
          className={cn(
            "flex items-center",
            DATA_TABLE_CELL_INNER_HOVER_CLASS,
          )}
          style={innerStyle}
        >
          <span
            className={cn(
              "truncate font-medium leading-5 text-foreground",
              cellTextClassName,
            )}
          >
            {row.customerName}
          </span>
        </div>
      </TableCell>

      {/* Vehicle (year make model) */}
      <TableCell className={cellFrame}>
        <div
          className={cn(
            "flex items-center",
            DATA_TABLE_CELL_INNER_HOVER_CLASS,
          )}
          style={innerStyle}
        >
          <span
            className={cn(
              "truncate leading-5 text-foreground",
              cellTextClassName,
            )}
          >
            {vehicleLabel(row)}
          </span>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className={cellFrame}>
        <div
          className={cn(
            "flex items-center",
            DATA_TABLE_CELL_INNER_HOVER_CLASS,
          )}
          style={innerStyle}
        >
          <span
            className={cn(
              "truncate leading-5 text-foreground",
              cellTextClassName,
            )}
          >
            {vehicleStatusLabel(row.vehicleStatus)}
          </span>
        </div>
      </TableCell>

      {/* Campaigns */}
      <TableCell className={cellFrame}>
        <div
          className={cn(
            "flex items-center gap-1.5",
            DATA_TABLE_CELL_INNER_HOVER_CLASS,
          )}
          style={innerStyle}
        >
          <span
            className={cn(
              "truncate leading-5 text-foreground",
              cellTextClassName,
            )}
          >
            {campaignsLabel(row.campaigns)}
          </span>
          {row.campaigns.length > 1 && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium leading-none text-muted-foreground">
              +{row.campaigns.length - 1}
            </span>
          )}
        </div>
      </TableCell>

      {/* Conditional column */}
      {conditionalColumnKey && (
        <TableCell className={cellFrame}>
          <div
            className={cn(
              "flex items-center gap-2",
              DATA_TABLE_CELL_INNER_HOVER_CLASS,
            )}
            style={innerStyle}
          >
            {conditionalColumnKey === "recallUrgency" && row.recallUrgency && (
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  row.recallUrgency === "urgent"
                    ? "bg-red-500"
                    : "bg-amber-400",
                )}
              />
            )}
            <span
              className={cn(
                "truncate leading-5 text-foreground",
                cellTextClassName,
              )}
            >
              {conditionalCellContent(row, conditionalColumnKey)}
            </span>
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
