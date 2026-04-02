"use client";

import * as React from "react";

const THEME_STORAGE_KEY = "sm2-theme";
const DARK_CLASS_NAME = "dark";

type AppTheme = "light" | "dark";

interface AppThemeContextValue {
  theme: AppTheme;
  resolvedTheme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const AppThemeContext = React.createContext<AppThemeContextValue | null>(null);

function readStoredTheme(): AppTheme | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return raw === "light" || raw === "dark" ? raw : undefined;
  } catch {
    return undefined;
  }
}

function applyThemeToDocument(theme: AppTheme) {
  const root = document.documentElement;
  root.classList.toggle(DARK_CLASS_NAME, theme === "dark");
  root.style.colorScheme = theme;
}

export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = React.useState<AppTheme>(
    () => readStoredTheme() ?? "dark",
  );

  React.useLayoutEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore persistence failures */
    }
  }, [theme]);

  React.useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) {
        return;
      }
      const nextTheme =
        event.newValue === "light" || event.newValue === "dark"
          ? event.newValue
          : "dark";
      setThemeState(nextTheme);
      applyThemeToDocument(nextTheme);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setTheme = React.useCallback((nextTheme: AppTheme) => {
    setThemeState(nextTheme);
  }, []);

  const value = React.useMemo<AppThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: theme,
      setTheme,
    }),
    [theme, setTheme],
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useTheme(): AppThemeContextValue {
  const context = React.useContext(AppThemeContext);

  if (context == null) {
    throw new Error("useTheme must be used within AppThemeProvider");
  }

  return context;
}

export { THEME_STORAGE_KEY, type AppTheme };
