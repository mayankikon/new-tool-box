import { INVENTORY_FRONT_IMAGE_SRC_BY_VIN } from "../inventory/inventory-front-image-data";
import { INVENTORY_PANEL_VEHICLES } from "../inventory/vehicle-list-data";

export interface InventoryDerivedColorVariant {
  label: string;
  trim: string;
  sideImageUrl: string;
  slantedImageUrl: string | null;
}

/** Parses Evox-style alt text: "2024 … in Radiant Red Tintcoat" → "Radiant Red Tintcoat". */
export function extractExteriorColorLabelFromImageAlt(imageAlt: string): string {
  const match = imageAlt.match(/\s+in\s+(.+)$/i);
  return match?.[1]?.trim() ?? imageAlt.trim();
}

/**
 * Groups mock inventory vehicles by make + model and builds color variants with
 * signed side + 3/4 URLs (VIN → front image map).
 */
export function buildInventoryColorVariantsByMakeModel(): Map<string, InventoryDerivedColorVariant[]> {
  const groups = new Map<string, (typeof INVENTORY_PANEL_VEHICLES)[number][]>();
  for (const row of INVENTORY_PANEL_VEHICLES) {
    const key = `${row.make}|${row.model}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(row);
  }

  const out = new Map<string, InventoryDerivedColorVariant[]>();

  for (const [key, rows] of groups) {
    const variants: InventoryDerivedColorVariant[] = [];
    const seenSideUrl = new Set<string>();
    for (const row of rows) {
      if (seenSideUrl.has(row.imageSrc)) {
        continue;
      }
      seenSideUrl.add(row.imageSrc);
      const slanted = INVENTORY_FRONT_IMAGE_SRC_BY_VIN[row.vin] ?? null;
      variants.push({
        label: extractExteriorColorLabelFromImageAlt(row.imageAlt),
        trim: row.trim,
        sideImageUrl: row.imageSrc,
        slantedImageUrl: slanted,
      });
    }
    out.set(key, variants);
  }

  return out;
}
