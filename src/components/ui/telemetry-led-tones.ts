/**
 * Vehicle-style dashboard LED tones for telemetry / warning lamps.
 * RGB in linear-ish 0–1 for WebGL; CSS tabs use matching Tailwind maps.
 */
export const TELEMETRY_LED_TONE_IDS = [
  "primary",
  "amber",
  "red",
  "coolant",
  "white",
  "lime",
  "violet",
  "orange",
  "magenta",
  "gold",
  "forest",
  "ice",
  "vfd",
] as const;

export type TelemetryDeckLedTone = (typeof TELEMETRY_LED_TONE_IDS)[number];

/** sRGB 0–1 — tuned for small emissive capsules on dark bezels */
export const TELEMETRY_LED_TONE_RGB: Record<TelemetryDeckLedTone, [number, number, number]> =
  {
    /** Theme primary #1A9375 (brand green) */
    primary: [26 / 255, 147 / 255, 117 / 255],
    /** Check engine, ABS, traction */
    amber: [1.0, 0.62, 0.12],
    /** Oil, brake, battery fault */
    red: [0.95, 0.22, 0.2],
    /** Coolant temp */
    coolant: [0.35, 0.72, 1.0],
    /** High beam / neutral telltale */
    white: [0.88, 0.9, 0.95],
    /** Eco / lane assist “go” */
    lime: [0.45, 1.0, 0.38],
    /** Park assist, blind spot */
    violet: [0.62, 0.42, 1.0],
    /** ESC off, sport / shift */
    orange: [1.0, 0.42, 0.1],
    /** Cruise / custom */
    magenta: [0.95, 0.28, 0.72],
    /** Tire / advisory */
    gold: [1.0, 0.78, 0.28],
    /** Hybrid ready, EV */
    forest: [0.18, 0.72, 0.42],
    /** Frost / cold screen */
    ice: [0.72, 0.88, 1.0],
    /** Vintage VFD mint green (1980s dashboard) */
    vfd: [0.627, 1.0, 0.816], // #A0FFD0 core
  };

export const TELEMETRY_LED_OFF_RGB: [number, number, number] = [0.07, 0.08, 0.1];

/**
 * CSS fallback when WebGL is unavailable (same “lit face + crisp edge” language as telemetry tabs).
 */
export const TELEMETRY_LED_TONE_ACTIVE_FALLBACK: Record<TelemetryDeckLedTone, string> = {
  primary:
    "border-primary/50 bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.22)]",
  amber:
    "border-amber-400/55 bg-amber-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.25)]",
  red: "border-red-500/55 bg-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.28)]",
  coolant:
    "border-sky-400/50 bg-sky-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.22)]",
  white:
    "border-zinc-300/80 bg-zinc-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.18)]",
  lime: "border-lime-400/60 bg-lime-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.22)]",
  violet:
    "border-violet-400/55 bg-violet-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.26)]",
  orange:
    "border-orange-400/55 bg-orange-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.48),inset_0_-1px_0_rgba(0,0,0,0.24)]",
  magenta:
    "border-fuchsia-400/55 bg-fuchsia-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.26)]",
  gold: "border-yellow-400/60 bg-amber-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.2)]",
  forest:
    "border-emerald-500/55 bg-emerald-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.48),inset_0_-1px_0_rgba(0,0,0,0.24)]",
  ice: "border-cyan-200/90 bg-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.12)]",
  vfd:
    "border-emerald-300/70 bg-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_0_rgba(0,0,0,0.18),0_0_6px_rgba(160,255,208,0.55),0_0_16px_rgba(90,210,150,0.35),0_0_28px_rgba(40,120,85,0.2)]",
};

/** Same as fallbacks, prefixed for `group/tab` + `data-state=active` in telemetry-deck-tabs. */
export const TELEMETRY_LED_TONE_ACTIVE_GROUP: Record<TelemetryDeckLedTone, string> = {
  primary:
    "group-data-[state=active]/tab:border-primary/50 group-data-[state=active]/tab:bg-primary group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.22)]",
  amber:
    "group-data-[state=active]/tab:border-amber-400/55 group-data-[state=active]/tab:bg-amber-500 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.25)]",
  red:
    "group-data-[state=active]/tab:border-red-500/55 group-data-[state=active]/tab:bg-red-600 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.28)]",
  coolant:
    "group-data-[state=active]/tab:border-sky-400/50 group-data-[state=active]/tab:bg-sky-500 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.22)]",
  white:
    "group-data-[state=active]/tab:border-zinc-300/80 group-data-[state=active]/tab:bg-zinc-100 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.18)]",
  lime:
    "group-data-[state=active]/tab:border-lime-400/60 group-data-[state=active]/tab:bg-lime-500 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.22)]",
  violet:
    "group-data-[state=active]/tab:border-violet-400/55 group-data-[state=active]/tab:bg-violet-600 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.26)]",
  orange:
    "group-data-[state=active]/tab:border-orange-400/55 group-data-[state=active]/tab:bg-orange-500 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.48),inset_0_-1px_0_rgba(0,0,0,0.24)]",
  magenta:
    "group-data-[state=active]/tab:border-fuchsia-400/55 group-data-[state=active]/tab:bg-fuchsia-600 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.26)]",
  gold:
    "group-data-[state=active]/tab:border-yellow-400/60 group-data-[state=active]/tab:bg-amber-400 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-1px_0_rgba(0,0,0,0.2)]",
  forest:
    "group-data-[state=active]/tab:border-emerald-500/55 group-data-[state=active]/tab:bg-emerald-600 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.48),inset_0_-1px_0_rgba(0,0,0,0.24)]",
  ice:
    "group-data-[state=active]/tab:border-cyan-200/90 group-data-[state=active]/tab:bg-cyan-100 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.12)]",
  vfd:
    "group-data-[state=active]/tab:border-emerald-300/70 group-data-[state=active]/tab:bg-emerald-400 group-data-[state=active]/tab:shadow-[inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_0_rgba(0,0,0,0.18),0_0_6px_rgba(160,255,208,0.55),0_0_16px_rgba(90,210,150,0.35),0_0_28px_rgba(40,120,85,0.2)]",
};
