"use client";

import dynamic from "next/dynamic";

import { SectionTitle } from "../atoms/SectionTitle";

/** Browser-only (Cesium, Maps JS). SSR this page used to surface as a generic 500 for `/design-system/foundations/maps`. */
const GoogleMapsPreview = dynamic(
  () =>
    import("@/components/design-system/google-maps-preview").then((m) => ({
      default: m.GoogleMapsPreview,
    })),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-[min(70vh,560px)] rounded-md border border-border bg-muted/20"
        aria-busy
        aria-label="Loading maps preview"
      />
    ),
  },
);

/** Kept in sync with `entryDescriptions["foundations:maps"]` in `design-system-registry.tsx`. */
const MAPS_SECTION_DESCRIPTION =
  "2D hybrid satellite (Maps JavaScript API) with a toggle to photorealistic 3D Tiles (Map Tiles API) in CesiumJS; separate from Mapbox inventory maps.";

export function MapsSection() {
  return (
    <section id="maps" className="scroll-mt-28 space-y-8">
      <SectionTitle overline="Foundations" title="Maps" description={MAPS_SECTION_DESCRIPTION} />
      <GoogleMapsPreview />
    </section>
  );
}
