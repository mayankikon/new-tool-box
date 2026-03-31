"use client";

import * as React from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";

import { DashboardLedCapsuleWebgl } from "@/components/ui/dashboard-led-capsule-webgl";
import type { TelemetryDeckLedTone } from "@/components/ui/telemetry-led-tones";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media-paths";

import type { DashPreviewSurface } from "./dash-preview-canvas";
import type { FileCabinetTabMotionVariant } from "./file-cabinet-tab-motion";
import { OUTLINE_GLOW_TAB_VALUES } from "./outline-glow-tab-row";

/**
 * Served from `public/media/icons/` (design exports for file-cabinet tab lamp artwork).
 */
const FILE_CABINET_TAB_LAMP_SRC = {
  active: mediaUrl("icons/table-tab-active.svg"),
  default: mediaUrl("icons/table-tab-default.svg"),
} as const;

/** Matches Tabs playground Preset + LED row default intensity (~70). */
const PRESET_LED_INTENSITY_RATIO = 0.7;
/** Active Preset + LED pill (file-cabinet tab row, under label). */
const PRESET_LED_ACCENT_RGB = { r: 12, g: 219, b: 168 } as const; // #0CDBA8

/** Inactive tab labels sit this many px below the active tab label (not bottom-aligned to the seam). */
const INACTIVE_TAB_LABEL_OFFSET_PX = 2;
/** Crossfade only: inactive label sits above active; selection moves it down into alignment. */
const INACTIVE_TAB_LABEL_OFFSET_CROSSFADE_PX = -2;

/**
 * Sink-rise folder avoids `scaleY: 0` (harsh); seam read still comes from `transformOrigin: 50% 100%`.
 */
const SINK_RISE_FOLDER_SCALE_Y_FLOOR = 0.07;

/** Cubic-bezier ease-out: quick start, soft landing (snappy UI motion). */
const EASE_OUT_SNAPPY = [0, 0, 0.25, 1] as const;

/** Enter slightly longer + delayed so the outgoing tab can start collapsing first (less “fight” at the seam). */
const SINK_RISE_FOLDER_ENTER_MS = 0.22;
const SINK_RISE_FOLDER_ENTER_DELAY_S = 0.04;
/** Shorter exit than enter: less overlap with the incoming sheet. */
const SINK_RISE_FOLDER_EXIT_MS = 0.1;
const SINK_RISE_LAMP_CROSSFADE_MS = 0.15;

export interface FileCabinetTabRowProps {
  value: string;
  onValueChange: (v: string) => void;
  labels: Record<string, string>;
  surface: DashPreviewSurface;
  /** Kept for API parity with `FileCabinetTableChrome` / billing defaults (lamp is asset-driven). */
  underGlowPx: number;
  accent: "primary" | "amber";
  /** Rounded top corners of the active folder tab (px). */
  tabTopRadiusPx: number;
  /** When false, omits the circular left LED lamp (label only). */
  showLeftLamp?: boolean;
  /**
   * When `showLeftLamp` is false, under-label indicator: telemetry WebGL capsule (default) or Preset + LED
   * horizontal pill (same styling as `PresetLedRadioRow` in the tabs playground).
   */
  noLeftLampBelowStyle?: "telemetry" | "preset-led";
  /** Notified when the active tab button mounts/unmounts (for notched table top stroke). */
  onActiveTabElement?: (element: HTMLButtonElement | null) => void;
  /** Folder + under-label motion; default shared `layoutId` horizontal travel. */
  tabMotionVariant?: FileCabinetTabMotionVariant;
  /**
   * Tab keys rendered left-to-right (must match `value` / `labels`). Defaults to the four-slot deck
   * (`drive` … `system`) used by the design playground.
   */
  tabValues?: readonly string[];
  /** When true, tab buttons are grouped in the horizontal center (e.g. vehicle detail deck). */
  centerTabList?: boolean;
}

/**
 * File-folder tabs: no rail fill — inactive tabs are transparent; active tab aligns to the card below.
 * Left-lamp uses dealership table tab assets (`table-tab-active` / `table-tab-default`).
 * Without left lamp: telemetry capsule or Preset + LED pill under the label.
 */
export function FileCabinetTabRow({
  value,
  onValueChange,
  labels,
  surface,
  underGlowPx: _underGlowPx,
  accent,
  tabTopRadiusPx,
  showLeftLamp = true,
  noLeftLampBelowStyle = "telemetry",
  onActiveTabElement,
  tabMotionVariant = "layout-slide",
  tabValues = OUTLINE_GLOW_TAB_VALUES,
  centerTabList = false,
}: FileCabinetTabRowProps) {
  const light = surface === "light";
  const reduceMotion = useReducedMotion();
  const layoutGroupId = React.useId();

  const usesPresenceMotion =
    tabMotionVariant === "sink-rise" || tabMotionVariant === "crossfade";
  const isSinkRise = tabMotionVariant === "sink-rise";

  /**
   * Pointer-activated tab changes run full sink-rise choreography; Enter/Space on a focused tab
   * snap to final state (Emil: avoid animating keyboard-initiated actions).
   */
  const pointerDrivenTabActivationRef = React.useRef(true);

  const folderSurfaceTransition = React.useMemo(
    () =>
      reduceMotion
        ? { duration: 0 }
        : { type: "tween" as const, duration: 0.11, ease: EASE_OUT_SNAPPY },
    [reduceMotion],
  );

  /**
   * Sink-rise: clip wrapper (no transform) + inner sheet `scaleY` only; shared enter/exit timing with label `y`.
   * Crossfade: single layer, opacity only. Enter/Space skips sink-rise choreography (pointer only).
   */
  const presenceFolderEnterTransition = React.useMemo(() => {
    if (reduceMotion) {
      return { duration: 0 };
    }
    return { type: "tween" as const, duration: 0.07, ease: EASE_OUT_SNAPPY };
  }, [reduceMotion]);

  const presenceFolderExitTransition = React.useMemo(() => {
    if (reduceMotion) {
      return { duration: 0 };
    }
    return { type: "tween" as const, duration: 0.055, ease: EASE_OUT_SNAPPY };
  }, [reduceMotion]);

  /** Shared sink-rise sheet + label row (pointer path). */
  const sinkRiseSheetEnterTransition = React.useMemo(
    () =>
      ({
        type: "tween" as const,
        duration: SINK_RISE_FOLDER_ENTER_MS,
        delay: SINK_RISE_FOLDER_ENTER_DELAY_S,
        ease: EASE_OUT_SNAPPY,
      }) as const,
    [],
  );

  const sinkRiseSheetExitTransition = React.useMemo(
    () =>
      ({
        type: "tween" as const,
        duration: SINK_RISE_FOLDER_EXIT_MS,
        ease: EASE_OUT_SNAPPY,
      }) as const,
    [],
  );

  /** Preset LED / underline / telemetry: same timing for sink-rise and crossfade. */
  const presencePillEnterTransition = React.useMemo(() => {
    if (reduceMotion) {
      return { duration: 0 };
    }
    if (isSinkRise && !pointerDrivenTabActivationRef.current) {
      return { duration: 0 };
    }
    if (isSinkRise) {
      return {
        type: "tween" as const,
        delay: 0.11,
        duration: 0.09,
        ease: EASE_OUT_SNAPPY,
      };
    }
    return {
      type: "tween" as const,
      delay: 0.02,
      duration: 0.09,
      ease: EASE_OUT_SNAPPY,
    };
  }, [isSinkRise, reduceMotion, value]);

  const presencePillExitTransition = React.useMemo(() => {
    if (reduceMotion) {
      return { duration: 0 };
    }
    if (isSinkRise && !pointerDrivenTabActivationRef.current) {
      return { duration: 0 };
    }
    return { type: "tween" as const, duration: 0.055, ease: EASE_OUT_SNAPPY };
  }, [isSinkRise, reduceMotion, value]);

  const activeTabCallbackRef = React.useCallback(
    (element: HTMLButtonElement | null) => {
      onActiveTabElement?.(element);
    },
    [onActiveTabElement],
  );

  const folderLayoutIdSuffix = showLeftLamp
    ? "lamp"
    : noLeftLampBelowStyle === "preset-led"
      ? "preset-led"
      : "telemetry";

  const presetLedGlow = PRESET_LED_INTENSITY_RATIO;

  const underlineClass =
    accent === "amber" ? "bg-amber-500" : "bg-white";

  const radius = Math.max(4, Math.min(20, tabTopRadiusPx));

  const vfdCapsuleTone: TelemetryDeckLedTone =
    accent === "amber" ? "amber" : "vfd";

  const folderBgClass = light ? "bg-white" : "bg-sidebar";

  /** Full sink-rise choreography (folder + label + lamp crossfade); false when reduced-motion or keyboard activation. */
  const sinkRisePointerMotion =
    isSinkRise && !reduceMotion && pointerDrivenTabActivationRef.current;

  const inactiveTabLabelOffsetPxStatic =
    tabMotionVariant === "crossfade"
      ? INACTIVE_TAB_LABEL_OFFSET_CROSSFADE_PX
      : INACTIVE_TAB_LABEL_OFFSET_PX;

  const tablist = (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-wrap items-start gap-[6px]",
        centerTabList && "justify-center",
      )}
      role="tablist"
      aria-label="Table filters"
    >
      {tabValues.map((v) => {
        const active = value === v;
        const label = labels[v] ?? v;
        return (
          <button
            key={v}
            ref={active ? activeTabCallbackRef : undefined}
            type="button"
            role="tab"
            aria-selected={active}
            onPointerDown={() => {
              pointerDrivenTabActivationRef.current = true;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                pointerDrivenTabActivationRef.current = false;
              }
            }}
            onClick={() => onValueChange(v)}
            style={{
              borderTopLeftRadius: radius,
              borderTopRightRadius: radius,
            }}
            className={cn(
              "relative z-[1] flex min-w-[5rem] flex-col items-stretch px-3 pb-0 pt-2 text-sm font-medium outline-none",
              "transition-[color,transform] duration-150 ease-out",
              isSinkRise &&
                "motion-reduce:active:scale-100 active:scale-[0.99] active:duration-100",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              light ? "focus-visible:ring-offset-white" : "focus-visible:ring-offset-zinc-900",
              active
                ? cn(
                    "z-[2] mb-0 border-0",
                    light ? "text-zinc-900" : "text-zinc-50",
                  )
                : cn(
                    "z-[1] border-0 bg-transparent text-muted-foreground",
                    isSinkRise &&
                      (light
                        ? "hover:text-zinc-900"
                        : "hover:text-zinc-50"),
                  ),
            )}
          >
            {usesPresenceMotion ? (
              <AnimatePresence initial={false} mode="sync">
                {active ? (
                  reduceMotion || (isSinkRise && !sinkRisePointerMotion) ? (
                    <motion.div
                      key="surface"
                      className={cn(
                        "pointer-events-none absolute inset-0 -z-0",
                        folderBgClass,
                        isSinkRise && "overflow-hidden",
                      )}
                      style={{
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                        ...(isSinkRise
                          ? { transformOrigin: "50% 100%", willChange: "transform" }
                          : { willChange: "transform, opacity" }),
                      }}
                      initial={{ opacity: 1, scaleY: 1 }}
                      animate={{ opacity: 1, scaleY: 1, transition: { duration: 0 } }}
                      exit={
                        reduceMotion
                          ? { opacity: 0, transition: { duration: 0 } }
                          : {
                              opacity: 1,
                              scaleY: 1,
                              transition: { duration: 0 },
                            }
                      }
                    />
                  ) : isSinkRise ? (
                    <motion.div
                      key="surface"
                      className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
                      style={{
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                      }}
                      initial={false}
                      animate={{ opacity: 1 }}
                      exit={{
                        opacity: 1,
                        transition: { duration: 0, when: "afterChildren" },
                      }}
                    >
                      <motion.div
                        className={cn("absolute inset-0", folderBgClass)}
                        style={{
                          transformOrigin: "50% 100%",
                          willChange: "transform",
                        }}
                        initial={{ scaleY: SINK_RISE_FOLDER_SCALE_Y_FLOOR }}
                        animate={{
                          scaleY: 1,
                          transition: sinkRiseSheetEnterTransition,
                        }}
                        exit={{
                          scaleY: SINK_RISE_FOLDER_SCALE_Y_FLOOR,
                          transition: sinkRiseSheetExitTransition,
                        }}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="surface"
                      className={cn(
                        "pointer-events-none absolute inset-0 -z-0",
                        folderBgClass,
                      )}
                      style={{
                        borderTopLeftRadius: radius,
                        borderTopRightRadius: radius,
                        willChange: "transform, opacity",
                      }}
                      initial={{ opacity: 0, scaleY: 1, y: 0 }}
                      animate={{
                        opacity: 1,
                        scaleY: 1,
                        y: 0,
                        transition: presenceFolderEnterTransition,
                      }}
                      exit={{
                        opacity: 0,
                        scaleY: 1,
                        y: 0,
                        transition: presenceFolderExitTransition,
                      }}
                    />
                  )
                ) : null}
              </AnimatePresence>
            ) : active ? (
              <motion.div
                layoutId={`${layoutGroupId}-file-cabinet-folder-surface-${folderLayoutIdSuffix}`}
                className={cn(
                  "pointer-events-none absolute inset-0 -z-0",
                  folderBgClass,
                )}
                style={{
                  borderTopLeftRadius: radius,
                  borderTopRightRadius: radius,
                  willChange: "transform",
                }}
                transition={folderSurfaceTransition}
              />
            ) : null}
            {isSinkRise && sinkRisePointerMotion ? (
              <motion.span
                className={cn(
                  "relative z-[1] flex w-full min-w-0 flex-row items-center justify-center",
                  showLeftLamp ? "gap-2" : "gap-0",
                )}
                initial={false}
                animate={{ y: active ? 0 : INACTIVE_TAB_LABEL_OFFSET_PX }}
                transition={
                  active ? sinkRiseSheetEnterTransition : sinkRiseSheetExitTransition
                }
              >
                {showLeftLamp ? (
                  <span className="relative size-2.5 shrink-0">
                    <img
                      src={FILE_CABINET_TAB_LAMP_SRC.default}
                      alt=""
                      width={10}
                      height={10}
                      className={cn(
                        "pointer-events-none absolute inset-0 size-2.5 transition-opacity ease-out motion-reduce:transition-none",
                        active ? "opacity-0" : "opacity-100",
                      )}
                      style={{
                        transitionDuration: `${SINK_RISE_LAMP_CROSSFADE_MS * 1000}ms`,
                      }}
                      aria-hidden
                    />
                    <img
                      src={FILE_CABINET_TAB_LAMP_SRC.active}
                      alt=""
                      width={10}
                      height={10}
                      className={cn(
                        "pointer-events-none absolute inset-0 size-2.5 transition-opacity ease-out motion-reduce:transition-none",
                        active ? "opacity-100" : "opacity-0",
                      )}
                      style={{
                        transitionDuration: `${SINK_RISE_LAMP_CROSSFADE_MS * 1000}ms`,
                      }}
                      aria-hidden
                    />
                  </span>
                ) : null}
                <span className="truncate text-center">{label}</span>
              </motion.span>
            ) : (
              <span
                className={cn(
                  "relative z-[1] flex w-full min-w-0 flex-row items-center justify-center transition-transform duration-150 ease-out",
                  showLeftLamp ? "gap-2" : "gap-0",
                )}
                style={{
                  transform: active
                    ? "translateY(0px)"
                    : `translateY(${inactiveTabLabelOffsetPxStatic}px)`,
                }}
              >
                {showLeftLamp ? (
                  <img
                    src={active ? FILE_CABINET_TAB_LAMP_SRC.active : FILE_CABINET_TAB_LAMP_SRC.default}
                    alt=""
                    width={10}
                    height={10}
                    className="size-2.5 shrink-0 transition-opacity duration-150 ease-out"
                    aria-hidden
                  />
                ) : null}
                <span className="truncate text-center">{label}</span>
              </span>
            )}
            {showLeftLamp ? (
              usesPresenceMotion ? (
                <AnimatePresence initial={false} mode="sync">
                  {active ? (
                    <motion.span
                      key="underline"
                      aria-hidden
                      className={cn(
                        "relative z-[1] mx-auto mt-1.5 block h-px w-[min(calc(100%-2px),calc(4.5rem-2px))]",
                        underlineClass,
                      )}
                      initial={
                        reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 0 }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: presencePillEnterTransition,
                      }}
                      exit={{
                        opacity: 0,
                        y: 0,
                        transition: presencePillExitTransition,
                      }}
                    />
                  ) : null}
                </AnimatePresence>
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "relative z-[1] mx-auto mt-1.5 h-px w-[min(calc(100%-2px),calc(4.5rem-2px))] transition-opacity duration-150 ease-out",
                    underlineClass,
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              )
            ) : noLeftLampBelowStyle === "preset-led" ? (
              usesPresenceMotion ? (
                <AnimatePresence initial={false} mode="sync">
                  {active ? (
                    <motion.span
                      key="preset-led-pill"
                      aria-hidden
                      className={cn(
                        "relative z-[1] mx-auto mt-1.5 block h-[4px] w-[22px] shrink-0 rounded-full border border-zinc-600 motion-reduce:transition-none",
                      )}
                      style={{
                        backgroundColor: `rgba(${PRESET_LED_ACCENT_RGB.r}, ${PRESET_LED_ACCENT_RGB.g}, ${PRESET_LED_ACCENT_RGB.b}, ${0.5 + presetLedGlow * 0.45})`,
                        boxShadow: `0 0 ${8 + presetLedGlow * 12}px rgba(${PRESET_LED_ACCENT_RGB.r}, ${PRESET_LED_ACCENT_RGB.g}, ${PRESET_LED_ACCENT_RGB.b}, ${0.4 + presetLedGlow * 0.4})`,
                      }}
                      initial={
                        reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 0 }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: presencePillEnterTransition,
                      }}
                      exit={{
                        opacity: 0,
                        y: 0,
                        transition: presencePillExitTransition,
                      }}
                    />
                  ) : null}
                </AnimatePresence>
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "relative z-[1] mx-auto mt-1.5 h-[4px] w-[22px] shrink-0 rounded-full border border-zinc-600 transition-opacity duration-150 ease-out motion-reduce:transition-none",
                    active ? "opacity-100" : "opacity-0",
                  )}
                  style={
                    active
                      ? {
                          backgroundColor: `rgba(${PRESET_LED_ACCENT_RGB.r}, ${PRESET_LED_ACCENT_RGB.g}, ${PRESET_LED_ACCENT_RGB.b}, ${0.5 + presetLedGlow * 0.45})`,
                          boxShadow: `0 0 ${8 + presetLedGlow * 12}px rgba(${PRESET_LED_ACCENT_RGB.r}, ${PRESET_LED_ACCENT_RGB.g}, ${PRESET_LED_ACCENT_RGB.b}, ${0.4 + presetLedGlow * 0.4})`,
                        }
                      : undefined
                  }
                />
              )
            ) : usesPresenceMotion ? (
              <AnimatePresence initial={false} mode="sync">
                {active ? (
                  <motion.span
                    key="telemetry-wrap"
                    aria-hidden
                    className={cn(
                      "relative z-[1] mx-auto mt-1.5 flex h-[var(--telemetry-led-h,0.25rem)] w-[min(calc(100%-8px),4.5rem)] shrink-0 items-stretch justify-center overflow-hidden rounded-full",
                      "border border-border/80 bg-muted-foreground/25 dark:border-border dark:bg-muted-foreground/20",
                      "motion-reduce:transition-none",
                    )}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: presencePillEnterTransition,
                    }}
                    exit={{
                      opacity: 0,
                      transition: presencePillExitTransition,
                    }}
                  >
                    <DashboardLedCapsuleWebgl
                      lit
                      tone={vfdCapsuleTone}
                      className="min-h-0 min-w-0 flex-1"
                    />
                  </motion.span>
                ) : null}
              </AnimatePresence>
            ) : (
              <span
                aria-hidden
                className={cn(
                  "relative z-[1] mx-auto mt-1.5 flex h-[var(--telemetry-led-h,0.25rem)] w-[min(calc(100%-8px),4.5rem)] shrink-0 items-stretch justify-center overflow-hidden rounded-full",
                  "border border-border/80 bg-muted-foreground/25 dark:border-border dark:bg-muted-foreground/20",
                  "transition-[border-color] duration-150 ease-out motion-reduce:transition-none",
                )}
              >
                <DashboardLedCapsuleWebgl
                  lit={active}
                  tone={vfdCapsuleTone}
                  className="min-h-0 min-w-0 flex-1"
                />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative flex w-full min-w-0 items-end gap-0 bg-transparent px-0 pt-1">
      {usesPresenceMotion ? (
        tablist
      ) : (
        <LayoutGroup id={`file-cabinet-tabs-${layoutGroupId}-${folderLayoutIdSuffix}`}>
          {tablist}
        </LayoutGroup>
      )}
    </div>
  );
}
