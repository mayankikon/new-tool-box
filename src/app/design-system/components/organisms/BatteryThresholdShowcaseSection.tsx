"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BatteryThresholdDialog } from "@/components/ui/battery-threshold-dialog";
import { BatteryThresholdSliderField } from "@/components/ui/battery-threshold-slider-field";
import {
  BATTERY_THRESHOLD_RECOMMENDED_V,
  BATTERY_THRESHOLD_V_MIN,
} from "@/components/ui/battery-threshold-icon";
import { SectionTitle } from "../atoms/SectionTitle";

export interface BatteryThresholdShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function BatteryThresholdShowcaseSection({
  overline,
  title = "Battery threshold",
  description,
}: BatteryThresholdShowcaseSectionProps) {
  const [inlineVolts, setInlineVolts] = useState(BATTERY_THRESHOLD_RECOMMENDED_V);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVolts, setModalVolts] = useState(BATTERY_THRESHOLD_V_MIN);
  const [draftVolts, setDraftVolts] = useState(modalVolts);

  const handleModalOpenChange = useCallback(
    (open: boolean) => {
      setModalOpen(open);
      if (open) {
        setDraftVolts(modalVolts);
      }
    },
    [modalVolts]
  );

  return (
    <section
      id="battery-threshold"
      className="scroll-mt-28 space-y-6"
    >
      <SectionTitle overline={overline} title={title} description={description} />

      <div className="space-y-8 rounded-sm border border-border bg-card p-6 shadow-sm">
        <div>
          <h4 className="ds-doc-font mb-2 text-sm font-medium text-foreground">Inline field</h4>
          <p className="ds-doc-font mb-3 text-xs text-muted-foreground">
            Icon + horizontal scale; use in settings panels or forms. Recommended {BATTERY_THRESHOLD_RECOMMENDED_V} V is marked on the track.
          </p>
          <div className="max-w-md rounded-lg border border-border bg-background/50 p-4">
            <BatteryThresholdSliderField value={inlineVolts} onValueChange={setInlineVolts} layout="inline" />
          </div>
        </div>

        <div>
          <h4 className="ds-doc-font mb-2 text-sm font-medium text-foreground">Settings card + modal</h4>
          <p className="ds-doc-font mb-3 text-xs text-muted-foreground">
            Card opens the threshold editor dialog (title, description, stacked icon + slider, Cancel / Save).
          </p>
          <Card className="max-w-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Battery</CardTitle>
              <CardDescription>Alert when voltage drops below your minimum.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Current threshold:{" "}
              <span className="font-medium tabular-nums text-foreground">{modalVolts.toFixed(1)} V</span>
            </CardContent>
            <CardFooter className="justify-start">
              <Button type="button" variant="outline" size="sm" onClick={() => handleModalOpenChange(true)}>
                Edit threshold
              </Button>
            </CardFooter>
          </Card>

          <BatteryThresholdDialog
            open={modalOpen}
            onOpenChange={handleModalOpenChange}
            value={draftVolts}
            onValueChange={setDraftVolts}
            onSave={(volts) => setModalVolts(volts)}
          />
        </div>
      </div>
    </section>
  );
}
