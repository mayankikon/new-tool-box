"use client";

import { useState } from "react";

import { TEMPLATE_FILTERS, type TemplateFilterOption } from "@/lib/templates/mock-data";
import { cn } from "@/lib/utils";

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
    <h3 className="ds-doc-font text-lg font-medium tracking-tight text-foreground">
      {children}
    </h3>
  );
}

function DocLead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("ds-doc-font text-sm text-muted-foreground", className)}>{children}</p>;
}

function SmartMarketingTemplatesVariantPanel() {
  const [activeFilter, setActiveFilter] = useState<TemplateFilterOption["id"]>("all");

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="space-y-1">
        <DocSubheading>Tabs</DocSubheading>
        <DocLead>
          Matches the Templates page lifecycle tab buttons in Smart Marketing (`/marketing/templates`): 32px control
          height, rounded-sm shape, and active/inactive border-fill treatment.
        </DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          {TEMPLATE_FILTERS.map((filter) => {
            const isActive = filter.id === activeFilter;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "inline-flex h-8 items-center rounded-sm border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  isActive
                    ? "border-foreground/15 bg-foreground/6 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground",
                )}
                aria-pressed={isActive}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        <DocCodeBlock>{`{TEMPLATE_FILTERS.map((filter) => {
  const isActive = filter.id === activeFilter;
  return (
    <button
      key={filter.id}
      className={cn(
        "inline-flex h-8 items-center rounded-sm border px-3 text-xs font-medium ...",
        isActive
          ? "border-foreground/15 bg-foreground/6 text-foreground"
          : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground",
      )}
    >
      {filter.label}
    </button>
  );
})}`}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

export interface TabsShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function TabsShowcaseSection({
  overline,
  title = "Tabs",
  description,
}: TabsShowcaseSectionProps) {
  return (
    <section id="tabs" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <SmartMarketingTemplatesVariantPanel />
      </div>
    </section>
  );
}
