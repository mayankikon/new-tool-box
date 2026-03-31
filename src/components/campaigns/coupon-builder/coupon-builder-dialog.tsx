"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CampaignOffer } from "@/lib/campaigns/types";
import { CouponBuilderForm } from "./coupon-builder-editor";

export interface CouponBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialOffer?: CampaignOffer | null;
  onSave: (offer: CampaignOffer) => void;
}

const MOCK_DEALERSHIP = "AutoNation Toyota";

export function CouponBuilderDialog({
  open,
  onOpenChange,
  mode,
  initialOffer,
  onSave,
}: CouponBuilderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(900px,90vh)] w-full max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle className="text-lg font-medium">
            {mode === "create" ? "Create Coupon" : "Edit Coupon"}
          </DialogTitle>
          <DialogDescription>
            Three steps: basics, look and copy, then review on the coupon card plus
            SMS and email mockups.
          </DialogDescription>
        </DialogHeader>

        <CouponBuilderForm
          mode={mode}
          initialOffer={initialOffer ?? null}
          isActive={open}
          dealershipDisplayName={MOCK_DEALERSHIP}
          className="min-h-0"
          onCancel={() => onOpenChange(false)}
          onSave={(offer) => {
            onSave(offer);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
