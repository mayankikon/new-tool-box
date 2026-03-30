"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

import type { DashPreviewSurface } from "./dash-preview-canvas";
import { OUTLINE_GLOW_TAB_VALUES } from "./outline-glow-tab-row";

export interface ProjectingFolderTabRowProps {
  value: string;
  onValueChange: (v: string) => void;
  labels: Record<string, string>;
  surface: DashPreviewSurface;
  underGlowPx: number;
  accent: "primary" | "amber";
  /** Top corner radius of each tab (px); applied to both top-left and top-right. */
  tabTopRadiusPx: number;
}

/**
 * Projecting folder tabs: no gray rail — inactive tabs use the same white (light) / panel (dark)
 * fill as the active tab; active tab adds stronger border and shadow. Top corners match (symmetric).
 * Left-lamp LED matches OutlineGlowTabRow / file-cabinet math.
 */
export function ProjectingFolderTabRow({
  value,
  onValueChange,
  labels,
  surface,
  underGlowPx,
  accent,
  tabTopRadiusPx,
}: ProjectingFolderTabRowProps) {
  const light = surface === "light";

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

  const bottomStripOnClass =
    accent === "amber"
      ? "border border-amber-300/60 bg-amber-400"
      : "border border-emerald-700/40 bg-emerald-500";

  const tl = Math.max(4, Math.min(16, tabTopRadiusPx));
  const tr = tl;

  const inactiveLabelClass = light ? "font-medium text-zinc-500" : "font-medium text-zinc-400";
  const activeLabelClass = light ? "font-medium text-zinc-900" : "font-medium text-zinc-50";

  return (
    <div className="relative flex w-full min-w-0 items-end gap-1.5 bg-transparent px-0 pt-1">
      <div
        className="flex min-w-0 flex-1 flex-wrap items-end gap-1.5"
        role="tablist"
        aria-label="Table filters"
      >
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
              style={{
                borderTopLeftRadius: tl,
                borderTopRightRadius: tr,
              }}
              className={cn(
                "relative z-[1] flex min-w-[5.75rem] flex-col items-stretch border border-b-0 px-3 pb-0 pt-2.5 text-sm outline-none transition-[color,background-color,box-shadow,border-color]",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                light ? "focus-visible:ring-offset-zinc-100" : "focus-visible:ring-offset-zinc-900",
                active
                  ? cn(
                      "z-[2] border-zinc-300/90 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]",
                      light ? "bg-white" : "border-zinc-600 bg-sidebar",
                      activeLabelClass,
                    )
                  : cn(
                      "hover:border-zinc-400/70 hover:text-foreground",
                      light
                        ? "border-zinc-300/55 bg-white"
                        : "border-zinc-600/45 bg-sidebar",
                      inactiveLabelClass,
                    ),
              )}
            >
              <span className="flex flex-row items-center gap-2 pr-1">
                <span
                  aria-hidden
                  className={cn(
                    "relative size-2.5 shrink-0 rounded-full border transition-[background-color,box-shadow,border-color]",
                    active
                      ? "border-emerald-800/50 bg-emerald-400"
                      : light
                        ? "border-zinc-400 bg-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_2px_rgba(0,0,0,0.06)]"
                        : "border-zinc-600 bg-sidebar shadow-[inset_0_0_0_1px_rgba(82,82,91,0.5)]",
                  )}
                  style={
                    active
                      ? {
                          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.55), 0 0 ${lampGlowPx}px rgba(34, 197, 94, 0.65), 0 0 ${Math.round(lampGlowPx * 0.45)}px rgba(167, 243, 208, 0.35)`,
                        }
                      : undefined
                  }
                />
                <span className="truncate">{label}</span>
              </span>
              <span
                aria-hidden
                className={cn(
                  "mx-auto mt-2 h-[6px] w-full max-w-[5rem] shrink-0 rounded-sm transition-[opacity,background-color,box-shadow,border-color]",
                  active ? bottomStripOnClass : "border border-transparent bg-transparent",
                  active ? "opacity-100" : "opacity-0",
                )}
                style={active ? bottomStripOnStyle : undefined}
              />
            </button>
          );
        })}
      </div>

      <span
        aria-hidden
        className={cn(
          "mb-1.5 ml-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md opacity-70",
          light ? "text-zinc-500" : "text-zinc-400",
        )}
        title="More (playground placeholder)"
      >
        <ChevronDown className="size-4" aria-hidden />
      </span>
    </div>
  );
}
