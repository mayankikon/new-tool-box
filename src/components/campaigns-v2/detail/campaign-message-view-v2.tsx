"use client";

import { useState } from "react";
import { Mail, MessageSquare, Bell, Smartphone, Tag } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioSegmented } from "@/components/ui/radio-segmented";
import { FilterButton } from "@/components/ui/filter-button";
import type {
  CampaignMessage,
  ChannelConfig,
  Channel,
} from "@/lib/campaigns/types";

const CHANNEL_META: Record<Channel, { label: string; icon: typeof Mail }> = {
  email: { label: "Email", icon: Mail },
  sms: { label: "SMS", icon: MessageSquare },
  push: { label: "Push Notification", icon: Bell },
  "in-app": { label: "In-App", icon: Smartphone },
};

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  const unique = new Set(matches.map((m) => m.slice(2, -2).trim()));
  return Array.from(unique);
}

function formatVariableLabel(variable: string): string {
  return variable
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function highlightVariables(text: string): React.ReactNode[] {
  const parts = text.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const varName = part.slice(2, -2).trim();
      return (
        <span
          key={i}
          className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary"
        >
          {varName}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

interface ChannelPreviewFrameProps {
  channelType: Channel;
  children: React.ReactNode;
}

function ChannelPreviewFrame({
  channelType,
  children,
}: ChannelPreviewFrameProps) {
  const frameStyles: Record<Channel, string> = {
    sms: "rounded-[var(--radius-Card-sm)] bg-muted/50 border border-border p-3",
    email:
      "rounded-[var(--radius-Card-sm)] bg-muted/30 border border-border p-4",
    push: "rounded-[var(--radius-Card-sm)] bg-muted/40 border border-border p-3",
    "in-app":
      "rounded-[var(--radius-Card-sm)] bg-muted/30 border border-border p-3",
  };

  return <div className={frameStyles[channelType]}>{children}</div>;
}

interface CampaignMessageViewV2Props {
  messages: CampaignMessage[];
  channels: ChannelConfig[];
}

export function CampaignMessageViewV2({
  messages,
  channels,
}: CampaignMessageViewV2Props) {
  const enabledChannels = channels.filter((ch) => ch.isEnabled);
  const hasSequence = messages.some((m) => m.delayDays != null);

  const allVariables = new Set<string>();
  for (const msg of messages) {
    for (const v of extractVariables(msg.body)) allVariables.add(v);
    if (msg.subject) {
      for (const v of extractVariables(msg.subject)) allVariables.add(v);
    }
  }
  const variableList = Array.from(allVariables);

  const messageByChannel = new Map<Channel, CampaignMessage>();
  for (const msg of messages) {
    messageByChannel.set(msg.channel, msg);
  }

  const channelOptions = enabledChannels.map((ch) => ({
    value: ch.channel,
    label: CHANNEL_META[ch.channel].label,
  }));

  const [activeChannelFilter, setActiveChannelFilter] = useState<string>(
    enabledChannels[0]?.channel ?? "sms"
  );

  return (
    <div className="space-y-6 pt-4">
      {variableList.length > 0 && (
        <Card className="border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Tag className="size-4 text-muted-foreground" />
              Personalization Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {variableList.map((v) => (
                <FilterButton
                  key={v}
                  label={formatVariableLabel(v)}
                  selected
                  leadIcon={null}
                  size="xs"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {hasSequence && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Message Sequence</h3>
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const meta = CHANNEL_META[msg.channel];
              const Icon = meta.icon;
              const delayLabel =
                msg.delayDays != null
                  ? `Day ${msg.delayDays}`
                  : `Message ${idx + 1}`;
              return (
                <Card
                  key={idx}
                  className="border border-border shadow-sm"
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Icon className="size-4 text-muted-foreground" />
                        {meta.label}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {delayLabel}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {msg.subject && msg.channel === "email" && (
                        <div>
                          <p className="mb-0.5 text-xs text-muted-foreground">
                            Subject
                          </p>
                          <p className="text-sm font-medium">{msg.subject}</p>
                        </div>
                      )}
                      <ChannelPreviewFrame channelType={msg.channel}>
                        <p className="text-sm leading-relaxed">
                          {highlightVariables(msg.body)}
                        </p>
                      </ChannelPreviewFrame>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Separator />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-medium">
            {hasSequence ? "Channel summary" : "Channel Previews"}
          </h3>
          {channelOptions.length > 1 && !hasSequence && (
            <RadioSegmented
              value={activeChannelFilter}
              onValueChange={setActiveChannelFilter}
              options={channelOptions}
            />
          )}
        </div>

        {enabledChannels.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No channels enabled for this campaign.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {enabledChannels
              .filter(
                (ch) =>
                  hasSequence ||
                  channelOptions.length <= 1 ||
                  ch.channel === activeChannelFilter
              )
              .map((ch) => {
                const meta = CHANNEL_META[ch.channel];
                const Icon = meta.icon;
                const channelMessage = messageByChannel.get(ch.channel);

                if (!channelMessage) {
                  return (
                    <Card
                      key={ch.channel}
                      className="border border-border shadow-sm"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Icon className="size-4 text-muted-foreground" />
                          {meta.label}
                        </CardTitle>
                        <CardDescription>
                          Est. reach: {ch.estimatedReach.toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm italic text-muted-foreground">
                          No message configured for this channel.
                        </p>
                      </CardContent>
                    </Card>
                  );
                }

                return (
                  <Card
                    key={ch.channel}
                    className="border border-border shadow-sm"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Icon className="size-4 text-muted-foreground" />
                        {meta.label}
                      </CardTitle>
                      <CardDescription>
                        Est. reach: {ch.estimatedReach.toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {channelMessage.subject &&
                          ch.channel === "email" && (
                            <div>
                              <p className="mb-0.5 text-xs text-muted-foreground">
                                Subject
                              </p>
                              <p className="text-sm font-medium">
                                {channelMessage.subject}
                              </p>
                            </div>
                          )}
                        <ChannelPreviewFrame channelType={ch.channel}>
                          <p className="text-sm leading-relaxed">
                            {highlightVariables(channelMessage.body)}
                          </p>
                        </ChannelPreviewFrame>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
