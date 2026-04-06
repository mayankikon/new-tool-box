"use client";

import { SectionTitle } from "../atoms/SectionTitle";

export function ShadowsElevationsSection() {
  return (
    <section id="shadows-elevations" className="scroll-mt-28 space-y-8">
      <SectionTitle
        overline="Foundations"
        title="Shadows & Elevations"
        description="Shadows and elevations communicate depth, layering, and interactive prominence."
      />
      <div className="rounded-sm border border-dashed border-border bg-muted/20 p-10 text-center">
        <p className="ds-doc-font text-sm text-muted-foreground">
          Shadow and elevation tokens are coming soon. They will document the box-shadow scale and z-index layering used across components.
        </p>
      </div>
    </section>
  );
}
