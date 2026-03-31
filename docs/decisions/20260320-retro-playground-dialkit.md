# Decision: Retro design playground + DialKit for chrome tuning

**Date:** 2026-03-20  
**Status:** Accepted (Phase 1 shipped; tab strip later **frozen** to constants — DialKit hook removed from `tabs-showcase.tsx`; DialKit remains in use on other pages.)

## Context

We need a safe place to explore **skeuomorphic / automotive dash** treatments for existing design-system primitives without changing production defaults. The product already uses **DialKit** for live parameter tuning (e.g. campaign suggestion card on `/design-system`, inventory widgets).

## Decision

1. **Route:** `/design-playground` under `src/app/design-playground/` holds experiments, playground-only CSS (`retro-playground.css`), and showcase modules. It is **not** the canonical token reference (that remains `/design-system`).

2. **Audit:** `docs/design-system-retro-audit.md` lists components, retro metaphor, implementation strategy (wrapper vs variant vs new primitive), and P0–P2 priority.

3. **DialKit (Phase 2 pilot):** The **Tabs & mode row** showcase registers `useDialKit("Retro tab strip", { chrome: { ledSpread, bezelPad, metalHighlight } })`. Values feed:
   - **LED spread:** drop-shadow / box-shadow strength on telemetry tabs and green side-strip on push keys.
   - **Bezel padding / metal highlight:** inset panel framing around telemetry and push-key variants.

4. **Promotion path:** Frozen presets graduate to optional `visual`/`variant` props or namespaced wrappers in `src/components/ui/` after design sign-off. Numeric DialKit values can be copied into tokens or fixed class strings.

## Alternatives considered

- **Only React state sliders in the playground:** Simpler, but duplicates control UX already provided by DialKit and does not match how other internal tools tune layout.
- **Global theme swap:** Too blunt; dash aesthetic may remain scoped to specific surfaces.

## Consequences

- DialKit panel surface area increases by one registered group (`Retro tab strip`); developers should collapse it when not tuning dash chrome.
- Playground-only CSS must not be imported from product routes (keep import in `design-playground/layout.tsx` only).
