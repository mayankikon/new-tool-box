"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

/** Fluorescent green on-indicator (tube / LED look). */
const ledLight =
  "before:bg-[#00ff7b] before:shadow-[0_0_8px_rgba(0,255,123,1),0_0_16px_rgba(0,255,123,0.75),0_0_26px_rgba(0,255,123,0.4)]";
const ledDark =
  "dark:before:bg-[#39ff14] dark:before:shadow-[0_0_10px_rgba(57,255,20,1),0_0_20px_rgba(57,255,20,0.8),0_0_32px_rgba(57,255,20,0.45)]";

const switchTrackClassName = cn(
  "group/auto-sys relative inline-flex h-8 w-[60px] shrink-0 cursor-pointer items-center rounded-full outline-none",
  // Light: very light gray track (soft groove)
  "border border-zinc-300/85 bg-zinc-200",
  "shadow-[inset_0_2px_7px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.85)]",
  // Dark: stepped-up gray (still recessed, a touch lighter)
  "dark:border-zinc-500/75 dark:bg-zinc-600",
  "dark:shadow-[inset_0_3px_8px_rgba(0,0,0,0.32),0_1px_0_rgba(255,255,255,0.12)]",
  "before:pointer-events-none before:absolute before:top-1/2 before:left-3 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full before:transition-opacity before:duration-200 before:content-[''] before:opacity-0",
  ledLight,
  ledDark,
  "data-checked:before:opacity-100",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50",
  "focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "dark:focus-visible:ring-primary/45 dark:focus-visible:ring-offset-background"
);

// Thumb fills: pull toward primary but boost saturation + highlights so the knob reads bright, not muddy.
const thumbFillOff =
  "bg-[radial-gradient(circle_at_32%_24%,color-mix(in_srgb,var(--primary-hover)_28%,#fff_72%)_0%,color-mix(in_srgb,var(--primary)_52%,#86efac_48%)_52%,var(--primary)_100%)]";
const thumbFillOn =
  "group-data-checked/auto-sys:bg-[radial-gradient(circle_at_28%_22%,color-mix(in_srgb,var(--primary-hover)_22%,#fff_78%)_0%,color-mix(in_srgb,var(--primary)_38%,#6ee7b7_62%)_48%,color-mix(in_srgb,var(--primary)_92%,#059669_8%)_100%)]";

const switchThumbClassName = cn(
  "pointer-events-none absolute top-1/2 left-0.5 z-[1] size-7 origin-center rounded-full",
  // Stay vertically centered; motion is horizontal only (translate-x). Glow/shadow still cross-fade.
  "-translate-y-1/2 translate-x-0",
  "group-data-checked/auto-sys:z-[2] group-data-checked/auto-sys:translate-x-7",
  // Longer duration so the slide reads clearly; ease-out deceleration at the end.
  "transition-[transform,box-shadow] duration-[420ms] ease-out motion-reduce:transition-[transform] motion-reduce:duration-200 motion-reduce:ease-linear",
  thumbFillOff,
  thumbFillOn,
  // Light sculpting — keep depth without heavy forest-green mud
  "shadow-[1px_0_6px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.62),inset_0_-1px_3px_rgba(0,0,0,0.14)]",
  // On: emissive “lamp” halo (light mint / chartreuse) — not a dark drop shadow
  "group-data-checked/auto-sys:shadow-[0_0_8px_rgba(255,255,255,0.55),0_0_18px_color-mix(in_srgb,var(--primary)_55%,#ecfccb_45%),0_0_32px_color-mix(in_srgb,var(--primary)_40%,#d9f99d_60%),0_0_48px_rgba(190,242,100,0.28),inset_0_1px_2px_rgba(255,255,255,0.82),inset_0_-1px_3px_rgba(0,0,0,0.08)]",
  "dark:shadow-[1px_0_8px_rgba(0,0,0,0.45),inset_0_1px_2px_rgba(255,255,255,0.42),inset_0_-1px_4px_rgba(0,0,0,0.28)]",
  "dark:group-data-checked/auto-sys:shadow-[0_0_10px_rgba(255,255,255,0.35),0_0_22px_color-mix(in_srgb,var(--primary)_60%,#bbf7d0_40%),0_0_40px_color-mix(in_srgb,var(--primary)_45%,#86efac_55%),0_0_56px_rgba(134,239,172,0.32),inset_0_1px_2px_rgba(255,255,255,0.55),inset_0_-1px_3px_rgba(0,0,0,0.2)]"
);

export type AutomotiveSystemSwitchProps = SwitchPrimitive.Root.Props;

function AutomotiveSystemSwitch({
  className,
  ...props
}: AutomotiveSystemSwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="automotive-system-switch"
      className={cn(switchTrackClassName, className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="automotive-system-switch-thumb"
        className={switchThumbClassName}
      />
    </SwitchPrimitive.Root>
  );
}

export { AutomotiveSystemSwitch };
