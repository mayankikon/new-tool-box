"use client";

import type { CSSProperties } from "react";
import { useDeferredValue, useMemo, useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import { useTheme } from "@/components/theme/app-theme-provider";

import type { DashPreviewSurface } from "@/app/design-playground/components/dash-preview-canvas";
import { FileCabinetTableChrome } from "@/app/design-playground/components/file-cabinet-table-chrome";
import { TopBar } from "@/components/app/top-bar";
import {
  InventoryKpiCard,
  inventoryDashboardShowcaseWidgetSettings,
} from "@/components/inventory/inventory-dashboard-widgets";
import { Button } from "@/components/ui/button";
import { Input, InputContainer, InputIcon } from "@/components/ui/input";
import { MonthSelectButton } from "@/components/ui/month-select-button";
import { Paginator } from "@/components/ui/paginator";
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
import {
  DATA_TABLE_CELL_INNER_HOVER_CLASS,
  DATA_TABLE_ROW_GROUP_CLASS,
} from "@/lib/data-table-row-hover";
import { DASHBOARD_CHROME_SURFACE_CLASS } from "@/lib/ui/dashboard-chrome-surface";
import { cn } from "@/lib/utils";

const {
  headerCellHeightPx,
  bodyCellHeightPx,
  cellPaddingXPx,
} = FILE_CABINET_BILLING_TABLE_DEFAULTS;

const ROW_STROKE_LIGHT =
  "var(--theme-stroke-subtle, var(--theme-stroke-default))";

const BODY_CELL_DIVIDER =
  "border-b border-solid border-[var(--theme-stroke-subtle,var(--theme-stroke-default))]";

const BILLING_HEADER_TH_STYLE: CSSProperties = {
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
};

type BillingWindow = "past" | "upcoming" | "archived";
type BillingMonthKey =
  | "2026-03"
  | "2026-02"
  | "2026-01"
  | "2025-12"
  | "2025-11";
type BillingServiceTab = "all" | "1-year" | "3-years" | "5-years" | "7-years";

interface BillingRecord {
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
  billingWindow: BillingWindow;
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

const BILLING_MOCK_FIRST_NAMES = [
  "Jordan",
  "Riley",
  "Morgan",
  "Casey",
  "Avery",
  "Quinn",
  "Skyler",
  "Reese",
  "Parker",
  "Drew",
  "Blake",
  "Cameron",
  "Dakota",
  "Emery",
  "Finley",
  "Harper",
  "Jamie",
  "Kendall",
  "Logan",
  "Maxwell",
] as const;

const BILLING_MOCK_LAST_NAMES = [
  "Abbott",
  "Bennett",
  "Carson",
  "Dalton",
  "Ellis",
  "Foster",
  "Grayson",
  "Hayes",
  "Irving",
  "Jennings",
  "Keating",
  "Langford",
  "Monroe",
  "Nash",
  "Oakley",
  "Porter",
  "Quinlan",
  "Rowe",
  "Stanton",
  "Turner",
] as const;

const BILLING_MOCK_MAKES = [
  "Lexus",
  "Toyota",
  "Honda",
  "Acura",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Volvo",
  "Genesis",
  "Cadillac",
] as const;

const BILLING_MOCK_MODELS = [
  "ES 300h",
  "NX 500",
  "RX 350h",
  "Camry XLE",
  "Accord Touring",
  "MDX",
  "330i",
  "C 300",
  "Q5",
  "XC60",
  "GV80",
  "XT5",
  "IS 350",
  "UX 250h",
  "Highlander",
  "CR-V",
  "TLX",
  "X5",
  "GLE 350",
  "e-tron",
] as const;

const BILLING_MOCK_STAFF = [
  "Livia Korsgaard",
  "Dulce Kenter",
  "Omar Schleifer",
  "Kaylynn Saris",
  "Kianna Torff",
  "Abram Lubin",
  "Tatiana Septimus",
  "Erin George",
  "Nolan Franci",
  "Mira Franci",
  "Sam Rivers",
  "Alex Kim",
  "Jordan Patel",
] as const;

const BILLING_MOCK_SERVICE_TYPES = ["1 Year", "3 Years", "5 Years", "7 Years"] as const;
const BILLING_MOCK_STOCK_TYPES = ["New", "Preowned", "Certified"] as const;
const BILLING_MOCK_TRIMS = [
  "Premium Sedan",
  "Luxury Sports",
  "Base",
  "Premium Sports",
  "Luxury Sedan",
  "F Sport",
] as const;
const BILLING_MOCK_PRICES = [329, 495, 645, 785] as const;

function buildExtraBillingRows(count: number, startSequence: number): BillingRecord[] {
  return Array.from({ length: count }, (_, index) => {
    const sequence = startSequence + index;
    const firstName = BILLING_MOCK_FIRST_NAMES[index % BILLING_MOCK_FIRST_NAMES.length];
    const lastName =
      BILLING_MOCK_LAST_NAMES[(index * 11) % BILLING_MOCK_LAST_NAMES.length];
    const vinSuffix = String(30_000 + sequence).padStart(5, "0");
    const billingWindow: BillingWindow =
      index % 11 === 0 ? "archived" : index % 2 === 0 ? "past" : "upcoming";

    return {
      id: `billing-${sequence}`,
      vin: `WBA53AK02R7N${vinSuffix}`,
      stockNumber: `ST${String(sequence).padStart(4, "0")}`,
      year: 2019 + (index % 7),
      make: BILLING_MOCK_MAKES[index % BILLING_MOCK_MAKES.length],
      model: BILLING_MOCK_MODELS[index % BILLING_MOCK_MODELS.length],
      customerName: `${firstName} ${lastName}`,
      serviceType: BILLING_MOCK_SERVICE_TYPES[index % BILLING_MOCK_SERVICE_TYPES.length],
      price: BILLING_MOCK_PRICES[index % BILLING_MOCK_PRICES.length],
      stockType: BILLING_MOCK_STOCK_TYPES[index % BILLING_MOCK_STOCK_TYPES.length],
      trim: BILLING_MOCK_TRIMS[index % BILLING_MOCK_TRIMS.length],
      registeredBy: BILLING_MOCK_STAFF[index % BILLING_MOCK_STAFF.length],
      billingWindow,
    };
  });
}

const BILLING_ROWS: BillingRecord[] = [
  {
    id: "billing-1",
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
    billingWindow: "past",
  },
  {
    id: "billing-2",
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
    billingWindow: "upcoming",
  },
  {
    id: "billing-3",
    vin: "WBA53AK02R7N11429",
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
    billingWindow: "past",
  },
  {
    id: "billing-4",
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
    billingWindow: "upcoming",
  },
  {
    id: "billing-5",
    vin: "WBA53AK02R7N11429",
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
    billingWindow: "archived",
  },
  {
    id: "billing-6",
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
    billingWindow: "past",
  },
  {
    id: "billing-7",
    vin: "WBA53AK02R7N11429",
    stockNumber: "R5J234",
    year: 2024,
    make: "Lexus",
    model: "NX 500",
    customerName: "Phillip Mango",
    serviceType: "5 Years",
    price: 645,
    stockType: "Certified",
    trim: "Premium Sedan",
    registeredBy: "Abram Lubin",
    billingWindow: "upcoming",
  },
  {
    id: "billing-8",
    vin: "WBA53AK02R7N11429",
    stockNumber: "MKS823",
    year: 2023,
    make: "Lexus",
    model: "ES 300h",
    customerName: "Ann Dorwart",
    serviceType: "5 Years",
    price: 645,
    stockType: "New",
    trim: "Luxury Sports",
    registeredBy: "Tatiana Septimus",
    billingWindow: "past",
  },
  {
    id: "billing-9",
    vin: "WBA53AK02R7N11429",
    stockNumber: "R5J234",
    year: 2025,
    make: "Lexus",
    model: "NX 500",
    customerName: "Cooper Dokidis",
    serviceType: "7 Years",
    price: 785,
    stockType: "New",
    trim: "Premium Sports",
    registeredBy: "Erin George",
    billingWindow: "upcoming",
  },
  {
    id: "billing-10",
    vin: "WBA53AK02R7N11429",
    stockNumber: "SX882G",
    year: 2024,
    make: "Lexus",
    model: "ES 300h",
    customerName: "Mira Bator",
    serviceType: "7 Years",
    price: 785,
    stockType: "New",
    trim: "Premium Sports",
    registeredBy: "Kierra George",
    billingWindow: "past",
  },
  {
    id: "billing-11",
    vin: "WBA53AK02R7N11426",
    stockNumber: "PB19834",
    year: 2025,
    make: "Lexus",
    model: "NX 500",
    customerName: "Marley Dokidis",
    serviceType: "5 Years",
    price: 645,
    stockType: "Preowned",
    trim: "Luxury Sedan",
    registeredBy: "Nolan Franci",
    billingWindow: "upcoming",
  },
  {
    id: "billing-12",
    vin: "WBA53AK02R7N11429",
    stockNumber: "R5J234",
    year: 2025,
    make: "Lexus",
    model: "ES 300h",
    customerName: "Dulce Dias",
    serviceType: "3 Years",
    price: 495,
    stockType: "Certified",
    trim: "Luxury Sedan",
    registeredBy: "Mira Franci",
    billingWindow: "archived",
  },
  ...buildExtraBillingRows(50, 13),
];

const BILLING_HEADERS: { key: SortKey; label: string; widthClassName: string }[] = [
  { key: "vin", label: "VIN", widthClassName: "w-[220px]" },
  { key: "stockNumber", label: "Stock Number", widthClassName: "w-[150px]" },
  { key: "year", label: "Year", widthClassName: "w-[92px]" },
  { key: "make", label: "Make", widthClassName: "w-[130px]" },
  { key: "model", label: "Model", widthClassName: "w-[150px]" },
  { key: "customerName", label: "Customer Name", widthClassName: "w-[220px]" },
  { key: "serviceType", label: "Service Type", widthClassName: "w-[130px]" },
  { key: "price", label: "Price", widthClassName: "w-[110px]" },
  { key: "stockType", label: "Stock Type", widthClassName: "w-[130px]" },
  { key: "trim", label: "Trim", widthClassName: "w-[150px]" },
  { key: "registeredBy", label: "Registered By", widthClassName: "w-[190px]" },
];

const BILLING_MONTHS = [
  { value: "2026-03", label: "March 2026" },
  { value: "2026-02", label: "February 2026" },
  { value: "2026-01", label: "January 2026" },
  { value: "2025-12", label: "December 2025" },
  { value: "2025-11", label: "November 2025" },
] as const;

const BILLING_SERVICE_TAB_VALUES = [
  "all",
  "1-year",
  "3-years",
  "5-years",
  "7-years",
] as const satisfies readonly BillingServiceTab[];

const BILLING_SERVICE_TAB_LABELS: Record<BillingServiceTab, string> = {
  all: "Show All",
  "1-year": "1 Year",
  "3-years": "3 Years",
  "5-years": "5 Years",
  "7-years": "7 Years",
};

const BILLING_SERVICE_TYPE_BY_TAB: Record<Exclude<BillingServiceTab, "all">, string> = {
  "1-year": "1 Year",
  "3-years": "3 Years",
  "5-years": "5 Years",
  "7-years": "7 Years",
};

const BILLING_MONTH_OFFSETS: Record<BillingMonthKey, number> = {
  "2026-03": 0,
  "2026-02": 1,
  "2026-01": 2,
  "2025-12": 3,
  "2025-11": 4,
};

const BILLING_MONTH_PRICE_SHIFT: Record<BillingMonthKey, number> = {
  "2026-03": 0,
  "2026-02": 30,
  "2026-01": -20,
  "2025-12": 45,
  "2025-11": -35,
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function buildMonthlyBillingRows(month: BillingMonthKey): BillingRecord[] {
  const offset = BILLING_MONTH_OFFSETS[month];
  const priceShift = BILLING_MONTH_PRICE_SHIFT[month];

  return BILLING_ROWS.map((record, index) => {
    const monthSequence = index + offset;
    const serviceType =
      BILLING_MOCK_SERVICE_TYPES[monthSequence % BILLING_MOCK_SERVICE_TYPES.length];
    const basePrice = BILLING_MOCK_PRICES[monthSequence % BILLING_MOCK_PRICES.length];

    return {
      ...record,
      id: `${month}-${record.id}`,
      serviceType,
      price: basePrice + priceShift,
      year: record.year - (offset > 1 && index % 9 === 0 ? 1 : 0),
      billingWindow:
        monthSequence % 7 === 0
          ? "archived"
          : monthSequence % 2 === 0
            ? "past"
            : "upcoming",
    };
  });
}

const BILLING_MONTHLY_RECORDS: Record<BillingMonthKey, BillingRecord[]> = {
  "2026-03": buildMonthlyBillingRows("2026-03"),
  "2026-02": buildMonthlyBillingRows("2026-02"),
  "2026-01": buildMonthlyBillingRows("2026-01"),
  "2025-12": buildMonthlyBillingRows("2025-12"),
  "2025-11": buildMonthlyBillingRows("2025-11"),
};

function compareBillingValues(
  left: BillingRecord,
  right: BillingRecord,
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

function BillingDataTableRow({
  record,
  isLastRow,
}: {
  record: BillingRecord;
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

  const slotLabelOverrideClass =
    "[&_span.truncate]:text-sm [&_span.truncate]:leading-5";
  const slotClass = cn("text-foreground", slotLabelOverrideClass);
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
      <TableCell className={cellFrame}>
        <div
          className={cn("flex items-center", DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        >
          <span className="truncate text-sm font-medium leading-5 text-primary">
            {record.vin}
          </span>
        </div>
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={record.stockNumber}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={String(record.year)}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={record.make}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={record.model}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={record.customerName}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={record.serviceType}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={`$${record.price}`}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={record.stockType}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={record.trim}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>

      <TableCell className={cellFrame}>
        <TableSlotCell
          label={record.registeredBy}
          className={cn(slotClass, DATA_TABLE_CELL_INNER_HOVER_CLASS)}
          style={innerStyle}
        />
      </TableCell>
    </TableRow>
  );
}

const PLAYGROUND_SECONDARY_CHROME =
  "!border-border !bg-card !text-foreground shadow-sm hover:!bg-muted active:!bg-muted";

const PLAYGROUND_INPUT_SHELL =
  "!border-border !bg-card hover:!border-input hover:!bg-[var(--theme-background-input-hover)]";

export interface BillingPageProps {
  /**
   * `designPlaygroundLight`: transparent page title bar; secondary actions and search use
   * card/muted chrome (theme-aware) for grooved panel previews.
   */
  presentation?: "default" | "designPlaygroundLight";
}

export function BillingPage({
  presentation = "default",
}: BillingPageProps) {
  const { resolvedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<BillingMonthKey>("2026-03");
  const [serviceTab, setServiceTab] = useState<BillingServiceTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  }>({
    key: "vin",
    direction: "asc",
  });

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();
  const previewSurface: DashPreviewSurface =
    resolvedTheme === "dark" ? "dark" : "light";

  const monthRecords = useMemo(
    () => BILLING_MONTHLY_RECORDS[selectedMonth],
    [selectedMonth],
  );

  const filteredRecords = useMemo(() => {
    const tabFiltered =
      serviceTab === "all"
        ? monthRecords
        : monthRecords.filter(
            (record) => record.serviceType === BILLING_SERVICE_TYPE_BY_TAB[serviceTab],
          );

    const searchFiltered = tabFiltered.filter((record) => {
      if (!normalizedQuery) return true;

      return [
        record.vin,
        record.stockNumber,
        String(record.year),
        record.make,
        record.model,
        record.customerName,
        record.serviceType,
        `$${record.price}`,
        record.stockType,
        record.trim,
        record.registeredBy,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });

    return [...searchFiltered].sort((left, right) =>
      compareBillingValues(left, right, sortConfig.key, sortConfig.direction),
    );
  }, [monthRecords, normalizedQuery, serviceTab, sortConfig.direction, sortConfig.key]);

  const monthSummary = useMemo(() => {
    const totalRevenue = monthRecords.reduce((sum, record) => sum + record.price, 0);
    const serviceMix =
      serviceTab === "all"
        ? "All service terms"
        : `${BILLING_SERVICE_TAB_LABELS[serviceTab]} contracts`;

    return {
      revenue: currencyFormatter.format(totalRevenue),
      devicesSold: String(monthRecords.length),
      revenueCaption: `${serviceMix} in ${BILLING_MONTHS.find((month) => month.value === selectedMonth)?.label ?? selectedMonth}`,
      devicesSoldCaption:
        serviceTab === "all"
          ? "Devices sold across all service types"
          : `Devices sold for ${BILLING_SERVICE_TAB_LABELS[serviceTab]}`,
    };
  }, [monthRecords, selectedMonth, serviceTab]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedRecords = filteredRecords.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const playgroundLight = presentation === "designPlaygroundLight";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 pt-6">
        <TopBar
          title="Billing"
          className={
            playgroundLight
              ? "shadow-none border-b border-border/25"
              : undefined
          }
          right={
            <>
              <MonthSelectButton
                months={[...BILLING_MONTHS]}
                value={selectedMonth}
                onValueChange={(value) => {
                  setSelectedMonth(value as BillingMonthKey);
                  setCurrentPage(1);
                }}
                className={
                  playgroundLight ? PLAYGROUND_SECONDARY_CHROME : undefined
                }
              />
              <Button
                variant="secondary"
                size="header"
                leadingIcon={<Download />}
                className={
                  playgroundLight ? PLAYGROUND_SECONDARY_CHROME : undefined
                }
              >
                Export CSV
              </Button>
              <Button size="header">Generate Report</Button>
            </>
          }
        />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-hidden px-8 pb-8 pt-6">
        <div className="grid shrink-0 gap-4 md:max-w-[50%] md:grid-cols-2 xl:max-w-[720px]">
          <InventoryKpiCard
            metric={{
              label: "Revenue",
              value: monthSummary.revenue,
              caption: monthSummary.revenueCaption,
              icon: "vehicle-inventory",
            }}
            settings={inventoryDashboardShowcaseWidgetSettings}
            className={DASHBOARD_CHROME_SURFACE_CLASS}
          />
          <InventoryKpiCard
            metric={{
              label: "Devices Sold",
              value: monthSummary.devicesSold,
              caption: monthSummary.devicesSoldCaption,
              icon: "devices-sold",
            }}
            settings={inventoryDashboardShowcaseWidgetSettings}
            className={DASHBOARD_CHROME_SURFACE_CLASS}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <InputContainer
            size="lg"
            className={cn(
              "w-full max-w-sm",
              playgroundLight && PLAYGROUND_INPUT_SHELL,
            )}
          >
            <InputIcon position="lead">
              <Search className="size-4" />
            </InputIcon>
            <Input
              standalone={false}
              size="lg"
              aria-label="Search billing records"
              placeholder="Search billing records"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
              }}
            />
          </InputContainer>

          <div className="flex-1" />

          <Button
            variant="secondary"
            size="md"
            leadingIcon={<Filter />}
            className={playgroundLight ? PLAYGROUND_SECONDARY_CHROME : undefined}
          >
            Filters
          </Button>
        </div>

        <FileCabinetTableChrome
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          value={serviceTab}
          onValueChange={(value) => {
            setServiceTab(value as BillingServiceTab);
            setCurrentPage(1);
          }}
          labels={BILLING_SERVICE_TAB_LABELS}
          surface={previewSurface}
          underGlowPx={FILE_CABINET_BILLING_TABLE_DEFAULTS.underGlowPx}
          accent={FILE_CABINET_BILLING_TABLE_DEFAULTS.tabAccent}
          tabTopRadiusPx={FILE_CABINET_BILLING_TABLE_DEFAULTS.tabTopRadiusPx}
          showLeftLamp={false}
          noLeftLampBelowStyle="preset-led"
          tabMotionVariant="sink-rise"
          tabValues={BILLING_SERVICE_TAB_VALUES}
        >
          <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-2 pt-[4px]">
            <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain">
              <Table className="border-separate border-spacing-0 bg-transparent text-sm">
                <TableHeader className="[&_tr]:border-0 [&_tr]:bg-transparent [&_tr]:hover:bg-transparent">
                  <TableRow size="compact" className="!border-0 hover:bg-transparent">
                    {BILLING_HEADERS.map((header) => (
                      <TableHead
                        key={header.key}
                        className={cn(header.widthClassName, "p-0 align-middle")}
                        style={BILLING_HEADER_TH_STYLE}
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
                            "[&_span.truncate]:text-sm [&_span.truncate]:leading-5",
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
                            setCurrentPage(1);
                          }}
                        />
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedRecords.map((record, rowIndex) => (
                    <BillingDataTableRow
                      key={record.id}
                      record={record}
                      isLastRow={rowIndex === pagedRecords.length - 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex min-w-0 shrink-0 justify-end px-2 pt-2">
              <Paginator
                variant="inline"
                currentPage={safeCurrentPage}
                totalPages={totalPages}
                totalItems={filteredRecords.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </FileCabinetTableChrome>
      </div>
    </div>
  );
}
