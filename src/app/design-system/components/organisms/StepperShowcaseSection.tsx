"use client";

import { useMemo, useState } from "react";

import { StepperHorizontal } from "@/components/ui/stepper-horizontal";
import { StepperVertical } from "@/components/ui/stepper-vertical";
import { cn } from "@/lib/utils";

import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { CodeInline } from "../atoms/CodeInline";

const STEPPER_STEPS = [
  { label: "Audience", caption: "Pick segment" },
  { label: "Message", caption: "Compose content" },
  { label: "Schedule", caption: "Set timing" },
  { label: "Launch", caption: "Go live" },
] as const;

const STEPPER_VARIANTS = [
  {
    id: "horizontal" as const,
    title: "Horizontal",
    description: "Best for page headers and wizard top rails with clear left-to-right progress.",
  },
  {
    id: "vertical" as const,
    title: "Vertical",
    description: "Best for long forms and detailed flows where each step has supporting text.",
  },
] as const;

const STEPPER_STATES = [
  { id: "start" as const, label: "Start", currentStep: 0 },
  { id: "middle" as const, label: "Middle", currentStep: 1 },
  { id: "end" as const, label: "End", currentStep: 3 },
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

function StepTabList({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (next: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">Current step</p>
      <div className="flex flex-wrap items-center gap-2">
        {STEPPER_STEPS.map((step, index) => {
          const isActive = index === value;
          return (
            <button
              key={step.label}
              type="button"
              onClick={() => onValueChange(index)}
              className={cn(
                "inline-flex min-h-8 items-center rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "border-foreground/15 bg-foreground/6 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground",
              )}
              aria-pressed={isActive}
            >
              {index + 1}. {step.label}
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
  variant: (typeof STEPPER_VARIANTS)[number]["id"];
  title: string;
  description: string;
}) {
  const [currentStep, setCurrentStep] = useState(1);

  const code = useMemo(() => {
    if (variant === "horizontal") {
      return `<StepperHorizontal
  steps={steps}
  currentStep={${currentStep}}
  align="left"
/>`;
    }
    return `<StepperVertical
  steps={steps.map((step) => ({ ...step, supportText: step.caption }))}
  currentStep={${currentStep}}
  align="left"
/>`;
  }, [currentStep, variant]);

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="space-y-1">
        <DocSubheading>{title}</DocSubheading>
        <DocLead>{description}</DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full space-y-6">
        <StepTabList value={currentStep} onValueChange={setCurrentStep} />
        <div className="rounded-md border border-dashed border-border bg-muted/25 p-6">
          {variant === "horizontal" ? (
            <StepperHorizontal steps={[...STEPPER_STEPS]} currentStep={currentStep} align="left" />
          ) : (
            <div className="max-w-md">
              <StepperVertical
                steps={STEPPER_STEPS.map((step) => ({ ...step, supportText: step.caption }))}
                currentStep={currentStep}
              />
            </div>
          )}
        </div>
        <DocCodeBlock>{code}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

function StepperVariantsBlock() {
  return (
    <div className="space-y-10">
      {STEPPER_VARIANTS.map(({ id, title, description }) => (
        <VariantExamplePanel key={id} variant={id} title={title} description={description} />
      ))}
    </div>
  );
}

function StepperReferenceMatrix() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Reference: variants × states</DocSubheading>
        <DocLead>
          Compare <CodeInline>horizontal</CodeInline> and <CodeInline>vertical</CodeInline> stepper behavior at start,
          middle, and end progress states.
        </DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full overflow-x-auto">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[160px] pb-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Variant</th>
                {STEPPER_STATES.map(({ id, label }) => (
                  <th key={id} className="px-2 pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STEPPER_VARIANTS.map(({ id, title }) => (
                <tr key={id} className="border-b border-border/60 last:border-b-0">
                  <td className="w-[160px] py-4 pr-4 align-top text-sm font-medium text-foreground">{title}</td>
                  {STEPPER_STATES.map(({ id: stateId, currentStep }) => (
                    <td key={`${id}-${stateId}`} className="px-2 py-4 align-top">
                      {id === "horizontal" ? (
                        <div className="min-w-[220px]">
                          <StepperHorizontal steps={[...STEPPER_STEPS]} currentStep={currentStep} align="left" />
                        </div>
                      ) : (
                        <div className="min-w-[220px]">
                          <StepperVertical
                            steps={STEPPER_STEPS.map((step) => ({ ...step, supportText: step.caption }))}
                            currentStep={currentStep}
                          />
                        </div>
                      )}
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

export interface StepperShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function StepperShowcaseSection({
  overline,
  title = "Stepper",
  description,
}: StepperShowcaseSectionProps) {
  return (
    <section id="stepper" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <StepperVariantsBlock />
        <StepperReferenceMatrix />
      </div>
    </section>
  );
}
