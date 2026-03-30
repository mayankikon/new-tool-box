"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Sparkles,
  Variable,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  CheckboxCardGroup,
  CheckboxCardOption,
} from "@/components/ui/checkbox-card";
import {
  DevicePreview,
  type DevicePreviewChannel,
} from "@/components/campaigns/wizard/device-preview";
import { ImageUpload } from "@/components/campaigns/wizard/image-upload";
import type { WizardFormDataV2 } from "../campaign-wizard-v2";
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
  WizardSequenceMessage,
} from "@/lib/campaigns/types";

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

const CHANNEL_ICONS: Record<Channel, React.ReactNode> = {
  sms: <MessageSquare className="size-5" />,
  email: <Mail className="size-5" />,
  push: <Bell className="size-5" />,
  "in-app": <Smartphone className="size-5" />,
};

const ALL_CHANNELS: Channel[] = ["sms", "email", "push", "in-app"];

const DEFAULT_EMPTY_MESSAGE: WizardSequenceMessage = {
  subject: "",
  body: "",
  variables: [],
  aiPrompt: "",
  images: [],
};

interface StepMessageChannelsV2Props {
  formData: WizardFormDataV2;
  onUpdate: (updates: Partial<WizardFormDataV2>) => void;
}

export function StepMessageChannelsV2({
  formData,
  onUpdate,
}: StepMessageChannelsV2Props) {
  const [isSmartEnabled, setIsSmartEnabled] = useState(false);
  const [showVariables, setShowVariables] = useState(false);
  const [previewChannel, setPreviewChannel] =
    useState<DevicePreviewChannel>("sms");

  const variableDropdownRef = useRef<HTMLDivElement>(null);
  const variableButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0);

  const { messages, channels } = formData;
  const hasSequence = messages.length > 1;
  const message = messages[selectedMessageIndex] ?? messages[0];
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

  const enabledChannelValues = channels
    .filter((c) => c.isEnabled)
    .map((c) => c.channel);

  const handleChannelToggle = useCallback(
    (values: string[]) => {
      const updated: ChannelConfig[] = ALL_CHANNELS.map((channel) => {
        const existing = channels.find((c) => c.channel === channel);
        const isEnabled = values.includes(channel);
        const meta = CHANNEL_META[channel];
        return (
          existing
            ? { ...existing, isEnabled }
            : {
                channel,
                isEnabled,
                estimatedReach: meta.baseReach,
                estimatedReachWithConsent: meta.baseReachWithConsent,
              }
        );
      });
      onUpdate({ channels: updated });
    },
    [channels, onUpdate]
  );

  const totalReach = channels
    .filter((c) => c.isEnabled)
    .reduce((sum, c) => sum + c.estimatedReach, 0);

  const totalReachWithConsent = channels
    .filter((c) => c.isEnabled)
    .reduce(
      (sum, c) => sum + (c.estimatedReachWithConsent ?? c.estimatedReach),
      0
    );
  const hasConsentData = channels.some(
    (c) => c.isEnabled && c.estimatedReachWithConsent != null
  );

  const updateMessage = useCallback(
    (updates: Partial<typeof message>) => {
      const idx = selectedMessageIndex;
      const current = messages[idx];
      if (!current) return;
      const merged = { ...current, ...updates };
      const detectedVars = PERSONALIZATION_VARIABLES.filter((v) =>
        merged.body.includes(`{{${v}}}`)
      ) as PersonalizationVariable[];
      const nextMessages = [...messages];
      nextMessages[idx] = {
        ...merged,
        variables: detectedVars,
        images: merged.images ?? current.images ?? [],
      };
      onUpdate({ messages: nextMessages });
    },
    [messages, selectedMessageIndex, onUpdate]
  );

  const insertVariable = useCallback(
    (variable: string) => {
      updateMessage({ body: message.body + `{{${variable}}}` });
      setShowVariables(false);
    },
    [message.body, updateMessage]
  );

  const handleImagesChange = useCallback(
    (nextImages: ImageAttachment[]) => {
      const idx = selectedMessageIndex;
      const nextMessages = [...messages];
      if (nextMessages[idx]) {
        nextMessages[idx] = { ...nextMessages[idx]!, images: nextImages };
        onUpdate({ messages: nextMessages });
      }
    },
    [messages, selectedMessageIndex, onUpdate]
  );

  const addMessage = useCallback(() => {
    const nextMessages = [...messages, { ...DEFAULT_EMPTY_MESSAGE }];
    onUpdate({ messages: nextMessages });
    setSelectedMessageIndex(nextMessages.length - 1);
  }, [messages, onUpdate]);

  const removeMessage = useCallback(
    (index: number) => {
      if (messages.length <= 1 || index < 0 || index >= messages.length)
        return;
      const nextMessages = messages.filter((_, i) => i !== index);
      onUpdate({ messages: nextMessages });
      setSelectedMessageIndex((prev) =>
        prev >= nextMessages.length
          ? nextMessages.length - 1
          : prev === index
            ? Math.max(0, index - 1)
            : prev > index
              ? prev - 1
              : prev
      );
    },
    [messages, onUpdate]
  );

  const previewBody = message.body.replace(
    /\{\{(\w+)\}\}/g,
    (_, variable: string) => MOCK_PREVIEW_VALUES[variable] ?? `[${variable}]`
  );

  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Channels & Message
              </h3>
              <p className="text-sm text-muted-foreground">
                Select delivery channels and compose your message
              </p>
            </div>

            <CheckboxCardGroup
              value={enabledChannelValues}
              onValueChange={handleChannelToggle}
              className="grid gap-2 sm:grid-cols-2"
            >
              {ALL_CHANNELS.map((channel) => {
                const meta = CHANNEL_META[channel];
                return (
                  <CheckboxCardOption
                    key={channel}
                    value={channel}
                    title={meta.label}
                    description={`~${meta.baseReach.toLocaleString()} reach`}
                    trailing={CHANNEL_ICONS[channel]}
                  />
                );
              })}
            </CheckboxCardGroup>

            <div className="flex items-center justify-between rounded-[var(--radius-Card-sm)] border border-border p-3">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-[var(--radius-xs)] bg-primary/10">
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
                {hasConsentData && (
                  <span className="text-muted-foreground">
                    {" "}
                    (~{totalReachWithConsent.toLocaleString()} with consent)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Message sequence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Message{hasSequence ? " in sequence" : ""}</Label>
              <Button
                type="button"
                variant="dashed"
                size="sm"
                onClick={addMessage}
              >
                <Plus className="size-3.5" />
                Add message
              </Button>
            </div>
            {(hasSequence || messages.length >= 1) && (
              <div className="flex flex-wrap items-center gap-2">
                {messages.map((msg, idx) => {
                  const label =
                    msg.delayDays != null
                      ? `Message ${idx + 1} (Day ${msg.delayDays})`
                      : `Message ${idx + 1}`;
                  const isSelected = selectedMessageIndex === idx;
                  return (
                    <div key={idx} className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant={isSelected ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMessageIndex(idx)}
                      >
                        {label}
                      </Button>
                      {messages.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeMessage(idx)}
                          aria-label={`Remove ${label}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {hasSequence && (
            <div className="space-y-2">
              <Label htmlFor="msg-delay-v2">Send after (days)</Label>
              <Input
                id="msg-delay-v2"
                type="number"
                min={0}
                placeholder="e.g. 0 = at trigger, 7 = 7 days later"
                value={message.delayDays ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  updateMessage({
                    delayDays:
                      v === "" ? undefined : Math.max(0, Number(v)),
                  });
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="msg-subject-v2">Subject Line (Email)</Label>
            <Input
              id="msg-subject-v2"
              placeholder="e.g., Your vehicle service is due"
              value={message.subject}
              onChange={(e) => updateMessage({ subject: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="msg-body-v2">Message Body</Label>
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
              id="msg-body-v2"
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

          <div className="space-y-2">
            <Label>Attach Images</Label>
            <ImageUpload
              images={images}
              onImagesChange={handleImagesChange}
            />
          </div>
        </div>

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
