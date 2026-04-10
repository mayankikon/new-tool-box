"use client";

import { appLineFieldPattern } from "@/components/chrome/app-line-field-dial-preset";
import { LineFieldPatternLayers } from "@/components/chrome/line-field-pattern-layers";
import { useAppShellDarkAppearance } from "@/components/chrome/use-app-shell-dark-appearance";

/**
 * Horizontal line field for the **app sidebar only** (main column stays flat `neutral-50`).
 * Dark shell matches sidebar chrome during hydration (same idea as the former main-column grooved path).
 */
export function SidebarLineFieldPattern() {
  const isDarkAppearance = useAppShellDarkAppearance();

  return (
    <LineFieldPatternLayers
      pattern={appLineFieldPattern}
      forceDarkAppearance={isDarkAppearance}
    />
  );
}
