"use client";

import { GoogleMapsPreview } from "@/components/design-system/google-maps-preview";
import { SectionTitle } from "../atoms/SectionTitle";

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
