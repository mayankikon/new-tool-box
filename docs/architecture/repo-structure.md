# Repo structure

## Overview

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **UI**: shadcn/ui (base-nova style), Tailwind CSS v4, Base UI primitives
- **Design system**: Foundation tokens and component showcase at `/design-system`

## Key paths

| Path | Purpose |
|------|--------|
| `src/app/` | App Router routes (layout, page, globals.css). Root page (`/`) is the product app shell with sidebar navigation. |
| `src/app/design-system/page.tsx` | Design system showcase: foundation tokens + UI components |
| `src/components/ui/` | shadcn components (button, card, badge, input, sidebar, table, tabs, dialog, select, dropdown-menu, textarea, switch, radio-group, checkbox, separator, tooltip, progress, avatar, skeleton, sheet, label, popover, scroll-area) |
| `src/components/app/` | App shell: TopBar (page header with optional title, subtitle, right slot). Design system showcases TopBar and main content area pattern at `/design-system`. |
| `src/lib/utils.ts` | `cn()` and shared utilities |
| `src/lib/design-tokens.ts` | Token definitions for the design system page (colors, radius) |
| `src/lib/campaigns/types.ts` | Campaign domain types (Campaign, CampaignStatus, AudienceSegment, CampaignTrigger, CampaignMessage, ChannelConfig, CampaignMetrics, CampaignTemplate, DashboardMetrics, PersonalizationVariable, WizardMessage, ImageAttachment with optional kind `image`/`video` and gifPreviewUrl for video) |
| `src/lib/campaigns/mock-data.ts` | Mock campaigns (10 across all statuses), templates (6), type labels, helpers (getCampaignById, computeDashboardMetrics), and wizard data (segment field definitions, trigger type metadata, channel metadata, personalization variables). Make field options sourced from vehicle-data. |
| `src/lib/campaigns/vehicle-data.ts` | **Generated** vehicle make/model/image data extracted from `evox.csv`; use `node scripts/extract-vehicle-data.js` to regenerate. Exports `VEHICLE_MAKES` (string[]) and `VEHICLE_MODELS_BY_MAKE` (Record mapping each make to models with CloudFront side-view image URLs). |
| `src/lib/campaigns/video-to-gif.ts` | Browser utility: generates a ~3 second animated GIF from a video blob/URL using canvas and gifenc; used by campaign wizard image upload for video attachment preview. |
| `scripts/extract-vehicle-data.js` | Parses `evox.csv` and generates `vehicle-data.ts` with normalized make/model/image mappings. Normalizes case variants and collapses trim-level model names. |
| `src/components/campaigns/` | Campaign feature components (see Campaign module below) |
| `src/components/campaigns/campaign-dashboard.tsx` | Dashboard view: KPI cards, AI recommendation banner, suggested campaigns section, status-tabbed campaign table. Includes loading skeleton and empty state support. |
| `src/components/campaigns/campaign-dashboard-skeleton.tsx` | Skeleton loading placeholder for the dashboard (KPI cards, banner, table rows) |
| `src/components/campaigns/campaign-detail.tsx` | Campaign detail view shell: header with status badge + action buttons, tabbed content (Overview, Analytics, Audience, Message). Includes loading skeleton on navigation. |
| `src/components/campaigns/campaign-detail-skeleton.tsx` | Skeleton loading placeholder for the detail view (header, tabs, KPI cards, config cards) |
| `src/components/campaigns/campaign-empty-state.tsx` | Empty state shown when no campaigns exist (illustration + CTA) |
| `src/components/campaigns/campaign-kpi-cards.tsx` | KPI summary row (active campaigns, conversion rate, people reached, revenue) |
| `src/components/campaigns/campaign-recommendation-banner.tsx` | Dismissible AI-powered recommendation banner with violet AI theme, shimmer-border animated stroke, and framer-motion enter/exit transitions (wrapped in AnimatePresence by the dashboard) |
| `src/components/campaigns/campaign-table.tsx` | Status-filtered campaign table with row actions (edit, pause, duplicate, delete) |
| `src/components/campaigns/campaign-wizard.tsx` | 4-step campaign creation wizard shell with framer-motion step transitions, animated progress stepper, WizardFormData state management |
| `src/components/campaigns/wizard/wizard-stepper.tsx` | Animated horizontal progress stepper with step icons, progress bar fill, completed/current/upcoming states, accessible ARIA attributes |
| `src/components/campaigns/wizard/device-preview.tsx` | Realistic device mockup previews: iPhone-style phone frame for SMS/Push, email client frame for Email, with channel tabs and AnimatePresence transitions. Renders image and video attachments (video as GIF preview when available). |
| `src/components/campaigns/wizard/image-upload.tsx` | Media upload: drag-and-drop images/video, click to browse (images + video), “Take photo” (webcam capture with permission), “Attach video” (video-only picker). Attached video gets a 3s GIF preview (gifenc). Thumbnail grid with remove; max items configurable. |
| `src/components/campaigns/wizard/step-setup.tsx` | Step 1: Campaign name input + template selection grid with staggered framer-motion entry, hover card effects, auto-fill from template defaults |
| `src/components/campaigns/wizard/step-audience-triggers.tsx` | Step 2: Combined audience rule builder (AI Assist with chevron toggle, field/operator/value selects) + trigger configuration (type grid, dynamic settings forms with human-readable labels, recurring toggle) |
| `src/components/campaigns/wizard/step-message-channels.tsx` | Step 3: Two-column layout — left: channel chip toggles, smart channel selection switch, AI message generator, subject/body editor with variable inserter (outside-click close, ARIA), image upload; right: sticky DevicePreview with live variable interpolation |
| `src/components/campaigns/wizard/step-review-launch.tsx` | Step 4: Two-column layout — left: animated revenue impact estimator (counting numbers), summary cards with edit-back links, launch confirmation dialog; right: sticky DevicePreview |
| `src/components/campaigns/detail/` | Detail tab content: campaign-overview (KPI metrics + configuration summary cards), campaign-analytics (performance metrics with trend indicators + channel reach bars + conversion funnel), campaign-audience-view (segment rules summary + audience size), campaign-message-view (per-channel message previews with variable highlighting) |
| `src/app/color-primitives.css` | **Generated** color primitives from `Colors.json` (Figma); use `npm run tokens:colors` to regenerate |
| `src/app/typography-primitives.css` | **Generated** typography from `Font Family.json` + `Font Size.json` (Figma); use `npm run tokens:typography` to regenerate |
| `src/app/layout-primitives.css` | **Generated** spacing, radius, stroke from `Radius.json`, `Spacing.json`, `Stroke.json` (Figma); use `npm run tokens:layout` to regenerate |
| `src/app/theme-primitives.css` | **Generated** color theme (semantic tokens) from `Themes.json` (Figma); use `npm run tokens:theme` to regenerate. Light/dark from Toolbox-Light and Toolbox-Dark. |
| `components.json` | shadcn CLI config (aliases, style, Tailwind) |

## Product app shell

- **Route**: `/` (root)
- **Purpose**: Main product application with sidebar navigation and product switching
- **Products**:
  - **Inventory Management** — Home, Dashboard, Customers, Billing, Reports, Staff; Settings: General, Geofences, Alerts, Marketing, Configurations
  - **Smart Marketing** — Atlas AI, Campaigns, Customers; Settings: Analytics, Channels, Automations
- **Behavior**: A product switcher dropdown in the sidebar lets users switch between products. The account selector (dealership) stays constant across products; only the nav items and settings section change. When Smart Marketing > Campaigns is active, the main content area renders the Campaign Dashboard. The dashboard shows a loading skeleton on initial load, then either an empty state (no campaigns) or the full view: KPI cards, dismissible AI recommendation banner, AI-suggested campaigns section, and a status-tabbed campaign table with row actions. Clicking a campaign row navigates to the Campaign Detail view (with its own loading skeleton transition). The "Create Campaign" button opens a 4-step Campaign Creation Wizard with framer-motion animated transitions: (1) Campaign Setup with template selection, (2) Audience & Triggers with AI Assist and human-readable trigger labels, (3) Message & Channels with image upload and realistic device previews (phone/email mockups), (4) Review & Launch with animated revenue impact estimator, summary cards with edit-back links, and device preview.
- **Key components**: `Sidebar` (with `products`, `activeProductId`, `onProductChange`, `onNavItemClick` props), `SidebarProductSwitcher` (internal dropdown)

## Design system page

- **Route**: `/design-system`
- **Content**:
  - **Theme tokens**: Semantic colors from Themes.json (background, text, stroke, button) as swatches and text samples
  - **Foundation tokens**: Semantic colors (mapped to theme), radius (Radius.json), spacing scale (Spacing.json), stroke/border width (Stroke.json)
  - **Typography**: Font families (headline, body, code), font sizes, weights, line heights, letter spacing from Font Family.json + Font Size.json
  - **Components**: Live previews of shadcn components (Button, Badge, Input, Card, Sidebar) with variants
  - **Page layout & chrome**: App shell elements used on every page — **TopBar** (`src/components/app/top-bar.tsx`) with optional title, subtitle, and right slot; **main content area** pattern (scrollable container with `px-8` / 32px horizontal padding and `py-6`). Shown on the design system page for review.

To add more components to the showcase, install via `npx shadcn@latest add <component>` and add a section in `src/app/design-system/page.tsx`. The **Sidebar** component in `src/components/ui/sidebar.tsx` is a custom side navigation bar built from the Figma Shift 2.0 Sort UI design; it uses design tokens (sidebar, spacing, radius, theme text/background) and is documented in the Components section. The **TopBar** in `src/components/app/top-bar.tsx` is the full-width header to the right of the sidebar; it is documented under “Page layout & chrome” on the design system page. To add token groups, extend `src/lib/design-tokens.ts` and render them in the same page.

## Color primitives

Solid color primitives (e.g. `--gray-50`, `--slate-700`, `--blue-500`) are generated from the Figma export **`Colors.json`** into `src/app/color-primitives.css`. That file is imported in `globals.css`. Regenerate with:

```bash
npm run tokens:colors
```

Use primitives in CSS via `var(--gray-50)` etc. Semantic tokens (e.g. `--background`, `--primary`) in `globals.css` are separate and can be wired to primitives later if desired.

## Typography primitives

Typography tokens are generated from Figma **`Font Family.json`** and **`Font Size.json`** into `src/app/typography-primitives.css` (imported in `globals.css`). Regenerate with:

```bash
npm run tokens:typography
```

- **Font families**: `--font-headline`, `--font-body`, `--font-code` (wired to Saira and JetBrains Mono via `layout.tsx` and `globals.css`).
- **Font sizes**: `--text-xs` (12px) through `--text-9xl` (128px); responsive overrides at `max-width: 768px` for larger sizes.
- **Font weights**: `--font-weight-light` (300) through `--font-weight-black` (900).
- **Line heights**: `--leading-5`, `--leading-6`, `--leading-7` (px values).
- **Letter spacing**: `--tracking-tighter`, `--tracking-tight`, `--tracking-normal`, `--tracking-wide`, `--tracking-wider`, `--tracking-widest`.

Tailwind theme maps these so you can use `text-xs`, `font-headline`, `font-medium`, `leading-5`, `tracking-tight`, etc.

## Layout primitives (spacing, radius, stroke)

Spacing, radius, and stroke (border width) tokens are generated from Figma **`Radius.json`**, **`Spacing.json`**, and **`Stroke.json`** into `src/app/layout-primitives.css` (imported in `globals.css`). Regenerate with:

```bash
npm run tokens:layout
```

- **Radius** (Default mode): `--radius-none`, `--radius-2xs` (2px), `--radius-xs` (4px), `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-xl` (16px), `--radius-2xl` (24px), `--radius-3xl` (28px), `--radius-full` (9999px), plus `--radius-Card-sm`, `--radius-Card-md`, `--radius-Card-lg`, `--radius-Card-none`, `--radius-Card-xs`. The base `--radius` used by shadcn is set to `var(--radius-md)`.
- **Spacing**: `--spacing-0` through `--spacing-96` (0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 96 px). Defined in `layout-primitives.css` only; **not** mapped into Tailwind’s theme, so Tailwind keeps its default rem-based spacing scale (e.g. `p-4` = 1rem, `h-8` = 2rem). Use `var(--spacing-*)` when you explicitly want Figma spacing values.
- **Stroke** (border width): `--stroke-sm` (0.5px), `--stroke-default` (1px), `--stroke-lg` (2px), `--stroke-xl` (3px). Mapped to Tailwind width scale for borders.

## Color theme primitives

Semantic color tokens for light and dark themes are generated from Figma **`Themes.json`** into `src/app/theme-primitives.css` (imported in `globals.css`). Regenerate with:

```bash
npm run tokens:theme
```

- **Modes**: Toolbox-Light (`:root`) and Toolbox-Dark (`.dark`) are used. Themes.json also defines TUNR-Light and TUNR-Dark; the script could be extended to emit optional theme classes.
- **Tokens** (62): All variables are emitted with a `--theme-*` prefix, e.g. `--theme-background-page`, `--theme-text-primary`, `--theme-stroke-default`, `--theme-background-button-primary-default`, `--theme-background-badge-*`, `--theme-icon-*`, `--theme-background-account-selector`, etc.
- **Interaction state tokens**: `--theme-stroke-hover` (input/control border on hover), `--theme-stroke-focus` (focus ring color), `--theme-background-input-hover` (subtle input bg on hover), `--theme-background-card-hover` (card bg on hover). Mapped to `--input-hover` and `--primary-hover` in `globals.css`.
- **Wiring**: In `globals.css`, the main semantic tokens (`--background`, `--foreground`, `--primary`, `--card`, `--destructive`, `--border`, `--sidebar`, `--input-hover`, `--primary-hover`, etc.) are set to the corresponding theme primitives so the app and shadcn use Themes.json as the source of truth for light/dark.
- **Utility classes**: `globals.css` defines a `.shimmer-border` component class that adds an animated rotating conic-gradient border (violet/purple/teal) via `::before` pseudo-element and `@property --shimmer-angle`. Used on AI-themed CTAs (e.g. recommendation banner).
- **Chart colors**: 5-color palette using OKLCH anchored by brand emerald (chart-1), with sky blue (chart-2), amber (chart-3), rose (chart-4), and violet (chart-5) for variety and accessibility.
