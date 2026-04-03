/**
 * Legacy compatibility layer for coupon builder — maps to Dealer Brand Profile.
 * Prefer `useBrandProfile()` / `@/lib/branding` for new code.
 */

import {
  loadBrandProfile,
  updateBrandProfile,
} from "@/lib/branding/brand-profile-storage";
import { DEFAULT_DEALERSHIP_LOGO_SRC } from "@/lib/branding/brand-profile-types";
import { pickRandomVehicleFromCatalog } from "./vehicle-catalog-sample";

export const BRANDING_CHANGED_EVENT = "sm-dealership-branding-changed";

export interface DealershipBranding {
  dealershipLogoUrl: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleImageUrl: string;
}

function profileToLegacy(): DealershipBranding {
  const p = loadBrandProfile();
  return {
    dealershipLogoUrl: p.logoUrl,
    vehicleMake: p.vehicleMake,
    vehicleModel: p.vehicleModel,
    vehicleImageUrl: p.vehicleImageUrl,
  };
}

export function loadDealershipBranding(): DealershipBranding {
  return profileToLegacy();
}

export function saveDealershipBranding(next: DealershipBranding): void {
  updateBrandProfile({
    logoUrl: next.dealershipLogoUrl,
    vehicleMake: next.vehicleMake,
    vehicleModel: next.vehicleModel,
    vehicleImageUrl: next.vehicleImageUrl,
  });
}

export function reshuffleCatalogVehicle(): DealershipBranding {
  const v = pickRandomVehicleFromCatalog();
  updateBrandProfile({
    vehicleMake: v.make,
    vehicleModel: v.model,
    vehicleImageUrl: v.imageUrl,
  });
  return profileToLegacy();
}

export function resetDealershipLogoToDefault(): DealershipBranding {
  updateBrandProfile({ logoUrl: DEFAULT_DEALERSHIP_LOGO_SRC });
  return profileToLegacy();
}
