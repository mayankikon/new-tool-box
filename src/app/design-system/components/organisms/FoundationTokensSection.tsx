"use client";

import {
  colorTokenGroups,
  radiusTokens,
  spacingTokens,
  strokeTokens,
} from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { TokenGroupCard } from "../molecules/TokenGroupCard";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { TokenSwatch } from "../atoms/TokenSwatch";
import { CodeInline } from "../atoms/CodeInline";

export function FoundationTokensSection() {
  return (
    <section className="space-y-8">
      <SectionTitle
        title="Foundation tokens"
        description={
          <>
            Semantic colors (wired to theme), radius, spacing, and stroke from Figma. Used via <CodeInline size="sm">globals.css</CodeInline> and layout/theme primitives.
          </>
        }
      />

      <div className="space-y-10">
        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-4">
            Semantic colors
          </h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-3">
            These map to theme tokens (Themes.json) and power shadcn components.
          </p>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {colorTokenGroups.map((group) => (
              <TokenGroupCard key={group.name} title={group.name} padding="md">
                {group.tokens.map((token) => (
                  <TokenSwatch
                    key={token.name}
                    type="color"
                    name={token.name}
                    tailwindClass={token.tailwindClass}
                  />
                ))}
              </TokenGroupCard>
            ))}
          </div>
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-4">Radius</h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-3">
            From <CodeInline>Radius.json</CodeInline> (layout-primitives.css).
          </p>
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
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-4">Spacing</h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-3">
            From <CodeInline>Spacing.json</CodeInline>. Figma scale (px); use <CodeInline>var(--spacing-*)</CodeInline> when you need these values. Tailwind utilities (<CodeInline>p-4</CodeInline>, <CodeInline>gap-2</CodeInline>) use Tailwind's default scale so components keep correct sizing.
          </p>
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
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-4">Stroke</h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-3">
            Border width from <CodeInline>Stroke.json</CodeInline>. Use <CodeInline>border</CodeInline>, <CodeInline>border-2</CodeInline>, etc.
          </p>
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
        </div>
      </div>
    </section>
  );
}
