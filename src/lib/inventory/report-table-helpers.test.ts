import { describe, expect, it } from "vitest";

import type { ReportColumnDef } from "@/lib/inventory/report-table-config";

import {
  compareReportCellStrings,
  displayMissingField,
  formatVoltageVolts,
  MISSING_LABEL,
  passesDaysOffLotFilter,
  sortInventoryReportRows,
  sortValueForReportColumn,
} from "./report-table-helpers";

describe("formatVoltageVolts", () => {
  it("formats numeric voltage with one decimal and v suffix", () => {
    expect(formatVoltageVolts(12.4)).toBe("12.4v");
  });

  it("returns em dash for empty input", () => {
    expect(formatVoltageVolts(null)).toBe("—");
    expect(formatVoltageVolts("")).toBe("—");
  });
});

describe("displayMissingField", () => {
  it("returns Missing label for blank values", () => {
    expect(displayMissingField("")).toBe(MISSING_LABEL);
    expect(displayMissingField(null)).toBe(MISSING_LABEL);
  });

  it("returns string for present values", () => {
    expect(displayMissingField("Toyota")).toBe("Toyota");
  });
});

describe("passesDaysOffLotFilter", () => {
  it("matches more-than threshold semantics", () => {
    expect(passesDaysOffLotFilter(5, 1)).toBe(true);
    expect(passesDaysOffLotFilter(1, 1)).toBe(false);
    expect(passesDaysOffLotFilter(0, 3)).toBe(false);
  });
});

describe("compareReportCellStrings", () => {
  it("sorts numeric-like strings with numeric awareness", () => {
    expect(
      compareReportCellStrings("2", "10", "asc"),
    ).toBeLessThan(0);
  });
});

describe("sortInventoryReportRows", () => {
  const col: ReportColumnDef = {
    key: "make",
    label: "Make",
    widthClassName: "w-20",
  };

  it("sorts by column key", () => {
    const rows = [
      { id: "a", make: "Ford" },
      { id: "b", make: "Audi" },
    ];
    const asc = sortInventoryReportRows(rows, [col], "make", "asc");
    expect(asc.map((r) => r.make)).toEqual(["Audi", "Ford"]);
  });
});

describe("sortValueForReportColumn", () => {
  it("combines status icon fields", () => {
    const col: ReportColumnDef = {
      key: "statusIcons",
      label: "Status",
      widthClassName: "w-20",
    };
    const v = sortValueForReportColumn(col, {
      id: "1",
      deviceStatus: "paired",
      keyStatus: "unpaired",
      batteryStatus: "low",
    });
    expect(v).toBe("paired|unpaired|low");
  });
});
