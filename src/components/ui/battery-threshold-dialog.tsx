"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BatteryThresholdSliderField } from "@/components/ui/battery-threshold-slider-field";

export interface BatteryThresholdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: number;
  onValueChange: (volts: number) => void;
  onCancel?: () => void;
  onSave?: (volts: number) => void;
}

/**
 * Modal pattern for editing the low-battery alert threshold (10–12.5 V).
 * Uses {@link BatteryThresholdSliderField} with stacked icon + marked slider.
 */
export function BatteryThresholdDialog({
  open,
  onOpenChange,
  value,
  onValueChange,
  onCancel,
  onSave,
}: BatteryThresholdDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleSave = () => {
    onSave?.(value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-4 sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Battery Threshold</DialogTitle>
          <DialogDescription>
            Set the low battery threshold. Vehicles with a low battery threshold below this value would be
            considered low.
          </DialogDescription>
        </DialogHeader>
        <BatteryThresholdSliderField
          layout="stack"
          bareSlider
          value={value}
          onValueChange={onValueChange}
          className="py-1"
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
