# Slider — Sort UI / Figma parity

Implementation: [`src/components/ui/slider.tsx`](../../src/components/ui/slider.tsx). Design system: `/design-system` → **Slider**.

## Figma

Add **Sort UI 1.3 Playground** slider component node URLs here when design pins them (file: `SWdPHuoLpCP03Ottx8g5GT`). Compare at 100% zoom:

- [ ] Track height (sm vs md) and thumb diameter
- [ ] Tick height / color (`--theme-stroke-default`)
- [ ] Label typography (md: 12px/16px tertiary; sm: 11px/16px)
- [ ] Horizontal inset (`px-2` md / `px-1.5` sm) on the **inner wrapper** around Control + marks (not on `Control` itself) vs thumb edge alignment (`thumbAlignment="edge"`) — inset on `Control` skewed thumb vs fill for Base UI edge mode
- [ ] Primary fill on indicator vs muted track

## Props → UI

| Prop | Behavior |
|------|-----------|
| `marks` | `true`: auto labels from `markStep` or default interval from span. `number[]`: explicit positions. `{ values, showTicks? }`: explicit + optional hide tick lines. |
| `markStep` | Gap between generated labels when `marks={true}`. |
| `formatMark` | Renders each label (default `String`). |
| `size` | `sm`: 12px thumb, 4px track, denser control. `md`: 16px thumb, 6px track. |
| `label` / `helperText` | Field pattern above / below control. |
| `showMarkTicks` | Override tick lines when marks are shown. |
| `thumbClassName` | Optional classes merged onto each thumb (e.g. design-playground skeuomorphic handle via `slider-thumb-drawing` on `Slider` inside `.playground-ds-slider-drawing`; see `retro-playground.css`). **Do not override `position`** — the thumb must stay `absolute` or it drops into flex flow and sits at the end of the track row. |

## Default mark interval (when `marks={true}` and `markStep` omitted)

| Span `(max − min)` | Interval (at least `step`) |
|--------------------|----------------------------|
| ≤ 10 | `max(1, step)` |
| ≤ 40 | `max(2, step)` |
| ≤ 100 | `max(5, step)` |
| > 100 | `max(10, step)` |

## Thumb interaction (handle / drawer feel)

The thumb uses `transform: scale` on hover, active press, `focus-within` (keyboard), and `data-[dragging]` (Base UI while dragging). Defaults: ~104% hover/focus, ~105% active, ~108% drag — with `motion-reduce` disabling scale. Adjust classes in `thumbVariants` in `slider.tsx` if Figma specifies exact values (e.g. `scale-[1.01]` for subtler lift).

## QA checklist

- [ ] Light / dark: labels and ticks readable (`--theme-text-tertiary`, `--theme-stroke-default`).
- [ ] Keyboard: arrows move thumb; focus ring visible.
- [ ] Range: both thumbs move; segment between them filled.
- [ ] No marks: no extra vertical space below track.
- [ ] Progress Bar playground control still fits row layout with marks.
