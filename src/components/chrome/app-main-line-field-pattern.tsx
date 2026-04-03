"use client";

import { appLineFieldPattern } from "@/components/chrome/app-line-field-dial-preset";
import { LineFieldPatternLayers } from "@/components/chrome/line-field-pattern-layers";
import { useGroovedPanelPreference } from "@/components/chrome/grooved-panel-preference";
import { useAppShellDarkAppearance } from "@/components/chrome/use-app-shell-dark-appearance";

/**
 * Full-bleed line field for the main column (below `AvatarBar`).
 * Mount once per main shell; page content sits in a sibling with higher z-index.
 */
export function AppMainLineFieldPattern() {
  const { groovedPanelEnabled } = useGroovedPanelPreference();
  const isDarkAppearance = useAppShellDarkAppearance();

  return (
    <LineFieldPatternLayers
      pattern={appLineFieldPattern}
      forceDarkAppearance={groovedPanelEnabled && isDarkAppearance}
    />
  );
}
