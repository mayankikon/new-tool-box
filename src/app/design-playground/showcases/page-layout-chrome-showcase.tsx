"use client";

import * as React from "react";
import {
  Bell,
  BookUser,
  CreditCard,
  FileText,
  Home,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  Settings2,
  UserCog,
  Globe,
  type LucideIcon,
} from "lucide-react";

import { AvatarBar } from "@/components/app/avatar-bar";
import { AppMainLineFieldPattern } from "@/components/chrome/app-main-line-field-pattern";
import { BillingPage } from "@/components/billing/billing-page";
import {
  Sidebar,
  type SidebarNavSectionConfig,
  type SidebarProductConfig,
} from "@/components/ui/sidebar";
import { useGroovedPanelPreference } from "@/components/chrome/grooved-panel-preference";
import {
  DEFAULT_GROOVED_PANEL_DARK_APPEARANCE,
  normalizeAppearanceForCanvas,
} from "@/lib/grooved-panel-dark-appearance";
import {
  GROOVED_PANEL_DARK_BRUSH,
  GROOVED_PANEL_LIGHT_BRUSH,
} from "@/lib/grooved-panel-preset";
import { cn } from "@/lib/utils";

import { DashPreviewCanvas, type DashPreviewSurface } from "../components/dash-preview-canvas";
import { PlayAreaSection } from "../components/play-area-section";

const products: SidebarProductConfig[] = [
  { id: "inventory", label: "Inventory Management", icon: Package },
  { id: "marketing", label: "Smart Marketing", icon: Megaphone },
];

type NavItemDef =
  | { label: string; icon: LucideIcon }
  | { label: string; iconSrc: string };

const inventoryMainItems: NavItemDef[] = [
  { label: "Home", icon: Home },
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Customers", icon: BookUser },
  { label: "Billing", icon: CreditCard },
  { label: "Reports", icon: FileText },
  { label: "Staff", icon: UserCog },
];

const inventorySettingsItems: NavItemDef[] = [
  { label: "General", icon: Settings },
  { label: "Alerts", icon: Bell },
  { label: "Geofences", iconSrc: "/boundary.svg" },
  { label: "Configurations", icon: Settings2 },
  { label: "Integrations", icon: Globe },
];

function buildSections(
  items: NavItemDef[],
  activeLabel: string,
  title?: string,
): SidebarNavSectionConfig[] {
  return [
    {
      title,
      items: items.map((item) => ({
        ...item,
        isActive: item.label === activeLabel,
      })),
    },
  ];
}

function BillingInventoryShellPreview({
  billingPresentation = "designPlaygroundLight",
}: {
  billingPresentation?: "default" | "designPlaygroundLight";
} = {}) {
  const noop = React.useCallback(() => {}, []);

  const mainSections = React.useMemo(
    () => buildSections(inventoryMainItems, "Billing"),
    [],
  );
  const settingsSections = React.useMemo(
    () => buildSections(inventorySettingsItems, "General", "Settings"),
    [],
  );

  return (
    <div className="flex h-full min-h-0 bg-transparent font-sans text-foreground">
      <Sidebar
        products={products}
        activeProductId="inventory"
        onProductChange={noop}
        mainSections={mainSections}
        settingsSections={settingsSections}
        onNavItemClick={noop}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AvatarBar className="!bg-transparent border-b border-border/20 shadow-none" />
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <AppMainLineFieldPattern />
          <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <BillingPage presentation={billingPresentation} />
          </div>
        </main>
      </div>
    </div>
  );
}

const previewFrameClass =
  "h-[min(78vh,860px)] min-h-[480px] w-full overflow-hidden";

export function PageLayoutChromeShowcase() {
  const { groovedPanelEnabled, setGroovedPanelEnabled } =
    useGroovedPanelPreference();
  const [surface, setSurface] = React.useState<DashPreviewSurface>("light");

  const [grooveIntensity, setGrooveIntensity] = React.useState(
    GROOVED_PANEL_LIGHT_BRUSH.grooveIntensity,
  );
  const [groovePitchPx, setGroovePitchPx] = React.useState(
    GROOVED_PANEL_LIGHT_BRUSH.groovePitchPx,
  );
  const [grooveLineThicknessPx, setGrooveLineThicknessPx] = React.useState(
    GROOVED_PANEL_LIGHT_BRUSH.grooveLineThicknessPx ?? 2,
  );
  const [panelGradientTopHex, setPanelGradientTopHex] = React.useState(
    GROOVED_PANEL_LIGHT_BRUSH.panelGradientTopHex ?? "#fafafa",
  );
  const [panelGradientBottomHex, setPanelGradientBottomHex] = React.useState(
    GROOVED_PANEL_LIGHT_BRUSH.panelGradientBottomHex ?? "#f5f5f5",
  );

  React.useEffect(() => {
    const preset =
      surface === "dark" ? GROOVED_PANEL_DARK_BRUSH : GROOVED_PANEL_LIGHT_BRUSH;
    setGroovePitchPx(preset.groovePitchPx);
    setGrooveLineThicknessPx(preset.grooveLineThicknessPx ?? 2);
    if (surface === "light") {
      setGrooveIntensity(preset.grooveIntensity);
      const light = preset as typeof GROOVED_PANEL_LIGHT_BRUSH;
      setPanelGradientTopHex(
        light.panelGradientTopHex ?? GROOVED_PANEL_LIGHT_BRUSH.panelGradientTopHex,
      );
      setPanelGradientBottomHex(
        light.panelGradientBottomHex ??
          GROOVED_PANEL_LIGHT_BRUSH.panelGradientBottomHex,
      );
    }
  }, [surface]);

  const brush = React.useMemo(() => {
    const preset =
      surface === "dark" ? GROOVED_PANEL_DARK_BRUSH : GROOVED_PANEL_LIGHT_BRUSH;
    if (surface === "dark") {
      const paint = normalizeAppearanceForCanvas(
        DEFAULT_GROOVED_PANEL_DARK_APPEARANCE,
      );
      return {
        ...preset,
        grooveIntensity: paint.brushGrooveIntensity,
        groovePitchPx,
        grooveLineThicknessPx,
        baseGradientDepth: paint.brushBaseGradientDepth,
        darkBrushedAppearance: paint,
      };
    }
    const base = {
      ...preset,
      grooveIntensity,
      groovePitchPx,
      grooveLineThicknessPx,
      baseGradientDepth: preset.baseGradientDepth ?? 0,
    };
    if (base.lightPanelBase === "whiteGroove") {
      return {
        ...base,
        panelGradientTopHex:
          panelGradientTopHex.trim() ||
          GROOVED_PANEL_LIGHT_BRUSH.panelGradientTopHex,
        panelGradientBottomHex:
          panelGradientBottomHex.trim() ||
          GROOVED_PANEL_LIGHT_BRUSH.panelGradientBottomHex,
      };
    }
    return base;
  }, [
    surface,
    grooveIntensity,
    groovePitchPx,
    grooveLineThicknessPx,
    panelGradientTopHex,
    panelGradientBottomHex,
  ]);

  const maxLineThickness = Math.max(1, Math.min(12, groovePitchPx - 1));

  /** White chips + transparent title bar whenever preview is light (grooved or flat). */
  const billingPresentation: "default" | "designPlaygroundLight" =
    surface === "light" ? "designPlaygroundLight" : "default";

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Page layout &amp; chrome</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The <strong className="text-foreground">Grooved panel background</strong> toggle is shared with the
          main app (<code className="font-mono text-xs">/</code>) and persisted in{" "}
          <code className="font-mono text-xs">localStorage</code>. Dark brushed metal uses the code default in{" "}
          <code className="font-mono text-xs">DEFAULT_GROOVED_PANEL_DARK_APPEARANCE</code>. Light/dark radio
          below only switches this frame.
        </p>
      </div>

      <PlayAreaSection
        id="playground-page-layout-chrome"
        title="Play area: billing page"
        description="Grooved panel preview: tune spacing, thickness, and (light only) groove contrast + vertical gradient hex. Dark brushed metal matches the product default in code. Billing uses playground-only chrome when the panel is light."
      >
        {groovedPanelEnabled ? (
          <DashPreviewCanvas
            surface={surface}
            className="p-0"
            toneChildTypography={false}
            brush={{ ...brush }}
          >
            <div className={previewFrameClass}>
              <BillingInventoryShellPreview billingPresentation={billingPresentation} />
            </div>
          </DashPreviewCanvas>
        ) : (
          <div
            className={cn(
              previewFrameClass,
              "rounded-lg border border-border bg-background",
            )}
          >
            <BillingInventoryShellPreview billingPresentation={billingPresentation} />
          </div>
        )}

        <div className="rounded-lg border border-border bg-card/40 p-4 space-y-4">
          <p className="text-sm font-medium text-foreground">Preview</p>

          <label className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={groovedPanelEnabled}
              onChange={(e) => setGroovedPanelEnabled(e.target.checked)}
              className="size-4 rounded border-input accent-primary"
            />
            <span>
              <span className="font-medium text-foreground">Grooved panel background</span>
              <span className="block text-xs text-muted-foreground">
                Syncs with all pages on <code className="font-mono">/</code>. Off = flat column background.
              </span>
            </span>
          </label>

          <fieldset
            className={cn(
              "flex flex-wrap gap-4 border-t border-border/60 pt-3",
              !groovedPanelEnabled && "pointer-events-none opacity-50",
            )}
          >
            <legend className="mb-2 w-full text-xs font-medium text-muted-foreground">
              When grooved panel is on
            </legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="layout-groove-surface"
                checked={surface === "light"}
                onChange={() => setSurface("light")}
                className="size-4 accent-primary"
              />
              Light (white + soft grooves)
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="layout-groove-surface"
                checked={surface === "dark"}
                onChange={() => setSurface("dark")}
                className="size-4 accent-primary"
              />
              Dark (brushed dash)
            </label>
          </fieldset>

          <div
            className={cn(
              "space-y-4 border-t border-border/60 pt-3",
              !groovedPanelEnabled && "pointer-events-none opacity-50",
            )}
          >
            <p className="text-xs font-medium text-muted-foreground">
              Horizontal grooves (preview only)
            </p>
            {surface === "light" ? (
              <label className="flex max-w-md flex-col gap-1 text-sm">
                <span className="text-muted-foreground">
                  Groove contrast (0 = no lines, 200 = strong)
                </span>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={grooveIntensity}
                  onChange={(e) => setGrooveIntensity(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </label>
            ) : (
              <p className="max-w-md text-xs text-muted-foreground">
                Dark groove contrast and metal depth are fixed in{" "}
                <code className="font-mono text-[11px]">
                  DEFAULT_GROOVED_PANEL_DARK_APPEARANCE
                </code>{" "}
                (same as the product shell).
              </p>
            )}
            <label className="flex max-w-md flex-col gap-1 text-sm">
              <span className="text-muted-foreground">
                Line spacing — repeat period ({groovePitchPx}px)
              </span>
              <input
                type="range"
                min={2}
                max={24}
                value={groovePitchPx}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setGroovePitchPx(next);
                  setGrooveLineThicknessPx((t) => Math.min(t, Math.max(1, next - 1)));
                }}
                className="w-full accent-primary"
              />
            </label>
            <label className="flex max-w-md flex-col gap-1 text-sm">
              <span className="text-muted-foreground">
                Groove line thickness ({grooveLineThicknessPx}px, max {maxLineThickness} for this spacing)
              </span>
              <input
                type="range"
                min={1}
                max={maxLineThickness}
                value={Math.min(grooveLineThicknessPx, maxLineThickness)}
                onChange={(e) => setGrooveLineThicknessPx(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </label>
            {surface === "light" ? (
              <div className="space-y-3 border-t border-border/60 pt-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Linear gradient (light panel, top → bottom)
                </p>
                <label className="flex max-w-md flex-col gap-1 text-sm">
                  <span className="text-muted-foreground">Top (hex)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(panelGradientTopHex.trim())
                          ? panelGradientTopHex.trim()
                          : GROOVED_PANEL_LIGHT_BRUSH.panelGradientTopHex
                      }
                      onChange={(e) =>
                        setPanelGradientTopHex(e.target.value)
                      }
                      className="h-9 w-12 cursor-pointer rounded border border-input bg-background p-0.5"
                    />
                    <input
                      type="text"
                      value={panelGradientTopHex}
                      onChange={(e) => setPanelGradientTopHex(e.target.value)}
                      placeholder={GROOVED_PANEL_LIGHT_BRUSH.panelGradientTopHex}
                      className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm"
                    />
                  </div>
                </label>
                <label className="flex max-w-md flex-col gap-1 text-sm">
                  <span className="text-muted-foreground">Bottom (hex)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        /^#[0-9A-Fa-f]{6}$/.test(panelGradientBottomHex.trim())
                          ? panelGradientBottomHex.trim()
                          : GROOVED_PANEL_LIGHT_BRUSH.panelGradientBottomHex
                      }
                      onChange={(e) =>
                        setPanelGradientBottomHex(e.target.value)
                      }
                      className="h-9 w-12 cursor-pointer rounded border border-input bg-background p-0.5"
                    />
                    <input
                      type="text"
                      value={panelGradientBottomHex}
                      onChange={(e) =>
                        setPanelGradientBottomHex(e.target.value)
                      }
                      placeholder={GROOVED_PANEL_LIGHT_BRUSH.panelGradientBottomHex}
                      className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 font-mono text-sm"
                    />
                  </div>
                </label>
              </div>
            ) : null}

            <button
              type="button"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => {
                const preset =
                  surface === "dark"
                    ? GROOVED_PANEL_DARK_BRUSH
                    : GROOVED_PANEL_LIGHT_BRUSH;
                setGroovePitchPx(preset.groovePitchPx);
                setGrooveLineThicknessPx(preset.grooveLineThicknessPx ?? 2);
                if (surface === "light") {
                  setGrooveIntensity(preset.grooveIntensity);
                  if ("panelGradientTopHex" in preset) {
                    const lightPreset =
                      preset as typeof GROOVED_PANEL_LIGHT_BRUSH;
                    setPanelGradientTopHex(
                      lightPreset.panelGradientTopHex ??
                        GROOVED_PANEL_LIGHT_BRUSH.panelGradientTopHex,
                    );
                    setPanelGradientBottomHex(
                      lightPreset.panelGradientBottomHex ??
                        GROOVED_PANEL_LIGHT_BRUSH.panelGradientBottomHex,
                    );
                  }
                }
              }}
            >
              Reset grooves to shared preset ({surface === "dark" ? "dark" : "light"})
            </button>
          </div>
        </div>
      </PlayAreaSection>
    </div>
  );
}
