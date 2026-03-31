"use client";

import { radiusTokens } from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { TokenSwatch } from "../atoms/TokenSwatch";
import { CodeInline } from "../atoms/CodeInline";

export function RadiusSection() {
  return (
    <section id="radius" className="scroll-mt-28 space-y-8">
      <SectionTitle
        title="Radius"
        description={
          <>
            From <CodeInline size="sm">design-tokens/radius.json</CodeInline> (layout-primitives.css). Border radius tokens for consistent rounding across components.
          </>
        }
      />
      <ShowcaseCard padding="lg" className="flex flex-wrap gap-6">
        {radiusTokens.map((token) => (
          <TokenSwatch
            key={token.name}
            type="radius"
            name={token.name}
            tailwindClass={token.tailwindClass}
          />
        ))}
      </ShowcaseCard>
    </section>
  );
}
