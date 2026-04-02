import type { InventoryVehicleRecord } from "@/lib/inventory/vehicle-list-data";

/** Parses trailing "… in {Color}" from stock photo alt text. */
export function extractExteriorColorFromImageAlt(imageAlt: string): string {
  const trimmed = imageAlt.trim();
  const match = trimmed.match(/\s+in\s+(.+?)\s*$/i);
  return match ? match[1].trim() : "—";
}

/** User-facing title for the similar-vehicles list (e.g. Similar to: Ford F-150 XLT (White)). */
export function formatSimilarVehiclesHeader(vehicle: InventoryVehicleRecord): string {
  const color = extractExteriorColorFromImageAlt(vehicle.imageAlt ?? "");
  return `Similar to: ${vehicle.make} ${vehicle.model} ${vehicle.trim} (${color})`;
}

/** One-line title for the similar-vehicles panel: the anchor vehicle’s VIN (e.g. Similar to 3GCUDFED3RG445264). */
export function formatSimilarVehiclesListTitle(
  anchorVehicle: InventoryVehicleRecord,
): string {
  return `Similar to ${anchorVehicle.vin}`;
}

function parseMileageToNumber(mileage: string): number {
  const digits = mileage.replace(/[^0-9]/g, "");
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

function colorMatchScore(a: string, b: string): number {
  const al = a.toLowerCase();
  const bl = b.toLowerCase();
  if (al === "—" || bl === "—") return 0;
  if (al === bl) return 1;
  if (al.includes(bl) || bl.includes(al)) return 0.65;
  return 0;
}

interface ScoredVehicle {
  vehicle: InventoryVehicleRecord;
  score: number;
}

/**
 * Ranks other vehicles vs. an anchor: same make/model first, then trim, mileage proximity,
 * color similarity, and shared geofence (lot proximity).
 */
export function listSimilarVehicles(
  anchor: InventoryVehicleRecord,
  pool: readonly InventoryVehicleRecord[],
  limit: number,
): InventoryVehicleRecord[] {
  const anchorMiles = parseMileageToNumber(anchor.mileage);
  const anchorColor = extractExteriorColorFromImageAlt(anchor.imageAlt ?? "");

  const scored: ScoredVehicle[] = [];

  for (const vehicle of pool) {
    if (vehicle.vin === anchor.vin) continue;

    let score = 0;
    if (vehicle.make === anchor.make) score += 100;
    if (vehicle.model === anchor.model) score += 85;
    else if (vehicle.model.split(/\s+/)[0] === anchor.model.split(/\s+/)[0]) {
      score += 35;
    }

    if (vehicle.trim === anchor.trim) score += 45;
    else score += 12;

    const vm = parseMileageToNumber(vehicle.mileage);
    const mileDiff = Math.abs(vm - anchorMiles);
    score += Math.max(0, 28 - mileDiff / 2500);

    score +=
      colorMatchScore(
        anchorColor,
        extractExteriorColorFromImageAlt(vehicle.imageAlt ?? ""),
      ) * 26;

    if (vehicle.geofence === anchor.geofence) score += 18;

    scored.push({ vehicle, score });
  }

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, Math.max(0, limit)).map((entry) => entry.vehicle);
}
