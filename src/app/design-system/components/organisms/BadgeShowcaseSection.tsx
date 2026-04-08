"use client";

import { useState } from "react";
import { Badge, BadgeDot, type BadgeTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BADGE_DOC_TONES,
  BADGE_DOC_VARIANT_EXAMPLES,
  BADGE_SHOWCASE_MATRIX_VARIANTS,
} from "../../design-system-constants";
import { CodeInline } from "../atoms/CodeInline";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";

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

/** Compact size + shape pickers (matches button doc: secondary row after main “tone” control). */
function BadgeSizeShapeTabList<Size extends string, Shape extends string>({
  sizes,
  shapes,
  size,
  shape,
  onSizeChange,
  onShapeChange,
}: {
  sizes: readonly { id: Size; label: string }[];
  shapes: readonly { id: Shape; label: string }[];
  size: Size;
  shape: Shape;
  onSizeChange: (next: Size) => void;
  onShapeChange: (next: Shape) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
      <div className="space-y-1.5">
        <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">Size</p>
        <div className="flex flex-wrap items-center gap-2">
          {sizes.map(({ id, label }) => {
            const isActive = id === size;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSizeChange(id)}
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
      <div className="space-y-1.5">
        <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">Shape</p>
        <div className="flex flex-wrap items-center gap-2">
          {shapes.map(({ id, label }) => {
            const isActive = id === shape;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onShapeChange(id)}
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
    </div>
  );
}

function ToneSelectionGrid({
  value,
  onValueChange,
}: {
  value: BadgeTone;
  onValueChange: (next: BadgeTone) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">Tone</p>
      <div className="max-h-[148px] overflow-y-auto rounded-md border border-border/80 bg-muted/20 p-2 pr-1">
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
          {BADGE_DOC_TONES.map(({ id, label }) => {
            const isActive = id === value;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onValueChange(id)}
                className={cn(
                  "inline-flex min-h-8 items-center justify-center rounded-sm border px-1.5 py-1 text-[11px] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "border-foreground/15 bg-foreground/6 text-foreground"
                    : "border-transparent bg-background/80 text-muted-foreground hover:border-foreground/10 hover:bg-muted/50 hover:text-foreground",
                )}
                aria-pressed={isActive}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type BadgeDocVariantId = (typeof BADGE_DOC_VARIANT_EXAMPLES)[number]["id"];

function VariantExamplePanel({
  variantId,
  title,
  description,
}: {
  variantId: BadgeDocVariantId;
  title: string;
  description: string;
}) {
  const [tone, setTone] = useState<BadgeTone>("green");
  const [size, setSize] = useState<"sm" | "md">("md");
  const [shape, setShape] = useState<"default" | "pill">("pill");

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="space-y-1">
        <DocSubheading>{title}</DocSubheading>
        <DocLead>{description}</DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full space-y-6">
        <ToneSelectionGrid value={tone} onValueChange={setTone} />
        <BadgeSizeShapeTabList
          sizes={[
            { id: "sm" as const, label: "sm" },
            { id: "md" as const, label: "md" },
          ]}
          shapes={[
            { id: "default" as const, label: "rounded" },
            { id: "pill" as const, label: "pill" },
          ]}
          size={size}
          shape={shape}
          onSizeChange={setSize}
          onShapeChange={setShape}
        />
        <div
          className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-border bg-muted/25 p-8"
          aria-label={`${title} preview`}
        >
          <Badge variant={variantId} tone={tone} size={size} shape={shape}>
            <span className="inline-flex items-center gap-1.5">
              <BadgeDot tone={tone} />
              Status
            </span>
          </Badge>
        </div>
        <DocCodeBlock>{`<Badge variant="${variantId}" tone="${tone}" size="${size}" shape="${shape}">
  <span className="inline-flex items-center gap-1.5">
    <BadgeDot tone="${tone}" />
    Status
  </span>
</Badge>`}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

function BadgeVariantExamplesBlock() {
  return (
    <div className="space-y-10">
      {BADGE_DOC_VARIANT_EXAMPLES.map(({ id, title, description }) => (
        <VariantExamplePanel key={id} variantId={id} title={title} description={description} />
      ))}
    </div>
  );
}

function BadgeReferenceMatrixShowcase() {
  const [selectedTone, setSelectedTone] = useState<BadgeTone>("green");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Reference: variants × sizes</DocSubheading>
        <DocLead>
          Pick a tone to preview every tone-aware variant at <CodeInline>sm</CodeInline> and <CodeInline>md</CodeInline>{" "}
          (pill shape, with dot). Same idea as the button matrix sizing row—here the dimension is tone.
        </DocLead>
      </div>

      <ShowcaseCard padding="lg" className="w-full max-w-full overflow-x-auto">
        <p className="ds-doc-font mb-6 text-sm text-muted-foreground">
          Soft, outline, ghost, and link variants share the same tone ramp. Default / secondary / destructive badges use
          separate styles—see the component API in code.
        </p>

        <h4 className="ds-doc-font mb-3 text-sm font-medium uppercase tracking-wide text-foreground">Tone (matrix)</h4>
        <div className="mb-8 flex max-h-[160px] flex-wrap gap-2 overflow-y-auto rounded-md border border-border/60 bg-muted/15 p-3">
          {BADGE_DOC_TONES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSelectedTone(id)}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1.5 rounded-md border-2 p-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selectedTone === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50",
              )}
              aria-pressed={selectedTone === id}
            >
              <Badge variant="soft" tone={id} size="sm" shape="pill" className="pointer-events-none" tabIndex={-1}>
                <span className="inline-flex items-center gap-1">
                  <BadgeDot tone={id} />
                  {label}
                </span>
              </Badge>
            </button>
          ))}
        </div>

        <h4 className="ds-doc-font mb-3 text-sm font-medium uppercase tracking-wide text-foreground">Variants × Sizes</h4>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[100px] pb-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Variant
                </th>
                <th className="px-2 pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground last:pr-0">
                  sm
                </th>
                <th className="px-2 pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground last:pr-0">
                  md
                </th>
              </tr>
            </thead>
            <tbody>
              {BADGE_SHOWCASE_MATRIX_VARIANTS.map(({ id: variantId, label: variantLabel }) => (
                <tr key={variantId} className="border-b border-border/60 last:border-b-0">
                  <td className="w-[100px] py-3 pr-4 align-middle text-sm font-medium text-foreground">{variantLabel}</td>
                  {(["sm", "md"] as const).map((sz) => (
                    <td key={sz} className="px-2 py-3 align-middle last:pr-0">
                      <div className="flex justify-center">
                        <Badge variant={variantId} tone={selectedTone} size={sz} shape="pill">
                          <span className="inline-flex items-center gap-1.5">
                            <BadgeDot tone={selectedTone} />
                            Label
                          </span>
                        </Badge>
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

export interface BadgeShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function BadgeShowcaseSection({
  overline,
  title = "Badge",
  description,
}: BadgeShowcaseSectionProps) {
  return (
    <section id="badge" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <BadgeVariantExamplesBlock />
        <BadgeReferenceMatrixShowcase />
      </div>
    </section>
  );
}
