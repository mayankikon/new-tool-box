/**
 * Playground nav mirrors design-system component slugs (design-system-nav-config).
 * Live retro areas: tabs (+ radio), table, toggle-switch, slider (+ progress-bar).
 */

import { designSystemNavConfig } from "@/app/design-system/design-system-nav-config";

/** Slugs that open a live playground (others show a queued stub). */
export const PLAYGROUND_LIVE_SLUGS = new Set([
  "tabs",
  "radio",
  "table",
  "toggle-switch",
  "slider",
  "progress-bar",
  "page-layout-chrome",
  "fluid-shell-pilot",
]);

/** Map nav slug → which showcase component to mount. */
export type PlaygroundShowcaseKey =
  | "tabs"
  | "table"
  | "toggle-switch"
  | "slider"
  | "page-layout-chrome"
  | "fluid-shell-pilot";

export function getShowcaseKeyForNavSlug(slug: string): PlaygroundShowcaseKey | null {
  if (slug === "tabs" || slug === "radio") return "tabs";
  if (slug === "table") return "table";
  if (slug === "toggle-switch") return "toggle-switch";
  if (slug === "slider" || slug === "progress-bar") return "slider";
  if (slug === "page-layout-chrome") return "page-layout-chrome";
  if (slug === "fluid-shell-pilot") return "fluid-shell-pilot";
  return null;
}

/** Optional element id to scroll into view after selecting this nav slug. */
export function getScrollTargetForNavSlug(slug: string): string | undefined {
  if (slug === "radio") return "playground-radio-segmented";
  if (slug === "progress-bar") return "playground-progress-bar";
  return undefined;
}

export interface PlaygroundNavComponentItem {
  slug: string;
  label: string;
  live: boolean;
}

export function getPlaygroundComponentNavItems(): PlaygroundNavComponentItem[] {
  return designSystemNavConfig.components.map(({ slug, label }) => ({
    slug,
    label,
    live: PLAYGROUND_LIVE_SLUGS.has(slug),
  }));
}

export interface PlaygroundNavPatternItem {
  slug: string;
  label: string;
  live: boolean;
}

export function getPlaygroundPatternNavItems(): PlaygroundNavPatternItem[] {
  return designSystemNavConfig.patterns.map(({ slug, label }) => ({
    slug,
    label,
    live: PLAYGROUND_LIVE_SLUGS.has(slug),
  }));
}
