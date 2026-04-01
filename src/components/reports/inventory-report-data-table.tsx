"use client";

import type { CSSProperties, Dispatch, SetStateAction } from "react";
import Image from "next/image";
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
import { TableSlotCell } from "@/components/ui/table-slot-cell";
import type { ReportColumnDef } from "@/lib/inventory/report-table-config";
import type { InventoryReportRow } from "@/lib/inventory/report-mock-data";
import {
  displayMissingField,
  formatVoltageVolts,
} from "@/lib/inventory/report-table-helpers";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";
import {
  DATA_TABLE_CELL_INNER_HOVER_CLASS,
  DATA_TABLE_ROW_GROUP_CLASS,
} from "@/lib/data-table-row-hover";
import { cn } from "@/lib/utils";

import { ReportStatusIcons } from "./report-status-icons";

const {
  headerCellHeightPx,
  bodyCellHeightPx,
  cellPaddingXPx,
} = FILE_CABINET_BILLING_TABLE_DEFAULTS;

const ROW_STROKE_LIGHT =
  "var(--theme-stroke-subtle, var(--theme-stroke-default))";
const BODY_CELL_DIVIDER =
  "border-b border-solid border-[var(--theme-stroke-subtle,var(--theme-stroke-default))]";

function formatCellDisplay(
  column: ReportColumnDef,
  row: InventoryReportRow,
): string {
  const raw = row[column.key];

  if (column.key === "statusIcons") {
    return "";
  }

  if (column.format === "voltage") {
    return formatVoltageVolts(raw as number | string | null | undefined);
  }
  if (column.format === "missing") {
    return displayMissingField(raw as string | number | null | undefined);
  }

  if (raw === null || raw === undefined) {
    return "—";
  }
  return String(raw);
}

export interface InventoryReportSortState {
  key: string;
  direction: "asc" | "desc";
}

export function InventoryReportDataTable({
  columns,
  rows,
  sortConfig,
  setSortConfig,
}: {
  columns: ReportColumnDef[];
  rows: InventoryReportRow[];
  sortConfig: InventoryReportSortState;
  setSortConfig: Dispatch<SetStateAction<InventoryReportSortState>>;
}) {
  const headerThStyle = useMemo(
    (): CSSProperties => ({
      backgroundColor: "transparent",
      borderWidth: 0,
      borderStyle: "solid",
      borderColor: "transparent",
      borderBottomWidth: 1,
      borderBottomColor: ROW_STROKE_LIGHT,
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
  const slotLabelOverrideClass =
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
              {columns.map((header) => (
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
            {rows.map((record, rowIndex) => (
              <InventoryReportTableRow
                key={record.id}
                columns={columns}
                record={record}
                bodyCellHeightPx={bodyCellHeightPx}
                cellPaddingXPx={cellPaddingXPx}
                cellTextClassName={cellTextClassName}
                slotLabelOverrideClass={slotLabelOverrideClass}
                isLastRow={rowIndex === rows.length - 1}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function InventoryReportTableRow({
  columns,
  record,
  bodyCellHeightPx,
  cellPaddingXPx,
  cellTextClassName,
  slotLabelOverrideClass,
  isLastRow,
}: {
  columns: ReportColumnDef[];
  record: InventoryReportRow;
  bodyCellHeightPx: number;
  cellPaddingXPx: number;
  cellTextClassName: string;
  slotLabelOverrideClass: string;
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

  const slotClass = cn("text-foreground", cellTextClassName, slotLabelOverrideClass);
  const cellFrame = cn("p-0 align-middle", !isLastRow && BODY_CELL_DIVIDER);

  return (
    <TableRow
      size="default"
      className={cn(
        DATA_TABLE_ROW_GROUP_CLASS,
        "!border-0 !bg-transparent hover:!bg-transparent",
      )}
      style={{ minHeight: bodyCellHeightPx }}
    >
      {columns.map((col) => (
        <TableCell key={col.key} className={cellFrame}>
          {col.key === "evoxImage" ? (
            <div
              className={cn("flex items-center", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
              style={innerStyle}
            >
              {String(record.evoxImage ?? "").trim() ? (
                <Image
                  src={String(record.evoxImage)}
                  alt={String(record.evoxImageAlt ?? "Vehicle side profile")}
                  width={42}
                  height={32}
                  className="h-8 w-[42px] shrink-0 rounded-xs bg-transparent object-cover"
                />
              ) : (
                <div
                  className="h-8 w-[42px] shrink-0 rounded-xs border border-border bg-muted/40"
                  aria-hidden
                />
              )}
            </div>
          ) : col.key === "statusIcons" ? (
            <div
              className={cn("flex items-center", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
              style={innerStyle}
            >
              <ReportStatusIcons
                deviceStatus={String(record.deviceStatus ?? "")}
                keyStatus={String(record.keyStatus ?? "")}
                batteryStatus={String(record.batteryStatus ?? "")}
              />
            </div>
          ) : (
            <TableSlotCell
              label={formatCellDisplay(col, record)}
              className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
              style={innerStyle}
            />
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}
