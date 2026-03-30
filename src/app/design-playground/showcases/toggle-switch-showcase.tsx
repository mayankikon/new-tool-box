"use client";

import * as React from "react";
import { Moon, Sun, Zap, Shield } from "lucide-react";

import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { cn } from "@/lib/utils";

import { DashPreviewCanvas } from "../components/dash-preview-canvas";
import { PlayAreaSection } from "../components/play-area-section";
import { VariantPicker, type VariantOption } from "../components/variant-picker";

const TOGGLE_VARIANTS: VariantOption[] = [
  { id: "toggle", label: "Stock paddle", hint: "ToggleSwitch" },
  { id: "toggle-bezel", label: "Bezel paddle", hint: "Inset housing" },
];

export function ToggleSwitchShowcase() {
  const [toggleVariant, setToggleVariant] = React.useState("toggle");
  const [theme, setTheme] = React.useState("light");
  const [recessDepth, setRecessDepth] = React.useState(40);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Toggle Switch</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Two-state <code className="text-xs">ToggleSwitch</code> only. Filter-key and outline under-glow
          tab strips live under <strong>Tabs</strong> in this playground.
        </p>
      </div>

      <PlayAreaSection
        id="playground-toggle-switch"
        title="Play area: on / off paddle"
        description="Dash-style dual-state control; bezel depth tweak applies to the inset variant."
      >
        <DashPreviewCanvas>
          {toggleVariant === "toggle" ? (
            <ToggleSwitch
              value={theme}
              onValueChange={setTheme}
              aria-label="Theme mode"
              options={[
                { value: "light", label: "Light", icon: <Sun className="size-4" aria-hidden /> },
                { value: "dark", label: "Dark", icon: <Moon className="size-4" aria-hidden /> },
              ]}
            />
          ) : null}

          {toggleVariant === "toggle-bezel" ? (
            <div
              className="inline-flex rounded-lg border border-zinc-600/60 p-1.5"
              style={{
                boxShadow: `inset 0 ${2 + recessDepth / 25}px ${8 + recessDepth / 10}px rgba(0,0,0,0.55)`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)",
              }}
            >
              <ToggleSwitch
                value={theme}
                onValueChange={setTheme}
                aria-label="Theme mode"
                options={[
                  { value: "light", label: "Day", icon: <Sun className="size-4" aria-hidden /> },
                  { value: "dark", label: "Night", icon: <Moon className="size-4" aria-hidden /> },
                ]}
              />
            </div>
          ) : null}
        </DashPreviewCanvas>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Variants</p>
          <VariantPicker
            options={TOGGLE_VARIANTS}
            value={toggleVariant}
            onValueChange={setToggleVariant}
          />
        </div>

        <div className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Tweaks</p>
          <label className="flex max-w-xs flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Recess depth (bezel paddle)</span>
            <input
              type="range"
              min={10}
              max={90}
              value={recessDepth}
              onChange={(e) => setRecessDepth(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </label>
        </div>
      </PlayAreaSection>

      <PlayAreaSection
        id="playground-annunciators"
        title="Play area: annunciators"
        description="Round dash lamps — optional reference for status, not tab selection."
      >
        <DashPreviewCanvas>
          <div className="flex flex-wrap gap-4">
            <AnnunciatorLamp
              label="TRACTION"
              active
              icon={<Shield className="size-4" aria-hidden />}
            />
            <AnnunciatorLamp
              label="BOOST"
              active={false}
              icon={<Zap className="size-4" aria-hidden />}
            />
          </div>
        </DashPreviewCanvas>
      </PlayAreaSection>
    </div>
  );
}

function AnnunciatorLamp({
  label,
  active,
  icon,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full border-2",
          active
            ? "border-amber-500/60 bg-amber-500/15 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35),inset_0_2px_6px_rgba(0,0,0,0.4)]"
            : "border-zinc-700 bg-zinc-950/80 text-zinc-500"
        )}
        aria-hidden
      >
        {icon}
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
