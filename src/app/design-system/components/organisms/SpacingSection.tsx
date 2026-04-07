"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { radiusTokens, spacingTokens } from "@/lib/design-tokens";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";

/** Token suffix matches pixel distance in `layout-primitives.css` (e.g. `4` → 4px). */
function getSpacingPixelLabel(size: string): string {
  return `${size}px`;
}

function SpacingVisualization({ size }: { size: string }) {
  return (
    <div
      className="rounded-none bg-primary/10 outline outline-1 outline-primary/50 shrink-0"
      style={{
        width: `var(--spacing-${size})`,
        height: `var(--spacing-${size})`,
        minHeight: size === "0" ? 0 : 2,
        minWidth: size === "0" ? 0 : 2,
      }}
      title={`--spacing-${size}`}
      aria-hidden
    />
  );
}

function RadiusVisualization({
  tailwindClass,
  title,
}: {
  tailwindClass: string;
  title: string;
}) {
  return (
    <div
      className={cn(
        "size-[52px] shrink-0 bg-primary/10 outline outline-1 outline-primary/50",
        tailwindClass
      )}
      title={title}
      aria-hidden
    />
  );
}

export function SpacingSection() {
  return (
    <section id="spacing" className="scroll-mt-28 space-y-8">
      <SectionTitle
        overline="Foundations"
        title="Spacing and Layout"
        description="Spacing and corner radius create rhythm, structure, and consistent surfaces across the product."
      />
      <div className="space-y-10">
        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-4">Spacing scale</h3>
          <ShowcaseCard padding="lg" className="bg-neutral-100 shadow-none">
            <Table containerClassName="rounded-none border-0 shadow-none">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className="text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead scope="col" className="text-muted-foreground">
                    Pixels
                  </TableHead>
                  <TableHead scope="col" className="text-muted-foreground">
                    Preview
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spacingTokens.map((size) => (
                  <TableRow key={size} className="hover:bg-sidebar/50">
                    <TableCell className="font-mono text-xs text-foreground">
                      <code className="rounded bg-muted/60 px-1.5 py-0.5">{`--spacing-${size}`}</code>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {getSpacingPixelLabel(size)}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex min-h-10 items-center py-1">
                        <SpacingVisualization size={size} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ShowcaseCard>
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-4">Radius scale</h3>
          <ShowcaseCard padding="lg" className="bg-neutral-100 shadow-none">
            <Table containerClassName="rounded-none border-0 shadow-none">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col" className="text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead scope="col" className="text-muted-foreground">
                    Pixels
                  </TableHead>
                  <TableHead scope="col" className="text-muted-foreground">
                    Preview
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {radiusTokens.map((token) => (
                  <TableRow key={token.cssVar} className="hover:bg-sidebar/50">
                    <TableCell className="font-mono text-xs text-foreground">
                      <code className="rounded bg-muted/60 px-1.5 py-0.5">
                        {token.cssVar}
                      </code>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {token.value}
                    </TableCell>
                    <TableCell className="whitespace-normal">
                      <div className="flex min-h-[52px] items-center py-1">
                        <RadiusVisualization
                          tailwindClass={token.tailwindClass}
                          title={token.tailwindClass}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ShowcaseCard>
        </div>
      </div>
    </section>
  );
}
