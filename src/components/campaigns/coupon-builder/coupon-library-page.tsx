"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Pencil, Plus, TicketPercent, Trash2 } from "lucide-react";
import { TopBar } from "@/components/app/top-bar";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIllustration,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import {
  BRANDING_CHANGED_EVENT,
  loadDealershipBranding,
} from "@/lib/campaigns/dealership-branding-storage";
import { couponTemplateTitle } from "@/lib/campaigns/coupon-builder-copy";
import {
  loadCouponLibrary,
  removeCouponFromLibrary,
  upsertCouponInLibrary,
} from "@/lib/campaigns/coupon-library-storage";
import { createNewCampaignOfferId } from "@/lib/campaigns/coupon-templates";
import type { CampaignOffer, CouponTemplateId } from "@/lib/campaigns/types";
import { cn } from "@/lib/utils";
import { CouponBuilderForm } from "./coupon-builder-editor";
import { CouponCardPreview } from "./coupon-card-preview";

const MOCK_DEALERSHIP = "Your Dealership";

function offerWithFallbackLogo(
  offer: CampaignOffer,
  accountLogoUrl: string,
): CampaignOffer {
  if (offer.visual.logoUrl?.trim()) {
    return offer;
  }
  const url = accountLogoUrl?.trim();
  if (!url) return offer;
  return {
    ...offer,
    visual: { ...offer.visual, logoUrl: url },
  };
}

export function CouponLibraryPage() {
  const [coupons, setCoupons] = useState<CampaignOffer[]>([]);
  const [view, setView] = useState<"list" | "editor">("list");
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingOffer, setEditingOffer] = useState<CampaignOffer | null>(null);
  const [accountLogoUrl, setAccountLogoUrl] = useState(
    () => loadDealershipBranding().dealershipLogoUrl,
  );

  const refresh = useCallback(() => {
    setCoupons(loadCouponLibrary());
  }, []);

  const syncBranding = useCallback(() => {
    setAccountLogoUrl(loadDealershipBranding().dealershipLogoUrl);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    syncBranding();
    window.addEventListener(BRANDING_CHANGED_EVENT, syncBranding);
    return () => window.removeEventListener(BRANDING_CHANGED_EVENT, syncBranding);
  }, [syncBranding]);

  const handleNew = useCallback(() => {
    setEditorMode("create");
    setEditingOffer(null);
    setView("editor");
  }, []);

  const handleEdit = useCallback((offer: CampaignOffer) => {
    setEditorMode("edit");
    setEditingOffer(offer);
    setView("editor");
  }, []);

  const handleDuplicate = useCallback(
    (offer: CampaignOffer) => {
      const copy: CampaignOffer = JSON.parse(JSON.stringify(offer));
      copy.id = createNewCampaignOfferId();
      copy.title = `${copy.title} (copy)`;
      upsertCouponInLibrary(copy);
      refresh();
    },
    [refresh],
  );

  const handleDelete = useCallback(
    (offerId: string) => {
      removeCouponFromLibrary(offerId);
      refresh();
    },
    [refresh],
  );

  const handleSaveFromEditor = useCallback(
    (offer: CampaignOffer) => {
      upsertCouponInLibrary(offer);
      refresh();
      setView("list");
    },
    [refresh],
  );

  const handleBackToList = useCallback(() => {
    setView("list");
  }, []);

  const editorTitle = useMemo(
    () => (editorMode === "create" ? "New Design" : "Edit Design"),
    [editorMode],
  );

  const listSubtitle =
    "Create reusable coupon designs—templates, copy, discounts, and rules—like a lightweight Canva for service offers. Saved coupons appear here and in the campaign wizard when you attach an offer.";

  if (view === "editor") {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-6">
        <TopBar
          breadcrumbs={[
            {
              label: "Coupon",
              onClick: handleBackToList,
            },
          ]}
          title={editorTitle}
          subtitle={listSubtitle}
          right={
            <Button
              type="button"
              variant="outline"
              size="header"
              leadingIcon={<ArrowLeft className="size-4" />}
              onClick={handleBackToList}
            >
              Back
            </Button>
          }
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-8 pb-10 pt-6">
          <CouponBuilderForm
            mode={editorMode}
            initialOffer={editorMode === "edit" ? editingOffer : null}
            isActive={view === "editor"}
            dealershipDisplayName={MOCK_DEALERSHIP}
            onSave={handleSaveFromEditor}
            className="min-h-0 overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-6">
      <TopBar
        title="Coupon"
        subtitle={listSubtitle}
        right={
          <Button
            size="header"
            leadingIcon={<Plus />}
            onClick={handleNew}
          >
            New Design
          </Button>
        }
      />
      <div className="flex flex-1 flex-col overflow-auto px-8 pb-10 pt-6">
        {coupons.length === 0 ? (
          <div className="mx-auto flex w-full max-w-lg flex-1 items-center justify-center py-12 sm:py-16">
            <EmptyState className="max-w-md">
              <EmptyStateIllustration>
                <TicketPercent className="size-10" aria-hidden />
              </EmptyStateIllustration>
              <EmptyStateContent>
                <EmptyStateTitle className="font-headline text-2xl font-medium text-foreground">
                  No coupon designs yet
                </EmptyStateTitle>
                <EmptyStateDescription className="max-w-sm text-sm">
                  Start with a template, customize headline and colors, then save.
                  Designs are stored in this browser for mock demos.
                </EmptyStateDescription>
              </EmptyStateContent>
              <EmptyStateActions>
                <Button onClick={handleNew} size="lg" leadingIcon={<Plus />}>
                  Create Your First Coupon
                </Button>
              </EmptyStateActions>
            </EmptyState>
          </div>
        ) : (
          <div className="grid w-full min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
            {coupons.map((offer) => (
              <article
                key={offer.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm",
                )}
              >
                <div className="border-b border-border/60 bg-muted/20 p-4">
                  <CouponCardPreview
                    offer={offerWithFallbackLogo(offer, accountLogoUrl)}
                    compact
                    dealershipDisplayName={MOCK_DEALERSHIP}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium leading-snug tracking-tight text-foreground">
                      {offer.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground/80">
                        {offer.valueLabel}
                      </span>
                      <span className="text-muted-foreground/80"> · </span>
                      {couponTemplateTitle(offer.visual.templateId as CouponTemplateId)}
                    </p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2 border-t border-border/50 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      leadingIcon={<Pencil className="size-3" />}
                      onClick={() => handleEdit(offer)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      leadingIcon={<Copy className="size-3" />}
                      onClick={() => handleDuplicate(offer)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="text-destructive hover:text-destructive"
                      leadingIcon={<Trash2 className="size-3" />}
                      onClick={() => handleDelete(offer.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
