"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Sparkles,
  Variable,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DevicePreview } from "./device-preview";
import { ImageUpload } from "./image-upload";
import type { WizardFormData } from "../campaign-wizard";
import {
  PERSONALIZATION_VARIABLES,
  PERSONALIZATION_VARIABLE_LABELS,
  CHANNEL_META,
} from "@/lib/campaigns/mock-data";
import type {
  Channel,
  ChannelConfig,
  PersonalizationVariable,
  ImageAttachment,
} from "@/lib/campaigns/types";

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

const CHANNEL_ICONS: Record<Channel, React.ReactNode> = {
  sms: <MessageSquare className="size-5" />,
  email: <Mail className="size-5" />,
  push: <Bell className="size-5" />,
  "in-app": <Smartphone className="size-5" />,
};

const ALL_CHANNELS: Channel[] = ["sms", "email", "push", "in-app"];

interface StepMessageChannelsProps {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
}

export function StepMessageChannels({
  formData,
  onUpdate,
}: StepMessageChannelsProps) {
  const [isSmartEnabled, setIsSmartEnabled] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [previewChannel, setPreviewChannel] = useState<
    "sms" | "email" | "push"
  >("sms");

  const variableDropdownRef = useRef<HTMLDivElement>(null);
  const variableButtonRef = useRef<HTMLButtonElement>(null);

  const { message, channels } = formData;
  const images: ImageAttachment[] = message.images ?? [];

  useEffect(() => {
    if (!showVariables) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        variableDropdownRef.current &&
        !variableDropdownRef.current.contains(target) &&
        variableButtonRef.current &&
        !variableButtonRef.current.contains(target)
      ) {
        setShowVariables(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showVariables]);

  // --- Channel helpers ---

  const toggleChannel = useCallback(
    (channel: Channel) => {
      const existing = channels.find((c) => c.channel === channel);
      let updated: ChannelConfig[];

      if (existing) {
        updated = channels.map((c) =>
          c.channel === channel ? { ...c, isEnabled: !c.isEnabled } : c,
        );
      } else {
        updated = [
          ...channels,
          {
            channel,
            isEnabled: true,
            estimatedReach: CHANNEL_META[channel].baseReach,
          },
        ];
      }
      onUpdate({ channels: updated });
    },
    [channels, onUpdate],
  );

  const isChannelEnabled = (channel: Channel): boolean =>
    channels.some((c) => c.channel === channel && c.isEnabled);

  const totalReach = channels
    .filter((c) => c.isEnabled)
    .reduce((sum, c) => sum + c.estimatedReach, 0);

  // --- Message helpers ---

  const updateMessage = useCallback(
    (updates: Partial<typeof message>) => {
      const merged = { ...message, ...updates };
      const detectedVars = PERSONALIZATION_VARIABLES.filter((v) =>
        merged.body.includes(`{{${v}}}`),
      ) as PersonalizationVariable[];

      onUpdate({
        message: { ...merged, variables: detectedVars, images },
      });
    },
    [message, images, onUpdate],
  );

  const insertVariable = useCallback(
    (variable: string) => {
      const insertion = `{{${variable}}}`;
      updateMessage({ body: message.body + insertion });
      setShowVariables(false);
    },
    [message.body, updateMessage],
  );

  const handleImagesChange = useCallback(
    (nextImages: ImageAttachment[]) => {
      onUpdate({ message: { ...message, images: nextImages } });
    },
    [message, onUpdate],
  );

  const handleAiGenerate = useCallback(async () => {
    if (!message.aiPrompt.trim()) return;
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const generatedBody =
      "Hi {{customer_name}}, your {{vehicle_year}} {{vehicle_model}} is approaching its next service milestone at {{mileage}} miles. Our certified technicians are ready to keep your vehicle in peak condition. Book your appointment today and receive a complimentary multi-point inspection!\n\nSchedule now: [Book Service]";

    updateMessage({
      body: generatedBody,
      subject: "Your vehicle service is due",
    });
    setIsGenerating(false);
  }, [message.aiPrompt, updateMessage]);

  const previewBody = message.body.replace(
    /\{\{(\w+)\}\}/g,
    (_, variable: string) => MOCK_PREVIEW_VALUES[variable] ?? `[${variable}]`,
  );

  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ---- Left column: Channels + Message Composer ---- */}
        <div className="space-y-6">
          {/* Channel Selection */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">Channels & Message</h3>
              <p className="text-sm text-muted-foreground">
                Select delivery channels and compose your message
              </p>
            </div>

            {/* Channel chips */}
            <div className="flex flex-wrap gap-2">
              {ALL_CHANNELS.map((channel) => {
                const enabled = isChannelEnabled(channel);
                const meta = CHANNEL_META[channel];
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => toggleChannel(channel)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                      enabled
                        ? "border-primary/30 bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
                      "cursor-pointer",
                    )}
                  >
                    {CHANNEL_ICONS[channel]}
                    {meta.label}
                  </button>
                );
              })}
            </div>

            {/* Smart channel + reach */}
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-sm bg-primary/10">
                  <Sparkles className="size-4 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    Smart Channel Selection
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Auto-optimize based on customer preferences
                  </p>
                </div>
              </div>
              <Switch
                checked={isSmartEnabled}
                onCheckedChange={setIsSmartEnabled}
              />
            </div>

            {totalReach > 0 && (
              <p className="text-xs font-medium text-muted-foreground">
                Estimated total reach:{" "}
                <span className="text-primary">
                  ~{totalReach.toLocaleString()}
                </span>
              </p>
            )}
          </div>

          {/* AI Message Generator */}
          <Card className="group/ai-card transition-colors hover:border-primary/30">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="text-sm font-medium">
                  AI Message Generator
                </span>
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder='e.g., "Create a friendly reminder for customers whose battery health is declining"'
                  value={message.aiPrompt}
                  onChange={(e) => updateMessage({ aiPrompt: e.target.value })}
                  className="min-h-[60px]"
                />
                <Button
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !message.aiPrompt.trim()}
                  size="sm"
                >
                  <Sparkles className="size-3.5" />
                  {isGenerating ? "Generating..." : "Generate Message"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="msg-subject">Subject Line (Email)</Label>
            <Input
              id="msg-subject"
              placeholder="e.g., Your vehicle service is due"
              value={message.subject}
              onChange={(e) => updateMessage({ subject: e.target.value })}
            />
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="msg-body">Message Body</Label>
              <div className="relative">
                <Button
                  ref={variableButtonRef}
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowVariables((prev) => !prev)}
                  aria-expanded={showVariables}
                  aria-haspopup="menu"
                >
                  <Variable className="size-3" />
                  Insert Variable
                </Button>
                {showVariables && (
                  <div
                    ref={variableDropdownRef}
                    role="menu"
                    className="absolute right-0 top-full z-10 mt-1 w-56 rounded-sm border bg-popover p-1 shadow-md"
                  >
                    {PERSONALIZATION_VARIABLES.map((v) => (
                      <button
                        key={v}
                        type="button"
                        role="menuitem"
                        onClick={() => insertVariable(v)}
                        className="flex w-full items-center gap-2 rounded-xs px-2 py-1.5 text-xs transition-colors hover:bg-accent"
                      >
                        <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                          {`{{${v}}}`}
                        </code>
                        <span className="text-muted-foreground">
                          {PERSONALIZATION_VARIABLE_LABELS[v]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Textarea
              id="msg-body"
              placeholder="Write your campaign message here. Use {{variable_name}} for personalization."
              value={message.body}
              onChange={(e) => updateMessage({ body: e.target.value })}
              className="min-h-[160px]"
            />
            {message.variables.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {message.variables.map((v) => (
                  <Badge key={v} variant="secondary" className="text-[10px]">
                    {PERSONALIZATION_VARIABLE_LABELS[v]}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Attach Images</Label>
            <ImageUpload
              images={images}
              onImagesChange={handleImagesChange}
            />
          </div>
        </div>

        {/* ---- Right column: Device Preview ---- */}
        <div className="sticky top-6 self-start">
          <DevicePreview
            subject={message.subject}
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
