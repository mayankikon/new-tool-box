"use client";

import { themeTokenGroups } from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { TokenGroupCard } from "../molecules/TokenGroupCard";
import { TokenSwatch } from "../atoms/TokenSwatch";
import { CodeInline } from "../atoms/CodeInline";

export function ThemeTokensSection() {
  return (
    <section className="space-y-8">
      <SectionTitle
        title="Theme tokens"
        description={
          <>
            Semantic colors from <CodeInline size="sm">design-tokens/themes.json</CodeInline> (Toolbox-Light / Toolbox-Dark). Drive <CodeInline size="sm">--background</CodeInline>, <CodeInline size="sm">--primary</CodeInline>, etc.
          </>
        }
      />
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
