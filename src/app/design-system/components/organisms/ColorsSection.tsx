"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { brandSemanticPalettes, dataVizPaletteSections } from "@/app/design-system/color-palette-data";
import { cn } from "@/lib/utils";
import { SectionTitle } from "../atoms/SectionTitle";

const COPY_FEEDBACK_MS = 3000;

function PaletteColorSwatch({ name, hex }: { name: string; hex: string }) {
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
        "flex min-w-0 flex-col overflow-hidden rounded-[calc(var(--radius-lg)_-_4px)] border border-border bg-neutral-50"
      )}
    >
      <div
        className="h-24 w-full shrink-0"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <div className="flex items-center gap-1.5 border-t border-border py-3 pl-3 pr-1">
        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <span className="ds-doc-font truncate text-[14px] font-medium text-foreground">{name}</span>
          <span className="ds-doc-font font-mono text-[12px] text-muted-foreground">{hex}</span>
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
    <div className="space-y-4">
      <div>
        <h3 className="ds-doc-font text-lg font-medium text-foreground">{title}</h3>
        <p className="ds-doc-font mt-1 max-w-2xl text-sm text-muted-foreground text-pretty">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Object.entries(colors).map(([shade, hex]) => (
          <PaletteColorSwatch
            key={shade}
            name={`${title.toLowerCase()}-${shade}`}
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
