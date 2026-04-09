"use client";

import { useMemo, useState } from "react";

import { KeysMapMarkerPin } from "@/components/ui/keys-map-marker-pin";
import { VehicleMapClusterMarker } from "@/components/ui/vehicle-map-cluster-marker";
import { VehicleMapMarkerChip } from "@/components/ui/vehicle-map-marker-chip";
import { VehicleMapMarkerPin, type VehicleMapMarkerPinTone } from "@/components/ui/vehicle-map-marker-pin";
import { cn } from "@/lib/utils";

import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { CodeInline } from "../atoms/CodeInline";

const PIN_SCALE_OPTIONS = [
  { id: 0.9 as const, label: "90%" },
  { id: 1 as const, label: "100%" },
  { id: 1.1 as const, label: "110%" },
] as const;

const VEHICLE_TONE_OPTIONS = [
  { id: "teal" as const, label: "Teal" },
  { id: "gold" as const, label: "Gold" },
  { id: "red" as const, label: "Red" },
] as const;

function DocCodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
      <code>{children}</code>
    </pre>
  );
}

function DocSubheading({ children }: { children: React.ReactNode }) {
  return <h3 className="ds-doc-font text-lg font-medium tracking-tight text-foreground">{children}</h3>;
}

function DocLead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("ds-doc-font text-sm text-muted-foreground", className)}>{children}</p>;
}

function PinScaleTabList({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (next: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">Pin size</p>
      <div className="flex flex-wrap items-center gap-2">
        {PIN_SCALE_OPTIONS.map(({ id, label }) => {
          const isActive = id === value;
          return (
            <button
              key={label}
              type="button"
              onClick={() => onValueChange(id)}
              className={cn(
                "inline-flex min-h-8 items-center rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "border-foreground/15 bg-foreground/6 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground",
              )}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToneTabList({
  value,
  onValueChange,
}: {
  value: VehicleMapMarkerPinTone;
  onValueChange: (next: VehicleMapMarkerPinTone) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">Vehicle tone</p>
      <div className="flex flex-wrap items-center gap-2">
        {VEHICLE_TONE_OPTIONS.map(({ id, label }) => {
          const isActive = id === value;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onValueChange(id)}
              className={cn(
                "inline-flex min-h-8 items-center rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "border-foreground/15 bg-foreground/6 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground",
              )}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MarkerPinsPanel() {
  const [tone, setTone] = useState<VehicleMapMarkerPinTone>("teal");
  const [pinScale, setPinScale] = useState(1);
  const [hoverable, setHoverable] = useState(true);

  const code = useMemo(
    () => `<VehicleMapMarkerPin tone="${tone}" hoverable={${hoverable}} sizeScale={${pinScale}} />
<KeysMapMarkerPin hoverable={${hoverable}} sizeScale={${pinScale}} />
// Keep both pins on the same sizeScale for consistent visual footprint.`,
    [hoverable, pinScale, tone],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Pins</DocSubheading>
        <DocLead>
          Vehicle and keys pins share the same scale control so both always render at equal size. This keeps map pin
          rhythm consistent between inventory and key state overlays.
        </DocLead>
      </div>
      <ShowcaseCard padding="lg" className="space-y-6">
        <PinScaleTabList value={pinScale} onValueChange={setPinScale} />
        <ToneTabList value={tone} onValueChange={setTone} />
        <div className="space-y-1.5">
          <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">Interaction</p>
          <button
            type="button"
            onClick={() => setHoverable((current) => !current)}
            className={cn(
              "inline-flex min-h-8 items-center rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              hoverable
                ? "border-foreground/15 bg-foreground/6 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground",
            )}
            aria-pressed={hoverable}
          >
            {hoverable ? "Hover on" : "Hover off"}
          </button>
        </div>
        <div className="flex min-h-[120px] flex-wrap items-center justify-center gap-10 rounded-md border border-dashed border-border bg-muted/25 p-8">
          <VehicleMapMarkerPin tone={tone} hoverable={hoverable} sizeScale={pinScale} />
          <KeysMapMarkerPin hoverable={hoverable} sizeScale={pinScale} />
        </div>
        <DocCodeBlock>{code}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

function MarkerFamilyReference() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Reference: marker family</DocSubheading>
        <DocLead>
          Includes pin markers, photo chip marker, and cluster markers. Use <CodeInline>variant</CodeInline> and{" "}
          <CodeInline>countLabel</CodeInline> for cluster states.
        </DocLead>
      </div>
      <ShowcaseCard padding="lg" className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border border-border bg-muted/20 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Vehicle Pin</p>
            <div className="flex justify-center">
              <VehicleMapMarkerPin tone="teal" hoverable />
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Keys Pin</p>
            <div className="flex justify-center">
              <KeysMapMarkerPin hoverable />
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Vehicle Chip</p>
            <div className="flex justify-center">
              <VehicleMapMarkerChip variantIndex={0} hoverOverlayColor="#1A9375" />
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/20 p-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Cluster</p>
            <div className="flex justify-center gap-4">
              <VehicleMapClusterMarker countLabel="142" hoverable />
              <VehicleMapClusterMarker variant="group-active" countLabel="32" hoverable />
            </div>
          </div>
        </div>
      </ShowcaseCard>
    </div>
  );
}

export interface MapMarkersShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function MapMarkersShowcaseSection({
  overline,
  title = "Map Markers",
  description,
}: MapMarkersShowcaseSectionProps) {
  return (
    <section id="map-markers" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <MarkerPinsPanel />
        <MarkerFamilyReference />
      </div>
    </section>
  );
}
