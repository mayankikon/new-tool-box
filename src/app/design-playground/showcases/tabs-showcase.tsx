"use client";

import * as React from "react";
import { Gauge, Radio, ThermometerSun, Waves } from "lucide-react";

import {
  TelemetryDeckTabs,
  TelemetryDeckTabList,
  TelemetryDeckTab,
} from "@/components/ui/telemetry-deck-tabs";
import { RadioSegmented } from "@/components/ui/radio-segmented";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

import { DashPreviewCanvas, type DashPreviewSurface } from "../components/dash-preview-canvas";
import { OutlineGlowTabRow } from "../components/outline-glow-tab-row";
import { PlayAreaSection } from "../components/play-area-section";
import { VariantPicker, type VariantOption } from "../components/variant-picker";
import { playCardButtonSound } from "../play-card-button-sound";

const TAB_STRIP_VARIANTS: VariantOption[] = [
  {
    id: "telemetry-below",
    label: "Telemetry (LED below)",
    hint: "Capsule under each tab",
  },
  {
    id: "telemetry-inside",
    label: "Telemetry (LED inside)",
    hint: "Capsule inside tab body",
  },
  { id: "push", label: "Side LED push", hint: "Green edge strip + recess" },
  {
    id: "outline-glow",
    label: "Outline + under-glow",
    hint: "Solid stroke; active under-bar",
  },
];

const RADIO_VARIANTS: VariantOption[] = [
  { id: "stock", label: "Stock segmented", hint: "RadioSegmented default" },
  { id: "bezel", label: "Brushed bezel", hint: "Metal frame + inset" },
  { id: "preset-led", label: "Preset + LED", hint: "Dot above selection" },
  { id: "tactile", label: "Tactile stack", hint: "Vertical chunky keys" },
  { id: "carbon", label: "Carbon panel", hint: "Mesh + contrast rail" },
];

/** Tab strip playground: former tweak values are fixed (only preview surface remains in UI). */
const TAB_STRIP_TELEMETRY_GAP_PX = 8;
const TAB_STRIP_TELEMETRY_CAPSULE_SCALE_PERCENT = 100;
const OUTLINE_LED_HALO_PX = 11;
const OUTLINE_BUTTON_RADIUS_PX = 6;
const OUTLINE_CHANNEL_RECESS = 0;
const OUTLINE_INDICATOR_MODE = "left-lamp" as const;
const OUTLINE_ACCENT = "primary" as const;
const PUSH_LED_HALO_PX = 3;
const PUSH_KEY_RADIUS_PX = 4;
const BEZEL_PAD_PX = 28;
/** Matches prior DialKit default metal highlight (~22). */
const BEZEL_METAL_HIGHLIGHT = 0.22;

const PERF_OPTIONS = [
  { value: "perf", label: "Perf", icon: <Gauge className="size-4" aria-hidden /> },
  { value: "acoustic", label: "Acoustic", icon: <Waves className="size-4" aria-hidden /> },
  { value: "climate", label: "Climate", icon: <ThermometerSun className="size-4" aria-hidden /> },
  { value: "radio", label: "Radio", icon: <Radio className="size-4" aria-hidden /> },
];

export function TabsShowcase() {
  return (
    <div className="space-y-10 font-headline tracking-normal">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Tabs</h2>
        <p className="mt-1 text-sm text-muted-foreground font-headline">
          Telemetry deck tabs, side-LED push, outline glow, and segmented radios. Outline tabs play{" "}
          <code className="font-mono text-xs">/media/audio/card_button.mp3</code> when present.{" "}
          <strong>Saira</strong> via <code className="font-mono text-xs">font-headline</code>.
        </p>
      </div>

      <TabStripsPlayArea />
      <RadioSegmentedPlayArea />
    </div>
  );
}

function TabStripsPlayArea() {
  const [variant, setVariant] = React.useState<string>("telemetry-below");
  const [previewSurface, setPreviewSurface] =
    React.useState<DashPreviewSurface>("light");
  const [deckValue, setDeckValue] = React.useState("drive");
  const [pushValue, setPushValue] = React.useState("motor");
  const [outlineTab, setOutlineTab] = React.useState<string>("drive");

  const handleOutlineTabChange = React.useCallback(
    (next: string) => {
      setOutlineTab((prev) => {
        if (prev !== next && variant === "outline-glow") {
          playCardButtonSound();
        }
        return next;
      });
    },
    [variant],
  );

  const telemetryCapsuleScaleFactor =
    TAB_STRIP_TELEMETRY_CAPSULE_SCALE_PERCENT / 100;

  const labels = {
    drive: "Drive",
    climate: "Climate",
    media: "Media",
    system: "System",
  };

  const bezelStyleDark: React.CSSProperties = {
    padding: BEZEL_PAD_PX,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,0.35)",
    background: `linear-gradient(145deg, rgba(255,255,255,${0.06 + BEZEL_METAL_HIGHLIGHT * 0.08}) 0%, transparent 45%, rgba(0,0,0,0.25) 100%)`,
    boxShadow: `
      inset 0 1px 0 rgba(255,255,255,0.12),
      inset 0 -2px 8px rgba(0,0,0,0.5),
      0 4px 12px rgba(0,0,0,0.35)
    `,
  };

  const bezelStyleLight: React.CSSProperties = {
    padding: BEZEL_PAD_PX,
    borderRadius: 12,
    border: "1px solid rgba(161,161,170,0.55)",
    background: `linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(228,228,231,0.5) 100%)`,
    boxShadow: `
      inset 0 1px 0 rgba(255,255,255,0.98),
      inset 0 -2px 6px rgba(0,0,0,0.06),
      0 2px 8px rgba(0,0,0,0.06)
    `,
  };

  const isTelemetryVariant = variant.startsWith("telemetry-");
  const bezelStyle =
    previewSurface === "light" && (isTelemetryVariant || variant === "push")
      ? bezelStyleLight
      : bezelStyleDark;

  const telemetryPlacementBelow = variant.endsWith("below");

  return (
    <PlayAreaSection
      id="playground-tab-strips"
      title="Tab variants"
    >
      <DashPreviewCanvas
        surface={previewSurface}
        brush={
          variant === "outline-glow"
            ? { grooveIntensity: 0, baseGradientDepth: 0 }
            : undefined
        }
        style={
          variant === "outline-glow"
            ? {
                backgroundImage: "none",
                backgroundColor:
                  previewSurface === "light" ? "#f4f4f5" : "#1b1b1c",
              }
            : undefined
        }
      >
        <div
          style={
            isTelemetryVariant || variant === "push" ? bezelStyle : undefined
          }
        >
          {isTelemetryVariant ? (
            <TelemetryDeckTabs
              value={deckValue}
              onValueChange={setDeckValue}
              visual={previewSurface === "light" ? "light" : "dark"}
              capsulePlacement={telemetryPlacementBelow ? "below" : "inside"}
            >
              <div
                className="inline-block max-w-full"
                style={
                  {
                    ["--telemetry-led-w" as string]: `${1.5 * telemetryCapsuleScaleFactor}rem`,
                    ["--telemetry-led-h" as string]: `${0.25 * telemetryCapsuleScaleFactor}rem`
                  } as React.CSSProperties
                }
              >
                <TelemetryDeckTabList
                  className="max-w-full"
                  style={{ gap: TAB_STRIP_TELEMETRY_GAP_PX }}
                >
                  <TelemetryDeckTab value="drive" ledTone="primary">
                    {labels.drive}
                  </TelemetryDeckTab>
                  <TelemetryDeckTab value="climate" ledTone="coolant">
                    {labels.climate}
                  </TelemetryDeckTab>
                  <TelemetryDeckTab value="media" ledTone="amber">
                    {labels.media}
                  </TelemetryDeckTab>
                  <TelemetryDeckTab value="system" ledTone="red">
                    {labels.system}
                  </TelemetryDeckTab>
                </TelemetryDeckTabList>
              </div>
            </TelemetryDeckTabs>
          ) : null}

          {variant === "push" ? (
            <MechanicalPushKeyRow
              value={pushValue}
              onValueChange={setPushValue}
              ledHaloPx={PUSH_LED_HALO_PX}
              keyRadiusPx={PUSH_KEY_RADIUS_PX}
              surface={previewSurface}
            />
          ) : null}

          {variant === "outline-glow" ? (
            <div
              className="inline-block max-w-full rounded-lg"
              style={{
                padding: OUTLINE_CHANNEL_RECESS > 5 ? "0.35rem" : "0",
                borderRadius:
                  OUTLINE_CHANNEL_RECESS > 5
                    ? Math.max(OUTLINE_BUTTON_RADIUS_PX + 6, 10)
                    : undefined,
                backgroundColor:
                  OUTLINE_CHANNEL_RECESS > 5
                    ? previewSurface === "light"
                      ? "#f4f4f5"
                      : "#27272a"
                    : undefined,
              }}
            >
              <OutlineGlowTabRow
                value={outlineTab}
                onValueChange={handleOutlineTabChange}
                labels={labels}
                surface={previewSurface}
                underGlowPx={OUTLINE_LED_HALO_PX}
                accent={OUTLINE_ACCENT}
                borderRadiusPx={OUTLINE_BUTTON_RADIUS_PX}
                indicatorMode={OUTLINE_INDICATOR_MODE}
              />
            </div>
          ) : null}
        </div>
      </DashPreviewCanvas>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Variants</p>
        <VariantPicker options={TAB_STRIP_VARIANTS} value={variant} onValueChange={setVariant} />
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-4 space-y-4">
        <p className="text-sm font-medium text-foreground">Tweaks</p>
        <fieldset className="flex flex-wrap gap-4">
          <legend className="text-xs font-medium text-muted-foreground mb-2 w-full">Preview panel</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="preview-surface"
              checked={previewSurface === "dark"}
              onChange={() => setPreviewSurface("dark")}
              className="size-4 accent-primary"
            />
            Dark dash
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="preview-surface"
              checked={previewSurface === "light"}
              onChange={() => setPreviewSurface("light")}
              className="size-4 accent-primary"
            />
            Light panel (brushed metal)
          </label>
        </fieldset>
      </div>
    </PlayAreaSection>
  );
}

function RadioSegmentedPlayArea() {
  const [variant, setVariant] = React.useState("stock");
  const [value, setValue] = React.useState("perf");
  const [ledIntensity, setLedIntensity] = React.useState(70);

  const handleVariantChange = React.useCallback((next: string) => {
    playCardButtonSound();
    setVariant(next);
  }, []);

  const handlePerfValueChange = React.useCallback((next: string) => {
    playCardButtonSound();
    setValue(next);
  }, []);

  const bezelClass =
    "rounded-lg border border-zinc-500/50 p-4 shadow-[inset_0_2px_12px_rgba(0,0,0,0.55)] bg-gradient-to-br from-zinc-800/40 via-transparent to-black/40";

  return (
    <PlayAreaSection
      id="playground-radio-segmented"
      title="Play area: radio & segmented (same family as tabs)"
      description="Porsche-style preset rows and FM-band segments — still one logical “mode” control; maps to Radio in the design system."
    >
      <DashPreviewCanvas>
        {variant === "stock" ? (
          <RadioSegmented
            value={value}
            onValueChange={handlePerfValueChange}
            options={PERF_OPTIONS}
          />
        ) : null}

        {variant === "bezel" ? (
          <div className={bezelClass}>
            <RadioSegmented
              value={value}
              onValueChange={handlePerfValueChange}
              options={PERF_OPTIONS}
              className="border-zinc-600/60 bg-zinc-950/50"
            />
          </div>
        ) : null}

        {variant === "preset-led" ? (
          <PresetLedRadioRow
            value={value}
            onValueChange={handlePerfValueChange}
            ledIntensity={ledIntensity}
          />
        ) : null}

        {variant === "tactile" ? (
          <RadioGroup
            value={value}
            onValueChange={handlePerfValueChange}
            className="flex max-w-xs flex-col gap-2"
          >
            {PERF_OPTIONS.map((opt) => {
              const active = value === opt.value;
              return (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "border-primary/50 bg-primary/15 text-foreground"
                      : "border-zinc-700 bg-zinc-950/60 text-muted-foreground hover:border-zinc-500"
                  )}
                >
                  <RadioGroupItem value={opt.value} className="sr-only" />
                  <span className="text-muted-foreground">{opt.icon}</span>
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </RadioGroup>
        ) : null}

        {variant === "carbon" ? (
          <div
            className="rounded-lg border border-zinc-600/50 p-5"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 2px),
                repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px),
                linear-gradient(160deg, #1b1b1c 0%, #0a0a0b 100%)
              `,
            }}
          >
            <RadioSegmented
              value={value}
              onValueChange={handlePerfValueChange}
              options={PERF_OPTIONS}
              className="border-zinc-500/40 bg-black/35"
            />
          </div>
        ) : null}
      </DashPreviewCanvas>

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Variants</p>
        <VariantPicker
          options={RADIO_VARIANTS}
          value={variant}
          onValueChange={handleVariantChange}
        />
      </div>

      <div className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Tweaks</p>
        <label className="flex max-w-xs flex-col gap-1 text-sm">
          <span className="text-muted-foreground">LED intensity (preset-led)</span>
          <input
            type="range"
            min={20}
            max={100}
            value={ledIntensity}
            onChange={(e) => setLedIntensity(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </label>
      </div>
    </PlayAreaSection>
  );
}

const PUSH_MODES = [
  { id: "motor", label: "MOTOR" },
  { id: "klima", label: "KLIMA" },
  { id: "audio", label: "AUDIO" },
  { id: "check", label: "CHECK" },
] as const;

function MechanicalPushKeyRow({
  value,
  onValueChange,
  ledHaloPx,
  keyRadiusPx,
  surface = "dark",
}: {
  value: string;
  onValueChange: (v: string) => void;
  /** Tight edge light on the side LED only — 0 = solid lamp, no bloom. */
  ledHaloPx: number;
  keyRadiusPx: number;
  surface?: DashPreviewSurface;
}) {
  const light = surface === "light";
  return (
    <div
      role="tablist"
      aria-label="Dash mode keys"
      className="flex flex-wrap gap-2 sm:gap-3"
    >
      {PUSH_MODES.map((m) => {
        const active = value === m.id;
        const halo = Math.max(0, ledHaloPx);
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(m.id)}
            style={{ borderRadius: keyRadiusPx }}
            className={cn(
              "relative flex min-h-12 min-w-[5.5rem] flex-1 items-center justify-center px-3 py-2",
              "border text-xs font-semibold tracking-wide transition-shadow outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              light ? "focus-visible:ring-offset-zinc-200" : "focus-visible:ring-offset-zinc-900",
              light
                ? active
                  ? "border-zinc-500 bg-white/90 text-zinc-900 shadow-[inset_0_2px_6px_rgba(0,0,0,0.12)]"
                  : "border-zinc-400/90 bg-white/50 text-zinc-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] hover:border-zinc-500 hover:text-zinc-900"
                : active
                  ? "border-zinc-500 bg-zinc-900/90 text-foreground shadow-[inset_0_3px_8px_rgba(0,0,0,0.65)]"
                  : "border-zinc-700 bg-zinc-950/80 text-muted-foreground hover:text-foreground shadow-[inset_0_2px_6px_rgba(0,0,0,0.5)]"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute left-1 top-1.5 bottom-1.5 w-1 rounded-sm transition-all",
                active
                  ? "bg-emerald-500"
                  : light
                    ? "bg-zinc-300"
                    : "bg-zinc-700/80"
              )}
              style={
                active && halo > 0
                  ? {
                      boxShadow: `0 0 ${halo}px rgba(34, 197, 94, 0.45), inset 0 1px 0 rgba(255,255,255,0.35)`,
                    }
                  : active
                    ? { boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }
                    : undefined
              }
            />
            <span className="pl-2">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PresetLedRadioRow({
  value,
  onValueChange,
  ledIntensity,
}: {
  value: string;
  onValueChange: (v: string) => void;
  ledIntensity: number;
}) {
  const glow = ledIntensity / 100;
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className="flex flex-wrap gap-3"
      aria-label="Performance mode"
    >
      {PERF_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              "relative flex min-w-[5.5rem] cursor-pointer flex-col items-center gap-2 rounded-md border px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide",
              active
                ? "border-zinc-500 bg-zinc-900/90 text-foreground"
                : "border-zinc-700 bg-zinc-950/70 text-muted-foreground"
            )}
          >
            <span
              aria-hidden
              className="h-1.5 w-5 rounded-full border border-zinc-600 transition-all"
              style={
                active
                  ? {
                      backgroundColor: `rgba(220, 38, 38, ${0.5 + glow * 0.45})`,
                      boxShadow: `0 0 ${8 + glow * 12}px rgba(248, 113, 113, ${0.4 + glow * 0.4})`,
                    }
                  : { backgroundColor: "rgba(63, 63, 70, 0.8)" }
              }
            />
            <RadioGroupItem value={opt.value} className="sr-only" />
            <span className="flex flex-col items-center gap-1">
              {opt.icon}
              {opt.label}
            </span>
          </label>
        );
      })}
    </RadioGroup>
  );
}
