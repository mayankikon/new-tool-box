"use client";

import { useMemo, useState } from "react";

import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { CodeInline } from "../atoms/CodeInline";

type ProgressVariant = NonNullable<React.ComponentProps<typeof ProgressBar>["variant"]>;

const PROGRESS_VARIANTS = [
  {
    id: "linear" as const,
    title: "Linear",
    description: "Continuous fill bar for uploads, tasks, and long-running operations.",
  },
  {
    id: "dashed" as const,
    title: "Dashed",
    description: "Segmented progress for step-based workflows and finite milestone tracking.",
  },
] as const;

const PROGRESS_STATES = [
  { id: "empty" as const, label: "Empty", value: 0 },
  { id: "mid" as const, label: "In progress", value: 60 },
  { id: "done" as const, label: "Complete", value: 100 },
] as const;

const PROGRESS_DENSITIES = [
  {
    id: "sm" as const,
    label: "SM",
    className:
      "[&_[data-slot=progress-bar-label]]:text-xs [&_[data-slot=progress-bar-value]]:text-xs [&_[data-slot=progress-bar-track]]:h-1 [&_[data-slot=progress-bar-caption]]:text-[11px]",
    heightPx: 4,
  },
  {
    id: "md" as const,
    label: "MD",
    className: "",
    heightPx: 4,
  },
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

function ToggleTabs<T extends string | number>({
  title,
  value,
  onValueChange,
  options,
}: {
  title: string;
  value: T;
  onValueChange: (next: T) => void;
  options: readonly { id: T; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-wrap items-center gap-2">
        {options.map(({ id, label }) => {
          const isActive = id === value;
          return (
            <button
              key={String(id)}
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

function VariantExamplePanel({
  variant,
  title,
  description,
}: {
  variant: ProgressVariant;
  title: string;
  description: string;
}) {
  const [value, setValue] = useState(60);
  const [density, setDensity] = useState<(typeof PROGRESS_DENSITIES)[number]["id"]>("md");
  const [showMeta, setShowMeta] = useState(true);

  const densityToken = PROGRESS_DENSITIES.find((row) => row.id === density) ?? PROGRESS_DENSITIES[1];

  const code = useMemo(
    () => `<ProgressBar
  variant="${variant}"
  value={${value}}
  label="Campaign upload"
  caption="Step 2 of 4"
  hideValue={${!showMeta}}
  className="${densityToken.className}"
/>`,
    [densityToken.className, showMeta, value, variant],
  );

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="space-y-1">
        <DocSubheading>{title}</DocSubheading>
        <DocLead>{description}</DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
          <ToggleTabs
            title="Progress"
            value={value}
            onValueChange={setValue}
            options={[
              { id: 0, label: "0%" },
              { id: 20, label: "20%" },
              { id: 60, label: "60%" },
              { id: 80, label: "80%" },
              { id: 100, label: "100%" },
            ]}
          />
          <ToggleTabs
            title="Density"
            value={density}
            onValueChange={(next) => setDensity(next as (typeof PROGRESS_DENSITIES)[number]["id"])}
            options={PROGRESS_DENSITIES.map((row) => ({ id: row.id, label: `${row.label} · ${row.heightPx}px` }))}
          />
          <ToggleTabs
            title="Metadata"
            value={showMeta ? "show" : "hide"}
            onValueChange={(next) => setShowMeta(next === "show")}
            options={[
              { id: "show", label: "Label + value" },
              { id: "hide", label: "Track only" },
            ]}
          />
        </div>

        <div className="rounded-md border border-dashed border-border bg-muted/25 p-8">
          <div className="mx-auto w-full max-w-[520px]">
            <ProgressBar
              variant={variant}
              value={value}
              label={showMeta ? "Campaign upload" : undefined}
              caption={showMeta ? "Step 2 of 4" : undefined}
              hideValue={!showMeta}
              className={densityToken.className}
            />
          </div>
        </div>
        <DocCodeBlock>{code}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

function ProgressVariantsBlock() {
  return (
    <div className="space-y-10">
      {PROGRESS_VARIANTS.map(({ id, title, description }) => (
        <VariantExamplePanel key={id} variant={id} title={title} description={description} />
      ))}
    </div>
  );
}

function ProgressReferenceMatrix() {
  const [density, setDensity] = useState<(typeof PROGRESS_DENSITIES)[number]["id"]>("md");
  const densityToken = PROGRESS_DENSITIES.find((row) => row.id === density) ?? PROGRESS_DENSITIES[1];

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Reference: variants × states</DocSubheading>
        <DocLead>
          Compare <CodeInline>linear</CodeInline> and <CodeInline>dashed</CodeInline> variants across key progress
          states with a shared density scale.
        </DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full overflow-x-auto space-y-6">
        <ToggleTabs
          title="Density (matrix)"
          value={density}
          onValueChange={(next) => setDensity(next as (typeof PROGRESS_DENSITIES)[number]["id"])}
          options={PROGRESS_DENSITIES.map((row) => ({ id: row.id, label: `${row.label} · ${row.heightPx}px` }))}
        />
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[140px] pb-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Variant</th>
                {PROGRESS_STATES.map(({ id, label }) => (
                  <th key={id} className="px-2 pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROGRESS_VARIANTS.map(({ id, title }) => (
                <tr key={id} className="border-b border-border/60 last:border-b-0">
                  <td className="w-[140px] py-4 pr-4 align-middle text-sm font-medium text-foreground">{title}</td>
                  {PROGRESS_STATES.map(({ id: stateId, value }) => (
                    <td key={`${id}-${stateId}`} className="px-2 py-4 align-middle">
                      <div className="mx-auto w-full max-w-[240px]">
                        <ProgressBar
                          variant={id}
                          value={value}
                          label="Upload"
                          caption={`${value}% complete`}
                          className={densityToken.className}
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ShowcaseCard>
    </div>
  );
}

export interface ProgressBarShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function ProgressBarShowcaseSection({
  overline,
  title = "Progress Bar",
  description,
}: ProgressBarShowcaseSectionProps) {
  return (
    <section id="progress-bar" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <ProgressVariantsBlock />
        <ProgressReferenceMatrix />
      </div>
    </section>
  );
}
