"use client";

import * as React from "react";

import {
  DEFAULT_GROOVED_PANEL_DARK_APPEARANCE,
  mergeGroovedPanelDarkAppearance,
  type GroovedPanelDarkAppearance,
} from "@/lib/grooved-panel-dark-appearance";

/** Persisted in `localStorage` — remove this feature when values are merged into code defaults. */
export const GROOVED_PANEL_DARK_APPEARANCE_TWEAK_STORAGE_KEY =
  "toolbox-grooved-dark-appearance-tweak";

function readStoredPartial(): Partial<GroovedPanelDarkAppearance> {
  if (typeof window === "undefined") {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(
      GROOVED_PANEL_DARK_APPEARANCE_TWEAK_STORAGE_KEY,
    );
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as Partial<GroovedPanelDarkAppearance>;
  } catch {
    return {};
  }
}

function writeStoredPartial(partial: Partial<GroovedPanelDarkAppearance>) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (Object.keys(partial).length === 0) {
      window.localStorage.removeItem(GROOVED_PANEL_DARK_APPEARANCE_TWEAK_STORAGE_KEY);
    } else {
      window.localStorage.setItem(
        GROOVED_PANEL_DARK_APPEARANCE_TWEAK_STORAGE_KEY,
        JSON.stringify(partial),
      );
    }
  } catch {
    // ignore quota / private mode
  }
}

interface GroovedPanelDarkAppearanceTweakContextValue {
  /** Effective dark groove profile (defaults + persisted tweaks). */
  merged: GroovedPanelDarkAppearance;
  /** Only overridden fields; use for “reset one field” if needed later. */
  partial: Partial<GroovedPanelDarkAppearance>;
  updateField: <K extends keyof GroovedPanelDarkAppearance>(
    key: K,
    value: GroovedPanelDarkAppearance[K],
  ) => void;
  reset: () => void;
}

const GroovedPanelDarkAppearanceTweakContext =
  React.createContext<GroovedPanelDarkAppearanceTweakContextValue | null>(null);

export function GroovedPanelDarkAppearanceTweakProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [partial, setPartial] = React.useState<Partial<GroovedPanelDarkAppearance>>(
    {},
  );

  React.useLayoutEffect(() => {
    setPartial(readStoredPartial());
  }, []);

  const merged = React.useMemo(
    () =>
      mergeGroovedPanelDarkAppearance(
        partial,
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE,
      ),
    [partial],
  );

  const updateField = React.useCallback(
    <K extends keyof GroovedPanelDarkAppearance>(
      key: K,
      value: GroovedPanelDarkAppearance[K],
    ) => {
      setPartial((prev) => {
        const next = { ...prev, [key]: value };
        writeStoredPartial(next);
        return next;
      });
    },
    [],
  );

  const reset = React.useCallback(() => {
    writeStoredPartial({});
    setPartial({});
  }, []);

  const value = React.useMemo(
    () => ({ merged, partial, updateField, reset }),
    [merged, partial, updateField, reset],
  );

  return (
    <GroovedPanelDarkAppearanceTweakContext.Provider value={value}>
      {children}
    </GroovedPanelDarkAppearanceTweakContext.Provider>
  );
}

export function useGroovedPanelDarkAppearanceEffective(): GroovedPanelDarkAppearance {
  const ctx = React.useContext(GroovedPanelDarkAppearanceTweakContext);
  if (!ctx) {
    return DEFAULT_GROOVED_PANEL_DARK_APPEARANCE;
  }
  return ctx.merged;
}

export function useGroovedPanelDarkAppearanceTweakControls():
  | GroovedPanelDarkAppearanceTweakContextValue
  | null {
  return React.useContext(GroovedPanelDarkAppearanceTweakContext);
}
