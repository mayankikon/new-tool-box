"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

import type { DashPreviewSurface } from "./dash-preview-canvas";
import {
  buildActiveTabFolderStrokeD,
  buildFileCabinetCardOutlinePathD,
  snapToCssPixel,
  xLeftStartForTopStroke,
  xRightEndForTopStroke,
} from "./file-cabinet-card-outline-path";
import { FileCabinetTabRow } from "./file-cabinet-tab-row";
import type { FileCabinetTabMotionVariant } from "./file-cabinet-tab-motion";
import { OUTLINE_GLOW_TAB_VALUES } from "./outline-glow-tab-row";

export interface FileCabinetTableChromeProps {
  value: string;
  onValueChange: (v: string) => void;
  labels: Record<string, string>;
  surface: DashPreviewSurface;
  underGlowPx: number;
  accent: "primary" | "amber";
  tabTopRadiusPx: number;
  /** When false, tab row omits the left circular LED lamp. */
  showLeftLamp?: boolean;
  /**
   * When `showLeftLamp` is false, under-label style on the tab row (`telemetry` default, `preset-led` = Preset + LED pill).
   */
  noLeftLampBelowStyle?: "telemetry" | "preset-led";
  /**
   * Renders at the trailing end of the tab row (e.g. `Paginator` variant="inline"),
   * vertically centered with the tab strip.
   */
  tabRowEnd?: React.ReactNode;
  /** Merged onto the root wrapper (e.g. `flex min-h-0 flex-1 flex-col` for in-card scroll). */
  className?: string;
  /** Tab folder surface + under-label motion; default `layout-slide` (shared layout). */
  tabMotionVariant?: FileCabinetTabMotionVariant;
  /** Tab value order for active index / square top-left; defaults to outline glow deck. */
  tabValues?: readonly string[];
  /** Passed through to {@link FileCabinetTabRow} (e.g. center vehicle detail tabs). */
  centerTabList?: boolean;
  /**
   * Optional override for the tab row wrapper and active folder fill. When omitted, the active tab
   * matches the table header row neutral (`DATA_TABLE_HEADER_BACKGROUND_CLASS` in `FileCabinetTabRow`).
   */
  tabBackgroundClassName?: string;
  /** Optional override for the outer SVG chrome stroke. */
  strokeClassName?: string;
  /** When true, renders only the tab row + a bottom divider — no card outline, borders, or SVG stroke around the content. */
  hideCardChrome?: boolean;
  children: React.ReactNode;
}

/**
 * Horizontal inset (CSS px) for card seam gap vs tab outer edges. `0` aligns card seam endpoints
 * with the tab verticals (fixes the old 1px extrusion) while keeping the tab path **open** on the
 * bottom—no stroke across the seam under the active tab.
 */
const JOIN_OVERLAP_CSS_PX = 0;

/**
 * Phase-1 seam / stroke diagnostics (1px bleed investigation).
 * Enable: `NEXT_PUBLIC_FILE_CABINET_CHROME_DEBUG=true` or in DevTools console:
 * `sessionStorage.setItem('fcChromeDebug','1'); location.reload()`
 */
const FC_CHROME_DEBUG_SESSION_KEY = "fcChromeDebug";

function isFileCabinetChromeDebugEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_FILE_CABINET_CHROME_DEBUG === "true") {
    return true;
  }
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.sessionStorage.getItem(FC_CHROME_DEBUG_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export interface FileCabinetChromeDebugSnapshot {
  dpr: number;
  activeIndex: number;
  squareTopLeft: boolean;
  joinCssPx: number;
  cardTop: number;
  w: number;
  h: number;
  /** Tab bottom minus table top (card-local seam raw). */
  seamRawCard: number;
  /** Tab bottom minus chrome root top (root SVG seam raw). */
  seamRawRoot: number;
  /** Card path seam (card-local), derived from unified root snap (Phase 2). */
  seamYCard: number;
  /** Single root-snapped seam Y (tab path + card via translate). */
  seamYRoot: number;
  /** Legacy alias: equals seamYRoot. */
  seamYTab: number;
  /** Should stay ~0 after Phase 2 (seamYRoot − (cardTop + seamYCard)). */
  seamStackDelta: number;
  tL_table: number;
  tR_table: number;
  tLJoin: number;
  tRJoin: number;
  xLS: number;
  xRE: number;
  /** Card notch vs join: positive ⇒ extra horizontal toward tab on that side. */
  deltaLeft: number;
  deltaRight: number;
  tabL_root: number;
  tabR_root: number;
  tabT_root: number;
  rCorner: number;
  rTL_card: number;
  rTR_card: number;
  rTab_folder: number;
}

function buildFileCabinetChromeDebugSnapshot(input: {
  dpr: number;
  activeIndex: number;
  squareTopLeft: boolean;
  cardTop: number;
  w: number;
  h: number;
  seamRawCard: number;
  seamRawRoot: number;
  tL_table: number;
  tR_table: number;
  tabL_root: number;
  tabR_root: number;
  tabT_root: number;
  tabTopRadiusPx: number;
}): FileCabinetChromeDebugSnapshot {
  const { dpr } = input;
  const joinCssPx = JOIN_OVERLAP_CSS_PX;
  const join = snapToCssPixel(joinCssPx, dpr);
  const seamYRoot = snapToCssPixel(Math.max(0, input.seamRawRoot), dpr);
  const seamYCard = Math.max(0, seamYRoot - input.cardTop);
  const stackedSeamRoot = input.cardTop + seamYCard;
  const seamStackDelta = seamYRoot - stackedSeamRoot;

  const tL = snapToCssPixel(input.tL_table, dpr);
  const tR = snapToCssPixel(input.tR_table, dpr);
  const rCorner = Math.max(0, input.tabTopRadiusPx);
  const rTL_card = input.squareTopLeft ? 0 : rCorner;
  const rTR_card = rCorner;
  const rTL_s = snapToCssPixel(rTL_card, dpr);
  const rTR_s = snapToCssPixel(rTR_card, dpr);

  const tLJoin = Math.min(tL + join, input.w);
  const tRJoin = Math.max(0, tR - join);
  const xLS = snapToCssPixel(xLeftStartForTopStroke(seamYCard, rTL_s), dpr);
  const xRE = snapToCssPixel(
    xRightEndForTopStroke(seamYCard, input.w, rTR_s),
    dpr,
  );

  const tabFolderRadius = Math.max(4, Math.min(20, input.tabTopRadiusPx));
  const rTab_folder = snapToCssPixel(tabFolderRadius, dpr);

  return {
    dpr: input.dpr,
    activeIndex: input.activeIndex,
    squareTopLeft: input.squareTopLeft,
    joinCssPx,
    cardTop: input.cardTop,
    w: input.w,
    h: input.h,
    seamRawCard: input.seamRawCard,
    seamRawRoot: input.seamRawRoot,
    seamYCard,
    seamYRoot,
    seamYTab: seamYRoot,
    seamStackDelta,
    tL_table: tL,
    tR_table: tR,
    tLJoin,
    tRJoin,
    xLS,
    xRE,
    deltaLeft: tLJoin - xLS,
    deltaRight: xRE - tRJoin,
    tabL_root: snapToCssPixel(input.tabL_root, dpr),
    tabR_root: snapToCssPixel(input.tabR_root, dpr),
    tabT_root: snapToCssPixel(input.tabT_root, dpr),
    rCorner,
    rTL_card: rTL_s,
    rTR_card: rTR_s,
    rTab_folder,
  };
}

interface ChromeLayout {
  rootW: number;
  rootH: number;
  cardTop: number;
  tabPathD: string;
  cardPathD: string;
  /** Tab + card outlines in root space (Phase 3: one `<path>` paint, no stacked strokes). */
  mergedStrokePathD: string;
  debugSnapshot?: FileCabinetChromeDebugSnapshot;
}

const ZERO_LAYOUT: ChromeLayout = {
  rootW: 0,
  rootH: 0,
  cardTop: 0,
  tabPathD: "",
  cardPathD: "",
  mergedStrokePathD: "",
};

function isChromeLayoutEqual(a: ChromeLayout, b: ChromeLayout): boolean {
  return (
    a.rootW === b.rootW &&
    a.rootH === b.rootH &&
    a.cardTop === b.cardTop &&
    a.tabPathD === b.tabPathD &&
    a.cardPathD === b.cardPathD &&
    a.mergedStrokePathD === b.mergedStrokePathD
  );
}

function computeChromeLayout(
  rootEl: HTMLElement,
  tableEl: HTMLElement,
  tabEl: HTMLElement,
  activeIndex: number,
  dpr: number,
  tabTopRadiusPx: number,
  squareTopLeft: boolean,
  includeDebugSnapshot: boolean,
): ChromeLayout {
  const rootRect = rootEl.getBoundingClientRect();
  const tableRect = tableEl.getBoundingClientRect();
  const tabRect = tabEl.getBoundingClientRect();

  const rootW = rootRect.width;
  const rootH = rootRect.height;
  const w = tableRect.width;
  const h = tableRect.height;
  if (rootW <= 0 || rootH <= 0 || w <= 0 || h <= 0) {
    return ZERO_LAYOUT;
  }

  const cardTop = tableRect.top - rootRect.top;

  const tabLeft = tabRect.left - tableRect.left;
  const tabRight = tabRect.right - tableRect.left;

  const seamRaw = tabRect.bottom - tableRect.top;
  const seamRawRoot = tabRect.bottom - rootRect.top;
  /** One snap in root space; card-local seam is derived so translated stroke shares the same line as the tab. */
  const seamYRoot = snapToCssPixel(Math.max(0, seamRawRoot), dpr);
  const seamYCardLocal = Math.max(0, seamYRoot - cardTop);
  const join = JOIN_OVERLAP_CSS_PX;
  const tL = tabLeft;
  const tR = tabRight;
  const rCorner = Math.max(0, tabTopRadiusPx);
  const rTR = rCorner;
  const rTL = squareTopLeft ? 0 : rTR;
  const rBL = rCorner;
  const rBR = rCorner;

  const outlineParams = {
    w,
    h,
    seamY: seamYCardLocal,
    seamYSkipSnap: true as const,
    tL,
    tR,
    join,
    rTL,
    rTR,
    rBL,
    rBR,
    activeIndex,
    dpr,
  };

  const cardPathD = buildFileCabinetCardOutlinePathD(outlineParams);
  const cardPathDRoot = buildFileCabinetCardOutlinePathD(outlineParams, {
    originY: cardTop,
  });

  /** Folder tab uses rounded top-left and top-right in the tab row for every deck tab. */
  const tabFolderRadius = Math.max(4, Math.min(20, tabTopRadiusPx));
  const rTab = snapToCssPixel(tabFolderRadius, dpr);

  const tabPathD = buildActiveTabFolderStrokeD({
    tabL: tabRect.left - rootRect.left,
    tabR: tabRect.right - rootRect.left,
    tabT: tabRect.top - rootRect.top,
    seamY: seamYRoot,
    join,
    rTL: rTab,
    rTR: rTab,
    dpr,
  });

  const mergedStrokePathD =
    tabPathD && cardPathDRoot
      ? `${tabPathD} ${cardPathDRoot}`
      : tabPathD || cardPathDRoot;

  const debugSnapshot = includeDebugSnapshot
    ? buildFileCabinetChromeDebugSnapshot({
        dpr,
        activeIndex,
        squareTopLeft,
        cardTop,
        w,
        h,
        seamRawCard: seamRaw,
        seamRawRoot,
        tL_table: tabLeft,
        tR_table: tabRight,
        tabL_root: tabRect.left - rootRect.left,
        tabR_root: tabRect.right - rootRect.left,
        tabT_root: tabRect.top - rootRect.top,
        tabTopRadiusPx,
      })
    : undefined;

  return {
    rootW,
    rootH,
    cardTop,
    tabPathD,
    cardPathD,
    mergedStrokePathD,
    debugSnapshot,
  };
}

const CHROME_STROKE_PROPS = {
  fill: "none" as const,
  strokeWidth: 1,
  vectorEffect: "nonScalingStroke" as const,
  strokeLinecap: "butt" as const,
  strokeLinejoin: "miter" as const,
  shapeRendering: "geometricPrecision" as const,
};

/** Extra SVG user units so 1px strokes on max-X / max-Y edges aren’t clipped (subpixel / zoom). */
const CHROME_SVG_VIEWPORT_BLEED_PX = 2;

function ChromeStrokePaths({
  layout,
  strokeClass,
  debugStrokes,
}: {
  layout: ChromeLayout;
  strokeClass: string;
  /** When true: tab stroke = red, card stroke = blue (Phase-1 seam bleed diagnostics). */
  debugStrokes: boolean;
}) {
  const tabStrokeClass = debugStrokes ? "stroke-red-500" : strokeClass;
  const cardStrokeClass = debugStrokes ? "stroke-blue-500" : strokeClass;

  if (debugStrokes) {
    return (
      <>
        {layout.tabPathD ? (
          <path
            className={tabStrokeClass}
            d={layout.tabPathD}
            {...CHROME_STROKE_PROPS}
          />
        ) : null}
        {layout.cardPathD ? (
          <g transform={`translate(0, ${layout.cardTop})`}>
            <path className={cardStrokeClass} d={layout.cardPathD} {...CHROME_STROKE_PROPS} />
          </g>
        ) : null}
      </>
    );
  }

  if (layout.mergedStrokePathD) {
    return (
      <path className={strokeClass} d={layout.mergedStrokePathD} {...CHROME_STROKE_PROPS} />
    );
  }

  return null;
}

interface ExitStrokeLayer {
  id: number;
  layout: ChromeLayout;
}

/**
 * File-cabinet tab row plus table card: one SVG stroke for active tab (three sides + top arcs) and
 * card outline (translated under the tab). No CSS borders on tab or card for the chrome outline.
 */
export function FileCabinetTableChrome({
  value,
  onValueChange,
  labels,
  surface,
  underGlowPx,
  accent: _accent,
  tabTopRadiusPx,
  showLeftLamp = true,
  noLeftLampBelowStyle = "telemetry",
  tabRowEnd,
  className,
  tabMotionVariant = "layout-slide",
  tabValues = OUTLINE_GLOW_TAB_VALUES,
  centerTabList = false,
  tabBackgroundClassName,
  strokeClassName,
  hideCardChrome = false,
  children,
}: FileCabinetTableChromeProps) {
  const light = surface === "light";
  const reduceMotion = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const tableCardRef = React.useRef<HTMLDivElement>(null);
  const activeTabElRef = React.useRef<HTMLButtonElement | null>(null);
  const layoutRef = React.useRef<ChromeLayout>(ZERO_LAYOUT);
  /** Last committed layout; avoids ResizeObserver ↔ setState feedback loops. */
  const lastLayoutCommitRef = React.useRef<ChromeLayout>(ZERO_LAYOUT);
  const prevValueRef = React.useRef(value);
  const exitIdRef = React.useRef(0);
  const lastChromeDebugLogRef = React.useRef<string>("");
  const [layout, setLayout] = React.useState<ChromeLayout>(ZERO_LAYOUT);
  const [exitStroke, setExitStroke] = React.useState<ExitStrokeLayer | null>(null);

  layoutRef.current = layout;

  const chromeDebugEnabled = isFileCabinetChromeDebugEnabled();

  const strokeBlendTransition = React.useMemo(
    () =>
      reduceMotion
        ? { duration: 0 }
        : { duration: 0.14, ease: [0.45, 0, 0.7, 1] as const },
    [reduceMotion],
  );

  const activeIndex = React.useMemo(() => {
    const i = tabValues.indexOf(value);
    return i === -1 ? 0 : i;
  }, [value, tabValues]);

  const squareTopLeft = activeIndex === 0;

  const updateLayout = React.useCallback(() => {
    const rootEl = rootRef.current;
    const tableEl = tableCardRef.current;
    const tabEl = activeTabElRef.current;
    if (!rootEl || !tableEl || !tabEl) {
      if (!isChromeLayoutEqual(lastLayoutCommitRef.current, ZERO_LAYOUT)) {
        lastLayoutCommitRef.current = ZERO_LAYOUT;
        setLayout(ZERO_LAYOUT);
      }
      return;
    }
    const dpr =
      typeof window !== "undefined" && window.devicePixelRatio > 0
        ? window.devicePixelRatio
        : 1;
    const includeDebugSnapshot = isFileCabinetChromeDebugEnabled();
    const nextLayout = computeChromeLayout(
      rootEl,
      tableEl,
      tabEl,
      activeIndex,
      dpr,
      tabTopRadiusPx,
      squareTopLeft,
      includeDebugSnapshot,
    );
    if (
      includeDebugSnapshot &&
      nextLayout.debugSnapshot &&
      process.env.NODE_ENV === "development"
    ) {
      const payload = JSON.stringify(nextLayout.debugSnapshot);
      if (payload !== lastChromeDebugLogRef.current) {
        lastChromeDebugLogRef.current = payload;
        console.info("[FileCabinetChrome] seam / stroke debug", nextLayout.debugSnapshot);
      }
    }
    if (isChromeLayoutEqual(lastLayoutCommitRef.current, nextLayout)) {
      return;
    }
    lastLayoutCommitRef.current = nextLayout;
    setLayout(nextLayout);
  }, [activeIndex, squareTopLeft, tabTopRadiusPx]);

  const handleActiveTabElement = React.useCallback(
    (element: HTMLButtonElement | null) => {
      activeTabElRef.current = element;
      updateLayout();
    },
    [updateLayout],
  );

  React.useLayoutEffect(() => {
    if (prevValueRef.current !== value) {
      if (!reduceMotion && layoutRef.current.mergedStrokePathD) {
        exitIdRef.current += 1;
        setExitStroke({
          id: exitIdRef.current,
          layout: layoutRef.current,
        });
      } else {
        setExitStroke(null);
      }
      prevValueRef.current = value;
    }
    updateLayout();
  }, [updateLayout, value, light, reduceMotion]);

  React.useEffect(() => {
    const rootEl = rootRef.current;
    const tableEl = tableCardRef.current;
    if (!rootEl || !tableEl) {
      return;
    }
    let rafId: number | null = null;
    const scheduleUpdate = () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        rafId = null;
        updateLayout();
      });
    };
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(rootEl);
    ro.observe(tableEl);
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      if (rafId != null) {
        cancelAnimationFrame(rafId);
      }
      ro.disconnect();
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [updateLayout]);

  const cardRadiusStyle: React.CSSProperties = {
    borderTopLeftRadius: squareTopLeft ? 0 : tabTopRadiusPx,
    borderTopRightRadius: tabTopRadiusPx,
    borderBottomLeftRadius: tabTopRadiusPx,
    borderBottomRightRadius: tabTopRadiusPx,
  };

  const strokeClass =
    strokeClassName ?? (light ? "stroke-zinc-300/80" : "stroke-zinc-600/80");

  const showStroke =
    layout.mergedStrokePathD || layout.tabPathD || layout.cardPathD;

  return (
    <div ref={rootRef} className={cn("relative w-full min-w-0", className)}>
      <div className="shrink-0">
        {tabRowEnd ? (
          <div className="flex w-full min-w-0 items-center gap-4">
            <div className="min-w-0 flex-1">
              <FileCabinetTabRow
                value={value}
                onValueChange={onValueChange}
                labels={labels}
                surface={surface}
                underGlowPx={underGlowPx}
                accent={_accent}
                tabTopRadiusPx={tabTopRadiusPx}
                showLeftLamp={showLeftLamp}
                noLeftLampBelowStyle={noLeftLampBelowStyle}
                onActiveTabElement={handleActiveTabElement}
                tabMotionVariant={tabMotionVariant}
                tabValues={tabValues}
                centerTabList={centerTabList}
                backgroundClassName={tabBackgroundClassName}
              />
            </div>
            <div className="flex shrink-0 items-center">{tabRowEnd}</div>
          </div>
        ) : (
          <FileCabinetTabRow
            value={value}
            onValueChange={onValueChange}
            labels={labels}
            surface={surface}
            underGlowPx={underGlowPx}
            accent={_accent}
            tabTopRadiusPx={tabTopRadiusPx}
            showLeftLamp={showLeftLamp}
            noLeftLampBelowStyle={noLeftLampBelowStyle}
            onActiveTabElement={handleActiveTabElement}
            tabMotionVariant={tabMotionVariant}
            tabValues={tabValues}
            centerTabList={centerTabList}
            backgroundClassName={tabBackgroundClassName}
          />
        )}
      </div>
      <div
        ref={tableCardRef}
        className={cn(
          "relative flex min-h-0 min-w-0 flex-1 flex-col",
          hideCardChrome
            ? "border-t border-border"
            : "border-x border-b border-border border-t-0 motion-safe:transition-[border-radius] motion-safe:duration-150 motion-safe:ease-out",
          !hideCardChrome && (light ? "bg-white" : "bg-sidebar"),
        )}
        style={hideCardChrome ? undefined : cardRadiusStyle}
      >
        <div
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
            !hideCardChrome && "motion-safe:transition-[border-radius] motion-safe:duration-150 motion-safe:ease-out",
          )}
          style={hideCardChrome ? undefined : cardRadiusStyle}
        >
          {children}
        </div>
      </div>
      {showStroke && !hideCardChrome ? (
        <svg
          className="pointer-events-none absolute left-0 top-0 z-[2] block overflow-visible"
          width={layout.rootW + CHROME_SVG_VIEWPORT_BLEED_PX}
          height={layout.rootH + CHROME_SVG_VIEWPORT_BLEED_PX}
          viewBox={`0 0 ${layout.rootW + CHROME_SVG_VIEWPORT_BLEED_PX} ${layout.rootH + CHROME_SVG_VIEWPORT_BLEED_PX}`}
          overflow="visible"
          aria-hidden
        >
          <g transform="translate(0.5, 0.5)">
            {exitStroke
              ? (() => {
                  const exitId = exitStroke.id;
                  const exitLayoutSnapshot = exitStroke.layout;
                  return (
                    <motion.g
                      key={exitId}
                      initial={{ opacity: reduceMotion ? 0 : 1 }}
                      animate={{ opacity: 0 }}
                      transition={strokeBlendTransition}
                      onAnimationComplete={() => {
                        setExitStroke((current) =>
                          current?.id === exitId ? null : current,
                        );
                      }}
                    >
                      <ChromeStrokePaths
                        layout={exitLayoutSnapshot}
                        strokeClass={strokeClass}
                        debugStrokes={chromeDebugEnabled}
                      />
                    </motion.g>
                  );
                })()
              : null}
            <motion.g
              key={value}
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={strokeBlendTransition}
            >
              <ChromeStrokePaths
                layout={layout}
                strokeClass={strokeClass}
                debugStrokes={chromeDebugEnabled}
              />
            </motion.g>
          </g>
        </svg>
      ) : null}
    </div>
  );
}
