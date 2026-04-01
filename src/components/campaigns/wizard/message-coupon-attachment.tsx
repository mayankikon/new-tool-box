"use client";

import { useCallback, useMemo, useState } from "react";
import { Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CouponCardPreview } from "@/components/campaigns/coupon-builder/coupon-card-preview";
import type { CampaignOffer } from "@/lib/campaigns/types";
import { cn } from "@/lib/utils";

export interface MessageCouponAttachmentProps {
  offers: CampaignOffer[];
  selectedOfferId?: string;
  dealershipDisplayName: string;
  onOfferIdChange: (offerId: string | undefined) => void;
  onCreateNewCoupon: () => void;
  onEditCoupon: () => void;
}

export function MessageCouponAttachment({
  offers,
  selectedOfferId,
  dealershipDisplayName,
  onOfferIdChange,
  onCreateNewCoupon,
  onEditCoupon,
}: MessageCouponAttachmentProps) {
  const [chooserOpen, setChooserOpen] = useState(false);
  const [filter, setFilter] = useState("");

  const selectedOffer = useMemo(
    () =>
      selectedOfferId
        ? offers.find((o) => o.id === selectedOfferId)
        : undefined,
    [offers, selectedOfferId],
  );

  const filteredOffers = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter((o) => o.title.toLowerCase().includes(q));
  }, [offers, filter]);

  const handleAttach = useCallback(
    (id: string | undefined) => {
      onOfferIdChange(id);
      setChooserOpen(false);
      setFilter("");
    },
    [onOfferIdChange],
  );

  const handleOpenChooser = useCallback(() => {
    setFilter("");
    setChooserOpen(true);
  }, []);

  const handleCreateFromChooser = useCallback(() => {
    setChooserOpen(false);
    setFilter("");
    onCreateNewCoupon();
  }, [onCreateNewCoupon]);

  const staleReference =
    Boolean(selectedOfferId) && selectedOffer === undefined;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label className="text-foreground">Coupon</Label>
      </div>

      {staleReference ? (
        <div
          className="flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/5 p-3"
          role="alert"
        >
          <p className="text-sm text-destructive">
            This coupon is no longer in your library. Choose another coupon or
            remove the attachment.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={handleOpenChooser}
            >
              Choose another coupon
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOfferIdChange(undefined)}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : selectedOffer ? (
        <div className="flex flex-col gap-3 rounded-md border bg-muted/15 p-3 sm:flex-row sm:items-stretch">
          <div
            className="relative mx-auto h-[104px] w-[140px] shrink-0 overflow-hidden rounded-md border bg-card shadow-sm sm:mx-0"
            aria-hidden
          >
            <div className="absolute left-1/2 top-1 w-[220px] -translate-x-1/2 origin-top scale-[0.52]">
              <CouponCardPreview
                offer={selectedOffer}
                compact
                dealershipDisplayName={dealershipDisplayName}
              />
            </div>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 truncate text-sm font-medium">
                {selectedOffer.title}
              </p>
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {selectedOffer.valueLabel}
              </Badge>
            </div>
            {selectedOffer.channelSafeCopy?.trim() ? (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {selectedOffer.channelSafeCopy}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="2xs"
                onClick={handleOpenChooser}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="outline"
                size="2xs"
                onClick={() => onOfferIdChange(undefined)}
              >
                Remove
              </Button>
              <Button
                type="button"
                variant="outline"
                size="2xs"
                onClick={onEditCoupon}
              >
                Edit coupon
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-md border border-dashed bg-muted/10 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
              <Ticket className="size-4 text-muted-foreground" />
            </span>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium">No coupon attached</p>
              <p className="text-xs text-muted-foreground">
                Pick a saved design from your coupon library or create a new
                one. Coupons you save from Coupon appear here.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleOpenChooser}>
              Attach coupon
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCreateNewCoupon}
            >
              New coupon
            </Button>
          </div>
        </div>
      )}

      <Dialog open={chooserOpen} onOpenChange={setChooserOpen}>
        <DialogContent
          showCloseButton
          className="flex max-h-[min(720px,92vh)] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
          aria-labelledby="coupon-chooser-title"
          aria-describedby="coupon-chooser-desc"
        >
          <DialogHeader className="shrink-0 border-b px-4 py-4 sm:px-6">
            <DialogTitle id="coupon-chooser-title">Attach coupon</DialogTitle>
            <DialogDescription id="coupon-chooser-desc">
              Select a coupon from your library. Saved designs from Coupon are
              listed here.
            </DialogDescription>
          </DialogHeader>

          <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:px-6">
            <Input
              type="search"
              placeholder="Search by name…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="sm:max-w-xs"
              aria-label="Filter coupons by title"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="sm:ml-auto"
              onClick={() => handleAttach(undefined)}
            >
              No coupon
            </Button>
          </div>

          <ScrollArea className="h-[min(380px,50vh)] px-4 py-4 sm:px-6">
            {filteredOffers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {offers.length === 0
                  ? "No coupons yet. Create one with New coupon."
                  : "No coupons match your search."}
              </p>
            ) : (
              <div
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                role="listbox"
                aria-label="Coupon library"
              >
                {filteredOffers.map((offer) => {
                  const isSelected = offer.id === selectedOfferId;
                  return (
                    <button
                      key={offer.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleAttach(offer.id)}
                      className={cn(
                        "rounded-lg border bg-card p-3 text-left transition-colors",
                        "hover:border-primary/50 hover:bg-accent/30",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isSelected &&
                          "border-primary ring-1 ring-primary/30 bg-primary/5",
                      )}
                    >
                      <div className="pointer-events-none mx-auto flex h-[120px] w-full max-w-[200px] items-start justify-center overflow-hidden rounded-md border bg-muted/20">
                        <div className="w-[240px] origin-top scale-[0.48] pt-1">
                          <CouponCardPreview
                            offer={offer}
                            compact
                            dealershipDisplayName={dealershipDisplayName}
                          />
                        </div>
                      </div>
                      <p className="mt-2 truncate text-xs font-medium">
                        {offer.title}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {offer.valueLabel}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="flex shrink-0 justify-end border-t bg-muted/30 px-4 py-3 sm:px-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleCreateFromChooser}
            >
              Create new coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
