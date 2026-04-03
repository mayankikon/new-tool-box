"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { couponTemplateTitle, offerTypeTitle } from "@/lib/campaigns/coupon-builder-copy";
import { useBrandProfile } from "@/lib/branding/brand-profile-provider";
import { DEFAULT_DEALERSHIP_LOGO_SRC } from "@/lib/branding/brand-profile-types";
import type { DealershipBranding } from "@/lib/campaigns/dealership-branding-storage";
import { pickRandomVehicleFromCatalog } from "@/lib/campaigns/vehicle-catalog-sample";
import {
  COUPON_CONDITION_OPTIONS,
  COUPON_TEMPLATE_PRESETS,
  buildCampaignOfferFromBuilderInput,
  conditionRuleLabel,
  createDraftCampaignOffer,
  createNewCampaignOfferId,
} from "@/lib/campaigns/coupon-templates";
import type {
  CampaignOffer,
  CouponConditionRule,
  OfferType,
} from "@/lib/campaigns/types";
import { DevicePreview } from "../wizard/device-preview";
import {
  CouponAccentPresetPicker,
  CouponBadgeKindPicker,
  CouponCornerStylePicker,
} from "./coupon-appearance-pickers";
import { CouponCardPreview } from "./coupon-card-preview";

function cloneOffer(offer: CampaignOffer): CampaignOffer {
  return JSON.parse(JSON.stringify(offer)) as CampaignOffer;
}

function conditionsEqual(a: CouponConditionRule, b: CouponConditionRule): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function BuilderBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-base font-medium tracking-tight text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const OFFER_TYPES: OfferType[] = [
  "fixed-discount",
  "percentage-discount",
  "service-bundle",
  "free-add-on",
  "seasonal-promotion",
  "custom",
];

const COUPON_WIZARD_STEP_LABELS = ["Basics", "Look & copy", "Review"] as const;
const COUPON_WIZARD_STEP_COUNT = COUPON_WIZARD_STEP_LABELS.length;

const COUPON_PREVIEW_MESSAGE_SUBJECT = "Your offer from the dealership";
const COUPON_PREVIEW_MESSAGE_BODY =
  "Hi Sarah — we put together something just for you. Tap below to view your coupon.";

const stepTransition = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
};

/** Module load default for date input when `expiresAt` is unset (14 days ahead). */
const DEFAULT_FIXED_EXPIRY_DATE_INPUT = new Date(Date.now() + 14 * 86400000)
  .toISOString()
  .slice(0, 10);

export const COUPON_BUILDER_FORM_ID = "sm-coupon-builder-form";

export interface CouponBuilderFormProps {
  mode: "create" | "edit";
  initialOffer: CampaignOffer | null;
  /** When false, internal draft is not re-initialized (e.g. dialog closed). */
  isActive: boolean;
  dealershipDisplayName: string;
  className?: string;
  /** First-step dismiss (e.g. dialog cancel). Omitted on full-page editor where Back is in the shell. */
  onCancel?: () => void;
  /** Called with the offer the user would save (after normalization). */
  onSave: (offer: CampaignOffer) => void;
  /** For submit buttons outside the form (e.g. TopBar). */
  formId?: string;
}

export function CouponBuilderForm({
  mode,
  initialOffer,
  isActive,
  dealershipDisplayName,
  className,
  onCancel,
  onSave,
  formId = COUPON_BUILDER_FORM_ID,
}: CouponBuilderFormProps) {
  const [draft, setDraft] = useState<CampaignOffer>(() => createDraftCampaignOffer());
  const [builderStep, setBuilderStep] = useState(0);
  const [reviewSubTab, setReviewSubTab] = useState<0 | 1 | 2>(0);
  const [couponLogoFromAccount, setCouponLogoFromAccount] = useState(true);
  const { profile, updateProfile } = useBrandProfile();
  const workspaceBranding: DealershipBranding = {
    dealershipLogoUrl: profile.logoUrl,
    vehicleMake: profile.vehicleMake,
    vehicleModel: profile.vehicleModel,
    vehicleImageUrl: profile.vehicleImageUrl,
  };
  /** Avoid re-initializing draft/step on every parent re-render while the surface stays open. */
  const editorSessionOpenRef = useRef(false);

  useEffect(() => {
    if (!isActive) {
      editorSessionOpenRef.current = false;
      return;
    }
    if (editorSessionOpenRef.current) {
      return;
    }
    editorSessionOpenRef.current = true;

    /* Rehydrate draft once when the editor session starts (dialog open or library editor). */
    /* eslint-disable react-hooks/set-state-in-effect -- intentional reset on open */
    if (mode === "edit" && initialOffer) {
      setDraft(cloneOffer(initialOffer));
      setCouponLogoFromAccount(!initialOffer.visual.logoUrl?.trim());
    } else {
      const base = createDraftCampaignOffer();
      const v = pickRandomVehicleFromCatalog();
      setDraft({
        ...base,
        id: createNewCampaignOfferId(),
        visual: {
          ...base.visual,
          vehicleImageUrl: v.imageUrl,
          vehicleCaption: `${v.make} ${v.model}`.trim(),
        },
      });
      setCouponLogoFromAccount(true);
    }
    setBuilderStep(0);
    setReviewSubTab(0);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isActive, mode, initialOffer]);

  const isLastWizardStep = builderStep === COUPON_WIZARD_STEP_COUNT - 1;

  const handleWizardContinue = useCallback(() => {
    setBuilderStep((s) => Math.min(s + 1, COUPON_WIZARD_STEP_COUNT - 1));
  }, []);

  const handleWizardBack = useCallback(() => {
    setBuilderStep((s) => Math.max(0, s - 1));
  }, []);

  const updateDraft = useCallback((patch: Partial<CampaignOffer>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateVisual = useCallback(
    (patch: Partial<CampaignOffer["visual"]>) => {
      setDraft((prev) => ({
        ...prev,
        visual: { ...prev.visual, ...patch },
      }));
    },
    [],
  );

  const updateRules = useCallback((patch: Partial<CampaignOffer["rules"]>) => {
    setDraft((prev) => ({
      ...prev,
      rules: { ...prev.rules, ...patch },
    }));
  }, []);

  const toggleCondition = useCallback((create: () => CouponConditionRule) => {
    const rule = create();
    setDraft((prev) => {
      const has = prev.rules.conditions.some((c) => conditionsEqual(c, rule));
      const conditions = has
        ? prev.rules.conditions.filter((c) => !conditionsEqual(c, rule))
        : [...prev.rules.conditions, rule];
      return { ...prev, rules: { ...prev.rules, conditions } };
    });
  }, []);

  const previewOffer = useMemo((): CampaignOffer => {
    const resolvedLogo = couponLogoFromAccount
      ? workspaceBranding.dealershipLogoUrl?.trim() || undefined
      : draft.visual.logoUrl?.trim() || undefined;
    return {
      ...draft,
      visual: {
        ...draft.visual,
        logoUrl: resolvedLogo || undefined,
      },
    };
  }, [draft, couponLogoFromAccount, workspaceBranding.dealershipLogoUrl]);

  const handleSave = useCallback(() => {
    const useDerived =
      draft.type === "fixed-discount" || draft.type === "percentage-discount";
    const visualForSave = {
      ...draft.visual,
      ...(couponLogoFromAccount ? { logoUrl: undefined } : {}),
    };
    if (!couponLogoFromAccount && !visualForSave.logoUrl?.trim()) {
      visualForSave.logoUrl = undefined;
    }
    const saved = buildCampaignOfferFromBuilderInput({
      id: draft.id,
      type: draft.type,
      title: draft.title.trim() || "Untitled Coupon",
      description: draft.description,
      codeStrategy: draft.codeStrategy,
      redemptionGoal: draft.redemptionGoal,
      eligibleServices: draft.eligibleServices,
      channelSafeCopy: draft.channelSafeCopy,
      legalComplianceNote: draft.legalComplianceNote,
      discountPercent: draft.discountPercent,
      discountCents: draft.discountCents,
      valueLabelOverride: useDerived ? undefined : draft.valueLabel,
      visual: visualForSave,
      rules: draft.rules,
      recommendedChannels: draft.recommendedChannels,
      isRecommended: draft.isRecommended,
      isApproved: draft.isApproved,
    });
    onSave(saved);
  }, [couponLogoFromAccount, draft, onSave]);

  const dollarString =
    draft.discountCents != null
      ? String(draft.discountCents / 100)
      : "";

  const handleCouponLogoMode = (value: string | null) => {
    if (value !== "custom") {
      setCouponLogoFromAccount(true);
      updateVisual({ logoUrl: undefined });
      return;
    }
    setCouponLogoFromAccount(false);
  };

  const handleLogoFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    setCouponLogoFromAccount(false);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (dataUrl) {
        updateVisual({ logoUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleAccountLogoFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      updateProfile({ logoUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleResetAccountLogo = () => {
    updateProfile({ logoUrl: DEFAULT_DEALERSHIP_LOGO_SRC });
  };

  const handlePickRandomVehicleForCoupon = () => {
    const v = pickRandomVehicleFromCatalog();
    updateVisual({
      vehicleImageUrl: v.imageUrl,
      vehicleCaption: `${v.make} ${v.model}`.trim(),
    });
  };

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <div
        className="shrink-0 border-b border-border/60 px-6 py-3 sm:px-8"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-foreground" id="coupon-builder-step-label">
          <span aria-current="step">
            Step {builderStep + 1} of {COUPON_WIZARD_STEP_COUNT}
          </span>
          <span className="text-muted-foreground">
            {" "}
            — {COUPON_WIZARD_STEP_LABELS[builderStep]}
          </span>
        </p>
      </div>

      <form
        id={formId}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
        onSubmit={(event) => {
          event.preventDefault();
          if (!isLastWizardStep) return;
          handleSave();
        }}
      >
        {builderStep < 2 ? (
          <div
            className={cn(
              "grid min-h-0 flex-1 gap-0 overflow-hidden",
              (builderStep === 0 || builderStep === 1) &&
                "lg:grid-cols-[minmax(0,1fr)_min(100%,400px)]",
            )}
          >
            <div className="flex min-h-0 max-h-full flex-col overflow-hidden border-border/60 lg:border-r">
              <div className="max-h-full space-y-10 overflow-y-auto px-6 py-6 pb-10 sm:px-8 sm:py-8 sm:pb-12">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={builderStep}
                    initial={stepTransition.initial}
                    animate={stepTransition.animate}
                    exit={stepTransition.exit}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="space-y-10"
                  >
                    {builderStep === 0 ? (
                      <>
          <BuilderBlock
            title="Layout"
            description="Choose a starting structure. You can change copy, colors, and rules in the sections below."
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {COUPON_TEMPLATE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => updateVisual({ templateId: preset.id })}
                  className={cn(
                    "min-h-[4.25rem] rounded-lg border p-3 text-left text-xs transition-colors",
                    draft.visual.templateId === preset.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : "border-border/80 bg-card hover:bg-muted/50",
                  )}
                >
                  <p className="font-medium text-foreground">
                    {couponTemplateTitle(preset.id)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>
          </BuilderBlock>

          <BuilderBlock
            title="Dealership Branding For Previews"
            description="Upload your account logo and vehicle image here. Toggle whether each appears on the coupon card—the live preview updates immediately. Logo source (account vs custom) is set under Appearance."
          >
            <div className="space-y-6 rounded-lg border border-border/80 bg-muted/20 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-background">
                  {workspaceBranding.dealershipLogoUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={workspaceBranding.dealershipLogoUrl}
                      alt=""
                      className="size-full object-contain"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Dealership Logo</Label>
                    <input
                      type="file"
                      accept="image/*"
                      className="block w-full max-w-md text-xs file:mr-2 file:rounded-sm file:border file:border-border file:bg-muted file:px-2 file:py-1.5"
                      onChange={handleAccountLogoFile}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="2xs"
                    onClick={handleResetAccountLogo}
                  >
                    Use Default App Icon
                  </Button>
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-background/80 px-3 py-2.5 sm:px-4">
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-medium text-foreground">
                        Show dealership logo on card
                      </p>
                      <p className="text-[11px] leading-snug text-muted-foreground">
                        When off, the logo or dealership name is hidden on the
                        coupon only.
                      </p>
                    </div>
                    <Switch
                      checked={draft.visual.showLogoOnCoupon !== false}
                      onCheckedChange={(checked) =>
                        updateVisual({ showLogoOnCoupon: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border/60 pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/80 bg-background">
                    {draft.visual.vehicleImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={draft.visual.vehicleImageUrl}
                        alt=""
                        className="size-full object-contain object-center p-0.5"
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">
                        No image
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium">
                        Vehicle On Coupon
                      </Label>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        Same catalog images as inventory. Shown on the coupon card
                        and device previews. Saved with this design.
                      </p>
                      {draft.visual.vehicleCaption ? (
                        <p className="text-sm font-medium text-foreground">
                          {draft.visual.vehicleCaption}
                        </p>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="2xs"
                      leadingIcon={<RefreshCw className="size-3" />}
                      onClick={handlePickRandomVehicleForCoupon}
                    >
                      Pick Random Vehicle
                    </Button>
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-background/80 px-3 py-2.5 sm:px-4">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-medium text-foreground">
                          Show vehicle image on card
                        </p>
                        <p className="text-[11px] leading-snug text-muted-foreground">
                          When off, the vehicle strip is hidden on the coupon
                          only.
                        </p>
                      </div>
                      <Switch
                        checked={draft.visual.showVehicleOnCoupon !== false}
                        onCheckedChange={(checked) =>
                          updateVisual({ showVehicleOnCoupon: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BuilderBlock>

          <BuilderBlock
            title="Offer"
            description="Internal name and economics shown on the coupon. Customers see the value line and copy you set later."
          >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="coupon-title">Internal Name</Label>
              <Input
                id="coupon-title"
                value={draft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Offer Type</Label>
              <Select
                value={draft.type}
                onValueChange={(value) =>
                  updateDraft({ type: value as OfferType })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{offerTypeTitle(draft.type)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {OFFER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {offerTypeTitle(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {draft.type === "fixed-discount" ? (
            <div className="space-y-2">
              <Label htmlFor="coupon-dollars">Discount ($)</Label>
              <Input
                id="coupon-dollars"
                inputMode="decimal"
                placeholder="25"
                value={dollarString}
                onChange={(e) => {
                  const n = parseFloat(e.target.value);
                  if (Number.isNaN(n) || n < 0) {
                    updateDraft({ discountCents: undefined });
                    return;
                  }
                  updateDraft({ discountCents: Math.round(n * 100) });
                }}
              />
            </div>
          ) : null}

          {draft.type === "percentage-discount" ? (
            <div className="space-y-2">
              <Label htmlFor="coupon-pct">Discount (%)</Label>
              <Input
                id="coupon-pct"
                inputMode="numeric"
                placeholder="15"
                value={draft.discountPercent ?? ""}
                onChange={(e) => {
                  const n = parseInt(e.target.value, 10);
                  if (Number.isNaN(n) || n < 0 || n > 100) {
                    updateDraft({ discountPercent: undefined });
                    return;
                  }
                  updateDraft({ discountPercent: n });
                }}
              />
            </div>
          ) : null}

          {draft.type !== "fixed-discount" &&
          draft.type !== "percentage-discount" ? (
            <div className="space-y-2">
              <Label htmlFor="coupon-value-label">Value Label</Label>
              <Input
                id="coupon-value-label"
                value={draft.valueLabel}
                onChange={(e) =>
                  updateDraft({ valueLabel: e.target.value })
                }
              />
            </div>
          ) : null}
          </BuilderBlock>

          <BuilderBlock
            title="Validity, Limits & Conditions"
            description="Control how long the offer lasts, redemption caps, and optional eligibility filters."
          >
          <div className="space-y-6">
          <div className="space-y-4 rounded-lg border border-border/80 bg-muted/25 p-5 sm:p-6">
            <p className="text-sm font-medium text-foreground">Expiration</p>
            <div className="flex flex-wrap gap-5">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <input
                  type="radio"
                  name="exp-mode"
                  className="size-4 accent-primary"
                  checked={draft.rules.expirationMode === "relative"}
                  onChange={() =>
                    updateRules({ expirationMode: "relative" })
                  }
                />
                Days From Send
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
                <input
                  type="radio"
                  name="exp-mode"
                  className="size-4 accent-primary"
                  checked={draft.rules.expirationMode === "fixed"}
                  onChange={() => {
                    const day =
                      draft.rules.expiresAt?.slice(0, 10) ??
                      DEFAULT_FIXED_EXPIRY_DATE_INPUT;
                    updateRules({
                      expirationMode: "fixed",
                      expiresAt: `${day}T23:59:59.000Z`,
                    });
                  }}
                />
                Fixed Date
              </label>
            </div>
            {draft.rules.expirationMode === "relative" ? (
              <div className="space-y-2">
                <Label htmlFor="coupon-days">Days Valid</Label>
                <Input
                  id="coupon-days"
                  type="number"
                  min={1}
                  max={365}
                  value={draft.rules.expirationDays}
                  onChange={(e) => {
                    const n = parseInt(e.target.value, 10);
                    if (Number.isNaN(n)) return;
                    updateRules({ expirationDays: Math.min(365, Math.max(1, n)) });
                    updateDraft({ expirationDays: Math.min(365, Math.max(1, n)) });
                  }}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="coupon-expires">Expires On</Label>
                <Input
                  id="coupon-expires"
                  type="date"
                  value={
                    draft.rules.expiresAt?.slice(0, 10) ??
                    DEFAULT_FIXED_EXPIRY_DATE_INPUT
                  }
                  onChange={(e) =>
                    updateRules({
                      expiresAt: e.target.value
                        ? `${e.target.value}T23:59:59.000Z`
                        : undefined,
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              Redemption Limits (Optional)
            </p>
            <p className="text-xs text-muted-foreground">
              Leave blank for no cap. Totals apply across all redemptions of this design.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Total Cap
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="∞"
                  value={draft.rules.maxRedemptionsTotal ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateRules({
                      maxRedemptionsTotal:
                        v === "" ? undefined : parseInt(v, 10),
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Per Customer
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="∞"
                  value={draft.rules.maxRedemptionsPerCustomer ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateRules({
                      maxRedemptionsPerCustomer:
                        v === "" ? undefined : parseInt(v, 10),
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Per Day
                </Label>
                <Input
                  type="number"
                  min={0}
                  placeholder="∞"
                  value={draft.rules.maxRedemptionsPerDay ?? ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateRules({
                      maxRedemptionsPerDay:
                        v === "" ? undefined : parseInt(v, 10),
                    });
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Conditions</p>
            <p className="text-xs text-muted-foreground">
              Toggle rules that must be true for a customer to use this offer.
            </p>
            <div className="flex flex-wrap gap-2">
              {COUPON_CONDITION_OPTIONS.map((opt) => {
                const sample = opt.create();
                const active = draft.rules.conditions.some((c) =>
                  conditionsEqual(c, sample),
                );
                return (
                  <Button
                    key={opt.id}
                    type="button"
                    size="2xs"
                    variant={active ? "default" : "outline"}
                    onClick={() => toggleCondition(opt.create)}
                  >
                    {opt.label}
                  </Button>
                );
              })}
            </div>
            {draft.rules.conditions.length > 0 ? (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {draft.rules.conditions.map((c, i) => (
                  <li key={i}>• {conditionRuleLabel(c)}</li>
                ))}
              </ul>
            ) : null}
          </div>
          </div>
          </BuilderBlock>
                      </>
                    ) : (
                      <>
          <BuilderBlock
            title="Customer-Facing Copy"
            description="Headline, supporting text, and button label as they appear on the coupon and in message previews."
          >
            <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-headline">Headline</Label>
              <Input
                id="coupon-headline"
                value={draft.visual.headline}
                onChange={(e) => updateVisual({ headline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-sub">Subtext</Label>
              <Textarea
                id="coupon-sub"
                rows={2}
                value={draft.visual.subheadline}
                onChange={(e) =>
                  updateVisual({ subheadline: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-cta">Call To Action</Label>
              <Input
                id="coupon-cta"
                value={draft.visual.ctaLabel}
                onChange={(e) => updateVisual({ ctaLabel: e.target.value })}
              />
            </div>
            </div>
          </BuilderBlock>

          <BuilderBlock
            title="Appearance"
            description="Badge, accent, corners, and logo source (account default vs custom upload or URL). Show/hide logo and vehicle on the card is set in Basics."
          >
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Badge</Label>
              <CouponBadgeKindPicker
                value={draft.visual.badge}
                onChange={(badge) => updateVisual({ badge })}
              />
            </div>
            {draft.visual.badge === "custom" ? (
              <div className="space-y-2">
                <Label htmlFor="coupon-custom-badge">Custom Badge</Label>
                <Input
                  id="coupon-custom-badge"
                  value={draft.visual.customBadgeLabel ?? ""}
                  onChange={(e) =>
                    updateVisual({ customBadgeLabel: e.target.value })
                  }
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>Accent</Label>
              <CouponAccentPresetPicker
                value={draft.visual.accentPreset}
                onChange={(accentPreset) => updateVisual({ accentPreset })}
              />
            </div>

            <div className="space-y-2">
              <Label>Corners</Label>
              <CouponCornerStylePicker
                value={draft.visual.cornerStyle}
                onChange={(cornerStyle) => updateVisual({ cornerStyle })}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo On Coupon</Label>
              <Select
                value={couponLogoFromAccount ? "account" : "custom"}
                onValueChange={handleCouponLogoMode}
              >
                <SelectTrigger className="max-w-md">
                  <SelectValue>
                    {couponLogoFromAccount
                      ? "Account Default"
                      : "Custom Upload Or URL"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Account Default</SelectItem>
                  <SelectItem value="custom">Custom Upload Or URL</SelectItem>
                </SelectContent>
              </Select>
            </div>

          {!couponLogoFromAccount ? (
            <div className="space-y-3 rounded-lg border border-border/80 bg-muted/15 p-4 sm:p-5">
              <Label htmlFor="coupon-logo-url">Logo URL (Optional)</Label>
              <Input
                id="coupon-logo-url"
                placeholder="https://…"
                value={draft.visual.logoUrl ?? ""}
                onChange={(e) => {
                  const v = e.target.value.trim();
                  updateVisual({ logoUrl: v || undefined });
                }}
              />
              <Label className="text-xs text-muted-foreground">
                Or Upload Image
              </Label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-xs file:mr-2 file:rounded-sm file:border file:border-border file:bg-muted file:px-2 file:py-1"
                onChange={handleLogoFile}
              />
            </div>
          ) : null}
          </div>
          </BuilderBlock>

          <BuilderBlock
            title="Optional Enhancements"
            description="Add a short urgency line on the card when you want to highlight scarcity or a deadline."
          >
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border/80 bg-card px-4 py-4 sm:px-5">
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-foreground">Urgency Line</p>
              <p className="text-xs text-muted-foreground">
                Short hint shown on the coupon card.
              </p>
            </div>
            <Switch
              checked={draft.visual.showUrgencyLine ?? false}
              onCheckedChange={(checked) =>
                updateVisual({ showUrgencyLine: checked })
              }
            />
          </div>
          {draft.visual.showUrgencyLine ? (
            <div className="space-y-2 pt-2">
              <Label htmlFor="coupon-urgency">Urgency Text</Label>
              <Input
                id="coupon-urgency"
                value={draft.visual.urgencyLine ?? ""}
                onChange={(e) =>
                  updateVisual({ urgencyLine: e.target.value })
                }
              />
            </div>
          ) : null}
          </BuilderBlock>

          <BuilderBlock
            title="Channel & Legal"
            description="Summaries for SMS and compliance reviewers. Shown in the wizard and exports, not on the visual card."
          >
            <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coupon-safe">Channel-Safe Summary</Label>
            <Textarea
              id="coupon-safe"
              rows={2}
              value={draft.channelSafeCopy}
              onChange={(e) =>
                updateDraft({ channelSafeCopy: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coupon-legal">Compliance Note</Label>
            <Textarea
              id="coupon-legal"
              rows={2}
              value={draft.legalComplianceNote}
              onChange={(e) =>
                updateDraft({ legalComplianceNote: e.target.value })
              }
            />
          </div>
            </div>
          </BuilderBlock>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {builderStep === 0 || builderStep === 1 ? (
              <aside
                className="flex max-h-full flex-col gap-6 overflow-y-auto border-t border-border/80 bg-muted/10 p-6 sm:p-8 lg:border-l lg:border-t-0"
                aria-label="Coupon card preview"
              >
                <div className="space-y-1">
                  <p className="text-base font-medium text-foreground">Live preview</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {builderStep === 0
                      ? "Template, offer value, and branding update the card as you go."
                      : "Card updates as you edit copy and appearance."}
                  </p>
                </div>
                <div className="rounded-lg border border-border/80 bg-background p-3 shadow-sm sm:p-4">
                  <CouponCardPreview
                    offer={previewOffer}
                    dealershipDisplayName={dealershipDisplayName}
                  />
                </div>
              </aside>
            ) : null}
          </div>
        ) : (
          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden border-border/60 bg-muted/10"
            aria-labelledby="coupon-builder-step-label"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
              <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
                Review the coupon card and how it appears in SMS and email. Push and
                in-app are not shown here.
              </p>
              <Tabs
                value={reviewSubTab}
                onValueChange={(value) => setReviewSubTab(Number(value) as 0 | 1 | 2)}
              >
                <TabsList className="mb-6 grid h-auto w-full max-w-xl grid-cols-3 gap-1 p-1">
                  <TabsTrigger value={0}>Coupon card</TabsTrigger>
                  <TabsTrigger value={1}>SMS</TabsTrigger>
                  <TabsTrigger value={2}>Email</TabsTrigger>
                </TabsList>
                <TabsContent value={0} className="flex justify-center pt-2">
                  <div className="w-full max-w-md rounded-lg border border-border/80 bg-background p-3 shadow-sm sm:p-4">
                    <CouponCardPreview
                      offer={previewOffer}
                      dealershipDisplayName={dealershipDisplayName}
                    />
                  </div>
                </TabsContent>
                <TabsContent value={1} className="pt-2">
                  <DevicePreview
                    key="coupon-review-sms"
                    subject={COUPON_PREVIEW_MESSAGE_SUBJECT}
                    body={COUPON_PREVIEW_MESSAGE_BODY}
                    images={[]}
                    previewChannel="sms"
                    onChannelChange={() => {}}
                    attachedOffer={previewOffer}
                    dealershipDisplayName={dealershipDisplayName}
                    allowedChannels={["sms", "email"]}
                    showChannelTabs={false}
                  />
                </TabsContent>
                <TabsContent value={2} className="pt-2">
                  <DevicePreview
                    key="coupon-review-email"
                    subject={COUPON_PREVIEW_MESSAGE_SUBJECT}
                    body={COUPON_PREVIEW_MESSAGE_BODY}
                    images={[]}
                    previewChannel="email"
                    onChannelChange={() => {}}
                    attachedOffer={previewOffer}
                    dealershipDisplayName={dealershipDisplayName}
                    allowedChannels={["sms", "email"]}
                    showChannelTabs={false}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </form>

      <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/80 px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {builderStep === 0 && onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          {builderStep > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleWizardBack}
              leadingIcon={<ArrowLeft className="size-4" />}
            >
              Back
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!isLastWizardStep ? (
            <Button
              type="button"
              onClick={handleWizardContinue}
              trailingIcon={<ArrowRight className="size-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button type="submit" form={formId}>
              Save Coupon
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
