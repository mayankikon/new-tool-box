"use client";

import * as React from "react";

import { DashPreviewCanvas } from "@/app/design-playground/components/dash-preview-canvas";
import { normalizeAppearanceForCanvas } from "@/lib/grooved-panel-dark-appearance";
import { useGroovedPanelDarkAppearanceEffective } from "@/components/chrome/grooved-panel-dark-appearance-tweak";
import {
  GROOVED_PANEL_DARK_BRUSH,
  GROOVED_PANEL_LIGHT_BRUSH,
} from "@/lib/grooved-panel-preset";

import { useGroovedPanelPreference } from "./grooved-panel-preference";
import { useAppShellDarkAppearance } from "./use-app-shell-dark-appearance";
import { cn } from "@/lib/utils";

interface AppGroovedMainColumnProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main column (right of sidebar): when grooved panel is enabled, surface + groove follow
 * **Appearance** — light groove (`whiteGroove`) in light mode, dark brushed metal in dark mode.
 */
export function AppGroovedMainColumn({
  children,
  className,
}: AppGroovedMainColumnProps) {
  const { groovedPanelEnabled } = useGroovedPanelPreference();
  const isDarkAppearance = useAppShellDarkAppearance();
  const darkAppearance = useGroovedPanelDarkAppearanceEffective();

  const darkGrooveBrush = React.useMemo(() => {
    const paint = normalizeAppearanceForCanvas(darkAppearance);
    return {
      ...GROOVED_PANEL_DARK_BRUSH,
      grooveIntensity: paint.brushGrooveIntensity,
      baseGradientDepth: paint.brushBaseGradientDepth,
      darkBrushedAppearance: paint,
    };
  }, [darkAppearance]);

  if (!groovedPanelEnabled) {
    return (
      <div className={cn("flex min-w-0 flex-1 flex-col", className)}>
        {children}
      </div>
    );
  }

  return (
    <DashPreviewCanvas
      surface={isDarkAppearance ? "dark" : "light"}
      toneChildTypography={false}
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col !rounded-none !border-0 !p-0 shadow-none",
        className,
      )}
      innerClassName="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col gap-0 items-stretch"
      brush={
        isDarkAppearance ? darkGrooveBrush : { ...GROOVED_PANEL_LIGHT_BRUSH }
      }
    >
      {children}
    </DashPreviewCanvas>
  );
}
