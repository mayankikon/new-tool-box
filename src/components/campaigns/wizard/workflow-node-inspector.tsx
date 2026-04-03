"use client";

import { GitBranch, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { WizardFormData } from "../campaign-wizard";
import type {
  CampaignGoalEvent,
  CampaignOffer,
  NoResponseRule,
  OfferEscalationRule,
  ResponseRule,
  ResponseRuleEvent,
  SequenceRuleAction,
  WorkflowNode,
} from "@/lib/campaigns/types";
import { formatGoalEvent } from "@/lib/campaigns/workflow";

const GOAL_EVENT_OPTIONS: CampaignGoalEvent[] = [
  "booked-appointment",
  "redeemed-coupon",
  "replied",
  "clicked",
];

const RESPONSE_EVENT_OPTIONS: ResponseRuleEvent[] = [
  "booked-appointment",
  "replied",
  "clicked",
  "opened",
  "redeemed-coupon",
];

const RESPONSE_ACTION_OPTIONS: SequenceRuleAction[] = [
  "stop",
  "send-message",
  "send-alternate-message",
  "send-confirmation",
  "send-offer",
];

const NO_RESPONSE_ACTION_OPTIONS: Exclude<SequenceRuleAction, "send-confirmation">[] = [
  "stop",
  "send-message",
  "send-alternate-message",
  "send-offer",
];

const ACTION_LABELS: Record<SequenceRuleAction, string> = {
  stop: "Stop campaign",
  "send-message": "Send message",
  "send-alternate-message": "Send alternate message",
  "send-offer": "Send offer",
  "send-confirmation": "Send confirmation",
};

interface WorkflowNodeInspectorProps {
  node: WorkflowNode;
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onGoToStep?: (step: number) => void;
  updateResponseRule: (id: string, updates: Partial<ResponseRule>) => void;
  updateNoResponseRule: (id: string, updates: Partial<NoResponseRule>) => void;
  updateOfferEscalation: (id: string, updates: Partial<OfferEscalationRule>) => void;
  updateCampaignGoal: (goal: CampaignGoalEvent) => void;
  removeRule: (kind: "response" | "no-response" | "offer", id: string) => void;
}

export function WorkflowNodeInspector({
  node,
  formData,
  onUpdate,
  onGoToStep,
  updateResponseRule,
  updateNoResponseRule,
  updateOfferEscalation,
  updateCampaignGoal,
  removeRule,
}: WorkflowNodeInspectorProps) {
  const messages = formData.messages;
  const offers = formData.offers;

  if (node.type === "entry") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Customers enter this workflow when the campaign trigger fires (configured in Audience &amp; Trigger).
        </p>
        {onGoToStep ? (
          <Button type="button" variant="outline" size="sm" onClick={() => onGoToStep(1)}>
            <GitBranch className="size-4" />
            Edit trigger &amp; audience
          </Button>
        ) : null}
      </div>
    );
  }

  if (node.type === "goal") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>What counts as success?</Label>
          <Select
            value={formData.sequenceLogic.goal}
            items={GOAL_EVENT_OPTIONS.map((event) => ({
              value: event,
              label: formatGoalEvent(event),
            }))}
            onValueChange={(value) => updateCampaignGoal(value as CampaignGoalEvent)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOAL_EVENT_OPTIONS.map((event) => (
                <SelectItem key={event} value={event}>
                  {formatGoalEvent(event)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Stop on goal</p>
            <p className="text-xs text-muted-foreground">End the campaign once the goal is reached.</p>
          </div>
          <Switch
            checked={formData.sequenceLogic.stopOnGoal}
            onCheckedChange={(checked) => {
              onUpdate({
                sequenceLogic: { ...formData.sequenceLogic, stopOnGoal: checked },
                campaignGoal: { ...formData.campaignGoal, stopOnGoal: checked },
              });
            }}
          />
        </div>
      </div>
    );
  }

  if (node.type === "message" && node.messageIndex != null) {
    const idx = node.messageIndex;
    const message = messages[idx];
    return (
      <div className="space-y-4">
        <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
          <p className="font-medium">Message {idx + 1}</p>
          <p className="text-xs text-muted-foreground capitalize">
            Channel: {message?.channel ?? "—"}
          </p>
        </div>
        {onGoToStep ? (
          <Button type="button" variant="default" size="sm" onClick={() => onGoToStep(2)}>
            <Pencil className="size-4" />
            Edit message content
          </Button>
        ) : null}
        <Separator />
        <p className="text-xs text-muted-foreground">
          Message copy and attachments are edited in the Messages step so all channels stay in sync.
        </p>
      </div>
    );
  }

  if (node.type === "condition") {
    const ruleId = node.sourceResponseRuleId ?? node.sourceNoResponseRuleId;
    const kind = node.sourceResponseRuleId ? "response" as const : "no-response" as const;
    const rule =
      kind === "response"
        ? formData.sequenceLogic.responseRules.find((r) => r.id === ruleId)
        : formData.sequenceLogic.noResponseRules.find((r) => r.id === ruleId);

    if (!rule) {
      return (
        <p className="text-sm text-muted-foreground">
          This rule is no longer available. Close and select another step.
        </p>
      );
    }

    if (kind === "response") {
      const r = rule as ResponseRule;
      return (
        <div className="space-y-4">
          <InspectorMessageSelect
            value={r.afterMessageIndex}
            messages={messages}
            label="After message"
            onValueChange={(value) => updateResponseRule(r.id, { afterMessageIndex: value })}
          />
          <div className="space-y-2">
            <Label>If customer</Label>
            <Select
              value={r.event}
              items={RESPONSE_EVENT_OPTIONS.map((event) => ({
                value: event,
                label: event.replace(/-/g, " "),
              }))}
              onValueChange={(value) =>
                updateResponseRule(r.id, { event: value as ResponseRuleEvent })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESPONSE_EVENT_OPTIONS.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event.replace(/-/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ActionSelect
            value={r.action}
            options={RESPONSE_ACTION_OPTIONS}
            onValueChange={(value) =>
              updateResponseRule(r.id, {
                action: value,
                offerId: value === "send-offer" ? r.offerId ?? offers[0]?.id : undefined,
              })
            }
          />
          {requiresMessageTarget(r.action) ? (
            <InspectorMessageSelect
              value={r.sendMessageIndex ?? 0}
              messages={messages}
              label={r.action === "send-alternate-message" ? "Send alternate message" : "Send message"}
              onValueChange={(value) => updateResponseRule(r.id, { sendMessageIndex: value })}
            />
          ) : null}
          {r.action === "send-offer" ? (
            <OfferSelect
              value={r.offerId}
              offers={offers}
              onValueChange={(value) => updateResponseRule(r.id, { offerId: value })}
            />
          ) : null}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeRule("response", r.id)}
          >
            Remove rule
          </Button>
        </div>
      );
    }

    const nr = rule as NoResponseRule;
    return (
      <div className="space-y-4">
        <InspectorMessageSelect
          value={nr.afterMessageIndex}
          messages={messages}
          label="After message"
          onValueChange={(value) => updateNoResponseRule(nr.id, { afterMessageIndex: value })}
        />
        <div className="space-y-2">
          <Label>Wait (days)</Label>
          <Input
            type="number"
            min={0}
            value={nr.waitDays}
            onChange={(event) =>
              updateNoResponseRule(nr.id, {
                waitDays: Math.max(0, Number(event.target.value)),
              })
            }
          />
        </div>
        <ActionSelect
          value={nr.action}
          options={NO_RESPONSE_ACTION_OPTIONS}
          onValueChange={(value) =>
            updateNoResponseRule(nr.id, {
              action: value as NoResponseRule["action"],
              offerId: value === "send-offer" ? nr.offerId ?? offers[0]?.id : undefined,
            })
          }
        />
        {requiresMessageTarget(nr.action) ? (
          <InspectorMessageSelect
            value={nr.sendMessageIndex ?? 0}
            messages={messages}
            label={nr.action === "send-alternate-message" ? "Send alternate message" : "Send message"}
            onValueChange={(value) => updateNoResponseRule(nr.id, { sendMessageIndex: value })}
          />
        ) : null}
        {nr.action === "send-offer" ? (
          <OfferSelect
            value={nr.offerId}
            offers={offers}
            onValueChange={(value) => updateNoResponseRule(nr.id, { offerId: value })}
          />
        ) : null}
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => removeRule("no-response", nr.id)}
        >
          Remove rule
        </Button>
      </div>
    );
  }

  if (node.type === "offer") {
    if (node.sourceOfferEscalationId) {
      const esc = formData.sequenceLogic.offerEscalations.find(
        (e) => e.id === node.sourceOfferEscalationId,
      );
      if (!esc) {
        return (
          <p className="text-sm text-muted-foreground">Escalation was removed. Close and refresh the map.</p>
        );
      }
      return (
        <div className="space-y-4">
          <InspectorMessageSelect
            value={esc.afterMessageIndex}
            messages={messages}
            label="After message"
            onValueChange={(value) => updateOfferEscalation(esc.id, { afterMessageIndex: value })}
          />
          <div className="space-y-2">
            <Label>Wait (days)</Label>
            <Input
              type="number"
              min={0}
              value={esc.waitDays}
              onChange={(event) =>
                updateOfferEscalation(esc.id, {
                  waitDays: Math.max(0, Number(event.target.value)),
                })
              }
            />
          </div>
          <InspectorMessageSelect
            value={esc.sendMessageIndex ?? 0}
            messages={messages}
            label="Send with message"
            onValueChange={(value) => updateOfferEscalation(esc.id, { sendMessageIndex: value })}
          />
          <OfferSelect
            value={esc.offerId}
            offers={offers}
            onValueChange={(value) => updateOfferEscalation(esc.id, { offerId: value })}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => removeRule("offer", esc.id)}
          >
            Remove escalation
          </Button>
        </div>
      );
    }

    if (node.sourceResponseRuleId || node.sourceNoResponseRuleId) {
      const ruleId = node.sourceResponseRuleId ?? node.sourceNoResponseRuleId!;
      const isResp = Boolean(node.sourceResponseRuleId);
      const rule = isResp
        ? formData.sequenceLogic.responseRules.find((r) => r.id === ruleId)
        : formData.sequenceLogic.noResponseRules.find((r) => r.id === ruleId);
      if (!rule || rule.action !== "send-offer") {
        return (
          <p className="text-sm text-muted-foreground">
            Offer is driven by the connected rule. Select the condition node to change behavior.
          </p>
        );
      }
      return (
        <div className="space-y-4">
          <OfferSelect
            value={rule.offerId}
            offers={offers}
            onValueChange={(value) =>
              isResp
                ? updateResponseRule(ruleId, { offerId: value })
                : updateNoResponseRule(ruleId, { offerId: value })
            }
          />
          <p className="text-xs text-muted-foreground">
            To change when this offer sends, edit the branching rule on the condition node.
          </p>
        </div>
      );
    }

    return (
      <p className="text-sm text-muted-foreground">
        Select a condition or escalation to edit offer timing.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      No editor for this step type ({node.type}).
    </p>
  );
}

function InspectorMessageSelect({
  value,
  messages,
  label,
  onValueChange,
}: {
  value: number;
  messages: WizardFormData["messages"];
  label: string;
  onValueChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value={String(value)}
        items={messages.map((message, index) => ({
          value: String(index),
          label:
            `Message ${index + 1}` +
            (message.delayDays != null
              ? ` • Day ${message.delayDays}`
              : index === 0
                ? " • Day 0"
                : ""),
        }))}
        onValueChange={(next) => onValueChange(Number(next))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {messages.map((message, index) => (
            <SelectItem key={index} value={String(index)}>
              Message {index + 1}
              {message.delayDays != null
                ? ` • Day ${message.delayDays}`
                : index === 0
                  ? " • Day 0"
                  : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ActionSelect({
  value,
  options,
  onValueChange,
}: {
  value: SequenceRuleAction;
  options: SequenceRuleAction[];
  onValueChange: (value: SequenceRuleAction) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Then</Label>
      <Select
        value={value}
        items={options.map((option) => ({
          value: option,
          label: ACTION_LABELS[option],
        }))}
        onValueChange={(next) => onValueChange(next as SequenceRuleAction)}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {ACTION_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function OfferSelect({
  value,
  offers,
  onValueChange,
}: {
  value: string | undefined;
  offers: CampaignOffer[];
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Offer</Label>
      <Select
        value={value ?? ""}
        items={Object.fromEntries(
          offers.map((offer) => [offer.id, offer.title]),
        )}
        onValueChange={(next) => {
          if (next) onValueChange(next);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select an offer" />
        </SelectTrigger>
        <SelectContent>
          {offers.map((offer) => (
            <SelectItem key={offer.id} value={offer.id}>
              {offer.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function requiresMessageTarget(action: SequenceRuleAction) {
  return action === "send-message" || action === "send-alternate-message";
}
