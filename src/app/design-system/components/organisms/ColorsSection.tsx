"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { brandSemanticPalettes, dataVizPaletteSections } from "@/app/design-system/color-palette-data";
import { cn } from "@/lib/utils";
import { SectionTitle } from "../atoms/SectionTitle";

const COPY_FEEDBACK_MS = 3000;

/** Light fills need a hairline edge so they read on the doc background (e.g. white, 50). */
function swatchSurfaceClass(hex: string): string {
  const normalized = hex.trim().toLowerCase();
  if (normalized === "#ffffff" || normalized === "#fff") {
    return "ring-1 ring-inset ring-border";
  }
  return "ring-1 ring-inset ring-black/[0.06] dark:ring-white/[0.08]";
}

function PaletteScaleRamp({
  paletteTitle,
  colors,
}: {
  paletteTitle: string;
  colors: Record<string | number, string>;
}) {
  const entries = Object.entries(colors);
  const slug = paletteTitle.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      className="flex w-full flex-col gap-2"
      role="group"
      aria-label={`${paletteTitle} scale preview`}
    >
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Full scale preview
      </p>
      <div className="flex gap-px overflow-hidden rounded-lg border border-border bg-border p-px shadow-sm">
        {entries.map(([shade, hex]) => (
          <div
            key={String(shade)}
            className={cn(
              "relative min-h-[3.25rem] min-w-0 flex-1 first:rounded-l-[calc(var(--radius-lg)-2px)] last:rounded-r-[calc(var(--radius-lg)-2px)]",
              swatchSurfaceClass(hex)
            )}
            style={{ backgroundColor: hex }}
            title={`${slug}-${shade} · ${hex}`}
          >
            <span className="sr-only">
              {paletteTitle} {shade}, {hex}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaletteColorSwatch({
  paletteTitle,
  shade,
  hex,
}: {
  paletteTitle: string;
  shade: string;
  hex: string;
}) {
  const tokenLabel = `${paletteTitle.toLowerCase().replace(/\s+/g, "-")}-${shade}`;
  const [copied, setCopied] = React.useState(false);
  const resetTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (resetTimeoutRef.current != null) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const handleCopyHex = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      if (resetTimeoutRef.current != null) {
        clearTimeout(resetTimeoutRef.current);
      }
      resetTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        resetTimeoutRef.current = null;
      }, COPY_FEEDBACK_MS);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-[calc(var(--radius-lg)_-_4px)] border border-border bg-neutral-50 dark:bg-card/40"
      )}
    >
      <div
        className={cn("h-32 w-full shrink-0", swatchSurfaceClass(hex))}
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <div className="flex items-center gap-1.5 border-t border-border py-3 pl-3 pr-1">
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <span className="ds-doc-font text-[15px] font-semibold tabular-nums text-foreground">{shade}</span>
          <span className="ds-doc-font truncate font-mono text-[12px] text-muted-foreground" title={tokenLabel}>
            {tokenLabel}
          </span>
          <span className="ds-doc-font font-mono text-[12px] text-muted-foreground/90">{hex}</span>
        </div>
        <button
          type="button"
          onClick={handleCopyHex}
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors",
            "hover:bg-neutral-100 hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50"
          )}
          aria-label={copied ? `Copied ${hex}` : `Copy ${hex}`}
        >
          {copied ? (
            <Check className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden />
          ) : (
            <Copy className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}

function PaletteSubsection({
  title,
  description,
  colors,
}: {
  title: string;
  description: string;
  colors: Record<string | number, string>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="ds-doc-font text-lg font-medium text-foreground">{title}</h3>
        <p className="ds-doc-font mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
      <PaletteScaleRamp paletteTitle={title} colors={colors} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Object.entries(colors).map(([shade, hex]) => (
          <PaletteColorSwatch
            key={shade}
            paletteTitle={title}
            shade={String(shade)}
            hex={hex}
          />
        ))}
      </div>
    </div>
  );
}

export function ColorsSection() {
  return (
    <section id="colors" className="scroll-mt-28 space-y-10">
      <SectionTitle
        overline="Foundations"
        title="Colors"
        description="Colors define the visual language and semantic meaning across interfaces and states."
      />

      <div className="space-y-10">
        {brandSemanticPalettes.map((section) => (
          <PaletteSubsection
            key={section.title}
            title={section.title}
            description={section.description}
            colors={section.colors}
          />
        ))}
      </div>

      <div className="space-y-10 border-t border-border pt-10">
        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground">Data visualization</h3>
          <p className="ds-doc-font mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
            Warm pastel scales for charts and analytics (reference hex values).
          </p>
        </div>
        <div className="space-y-10">
          {dataVizPaletteSections.map((section) => (
            <PaletteSubsection
              key={section.title}
              title={section.title}
              description={section.description}
              colors={section.colors}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
