# Repo structure

## Overview

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Local dev**: `npm run dev` uses **Webpack** (`next dev --webpack`) — Turbopack has panicked on large client routes (e.g. `/design-system`). Optional: `npm run dev:turbopack` to try Turbopack after Next.js upgrades.
- **UI**: shadcn/ui (base-nova style), Tailwind CSS v4, Base UI primitives
- **Design system**: Foundation tokens and component showcase at `/design-system`
- **Large files**: `evox.csv` (~400MB) is tracked with **Git LFS** (see `.gitattributes`). After cloning, run `git lfs install`; fetch binaries with `git lfs pull` if the working copy shows a pointer file instead of CSV rows.

## Key paths

| Path | Purpose |
|------|--------|
| `src/app/` | App Router routes (layout, page, globals.css). Root `/` redirects to the default workspace URL (`/marketing/campaigns`). The product shell lives in `src/app/(workspace)/` with `ProductWorkspace` in the layout and a `[...slug]` catch-all for in-app paths. |
| `src/lib/app-nav/workspace-routes.ts` | Canonical hrefs for Inventory + Smart Marketing sidebar items (`/inventory`, `/inventory/dashboard`, `/customers`, `/billing`, `/marketing/campaigns`, settings under `/inventory/settings/*` and `/marketing/settings/*`, etc.) and pathname → active nav resolution. |
| `src/components/app/product-workspace.tsx` | Client shell: sidebar + main column; reads `usePathname()`, syncs active product/page from `resolveWorkspaceRoute`, renders feature panels (campaigns, customers, inventory, …). |
| `src/app/design-system/page.tsx` | Design system showcase: foundation tokens + UI components |
| `src/components/design-system/google-maps-preview.tsx` | Design system **Foundations → Maps**: **2D** hybrid satellite via Maps JavaScript API (`@googlemaps/js-api-loader`) and **3D** via CesiumJS + Google **Photorealistic 3D Tiles** (`tile.googleapis.com/v1/3dtiles`); mode toggle syncs center/zoom/heading; **3D** overlays sample **Map Markers** (`VehicleMapMarkerPin`, `KeysMapMarkerPin`) as HTML positioned with `SceneTransforms.worldToWindowCoordinates` (`google-maps-preview-3d-html-markers.tsx`); when `scene.sampleHeightSupported`, lon/lat anchors use `scene.sampleHeightMostDetailed` so pins sit on **3D Tiles** surface (reduces parallax drift vs ellipsoid-only height), with a small negative height nudge and **debounced re-sample** when camera eye height changes a lot (zoom); ellipsoid fallback when sampling is unavailable; **Geofence**: collapsible right rail (`google-maps-preview-geofence-panel.tsx`) draws/saves a polygon in **3D**; **Cesium** entities + click handler in `google-maps-preview-geofence-cesium.tsx`; persisted ring in **`design-system-maps-geofence-v1`** via `src/lib/design-system/design-system-maps-geofence-storage.ts` (optional per-vertex ellipsoid height from **`scene.pickPosition`** on 3D Tiles — avoids ellipsoid-only drift when `globe: false`; **extruded** prism from min vertex height to max vertex height **+ 2 m**; ~20% blue + outline; Gaussian blur on fill is not supported by Cesium polygon materials); with a saved geofence, `src/lib/design-system/design-system-maps-geofence-interior-markers.ts` places **40–50** **clustered** random preview pins inside the footprint at **geofence floor** height (`skipSceneHeightSampling`), each with a cycling **Evox** `imageSrc` and `ageTier` (0/1/2) for chip tier rendering; **Zoom-tier markers**: `src/lib/design-system/design-system-maps-3d-marker-tiers.ts` resolves eye-height → `Marker3dTier` with four tiers: `"dealership"` > 1200 m (single `VehicleMapClusterMarker` `group-active` icon at geofence centroid), `"cluster"` 500–1200 m (`VehicleMapClusterMarker` `number-default` via **Supercluster**), `"pin"` 290–500 m (`VehicleMapMarkerPin`, default on load at ~280 m), `"chip"` ≤ 290 m (`VehicleMapMarkerChip` with Evox photos + age-tier stroke colors); bottom-left **eye-height meter** overlay shows current altitude and active tier; positioning logic (`postRender` + `worldToWindowCoordinates`) is unchanged — markers stay world-anchored during pan; static assets copied to `public/cesium/` by `scripts/copy-cesium-assets.mjs` (`npm run postinstall`); `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` or `NEXT_PUBLIC_GOOGLE_MAP_TILES_API_KEY` (enable Maps JavaScript API + Map Tiles / Photorealistic 3D for the key) |
| `scripts/copy-cesium-assets.mjs` | Copies `node_modules/cesium/Build/Cesium/{Workers,Assets,ThirdParty,Widgets}` → `public/cesium/` for `CESIUM_BASE_URL` |
| `src/app/color/page.tsx` | Redirects `/color` → **Design System → Foundations → Colors** (`/design-system/foundations/colors`). |
| `src/app/design-system/color-palette-data.ts` | Reference hex ramps (primary, secondary, neutral, semantic, data-viz) consumed by `ColorsSection` on the foundations Colors page. |
| `src/components/ui/` | shadcn components (button, card, badge, input, sidebar, table, tabs, dialog, select, dropdown-menu, textarea, switch, radio-group, checkbox, separator, tooltip, progress, avatar, skeleton, sheet, label, popover, scroll-area, empty-state, mapbox-map — optional **`replaceDefaultZoomControls`** swaps the default +/- stack (Inventory passes **`InventoryMapZoomControls`**)); `vehicle-list-panel` supports optional `listHeader` / `emptyState` for contextual lists (e.g. similar vehicles). |
| `src/components/ui/button-variants.ts` | CVA `buttonVariants` shared with **`button.tsx`** (`"use client"`). Server Components must import `buttonVariants` from this module (not from `button.tsx`) so class strings can be composed on the server. |
| `src/components/customers/register-customer-page.tsx` | Inventory **Customers → Register Customer**: full-page registration form (registration type, customer info, address, device details, terms checkbox, cancel/register) using design-system inputs; shell navigates from `CustomersPage` via `ProductWorkspace` while URL stays on `/customers`. |
| `src/components/ui/portfolio-checkbox.tsx` | Portfolio 3.0 **`PortfolioCheckboxControl`** (Base UI): border `#ebeced`, fill `#1A9375` when checked/indeterminate; optional **`showFocusRing`** for documentation. Root is a **24×24px** hit box (`size-6`); the painted control remains **16×16px** (`size-4`) centered inside. |
| `src/components/ui/portfolio-radio.tsx` | Portfolio 3.0 **`PortfolioRadioButton`** (Base UI): border `#ebeced`, accent `#1A9375` when selected; optional **`showFocusRing`**. Same **24×24px** outer / **16×16px** inner layout as **`PortfolioCheckboxControl`**. |
| `src/components/ui/checkbox.tsx`, `radio-group.tsx` | Stock **`Checkbox`** / **`RadioGroupItem`**: same **24×24px** interactive box with **16×16px** visual, for tables, filters, and segmented controls. |
| `src/components/ui/checkbox-group.tsx`, `checkbox-list.tsx`, `checkbox-card.tsx` | Checkbox group/list/card wrappers for the design system: compose **`PortfolioCheckboxControl`** with **`CheckboxGroup`** (Base UI). Segmented patterns use **`checkbox-segmented.tsx`** + stock **`Checkbox`** instead. |
| `src/components/ui/radio-list.tsx`, `radio-card.tsx` | Radio list/card wrappers: **`RadioGroup`** + **`PortfolioRadioButton`**. Segmented radios use **`radio-segmented.tsx`** + stock **`RadioGroupItem`**. |
| `src/components/app/` | App shell: TopBar (page header with optional title, subtitle, right slot). Design system showcases TopBar and main content area pattern at `/design-system`. |
| `src/components/geofences/` | Geofence management: GeofenceSettingsPage (list + map), GeofenceWizard (2-step: draw then name/address), GeofenceDrawStep (polygon/circle tools, undo/redo, reset, move via simple_select), GeofenceDetailsStep (name + optional address), GeofenceListPanel, GeofenceDrawingToolbar. |
| `src/lib/geofences/geofence-store.tsx` | GeofenceProvider and useGeofences: in-memory FeatureCollection, addGeofence, removeGeofence. Initial features from dealership main lot. |
| `src/lib/inventory/dealership-geofences.ts` | GeofenceProperties, MainLotProperties, DEALERSHIP_CENTER, mainLotGeoJSON (single main lot polygon). |
| `src/lib/inventory/inventory-map-zoom-checkpoints.ts` | Inventory map **zoom checkpoint** helpers: **linear** zoom ↔ slider position between `INVENTORY_MAP_SLIDER_ZOOM_MIN` / `MAX`, two checkpoint Y positions (vehicle markers, vehicle images) via `inventoryMapSliderCheckpointNormalized`, magnetic snap. |
| `src/components/inventory/inventory-map-zoom-controls.tsx` | Inventory-only **Mapbox** zoom UI: text Zoom in/out, delayed “Show slider” tooltip, expandable vertical track with vehicle markers / vehicle images checkpoints + **Hide slider**. |
| `src/lib/inventory/similar-vehicles.ts` | Client-side “similar inventory” ranking for the map floating panel: `listSimilarVehicles` (make/model/trim/mileage/color/geofence signals), `formatSimilarVehiclesListTitle` (compact “Similar to {VIN}” line for the anchor vehicle), `formatSimilarVehiclesHeader`, color parsing from `imageAlt`. |
| `src/lib/inventory/recent-vehicle-search-storage.ts` | Last 10 inventory search strings in **localStorage** (`rememberVehicleSearch` / `readRecentVehicleSearches`, deduped case-insensitively). |
| `src/components/inventory/inventory-vehicle-search-field.tsx` | **Search vehicles** field with a **recent searches** list (portal, fixed under the field); commits history on **Enter** or when picking a row. |
| `src/components/inventory/inventory-content.tsx` | Inventory **Home**: **Map** and **table** share the same shell in `product-workspace.tsx` (`pt-6`, `TopBar` with **Inventory** title + `InventoryViewModeToggle` in the right slot, `InventoryContent` with `pt-6`). Map view insets the map canvas with **`gap-6 px-8 pb-8`** (32px left/right/bottom); the top row has **Search vehicles** (`InventoryVehicleSearchField`), **`flex-1`**, then **quick filters** + **Filters** grouped on the right (`justify-end`): toggle **`Button`s** (`variant="secondary"`, selected: **`border-primary`**, white / `dark:bg-background`); **Filters** toggles the filter sheet. The map + overlays share one **`rounded-md` (8px) border border-border** shell so the stroke follows the corners cleanly; the vehicle list is flush left inside that shell with only a **`border-r`** vs the map (no full box border on the list); list width **`PANEL_WIDTH_PX`** matches the search field **`max-w-sm`** (384px). **Geofence** (`BoundaryIcon`) sits alone on a floating toolbar at **`top-6`** (24px) with **`left`** = list width + 24px (or shifted by detail panel width + 24px when a vehicle detail is open). Table view keeps geofence + filters in the top search row. Selecting a vehicle (list or map) runs **`map.easeTo`** in the selection handler (not `flyTo`, to avoid a zoom “arc” that briefly drops below the photo-marker zoom); uses that VIN’s lot coordinates when present, otherwise **`DEALERSHIP_CENTER`**; left padding for the floating list strip; duration ~0.9s; respects `prefers-reduced-motion`. While HTML markers are visible, they stay **photo chips** (no pin-only tier) so selection moves don’t flash tier-color pins between images. Vehicle detail includes **Show similar vehicles** (in-panel ranked list, compact header **Similar to {anchor VIN}**, back to detail, no full navigation). **Table** view: `TopBar` + `px-8` padded content from `product-workspace.tsx`. |
| `src/lib/utils.ts` | `cn()` and shared utilities |
| `src/lib/data-table-row-hover.ts` | Data table row hover tokens: `DATA_TABLE_ROW_GROUP_CLASS` (`group/data-row` on `<tr>`), `DATA_TABLE_CELL_INNER_HOVER_CLASS` (cell-inner `scale-[1.0015]`), `DATA_TABLE_HEADER_ROW_BACKGROUND_CLASS` / `DATA_TABLE_HEADER_BACKGROUND_CLASS` (header row/tab-chrome fills), `DATA_TABLE_ROW_HOVER_BACKGROUND_CLASS` (body row hover). All product tables (Audiences, Staff, Billing, Reports, Inventory table view) apply these tokens to match the design-system **Table** / **Table with tabs** patterns. |
| `src/lib/atlas-ai/coupon-strategy.ts` | Intelligent couponing helpers: retention → tier/discount, engage KPI estimates, tiered `CampaignOffer` drafts for the wizard. |
| `src/components/atlas-ai/atlas-ai-page.tsx` | Ask Atlas conversation shell: shared `max-w-5xl` content width (empty state, composer, user/assistant messages, thinking) so the audience preview table has room for coupon/value columns without layout jump. |
| `src/components/atlas-ai/atlas-ai-engage-flow.tsx` | Ask Atlas **Engage** UI: retention score ring gauge, conservative/balanced/aggressive incentive presets, engage table with Intelligent Coupon column, deploy stepper, success state (inline with conversation, no heavy panel card). |
| `src/lib/media-paths.ts` | `MEDIA_BASE` (`/media`) and `mediaUrl()` for static assets under `public/media/` |
| `src/lib/design-tokens.ts` | Design system showcase data: radius, spacing, stroke, and reference typography arrays for foundations pages (spacing + radius scales both render under **Spacing and Layout**). Semantic theme colors come from `theme-primitives.css` / `globals.css`, not this file. |
| `public/media/` | Static assets (icons, logos, tooltips, map markers, OEM images, audio); URLs prefixed `/media/` |
| `public/design-system/` | Design System home downloads: `design.md` (offline summary), `brand-guidelines.zip` (bundled `media/brand-samples` + `media/logos`) |
| `design-tokens/` | Figma JSON exports (`colors.json`, `themes.json`, `spacing.json`, `radius.json`, `stroke.json`, `font-family.json`, `font-size.json`) consumed by `scripts/generate-*-primitives.js` |
| `src/lib/branding/` | **Dealer brand profile**: `brand-profile-types.ts` (theme palettes, font/tone presets), `brand-identity-samples.ts` (curated sample logo/app-icon pairs), `brand-profile-storage.ts` (localStorage + migration from legacy dealership branding), `brand-profile-provider.tsx` (`useBrandProfile`). Wrapped in root `layout.tsx`. Sample SVGs live under `public/media/brand-samples/`. |
| `src/lib/nav-visibility/` | **Sidebar navigation visibility**: `nav-visibility-storage.ts` (localStorage key `sm-nav-visibility-v1`; stores hidden nav labels per product), `nav-visibility-provider.tsx` (`useNavVisibility`). Wrapped in root `layout.tsx`. Used by General Settings to let users show/hide sidebar pages per application; consumed in `product-workspace.tsx` to filter nav items before passing to `<Sidebar>`. |
| `src/lib/media/` | **Media library**: `media-library-types.ts`, `media-library-storage.ts` (localStorage index of assets). UI: `src/components/media/media-library-page.tsx`, `media-picker-dialog.tsx` (wide dialog `~52rem`; design-system **`FileUploadArea`** for upload + scrollable grid of **all** library assets matching kind/category filters; optional **Selected preview** for single-select; confirm by asset id + pending map). |
| `src/lib/connect-app/` | **Storefront / customization config** (codebase: `connect-app`): `connect-app-types.ts`, `connect-app-storage.ts`, `connect-app-palette.ts` (resolve theme from brand profile vs override). Smart Marketing sidebar **Customization**: `src/components/connect-app/connect-app-editor.tsx` (left column: sidebar-toned card + **FormSection** rows; main row `max-w-[1852px]` left-aligned (`ml-0`); scroll area `pl-[32px]`; at `xl` the form column is `flex-[7]` (~70%) and the sticky phone column is `flex-[3]` (~30%) with tight horizontal padding (`px-1` / `xl:px-2`); `justify-center` on the preview column), `connect-app-phone-preview.tsx`. |
| `.cursor/skills/form-card-layout/SKILL.md` | Cursor **agent skill**: documents the Register Customer form-card pattern (custom card surface, `FormSection` title/description + fields grid, `InputGroup` + `InputContainer` lg, Select row height alignment) for reuse on other admin forms. |
| `src/lib/campaigns/coupon-accent-display.ts` | Resolves coupon accent colors for `brand-primary` / `brand-secondary` presets using the dealer palette. |
| `src/components/settings/brand-profile-settings.tsx` | Settings → **Brand Profile**: identity, 4 theme presets + custom hex, typography, tone, live preview strip. |
| `src/lib/campaigns/types.ts` | Campaign domain types (Campaign, CampaignStatus, AudienceSegment, CampaignTrigger, CampaignMessage, ChannelConfig, CampaignMetrics, CampaignTemplate, DashboardMetrics, PersonalizationVariable, WizardMessage, ImageAttachment with optional kind `image`/`video` and gifPreviewUrl for video). **`CouponAccentPreset`** includes `brand-primary` / `brand-secondary`. |
| `src/lib/campaigns/mock-data.ts` | Mock campaigns (10 across all statuses), templates (6), type labels, helpers (getCampaignById, computeDashboardMetrics), and wizard data (segment field definitions, trigger type metadata, channel metadata, personalization variables). Make field options sourced from vehicle-data. |
| `evox.csv` | Evox vehicle match dataset (LFS). Required input for `scripts/extract-vehicle-data.js`. |
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
| `src/app/color-primitives.css` | **Generated** color primitives from `design-tokens/colors.json` (Figma); use `npm run tokens:colors` to regenerate |
| `src/app/typography-primitives.css` | **Generated** typography from `design-tokens/font-family.json` + `design-tokens/font-size.json` (Figma); use `npm run tokens:typography` to regenerate |
| `src/app/layout-primitives.css` | **Generated** spacing, radius, stroke from `design-tokens/radius.json`, `spacing.json`, `stroke.json` (Figma); use `npm run tokens:layout` to regenerate |
| `src/app/theme-primitives.css` | **Generated** color theme (semantic tokens) from `design-tokens/themes.json` (Figma); use `npm run tokens:theme` to regenerate. Light/dark from Toolbox-Light and Toolbox-Dark. |
| `components.json` | shadcn CLI config (aliases, style, Tailwind) |

## Product app shell

- **Routes**: `/` redirects to `/marketing/campaigns`. Workspace URLs are path-based (examples): `/inventory`, `/inventory/dashboard`, `/customers`, `/billing`, `/reports`, `/staff`; inventory settings under `/inventory/settings/...`; Smart Marketing main nav under `/marketing/atlas`, `/marketing/monitor`, `/marketing/audiences`, `/marketing/campaigns`, `/marketing/templates`, `/marketing/media-library`, `/marketing/coupons`, `/marketing/customization`; marketing settings under `/marketing/settings/...`. Implementation: `src/app/(workspace)/layout.tsx` + `src/app/(workspace)/[...slug]/page.tsx` + `src/components/app/product-workspace.tsx` + `src/lib/app-nav/workspace-routes.ts`.
- **Purpose**: Main product application with sidebar navigation and product switching
- **Products**:
  - **Inventory Management** — Home (`/inventory`), Dashboard (`/inventory/dashboard`), Customers (`/customers`, list + **Register Customer** full-page form from the top bar), Billing (`/billing`), Reports (`/reports`), Staff (`/staff`); Settings: General, Brand Profile, Alerts, Geofences, Configurations, Integrations, Dev Console (each under `/inventory/settings/...`)
  - **Smart Marketing** — Ask Atlas, Monitor, Audiences, Campaigns, Templates, Media Library, Coupons, **Customization** (each under `/marketing/...` as above); Settings: General, Brand Profile, Analytics, Channels, Automations, Dev Console (under `/marketing/settings/...`)
- **Behavior**: Sidebar primary nav items use Next.js `Link` (`href` from `workspace-routes`). The header Toolbox wordmark links to `/inventory` (Inventory Management home). A product switcher in the sidebar navigates to each product’s default path (`/inventory` vs `/marketing/campaigns`). The account selector (dealership) stays constant across products; only the nav items and settings section change. When Smart Marketing > Campaigns is active, the main content area renders the Campaign Dashboard. The dashboard shows a loading skeleton on initial load, then either an empty state (no campaigns) or the full view: KPI cards, dismissible AI recommendation banner, AI-suggested campaigns section, and a status-tabbed campaign table with row actions. Clicking a campaign row navigates to the Campaign Detail view (with its own loading skeleton transition). The "Create Campaign" button opens a 4-step Campaign Creation Wizard with framer-motion animated transitions: (1) Campaign Setup with template selection, (2) Audience & Triggers with AI Assist and human-readable trigger labels, (3) Message & Channels with image upload and realistic device previews (phone/email mockups), (4) Review & Launch with animated revenue impact estimator, summary cards with edit-back links, and device preview.
- **Key components**: `ProductWorkspace`, `Sidebar` (with `products`, `activeProductId`, `onProductChange`, `onNavItemClick`, nav `href`s), `SidebarProductSwitcher` (internal dropdown)

## Design system page

- **Route**: `/design-system`
- **Chrome**: Main content column uses `bg-neutral-50` in light mode (`DesignSystemTemplate`); dark mode uses `bg-background` so the column stays aligned with the app theme. The template uses a viewport-height shell (`h-dvh`, `overflow-hidden`) so the left nav (logo + search fixed, link list `overflow-y-auto`) and the main column scroll independently instead of the whole page scrolling together.
- **Content**:
  - **Colors** (foundations): Reference hex palettes (`color-palette-data.ts`) for brand, semantic, and data-viz scales — not the runtime `themeTokenGroups` grid (removed).
  - **Foundation tokens**: Radius (`design-tokens/radius.json`), spacing scale (`design-tokens/spacing.json`), stroke/border width (`design-tokens/stroke.json`)
  - **Typography**: Saira as the single product typeface (type scale including overline as a text style, font weights); Figma typography primitives still generated to `typography-primitives.css`
  - **Imagery** (foundations): Evox vehicle catalog table (`ImagerySection`) — side (angle 001) and 3/4 (angle 032) when signed URLs exist; campaign catalog in `src/lib/campaigns/vehicle-data.ts`, optional multi-color rows from mock inventory (`src/lib/campaigns/inventory-vehicle-imagery-variants.ts` groups `vehicle-list-data` by make/model; VIN-keyed 3/4 URLs in `inventory-front-image-data.ts`); merged in `vehicle-imagery-catalog.ts`. Color dropdown appears when more than one paint exists for a model.
  - **Components**: Live previews of shadcn components (Button, Badge, Input, Card, Sidebar) with variants
  - **Page layout & chrome**: App shell elements used on every page — **TopBar** (`src/components/app/top-bar.tsx`) with optional title, subtitle, and right slot; **main content area** pattern (scrollable container with `px-8` / 32px horizontal padding and `py-6`). Shown on the design system page for review.

To add more components to the showcase, install via `npx shadcn@latest add <component>` and add a section in `src/app/design-system/page.tsx`. The **Sidebar** component in `src/components/ui/sidebar.tsx` is a custom side navigation bar built from the Figma Shift 2.0 Sort UI design; it uses design tokens (sidebar, spacing, radius, theme text/background) and is documented in the Components section. The app sidebar paints **`SidebarLineFieldPattern`** (horizontal line field on **`neutral-50`** / dark sidebar) while the main column stays a **flat** page background with no line overlay. The **TopBar** in `src/components/app/top-bar.tsx` is the full-width header to the right of the sidebar; it is documented under “Page layout & chrome” on the design system page.

## Color primitives

Solid color primitives (e.g. `--gray-50`, `--slate-700`, `--blue-500`) are generated from the Figma export **`design-tokens/colors.json`** into `src/app/color-primitives.css`. That file is imported in `globals.css`. Regenerate with:

```bash
npm run tokens:colors
```

Use primitives in CSS via `var(--gray-50)` etc. Semantic tokens (e.g. `--background`, `--primary`) in `globals.css` are separate and can be wired to primitives later if desired.

## Typography primitives

Typography tokens are generated from Figma **`design-tokens/font-family.json`** and **`design-tokens/font-size.json`** into `src/app/typography-primitives.css` (imported in `globals.css`). Regenerate with:

```bash
npm run tokens:typography
```

- **Font families**: `--font-headline`, `--font-body` (both Saira in product), `--font-code` (JetBrains Mono via `layout.tsx` and `globals.css`).
- **Font sizes**: `--text-xs` (12px) through `--text-9xl` (128px); responsive overrides at `max-width: 768px` for larger sizes.
- **Font weights**: `--font-weight-light` (300) through `--font-weight-black` (900).
- **Line heights**: `--leading-5`, `--leading-6`, `--leading-7` (px values).
- **Letter spacing**: `--tracking-tighter`, `--tracking-tight`, `--tracking-normal`, `--tracking-wide`, `--tracking-wider`, `--tracking-widest`.

Tailwind theme maps these so you can use `text-xs`, `font-headline`, `font-medium`, `leading-5`, `tracking-tight`, etc.

## Layout primitives (spacing, radius, stroke)

Spacing, radius, and stroke (border width) tokens are generated from Figma **`design-tokens/radius.json`**, **`design-tokens/spacing.json`**, and **`design-tokens/stroke.json`** into `src/app/layout-primitives.css` (imported in `globals.css`). Regenerate with:

```bash
npm run tokens:layout
```

- **Radius** (Default mode): `--radius-none`, `--radius-2xs` (2px), `--radius-xs` (4px), `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-xl` (16px), `--radius-2xl` (24px), `--radius-3xl` (28px), `--radius-full` (9999px), plus `--radius-Card-sm`, `--radius-Card-md`, `--radius-Card-lg`, `--radius-Card-none`, `--radius-Card-xs`. The base `--radius` used by shadcn is set to `var(--radius-md)`.
- **Spacing**: `--spacing-0` through `--spacing-96` (0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 96 px). Defined in `layout-primitives.css` only; **not** mapped into Tailwind’s theme, so Tailwind keeps its default rem-based spacing scale (e.g. `p-4` = 1rem, `h-8` = 2rem). Use `var(--spacing-*)` when you explicitly want Figma spacing values.
- **Stroke** (border width): `--stroke-sm` (0.5px), `--stroke-default` (1px), `--stroke-lg` (2px), `--stroke-xl` (3px). Mapped to Tailwind width scale for borders.

## Color theme primitives

Semantic color tokens for light and dark themes are generated from Figma **`design-tokens/themes.json`** into `src/app/theme-primitives.css` (imported in `globals.css`). Regenerate with:

```bash
npm run tokens:theme
```

- **Modes**: Toolbox-Light (`:root`) and Toolbox-Dark (`.dark`) are used. `design-tokens/themes.json` also defines TUNR-Light and TUNR-Dark; the script could be extended to emit optional theme classes.
- **Tokens** (62): All variables are emitted with a `--theme-*` prefix, e.g. `--theme-background-page`, `--theme-text-primary`, `--theme-stroke-default`, `--theme-background-button-primary-default`, `--theme-background-badge-*`, `--theme-icon-*`, `--theme-background-account-selector`, etc.
- **Interaction state tokens**: `--theme-stroke-hover` (input/control border on hover), `--theme-stroke-focus` (focus ring color), `--theme-background-input-hover` (subtle input bg on hover), `--theme-background-card-hover` (card bg on hover). Mapped to `--input-hover` and `--primary-hover` in `globals.css`.
- **Wiring**: In `globals.css`, the main semantic tokens (`--background`, `--foreground`, `--primary`, `--card`, `--destructive`, `--border`, `--sidebar`, `--input-hover`, `--primary-hover`, etc.) are set to the corresponding theme primitives so the app and shadcn use `design-tokens/themes.json` as the source of truth for light/dark.
- **Utility classes**: `globals.css` defines a `.shimmer-border` component class that adds an animated rotating conic-gradient border (violet/purple/teal) via `::before` pseudo-element and `@property --shimmer-angle`. Used on AI-themed CTAs (e.g. recommendation banner).
- **Chart colors**: 5-color palette using OKLCH anchored by brand emerald (chart-1), with sky blue (chart-2), amber (chart-3), rose (chart-4), and violet (chart-5) for variety and accessibility.
