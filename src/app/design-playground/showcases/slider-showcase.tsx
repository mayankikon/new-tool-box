"use client";

import * as React from "react";

import { ProgressBar } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

import {
  BATTERY_THRESHOLD_RECOMMENDED_V,
  BatteryThresholdControl,
} from "../components/battery-threshold-control";
import { BatteryThresholdClimateFanPlayground } from "../components/battery-threshold-climate-fan-playground";
import { DashPreviewCanvas } from "../components/dash-preview-canvas";
import { PlayAreaSection } from "../components/play-area-section";
import { VariantPicker, type VariantOption } from "../components/variant-picker";

const RETRO_VARIANTS: VariantOption[] = [
  { id: "fader", label: "Groove fader", hint: "CSS metallic thumb" },
  { id: "eq", label: "Triple EQ", hint: "Three vertical faders" },
  { id: "gauge", label: "Progress meter", hint: "Range + ProgressBar" },
  { id: "temp", label: "Temp gradient", hint: "Cold → hot track" },
  { id: "ridged", label: "Ridged thumb", hint: "Grip slots" },
];

const DS_SLIDER_VARIANTS: VariantOption[] = [
  { id: "baseline", label: "Baseline", hint: "Default Slider + sm trim" },
  { id: "drawing", label: "Drawing handles", hint: "Slider + skeuomorphic thumb (light panel)" },
];

const BATTERY_UI_VARIANTS: VariantOption[] = [
  { id: "studio", label: "Studio slider", hint: "Climate fan pattern (marks + helper)" },
  { id: "studio-drawing", label: "Studio + drawing thumb", hint: "Light grooved panel" },
  { id: "gradient", label: "Voltage gradient", hint: "Native range, red → green track" },
];

export function SliderShowcase() {
  const [retroVariant, setRetroVariant] = React.useState("fader");
  const [dsSliderVariant, setDsSliderVariant] = React.useState("baseline");
  const [v1, setV1] = React.useState(42);
  const [v2, setV2] = React.useState(65);
  const [v3, setV3] = React.useState(28);
  const [meter, setMeter] = React.useState(55);
  const [batteryUi, setBatteryUi] = React.useState("climate-fan");
  const [batteryVolts, setBatteryVolts] = React.useState(BATTERY_THRESHOLD_RECOMMENDED_V);

  const avg = Math.round((v1 + v2 + v3) / 3);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Slider &amp; Progress</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <code className="text-xs">Slider</code> (design system) and{" "}
          <code className="text-xs">ProgressBar</code> for linear meters, plus playground-only retro{" "}
          <code className="text-xs">input[type=&quot;range&quot;]</code> for climate / EQ metaphors.
        </p>
      </div>

      <PlayAreaSection
        id="playground-retro-faders"
        title="Play area: retro faders (native range)"
        description="Thick groove + metallic thumb — climate / equalizer feel. Styles live in retro-playground.css."
      >
        <DashPreviewCanvas>
          {retroVariant === "fader" ? (
            <div className="w-full max-w-md space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Level
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={v1}
                onChange={(e) => setV1(Number(e.target.value))}
                className="retro-range-track block h-8 w-full cursor-pointer bg-transparent"
                style={{ background: "transparent" }}
                aria-valuetext={`${v1} percent`}
              />
              <p className="text-xs text-muted-foreground tabular-nums">{v1}%</p>
            </div>
          ) : null}

          {retroVariant === "eq" ? (
            <div className="flex items-end gap-6">
              <EqFader label="Low" value={v1} onChange={setV1} />
              <EqFader label="Mid" value={v2} onChange={setV2} />
              <EqFader label="High" value={v3} onChange={setV3} />
            </div>
          ) : null}

          {retroVariant === "gauge" ? (
            <div className="w-full max-w-md space-y-4">
              <input
                type="range"
                min={0}
                max={100}
                value={avg}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setV1(n);
                  setV2(n);
                  setV3(n);
                }}
                className="retro-range-track block h-8 w-full cursor-pointer bg-transparent"
                style={{ background: "transparent" }}
                aria-label="Master level"
              />
              <ProgressBar value={avg} label="Output level" variant="linear" />
            </div>
          ) : null}

          {retroVariant === "temp" ? (
            <div className="w-full max-w-md space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Temp blend
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={v2}
                onChange={(e) => setV2(Number(e.target.value))}
                className="retro-range-track retro-range-temp block h-8 w-full cursor-pointer"
                style={{ background: "transparent" }}
              />
            </div>
          ) : null}

          {retroVariant === "ridged" ? (
            <div className="w-full max-w-md space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Damping
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={v3}
                onChange={(e) => setV3(Number(e.target.value))}
                className="retro-range-track retro-range-ridged block h-8 w-full cursor-pointer bg-transparent"
                style={{ background: "transparent" }}
              />
            </div>
          ) : null}
        </DashPreviewCanvas>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Variants</p>
          <VariantPicker options={RETRO_VARIANTS} value={retroVariant} onValueChange={setRetroVariant} />
        </div>

        <div className="rounded-lg border border-border bg-card/40 p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Tweaks</p>
          <p className="text-xs text-muted-foreground">
            Edit thumb / track in{" "}
            <code className="text-[11px]">src/app/design-playground/retro-playground.css</code>.
          </p>
          {retroVariant === "eq" ? (
            <label className="flex max-w-xs flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Mid fader</span>
              <input
                type="range"
                min={0}
                max={100}
                value={v2}
                onChange={(e) => setV2(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </label>
          ) : null}
        </div>
      </PlayAreaSection>

      <PlayAreaSection
        id="playground-ds-slider"
        title="Play area: design system Slider"
        description={
          dsSliderVariant === "drawing"
            ? "Design system Slider with skeuomorphic drawing thumb on the light grooved panel (see retro-playground.css)."
            : "Base UI slider with field label and optional marks — baseline before retro chrome."
        }
      >
        <DashPreviewCanvas
          surface={dsSliderVariant === "drawing" ? "light" : "dark"}
          toneChildTypography={dsSliderVariant !== "drawing"}
          innerClassName="font-sans"
        >
          {dsSliderVariant === "baseline" ? (
            <div className="w-full max-w-md space-y-6 text-foreground">
              <Slider
                defaultValue={38}
                min={0}
                max={100}
                label="Climate fan"
                marks
                markStep={25}
              />
              <Slider defaultValue={62} min={0} max={100} size="sm" label="Fine trim (sm)" />
            </div>
          ) : (
            <div className="playground-ds-slider-drawing w-full max-w-md space-y-6 text-foreground">
              <Slider
                defaultValue={38}
                min={0}
                max={100}
                label="Climate fan"
                marks
                markStep={25}
                thumbClassName="slider-thumb-drawing"
              />
              <Slider
                defaultValue={62}
                min={0}
                max={100}
                size="sm"
                label="Fine trim (sm)"
                thumbClassName="slider-thumb-drawing"
              />
            </div>
          )}
        </DashPreviewCanvas>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Variants</p>
          <VariantPicker
            options={DS_SLIDER_VARIANTS}
            value={dsSliderVariant}
            onValueChange={setDsSliderVariant}
          />
        </div>

        {dsSliderVariant === "drawing" ? (
          <div className="rounded-lg border border-border bg-card/40 p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Thumb chrome</p>
            <p className="text-xs text-muted-foreground">
              Pass <code className="text-[11px]">thumbClassName=&quot;slider-thumb-drawing&quot;</code> on{" "}
              <code className="text-[11px]">Slider</code> or <code className="text-[11px]">RangeSlider</code>, inside a wrapper with{" "}
              <code className="text-[11px]">.playground-ds-slider-drawing</code> (track + thumb CSS in{" "}
              <code className="text-[11px]">retro-playground.css</code>).
            </p>
          </div>
        ) : null}
      </PlayAreaSection>

      <PlayAreaSection
        id="playground-battery-threshold"
        title="Play area: battery alert threshold"
        description="Low-battery threshold in volts (10–12.5 V). First variants mirror the “design system Slider” Climate fan block (baseline + drawing); battery icon sits beside the same field + marks pattern. Studio / gradient variants iterate other chrome; no amber recommended line in the playground."
      >
        <DashPreviewCanvas
          surface={
            batteryUi === "studio-drawing" || batteryUi === "climate-fan-drawing" ? "light" : "dark"
          }
          toneChildTypography={
            batteryUi !== "studio-drawing" && batteryUi !== "climate-fan-drawing"
          }
          innerClassName={
            batteryUi === "studio-drawing" || batteryUi === "climate-fan-drawing" ? "font-sans" : undefined
          }
        >
          <div className="w-full max-w-md">
            {batteryUi === "climate-fan" || batteryUi === "climate-fan-drawing" ? (
              <BatteryThresholdClimateFanPlayground
                variant={batteryUi === "climate-fan-drawing" ? "drawing" : "baseline"}
                value={batteryVolts}
                onValueChange={setBatteryVolts}
              />
            ) : (
              <BatteryThresholdControl
                variant={batteryUi === "gradient" ? "gradient" : "studio"}
                studioChrome={batteryUi === "studio-drawing" ? "drawing" : "baseline"}
                value={batteryVolts}
                onValueChange={setBatteryVolts}
              />
            )}
          </div>
        </DashPreviewCanvas>

        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Variants</p>
          <VariantPicker options={BATTERY_UI_VARIANTS} value={batteryUi} onValueChange={setBatteryUi} />
        </div>

        <div className="rounded-lg border border-border bg-card/40 p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Implementation</p>
          <p className="text-xs text-muted-foreground">
            Climate fan variants:{" "}
            <code className="text-[11px]">battery-threshold-climate-fan-playground.tsx</code> (same Slider structure
            as <code className="text-[11px]">#playground-ds-slider</code> Climate fan). Other variants:{" "}
            <code className="text-[11px]">battery-threshold-control.tsx</code>,{" "}
            <code className="text-[11px]">src/components/ui/battery-threshold-icon.tsx</code>. Gradient track:{" "}
            <code className="text-[11px]">.retro-range-battery-voltage</code> in{" "}
            <code className="text-[11px]">retro-playground.css</code>.
          </p>
        </div>
      </PlayAreaSection>

      <PlayAreaSection
        id="playground-progress-bar"
        title="Play area: Progress bar (linear gauge)"
        description="Use as level meter beside a fader; dashed variant reads as segmented display."
      >
        <DashPreviewCanvas>
          <div className="flex w-full max-w-md flex-col gap-6">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Drive meter value</span>
              <input
                type="range"
                min={0}
                max={100}
                value={meter}
                onChange={(e) => setMeter(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </label>
            <ProgressBar value={meter} label="Load" variant="linear" />
            <ProgressBar value={meter} label="Segmented" variant="dashed" />
          </div>
        </DashPreviewCanvas>
      </PlayAreaSection>
    </div>
  );
}

function EqFader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex h-40 flex-col items-center justify-end gap-2">
      <div className="relative flex h-32 w-9 items-center justify-center">
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="retro-range-track absolute w-28 cursor-pointer bg-transparent"
          style={{ background: "transparent", transform: "rotate(-90deg)" }}
          aria-label={label}
        />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
