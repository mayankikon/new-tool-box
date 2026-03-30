"use client";

import { themeTokenGroups } from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { TokenGroupCard } from "../molecules/TokenGroupCard";
import { TokenSwatch } from "../atoms/TokenSwatch";

export function ColorsSection() {
  return (
    <section id="colors" className="scroll-mt-28 space-y-8">
      <SectionTitle title="Colors" description="Theme colors only." />

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {themeTokenGroups.map((group) => (
          <TokenGroupCard key={group.name} title={group.name} padding="md">
            {group.tokens.map((token) =>
              token.type === "bg" ? (
                <TokenSwatch
                  key={token.name}
                  type="color"
                  name={token.name}
                  cssVar={token.cssVar}
                />
              ) : (
                <TokenSwatch
                  key={token.name}
                  type="text"
                  name={token.name}
                  cssVar={token.cssVar}
                />
              )
            )}
          </TokenGroupCard>
        ))}
      </div>
    </section>
  );
}
