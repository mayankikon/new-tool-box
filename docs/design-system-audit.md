# Design System Page Audit

This document inventories the current design system page (`src/app/design-system/page.tsx`) to support Atomic Design reorganization. It is the source of truth for sections, repeated patterns, and data sources.

---

## 1.1 Inventory: top-level sections and subsections

### Top-level sections (in order)

| # | Section | Line range (approx) | Sub-sections / content |
|---|--------|---------------------|-------------------------|
| 1 | **Theme tokens** | ~376–425 | Cards per theme group (Background, Text, Stroke, Button, Interaction States) with swatches from `themeTokenGroups` |
| 2 | **Foundation tokens** | ~427–556 | Semantic colors (colorTokenGroups), Radius (radiusTokens), Spacing (spacingTokens), Stroke (strokeTokens) |
| 3 | **Typography** | ~559–660 | Font family cards, Font size samples, Font weight, Line height, Letter spacing |
| 4 | **Components** | ~663–2520 | Single large section containing all component showcases (see below) |
| 5 | **AI TextArea** | ~2521–2767 | Style variants (default/shadow/soft), multiple composition examples |
| 6 | **Inline Tips** | ~2769–2815 | Variants (default, info, success, warning, error), custom title |
| 7 | **Empty State** | ~2817–2935 | Layout variants (default, icon, illustration), with/without actions |
| 8 | **Dropdown Menu** | ~2937–3202 | DropdownButton align, MenuItemRow, Userbar, searchable menu, footer action |
| 9 | **Date Picker** | ~3204–end | Single/range, styles (default/shadow/soft), states (placeholder/filled/failed/disabled), Calendar panel, presets |

### Under "Components" — subsections in order

| # | Subsection | Primary UI pattern | One-line description |
|---|------------|--------------------|------------------------|
| 1 | Page layout & chrome | Single card + nested cards | TopBar variants (breadcrumbs × description × buttons), main content area |
| 2 | Button | Matrix + slots row | ButtonComponentShowcase: sizes, variants×states matrix, leading/trailing/badge slots |
| 3 | Link Button | Single card, flex wrap | Variants (default/muted/primary/disabled), underline, lead/tail icons, href |
| 4 | Filter Button | Single card, flex wrap | Unselected/selected, valueLabel, sizes (xs/md/lg), disabled |
| 5 | Badge | Single card, flex wrap | Variants default/secondary/outline/soft/destructive |
| 6 | Input | Multiple cards | Default, Shortcut, Add-on, Inline add-on, Quantity, Tail/Lead button, Soft, states |
| 7 | Input Caption | Single card, variants | default/success/error/checkbox, password strength (none/low/medium/high) |
| 8 | Checkbox | Multiple cards | Portfolio 3.0 **`PortfolioCheckboxControl`** for basic, group-with-description, list, and card patterns on `/design-system`. Segmented controls remain on legacy **`Checkbox`** via **`checkbox-segmented`**. Figma Shift 2.0: [15460-17838](https://www.figma.com/design/tn4ORHyi1Mi49nQ1SROYCY/Shift-2.0-Sort-UI?node-id=15460-17838) |
| 9 | Radio | Multiple cards | Same layout patterns as Checkbox; **`PortfolioRadioButton`** inside **`RadioGroup`** for basic/list/card on `/design-system`. Segmented radios use legacy **`RadioGroupItem`** via **`radio-segmented`**. Figma Shift 2.0: [15460-17838](https://www.figma.com/design/tn4ORHyi1Mi49nQ1SROYCY/Shift-2.0-Sort-UI?node-id=15460-17838) |
| 9b | Toggle Switch | Single card | Segmented binary toggle (`toggle-switch.tsx`) |
| 9c | Automotive system toggle | Inline switches | Skeuomorphic `AutomotiveSystemSwitch` (`automotive-system-toggle.tsx`, Base UI Switch; light/dark palettes, fluorescent LED) |
| 10 | Card | Single card | CardHeader/Content/Footer composition |
| 11 | Tabs | Single card | Pill (Shift 2.0), default, line (`tabs.tsx`); subsection: telemetry deck strip + LEDs (`telemetry-deck-tabs.tsx`, `visual` light/dark/auto) |
| 12 | Table | Single card | TableHeaderCell, TableSlotCell, compact example |
| 13 | Tooltip | Single card | default, card variants |
| 14 | Sidebar | Single card | Sidebar composition |
| 15 | Progress Bar | Single card | linear, dashed, no-label, minimal |
| 16 | Slider | Single card | `Slider` / `RangeSlider`: marks, `markStep`, tick lines, labels below track, sm/md, label+helper, `formatMark`; spec `docs/design-system/slider-figma-parity.md` |
| 17 | Stepper | Multiple cards | Sort UI 1.3 parity: primitives, vertical, horizontal (left/center/right/bottom, icons); spec `docs/design-system/stepper-figma-parity.md` |
| 18 | Paginator | Single card | simple, numbered, dots at first/mid/last |
| 19 | File Upload | Multiple cards | FileUploadCard (lg/sm × states), FileUploadArea, AvatarUpload, composed example |

### Organisms to create (from this inventory)

- **ThemeTokensSection**
- **FoundationTokensSection**
- **TypographySection**
- **PageLayoutChromeSection**
- **ButtonShowcaseSection**
- **LinkButtonShowcaseSection**
- **FilterButtonShowcaseSection**
- **BadgeShowcaseSection**
- **InputShowcaseSection**
- **InputCaptionShowcaseSection**
- **CheckboxShowcaseSection**
- **RadioShowcaseSection**
- **CardShowcaseSection**
- **TabsShowcaseSection**
- **TableShowcaseSection**
- **TooltipShowcaseSection**
- **SidebarShowcaseSection**
- **ProgressShowcaseSection**
- **StepperShowcaseSection**
- **PaginatorShowcaseSection**
- **FileUploadShowcaseSection**
- **AiTextAreaShowcaseSection**
- **InlineTipsShowcaseSection**
- **EmptyStateShowcaseSection**
- **DropdownMenuShowcaseSection**
- **DatePickerShowcaseSection**

Optional: **ComponentsSection** organism that only renders the list of component sub-organisms above.

---

## 1.2 Redundancy audit: repeated UI patterns

| Pattern | Example / signature | Approx count | Becomes (atomic level) |
|--------|---------------------|--------------|------------------------|
| Section container | `<section className="space-y-8">` or `<section>` | 10+ | Template (main) + organism wrapper |
| Section heading block | `<div>` + `h2.text-2xl.font-semibold.tracking-tight.text-foreground` + `p.mt-1.text-muted-foreground` | 10+ | Atom: **SectionTitle** |
| Alternate section heading | `h2.text-xl.font-semibold.text-foreground.mb-4` (no description) | Several | SectionTitle variant `compact` |
| Showcase card | `rounded-xl border border-border bg-card p-6 shadow-sm` (or `p-4`) | 42 | Atom: **ShowcaseCard** |
| Card title (h3) | `h3.text-lg.font-medium.text-foreground.mb-2` | 47+ | Part of molecule **ComponentShowcaseBlock** or ShowcaseCard slot |
| Card description | `p.text-sm.text-muted-foreground.mb-4` (or mb-3, mb-6) | Many | Same molecule |
| Sub-heading (h4) | `h4.text-sm.font-medium.text-foreground.mt-6.mb-2` or `mt-8.mb-2` | Many | Optional slot in molecule |
| Inline code | `code.rounded.bg-muted.px-1.py-0.5.text-xs` or `.px-1.5.text-sm` | Dozens | Atom: **CodeInline** |
| Token swatch (color) | Flex column: swatch box (h-10 w-10) + label | Per token | Atom: **TokenSwatch** (type: color) |
| Token swatch (text) | "Aa" sample + label | Per token | Atom: **TokenSwatch** (type: text) |
| Token group card | Card with group name (h3) + grid of swatches | ~15+ | Molecule: **TokenGroupCard** |

---

## 1.3 Data source map

| Content | Data source | Used by (after refactor) |
|---------|-------------|---------------------------|
| Theme token groups | `themeTokenGroups` in `src/lib/design-tokens.ts` | ThemeTokensSection → TokenGroupCard |
| Color / radius / spacing / stroke | `colorTokenGroups`, `radiusTokens`, `spacingTokens`, `strokeTokens` in `design-tokens.ts` | FoundationTokensSection → TokenGroupCard |
| Typography samples | `fontFamilyTokens`, `fontSizeTokens`, `fontWeightTokens`, `lineHeightTokens`, `letterSpacingTokens` in `design-tokens.ts` | TypographySection → TokenGroupCard / custom blocks |
| Button showcase config | BUTTON_SHOWCASE_SIZES, BUTTON_SHOWCASE_VARIANTS, BUTTON_SHOWCASE_STATES, BUTTON_HOVER_LOOK, BUTTON_ACTIVE_LOOK (currently in page) | ButtonShowcaseSection (extract to design-system-constants.ts or keep in organism) |
| TopBar variants | Inline array (breadcrumbs × description × buttons) in page | PageLayoutChromeSection (keep inline or extract to constant) |

**Quarks:** Design tokens = `src/lib/design-tokens.ts` + generated CSS primitives (`color-primitives.css`, `typography-primitives.css`, `layout-primitives.css`, `theme-primitives.css`). No structural change to quarks.

---

## 1.5 Left nav structure

Used by the design system left panel and section anchor IDs. One source of truth for nav config and slugs.

**Foundations** (3 items)

| Slug | Label |
|------|--------|
| `theme-tokens` | Theme tokens |
| `foundation-tokens` | Foundation tokens |
| `typography` | Typography |

**Components** (representative slugs; full list: `design-system-nav-config.ts`; Page layout is under Patterns)

| Slug | Label |
|------|--------|
| `button` | Button |
| `link-button` | Link Button |
| `filter-button` | Filter Button |
| `badge` | Badge |
| `input` | Input |
| `input-caption` | Input Caption |
| `checkbox` | Checkbox |
| `radio` | Radio |
| `automotive-system-toggle` | Automotive system toggle |
| `card` | Card |
| `tabs` | Tabs |
| `table` | Table |
| `tooltip` | Tooltip |
| `map-view-tooltip` | Map view tooltip |
| `sidebar` | Sidebar |
| `progress-bar` | Progress Bar |
| `slider` | Slider |
| `battery-threshold` | Battery threshold |
| `map-markers` | Map markers |
| `stepper` | Stepper |
| `paginator` | Paginator |
| `file-upload` | File Upload |
| `ai-textarea` | AI TextArea |
| `inline-tips` | Inline Tips |
| `empty-state` | Empty State |
| `dropdown-menu` | Dropdown Menu |
| `alert-dialog` | Alert Dialog |
| `date-picker` | Date Picker |
| `magicpath-form-controls` | Portfolio 3.0 form controls |

**Patterns** (representative; full list: `design-system-nav-config.ts`)

| Slug | Label |
|------|--------|
| `page-layout-chrome` | Page layout & chrome |
| `table-view` | **Tables**: **Table with tabs** (file cabinet, `sink-rise` tab motion) and **Table** (simple bordered) |

New sections: add a row here and the same slug/label to `design-system-nav-config.ts`, and add `id="{slug}"` to the section in the page.

**Chrome naming:** The design system distinguishes **Avatar bar** (`AvatarBar`, slug `avatar-bar`) from **Top bar** (`TopBar`, slug `top-bar`; formerly documented as “Title bar” / slug `title-bar`).

---

## 1.6 Modular overhaul notes

Changes applied in the modular overhaul pass:

- **Foundation tokens:** Removed radius `2xl` (24px), `3xl` (28px), `Card-lg` (16px) from showcase. Removed spacing `96` (96px). CSS primitives still define the vars; they are just no longer showcased.
- **Typography:** Token arrays now include actual values (e.g. `xs (12px)`, `semibold (600)`) so the showcase displays metadata alongside token names.
- **Button:** Removed the "Slots" section (leading/trailing icons, badge). Sizes and Variants×States matrix remain.
- **Page layout & chrome:** Replaced 12 static TopBar permutations with an interactive playground (breadcrumb count, description toggle, button count controls). Static "Inventory" reference and main content area skeleton kept.
- **Badge:** Merged two duplicate sections into one showing all variants: default, secondary, outline, ghost, destructive, link.
- **Checkbox / Radio:** Removed `CheckboxSegmented` and `RadioSegmented` from showcase (components remain in `ui/`). Fixed "NEW" badge font to use `font-headline` (Saira).
- **Tabs:** Replaced 5 static pill tab blocks (2–6 tabs) with a dynamic tab-count selector. Fixed line variant active background (removed white bg on active).
- **Tooltip:** Fixed `leading-4` → `leading-5` in `tooltip.tsx` to prevent descender clipping. Replaced 4 static examples with an interactive variant/side playground.
- **Map view tooltip:** `MapViewTooltip` (`variant="map" | "table"`) documents inventory map/table view-mode rich tooltip bodies; section `#map-view-tooltip` on `/design-system`.
- **Progress Bar:** Replaced 22 static bars with an interactive variant selector + value slider. Kept "Without label" and "Minimal" as static references.
- **Paginator:** Replaced 10 static instances with one interactive playground (variant, currentPage, totalPages controls with live `onPageChange`).
- **Stepper:** Replaced static 2–6 step blocks with a dynamic step-count + current-step selector. **Sort UI 1.3:** stepper primitives use theme tokens and outlined active indicator; horizontal connectors fill only completed segments; design-system section links six Figma node IDs and `docs/design-system/stepper-figma-parity.md`.
- **File Upload:** Replaced 6 static `FileUploadCard` blocks with an interactive size/state/thumbnail playground. `FileUploadArea`, `AvatarUpload`, and composed example unchanged.
