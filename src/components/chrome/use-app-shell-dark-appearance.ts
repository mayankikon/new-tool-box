"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "@/components/theme/app-theme-provider";

function subscribeHtmlDarkClass(onStoreChange: () => void) {
  const root = document.documentElement;
  const observer = new MutationObserver(onStoreChange);
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshotHtmlHasDarkClass() {
  return document.documentElement.classList.contains("dark");
}

/** SSR / first paint: avoid assuming dark until client (matches next-themes). */
function getServerSnapshotHtmlHasDarkClass() {
  return false;
}

/**
 * True when the product shell should use dark semantic surfaces: `<html class="dark">`
 * or next-themes says dark. Used so the grooved main column and line field track
 * **Settings → General → Appearance** together.
 */
export function useAppShellDarkAppearance(): boolean {
  const { resolvedTheme, theme } = useTheme();
  const htmlHasDarkClass = useSyncExternalStore(
    subscribeHtmlDarkClass,
    getSnapshotHtmlHasDarkClass,
    getServerSnapshotHtmlHasDarkClass,
  );
  const themeSaysDark = (resolvedTheme ?? theme) === "dark";
  return htmlHasDarkClass || themeSaysDark;
}
