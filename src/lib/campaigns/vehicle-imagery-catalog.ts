import { INVENTORY_FRONT_IMAGE_SRC_BY_VIN } from "../inventory/inventory-front-image-data";

import { buildInventoryColorVariantsByMakeModel } from "./inventory-vehicle-imagery-variants";
import { VEHICLE_MAKES, VEHICLE_MODELS_BY_MAKE, type VehicleModel } from "./vehicle-data";

/** Evox vehicle asset id embedded in CloudFront paths, e.g. `/54064/color_0640_001_png/`. */
const EVOX_ASSET_ID_IN_SIDE_PATH = /\/(\d+)\/color_0640_001_png\//;

/** Same id in 3/4 (032) inventory URLs (hash differs from side URL). */
const EVOX_ASSET_ID_IN_SLANTED_PATH = /\/(\d+)\/color_0640_032_png\//;

const EVOX_COLOR_SUFFIX_IN_FILENAME = /_cc0640_001_([^.]+)\.png/;

const inventoryVariantsByMakeModel = buildInventoryColorVariantsByMakeModel();

function buildSlantedUrlByAssetId(): Map<string, string> {
  const map = new Map<string, string>();
  for (const url of Object.values(INVENTORY_FRONT_IMAGE_SRC_BY_VIN)) {
    const match = url.match(EVOX_ASSET_ID_IN_SLANTED_PATH);
    if (match?.[1]) {
      map.set(match[1], url);
    }
  }
  return map;
}

/** Slanted URLs keyed by Evox asset id (signed 032 URLs from inventory feed). */
const slantedUrlByAssetId = buildSlantedUrlByAssetId();

export interface VehicleImageryColorVariant {
  label: string;
  trim: string;
  sideImageUrl: string;
  slantedImageUrl: string | null;
}

export interface VehicleImageryRow {
  make: string;
  model: string;
  colorVariants: VehicleImageryColorVariant[];
}

export function extractEvoxVehicleAssetIdFromSideImageUrl(url: string): string | null {
  const match = url.match(EVOX_ASSET_ID_IN_SIDE_PATH);
  return match?.[1] ?? null;
}

function extractColorLabelFromSideFilename(url: string): string {
  const match = url.match(EVOX_COLOR_SUFFIX_IN_FILENAME);
  return match?.[1] ?? "Default";
}

function resolveSlantedForCatalogModel(model: VehicleModel): string | null {
  if (model.slantedImageUrl) {
    return model.slantedImageUrl;
  }
  const id = extractEvoxVehicleAssetIdFromSideImageUrl(model.imageUrl);
  if (!id) {
    return null;
  }
  return slantedUrlByAssetId.get(id) ?? null;
}

function buildCatalogOnlyVariant(model: VehicleModel): VehicleImageryColorVariant {
  const trim = model.trim?.trim() ? model.trim : "—";
  return {
    label: extractColorLabelFromSideFilename(model.imageUrl),
    trim,
    sideImageUrl: model.imageUrl,
    slantedImageUrl: resolveSlantedForCatalogModel(model),
  };
}

function mergeManualColorVariants(model: VehicleModel): VehicleImageryColorVariant[] {
  if (!model.colorVariants?.length) {
    return [];
  }
  const trim = model.trim?.trim() ? model.trim : "—";
  return model.colorVariants.map((v) => ({
    label: v.label,
    trim: v.trim ?? trim,
    sideImageUrl: v.sideImageUrl,
    slantedImageUrl:
      v.slantedImageUrl ??
      resolveSlantedForCatalogModel({
        ...model,
        imageUrl: v.sideImageUrl,
        slantedImageUrl: undefined,
        colorVariants: undefined,
      }),
  }));
}

export function listVehicleImageryRows(): VehicleImageryRow[] {
  const rows: VehicleImageryRow[] = [];

  for (const make of VEHICLE_MAKES) {
    const models = VEHICLE_MODELS_BY_MAKE[make] ?? [];
    for (const model of models) {
      const key = `${make}|${model.model}`;

      let colorVariants: VehicleImageryColorVariant[];

      if (model.colorVariants?.length) {
        colorVariants = mergeManualColorVariants(model);
      } else if (inventoryVariantsByMakeModel.has(key)) {
        colorVariants = inventoryVariantsByMakeModel.get(key)!;
      } else {
        colorVariants = [buildCatalogOnlyVariant(model)];
      }

      rows.push({
        make,
        model: model.model,
        colorVariants,
      });
    }
  }

  return rows;
}
