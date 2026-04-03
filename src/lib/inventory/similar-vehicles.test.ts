import { describe, expect, it } from "vitest";

import type { InventoryVehicleRecord } from "@/lib/inventory/vehicle-list-data";

import {
  extractExteriorColorFromImageAlt,
  formatSimilarVehiclesHeader,
  formatSimilarVehiclesListTitle,
  listSimilarVehicles,
} from "./similar-vehicles";

const sample: InventoryVehicleRecord = {
  title: "2024 Chevrolet Silverado 1500 LT Trail Boss",
  vin: "ANCHORVIN00000001",
  stockNumber: "000001",
  make: "Chevrolet",
  model: "Silverado 1500",
  trim: "LT Trail Boss",
  lotAge: "1 day",
  stockType: "New",
  geofence: "Front Line",
  imageSrc: "https://example.com/a.png",
  imageAlt: "2024 Chevrolet Silverado 1500 LT Trail Boss in Radiant Red Tintcoat",
  mileage: "24,000 miles",
  price: "$50,000",
};

describe("extractExteriorColorFromImageAlt", () => {
  it("reads color after ' in '", () => {
    expect(extractExteriorColorFromImageAlt("Truck in Summit White")).toBe("Summit White");
  });

  it("returns em dash when no pattern matches", () => {
    expect(extractExteriorColorFromImageAlt("No color here")).toBe("—");
  });
});

describe("formatSimilarVehiclesHeader", () => {
  it("includes make, model, trim, and parsed color", () => {
    expect(formatSimilarVehiclesHeader(sample)).toBe(
      "Similar to: Chevrolet Silverado 1500 LT Trail Boss (Radiant Red Tintcoat)",
    );
  });
});

describe("formatSimilarVehiclesListTitle", () => {
  it("uses the anchor vehicle VIN for a single-line title", () => {
    expect(formatSimilarVehiclesListTitle(sample)).toBe(
      "Similar to ANCHORVIN00000001",
    );
  });
});

describe("listSimilarVehicles", () => {
  it("excludes the anchor vehicle", () => {
    const pool: InventoryVehicleRecord[] = [sample, { ...sample, vin: "OTHER00002" }];
    const result = listSimilarVehicles(sample, pool, 10);
    expect(result.every((v) => v.vin !== sample.vin)).toBe(true);
  });

  it("returns empty when pool is only the anchor", () => {
    expect(listSimilarVehicles(sample, [sample], 5)).toEqual([]);
  });
});
