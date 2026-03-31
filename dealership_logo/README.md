# Dealership logo and icons

- **Account Logo** PNGs: used for user/account avatars.
- **Icons.svg**: canonical icon set for the app (sidebar products, nav items, etc.). The app should use these icons where possible.

## Using Icons.svg in code

`Icons.svg` is currently a single Figma export (one artboard). To use individual icons in the app:

1. **Option A**: Export from Figma as an SVG sprite with `<symbol id="…">` per icon (e.g. `inventory`, `megaphone`, `home`, `geofences`). Then the app can reference them via `<svg><use href="/dealership_logo/Icons.svg#inventory" /></svg>` or a small `DealershipIcon` component.
2. **Option B**: Split `Icons.svg` into one file per icon and import them as React components or image paths.

Until then, the app uses Lucide icons for product switcher and nav items; those should be swapped to `Icons.svg` once symbol IDs or per-icon assets are available so we use the right icons consistently.
