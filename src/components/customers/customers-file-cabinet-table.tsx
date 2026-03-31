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
import { TableSlotCell } from "@/components/ui/table-slot-cell";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";
import { cn } from "@/lib/utils";

import type { CustomerRecord, CustomerSortKey } from "./customers-table-model";
import { inviteStatusLabel } from "./customers-table-model";

const CUSTOMER_HEADERS: {
  key: CustomerSortKey;
  label: string;
  widthClassName: string;
}[] = [
  { key: "name", label: "Customer Name", widthClassName: "min-w-[180px] w-[220px]" },
  { key: "vin", label: "VIN", widthClassName: "min-w-[200px] w-[220px]" },
  { key: "purchaseDate", label: "Purchase Date", widthClassName: "min-w-[120px] w-[140px]" },
  { key: "year", label: "Year", widthClassName: "min-w-[72px] w-[92px]" },
  { key: "make", label: "Make", widthClassName: "min-w-[110px] w-[130px]" },
  { key: "model", label: "Model", widthClassName: "min-w-[130px] w-[150px]" },
  { key: "email", label: "Email", widthClassName: "min-w-[200px] w-[240px]" },
  { key: "status", label: "Invite Status", widthClassName: "min-w-[120px] w-[140px]" },
];

const {
  headerCellHeightPx,
  bodyCellHeightPx,
  cellPaddingXPx,
} = FILE_CABINET_BILLING_TABLE_DEFAULTS;

/** Softer table row dividers from theme primitives. */
const ROW_STROKE_LIGHT =
  "var(--theme-stroke-subtle, var(--theme-stroke-default))";

const BODY_CELL_DIVIDER =
  "border-b border-solid border-[var(--theme-stroke-subtle,var(--theme-stroke-default))]";

export function CustomersFileCabinetTable({
  rows,
  sortConfig,
  setSortConfig,
}: {
  rows: CustomerRecord[];
  sortConfig: { key: CustomerSortKey; direction: "asc" | "desc" };
  setSortConfig: Dispatch<
    SetStateAction<{ key: CustomerSortKey; direction: "asc" | "desc" }>
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
  const slotLabelOverrideClass =
    "[&_span.truncate]:text-sm [&_span.truncate]:leading-5";
  const cellTextClassName = "text-sm";

  return (
    <div className="flex flex-col overflow-hidden border-0 bg-transparent">
      <div className="min-w-0 bg-transparent">
        <Table
          className={cn(cellTextClassName, "border-separate border-spacing-0 bg-transparent")}
        >
          <TableHeader className="[&_tr]:border-0 [&_tr]:bg-transparent [&_tr]:hover:bg-transparent">
            <TableRow size="compact" className="!border-0 hover:bg-transparent">
              {CUSTOMER_HEADERS.map((header) => (
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
            {rows.map((record, rowIndex) => (
              <CustomerTableRow
                key={record.id}
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

function CustomerTableRow({
  record,
  bodyCellHeightPx,
  cellPaddingXPx,
  cellTextClassName,
  slotLabelOverrideClass,
  isLastRow,
}: {
  record: CustomerRecord;
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

  const slotClass = cn("text-foreground", slotLabelOverrideClass);

  const cellFrame = cn("p-0 align-middle", !isLastRow && BODY_CELL_DIVIDER);

  return (
    <TableRow
      size="default"
      className="!border-0 !bg-transparent hover:!bg-gray-100 dark:hover:!bg-gray-800/50"
      style={{ minHeight: bodyCellHeightPx }}
    >
      <TableCell className={cellFrame}>
        <div className="flex items-center" style={innerStyle}>
          <span
            className={cn(
              "truncate font-medium leading-5 text-primary",
              cellTextClassName,
            )}
          >
            {record.name}
          </span>
        </div>
      </TableCell>

      <TableCell className={cellFrame}>
        <div className="flex items-center" style={innerStyle}>
          <span
            className={cn(
              "truncate text-sm font-normal leading-5 text-black dark:text-foreground",
              cellTextClassName,
            )}
          >
            {record.vin}
          </span>
        </div>
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell label={record.purchaseDate} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell label={String(record.year)} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell label={record.make} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell label={record.model} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell label={record.email} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={inviteStatusLabel(record.status)}
          className={slotClass}
          style={innerStyle}
        />
      </TableCell>
    </TableRow>
  );
}
