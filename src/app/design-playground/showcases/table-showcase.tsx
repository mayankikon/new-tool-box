"use client";

import * as React from "react";

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
import {
  TelemetryDeckTabs,
  TelemetryDeckTabList,
  TelemetryDeckTab,
} from "@/components/ui/telemetry-deck-tabs";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";
import { cn } from "@/lib/utils";

import { DashPreviewCanvas, type DashPreviewSurface } from "../components/dash-preview-canvas";
import { FileCabinetTableChrome } from "../components/file-cabinet-table-chrome";
import { PlayAreaSection } from "../components/play-area-section";
import { playCardButtonSound } from "../play-card-button-sound";

/** Matches DialKit tab strip playground defaults. */
const BEZEL_PAD_PX = 28;
const BEZEL_METAL_HIGHLIGHT = 0.22;
/** Matches tabs playground telemetry strip spacing. */
const TAB_STRIP_TELEMETRY_GAP_PX = 8;
const TELEMETRY_CAPSULE_SCALE_PERCENT = 100;

interface PlaygroundBillingRecord {
  id: string;
  vin: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  customerName: string;
  serviceType: string;
  price: number;
  stockType: string;
  trim: string;
  registeredBy: string;
}

type SortKey =
  | "vin"
  | "stockNumber"
  | "year"
  | "make"
  | "model"
  | "customerName"
  | "serviceType"
  | "price"
  | "stockType"
  | "trim"
  | "registeredBy";

const TAB_LABELS: Record<string, string> = {
  drive: "Drive",
  climate: "Climate",
  media: "Media",
  system: "System",
};

/** Tab → stock-type filter (billing-style segmentation). */
const TAB_FILTER: Record<string, (row: PlaygroundBillingRecord) => boolean> = {
  drive: (r) => r.stockType === "New",
  climate: (r) => r.stockType === "Certified",
  media: (r) => r.stockType === "Preowned",
  system: () => true,
};

const PLAYGROUND_HEADERS: { key: SortKey; label: string; widthClassName: string }[] = [
  { key: "vin", label: "VIN", widthClassName: "min-w-[200px] w-[220px]" },
  { key: "stockNumber", label: "Stock Number", widthClassName: "min-w-[120px] w-[150px]" },
  { key: "year", label: "Year", widthClassName: "min-w-[72px] w-[92px]" },
  { key: "make", label: "Make", widthClassName: "min-w-[110px] w-[130px]" },
  { key: "model", label: "Model", widthClassName: "min-w-[130px] w-[150px]" },
  { key: "customerName", label: "Customer Name", widthClassName: "min-w-[180px] w-[220px]" },
  { key: "serviceType", label: "Service Type", widthClassName: "min-w-[110px] w-[130px]" },
  { key: "price", label: "Price", widthClassName: "min-w-[96px] w-[110px]" },
  { key: "stockType", label: "Stock Type", widthClassName: "min-w-[110px] w-[130px]" },
  { key: "trim", label: "Trim", widthClassName: "min-w-[130px] w-[150px]" },
  { key: "registeredBy", label: "Registered By", widthClassName: "min-w-[170px] w-[190px]" },
];

/** Fluid columns: min widths only so the grid grows/shrinks with the container (`Table` is `w-full`). */
const PLAYGROUND_HEADERS_FLUID: { key: SortKey; label: string; widthClassName: string }[] = [
  { key: "vin", label: "VIN", widthClassName: "min-w-[10rem]" },
  { key: "stockNumber", label: "Stock Number", widthClassName: "min-w-[5.5rem]" },
  { key: "year", label: "Year", widthClassName: "min-w-[3.5rem]" },
  { key: "make", label: "Make", widthClassName: "min-w-[5rem]" },
  { key: "model", label: "Model", widthClassName: "min-w-[6rem]" },
  { key: "customerName", label: "Customer Name", widthClassName: "min-w-[9rem]" },
  { key: "serviceType", label: "Service Type", widthClassName: "min-w-[5.5rem]" },
  { key: "price", label: "Price", widthClassName: "min-w-[4.5rem]" },
  { key: "stockType", label: "Stock Type", widthClassName: "min-w-[5.5rem]" },
  { key: "trim", label: "Trim", widthClassName: "min-w-[6rem]" },
  { key: "registeredBy", label: "Registered By", widthClassName: "min-w-[8.5rem]" },
];

const PLAYGROUND_ROWS: PlaygroundBillingRecord[] = [
  {
    id: "pg-1",
    vin: "WBA53AK02R7N11429",
    stockNumber: "SX882G",
    year: 2024,
    make: "Lexus",
    model: "ES 300h",
    customerName: "Craig Workman",
    serviceType: "7 Years",
    price: 785,
    stockType: "New",
    trim: "Premium Sedan",
    registeredBy: "Livia Korsgaard",
  },
  {
    id: "pg-2",
    vin: "WBA53AK02R7N11474",
    stockNumber: "PB19834",
    year: 2024,
    make: "Lexus",
    model: "NX 500",
    customerName: "Allison Carder",
    serviceType: "5 Years",
    price: 645,
    stockType: "Preowned",
    trim: "Luxury Sports",
    registeredBy: "Dulce Kenter",
  },
  {
    id: "pg-3",
    vin: "WBA53AK02R7N11430",
    stockNumber: "MKS823",
    year: 2025,
    make: "Lexus",
    model: "NX 500",
    customerName: "Gustavo Rosser",
    serviceType: "3 Years",
    price: 495,
    stockType: "Certified",
    trim: "Luxury Sports",
    registeredBy: "Omar Schleifer",
  },
  {
    id: "pg-4",
    vin: "WBA53AK02R7N11465",
    stockNumber: "SX882G",
    year: 2025,
    make: "Lexus",
    model: "NX 500",
    customerName: "Cheyenne Dias",
    serviceType: "7 Years",
    price: 785,
    stockType: "New",
    trim: "Luxury Sports",
    registeredBy: "Chance Rhiel Madsen",
  },
  {
    id: "pg-5",
    vin: "WBA53AK02R7N11431",
    stockNumber: "PB19834",
    year: 2019,
    make: "Lexus",
    model: "ES 300h",
    customerName: "Marilyn Calzoni",
    serviceType: "5 Years",
    price: 645,
    stockType: "Preowned",
    trim: "Premium Sedan",
    registeredBy: "Kaylynn Saris",
  },
  {
    id: "pg-6",
    vin: "WBA53AK02R7N11442",
    stockNumber: "MKS823",
    year: 2023,
    make: "Lexus",
    model: "NX 500",
    customerName: "Jaylon Ekstrom Bothman",
    serviceType: "3 Years",
    price: 495,
    stockType: "New",
    trim: "Base",
    registeredBy: "Kianna Torff",
  },
  {
    id: "pg-7",
    vin: "WBA53AK02R7N11432",
    stockNumber: "R5J234",
    year: 2024,
    make: "Toyota",
    model: "Camry XLE",
    customerName: "Phillip Mango",
    serviceType: "5 Years",
    price: 645,
    stockType: "Certified",
    trim: "Premium Sedan",
    registeredBy: "Abram Lubin",
  },
  {
    id: "pg-8",
    vin: "WBA53AK02R7N11433",
    stockNumber: "R5J235",
    year: 2023,
    make: "Honda",
    model: "Accord Touring",
    customerName: "Ann Dorwart",
    serviceType: "5 Years",
    price: 645,
    stockType: "New",
    trim: "Luxury Sports",
    registeredBy: "Tatiana Septimus",
  },
  {
    id: "pg-9",
    vin: "WBA53AK02R7N11434",
    stockNumber: "R5J236",
    year: 2025,
    make: "BMW",
    model: "330i",
    customerName: "Cooper Dokidis",
    serviceType: "7 Years",
    price: 785,
    stockType: "Preowned",
    trim: "Premium Sports",
    registeredBy: "Erin George",
  },
  {
    id: "pg-10",
    vin: "WBA53AK02R7N11435",
    stockNumber: "SX883A",
    year: 2024,
    make: "Audi",
    model: "Q5",
    customerName: "Mira Bator",
    serviceType: "7 Years",
    price: 785,
    stockType: "Certified",
    trim: "Premium Sports",
    registeredBy: "Kierra George",
  },
  {
    id: "pg-11",
    vin: "WBA53AK02R7N11436",
    stockNumber: "PB19901",
    year: 2025,
    make: "Volvo",
    model: "XC60",
    customerName: "Marley Dokidis",
    serviceType: "5 Years",
    price: 645,
    stockType: "New",
    trim: "Luxury Sedan",
    registeredBy: "Nolan Franci",
  },
  {
    id: "pg-12",
    vin: "WBA53AK02R7N11437",
    stockNumber: "R5J240",
    year: 2025,
    make: "Genesis",
    model: "GV80",
    customerName: "Dulce Dias",
    serviceType: "3 Years",
    price: 495,
    stockType: "Preowned",
    trim: "Luxury Sedan",
    registeredBy: "Mira Franci",
  },
];

function comparePlaygroundValues(
  left: PlaygroundBillingRecord,
  right: PlaygroundBillingRecord,
  sortKey: SortKey,
  direction: "asc" | "desc",
) {
  const multiplier = direction === "asc" ? 1 : -1;
  const leftValue = left[sortKey];
  const rightValue = right[sortKey];

  if (typeof leftValue === "number" && typeof rightValue === "number") {
    return (leftValue - rightValue) * multiplier;
  }

  return String(leftValue).localeCompare(String(rightValue)) * multiplier;
}

function normalizeHexColor(input: string, fallback: string): string {
  const t = input.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  if (/^#[0-9A-Fa-f]{3}$/.test(t)) {
    return `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`;
  }
  return fallback;
}

interface PlaygroundBillingTableProps {
  headers: { key: SortKey; label: string; widthClassName: string }[];
  visibleRecords: PlaygroundBillingRecord[];
  headerThStyle: (index: number, total: number) => React.CSSProperties;
  headerCellHeightPx: number;
  headerLabelOverrideClass: string;
  cellTextClassName: string;
  bodyCellHeightPx: number;
  cellPaddingXPx: number;
  slotLabelOverrideClass: string;
  rowDividerResolved: string;
  sortConfig: { key: SortKey; direction: "asc" | "desc" };
  setSortConfig: React.Dispatch<
    React.SetStateAction<{ key: SortKey; direction: "asc" | "desc" }>
  >;
}

function PlaygroundBillingTable({
  headers,
  visibleRecords,
  headerThStyle,
  headerCellHeightPx,
  headerLabelOverrideClass,
  cellTextClassName,
  bodyCellHeightPx,
  cellPaddingXPx,
  slotLabelOverrideClass,
  rowDividerResolved,
  sortConfig,
  setSortConfig,
}: PlaygroundBillingTableProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xs border-0 bg-transparent">
      <div className="min-w-0 bg-transparent [&_[data-slot=table-container]]:rounded-none">
        <Table className={cn(cellTextClassName, "border-separate border-spacing-0 bg-transparent")}>
          <TableHeader className="[&_tr]:border-0 [&_tr]:bg-transparent [&_tr]:hover:bg-transparent">
            <TableRow size="compact" className="!border-0 hover:bg-transparent">
              {headers.map((header, index) => (
                <TableHead
                  key={header.key}
                  className={cn(header.widthClassName, "h-auto p-0 align-middle")}
                  style={headerThStyle(index, headers.length)}
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
                          current.key === header.key && current.direction === "asc" ? "desc" : "asc",
                      }));
                    }}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:!border-b-0">
            {visibleRecords.map((record, rowIndex) => (
              <PlaygroundBillingRow
                key={record.id}
                record={record}
                bodyCellHeightPx={bodyCellHeightPx}
                cellPaddingXPx={cellPaddingXPx}
                cellTextClassName={cellTextClassName}
                slotLabelOverrideClass={slotLabelOverrideClass}
                rowDividerColor={rowDividerResolved}
                isLastRow={rowIndex === visibleRecords.length - 1}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PlaygroundBillingRow({
  record,
  bodyCellHeightPx,
  cellPaddingXPx,
  cellTextClassName,
  slotLabelOverrideClass,
  rowDividerColor,
  isLastRow,
}: {
  record: PlaygroundBillingRecord;
  bodyCellHeightPx: number;
  cellPaddingXPx: number;
  cellTextClassName: string;
  /** TableSlotCell default variant hardcodes inner label `text-sm`. */
  slotLabelOverrideClass: string;
  rowDividerColor: string;
  isLastRow: boolean;
}) {
  const innerStyle: React.CSSProperties = {
    height: bodyCellHeightPx,
    minHeight: bodyCellHeightPx,
    maxHeight: bodyCellHeightPx,
    paddingLeft: cellPaddingXPx,
    paddingRight: cellPaddingXPx,
    boxSizing: "border-box",
  };

  const slotClass = cn("text-foreground", slotLabelOverrideClass);

  const rowDividerStyle: React.CSSProperties =
    isLastRow
      ? {}
      : {
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: rowDividerColor,
        };

  return (
    <TableRow
      size="default"
      className="!border-0 !bg-transparent hover:!bg-transparent"
      style={{ ...rowDividerStyle, minHeight: bodyCellHeightPx }}
    >
      <TableCell className="p-0 align-middle">
        <div className="flex items-center" style={innerStyle}>
          <span
            className={cn(
              "truncate font-medium leading-5 text-primary",
              cellTextClassName,
            )}
          >
            {record.vin}
          </span>
        </div>
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={record.stockNumber} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={String(record.year)} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={record.make} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={record.model} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={record.customerName} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={record.serviceType} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={`$${record.price}`} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={record.stockType} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={record.trim} className={slotClass} style={innerStyle} />
      </TableCell>

      <TableCell className="p-0 align-middle">
        <TableSlotCell label={record.registeredBy} className={slotClass} style={innerStyle} />
      </TableCell>
    </TableRow>
  );
}

const {
  underGlowPx,
  tabTopRadiusPx,
  tabAccent,
  headerCellHeightPx,
  bodyCellHeightPx,
  cellPaddingXPx,
  showLeftLamp,
} = FILE_CABINET_BILLING_TABLE_DEFAULTS;

interface BillingTablePlaygroundTweaksProps {
  namePrefix: string;
  previewSurface: DashPreviewSurface;
  onPreviewSurfaceChange: (surface: DashPreviewSurface) => void;
  visibleRows: number;
  onVisibleRowsChange: (n: number) => void;
  rowDividerColor: string;
  rowDividerResolved: string;
  onRowDividerColorChange: (v: string) => void;
  headerFillColor: string;
  headerFillResolved: string;
  onHeaderFillColorChange: (v: string) => void;
  headerBorderColor: string;
  headerBorderResolved: string;
  onHeaderBorderColorChange: (v: string) => void;
  fontSizeStep: 0 | 1 | 2;
  onFontSizeStepChange: (step: 0 | 1 | 2) => void;
}

function BillingTablePlaygroundTweaks({
  namePrefix,
  previewSurface,
  onPreviewSurfaceChange,
  visibleRows,
  onVisibleRowsChange,
  rowDividerColor,
  rowDividerResolved,
  onRowDividerColorChange,
  headerFillColor,
  headerFillResolved,
  onHeaderFillColorChange,
  headerBorderColor,
  headerBorderResolved,
  onHeaderBorderColorChange,
  fontSizeStep,
  onFontSizeStepChange,
}: BillingTablePlaygroundTweaksProps) {
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4 space-y-5">
      <p className="text-sm font-medium text-foreground">Tweaks</p>

      <fieldset className="flex flex-wrap gap-4">
        <legend className="text-xs font-medium text-muted-foreground mb-2 w-full">Preview panel</legend>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={`${namePrefix}-preview-surface`}
            checked={previewSurface === "dark"}
            onChange={() => onPreviewSurfaceChange("dark")}
            className="size-4 accent-primary"
          />
          Dark dash
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            name={`${namePrefix}-preview-surface`}
            checked={previewSurface === "light"}
            onChange={() => onPreviewSurfaceChange("light")}
            className="size-4 accent-primary"
          />
          Light panel (brushed bezel)
        </label>
      </fieldset>

      <label className="flex max-w-md flex-col gap-1 text-sm">
        <span className="text-muted-foreground">Visible rows (cap after filter)</span>
        <input
          type="range"
          min={1}
          max={12}
          value={visibleRows}
          onChange={(e) => onVisibleRowsChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </label>

      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-xs font-medium text-muted-foreground">Table chrome</p>
        <p className="text-[11px] leading-snug text-muted-foreground">
          No stroke on the outer table wrapper. The header uses one outer frame with {tabTopRadiusPx}px corner radius and no
          vertical rules between columns. Body rows stay transparent, with row dividers providing separation.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">Row divider</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                aria-label="Row divider color"
                className="h-9 w-14 cursor-pointer rounded border border-border bg-background p-0"
                value={rowDividerResolved}
                onChange={(e) => onRowDividerColorChange(e.target.value)}
              />
              <input
                type="text"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
                value={rowDividerColor}
                onChange={(e) => onRowDividerColorChange(e.target.value)}
                placeholder="#e4e4e7"
              />
            </div>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">Header fill</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                aria-label="Header background fill"
                className="h-9 w-14 cursor-pointer rounded border border-border bg-background p-0"
                value={headerFillResolved}
                onChange={(e) => onHeaderFillColorChange(e.target.value)}
              />
              <input
                type="text"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
                value={headerFillColor}
                onChange={(e) => onHeaderFillColorChange(e.target.value)}
                placeholder="#fafafa"
              />
            </div>
          </label>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">Header border</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                aria-label="Header border stroke"
                className="h-9 w-14 cursor-pointer rounded border border-border bg-background p-0"
                value={headerBorderResolved}
                onChange={(e) => onHeaderBorderColorChange(e.target.value)}
              />
              <input
                type="text"
                spellCheck={false}
                className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
                value={headerBorderColor}
                onChange={(e) => onHeaderBorderColorChange(e.target.value)}
                placeholder="#d4d4d8"
              />
            </div>
          </label>
        </div>
      </div>

      <fieldset>
        <legend className="text-xs font-medium text-muted-foreground mb-2">Table text size</legend>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`${namePrefix}-font-step`}
              checked={fontSizeStep === 0}
              onChange={() => onFontSizeStepChange(0)}
              className="size-4 accent-primary"
            />
            Compact (xs)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`${namePrefix}-font-step`}
              checked={fontSizeStep === 1}
              onChange={() => onFontSizeStepChange(1)}
              className="size-4 accent-primary"
            />
            Default (sm)
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`${namePrefix}-font-step`}
              checked={fontSizeStep === 2}
              onChange={() => onFontSizeStepChange(2)}
              className="size-4 accent-primary"
            />
            Large (base)
          </label>
        </div>
      </fieldset>
    </div>
  );
}

export function TableShowcase() {
  const [previewSurface, setPreviewSurface] = React.useState<DashPreviewSurface>("light");
  const [deckTab, setDeckTab] = React.useState("drive");
  const [rowDividerColor, setRowDividerColor] = React.useState("#e4e4e7");
  const [headerFillColor, setHeaderFillColor] = React.useState("#fafafa");
  const [headerBorderColor, setHeaderBorderColor] = React.useState("#d4d4d8");
  const [fontSizeStep, setFontSizeStep] = React.useState<0 | 1 | 2>(1);
  const [visibleRows, setVisibleRows] = React.useState(8);
  const [sortConfig, setSortConfig] = React.useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({ key: "vin", direction: "asc" });

  const [previewSurfaceTelemetry, setPreviewSurfaceTelemetry] =
    React.useState<DashPreviewSurface>("light");
  const [deckTabTelemetry, setDeckTabTelemetry] = React.useState("drive");
  const [rowDividerColorTelemetry, setRowDividerColorTelemetry] = React.useState("#e4e4e7");
  const [headerFillColorTelemetry, setHeaderFillColorTelemetry] = React.useState("#fafafa");
  const [headerBorderColorTelemetry, setHeaderBorderColorTelemetry] = React.useState("#d4d4d8");
  const [fontSizeStepTelemetry, setFontSizeStepTelemetry] = React.useState<0 | 1 | 2>(1);
  const [visibleRowsTelemetry, setVisibleRowsTelemetry] = React.useState(8);
  const [sortConfigTelemetry, setSortConfigTelemetry] = React.useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({ key: "vin", direction: "asc" });

  const [previewSurfacePresetLed, setPreviewSurfacePresetLed] =
    React.useState<DashPreviewSurface>("light");
  const [deckTabPresetLed, setDeckTabPresetLed] = React.useState("drive");
  const [rowDividerColorPresetLed, setRowDividerColorPresetLed] = React.useState("#e4e4e7");
  const [headerFillColorPresetLed, setHeaderFillColorPresetLed] = React.useState("#fafafa");
  const [headerBorderColorPresetLed, setHeaderBorderColorPresetLed] = React.useState("#d4d4d8");
  const [fontSizeStepPresetLed, setFontSizeStepPresetLed] = React.useState<0 | 1 | 2>(1);
  const [visibleRowsPresetLed, setVisibleRowsPresetLed] = React.useState(8);
  const [sortConfigPresetLed, setSortConfigPresetLed] = React.useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({ key: "vin", direction: "asc" });

  const handleDeckTabChange = React.useCallback((next: string) => {
    setDeckTab((prev) => {
      if (prev !== next) playCardButtonSound();
      return next;
    });
  }, []);

  const handleDeckTabChangeTelemetry = React.useCallback((next: string) => {
    setDeckTabTelemetry((prev) => {
      if (prev !== next) playCardButtonSound();
      return next;
    });
  }, []);

  const handleDeckTabChangePresetLed = React.useCallback((next: string) => {
    setDeckTabPresetLed((prev) => {
      if (prev !== next) playCardButtonSound();
      return next;
    });
  }, []);

  const sortedFiltered = React.useMemo(() => {
    const filterFn = TAB_FILTER[deckTab] ?? TAB_FILTER.system;
    return PLAYGROUND_ROWS.filter(filterFn).sort((left, right) =>
      comparePlaygroundValues(left, right, sortConfig.key, sortConfig.direction),
    );
  }, [deckTab, sortConfig.direction, sortConfig.key]);

  const sortedFilteredTelemetry = React.useMemo(() => {
    const filterFn = TAB_FILTER[deckTabTelemetry] ?? TAB_FILTER.system;
    return PLAYGROUND_ROWS.filter(filterFn).sort((left, right) =>
      comparePlaygroundValues(left, right, sortConfigTelemetry.key, sortConfigTelemetry.direction),
    );
  }, [deckTabTelemetry, sortConfigTelemetry.direction, sortConfigTelemetry.key]);

  const sortedFilteredPresetLed = React.useMemo(() => {
    const filterFn = TAB_FILTER[deckTabPresetLed] ?? TAB_FILTER.system;
    return PLAYGROUND_ROWS.filter(filterFn).sort((left, right) =>
      comparePlaygroundValues(left, right, sortConfigPresetLed.key, sortConfigPresetLed.direction),
    );
  }, [deckTabPresetLed, sortConfigPresetLed.direction, sortConfigPresetLed.key]);

  const sliceCount = Math.max(1, Math.min(visibleRows, sortedFiltered.length));
  const visibleRecords = sortedFiltered.slice(0, sliceCount);

  const sliceCountTelemetry = Math.max(1, Math.min(visibleRowsTelemetry, sortedFilteredTelemetry.length));
  const visibleRecordsTelemetry = sortedFilteredTelemetry.slice(0, sliceCountTelemetry);

  const sliceCountPresetLed = Math.max(1, Math.min(visibleRowsPresetLed, sortedFilteredPresetLed.length));
  const visibleRecordsPresetLed = sortedFilteredPresetLed.slice(0, sliceCountPresetLed);

  const cellTextClassName =
    fontSizeStep === 0 ? "text-xs" : fontSizeStep === 1 ? "text-sm" : "text-base";

  /** TableHeaderCell hardcodes label `text-sm`; override via descendant selectors. */
  const headerLabelOverrideClass =
    fontSizeStep === 0
      ? "[&_span.truncate]:text-xs [&_span.truncate]:leading-4"
      : fontSizeStep === 1
        ? "[&_span.truncate]:text-sm [&_span.truncate]:leading-5"
        : "[&_span.truncate]:text-base [&_span.truncate]:leading-6";

  /** TableSlotCell default variant hardcodes inner `text-sm` on the label span. */
  const slotLabelOverrideClass =
    fontSizeStep === 0
      ? "[&_span.truncate]:text-xs [&_span.truncate]:leading-4"
      : fontSizeStep === 1
        ? "[&_span.truncate]:text-sm [&_span.truncate]:leading-5"
        : "[&_span.truncate]:text-base [&_span.truncate]:leading-6";

  const cellTextClassNameTelemetry =
    fontSizeStepTelemetry === 0 ? "text-xs" : fontSizeStepTelemetry === 1 ? "text-sm" : "text-base";

  const headerLabelOverrideClassTelemetry =
    fontSizeStepTelemetry === 0
      ? "[&_span.truncate]:text-xs [&_span.truncate]:leading-4"
      : fontSizeStepTelemetry === 1
        ? "[&_span.truncate]:text-sm [&_span.truncate]:leading-5"
        : "[&_span.truncate]:text-base [&_span.truncate]:leading-6";

  const slotLabelOverrideClassTelemetry =
    fontSizeStepTelemetry === 0
      ? "[&_span.truncate]:text-xs [&_span.truncate]:leading-4"
      : fontSizeStepTelemetry === 1
        ? "[&_span.truncate]:text-sm [&_span.truncate]:leading-5"
        : "[&_span.truncate]:text-base [&_span.truncate]:leading-6";

  const cellTextClassNamePresetLed =
    fontSizeStepPresetLed === 0 ? "text-xs" : fontSizeStepPresetLed === 1 ? "text-sm" : "text-base";

  const headerLabelOverrideClassPresetLed =
    fontSizeStepPresetLed === 0
      ? "[&_span.truncate]:text-xs [&_span.truncate]:leading-4"
      : fontSizeStepPresetLed === 1
        ? "[&_span.truncate]:text-sm [&_span.truncate]:leading-5"
        : "[&_span.truncate]:text-base [&_span.truncate]:leading-6";

  const slotLabelOverrideClassPresetLed =
    fontSizeStepPresetLed === 0
      ? "[&_span.truncate]:text-xs [&_span.truncate]:leading-4"
      : fontSizeStepPresetLed === 1
        ? "[&_span.truncate]:text-sm [&_span.truncate]:leading-5"
        : "[&_span.truncate]:text-base [&_span.truncate]:leading-6";

  const bezelStyleDark: React.CSSProperties = {
    padding: BEZEL_PAD_PX,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.35)",
    background: `linear-gradient(145deg, rgba(255,255,255,${0.06 + BEZEL_METAL_HIGHLIGHT * 0.08}) 0%, transparent 45%, rgba(0,0,0,0.25) 100%)`,
    boxShadow: `
      inset 0 1px 0 rgba(255,255,255,0.12),
      inset 0 -2px 8px rgba(0,0,0,0.5),
      0 4px 12px rgba(0,0,0,0.35)
    `,
  };

  const bezelStyleLight: React.CSSProperties = {
    padding: BEZEL_PAD_PX,
    borderRadius: 12,
    border: "1px solid rgba(161,161,170,0.55)",
    background: `linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(228,228,231,0.5) 100%)`,
    boxShadow: `
      inset 0 1px 0 rgba(255,255,255,0.98),
      inset 0 -2px 6px rgba(0,0,0,0.06),
      0 2px 8px rgba(0,0,0,0.06)
    `,
  };

  const bezelStyle = previewSurface === "light" ? bezelStyleLight : bezelStyleDark;

  const bezelStyleTelemetry =
    previewSurfaceTelemetry === "light" ? bezelStyleLight : bezelStyleDark;

  const bezelStylePresetLed =
    previewSurfacePresetLed === "light" ? bezelStyleLight : bezelStyleDark;

  const rowDividerResolved = normalizeHexColor(rowDividerColor, "#e4e4e7");
  const headerFillResolved = normalizeHexColor(headerFillColor, "#fafafa");
  const headerBorderResolved = normalizeHexColor(headerBorderColor, "#d4d4d8");

  const rowDividerResolvedTelemetry = normalizeHexColor(rowDividerColorTelemetry, "#e4e4e7");
  const headerFillResolvedTelemetry = normalizeHexColor(headerFillColorTelemetry, "#fafafa");
  const headerBorderResolvedTelemetry = normalizeHexColor(headerBorderColorTelemetry, "#d4d4d8");

  const rowDividerResolvedPresetLed = normalizeHexColor(rowDividerColorPresetLed, "#e4e4e7");
  const headerFillResolvedPresetLed = normalizeHexColor(headerFillColorPresetLed, "#fafafa");
  const headerBorderResolvedPresetLed = normalizeHexColor(headerBorderColorPresetLed, "#d4d4d8");

  /** Outer header frame only: no vertical strokes between columns. */
  const headerThStyle = React.useCallback(
    (index: number, total: number): React.CSSProperties => {
      const isFirst = index === 0;
      const isLast = index === total - 1;
      const base: React.CSSProperties = {
        backgroundColor: headerFillResolved,
        borderTop: `1px solid ${headerBorderResolved}`,
        borderBottom: `1px solid ${headerBorderResolved}`,
        height: headerCellHeightPx,
        minHeight: headerCellHeightPx,
        maxHeight: headerCellHeightPx,
        boxSizing: "border-box",
        verticalAlign: "middle",
      };
      if (isFirst) {
        return {
          ...base,
          borderLeft: `1px solid ${headerBorderResolved}`,
          borderTopLeftRadius: tabTopRadiusPx,
          borderBottomLeftRadius: tabTopRadiusPx,
        };
      }
      if (isLast) {
        return {
          ...base,
          borderRight: `1px solid ${headerBorderResolved}`,
          borderTopRightRadius: tabTopRadiusPx,
          borderBottomRightRadius: tabTopRadiusPx,
        };
      }
      return base;
    },
    [headerBorderResolved, headerFillResolved],
  );

  const headerThStyleTelemetry = React.useCallback(
    (index: number, total: number): React.CSSProperties => {
      const isFirst = index === 0;
      const isLast = index === total - 1;
      const base: React.CSSProperties = {
        backgroundColor: headerFillResolvedTelemetry,
        borderTop: `1px solid ${headerBorderResolvedTelemetry}`,
        borderBottom: `1px solid ${headerBorderResolvedTelemetry}`,
        height: headerCellHeightPx,
        minHeight: headerCellHeightPx,
        maxHeight: headerCellHeightPx,
        boxSizing: "border-box",
        verticalAlign: "middle",
      };
      if (isFirst) {
        return {
          ...base,
          borderLeft: `1px solid ${headerBorderResolvedTelemetry}`,
          borderTopLeftRadius: tabTopRadiusPx,
          borderBottomLeftRadius: tabTopRadiusPx,
        };
      }
      if (isLast) {
        return {
          ...base,
          borderRight: `1px solid ${headerBorderResolvedTelemetry}`,
          borderTopRightRadius: tabTopRadiusPx,
          borderBottomRightRadius: tabTopRadiusPx,
        };
      }
      return base;
    },
    [
      headerBorderResolvedTelemetry,
      headerFillResolvedTelemetry,
    ],
  );

  const headerThStylePresetLed = React.useCallback(
    (index: number, total: number): React.CSSProperties => {
      const isFirst = index === 0;
      const isLast = index === total - 1;
      const base: React.CSSProperties = {
        backgroundColor: headerFillResolvedPresetLed,
        borderTop: `1px solid ${headerBorderResolvedPresetLed}`,
        borderBottom: `1px solid ${headerBorderResolvedPresetLed}`,
        height: headerCellHeightPx,
        minHeight: headerCellHeightPx,
        maxHeight: headerCellHeightPx,
        boxSizing: "border-box",
        verticalAlign: "middle",
      };
      if (isFirst) {
        return {
          ...base,
          borderLeft: `1px solid ${headerBorderResolvedPresetLed}`,
          borderTopLeftRadius: tabTopRadiusPx,
          borderBottomLeftRadius: tabTopRadiusPx,
        };
      }
      if (isLast) {
        return {
          ...base,
          borderRight: `1px solid ${headerBorderResolvedPresetLed}`,
          borderTopRightRadius: tabTopRadiusPx,
          borderBottomRightRadius: tabTopRadiusPx,
        };
      }
      return base;
    },
    [
      headerBorderResolvedPresetLed,
      headerFillResolvedPresetLed,
    ],
  );

  const billingTableProps: PlaygroundBillingTableProps = {
    headers: PLAYGROUND_HEADERS,
    visibleRecords,
    headerThStyle,
    headerCellHeightPx,
    headerLabelOverrideClass,
    cellTextClassName,
    bodyCellHeightPx,
    cellPaddingXPx,
    slotLabelOverrideClass,
    rowDividerResolved,
    sortConfig,
    setSortConfig,
  };

  const billingTablePropsTelemetry: PlaygroundBillingTableProps = {
    headers: PLAYGROUND_HEADERS_FLUID,
    visibleRecords: visibleRecordsTelemetry,
    headerThStyle: headerThStyleTelemetry,
    headerCellHeightPx,
    headerLabelOverrideClass: headerLabelOverrideClassTelemetry,
    cellTextClassName: cellTextClassNameTelemetry,
    bodyCellHeightPx,
    cellPaddingXPx,
    slotLabelOverrideClass: slotLabelOverrideClassTelemetry,
    rowDividerResolved: rowDividerResolvedTelemetry,
    sortConfig: sortConfigTelemetry,
    setSortConfig: setSortConfigTelemetry,
  };

  const billingTablePropsPresetLed: PlaygroundBillingTableProps = {
    headers: PLAYGROUND_HEADERS,
    visibleRecords: visibleRecordsPresetLed,
    headerThStyle: headerThStylePresetLed,
    headerCellHeightPx,
    headerLabelOverrideClass: headerLabelOverrideClassPresetLed,
    cellTextClassName: cellTextClassNamePresetLed,
    bodyCellHeightPx,
    cellPaddingXPx,
    slotLabelOverrideClass: slotLabelOverrideClassPresetLed,
    rowDividerResolved: rowDividerResolvedPresetLed,
    sortConfig: sortConfigPresetLed,
    setSortConfig: setSortConfigPresetLed,
  };

  const telemetryCapsuleScaleFactor = TELEMETRY_CAPSULE_SCALE_PERCENT / 100;

  return (
    <div className="space-y-10 font-headline tracking-normal">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Table</h2>
        <p className="mt-1 text-sm text-muted-foreground font-headline">
          Billing table explorations with three tab treatments: file cabinet, file cabinet with preset LED, and telemetry.
        </p>
      </div>

      <PlayAreaSection
        id="playground-table-file-cabinet"
        title="Play area: tabbed billing table"
        description="A billing table with file-cabinet tabs and a structured chrome treatment."
      >
        <DashPreviewCanvas
          surface={previewSurface}
          brush={{ grooveIntensity: 0, baseGradientDepth: 0 }}
          style={{
            backgroundImage: "none",
            backgroundColor: previewSurface === "light" ? "#f4f4f5" : "#1b1b1c",
          }}
          innerClassName="gap-0"
        >
          <div style={bezelStyle}>
            <div className="w-full min-w-0">
              <FileCabinetTableChrome
                value={deckTab}
                onValueChange={handleDeckTabChange}
                labels={TAB_LABELS}
                surface={previewSurface}
                underGlowPx={underGlowPx}
                accent={tabAccent}
                tabTopRadiusPx={tabTopRadiusPx}
                showLeftLamp={showLeftLamp}
              >
                <div className="px-2 pb-2 pt-6">
                  <PlaygroundBillingTable {...billingTableProps} />
                </div>
              </FileCabinetTableChrome>
            </div>
          </div>
        </DashPreviewCanvas>

        <BillingTablePlaygroundTweaks
          namePrefix="table-fc"
          previewSurface={previewSurface}
          onPreviewSurfaceChange={setPreviewSurface}
          visibleRows={visibleRows}
          onVisibleRowsChange={setVisibleRows}
          rowDividerColor={rowDividerColor}
          rowDividerResolved={rowDividerResolved}
          onRowDividerColorChange={setRowDividerColor}
          headerFillColor={headerFillColor}
          headerFillResolved={headerFillResolved}
          onHeaderFillColorChange={setHeaderFillColor}
          headerBorderColor={headerBorderColor}
          headerBorderResolved={headerBorderResolved}
          onHeaderBorderColorChange={setHeaderBorderColor}
          fontSizeStep={fontSizeStep}
          onFontSizeStepChange={setFontSizeStep}
        />
      </PlayAreaSection>

      <PlayAreaSection
        id="playground-table-file-cabinet-preset-led"
        title="Play area: file cabinet + Preset + LED (under label)"
        description="A file-cabinet table variant with a preset LED indicator under each tab label."
      >
        <DashPreviewCanvas
          surface={previewSurfacePresetLed}
          brush={{ grooveIntensity: 0, baseGradientDepth: 0 }}
          style={{
            backgroundImage: "none",
            backgroundColor: previewSurfacePresetLed === "light" ? "#f4f4f5" : "#1b1b1c",
          }}
          innerClassName="gap-0"
        >
          <div style={bezelStylePresetLed}>
            <div className="w-full min-w-0">
              <FileCabinetTableChrome
                value={deckTabPresetLed}
                onValueChange={handleDeckTabChangePresetLed}
                labels={TAB_LABELS}
                surface={previewSurfacePresetLed}
                underGlowPx={underGlowPx}
                accent={tabAccent}
                tabTopRadiusPx={tabTopRadiusPx}
                showLeftLamp={false}
                noLeftLampBelowStyle="preset-led"
              >
                <div className="px-2 pb-2 pt-6">
                  <PlaygroundBillingTable {...billingTablePropsPresetLed} />
                </div>
              </FileCabinetTableChrome>
            </div>
          </div>
        </DashPreviewCanvas>

        <BillingTablePlaygroundTweaks
          namePrefix="table-fc-preset-led"
          previewSurface={previewSurfacePresetLed}
          onPreviewSurfaceChange={setPreviewSurfacePresetLed}
          visibleRows={visibleRowsPresetLed}
          onVisibleRowsChange={setVisibleRowsPresetLed}
          rowDividerColor={rowDividerColorPresetLed}
          rowDividerResolved={rowDividerResolvedPresetLed}
          onRowDividerColorChange={setRowDividerColorPresetLed}
          headerFillColor={headerFillColorPresetLed}
          headerFillResolved={headerFillResolvedPresetLed}
          onHeaderFillColorChange={setHeaderFillColorPresetLed}
          headerBorderColor={headerBorderColorPresetLed}
          headerBorderResolved={headerBorderResolvedPresetLed}
          onHeaderBorderColorChange={setHeaderBorderColorPresetLed}
          fontSizeStep={fontSizeStepPresetLed}
          onFontSizeStepChange={setFontSizeStepPresetLed}
        />
      </PlayAreaSection>

      <PlayAreaSection
        id="playground-table-telemetry-deck"
        title="Play area: telemetry tabs + fluid billing table"
        description="A fluid billing table with telemetry-style tabs and a simpler panel treatment."
      >
        <DashPreviewCanvas
          surface={previewSurfaceTelemetry}
          brush={{ grooveIntensity: 0, baseGradientDepth: 0 }}
          style={{
            backgroundImage: "none",
            backgroundColor: previewSurfaceTelemetry === "light" ? "#f4f4f5" : "#1b1b1c",
          }}
          innerClassName="gap-0"
        >
          <div style={bezelStyleTelemetry}>
            <div className="flex w-full min-w-0 flex-col">
              <TelemetryDeckTabs
                value={deckTabTelemetry}
                onValueChange={handleDeckTabChangeTelemetry}
                visual={previewSurfaceTelemetry === "light" ? "light" : "dark"}
                capsulePlacement="below"
                capsuleImpl="css"
              >
                <div
                  className="inline-block max-w-full"
                  style={
                    {
                      ["--telemetry-led-w" as string]: `${1.5 * telemetryCapsuleScaleFactor}rem`,
                      ["--telemetry-led-h" as string]: `${0.25 * telemetryCapsuleScaleFactor}rem`,
                    } as React.CSSProperties
                  }
                >
                  <TelemetryDeckTabList
                    className="max-w-full"
                    style={{ gap: TAB_STRIP_TELEMETRY_GAP_PX }}
                  >
                    <TelemetryDeckTab value="drive" ledTone="primary">
                      {TAB_LABELS.drive}
                    </TelemetryDeckTab>
                    <TelemetryDeckTab value="climate" ledTone="coolant">
                      {TAB_LABELS.climate}
                    </TelemetryDeckTab>
                    <TelemetryDeckTab value="media" ledTone="amber">
                      {TAB_LABELS.media}
                    </TelemetryDeckTab>
                    <TelemetryDeckTab value="system" ledTone="red">
                      {TAB_LABELS.system}
                    </TelemetryDeckTab>
                  </TelemetryDeckTabList>
                </div>
              </TelemetryDeckTabs>

              <div
                className={cn(
                  "mt-6 w-full min-w-0 rounded-lg border px-2 pb-2 pt-1",
                  previewSurfaceTelemetry === "light"
                    ? "border-zinc-300/90 bg-white/90"
                    : "border-zinc-600/80 bg-zinc-950/40",
                )}
              >
                <PlaygroundBillingTable {...billingTablePropsTelemetry} />
              </div>
            </div>
          </div>
        </DashPreviewCanvas>

        <BillingTablePlaygroundTweaks
          namePrefix="table-tel"
          previewSurface={previewSurfaceTelemetry}
          onPreviewSurfaceChange={setPreviewSurfaceTelemetry}
          visibleRows={visibleRowsTelemetry}
          onVisibleRowsChange={setVisibleRowsTelemetry}
          rowDividerColor={rowDividerColorTelemetry}
          rowDividerResolved={rowDividerResolvedTelemetry}
          onRowDividerColorChange={setRowDividerColorTelemetry}
          headerFillColor={headerFillColorTelemetry}
          headerFillResolved={headerFillResolvedTelemetry}
          onHeaderFillColorChange={setHeaderFillColorTelemetry}
          headerBorderColor={headerBorderColorTelemetry}
          headerBorderResolved={headerBorderResolvedTelemetry}
          onHeaderBorderColorChange={setHeaderBorderColorTelemetry}
          fontSizeStep={fontSizeStepTelemetry}
          onFontSizeStepChange={setFontSizeStepTelemetry}
        />
      </PlayAreaSection>
    </div>
  );
}
