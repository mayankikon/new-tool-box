"use client";

import { strokeTokens } from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { TokenSwatch } from "../atoms/TokenSwatch";
import { CodeInline } from "../atoms/CodeInline";

export function StrokeSection() {
  return (
    <section id="stroke" className="scroll-mt-28 space-y-8">
      <SectionTitle
        title="Stroke"
        description={
          <>
            Border width from <CodeInline size="sm">Stroke.json</CodeInline>. Use <CodeInline size="sm">border</CodeInline>, <CodeInline size="sm">border-2</CodeInline>, etc.
          </>
        }
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
