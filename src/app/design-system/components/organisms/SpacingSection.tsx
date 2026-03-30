"use client";

import { spacingTokens } from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { TokenSwatch } from "../atoms/TokenSwatch";
import { CodeInline } from "../atoms/CodeInline";

export function SpacingSection() {
  return (
    <section id="spacing" className="scroll-mt-28 space-y-8">
      <SectionTitle
        title="Spacing"
        description={
          <>
            From <CodeInline size="sm">Spacing.json</CodeInline>. Figma scale (px); use <CodeInline size="sm">var(--spacing-*)</CodeInline> when you need these values. Tailwind utilities (<CodeInline size="sm">p-4</CodeInline>, <CodeInline size="sm">gap-2</CodeInline>) use Tailwind&apos;s default scale.
          </>
        }
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
