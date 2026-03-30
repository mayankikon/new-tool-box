"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";

const THEME_STORAGE_KEY = "sm2-theme";

export function AppThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      enableColorScheme
      storageKey={THEME_STORAGE_KEY}
    >
      {children}
    </ThemeProvider>
  );
}

export { THEME_STORAGE_KEY };
