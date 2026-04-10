"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  BRAND_PROFILE_CHANGED_EVENT,
  loadBrandProfile,
  resolveBrandPalette,
  saveBrandProfile,
  staticServerProfile,
  updateBrandProfile,
} from "@/lib/branding/brand-profile-storage";
import type {
  DealerBrandProfile,
  ResolvedBrandPalette,
} from "@/lib/branding/brand-profile-types";

interface BrandProfileContextValue {
  profile: DealerBrandProfile;
  palette: ResolvedBrandPalette;
  setProfile: (next: DealerBrandProfile) => void;
  updateProfile: (patch: Partial<DealerBrandProfile>) => DealerBrandProfile;
  refresh: () => void;
}

const BrandProfileContext = createContext<BrandProfileContextValue | null>(
  null,
);

export function BrandProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<DealerBrandProfile>(
    staticServerProfile,
  );

  const refresh = useCallback(() => {
    setProfileState(loadBrandProfile());
  }, []);

  useEffect(() => {
    setProfileState(loadBrandProfile());

    const onChange = () => refresh();
    window.addEventListener(BRAND_PROFILE_CHANGED_EVENT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(BRAND_PROFILE_CHANGED_EVENT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const palette = useMemo(
    () => resolveBrandPalette(profile),
    [profile],
  );

  const setProfile = useCallback((next: DealerBrandProfile) => {
    saveBrandProfile(next);
    setProfileState(next);
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<DealerBrandProfile>) => {
      const next = updateBrandProfile(patch);
      setProfileState(next);
      return next;
    },
    [],
  );

  const value = useMemo<BrandProfileContextValue>(
    () => ({
      profile,
      palette,
      setProfile,
      updateProfile,
      refresh,
    }),
    [profile, palette, setProfile, updateProfile, refresh],
  );

  return (
    <BrandProfileContext.Provider value={value}>
      {children}
    </BrandProfileContext.Provider>
  );
}

export function useBrandProfile(): BrandProfileContextValue {
  const ctx = useContext(BrandProfileContext);
  if (!ctx) {
    throw new Error("useBrandProfile must be used within BrandProfileProvider");
  }
  return ctx;
}

/** Safe for components that may render outside the provider (e.g. tests). */
export function useBrandProfileOptional(): BrandProfileContextValue | null {
  return useContext(BrandProfileContext);
}
