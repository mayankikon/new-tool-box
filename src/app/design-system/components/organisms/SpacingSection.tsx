"use client";

import { spacingTokens } from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { TokenSwatch } from "../atoms/TokenSwatch";

export function SpacingSection() {
  return (
    <section id="spacing" className="scroll-mt-28 space-y-8">
      <SectionTitle
        overline="Foundations"
        title="Spacing"
        description="Spacing creates rhythm, structure, and clarity between related interface elements."
      />
      <ShowcaseCard padding="lg" className="flex flex-wrap items-end gap-4">
        {spacingTokens.map((size) => (
          <TokenSwatch
            key={size}
            type="spacing"
            name={size}
            size={size}
          />
        ))}
      </ShowcaseCard>
    </section>
  );
}
