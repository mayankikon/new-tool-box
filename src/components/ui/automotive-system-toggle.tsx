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

const switchThumbClassName = cn(
  "pointer-events-none absolute top-1/2 left-0.5 z-[1] size-7 origin-center rounded-full",
  "-translate-y-1/2 translate-x-0",
  // On: slide right, lift slightly, scale up + primary glow (pop)
  "group-data-checked/auto-sys:z-[2] group-data-checked/auto-sys:translate-x-7",
  "group-data-checked/auto-sys:translate-y-[calc(-50%-5px)] group-data-checked/auto-sys:scale-[1.1]",
  "motion-reduce:group-data-checked/auto-sys:-translate-y-1/2 motion-reduce:group-data-checked/auto-sys:scale-100",
  "transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.34,1.45,0.64,1)] motion-reduce:transition-[transform] motion-reduce:duration-200 motion-reduce:ease-linear",
  // Primary green “cap” — brighter when on
  "bg-[radial-gradient(circle_at_32%_28%,var(--primary-hover),var(--primary))]",
  "shadow-[2px_0_8px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.5),inset_0_-2px_5px_rgba(0,0,0,0.2)]",
  "group-data-checked/auto-sys:bg-[radial-gradient(circle_at_30%_26%,var(--primary-hover),var(--primary))]",
  "group-data-checked/auto-sys:shadow-[0_0_14px_color-mix(in_srgb,var(--primary)_90%,transparent),0_0_26px_color-mix(in_srgb,var(--primary)_55%,transparent),0_8px_20px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.7),inset_0_-1px_4px_rgba(0,0,0,0.1)]",
  "dark:shadow-[2px_0_8px_rgba(0,0,0,0.55),inset_0_1px_1px_rgba(255,255,255,0.35),inset_0_-2px_5px_rgba(0,0,0,0.35)]",
  "dark:group-data-checked/auto-sys:shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_95%,transparent),0_0_34px_color-mix(in_srgb,var(--primary)_60%,transparent),0_10px_24px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.45),inset_0_-1px_4px_rgba(0,0,0,0.25)]"
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
