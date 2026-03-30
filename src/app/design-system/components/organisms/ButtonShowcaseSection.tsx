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
} from "../../design-system-constants";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { CodeInline } from "../atoms/CodeInline";

function ButtonComponentShowcase() {
  const [selectedSize, setSelectedSize] = useState<typeof BUTTON_SHOWCASE_SIZES[number]["id"]>("md");

  return (
    <ShowcaseCard padding="lg" className="w-full max-w-full overflow-x-auto">
      <h3 className="ds-doc-font text-lg font-medium text-foreground mb-1">
        Button Component
      </h3>
      <p className="ds-doc-font text-sm text-muted-foreground mb-6">
        Design system button with 7 variants, 5 sizes, and 6 states. All colors bound to design tokens. Optional <CodeInline>leadingIcon</CodeInline>, <CodeInline>trailingIcon</CodeInline>, <CodeInline>badge</CodeInline>.{" "}
        <a href="https://www.figma.com/design/SWdPHuoLpCP03Ottx8g5GT/Sort-UI-%E2%80%94-1.3-Playground?node-id=13769-26313" className="text-primary underline-offset-2 hover:underline" target="_blank" rel="noreferrer">Figma (node 13769-26313)</a>.
      </p>

      <h4 className="ds-doc-font text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Sizes</h4>
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

      <h4 className="ds-doc-font text-sm font-semibold text-foreground uppercase tracking-wide mb-3">Variants × States</h4>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-[100px]">Variant</th>
              {BUTTON_SHOWCASE_STATES.map(({ label }) => (
                <th key={label} className="pb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-center last:pr-0">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BUTTON_SHOWCASE_VARIANTS.map(({ id: variantId, label: variantLabel }) => (
              <tr key={variantId} className="border-b border-border/60 last:border-b-0">
                <td className="py-3 pr-4 text-sm font-medium text-foreground align-middle w-[100px]">
                  {variantLabel}
                </td>
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
  );
}

export function ButtonShowcaseSection() {
  return (
    <section id="button" className="scroll-mt-28 space-y-8">
      <ButtonComponentShowcase />
    </section>
  );
}
