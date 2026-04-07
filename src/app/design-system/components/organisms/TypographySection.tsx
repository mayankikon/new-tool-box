"use client";

import { cn } from "@/lib/utils";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";

type TypeScaleRow = {
  name: string;
  size: string;
  lineHeight: string;
  /** Appended inside the label parentheses after size, e.g. uppercase · tracking for overline */
  labelSuffix?: string;
  /** When set, the sample uses these classes instead of inline font-size / line-height */
  sampleClassName?: string;
  sampleText?: string;
};

export function TypographySection() {
  const typeScale: TypeScaleRow[] = [
    { name: "h1", size: "60px", lineHeight: "64px" },
    { name: "h2", size: "48px", lineHeight: "56px" },
    { name: "h3", size: "36px", lineHeight: "44px" },
    { name: "h4", size: "30px", lineHeight: "38px" },
    { name: "h5", size: "24px", lineHeight: "32px" },
    { name: "body-lg", size: "18px", lineHeight: "28px" },
    { name: "body-md", size: "16px", lineHeight: "24px" },
    { name: "body-sm", size: "14px", lineHeight: "20px" },
    {
      name: "overline",
      size: "14px",
      lineHeight: "20px",
      labelSuffix: "uppercase · tracking-wider",
      sampleClassName: "text-sm font-medium uppercase tracking-wider text-muted-foreground",
      sampleText: "Foundations",
    },
    { name: "caption", size: "12px", lineHeight: "16px" },
  ];

  const weights = [
    { name: "normal", value: 400, className: "font-normal" },
    { name: "medium", value: 500, className: "font-medium" },
    { name: "semibold", value: 600, className: "font-semibold" },
  ] as const;

  return (
    <section id="typography" className="scroll-mt-28 space-y-8">
      <SectionTitle overline="Foundations" title="Typography" description="Typography establishes hierarchy, readability, and tone across product experiences." />

      <div className="space-y-10">
        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-4">
            Typeface
          </h3>
          <div className="rounded-sm border border-border bg-neutral-100 dark:bg-card p-4 font-sans">
            <p className="ds-doc-font text-xs text-muted-foreground mb-2">Saira</p>
            <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-4">
            Type scale
          </h3>
          <ShowcaseCard padding="lg" className="space-y-3 bg-neutral-100 shadow-none dark:bg-card">
            {typeScale.map((row) => (
              <div
                key={row.name}
                className="flex items-baseline gap-4 font-sans"
              >
                <span className="ds-doc-font w-44 shrink-0 text-xs text-muted-foreground tabular-nums sm:w-52">
                  {row.name}{" "}
                  <span className="text-muted-foreground/60">
                    (
                    {row.size}
                    {row.labelSuffix != null ? ` · ${row.labelSuffix}` : ""})
                  </span>
                </span>
                {row.sampleClassName != null ? (
                  <span className={cn(row.sampleClassName)}>
                    {row.sampleText ?? "The quick brown fox"}
                  </span>
                ) : (
                  <span style={{ fontSize: row.size, lineHeight: row.lineHeight }}>
                    The quick brown fox
                  </span>
                )}
              </div>
            ))}
          </ShowcaseCard>
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-4">
            Font weights
          </h3>
          <ShowcaseCard padding="lg" className="flex flex-wrap gap-6 bg-neutral-100 shadow-none dark:bg-card">
            {weights.map((weight) => (
              <div key={weight.name} className="flex flex-col gap-1">
                <span className={`text-lg font-sans ${weight.className}`}>Ag</span>
                <span className="ds-doc-font text-xs text-muted-foreground">{weight.name} ({weight.value})</span>
              </div>
            ))}
          </ShowcaseCard>
        </div>
      </div>
    </section>
  );
}
