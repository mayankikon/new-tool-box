import { describe, expect, it } from "vitest";

import {
  extractExteriorColorLabelFromImageAlt,
  buildInventoryColorVariantsByMakeModel,
} from "./inventory-vehicle-imagery-variants";

describe("extractExteriorColorLabelFromImageAlt", () => {
  it("extracts paint name after 'in'", () => {
    expect(
      extractExteriorColorLabelFromImageAlt(
        "2024 Chevrolet Silverado 1500 LT Trail Boss in Radiant Red Tintcoat",
      ),
    ).toBe("Radiant Red Tintcoat");
  });
});

describe("buildInventoryColorVariantsByMakeModel", () => {
  it("produces multiple variants for Silverado 1500", () => {
    const map = buildInventoryColorVariantsByMakeModel();
    const variants = map.get("Chevrolet|Silverado 1500");
    expect(variants?.length).toBeGreaterThan(1);
  });
});
