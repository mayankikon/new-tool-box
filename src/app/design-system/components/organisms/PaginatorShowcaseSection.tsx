"use client";

import { useMemo, useState } from "react";

import { Paginator, type PaginatorVariant } from "@/components/ui/paginator";
import { cn } from "@/lib/utils";

import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { CodeInline } from "../atoms/CodeInline";

const PAGINATOR_HEIGHT_PX = 28;

const PAGINATOR_VARIANTS = [
  {
    id: "simple" as const,
    title: "Simple",
    description: "Range + Prev/Next buttons. Best for content pages and lower-density layouts.",
  },
  {
    id: "inline" as const,
    title: "Inline",
    description: "Compact table footer variant with icon-only controls.",
  },
  {
    id: "numbered" as const,
    title: "Numbered",
    description: "Page list with direct jumps and ellipsis handling for long sets.",
  },
  {
    id: "dots" as const,
    title: "Dots",
    description: "Minimal page indicator rail for lightweight pagination contexts.",
  },
] as const;

const PAGINATOR_STATES = [
  { id: "first" as const, label: "First page", page: 1 },
  { id: "middle" as const, label: "Middle page", page: 4 },
  { id: "last" as const, label: "Last page", page: 8 },
] as const;

const TOTAL_PAGES = 8;
const TOTAL_ITEMS = 240;
const PAGE_SIZE = 30;

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

function PageTabList({
  value,
  onValueChange,
}: {
  value: number;
  onValueChange: (next: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">Page</p>
      <div className="flex flex-wrap items-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((page) => {
          const isActive = page === value;
          return (
            <button
              key={page}
              type="button"
              onClick={() => onValueChange(page)}
              className={cn(
                "inline-flex min-h-8 min-w-8 items-center justify-center rounded-sm border px-2.5 py-1 text-xs font-medium tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "border-foreground/15 bg-foreground/6 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground",
              )}
              aria-pressed={isActive}
            >
              {page}
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
  variant: PaginatorVariant;
  title: string;
  description: string;
}) {
  const [currentPage, setCurrentPage] = useState(2);

  const code = useMemo(() => {
    const common = `variant="${variant}"
currentPage={${currentPage}}
totalPages={${TOTAL_PAGES}}
onPageChange={setCurrentPage}`;
    if (variant === "simple" || variant === "inline") {
      return `<Paginator
  ${common}
  totalItems={${TOTAL_ITEMS}}
  pageSize={${PAGE_SIZE}}
/>`;
    }
    return `<Paginator
  ${common}
/>`;
  }, [currentPage, variant]);

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="space-y-1">
        <DocSubheading>{title}</DocSubheading>
        <DocLead>{description}</DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full space-y-6">
        <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Size: small (28px)
        </p>
        <PageTabList value={currentPage} onValueChange={setCurrentPage} />
        <div className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-border bg-muted/25 p-8">
          <Paginator
            variant={variant}
            currentPage={currentPage}
            totalPages={TOTAL_PAGES}
            totalItems={TOTAL_ITEMS}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
        <DocCodeBlock>{`// fixed size: small (${PAGINATOR_HEIGHT_PX}px)
${code}`}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

function PaginatorVariantsBlock() {
  return (
    <div className="space-y-10">
      {PAGINATOR_VARIANTS.map(({ id, title, description }) => (
        <VariantExamplePanel key={id} variant={id} title={title} description={description} />
      ))}
    </div>
  );
}

function PaginatorReferenceMatrix() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Reference: variants × states</DocSubheading>
        <DocLead>
          Preview each paginator variant across start, middle, and end states. Variants sharing item
          counts use <CodeInline>totalItems</CodeInline> + <CodeInline>pageSize</CodeInline>.
        </DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full overflow-x-auto space-y-6">
        <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Size: small (28px)
        </p>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1020px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[160px] pb-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Variant</th>
                {PAGINATOR_STATES.map(({ id, label }) => (
                  <th key={id} className="px-2 pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PAGINATOR_VARIANTS.map(({ id, title }) => (
                <tr key={id} className="border-b border-border/60 last:border-b-0">
                  <td className="w-[160px] py-4 pr-4 align-middle text-sm font-medium text-foreground">{title}</td>
                  {PAGINATOR_STATES.map(({ id: stateId, page }) => (
                    <td key={`${id}-${stateId}`} className="px-2 py-4 align-middle">
                      <div className="flex justify-center">
                        <Paginator
                          variant={id}
                          currentPage={page}
                          totalPages={TOTAL_PAGES}
                          totalItems={TOTAL_ITEMS}
                          pageSize={PAGE_SIZE}
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

export interface PaginatorShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function PaginatorShowcaseSection({
  overline,
  title = "Paginator",
  description,
}: PaginatorShowcaseSectionProps) {
  return (
    <section id="paginator" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <PaginatorVariantsBlock />
        <PaginatorReferenceMatrix />
      </div>
    </section>
  );
}
