"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BUTTON_SHOWCASE_SIZES,
  BUTTON_SHOWCASE_VARIANTS,
  BUTTON_SHOWCASE_STATES,
  BUTTON_HOVER_LOOK,
  BUTTON_ACTIVE_LOOK,
  BUTTON_DOC_TEXT_SIZES,
  BUTTON_DOC_VARIANT_EXAMPLES,
} from "../../design-system-constants";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { CodeInline } from "../atoms/CodeInline";

/** Matches lifecycle filter pills on `Templates` (`src/components/templates/templates-page.tsx`). */
function TemplatesPageStyleTabList<T extends string>({
  options,
  value,
  onValueChange,
}: {
  options: readonly { id: T; label: string; heightPx: number }[];
  value: T;
  onValueChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map(({ id, label, heightPx }) => {
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
  );
}

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

type ButtonDocTextSizeId = (typeof BUTTON_DOC_TEXT_SIZES)[number]["id"];

function VariantExamplePanel({
  variantId,
  title,
  description,
}: {
  variantId: (typeof BUTTON_DOC_VARIANT_EXAMPLES)[number]["id"];
  title: string;
  description: string;
}) {
  const [size, setSize] = useState<ButtonDocTextSizeId>("md");
  const sizeHeightPx =
    BUTTON_DOC_TEXT_SIZES.find((row) => row.id === size)?.heightPx ?? 36;

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="space-y-1">
        <DocSubheading>{title}</DocSubheading>
        <DocLead>{description}</DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full space-y-6">
        <TemplatesPageStyleTabList options={BUTTON_DOC_TEXT_SIZES} value={size} onValueChange={setSize} />
        <div
          className="flex min-h-[140px] items-center justify-center rounded-md border border-dashed border-border bg-muted/25 p-8"
          aria-label={`${title} preview`}
        >
          <Button type="button" variant={variantId} size={size}>
            Button
          </Button>
        </div>
        <DocCodeBlock>{`// size="${size}" → ${sizeHeightPx}px control height
<Button variant="${variantId}" size="${size}">
  Button
</Button>`}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

function ButtonVariantExamplesBlock() {
  return (
    <div className="space-y-10">
      {BUTTON_DOC_VARIANT_EXAMPLES.map(({ id, title, description }) => (
        <VariantExamplePanel key={id} variantId={id} title={title} description={description} />
      ))}
    </div>
  );
}

function ButtonReferenceMatrixShowcase() {
  const [selectedSize, setSelectedSize] = useState<typeof BUTTON_SHOWCASE_SIZES[number]["id"]>("md");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Reference: variants × states</DocSubheading>
        <DocLead>
          Full matrix of variants and interaction states at a chosen size. Optional <CodeInline>leadingIcon</CodeInline>,{" "}
          <CodeInline>trailingIcon</CodeInline>, <CodeInline>badge</CodeInline>.{" "}
          <a
            href="https://www.figma.com/design/SWdPHuoLpCP03Ottx8g5GT/Sort-UI-%E2%80%94-1.3-Playground?node-id=13769-26313"
            className="text-primary underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Figma (node 13769-26313)
          </a>
          .
        </DocLead>
      </div>

      <ShowcaseCard padding="lg" className="w-full max-w-full overflow-x-auto">
        <p className="ds-doc-font text-sm text-muted-foreground mb-6">
          Design system button with 7 variants, 5 sizes, and 6 states. All colors bound to design tokens.
        </p>

        <h4 className="ds-doc-font text-sm font-medium text-foreground uppercase tracking-wide mb-3">Sizes (matrix)</h4>
        <div className="flex flex-wrap items-end gap-4 mb-8">
          {BUTTON_SHOWCASE_SIZES.map(({ id, label, px }) => (
            <div
              key={id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedSize(id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedSize(id);
                }
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1.5 rounded-md border-2 p-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selectedSize === id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted/50"
              )}
              aria-pressed={selectedSize === id}
            >
              <Button variant="default" size={id} className="pointer-events-none" tabIndex={-1}>
                {label}
              </Button>
              <span className="text-xs font-medium tabular-nums">{px}px</span>
            </div>
          ))}
        </div>

        <h4 className="ds-doc-font text-sm font-medium text-foreground uppercase tracking-wide mb-3">Variants × States</h4>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground w-[100px]">Variant</th>
                {BUTTON_SHOWCASE_STATES.map(({ label }) => (
                  <th key={label} className="pb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground text-center last:pr-0">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUTTON_SHOWCASE_VARIANTS.map(({ id: variantId, label: variantLabel }) => (
                <tr key={variantId} className="border-b border-border/60 last:border-b-0">
                  <td className="py-3 pr-4 text-sm font-medium text-foreground align-middle w-[100px]">{variantLabel}</td>
                  {BUTTON_SHOWCASE_STATES.map(({ id: stateId, label: stateLabel, forceClassName }) => {
                    const isDisabled = stateId === "disabled";
                    const isLoading = stateId === "loading";
                    const hoverClass = stateId === "hover" ? BUTTON_HOVER_LOOK[variantId] : undefined;
                    const activeClass = stateId === "active" ? BUTTON_ACTIVE_LOOK[variantId] : undefined;
                    const focusClass = stateId === "focus" ? forceClassName : undefined;
                    const cellClass = cn(hoverClass, activeClass, focusClass);

                    return (
                      <td key={stateLabel} className="py-3 px-2 last:pr-0 align-middle">
                        <div className="flex justify-center">
                          <Button
                            variant={variantId}
                            size={selectedSize}
                            disabled={isDisabled}
                            loading={isLoading}
                            className={cellClass}
                          >
                            Button
                          </Button>
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

export interface ButtonShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function ButtonShowcaseSection({
  overline,
  title = "Buttons",
  description,
}: ButtonShowcaseSectionProps) {
  return (
    <section id="button" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <ButtonVariantExamplesBlock />
        <ButtonReferenceMatrixShowcase />
      </div>
    </section>
  );
}
