---
name: ethereal-design-principles
description: >-
  Design principles for building calm, structured, data-heavy interfaces in the
  style of Ethereal/Halaska Studio (DeFi DEX, trading dashboards). Use when
  designing or implementing UIs that should feel minimal, dark-mode-first,
  clarity-focused, and approachable for complex data—trading panels, modals,
  leaderboards, dashboards, or any interface where density and readability
  matter.
---

# Ethereal-Style UI Design Principles

Principles derived from the Ethereal DEX and Halaska Studio portfolio: calm, structured, intuitive interfaces that bring clarity to complex data (trading, DeFi, dashboards). Apply these when building or reviewing UI in this aesthetic.

## Design philosophy

- **Data-centric**: Prioritize clear presentation of complex data; avoid decorative clutter.
- **Calm and structured**: Modular layout, consistent spacing, and clear hierarchy so the eye knows where to go.
- **Approachable complexity**: Dense information without feeling overwhelming—generous whitespace and scannable patterns.
- **Dark-mode first**: Optimized for prolonged viewing and focus; accent color used for meaning, not decoration.

---

## Color

- **Background**: Dark slate / near-black (e.g. `#1E1E2E` or equivalent). Low glare, non-distracting.
- **Surfaces**: Slightly elevated panels use dark grey with subtle contrast; modals can have a very slight texture or stripe for depth.
- **Text**: Light grey and white for primary content; dimmer grey for secondary labels and inactive states. High contrast for readability.
- **Semantic accents**:
  - **Green**: Positive values, long/buy, gains, success, “up” (e.g. PnL, 24h change, ROI).
  - **Red**: Negative values, short/sell, losses, “down.”
  - **Blue/purple**: Primary actions (e.g. “Place order”), active nav, subtle interactive highlights—cool, restrained.
- **Hierarchy**: Critical numbers (prices, PnL, key metrics) use bold white or accent color so they’re scannable at a glance.

---

## Typography

- **Font**: Clean sans-serif (Inter or similar); modern and legible.
- **Weights**: Use regular, semi-bold, and bold to separate headings, labels, and data. Numbers often larger and bolder for key metrics.
- **Hierarchy**: Large bold for page titles; medium for section headings and nav; smaller for labels and secondary text. Numeric data gets prominence through size and weight.
- **Alignment**: Right-align numbers in tables and cards for easy comparison; left-align labels and text.

---

## Layout and structure

- **Modular panels**: Break the screen into clear rectangular areas (chart, order book, order form, positions, etc.). Each panel has a single responsibility.
- **Top bar**: Brand left; primary nav as horizontal tabs/links; search or global actions center/right; wallet/settings right. Active route indicated (e.g. background or underline).
- **Content hierarchy**: Title → filters/tabs → primary content (cards or chart) → supporting table or list. One clear focal area per view.
- **Modals**: Centered, dark container; optional subtle background texture; header (e.g. search + tabs), body (tables/sections), footer (shortcuts or actions). Keyboard hints (↑↓, Enter, Esc) in footer when relevant.
- **Whitespace**: Ample padding and margins between sections and components so density doesn’t feel cramped.

---

## Components

- **Tabs**: Text-based; active tab has slightly lighter background and/or bolder text. Inactive tabs muted but readable.
- **Buttons**: Primary CTA (e.g. “Place order”) uses blue/purple fill; secondary actions outlined or text. Long/Short or similar toggles use green/red for meaning.
- **Inputs**: Dark grey background, light border, clear placeholder. Search with icon left; optional clear (X) right. Currency/unit labels (USD, ETH) near inputs where relevant.
- **Tables**: Minimal borders; optional subtle row striping or dividers. Sortable columns get small arrow icons. Green/red for signed values (PnL, change).
- **Cards**: Dark background, subtle shadow or gradient for elevation; rounded corners. Use for featured content (e.g. top traders). Labels and values clearly paired; key metrics emphasized.
- **Icons**: Minimal line icons (search, settings, indicators, close). Token/asset icons small and distinct in tables. Star/watchlist outline for optional actions.

---

## Data presentation

- **Numbers**: Prominent for prices, PnL, volume, ROI. Use locale/currency formatting and consistent decimal places.
- **Signed values**: Always use green for positive and red for negative; avoid neutral for financial deltas.
- **Tables**: Clear column headers; sortable where useful. Avoid heavy grids; use spacing and alignment to separate columns.
- **Charts**: Candlestick or similar use green/red for up/down. Axis labels and scale legible; avoid chart junk.
- **Quick scanning**: Percent buttons (0%, 25%, 50%, 75%, 100%), “Mid” and “Reduce only” style controls keep actions close to the data they affect.

---

## Interactivity and states

- **Hover**: Subtle background or text color change on interactive rows, buttons, and nav.
- **Active**: Clearly indicated (filled tab, underlined nav, selected Long/Short).
- **Focus**: Visible focus for keyboard users; consistent with the calm palette.
- **Tooltips**: Use info icons for secondary explanations; keep primary view uncluttered.
- **Shortcuts**: Show hints in modals (e.g. “↑↓ Navigate”, “Enter Open”, “ESC Close”) in muted text.

---

## Checklist (quick reference)

When implementing or reviewing UI in this style:

- [ ] Dark background with light text and semantic green/red/blue accents.
- [ ] Clear typographic hierarchy (title > sections > labels > secondary).
- [ ] Layout split into distinct panels/modules with clear roles.
- [ ] Ample spacing; no cramped blocks of data.
- [ ] Tables and cards scannable: right-aligned numbers, optional striping, sortable headers.
- [ ] Primary action (e.g. Place order) stands out; secondary actions subdued.
- [ ] Active/selected state obvious; hover and focus visible.
- [ ] Icons minimal and consistent; token/asset icons small in lists.
- [ ] Modals and overlays centered, with clear header/body/footer and optional keyboard hints.

---

## When to use this skill

Apply when:

- Designing or building trading interfaces, DeFi dashboards, or data-heavy apps.
- Aiming for a “calm, structured, intuitive” feel (Halaska/Ethereal style).
- Reviewing UI for consistency with dark-mode, high-information-density patterns.
- Implementing tables, modals, order forms, or leaderboards that need clarity and approachability.

Reference the checklist and sections above when making layout, color, typography, and component decisions.
