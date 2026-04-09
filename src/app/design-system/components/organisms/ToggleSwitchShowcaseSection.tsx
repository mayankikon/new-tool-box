"use client";

import { useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { ToggleSwitch, type ToggleSwitchOption } from "@/components/ui/toggle-switch";
import { cn } from "@/lib/utils";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { CodeInline } from "../atoms/CodeInline";

const TOGGLE_DOC_SIZES = [
  { id: "sm" as const, label: "SM", heightPx: 28 },
  { id: "default" as const, label: "Default", heightPx: 36 },
  { id: "lg" as const, label: "LG", heightPx: 44 },
] as const;

const TOGGLE_DOC_STATES = [
  { id: "default" as const, label: "Default" },
  { id: "selected-right" as const, label: "Selected right" },
  { id: "hover" as const, label: "Hover" },
  { id: "focus" as const, label: "Focus" },
  { id: "disabled" as const, label: "Disabled" },
] as const;

const LABEL_OPTIONS: [ToggleSwitchOption, ToggleSwitchOption] = [
  { value: "map", label: "Map" },
  { value: "table", label: "Table" },
];

const ICON_OPTIONS: [ToggleSwitchOption, ToggleSwitchOption] = [
  { value: "map", icon: <Info className="size-4" /> },
  { value: "table", icon: <CheckCircle2 className="size-4" /> },
];

function DocCodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
      <code>{children}</code>
    </pre>
  );
}

function DocSubheading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="ds-doc-font text-lg font-medium tracking-tight text-foreground">{children}</h3>
  );
}

function DocLead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("ds-doc-font text-sm text-muted-foreground", className)}>{children}</p>;
}

function SizeTabList({
  value,
  onValueChange,
}: {
  value: (typeof TOGGLE_DOC_SIZES)[number]["id"];
  onValueChange: (next: (typeof TOGGLE_DOC_SIZES)[number]["id"]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">Size</p>
      <div className="flex flex-wrap items-center gap-2">
        {TOGGLE_DOC_SIZES.map(({ id, label, heightPx }) => {
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
              title={`${label}: ${heightPx}px control height`}
            >
              <span className="tabular-nums">
                {label} · {heightPx}px
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StateTabList({
  value,
  onValueChange,
}: {
  value: (typeof TOGGLE_DOC_STATES)[number]["id"];
  onValueChange: (next: (typeof TOGGLE_DOC_STATES)[number]["id"]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">State</p>
      <div className="flex flex-wrap items-center gap-2">
        {TOGGLE_DOC_STATES.map(({ id, label }) => {
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

function getToggleStatePresentation(state: (typeof TOGGLE_DOC_STATES)[number]["id"]) {
  if (state === "selected-right") {
    return { value: "table", disabled: false, className: undefined };
  }
  if (state === "hover") {
    return {
      value: "map",
      disabled: false,
      className:
        "[&_[role='radio']:not([data-active='true'])]:bg-[color-mix(in_oklab,var(--theme-background-page)_86%,var(--theme-background-default))] [&_[role='radio']:not([data-active='true'])]:text-[var(--theme-icon-primary)]",
    };
  }
  if (state === "focus") {
    return {
      value: "map",
      disabled: false,
      className:
        "[&_[role='radio'][data-active='true']]:ring-2 [&_[role='radio'][data-active='true']]:ring-ring/50 [&_[role='radio'][data-active='true']]:ring-offset-1 [&_[role='radio'][data-active='true']]:ring-offset-background",
    };
  }
  if (state === "disabled") {
    return { value: "map", disabled: true, className: undefined };
  }
  return { value: "map", disabled: false, className: undefined };
}

function ToggleVariantExamplePanel({
  title,
  description,
  mode,
  initialSize,
}: {
  title: string;
  description: string;
  mode: "label" | "icon";
  initialSize: (typeof TOGGLE_DOC_SIZES)[number]["id"];
}) {
  const [size, setSize] = useState<(typeof TOGGLE_DOC_SIZES)[number]["id"]>(initialSize);
  const [state, setState] = useState<(typeof TOGGLE_DOC_STATES)[number]["id"]>("default");
  const [value, setValue] = useState("map");
  const sizeHeightPx = TOGGLE_DOC_SIZES.find((entry) => entry.id === size)?.heightPx ?? 36;
  const statePresentation = getToggleStatePresentation(state);
  const activeValue = statePresentation.value ?? value;
  const options = mode === "icon" ? ICON_OPTIONS : LABEL_OPTIONS;

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="space-y-1">
        <DocSubheading>{title}</DocSubheading>
        <DocLead>{description}</DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full space-y-6">
        <SizeTabList value={size} onValueChange={setSize} />
        <StateTabList value={state} onValueChange={setState} />
        <div
          className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-border bg-muted/25 p-8"
          aria-label={`${title} preview`}
        >
          <ToggleSwitch
            value={activeValue}
            onValueChange={setValue}
            size={size}
            options={options}
            disabled={statePresentation.disabled}
            className={statePresentation.className}
            aria-label={`${title} toggle switch`}
          />
        </div>
        <DocCodeBlock>{`// size="${size}" → ${sizeHeightPx}px control height
// state="${state}"
<ToggleSwitch
  size="${size}"
  value="${activeValue}"
  onValueChange={setValue}
  ${statePresentation.disabled ? "disabled" : ""}
  options={[
    { value: "map", ${mode === "icon" ? "icon: <Info className=\"size-4\" />" : 'label: "Map"'} },
    { value: "table", ${mode === "icon" ? "icon: <CheckCircle2 className=\"size-4\" />" : 'label: "Table"'} },
  ]}
  aria-label="${title} toggle switch"
/>`}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

function ToggleVariantExamplesBlock() {
  return (
    <div className="space-y-10">
      <ToggleVariantExamplePanel
        title="Default"
        description="Baseline two-state switch with text labels. Use this as the standard toggle in forms and top-level view switches."
        mode="label"
        initialSize="default"
      />
      <ToggleVariantExamplePanel
        title="Small"
        description="Compact text-label version for dense toolbars and table controls where vertical space is limited."
        mode="label"
        initialSize="sm"
      />
      <ToggleVariantExamplePanel
        title="Label"
        description="Label-first content mode for clearly named states. Keep labels short, distinct, and action-oriented."
        mode="label"
        initialSize="default"
      />
      <ToggleVariantExamplePanel
        title="Icon"
        description="Icon-only content mode for highly contextual toggles. Pair with clear aria labels for accessibility."
        mode="icon"
        initialSize="default"
      />
    </div>
  );
}

function ToggleReferenceMatrixShowcase() {
  const [selectedSize, setSelectedSize] = useState<(typeof TOGGLE_DOC_SIZES)[number]["id"]>("default");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Reference: variants × states</DocSubheading>
        <DocLead>
          Full matrix for <CodeInline>default</CodeInline>, <CodeInline>small</CodeInline>,{" "}
          <CodeInline>label</CodeInline>, and <CodeInline>icon</CodeInline> variants across interaction states.
        </DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full overflow-x-auto">
        <p className="ds-doc-font mb-6 text-sm text-muted-foreground">
          Use the size control to inspect visual density; default and small rows stay locked to their canonical sizes.
        </p>
        <div className="mb-6">
          <SizeTabList value={selectedSize} onValueChange={setSelectedSize} />
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[140px] pb-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Variant</th>
                {TOGGLE_DOC_STATES.map(({ id, label }) => (
                  <th key={id} className="px-2 pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([
                { id: "default", label: "Default", mode: "label", fixedSize: "default" },
                { id: "small", label: "Small", mode: "label", fixedSize: "sm" },
                { id: "label", label: "Label", mode: "label", fixedSize: null },
                { id: "icon", label: "Icon", mode: "icon", fixedSize: null },
              ] as const).map(({ id, label, mode, fixedSize }) => (
                <tr key={id} className="border-b border-border/60 last:border-b-0">
                  <td className="w-[140px] py-4 pr-4 align-middle text-sm font-medium text-foreground">{label}</td>
                  {TOGGLE_DOC_STATES.map(({ id: stateId }) => {
                    const statePresentation = getToggleStatePresentation(stateId);
                    const options = mode === "icon" ? ICON_OPTIONS : LABEL_OPTIONS;
                    const size = fixedSize ?? selectedSize;
                    return (
                    <td key={`${id}-${stateId}`} className="px-2 py-4 align-middle">
                      <div className="flex justify-center">
                        <ToggleSwitch
                          size={size}
                          value={statePresentation.value}
                          options={options}
                          disabled={statePresentation.disabled}
                          className={statePresentation.className}
                          aria-label={`${label} variant ${stateId} state`}
                        />
                      </div>
                    </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShowcaseCard>
    </div>
  );
}

export interface ToggleSwitchShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function ToggleSwitchShowcaseSection({
  overline,
  title = "Toggle Switch",
  description,
}: ToggleSwitchShowcaseSectionProps) {
  return (
    <section id="toggle-switch" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <ToggleVariantExamplesBlock />
        <ToggleReferenceMatrixShowcase />
      </div>
    </section>
  );
}
