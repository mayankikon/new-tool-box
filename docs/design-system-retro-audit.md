# Retro / automotive dash — design system audit

This document inventories UI primitives from the design system ([docs/design-system-audit.md](design-system-audit.md), [src/app/design-system/design-system-nav-config.ts](../src/app/design-system/design-system-nav-config.ts)) and rates how well each supports a **retro automotive / skeuomorphic** treatment (Porsche-style radio rows, mechanical push buttons, LED indicators, faders, recessed bezels).

**Related:** Live experiments live at **`/design-playground`**. Promoted variants should graduate into [src/components/ui/](../src/components/ui/) only after sign-off.

---

## Scoring legend

| Priority | Meaning |
|----------|---------|
| **P0** | Strong dash metaphor; ship first in the playground |
| **P1** | High value; wrapper or variant prop likely |
| **P2** | Chrome-only or high effort; defer or scope to outer panels |

**Strategy types**

- **Wrapper** — Playground-only or thin layout around existing primitives (`className`, CSS variables).
- **Variant** — Add `variant` / `visual` on the existing component (touches `ui/`).
- **New primitive** — Only if behavior differs (e.g. dedicated knob/fader with keyboard model).

---

## Matrix

| Component | Source file(s) | Retro metaphor | Strategy | Priority | Notes |
|-----------|----------------|------------------|----------|----------|-------|
| Tabs (pill / default / line) | `tabs.tsx` | Mode row, labeled segment strip | Wrapper + optional variant | P0 | Base UI tabs; pill indicator already slides |
| Telemetry deck tabs | `telemetry-deck-tabs.tsx` | Capsule LEDs above/below/inside mode keys | Wrapper (glow intensity) | P0 | `capsulePlacement`: above (default), below, inside |
| Radio segmented | `radio-segmented.tsx` | Porsche preset / FM band row | Wrapper | P0 | Real radio group; keep focus + label association |
| Radio group / cards | `radio-group.tsx`, `radio-card.tsx` | Preset blocks, tactile cards | Wrapper | P1 | Cards map to chunky push areas |
| Toggle switch | `toggle-switch.tsx` | Paddle / dual-state dash switch | Wrapper | P0 | Already two-option; add bezel + indicator lamp |
| Button | `button.tsx` | Mechanical push, side LED strip | Wrapper | P0 | `focus-visible:ring` must remain |
| Filter button | `filter-button.tsx` | Small preset / filter key | Wrapper | P1 | Selected state → illuminated strip |
| Checkbox | `checkbox.tsx` | Indicator lamp + label | Wrapper | P1 | Pair with faux bezel |
| Progress bar | `progress.tsx` | Linear gauge, level meter | Wrapper | P0 | No circular gauge in system; pair with `range` for fader |
| Native `input[type=range]` | — | EQ fader, climate slider | Playground primitive | P0 | No shared Slider in repo yet |
| Badge | `badge.tsx` | Status LED / annunciator | Wrapper | P2 | Small accent; not primary interaction |
| Card | `card.tsx` | Recessed instrument binnacle | Wrapper | P1 | Metal frame, screws = decorative optional |
| Input | `input.tsx` | Display window, slot | Wrapper | P1 | Inset track + mono label |
| Table | `table.tsx` | Data grid only | P2 | Low character unless wrapped in dash panel |
| Sidebar | `sidebar.tsx` | N/A | P2 | App chrome; retro scope unclear |
| Date picker | `date-picker.tsx`, … | N/A | P2 | Complex popovers; defer |
| Dropdown menu | `dropdown-menu.tsx` | Rarely dash-authentic | P2 | Optional panel chrome only |
| Stepper | `stepper-*.tsx` | Sequential indicators | P2 | Could mimic segment LEDs; lower priority than tabs |
| Paginator | `paginator.tsx` | N/A | P2 | Defer |

---

## Playground layout (live vs queued)

The left nav on **`/design-playground`** mirrors **`design-system-nav-config.ts`** (components + patterns).

| Nav slug | Live playground | Notes |
|----------|-----------------|--------|
| `tabs` | Yes | Tab strips: telemetry, side-LED push, **outline + under-glow** (fixed: **left lamp**, primary, halo ~11px, radius 6px, recess 0, title case). Flat channel; outline tab clicks → `card_button.mp3`. Tweaks: **preview surface only**. Saira via `font-headline`. Bezel uses fixed constants (ex–DialKit defaults). |
| `radio` | Yes | Same page as **Tabs**; auto-scrolls to **Radio & segmented** play area. Clicks play `/sounds/card_button.mp3` when present. |
| `toggle-switch` | Yes | Two play areas: paddle on/off + push keys / annunciators (`FilterButton`, `Button`). |
| `slider` | Yes | Three play areas: retro native range, design-system **`Slider`**, **`ProgressBar`**. |
| `progress-bar` | Yes | Same page as **Slider**; auto-scrolls to **Progress bar** play area. |
| All other component slugs | Queued | Stub panel + pointer to this doc. |
| Pattern slugs | Queued | Stub; retro often scoped to panel chrome — see § App-wide extractables. |

---

## Accessibility guardrails

- **Selection state** must not rely on glow alone: keep `aria-selected`, `aria-pressed`, or native radio/tab roles.
- **Focus**: retain visible `focus-visible` rings (or equivalent high-contrast outline).
- **Contrast**: labels on metal/dark surfaces need token-safe text colors (`text-foreground` / `text-primary`).
- **Motion**: respect `prefers-reduced-motion` for LED pulse or spring animations.

---

## Promotion path (playground → product)

1. Freeze a preset as a named variant in docs + screenshot.
2. Extract shared classes to a module or CSS variables under `globals.css` or a `retro-` partial if adopted broadly.
3. Add optional `visual="retro"` (or similar) on the primitive **or** a namespaced wrapper component in `ui/` to avoid breaking defaults.

---

## Phase 2: DialKit

See [docs/decisions/20260320-retro-playground-dialkit.md](decisions/20260320-retro-playground-dialkit.md). Numeric chrome (LED blur, inset depth, bezel radius) can be driven by `useDialKit` for faster iteration; values can be copied into tokens or variant classes when finalized.

---

## App-wide extractables (for future playgrounds)

These are **composite surfaces** in the product — not all are in the design-system nav, but each is a candidate to **extract** a self-contained preview + tweak surface (retro chrome, DialKit, or token experiments) without rewriting business logic on day one.

| Area | Typical entry / folder | Why extract | Retro lever |
|------|-------------------------|-------------|-------------|
| App shell | `src/components/app/top-bar.tsx`, `src/components/ui/sidebar.tsx` | Every page shares chrome; high visibility | Bezel title bar, “instrument” breadcrumbs |
| Campaign dashboard | `src/components/campaigns/campaign-dashboard.tsx`, KPI cards, suggestion card | Dense dashboard = dash metaphor | LED status strips, gauge-style KPIs |
| Campaign wizard | `src/components/campaigns/campaign-wizard.tsx`, `wizard-stepper.tsx` | Stepper = sequential mode control | Segment LEDs, mechanical step keys |
| Coupon / offer cards | `coupon-card-preview.tsx`, `coupon-builder-editor.tsx` | Card chrome + CTA | Recessed display, illuminated CTA |
| Inventory dashboard | `inventory-dashboard.tsx`, `inventory-dashboard-widgets.tsx`, `lot-age-widgets.tsx` | Widget shells + charts | Binnacle frames, analog-style mini-gauges |
| Map + list split | `inventory-content.tsx`, `vehicle-list-panel.tsx` | Split layout + filters | Panel screws/bezel, filter as toggle bank |
| Marketing templates | `templates-page.tsx` | Card grid + lifecycle tabs | Radio-row stage filters |
| Monitor / opportunities | `marketing-monitor-page.tsx` | KPI row + map + list | Telemetry-style KPI strip |
| Filters side panel | `filters-panel.tsx` | Slide-over controls | Rack of mechanical toggles |
| AI TextArea | `ai-textarea.tsx` | Composer chrome | Recessed “display” + soft keys |
| Empty / file upload | `empty-state.tsx`, `file-upload-*.tsx` | Illustration + CTA | Deck annunciator + key slot |

**Extraction pattern:** copy a **thin story** (mock props) into `src/app/design-playground/showcases/` (or `modules/`), wrap with `DashPreviewCanvas`, add variant grid + local state; keep domain types from `src/lib/**` where helpful.

**Promotion:** after sign-off, fold chrome into shared wrappers under `src/components/ui/` or product-specific `components/*/chrome/`.
