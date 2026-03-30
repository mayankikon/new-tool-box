"use client";

import type { DaysOffLotThreshold } from "@/lib/inventory/report-table-helpers";
import type { InstalledDevicesTimeFrame } from "@/lib/inventory/report-table-helpers";
import type { UninstalledHistoryTimeFrame } from "@/lib/inventory/report-table-helpers";

import { cn } from "@/lib/utils";

const DAYS_OFF_LOT_OPTIONS: { value: DaysOffLotThreshold; label: string }[] = [
  { value: 1, label: "More than 1 day" },
  { value: 3, label: "More than 3 days" },
  { value: 7, label: "More than 7 days" },
  { value: 14, label: "More than 14 days" },
  { value: 30, label: "More than 30 days" },
];

const INSTALLED_TIMEFRAME_OPTIONS: { value: InstalledDevicesTimeFrame; label: string }[] = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-3", label: "Last 3 Days" },
  { value: "last-7", label: "Last 7 Days" },
  { value: "last-14", label: "Last 14 Days" },
  { value: "last-30", label: "Last 30 Days" },
  { value: "last-60", label: "Last 60 Days" },
  { value: "last-90", label: "Last 90 Days" },
  { value: "last-120", label: "Last 120 Days" },
];

const UNINSTALLED_TIMEFRAME_OPTIONS: { value: UninstalledHistoryTimeFrame; label: string }[] = [
  { value: "all", label: "All" },
  { value: "last-7", label: "Last 7 days" },
  { value: "last-15", label: "Last 15 days" },
  { value: "last-30", label: "Last 30 days" },
];

function nativeSelectClassName() {
  return cn(
    "h-8 min-w-[12rem] rounded-sm border border-input bg-background px-2.5 text-sm",
    "text-foreground shadow-sm outline-none",
    "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
  );
}

export function DaysOffLotFilter({
  value,
  onChange,
  id,
}: {
  value: DaysOffLotThreshold;
  onChange: (next: DaysOffLotThreshold) => void;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-sm text-muted-foreground" htmlFor={id}>
        Days Off Lot
      </label>
      <select
        id={id}
        className={nativeSelectClassName()}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as DaysOffLotThreshold)}
      >
        {DAYS_OFF_LOT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function InstalledDevicesTimeFrameFilter({
  value,
  onChange,
  id,
}: {
  value: InstalledDevicesTimeFrame;
  onChange: (next: InstalledDevicesTimeFrame) => void;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-sm text-muted-foreground" htmlFor={id}>
        Time frame
      </label>
      <select
        id={id}
        className={nativeSelectClassName()}
        value={value}
        onChange={(e) =>
          onChange(e.target.value as InstalledDevicesTimeFrame)
        }
      >
        {INSTALLED_TIMEFRAME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function UninstalledHistoryTimeFrameFilter({
  value,
  onChange,
  id,
}: {
  value: UninstalledHistoryTimeFrame;
  onChange: (next: UninstalledHistoryTimeFrame) => void;
  id?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-sm text-muted-foreground" htmlFor={id}>
        Time frame
      </label>
      <select
        id={id}
        className={nativeSelectClassName()}
        value={value}
        onChange={(e) =>
          onChange(e.target.value as UninstalledHistoryTimeFrame)
        }
      >
        {UNINSTALLED_TIMEFRAME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
