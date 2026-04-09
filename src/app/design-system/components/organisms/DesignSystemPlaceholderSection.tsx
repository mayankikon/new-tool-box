"use client";

import Link from "next/link";

import { SectionTitle } from "../atoms/SectionTitle";

export interface DesignSystemPlaceholderSectionProps {
  id: string;
  title: string;
  overline?: string;
}

/**
 * Stub for nav entries that do not have a dedicated showcase organism yet.
 */
export function DesignSystemPlaceholderSection({
  id,
  title,
  overline,
}: DesignSystemPlaceholderSectionProps) {
  return (
    <section id={id} className="scroll-mt-28 space-y-8">
      <SectionTitle
        overline={overline}
        title={title}
        description={
          <>
            Live showcase not wired in this build. Try{" "}
            <Link href="/design-playground" className="text-primary underline-offset-2 hover:underline">
              Design playground
            </Link>{" "}
            for experimental variants, or see{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-sm">docs/design-system-audit.md</code>.
          </>
        }
      />
      <div className="rounded-sm border border-dashed border-border bg-muted/20 p-10 text-center">
        <p className="ds-doc-font text-sm text-muted-foreground">Showcase coming soon.</p>
      </div>
    </section>
  );
}
