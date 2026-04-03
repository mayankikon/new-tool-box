# ADR: Dealer Branding System (mock-first)

## Status

Accepted (frontend implementation in `new-toolbox`).

## Context

Dealers need a single **brand profile** (identity, curated theme colors, typography, tone) that flows into coupons, campaign previews, and the **Customization** storefront editor (Smart Marketing) with a live phone preview. The app remains **mock-first** with **localStorage** persistence until backend APIs exist.

## Decision

1. **Brand profile** is stored under `sm-brand-profile-v1`, with migration from legacy `sm-dealership-branding-v1`. React context (`BrandProfileProvider`) exposes `profile`, resolved `palette`, and `updateProfile`.
2. **Theme presets** (`red` | `blue` | `violet` | `black` | `custom`) map to a full **`ResolvedBrandPalette`** (primary, secondary, accent, surface, navBar, tabBar) for consistent storefront chrome.
3. **Coupons** gain `brand-primary` and `brand-secondary` accent presets; rendering uses `resolveCouponAccentDisplay()` with inline colors when the brand palette is available.
4. **Media library** stores asset metadata + data URLs in localStorage (`sm-media-library-v1`); a reusable **MediaPickerDialog** is used from the campaign wizard and can be used from customization/coupon flows.
5. **Storefront customization** (`connect-app` module) configuration is stored in `sm-connect-app-config-v1` with a full editor + `ConnectAppPhonePreview` (nav, single hero image/video cover, quick actions, promotions, image gallery carousel when multiple assets, tab bar).

## Consequences

- No server sync; clearing site data resets branding.
- Large media may hit localStorage quota; production should move to object storage + API (see `docs/architecture/api-contracts.md`).
- Legacy `dealership-branding-storage.ts` remains a thin compatibility layer mapping to the brand profile for vehicle/logo fields.
