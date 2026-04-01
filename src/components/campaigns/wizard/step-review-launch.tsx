"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Target,
  Users,
  Zap,
  MessageSquare,
  Radio,
  Rocket,
  TrendingUp,
  Pencil,
  Calendar,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { CouponCardPreview } from "@/components/campaigns/coupon-builder";
import { DevicePreview, type DevicePreviewChannel } from "./device-preview";
import type { WizardFormData } from "../campaign-wizard";
import {
  TRIGGER_TYPE_META,
  CHANNEL_META,
  PERSONALIZATION_VARIABLE_LABELS,
  RECOMMENDED_SEND_WINDOWS,
  getCapacityHint,
} from "@/lib/campaigns/mock-data";
import type { ImageAttachment } from "@/lib/campaigns/types";
import { summarizeSequenceLogic } from "@/lib/campaigns/workflow";

const MOCK_PREVIEW_VALUES: Record<string, string> = {
  customer_name: "Sarah Johnson",
  vehicle_model: "RAV4",
  vehicle_year: "2024",
  vehicle_make: "Toyota",
  vehicle_trim: "XLE",
  mileage: "29,500",
  next_service_due: "April 15, 2026",
  battery_health: "38",
  last_service_date: "October 2, 2025",
  dealership_name: "AutoNation Toyota",
  service_director_name: "Joe",
};

function useAnimatedNumber(target: number, durationMs: number = 1000) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, durationMs]);

  return value;
}

function toDatetimeLocal(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function fromDatetimeLocal(local: string): string {
  if (!local) return "";
  return new Date(local).toISOString();
}

interface StepReviewLaunchProps {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onLaunch: () => void;
  onGoToStep: (step: number) => void;
}

export function StepReviewLaunch({
  formData,
  onUpdate,
  onLaunch,
  onGoToStep,
}: StepReviewLaunchProps) {
  const [previewChannel, setPreviewChannel] =
    useState<DevicePreviewChannel>("sms");

  const enabledChannels = formData.channels.filter((c) => c.isEnabled);
  const totalReach = enabledChannels.reduce(
    (sum, c) => sum + c.estimatedReach,
    0,
  );
  const totalReachWithConsent = enabledChannels.reduce(
    (sum, c) => sum + (c.estimatedReachWithConsent ?? c.estimatedReach),
    0,
  );
  const useConsentReach = enabledChannels.some(
    (c) => c.estimatedReachWithConsent != null,
  );
  const reachForEstimator = useConsentReach ? totalReachWithConsent : totalReach;

  const estimatedConversionRate = 0.082;
  const estimatedAppointments = Math.round(
    reachForEstimator * estimatedConversionRate,
  );
  const estimatedRevenue = Math.round(
    reachForEstimator * estimatedConversionRate * 40,
  );

  const animatedReach = useAnimatedNumber(reachForEstimator);
  const animatedAppointments = useAnimatedNumber(estimatedAppointments, 1200);
  const animatedRevenue = useAnimatedNumber(estimatedRevenue, 1400);

  const launchMode = formData.scheduledAt ? "scheduled" : "now";
  const capacityHint = getCapacityHint();
  const compliance = formData.complianceChecklist;
  const allComplianceChecked =
    compliance.consentConfirmed &&
    compliance.optOutIncluded &&
    compliance.identityIncluded;
  const sequenceSummaryData = summarizeSequenceLogic(
    formData.sequenceLogic,
    formData.offers,
    formData.messages,
  );
  const validationErrors = Array.from(
    new Set([
      ...(formData.sequenceLogic?.validationErrors ?? []),
      ...(formData.workflow?.validationErrors ?? []),
    ]),
  );
  const hasWorkflowErrors = validationErrors.length > 0;

  const setLaunchMode = useCallback(
    (mode: "now" | "scheduled") => {
      if (mode === "now") {
        onUpdate({ scheduledAt: undefined, scheduledEndAt: undefined });
      } else if (mode === "scheduled") {
        const start = new Date();
        start.setDate(start.getDate() + 1);
        start.setHours(9, 0, 0, 0);
        onUpdate({
          scheduledAt: start.toISOString(),
          scheduledEndAt: undefined,
        });
      }
    },
    [onUpdate],
  );

  const setScheduledAt = useCallback(
    (value: string) => {
      onUpdate({
        scheduledAt: value ? fromDatetimeLocal(value) : undefined,
      });
    },
    [onUpdate],
  );

  const setPreferredSendWindow = useCallback(
    (windowId: string | null) => {
      if (!windowId) {
        onUpdate({ preferredSendWindow: undefined });
        return;
      }
      const win = RECOMMENDED_SEND_WINDOWS.find((w) => w.id === windowId);
      if (win) {
        onUpdate({
          preferredSendWindow: {
            startHour: win.startHour,
            endHour: win.endHour,
          },
        });
      } else {
        onUpdate({ preferredSendWindow: undefined });
      }
    },
    [onUpdate],
  );

  const setCompliance = useCallback(
    (key: keyof typeof compliance, checked: boolean) => {
      onUpdate({
        complianceChecklist: { ...compliance, [key]: checked },
      });
    },
    [compliance, onUpdate],
  );

  const messages = formData.messages;
  const firstMessage = messages[0];
  const hasSequence = messages.length > 1;
  const sequenceSummary =
    hasSequence &&
    messages
      .map((m, i) => (m.delayDays != null ? `Day ${m.delayDays}` : `Message ${i + 1}`))
      .join(", ");

  const previewBody = (firstMessage?.body ?? "").replace(
    /\{\{(\w+)\}\}/g,
    (_, variable: string) => MOCK_PREVIEW_VALUES[variable] ?? `[${variable}]`,
  );

  const previewSubject = (firstMessage?.subject ?? "").replace(
    /\{\{(\w+)\}\}/g,
    (_, variable: string) => MOCK_PREVIEW_VALUES[variable] ?? `[${variable}]`,
  );

  const images: ImageAttachment[] = firstMessage?.images ?? [];
  const reviewAttachedOffer =
    firstMessage?.offerId != null
      ? formData.offers.find((o) => o.id === firstMessage.offerId)
      : undefined;
  const reviewCouponReferenceMissing =
    firstMessage?.offerId != null && reviewAttachedOffer == null;

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="mb-6">
        <h3 className="text-sm font-medium">Review & Launch</h3>
        <p className="text-sm text-muted-foreground">
          Review your campaign settings before launching
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Revenue Impact Estimator */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <h4 className="text-sm font-medium">
                  Revenue Impact Estimator
                </h4>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-sm bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Estimated Reach
                  </p>
                  <p className="font-headline text-2xl font-semibold">
                    {animatedReach.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">customers</p>
                </div>
                <div className="rounded-sm bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Expected Conversion
                  </p>
                  <p className="font-headline text-2xl font-semibold">
                    {(estimatedConversionRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ~{animatedAppointments} appointments
                  </p>
                </div>
                <div className="rounded-sm bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    Expected Revenue
                  </p>
                  <p className="font-headline text-2xl font-semibold text-primary">
                    ${animatedRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">projected</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Setup */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Campaign Setup</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="2xs"
                  onClick={() => onGoToStep(0)}
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="font-medium">
                    {formData.name || "Untitled Campaign"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="font-medium capitalize">
                    {formData.type.replace(/-/g, " ")}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Audience & Trigger */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Audience & Trigger</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="2xs"
                  onClick={() => onGoToStep(1)}
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Rules</dt>
                  <dd className="font-medium">
                    {formData.audienceSegments.length} rule
                    {formData.audienceSegments.length !== 1 ? "s" : ""}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Estimated size</dt>
                  <dd className="font-medium">
                    {formData.audienceSize > 0
                      ? `${formData.audienceSize.toLocaleString()} customers`
                      : "Not estimated"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="flex items-center gap-1 text-muted-foreground">
                    <Zap className="size-3" />
                    Trigger
                  </dt>
                  <dd className="font-medium">
                    {TRIGGER_TYPE_META[formData.trigger.type]?.label ??
                      formData.trigger.type}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Recurring</dt>
                  <dd className="font-medium">
                    {formData.trigger.isRecurring ? "Yes" : "No"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Messages</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="2xs"
                  onClick={() => onGoToStep(2)}
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {hasSequence && sequenceSummary && (
                  <p className="font-medium text-muted-foreground">
                    {messages.length} messages: {sequenceSummary}
                  </p>
                )}
                {firstMessage?.subject && (
                  <div>
                    <p className="text-muted-foreground">Subject</p>
                    <p className="font-medium">{firstMessage.subject}</p>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-muted-foreground">
                    {hasSequence ? "First message body" : "Body"}
                  </p>
                  <div className="line-clamp-3 whitespace-pre-wrap rounded-sm bg-muted/50 p-2 text-xs">
                    {firstMessage?.body || (
                      <span className="italic text-muted-foreground">
                        No message set
                      </span>
                    )}
                  </div>
                </div>
                {(firstMessage?.variables?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {firstMessage!.variables.map((v) => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {PERSONALIZATION_VARIABLE_LABELS[v]}
                      </Badge>
                    ))}
                  </div>
                )}
                {reviewCouponReferenceMissing ? (
                  <div
                    className="rounded-sm border border-destructive/35 bg-destructive/5 p-2 text-xs text-destructive"
                    role="alert"
                  >
                    This message references a coupon that is not in the
                    campaign library. Go back to the Messages step to attach a
                    valid coupon or clear the attachment.
                  </div>
                ) : null}
                {reviewAttachedOffer ? (
                  <div className="space-y-1.5">
                    <p className="text-muted-foreground">Attached coupon</p>
                    <div className="max-w-[260px]">
                      <CouponCardPreview
                        offer={reviewAttachedOffer}
                        compact
                        dealershipDisplayName={
                          MOCK_PREVIEW_VALUES.dealership_name
                        }
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {reviewAttachedOffer.title} ·{" "}
                      {reviewAttachedOffer.valueLabel}
                    </p>
                  </div>
                ) : null}
                <Separator />
                <div>
                  <div className="mb-1.5 flex items-center gap-1 text-muted-foreground">
                    <Radio className="size-3" />
                    <span>Channels</span>
                  </div>
                  {enabledChannels.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {enabledChannels.map((ch) => (
                        <Badge key={ch.channel} variant="outline">
                          {CHANNEL_META[ch.channel]?.label ?? ch.channel}
                          <span className="ml-1 text-muted-foreground">
                            ~{ch.estimatedReach.toLocaleString()}
                            {ch.estimatedReachWithConsent != null && (
                              <span className="text-muted-foreground/80">
                                {" "}({ch.estimatedReachWithConsent.toLocaleString()} w/ consent)
                              </span>
                            )}
                          </span>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">
                      No channels selected
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Sequence Logic</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="2xs"
                  onClick={() => onGoToStep(3)}
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-sm bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Logic preset</p>
                  <p className="font-medium">
                    {formData.sequenceLogic?.presetId
                      ? formData.sequenceLogic.presetId.replace(/-/g, " ")
                      : "Custom sequence"}
                  </p>
                </div>
                <div className="rounded-sm bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Primary goal</p>
                  <p className="font-medium">{formData.campaignGoal.label}</p>
                </div>
              </div>

              <div>
                <p className="mb-1 text-muted-foreground">Message schedule</p>
                {sequenceSummaryData.messageSchedule.length > 0 ? (
                  <div className="space-y-1">
                    {sequenceSummaryData.messageSchedule.map((rule) => (
                      <p key={rule} className="text-xs">
                        {rule}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    No messages configured
                  </p>
                )}
              </div>

              <div>
                <p className="mb-1 text-muted-foreground">Response rules</p>
                {sequenceSummaryData.branchRules.length > 0 ? (
                  <div className="space-y-1">
                    {sequenceSummaryData.branchRules.map((rule) => (
                      <p key={rule} className="text-xs">
                        {rule}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    No branching rules configured
                  </p>
                )}
              </div>

              <div>
                <p className="mb-1 text-muted-foreground">Offer escalation</p>
                {sequenceSummaryData.offerRules.length > 0 ? (
                  <div className="space-y-1">
                    {sequenceSummaryData.offerRules.map((offer) => (
                      <p key={offer} className="text-xs">
                        {offer}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    No offer escalation configured
                  </p>
                )}
              </div>

              <div>
                <p className="mb-1 text-muted-foreground">Stop conditions</p>
                {sequenceSummaryData.stopRules.length > 0 ? (
                  <div className="space-y-1">
                    {sequenceSummaryData.stopRules.map((step) => (
                      <p key={step} className="text-xs">
                        {step}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-muted-foreground">
                    The campaign continues unless a rule stops it.
                  </p>
                )}
              </div>

              {hasWorkflowErrors && (
                <div className="rounded-sm border border-amber-300/40 bg-amber-500/10 p-3">
                  <p className="mb-1 text-xs font-medium">Sequence logic needs attention</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {validationErrors.map((error) => (
                      <p key={error}>{error}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* When to launch & Send time */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">When to launch</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="launchMode"
                    checked={launchMode === "now"}
                    onChange={() => setLaunchMode("now")}
                    className="rounded-full border-input"
                  />
                  <span className="text-sm font-medium">Launch now</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="launchMode"
                    checked={launchMode === "scheduled"}
                    onChange={() => setLaunchMode("scheduled")}
                    className="rounded-full border-input"
                  />
                  <span className="text-sm font-medium">Schedule for later</span>
                </label>
              </div>
              {launchMode === "scheduled" && formData.scheduledAt && (
                <div className="space-y-2">
                  <Label className="text-xs">Start date & time</Label>
                  <input
                    type="datetime-local"
                    value={toDatetimeLocal(formData.scheduledAt)}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="flex h-8 w-full rounded-sm border border-input bg-transparent px-2.5 text-sm"
                  />
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-muted-foreground" />
                  <Label className="text-xs">Recommended send window</Label>
                </div>
                <Select
                  value={
                    formData.preferredSendWindow
                      ? RECOMMENDED_SEND_WINDOWS.find(
                          (w) =>
                            w.startHour === formData.preferredSendWindow!.startHour &&
                            w.endHour === formData.preferredSendWindow!.endHour,
                        )?.id ?? ""
                      : ""
                  }
                  onValueChange={setPreferredSendWindow}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select send window" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECOMMENDED_SEND_WINDOWS.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Shop capacity:{" "}
                  <span className="font-medium capitalize">{capacityHint}</span>
                  {capacityHint === "high" &&
                    " — consider spreading sends across the day"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compliance checklist (TCPA/CTA) */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">Compliance (TCPA/CTA)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={compliance.consentConfirmed}
                  onCheckedChange={(checked) =>
                    setCompliance("consentConfirmed", checked === true)
                  }
                />
                <span className="text-sm">
                  I confirm we have consent to contact this audience for this
                  purpose (TCPA/CTA).
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={compliance.optOutIncluded}
                  onCheckedChange={(checked) =>
                    setCompliance("optOutIncluded", checked === true)
                  }
                />
                <span className="text-sm">
                  Message(s) include opt-out instructions where required.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <Checkbox
                  checked={compliance.identityIncluded}
                  onCheckedChange={(checked) =>
                    setCompliance("identityIncluded", checked === true)
                  }
                />
                <span className="text-sm">
                  Message(s) include dealership identity where required.
                </span>
              </label>
              {!allComplianceChecked && (
                <p className="text-xs text-muted-foreground">
                  Complete all items above before launching.
                </p>
              )}
              {hasWorkflowErrors && (
                <p className="text-xs text-muted-foreground">
                  Resolve sequence logic validation issues before launching.
                </p>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Launch */}
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger>
                <Button
                  size="lg"
                  disabled={!allComplianceChecked || hasWorkflowErrors}
                >
                  <Rocket className="size-4" />
                  {launchMode === "scheduled" ? "Schedule Campaign" : "Launch Campaign"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {launchMode === "scheduled"
                      ? "Schedule Campaign?"
                      : "Launch Campaign?"}
                  </DialogTitle>
                  <DialogDescription>
                    {launchMode === "scheduled" ? (
                      <>
                        &ldquo;{formData.name || "Untitled Campaign"}&rdquo;
                        will start at the scheduled time and target{" "}
                        {reachForEstimator.toLocaleString()} customers across{" "}
                        {enabledChannels.length} channel
                        {enabledChannels.length !== 1 ? "s" : ""}.
                      </>
                    ) : (
                      <>
                        This will activate &ldquo;
                        {formData.name || "Untitled Campaign"}&rdquo; and begin
                        targeting {reachForEstimator.toLocaleString()} customers
                        across {enabledChannels.length} channel
                        {enabledChannels.length !== 1 ? "s" : ""}.
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={onLaunch}>
                    <Rocket className="size-4" />
                    {launchMode === "scheduled"
                      ? "Confirm Schedule"
                      : "Confirm Launch"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Right Column – Device Preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <DevicePreview
            subject={previewSubject}
            body={previewBody}
            images={images}
            previewChannel={previewChannel}
            onChannelChange={setPreviewChannel}
            attachedOffer={reviewAttachedOffer}
            dealershipDisplayName={MOCK_PREVIEW_VALUES.dealership_name}
          />
        </div>
      </div>
    </div>
  );
}
