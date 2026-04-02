import { describe, expect, it } from "vitest";

import {
  buildCouponStrategyFromRows,
  computeIntelligentCoupon,
} from "./coupon-strategy";
import type { AtlasAiCustomerPreviewRow } from "./types";

describe("computeIntelligentCoupon", () => {
  it("uses aggressive tier for low retention", () => {
    const r = computeIntelligentCoupon(25, 0);
    expect(r.tier).toBe("aggressive");
    expect(r.discountPercent).toBe(25);
  });

  it("shifts discount with aggressiveness preset (offset +2)", () => {
    const r = computeIntelligentCoupon(25, 2);
    expect(r.discountPercent).toBe(35);
  });

  it("maps intermediate offsets to conservative / balanced / aggressive presets", () => {
    expect(computeIntelligentCoupon(25, -1).discountPercent).toBe(
      computeIntelligentCoupon(25, -2).discountPercent,
    );
    expect(computeIntelligentCoupon(25, 1).discountPercent).toBe(
      computeIntelligentCoupon(25, 2).discountPercent,
    );
  });
});

describe("buildCouponStrategyFromRows", () => {
  it("aggregates tiers", () => {
    const rows: AtlasAiCustomerPreviewRow[] = [
      {
        id: "1",
        name: "A",
        vehicle: "2020 X",
        retentionScore: 20,
        priority: "high",
      },
      {
        id: "2",
        name: "B",
        vehicle: "2021 Y",
        retentionScore: 80,
        priority: "low",
      },
    ];
    const s = buildCouponStrategyFromRows(rows, 0);
    expect(s.totalCustomers).toBe(2);
    expect(s.estimatedWinBackRate).toMatch(/^\d+%$/);
  });
});
