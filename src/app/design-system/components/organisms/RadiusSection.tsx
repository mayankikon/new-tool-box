"use client";

import { radiusTokens } from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { TokenSwatch } from "../atoms/TokenSwatch";

export function RadiusSection() {
  return (
    <section id="radius" className="scroll-mt-28 space-y-8">
      <SectionTitle
        overline="Foundations"
        title="Radius"
        description="Radius tokens control corner curvature to keep surfaces and controls visually consistent."
      />
      <ShowcaseCard padding="lg" className="flex flex-wrap gap-6">
        {radiusTokens.map((token) => (
          <TokenSwatch
            key={token.name}
            type="radius"
            name={token.name}
            value={token.value}
            tailwindClass={token.tailwindClass}
          />
        ))}
      </ShowcaseCard>
    </section>
  );
}
