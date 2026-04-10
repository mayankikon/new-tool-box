# Inventory map: marker tiers and zoom behavior

This document describes how the inventory lot map switches between **cluster markers** (dealership-style icon vs numeric badge), **Mapbox circle markers** (lot-age color), and **HTML vehicle chips** (photo with tier-colored border). Use it when reusing the same behavior elsewhere.

## Where the logic lives

| Concern | Location |
| -------- | -------- |
| Zoom thresholds, clustering, reconcile on `zoom` / `moveend` | `src/components/inventory/inventory-content.tsx` |
| Custom zoom UI: Plus/Minus zoom, dwell “Show slider”, magnetic checkpoint track | `src/components/inventory/inventory-map-zoom-controls.tsx` + `replaceDefaultZoomControls` on `MapboxMap` |
| Checkpoint math (vehicle marker zoom, vehicle image zoom) + snap helpers | `src/lib/inventory/inventory-map-zoom-checkpoints.ts` |
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

From `inventory-map-zoom-checkpoints.ts` (slider checkpoints):

| Constant | Value | Role |
| -------- | ----- | ---- |
| `INVENTORY_MAP_SLIDER_ZOOM_MIN` / `INVENTORY_MAP_SLIDER_ZOOM_MAX` | `15` / `19.5` | **Linear** slider mapping: handle position is \((zoom - min) / (max - min)\). The span is chosen **narrower** than e.g. 14–20 so the **vehicle marker** and **vehicle image** checkpoints have comfortable vertical separation on the track; zoom still clamps at the ends. |
| `INVENTORY_MAP_ZOOM_CHECKPOINT_MARKER` | `17.3` | **Checkpoint — vehicle markers**: `easeTo` this zoom so tier-colored **circle** markers read well (below `INVENTORY_MAP_VEHICLE_PIN_ZOOM` / HTML chips). |

**Checkpoint slider UX:** After hovering the collapsed zoom buttons for ~1s, a tooltip offers **Show slider**. The zoom control column keeps a **fixed width** matching **`MapControlButton`** (`40px` / `w-10`); the tooltip and an invisible hover bridge are **positioned to the left** (not in document flow) so compass / basemap / 3D controls **do not shift** when the tooltip appears. Toggling expanded mode uses a **layout** transition on the zoom block only (collapsed Plus/Minus ↔ expanded track). In **expanded** mode, zoom **+ / −** are **borderless icon-only** controls (no second `MapControlButton` box) so they sit inside the single panel ring; **collapsed** mode still uses **`MapControlButton`** like the rest of the map chrome. Expanded mode uses a vertical track with **two** rings at normalized positions for **vehicle circle markers** (`INVENTORY_MAP_ZOOM_CHECKPOINT_MARKER`) and **vehicle photo chips** (`INVENTORY_MAP_VEHICLE_IMAGE_ZOOM`). The side **icon chip** for each ring appears only while **hovering** that ring (not when it is merely active). Both chips share the **same fixed width** (`w-20` / 80px). Artwork: **`public/media/map-markers/icon.svg`** (vehicle markers) and **`public/media/map-markers/image.png`** (vehicle images); the PNG uses **`next/image`** with **`unoptimized`** so a high-resolution `image.png` stays sharp when scaled into the chip. Rings use **primary** stroke and **`scale(1.5)`** on hover (skipped when reduced motion is preferred). Behind the sharp rings, an optional **SVG goo (metaball) filter** blends **primary-filled** disks for the thumb and the active/snapped checkpoint so they read as **merging bubbles** as the camera eases; the **sharp thumb** (`z-index` above the rings) stays on top. Clicking a checkpoint also runs a short **scale pulse** on the thumb. Reduced motion disables the goo + pulse. The tapered stroke and rings share one **centered** axis (`w-6` track, symmetric trapezoid clip). **Hide slider** collapses back to Plus/Minus without moving the camera.

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
   - **Mode by zoom:** `17.5 ≤ zoom < 18.5` → **`VehicleMapMarkerPin`** (teal / gold / red shields from `ageTier`); `zoom ≥ 18.5` (`INVENTORY_MAP_VEHICLE_IMAGE_ZOOM`) → **`VehicleMapMarkerChip`** with vehicle photo when available. List/selection fly uses **`easeTo`** (not `flyTo`) so the camera does not dip through zoom bands mid-animation and thrash pin↔chip.  
   - **`VehicleMapMarkerChip`**: if `imageSrc` is set, renders vector frame + **clipped vehicle photo** with **stroke color** from `VEHICLE_MARKER_CHIP_STROKE_HEX` / `variantIndex` (mapped from `ageTier`). Without a photo URL, it falls back to static **raster/SVG chip** exports from `vehicleMarkerChipAssets`.  
   - **`VehicleMapMarkerPin`**: shield SVGs under `public/media/map-markers/map-marker-vehicle-*.svg` — the mid-zoom tier before photo chips.

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
3. Prefer **stable zoom bands** for HTML marker mode (inventory: shield pins, then photo chips) and **easeTo** (not `flyTo`) for programmatic moves so the camera does not dip through bands mid-animation.  
4. Wire **selection fly** to `INVENTORY_MAP_VEHICLE_IMAGE_ZOOM` (or your product’s equivalent) if you need guaranteed photo legibility after programmatic navigation.
