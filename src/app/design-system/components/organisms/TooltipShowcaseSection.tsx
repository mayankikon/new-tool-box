"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";
import { CodeInline } from "../atoms/CodeInline";

type TooltipThemeId = "black" | "white";
type TooltipPlacementId = "top" | "right" | "bottom" | "left";

const TOOLTIP_THEMES = [
  { id: "black" as const, label: "Black" },
  { id: "white" as const, label: "White" },
] as const;

const TOOLTIP_PLACEMENTS = [
  {
    id: "top" as const,
    label: "Top",
    side: "top" as const,
    align: "center" as const,
    summary: "Opens above the trigger.",
  },
  {
    id: "right" as const,
    label: "Right",
    side: "right" as const,
    align: "center" as const,
    summary: "Opens to the right of the trigger.",
  },
  {
    id: "bottom" as const,
    label: "Bottom",
    side: "bottom" as const,
    align: "center" as const,
    summary: "Opens below the trigger.",
  },
  {
    id: "left" as const,
    label: "Left",
    side: "left" as const,
    align: "center" as const,
    summary: "Opens to the left of the trigger.",
  },
] as const;

function DocCodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
      <code>{children}</code>
    </pre>
  );
}

function DocSubheading({ children }: { children: React.ReactNode }) {
  return <h3 className="ds-doc-font text-lg font-medium tracking-tight text-foreground">{children}</h3>;
}

function DocLead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("ds-doc-font text-sm text-muted-foreground", className)}>{children}</p>;
}

function PickerPills<T extends string>({
  options,
  value,
  onValueChange,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onValueChange: (next: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map(({ id, label }) => {
        const isActive = id === value;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onValueChange(id)}
            className={cn(
              "inline-flex min-h-8 items-center rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isActive
                ? "border-foreground/15 bg-foreground/6 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground"
            )}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function TooltipPlaygroundPanel() {
  const [theme, setTheme] = useState<TooltipThemeId>("black");
  const [placement, setPlacement] = useState<TooltipPlacementId>("top");

  const activePlacement =
    TOOLTIP_PLACEMENTS.find((row) => row.id === placement) ?? TOOLTIP_PLACEMENTS[0];

  const code = useMemo(() => {
    return `<Tooltip>
  <TooltipTrigger render={<Button variant=\"outline\" size=\"sm\" />}>
    Hover me
  </TooltipTrigger>
  <TooltipContent
    side=\"${activePlacement.side}\"
    align=\"${activePlacement.align}\"
    variant=\"${theme}\"
  >
    Quick tooltip copy
  </TooltipContent>
</Tooltip>`;
  }, [activePlacement.align, activePlacement.side, theme]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Interactive</DocSubheading>
        <DocLead>
          Pick a theme and placement to preview the recommended tooltip combinations. Use <CodeInline>variant</CodeInline> for
          black/white and <CodeInline>side</CodeInline> for direction.
        </DocLead>
      </div>
      <ShowcaseCard padding="lg" className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Theme</p>
          <PickerPills options={TOOLTIP_THEMES} value={theme} onValueChange={setTheme} />
        </div>
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Placement</p>
          <PickerPills options={TOOLTIP_PLACEMENTS} value={placement} onValueChange={setPlacement} />
          <p className="text-xs text-muted-foreground">{activePlacement.summary}</p>
        </div>

        <div className="flex min-h-[140px] items-center justify-center rounded-md border border-dashed border-border bg-muted/25 p-8">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="sm" />}>Hover me</TooltipTrigger>
              <TooltipContent side={activePlacement.side} align={activePlacement.align} variant={theme}>
                Quick tooltip copy
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <DocCodeBlock>{code}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

function TooltipReferenceMatrix() {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Reference: placements x themes</DocSubheading>
        <DocLead>
          Supported placements are <CodeInline>top</CodeInline>, <CodeInline>right</CodeInline>, <CodeInline>bottom</CodeInline>, and <CodeInline>left</CodeInline>.
          Each supports <CodeInline>variant=&quot;black&quot;</CodeInline> and <CodeInline>variant=&quot;white&quot;</CodeInline>.
        </DocLead>
      </div>

      <ShowcaseCard padding="lg" className="w-full overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">Placement</th>
              <th className="pb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground text-center">Black</th>
              <th className="pb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground text-center">White</th>
            </tr>
          </thead>
          <tbody>
            {TOOLTIP_PLACEMENTS.map(({ id, label, side, align }) => (
              <tr key={id} className="border-b border-border/60 last:border-b-0">
                <td className="py-3 pr-4 text-sm font-medium text-foreground align-middle">{label}</td>
                {TOOLTIP_THEMES.map(({ id: themeId }) => (
                  <td key={`${id}-${themeId}`} className="py-3 px-2 align-middle">
                    <div className="flex justify-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger render={<Button variant="outline" size="sm" />}>{label}</TooltipTrigger>
                          <TooltipContent side={side} align={align} variant={themeId}>
                            Quick tooltip copy
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ShowcaseCard>
    </div>
  );
}

export interface TooltipShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function TooltipShowcaseSection({
  overline,
  title = "Tooltip",
  description,
}: TooltipShowcaseSectionProps) {
  return (
    <section id="tooltip" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <TooltipPlaygroundPanel />
        <TooltipReferenceMatrix />
      </div>
    </section>
  );
}
