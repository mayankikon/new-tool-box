/**
 * Pure helpers for inventory report tables (sorting, filters, display).
 * Kept framework-free for unit tests.
 */

import type { ReportColumnDef } from "@/lib/inventory/report-table-config";

export const MISSING_LABEL = "Missing";

export type InventoryReportRowLike = {
  id: string;
} & Record<string, string | number | undefined>;

export type DaysOffLotThreshold = 1 | 3 | 7 | 14 | 30;

export type InstalledDevicesTimeFrame =
  | "all"
  | "today"
  | "yesterday"
  | "last-3"
  | "last-7"
  | "last-14"
  | "last-30"
  | "last-60"
  | "last-90"
  | "last-120";

export type UninstalledHistoryTimeFrame = "all" | "last-7" | "last-15" | "last-30";

export function formatVoltageVolts(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  if (Number.isNaN(n)) {
    return String(value);
  }
  return `${n.toFixed(1)}v`;
}

export function displayMissingField(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) {
    return MISSING_LABEL;
  }
  const s = String(value).trim();
  if (s === "") {
    return MISSING_LABEL;
  }
  return s;
}

export function parseDaysSince(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : 0;
}

export function passesDaysOffLotFilter(
  daysSinceOffLot: number,
  threshold: DaysOffLotThreshold,
): boolean {
  return daysSinceOffLot > threshold;
}

/** ISO date string yyyy-mm-dd or epoch ms */
export function parseReportDate(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const s = String(value).trim();
  if (!s) {
    return null;
  }
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, days: number): Date {
  const next = new Date(d.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function getInstalledDevicesRangeStart(
  timeframe: InstalledDevicesTimeFrame,
  nowMs: number,
): number | null {
  const now = new Date(nowMs);
  const startToday = startOfUtcDay(now).getTime();

  switch (timeframe) {
    case "all":
      return null;
    case "today":
      return startToday;
    case "yesterday": {
      const y = addUtcDays(startOfUtcDay(now), -1);
      return y.getTime();
    }
    case "last-3":
      return addUtcDays(startOfUtcDay(now), -2).getTime();
    case "last-7":
      return addUtcDays(startOfUtcDay(now), -6).getTime();
    case "last-14":
      return addUtcDays(startOfUtcDay(now), -13).getTime();
    case "last-30":
      return addUtcDays(startOfUtcDay(now), -29).getTime();
    case "last-60":
      return addUtcDays(startOfUtcDay(now), -59).getTime();
    case "last-90":
      return addUtcDays(startOfUtcDay(now), -89).getTime();
    case "last-120":
      return addUtcDays(startOfUtcDay(now), -119).getTime();
    default:
      return null;
  }
}

export function getInstalledDevicesRangeEnd(
  timeframe: InstalledDevicesTimeFrame,
  nowMs: number,
): number | null {
  if (timeframe === "all") {
    return null;
  }
  const now = new Date(nowMs);
  /** End of “today” in UTC (inclusive upper bound for date checks). */
  const endToday = addUtcDays(startOfUtcDay(now), 1).getTime() - 1;

  if (timeframe === "yesterday") {
    return startOfUtcDay(now).getTime() - 1;
  }

  return endToday;
}

export function installationDateInTimeframe(
  installationDateIso: string | null | undefined,
  timeframe: InstalledDevicesTimeFrame,
  nowMs: number,
): boolean {
  const t = parseReportDate(installationDateIso);
  if (t === null) {
    return false;
  }
  const start = getInstalledDevicesRangeStart(timeframe, nowMs);
  const end = getInstalledDevicesRangeEnd(timeframe, nowMs);
  if (timeframe === "yesterday") {
    const yStart = getInstalledDevicesRangeStart("yesterday", nowMs);
    const yEnd = getInstalledDevicesRangeEnd("yesterday", nowMs);
    if (yStart === null || yEnd === null) {
      return true;
    }
    return t >= yStart && t <= yEnd;
  }
  if (start === null) {
    return true;
  }
  if (end === null) {
    return t >= start;
  }
  return t >= start && t <= end;
}

export function getUninstalledHistoryCutoffMs(
  timeframe: UninstalledHistoryTimeFrame,
  nowMs: number,
): number {
  if (timeframe === "all") {
    return Number.NEGATIVE_INFINITY;
  }
  const days =
    timeframe === "last-7" ? 7 : timeframe === "last-15" ? 15 : 30;
  return nowMs - days * 24 * 60 * 60 * 1000;
}

export function compareReportCellStrings(
  a: string,
  b: string,
  direction: "asc" | "desc",
): number {
  const cmp = a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
  return direction === "asc" ? cmp : -cmp;
}

export function sortValueForReportColumn(
  column: ReportColumnDef,
  row: InventoryReportRowLike,
): string {
  const raw = row[column.key];
  if (column.key === "statusIcons") {
    return [
      String(row.deviceStatus ?? ""),
      String(row.keyStatus ?? ""),
      String(row.batteryStatus ?? ""),
    ].join("|");
  }
  if (column.format === "voltage") {
    const n =
      typeof raw === "number"
        ? raw
        : Number.parseFloat(String(raw ?? "").replace(/v$/i, ""));
    return Number.isFinite(n) ? String(n).padStart(8, "0") : String(raw ?? "");
  }
  if (column.format === "missing") {
    return displayMissingField(raw as string | number | null | undefined);
  }
  if (raw === null || raw === undefined) {
    return "";
  }
  return String(raw);
}

export function sortInventoryReportRows(
  rows: InventoryReportRowLike[],
  columns: ReportColumnDef[],
  sortKey: string,
  direction: "asc" | "desc",
): InventoryReportRowLike[] {
  const col = columns.find((c) => c.key === sortKey);
  if (!col) {
    return [...rows];
  }
  const copy = [...rows];
  copy.sort((a, b) =>
    compareReportCellStrings(
      sortValueForReportColumn(col, a),
      sortValueForReportColumn(col, b),
      direction,
    ),
  );
  return copy;
}
