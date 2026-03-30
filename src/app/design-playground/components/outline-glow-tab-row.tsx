"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import type { DashPreviewSurface } from "./dash-preview-canvas";

export const OUTLINE_GLOW_TAB_VALUES = ["drive", "climate", "media", "system"] as const;
export type OutlineGlowTabValue = (typeof OUTLINE_GLOW_TAB_VALUES)[number];

export function OutlineGlowTabRow({
  value,
  onValueChange,
  labels,
  surface,
  underGlowPx,
  accent,
  borderRadiusPx,
  indicatorMode,
}: {
  value: string;
  onValueChange: (v: string) => void;
  labels: Record<string, string>;
  surface: DashPreviewSurface;
  underGlowPx: number;
  accent: "primary" | "amber";
  borderRadiusPx: number;
  indicatorMode: "bottom-strip" | "left-lamp";
}) {
  const light = surface === "light";

  const activeFlat = light
    ? "border-zinc-300 bg-white text-zinc-900"
    : "border-zinc-400 bg-zinc-800 text-zinc-50";

  const inactiveBorder = light
    ? "border-zinc-400/90 bg-white/35 text-zinc-700 hover:border-zinc-500 hover:bg-white/55"
    : "border-zinc-600 bg-zinc-950/40 text-muted-foreground hover:border-zinc-500 hover:text-white";

  const lampGlowPx = Math.min(14, 4 + underGlowPx * 0.28);
  const stripGlowPx = Math.min(12, 3 + underGlowPx * 0.25);

  const bottomStripOnStyle: React.CSSProperties =
    accent === "amber"
      ? {
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.18), 0 0 ${stripGlowPx}px rgba(251, 191, 36, 0.4)`,
        }
      : {
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 ${stripGlowPx}px rgba(52, 211, 153, 0.45)`,
        };

  const bottomStripOffClass = light
    ? "border border-zinc-400/70 bg-zinc-300/50"
    : "border border-zinc-600/80 bg-zinc-800/80";

  const bottomStripOnClass =
    accent === "amber"
      ? "border border-amber-300/60 bg-amber-400"
      : "border border-emerald-700/40 bg-emerald-500";

  return (
    <div role="tablist" aria-label="Primary modes" className="flex flex-wrap gap-2">
      {OUTLINE_GLOW_TAB_VALUES.map((v) => {
        const active = value === v;
        const label = labels[v];
        return (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(v)}
            style={{ borderRadius: borderRadiusPx }}
            className={cn(
              "min-w-[4.75rem] border text-sm font-medium transition-[color,background-color,box-shadow] outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              light ? "focus-visible:ring-offset-white" : "focus-visible:ring-offset-zinc-900",
              active ? activeFlat : inactiveBorder,
              indicatorMode === "bottom-strip" &&
                "flex flex-col items-center px-3 pt-2 pb-[10px]",
              indicatorMode === "left-lamp" && "flex flex-row items-center gap-2 px-3 py-2",
            )}
          >
            {indicatorMode === "left-lamp" ? (
              <>
                <span
                  aria-hidden
                  className={cn(
                    "relative size-2.5 shrink-0 rounded-full border transition-[background-color,box-shadow,border-color]",
                    active
                      ? "border-emerald-800/50 bg-emerald-400"
                      : light
                        ? "border-zinc-400 bg-zinc-300/90 shadow-[inset_0_1px_2px_rgba(255,255,255,0.65),inset_0_-1px_2px_rgba(0,0,0,0.12)]"
                        : "border-zinc-600 bg-zinc-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.45)]",
                  )}
                  style={
                    active
                      ? {
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55), 0 0 ${lampGlowPx}px rgba(34, 197, 94, 0.65), 0 0 ${Math.round(lampGlowPx * 0.45)}px rgba(167, 243, 208, 0.35)`,
                        }
                      : undefined
                  }
                />
                <span>{label}</span>
              </>
            ) : (
              <>
                <span className="leading-tight">{label}</span>
                <span
                  aria-hidden
                  className={cn(
                    "mt-1 h-[6px] w-full max-w-[5rem] shrink-0 rounded-sm",
                    active ? bottomStripOnClass : bottomStripOffClass,
                  )}
                  style={active ? bottomStripOnStyle : undefined}
                />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
