# Decision: Consolidate static media and Figma token JSON

**Date:** 2026-03-31

## Context

Static assets were spread across `public/dealership-icons/`, `public/dealership-logo/`, `public/tooltip/`, `public/map-markers/`, `public/map markers/` (space in path), `public/sounds/`, `public/oem-logos/`, and duplicate source trees at the repo root. Figma token exports lived as loose JSON files at the project root (`Colors.json`, `Themes.json`, etc.), which was hard to navigate and document.

## Decision

1. **Runtime static files** — Single tree under `public/media/` with subfolders: `icons/`, `logos/`, `tooltips/`, `map-markers/`, `map-markers-source/` (renamed from `map markers`), `images/oem/`, `audio/`. Public URLs use the `/media/...` prefix. Code uses `mediaUrl()` from `src/lib/media-paths.ts` where helpful.

2. **Design tokens** — Figma JSON lives in `design-tokens/` with stable kebab-case filenames (`colors.json`, `themes.json`, `radius.json`, `spacing.json`, `stroke.json`, `font-family.json`, `font-size.json`). Generator scripts in `scripts/` read from that directory only.

3. **Cleanup** — Removed duplicate root-level `dealership_logo/`, `tooltip/`, and `logo/` folders after consolidating served assets under `public/media/`.

## Consequences

- All hardcoded `/dealership-*`, `/tooltip/`, `/map-markers/` (and related) paths in app code were updated.
- `npm run tokens:*` and `map-markers:extract` must be run after editing files under `design-tokens/` or `public/media/map-markers-source/`.
- Documentation references token paths as `design-tokens/...` and media as `public/media/...`.
