/**
 * Shared Mapbox style URLs for product maps (Inventory, MapboxMap default).
 *
 * Default `MapboxMap` style: Mapbox `dark-v11` (see `DEFAULT_STYLE` in `mapbox-map.tsx`).
 *
 * Inventory vector basemaps (light + dark) both use Mapbox Standard
 * (`mapbox://styles/mapbox/standard`); runtime `setConfigProperty("basemap", …)`
 * sets `lightPreset` (`dusk` vs `night`) and 3D/vegetation options — see
 * `configureInventoryMapStandardStyle` in `inventory-content.tsx`.
 */
export const MAPBOX_BASEMAP_DARK_URL = "mapbox://styles/mapbox/dark-v11";
