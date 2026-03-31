import {
  VEHICLE_MAKES,
  VEHICLE_MODELS_BY_MAKE,
  type VehicleModel,
} from "./vehicle-data";

export interface CatalogVehiclePick {
  make: string;
  model: string;
  imageUrl: string;
}

/** Random side-view image from generated `vehicle-data` (Evox / catalog URLs). */
export function pickRandomVehicleFromCatalog(): CatalogVehiclePick {
  for (let attempt = 0; attempt < 24; attempt++) {
    const makes = [...VEHICLE_MAKES];
    const make = makes[Math.floor(Math.random() * makes.length)] ?? "Toyota";
    const models: VehicleModel[] = VEHICLE_MODELS_BY_MAKE[make] ?? [];
    const withImage = models.filter((m) => m.imageUrl?.trim());
    const pool = withImage.length > 0 ? withImage : models;
    const row = pool[Math.floor(Math.random() * pool.length)];
    if (row?.imageUrl?.trim()) {
      return { make, model: row.model, imageUrl: row.imageUrl };
    }
  }
  const fallback =
    VEHICLE_MODELS_BY_MAKE.Toyota?.find((m) => m.imageUrl?.trim()) ??
    VEHICLE_MODELS_BY_MAKE.BMW?.find((m) => m.imageUrl?.trim());
  return {
    make: "Toyota",
    model: fallback?.model ?? "RAV4",
    imageUrl: fallback?.imageUrl ?? "",
  };
}
