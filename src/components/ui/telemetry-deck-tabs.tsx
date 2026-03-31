"use client";

import * as React from "react";

import { DashboardLedCapsuleWebgl } from "@/components/ui/dashboard-led-capsule-webgl";
import {
  TELEMETRY_LED_TONE_ACTIVE_GROUP,
  type TelemetryDeckLedTone,
} from "@/components/ui/telemetry-led-tones";
import { cn } from "@/lib/utils";

type TelemetryDeckVisual = "auto" | "light" | "dark";

type TelemetryDeckCapsulePlacement = "above" | "below" | "inside";

type TelemetryDeckCapsuleImpl = "css" | "vfd";

interface TelemetryDeckTabsContextValue {
  value: string;
  onValueChange: (next: string) => void;
  visual: TelemetryDeckVisual;
  capsulePlacement: TelemetryDeckCapsulePlacement;
  capsuleImpl: TelemetryDeckCapsuleImpl;
}

const TelemetryDeckTabsContext =
  React.createContext<TelemetryDeckTabsContextValue | null>(null);

function useTelemetryDeckTabs() {
  const ctx = React.useContext(TelemetryDeckTabsContext);
  if (!ctx) {
    throw new Error(
      "TelemetryDeckTabList and TelemetryDeckTab must be used within TelemetryDeckTabs"
    );
  }
  return ctx;
}

interface TelemetryDeckTabsProps {
  value: string;
  onValueChange: (next: string) => void;
  children: React.ReactNode;
  className?: string;
  /** `auto` follows app light/dark; `light` / `dark` pin chrome for previews. */
  visual?: TelemetryDeckVisual;
  /**
   * Capsule indicator position. Default `above` preserves the original strip (LED over tab).
   * `below` / `inside` are used by the design playground and any product surfaces that match.
   */
  capsulePlacement?: TelemetryDeckCapsulePlacement;
  /** `vfd` = VFD-style WebGL green glow; `css` = flat styles. */
  capsuleImpl?: TelemetryDeckCapsuleImpl;
}

/**
 * Tab strip with capsule LEDs per trigger. No tray background — only the
 * buttons and LEDs. Styling aligns with default `Tabs` (muted surface, sm type).
 * Active label uses theme `primary`. Title case labels, font-medium (500), normal tracking.
 */
function TelemetryDeckTabs({
  value,
  onValueChange,
  children,
  className,
  visual = "auto",
  capsulePlacement = "above",
  capsuleImpl = "css",
}: TelemetryDeckTabsProps) {
  return (
    <TelemetryDeckTabsContext.Provider
      value={{
        value,
        onValueChange,
        visual,
        capsulePlacement,
        capsuleImpl,
      }}
    >
      <div className={cn("text-sm font-medium", className)}>{children}</div>
    </TelemetryDeckTabsContext.Provider>
  );
}

interface TelemetryDeckTabListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function TelemetryDeckTabList({
  className,
  children,
  ...rest
}: TelemetryDeckTabListProps) {
  const { capsulePlacement } = useTelemetryDeckTabs();
  return (
    <div
      role="tablist"
      className={cn(
        "relative flex w-full max-w-md items-stretch gap-2 bg-transparent",
        capsulePlacement === "above" && "pt-3",
        capsulePlacement === "below" && "pb-3",
        capsulePlacement === "inside" && "pt-1",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

interface TelemetryDeckTabProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  value: string;
  children: React.ReactNode;
  /** Dashboard-style lamp color when active (CSS or VFD). Default `primary`. */
  ledTone?: TelemetryDeckLedTone;
}

function TelemetryDeckTab({
  value: tabValue,
  children,
  className,
  disabled,
  ledTone = "primary",
  ...rest
}: TelemetryDeckTabProps) {
  const { value, onValueChange, visual, capsulePlacement, capsuleImpl } =
    useTelemetryDeckTabs();
  const isSelected = value === tabValue;

  const autoSurface = cn(
    "rounded-xs border-0 bg-muted/90 text-muted-foreground hover:text-foreground",
    "dark:bg-muted/50 dark:text-zinc-300 dark:hover:!text-white",
    "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm",
    "dark:data-[state=active]:bg-input/30 dark:data-[state=active]:!text-white"
  );

  const lightOnlySurface = cn(
    "rounded-xs border-0 bg-muted/90 text-muted-foreground hover:text-foreground",
    "data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
  );

  const darkOnlySurface = cn(
    "rounded-xs border-0 bg-muted/50 text-zinc-300 hover:!text-white",
    "data-[state=active]:bg-input/30 data-[state=active]:!text-white data-[state=active]:shadow-sm"
  );

  const surface =
    visual === "light"
      ? lightOnlySurface
      : visual === "dark"
        ? darkOnlySurface
        : autoSurface;

  const ledAuto = cn(
    "border border-border/80 bg-muted-foreground/25",
    "dark:border-border dark:bg-muted-foreground/20"
  );
  const ledLight = "border border-border/80 bg-muted-foreground/25";
  const ledDark = "border border-border bg-muted-foreground/20";
  const ledOff =
    visual === "light" ? ledLight : visual === "dark" ? ledDark : ledAuto;

  /** Active capsule: lit face + crisp edge; tone picks vehicle-style hue. */
  const ledActive = TELEMETRY_LED_TONE_ACTIVE_GROUP[ledTone];

  const ledBase = cn(
    "h-[var(--telemetry-led-h,0.25rem)] w-[var(--telemetry-led-w,1.5rem)] shrink-0 rounded-full",
    "transition-[background-color,box-shadow,border-color,width,height] duration-100 motion-reduce:transition-none",
    capsuleImpl === "css" && ledOff,
    capsuleImpl === "css" && ledActive
  );

  const ledShaderShell = cn(
    "h-[var(--telemetry-led-h,0.25rem)] w-[var(--telemetry-led-w,1.5rem)] shrink-0 overflow-hidden rounded-full",
    "border border-border/80 bg-muted-foreground/25 dark:border-border dark:bg-muted-foreground/20",
    "transition-[border-color,opacity] duration-100 motion-reduce:transition-none",
  );

  const renderLed = (layout: "outside" | "inside") => {
    const isInside = layout === "inside";
    if (capsuleImpl === "vfd") {
      const shell = cn(
        ledShaderShell,
        "pointer-events-none",
        isInside ? "relative" : "absolute left-1/2 -translate-x-1/2",
        !isInside && capsulePlacement === "above" && "-top-2.5",
        !isInside && capsulePlacement === "below" && "-bottom-2.5",
      );
      return (
        <span className={shell}>
          <DashboardLedCapsuleWebgl lit={isSelected} tone={ledTone} />
        </span>
      );
    }
    const cssLed = cn(
      ledBase,
      "pointer-events-none",
      isInside ? "relative" : "absolute left-1/2 -translate-x-1/2",
      !isInside && capsulePlacement === "above" && "-top-2.5",
      !isInside && capsulePlacement === "below" && "-bottom-2.5",
    );
    return <span aria-hidden className={cssLed} />;
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "group/tab relative z-[1] flex min-h-8 flex-1 cursor-pointer items-center justify-center px-2.5 outline-none",
        capsulePlacement === "inside"
          ? "min-h-10 flex-col gap-1.5 py-2"
          : "flex-col justify-center py-1.5",
        "tracking-normal transition-[background-color,color,box-shadow] duration-100 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "motion-reduce:transition-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        surface,
        className
      )}
      onClick={() => {
        if (!disabled) onValueChange(tabValue);
      }}
      {...rest}
    >
      {capsulePlacement === "above" ? (
        <>
          {renderLed("outside")}
          <span className="relative z-10">{children}</span>
        </>
      ) : null}
      {capsulePlacement === "below" ? (
        <>
          <span className="relative z-10">{children}</span>
          {renderLed("outside")}
        </>
      ) : null}
      {capsulePlacement === "inside" ? (
        <>
          <span className="relative z-10 text-center leading-tight">{children}</span>
          {renderLed("inside")}
        </>
      ) : null}
    </button>
  );
}

export { TelemetryDeckTabs, TelemetryDeckTabList, TelemetryDeckTab };
export type {
  TelemetryDeckVisual,
  TelemetryDeckCapsulePlacement,
  TelemetryDeckCapsuleImpl,
  TelemetryDeckLedTone,
};
