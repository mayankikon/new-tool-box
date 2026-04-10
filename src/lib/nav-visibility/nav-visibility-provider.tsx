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
  loadNavVisibility,
  saveNavVisibility,
  getHiddenLabels as getHidden,
  NAV_VISIBILITY_CHANGED_EVENT,
  type NavVisibilityData,
} from "@/lib/nav-visibility/nav-visibility-storage";

interface NavVisibilityContextValue {
  isItemHidden: (productId: string, label: string) => boolean;
  getHiddenLabels: (productId: string) => string[];
  setHiddenLabels: (productId: string, labels: string[]) => void;
}

const NavVisibilityContext = createContext<NavVisibilityContextValue | null>(
  null,
);

const EMPTY_NAV_VISIBILITY: NavVisibilityData = { hiddenItems: {} };

export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<NavVisibilityData>(EMPTY_NAV_VISIBILITY);

  const refresh = useCallback(() => setData(loadNavVisibility()), []);

  useEffect(() => {
    setData(loadNavVisibility());

    window.addEventListener(NAV_VISIBILITY_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(NAV_VISIBILITY_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  const isItemHidden = useCallback(
    (productId: string, label: string) =>
      getHidden(data, productId).includes(label),
    [data],
  );

  const getHiddenLabels = useCallback(
    (productId: string) => getHidden(data, productId),
    [data],
  );

  const setHiddenLabels = useCallback(
    (productId: string, labels: string[]) => {
      const next: NavVisibilityData = {
        hiddenItems: { ...data.hiddenItems, [productId]: labels },
      };
      saveNavVisibility(next);
      setData(next);
    },
    [data],
  );

  const value = useMemo<NavVisibilityContextValue>(
    () => ({ isItemHidden, getHiddenLabels, setHiddenLabels }),
    [isItemHidden, getHiddenLabels, setHiddenLabels],
  );

  return (
    <NavVisibilityContext.Provider value={value}>
      {children}
    </NavVisibilityContext.Provider>
  );
}

export function useNavVisibility(): NavVisibilityContextValue {
  const ctx = useContext(NavVisibilityContext);
  if (!ctx) {
    throw new Error(
      "useNavVisibility must be used within NavVisibilityProvider",
    );
  }
  return ctx;
}
