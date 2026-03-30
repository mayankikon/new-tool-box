import { pickRandomVehicleFromCatalog } from "./vehicle-catalog-sample";
import { VEHICLE_MODELS_BY_MAKE } from "./vehicle-data";

const STORAGE_KEY = "sm-dealership-branding-v1";

/** Matches sidebar “BMW” style placeholder until the user uploads a logo. */
export const DEFAULT_DEALERSHIP_LOGO_SRC = "/account-logo-placeholder.png";

export const BRANDING_CHANGED_EVENT = "sm-dealership-branding-changed";

export interface DealershipBranding {
  dealershipLogoUrl: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleImageUrl: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function withDefaults(partial: Partial<DealershipBranding>): DealershipBranding {
  const vehicle = pickRandomVehicleFromCatalog();
  return {
    dealershipLogoUrl: partial.dealershipLogoUrl ?? DEFAULT_DEALERSHIP_LOGO_SRC,
    vehicleMake: partial.vehicleMake ?? vehicle.make,
    vehicleModel: partial.vehicleModel ?? vehicle.model,
    vehicleImageUrl: partial.vehicleImageUrl ?? vehicle.imageUrl,
  };
}

/** Deterministic defaults for SSR (no random vehicle, no localStorage). */
function staticServerBranding(): DealershipBranding {
  const toyota =
    VEHICLE_MODELS_BY_MAKE.Toyota?.find((m) => m.imageUrl?.trim()) ??
    VEHICLE_MODELS_BY_MAKE.BMW?.find((m) => m.imageUrl?.trim());
  return {
    dealershipLogoUrl: DEFAULT_DEALERSHIP_LOGO_SRC,
    vehicleMake: "Toyota",
    vehicleModel: toyota?.model ?? "RAV4",
    vehicleImageUrl: toyota?.imageUrl ?? "",
  };
}

export function loadDealershipBranding(): DealershipBranding {
  if (!isBrowser()) {
    return staticServerBranding();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = withDefaults({});
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<DealershipBranding>;
    if (
      typeof parsed.dealershipLogoUrl === "string" &&
      typeof parsed.vehicleMake === "string" &&
      typeof parsed.vehicleModel === "string" &&
      typeof parsed.vehicleImageUrl === "string"
    ) {
      return parsed as DealershipBranding;
    }
  } catch {
    /* ignore */
  }
  const initial = withDefaults({});
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch {
    /* ignore */
  }
  return initial;
}

export function saveDealershipBranding(next: DealershipBranding): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(BRANDING_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function reshuffleCatalogVehicle(): DealershipBranding {
  const current = loadDealershipBranding();
  const v = pickRandomVehicleFromCatalog();
  const next: DealershipBranding = {
    ...current,
    vehicleMake: v.make,
    vehicleModel: v.model,
    vehicleImageUrl: v.imageUrl,
  };
  saveDealershipBranding(next);
  return next;
}

export function resetDealershipLogoToDefault(): DealershipBranding {
  const current = loadDealershipBranding();
  const next = { ...current, dealershipLogoUrl: DEFAULT_DEALERSHIP_LOGO_SRC };
  saveDealershipBranding(next);
  return next;
}
