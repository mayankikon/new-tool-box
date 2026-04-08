# Inventory map: marker tiers and zoom behavior

This document describes how the inventory lot map switches between **cluster markers** (dealership-style icon vs numeric badge), **Mapbox circle markers** (lot-age color), and **HTML vehicle chips** (photo with tier-colored border). Use it when reusing the same behavior elsewhere.

## Where the logic lives

| Concern | Location |
| -------- | -------- |
| Zoom thresholds, clustering, reconcile on `zoom` / `moveend` | `src/components/inventory/inventory-content.tsx` |
| `INVENTORY_MAP_VEHICLE_IMAGE_ZOOM` (selection fly target) | `src/lib/inventory/inventory-map-vehicle-features.ts` |
| GeoJSON features (`ageTier`, `imageSrc`, etc.) | `buildInventoryVehicleFeatureCollection` in `src/lib/inventory/inventory-map-vehicle-features.ts` |
| Cluster UI (dealership icon vs number) | `VehicleMapClusterMarker` in `src/components/ui/vehicle-map-cluster-marker.tsx` |
| Per-vehicle HTML marker (chip + photo) | `VehicleMapMarkerChip` in `src/components/ui/vehicle-map-marker-chip.tsx` |
| Optional shield **pin** (teal / gold / red SVGs) | `VehicleMapMarkerPin` in `src/components/ui/vehicle-map-marker-pin.tsx` |
| Asset paths and Figma labels | `src/components/icons/map-marker-assets.ts` |

## Zoom constants (source of truth)

Defined in `inventory-content.tsx` unless noted:

| Constant | Value | Role |
| -------- | ----- | ---- |
| `INVENTORY_MAP_DEALERSHIP_CLUSTER_ZOOM` | `15.5` | Below or equal: cluster HTML uses **dealership / group** variant; above: **numeric** cluster badge. |
| `INVENTORY_MAP_CLUSTER_MAX_ZOOM` | `17.49` | Mapbox GeoJSON `clusterMaxZoom` and Supercluster `maxZoom`; above this, **HTML cluster markers are removed**. |
| `INVENTORY_MAP_VEHICLE_PIN_ZOOM` | `17.5` | Below: **Mapbox circle** layer for unclustered points is visible; at/above: circles fade out (`circle-opacity` step) and **HTML vehicle markers** mount. |
| `INVENTORY_MAP_CLUSTER_DISCOVERY_ZOOM` | `17.2` | Minimum target zoom when expanding a **group-active** cluster click (eased toward vehicle HTML range). |
| `INVENTORY_MAP_SHIELD_DISCOVERY_ZOOM` | `17.7` | Minimum target zoom when expanding a **number-default** cluster click (eased toward photo chip range). |
| `INVENTORY_MAP_MAX_HTML_MARKERS` | `40` | Cap on simultaneous HTML vehicle markers (viewport + feature iteration). |

From `inventory-map-vehicle-features.ts`:

| Constant | Value | Role |
| -------- | ----- | ---- |
| `INVENTORY_MAP_VEHICLE_IMAGE_ZOOM` | `18.5` | **Selection fly**: `easeTo` uses `max(currentZoom, 18.5)` so the camera stays high enough for photo chips after picking a vehicle from the list (avoids animation dipping below the tier where chips read well). |

## End-to-end behavior (what the user sees)

1. **Far / mid zoom — clustered HTML markers** (`zoom ≤ 17.49`, clusters present)  
   - Implemented by `reconcileInventoryVehicleClusterMarkers`, driven by a **Supercluster** index aligned with the Mapbox GeoJSON source (`clusterRadius: 72`).  
   - **Variant** (`inventoryClusterMarkerVariantForZoom`):  
     - `zoom ≤ 15.5` → `group-active`: green rounded square with a **building / dealership** icon (inline SVG path in `VehicleMapClusterMarker`, not a separate image file).  
     - `zoom > 15.5` → `number-default`: white rounded square with the **cluster count** (abbreviated when large).  
   - Mapbox **circle + symbol** layers for clusters exist but use **~0.01 opacity** so they stay queryable for clicks while the **visible** UI is these HTML markers.

2. **Unclustered points, before HTML vehicles** (`zoom < 17.5`, and points are no longer clustered)  
   - **`INV_LAYER_UNCLUSTERED`** circle layer: radius ~9px, **stroke + fill from `ageTier`** (`fresh` / `aging` / `stale` → teal / gold / red via `INVENTORY_LOT_AGE_TIER_HEX` in the map expression). This is the **simple colored dot** stage.

3. **Close zoom — HTML vehicle markers** (`zoom ≥ 17.5`)  
   - `reconcileInventoryVehicleHtmlMarkers` mounts `mapboxgl.Marker` instances with React roots.  
   - **Mode is fixed to `chip`** (not `pin`): a comment in code notes that alternating pin/chip during `easeTo` / fly arcs caused flicker (image ↔ pin ↔ image), so inventory always renders **`VehicleMapMarkerChip`** at this tier.  
   - **`VehicleMapMarkerChip`**: if `imageSrc` is set, renders vector frame + **clipped vehicle photo** with **stroke color** from `VEHICLE_MARKER_CHIP_STROKE_HEX` / `variantIndex` (mapped from `ageTier`). Without a photo URL, it falls back to static **raster/SVG chip** exports from `vehicleMarkerChipAssets`.  
   - The separate **`VehicleMapMarkerPin`** component (shield PNGs under `public/media/map-markers/`) is the design-system **shield** marker; it is **not** the active path on the inventory map today, but it is the asset set to use if you intentionally add a shield-only tier.

4. **Cluster click → camera**  
   - `expandInventoryCluster` calls `getClusterExpansionZoom` and `easeTo` with a zoom bounded by the discovery constants above and capped below the next tier (`INVENTORY_MAP_VEHICLE_IMAGE_ZOOM` appears in the expansion path for the number variant via the imported constant in `expandInventoryCluster`).

## Assets: what is used and where it is stored

| Asset / pattern | Storage | Used for |
| ---------------- | ------- | -------- |
| Dealership cluster icon | **Inline SVG** path in `vehicle-map-cluster-marker.tsx` (`group-active`) | Far cluster “building” marker |
| Numeric cluster badge | **Inline SVG** + dynamic text in same file (`number-default`) | Mid cluster counts |
| Vehicle chip (no photo) | `vehicleMarkerChipAssets` → `public/media/map-markers-source/Vehicle Marker*.svg` | Chip fallback when no `imageSrc` |
| Vehicle photo in chip | Runtime `imageSrc` from feature props (see `INVENTORY_FRONT_IMAGE_SRC_BY_VIN` / vehicle record) | Photo inside chip frame |
| Shield pins (teal / gold / “orange”) | `VEHICLE_MAP_PIN_SOURCES` → `public/media/map-markers/map-marker-vehicle-teal.svg`, `-gold.svg`, `-orange.svg` | `VehicleMapMarkerPin` (not inventory’s default tier) |
| Extracted pins (group, number, keys, etc.) | `public/media/map-markers/*.svg` | Catalog in `extractedMapMarkerAssets` in `map-marker-assets.ts`; inventory clusters use **inline** group/number, not necessarily these files |
| Status indicator sheet | `public/media/map-markers-source/Vehicle Card/Status Indicators - Large.svg` | Optional crops via `VehicleMapMarkerStatusIndicatorCrop` / design system |
| Source-of-truth comment | Top of `map-marker-assets.ts` | Figma exports live under `public/media/map-markers-source/`; extracted pins via `scripts/extract-map-marker-svgs.mjs` |

Paths under `public/` should be passed through `encodePublicAssetPath` when URLs can contain spaces (see `map-marker-assets.ts`).

## Reusing this pattern in another surface

1. Copy or extract the **threshold constants** and the **three reconcile paths**: cluster HTML (`Supercluster` + `VehicleMapClusterMarker`), Mapbox circle layer for unclustered tier dots, HTML markers (`VehicleMapMarkerChip` or your variant).  
2. Keep **one GeoJSON source** with `cluster: true` and matching **Supercluster** options if you need HTML clusters that align with Mapbox clustering.  
3. Prefer a **single HTML marker mode** per zoom band to avoid flicker during camera animation (inventory chose chip-only ≥ vehicle pin zoom).  
4. Wire **selection fly** to `INVENTORY_MAP_VEHICLE_IMAGE_ZOOM` (or your product’s equivalent) if you need guaranteed photo legibility after programmatic navigation.
