import { describe, expect, it } from "vitest";

import {
  compareMarketingAudienceValues,
  filterMarketingAudienceRows,
  MARKETING_AUDIENCE_ROWS,
  MARKETING_AUDIENCE_TAB_VALUES,
  serializeMarketingAudienceRowsToCsv,
} from "./marketing-audiences-table-model";

describe("MARKETING_AUDIENCE_TAB_FILTER", () => {
  it("returns all rows for the all-services tab", () => {
    const rows = filterMarketingAudienceRows(
      MARKETING_AUDIENCE_ROWS,
      "all-services",
      "",
    );
    expect(rows).toHaveLength(MARKETING_AUDIENCE_ROWS.length);
  });

  it("returns records for each status tab", () => {
    const serviceTabs = MARKETING_AUDIENCE_TAB_VALUES.filter(
      (tab) => tab !== "all-services",
    );

    serviceTabs.forEach((tab) => {
      const rows = filterMarketingAudienceRows(MARKETING_AUDIENCE_ROWS, tab, "");
      expect(rows.length).toBeGreaterThan(0);
      rows.forEach((row) => {
        expect(row.vehicleStatus).toBe(tab);
      });
    });
  });
});

describe("compareMarketingAudienceValues", () => {
  it("sorts names ascending", () => {
    const copy = [...MARKETING_AUDIENCE_ROWS];
    copy.sort((left, right) =>
      compareMarketingAudienceValues(left, right, "customerName", "asc"),
    );
    expect(copy[0]?.customerName).toBe("Amelia White");
  });

  it("sorts vehicle status descending by status label", () => {
    const copy = [...MARKETING_AUDIENCE_ROWS];
    copy.sort((left, right) =>
      compareMarketingAudienceValues(left, right, "vehicleStatus", "desc"),
    );
    expect(copy[0]?.vehicleStatus).toBe("ownership-change");
  });

  it("sorts retention score descending", () => {
    const copy = [...MARKETING_AUDIENCE_ROWS];
    copy.sort((left, right) =>
      compareMarketingAudienceValues(left, right, "retentionScore", "desc"),
    );
    expect(copy[0]?.retentionScore).toBe(92);
  });
});

describe("serializeMarketingAudienceRowsToCsv", () => {
  it("returns CSV with requested headers and escaped cells", () => {
    const csv = serializeMarketingAudienceRowsToCsv([
      {
        id: "test-1",
        customerName: 'Jane "JJ" Doe',
        vehicleStatus: "open-recall",
        retentionScore: 50,
      },
    ]);
    const lines = csv.split("\n");

    expect(lines[0]).toBe("Customer Name,Vehicle Status,Retention Score");
    expect(lines[1]).toContain('"Jane ""JJ"" Doe"');
    expect(lines[1]).toContain('"Open Recall"');
    expect(lines[1]).toContain('"50"');
  });
});
