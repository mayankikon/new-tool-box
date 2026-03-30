"use client";

import * as React from "react";

const LEGACY_ENABLED_KEY = "toolbox-grooved-panel-enabled";
const STORAGE_KEY = "toolbox-grooved-panel";

interface GroovedPanelStoredPayload {
  enabled?: boolean;
}

interface GroovedPanelPreferenceContextValue {
  groovedPanelEnabled: boolean;
  setGroovedPanelEnabled: (value: boolean) => void;
}

const GroovedPanelPreferenceContext =
  React.createContext<GroovedPanelPreferenceContextValue | null>(null);

/** Older payloads included `darkAppearance`; we only persist `enabled` — metal is code defaults. */
function readStored(): { enabled: boolean } {
  if (typeof window === "undefined") {
    return { enabled: true };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GroovedPanelStoredPayload;
      return {
        enabled: parsed.enabled !== false,
      };
    }
    const legacy = window.localStorage.getItem(LEGACY_ENABLED_KEY);
    return {
      enabled: legacy !== "false",
    };
  } catch {
    return { enabled: true };
  }
}

function writeStored(enabled: boolean) {
  try {
    const payload: GroovedPanelStoredPayload = { enabled };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

export function GroovedPanelPreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [groovedPanelEnabled, setGroovedPanelEnabledState] =
    React.useState(true);
  const [hydrated, setHydrated] = React.useState(false);

  React.useLayoutEffect(() => {
    const { enabled } = readStored();
    setGroovedPanelEnabledState(enabled);
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    writeStored(groovedPanelEnabled);
  }, [hydrated, groovedPanelEnabled]);

  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || event.newValue == null) return;
      try {
        const parsed = JSON.parse(event.newValue) as GroovedPanelStoredPayload;
        setGroovedPanelEnabledState(parsed.enabled !== false);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setGroovedPanelEnabled = React.useCallback((value: boolean) => {
    setGroovedPanelEnabledState(value);
  }, []);

  const value = React.useMemo(
    () => ({
      groovedPanelEnabled,
      setGroovedPanelEnabled,
    }),
    [groovedPanelEnabled, setGroovedPanelEnabled],
  );

  return (
    <GroovedPanelPreferenceContext.Provider value={value}>
      {children}
    </GroovedPanelPreferenceContext.Provider>
  );
}

export function useGroovedPanelPreference(): GroovedPanelPreferenceContextValue {
  const ctx = React.useContext(GroovedPanelPreferenceContext);
  if (ctx == null) {
    throw new Error(
      "useGroovedPanelPreference must be used within GroovedPanelPreferenceProvider",
    );
  }
  return ctx;
}
