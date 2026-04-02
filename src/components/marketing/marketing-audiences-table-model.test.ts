import { describe, expect, it } from "vitest";

import {
  campaignsLabel,
  compareMarketingAudienceValues,
  filterMarketingAudienceRows,
  MARKETING_AUDIENCE_ROWS,
  MARKETING_AUDIENCE_TAB_VALUES,
  serializeMarketingAudienceRowsToCsv,
  vehicleLabel,
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

  it("filters by vehicle label in search query", () => {
    const rows = filterMarketingAudienceRows(
      MARKETING_AUDIENCE_ROWS,
      "all-services",
      "Toyota",
    );
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(vehicleLabel(row).toLowerCase()).toContain("toyota");
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
    expect(copy[0]?.vehicleStatus).toBe("due");
  });

  it("sorts campaigns by count ascending", () => {
    const copy = [...MARKETING_AUDIENCE_ROWS];
    copy.sort((left, right) =>
      compareMarketingAudienceValues(left, right, "campaigns", "asc"),
    );
    expect(copy[0]?.campaigns.length).toBeLessThanOrEqual(
      copy[copy.length - 1]?.campaigns.length ?? 0,
    );
  });
});

describe("vehicleLabel", () => {
  it("formats year make model", () => {
    const row = MARKETING_AUDIENCE_ROWS[0];
    expect(vehicleLabel(row)).toBe("2022 Toyota Camry");
  });
});

describe("campaignsLabel", () => {
  it("returns em-dash for empty campaigns", () => {
    expect(campaignsLabel([])).toBe("\u2014");
  });

  it("returns the name for a single campaign", () => {
    expect(campaignsLabel(["Spring Service Special"])).toBe(
      "Spring Service Special",
    );
  });

  it("returns first name plus overflow count for multiple campaigns", () => {
    expect(campaignsLabel(["A", "B", "C"])).toBe("A +2");
  });
});

describe("serializeMarketingAudienceRowsToCsv", () => {
  it("returns CSV with expected headers and escaped cells", () => {
    const csv = serializeMarketingAudienceRowsToCsv([
      {
        id: "test-1",
        customerName: 'Jane "JJ" Doe',
        vehicleYear: 2023,
        vehicleMake: "Ford",
        vehicleModel: "Escape",
        vehicleStatus: "open-recall",
        campaigns: ["Recall Awareness", "Safety Check"],
        recallUrgency: "urgent",
      },
    ]);
    const lines = csv.split("\n");

    expect(lines[0]).toBe(
      "Customer Name,Vehicle,Status,Campaigns,Miles Until Service,Defected To,Recall Urgency,Date Transferred,Relocated To",
    );
    expect(lines[1]).toContain('"Jane ""JJ"" Doe"');
    expect(lines[1]).toContain('"2023 Ford Escape"');
    expect(lines[1]).toContain('"Open Recall"');
    expect(lines[1]).toContain('"Recall Awareness; Safety Check"');
    expect(lines[1]).toContain('"urgent"');
  });
});
