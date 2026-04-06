"use client";

import { strokeTokens } from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { TokenSwatch } from "../atoms/TokenSwatch";

export function StrokeSection() {
  return (
    <section id="stroke" className="scroll-mt-28 space-y-8">
      <SectionTitle
        overline="Foundations"
        title="Stroke"
        description="Stroke tokens define border weight and separation for components and layout chrome."
      />
      <ShowcaseCard padding="lg" className="space-y-3">
        {strokeTokens.map((token) => (
          <TokenSwatch
            key={token.name}
            type="stroke"
            name={token.name}
            value={token.value}
          />
        ))}
      </ShowcaseCard>
    </section>
  );
}
