# Static media (`public/media`)

URLs are rooted at **`/media/`** (e.g. `/media/icons/…`, `/media/logos/…`).

| Subfolder | Contents |
|-----------|----------|
| `audio/` | UI sounds (e.g. `card_button.mp3` for the design playground). |
| `icons/` | Product UI SVGs (table sort, lead icons, file-cabinet tabs, etc.). |
| `logos/` | Brand marks (`ikon-mark.svg`, `icon.svg`). |
| `images/oem/` | OEM make logos (PNG) for campaign wizards. |
| `tooltips/` | Map/table preview tooltip artwork. |
| `map-markers/` | Extracted map pin SVGs (see `scripts/extract-map-marker-svgs.mjs`). |
| `map-markers-source/` | Raw Figma exports (e.g. `Map Marker.svg`) before extraction. |

Use `mediaUrl()` from [`src/lib/media-paths.ts`](../../src/lib/media-paths.ts) in code so paths stay consistent.
