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
import { ProgressBar } from "@/components/ui/progress";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";
import { cn } from "@/lib/utils";

import type {
  MarketingAudienceRow,
  MarketingAudienceSortKey,
} from "./marketing-audiences-table-model";
import { vehicleStatusLabel } from "./marketing-audiences-table-model";

const AUDIENCE_HEADERS: {
  key: MarketingAudienceSortKey;
  label: string;
  widthClassName: string;
}[] = [
  {
    key: "customerName",
    label: "Customer Name",
    widthClassName: "min-w-[220px] w-[320px]",
  },
  {
    key: "vehicleStatus",
    label: "Vehicle Status",
    widthClassName: "min-w-[200px] w-[260px]",
  },
  {
    key: "retentionScore",
    label: "Retention Score",
    widthClassName: "min-w-[240px] w-[320px]",
  },
];

const {
  headerCellHeightPx,
  bodyCellHeightPx,
  cellPaddingXPx,
} = FILE_CABINET_BILLING_TABLE_DEFAULTS;

const ROW_STROKE_LIGHT =
  "var(--theme-stroke-subtle, var(--theme-stroke-default))";

const BODY_CELL_DIVIDER =
  "border-b border-solid border-[var(--theme-stroke-subtle,var(--theme-stroke-default))]";

export function MarketingAudiencesFileCabinetTable({
  rows,
  sortConfig,
  setSortConfig,
}: {
  rows: MarketingAudienceRow[];
  sortConfig: { key: MarketingAudienceSortKey; direction: "asc" | "desc" };
  setSortConfig: Dispatch<
    SetStateAction<{ key: MarketingAudienceSortKey; direction: "asc" | "desc" }>
  >;
}) {
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
            <TableRow size="compact" className="!border-0 hover:bg-transparent">
              {AUDIENCE_HEADERS.map((header) => (
                <TableHead
                  key={header.key}
                  className={cn(header.widthClassName, "h-auto p-0 align-middle")}
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
                          current.key === header.key && current.direction === "asc"
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
  bodyCellHeightPx,
  cellPaddingXPx,
  cellTextClassName,
  isLastRow,
}: {
  row: MarketingAudienceRow;
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
      className="!border-0 !bg-transparent hover:!bg-muted"
      style={{ minHeight: bodyCellHeightPx }}
    >
      <TableCell className={cellFrame}>
        <div className="flex items-center" style={innerStyle}>
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

      <TableCell className={cellFrame}>
        <div className="flex items-center" style={innerStyle}>
          <span className={cn("truncate leading-5 text-foreground", cellTextClassName)}>
            {vehicleStatusLabel(row.vehicleStatus)}
          </span>
        </div>
      </TableCell>

      <TableCell className={cellFrame}>
        <div className="flex items-center gap-3" style={innerStyle}>
          <span className="w-9 shrink-0 text-right text-sm tabular-nums text-foreground">
            {row.retentionScore}
          </span>
          <ProgressBar
            value={row.retentionScore}
            hideValue
            className="min-w-[120px] flex-1"
            aria-label={`${row.customerName} retention score`}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}
