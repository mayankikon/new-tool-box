import { describe, expect, it } from "vitest";

import {
  extractEvoxVehicleAssetIdFromSideImageUrl,
  listVehicleImageryRows,
} from "./vehicle-imagery-catalog";

describe("extractEvoxVehicleAssetIdFromSideImageUrl", () => {
  it("returns asset id from a standard Evox side URL", () => {
    expect(
      extractEvoxVehicleAssetIdFromSideImageUrl(
        "https://d2ivfcfbdvj3sm.cloudfront.net/WYKrPUINmOgISvWd/54064/color_0640_001_png/MY2024/54064/54064_cc0640_001_GNT.png?c=426&p=37&s=x",
      ),
    ).toBe("54064");
  });

  it("returns null for empty or non-matching URLs", () => {
    expect(extractEvoxVehicleAssetIdFromSideImageUrl("")).toBeNull();
    expect(extractEvoxVehicleAssetIdFromSideImageUrl("https://example.com/nope")).toBeNull();
  });
});

describe("listVehicleImageryRows", () => {
  it("returns at least one row per make and includes side URLs for known models", () => {
    const rows = listVehicleImageryRows();
    expect(rows.length).toBeGreaterThan(0);
    const silverado = rows.find((r) => r.model === "Silverado 1500" && r.make === "Chevrolet");
    expect(silverado?.colorVariants[0]?.sideImageUrl).toContain("color_0640_001_png");
  });

  it("uses multiple inventory colors for Chevrolet Silverado 1500", () => {
    const rows = listVehicleImageryRows();
    const silverado = rows.find((r) => r.model === "Silverado 1500" && r.make === "Chevrolet");
    expect(silverado?.colorVariants.length).toBeGreaterThan(1);
    for (const v of silverado?.colorVariants ?? []) {
      expect(v.slantedImageUrl).toBeTruthy();
    }
  });

  it("includes BMW catalog rows with a single default color variant", () => {
    const rows = listVehicleImageryRows();
    const bmw = rows.find((r) => r.model === "3 Series" && r.make === "BMW");
    expect(bmw?.colorVariants.length).toBe(1);
  });
});
