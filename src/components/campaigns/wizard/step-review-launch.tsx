"use client";

import { useEffect, useState } from "react";
import {
  Target,
  Users,
  Zap,
  MessageSquare,
  Radio,
  Rocket,
  TrendingUp,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { DevicePreview } from "./device-preview";
import type { WizardFormData } from "../campaign-wizard";
import {
  TRIGGER_TYPE_META,
  CHANNEL_META,
  PERSONALIZATION_VARIABLE_LABELS,
} from "@/lib/campaigns/mock-data";
import type { ImageAttachment } from "@/lib/campaigns/types";

const MOCK_PREVIEW_VALUES: Record<string, string> = {
  customer_name: "Sarah Johnson",
  vehicle_model: "RAV4",
  vehicle_year: "2024",
  vehicle_make: "Toyota",
  mileage: "29,500",
  next_service_due: "April 15, 2026",
  battery_health: "38",
  last_service_date: "October 2, 2025",
  dealership_name: "AutoNation Toyota",
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

interface StepReviewLaunchProps {
  formData: WizardFormData;
  onLaunch: () => void;
  onGoToStep: (step: number) => void;
}

export function StepReviewLaunch({
  formData,
  onLaunch,
  onGoToStep,
}: StepReviewLaunchProps) {
  const [previewChannel, setPreviewChannel] = useState<
    "sms" | "email" | "push"
  >("sms");

  const enabledChannels = formData.channels.filter((c) => c.isEnabled);
  const totalReach = enabledChannels.reduce(
    (sum, c) => sum + c.estimatedReach,
    0,
  );
  const estimatedConversionRate = 0.082;
  const estimatedAppointments = Math.round(
    totalReach * estimatedConversionRate,
  );
  const estimatedRevenue = Math.round(
    totalReach * estimatedConversionRate * 40,
  );

  const animatedReach = useAnimatedNumber(totalReach);
  const animatedAppointments = useAnimatedNumber(estimatedAppointments, 1200);
  const animatedRevenue = useAnimatedNumber(estimatedRevenue, 1400);

  const previewBody = formData.message.body.replace(
    /\{\{(\w+)\}\}/g,
    (_, variable: string) => MOCK_PREVIEW_VALUES[variable] ?? `[${variable}]`,
  );

  const previewSubject = formData.message.subject.replace(
    /\{\{(\w+)\}\}/g,
    (_, variable: string) => MOCK_PREVIEW_VALUES[variable] ?? `[${variable}]`,
  );

  const images: ImageAttachment[] = formData.message.images ?? [];

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
          <Card size="sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Campaign Setup</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
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

          {/* Audience & Triggers */}
          <Card size="sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm">
                    Audience & Triggers
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
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

          {/* Message & Channels */}
          <Card size="sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm">
                    Message & Channels
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onGoToStep(2)}
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {formData.message.subject && (
                  <div>
                    <p className="text-muted-foreground">Subject</p>
                    <p className="font-medium">{formData.message.subject}</p>
                  </div>
                )}
                <div>
                  <p className="mb-1 text-muted-foreground">Body</p>
                  <div className="line-clamp-3 whitespace-pre-wrap rounded-sm bg-muted/50 p-2 text-xs">
                    {formData.message.body || (
                      <span className="italic text-muted-foreground">
                        No message set
                      </span>
                    )}
                  </div>
                </div>
                {formData.message.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.message.variables.map((v) => (
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

          <Separator />

          {/* Launch */}
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger render={<Button size="lg" />}>
                <Rocket className="size-4" />
                Launch Campaign
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Launch Campaign?</DialogTitle>
                  <DialogDescription>
                    This will activate &ldquo;
                    {formData.name || "Untitled Campaign"}&rdquo; and begin
                    targeting {totalReach.toLocaleString()} customers across{" "}
                    {enabledChannels.length} channel
                    {enabledChannels.length !== 1 ? "s" : ""}.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button onClick={onLaunch}>
                    <Rocket className="size-4" />
                    Confirm Launch
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
          />
        </div>
      </div>
    </div>
  );
}
