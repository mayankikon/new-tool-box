"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, GitBranch, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { N8nWorkflowBlock } from "@/components/ui/n8n-workflow-block-shadcnui";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { workflowGraphSignature } from "@/lib/campaigns/workflow-canvas-view";
import { mergeWorkflowLayout } from "@/lib/campaigns/workflow-layout";
import type { WizardFormData } from "../campaign-wizard";
import type {
  CampaignGoalEvent,
  CampaignSequenceLogic,
  NoResponseRule,
  OfferEscalationRule,
  ResponseRule,
  WorkflowPresetId,
} from "@/lib/campaigns/types";
import {
  createSequenceLogicFromPreset,
  summarizeSequenceLogic,
  WORKFLOW_PRESETS,
} from "@/lib/campaigns/workflow";
import { WorkflowNodeInspector } from "./workflow-node-inspector";

interface StepWorkflowProps {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
  onGoToStep?: (step: number) => void;
}

export function StepWorkflow({ formData, onUpdate, onGoToStep }: StepWorkflowProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const workflow = formData.workflow;
  const mergedLayout = useMemo(
    () =>
      workflow
        ? mergeWorkflowLayout(workflow, formData.workflowNodeLayout)
        : {},
    [workflow, formData.workflowNodeLayout],
  );

  const selectedNode = useMemo(() => {
    if (!selectedNodeId || !workflow?.nodes.some((n) => n.id === selectedNodeId)) {
      return null;
    }
    return workflow.nodes.find((n) => n.id === selectedNodeId) ?? null;
  }, [workflow, selectedNodeId]);

  const summary = useMemo(
    () =>
      summarizeSequenceLogic(
        formData.sequenceLogic,
        formData.offers,
        formData.messages,
      ),
    [formData.offers, formData.messages, formData.sequenceLogic],
  );

  const applyPreset = useCallback(
    (presetId: WorkflowPresetId) => {
      const next = createSequenceLogicFromPreset({
        presetId,
        messages: formData.messages,
        offers: formData.offers,
        goal: formData.campaignGoal,
      });
      onUpdate({
        sequenceLogic: next,
        campaignGoal: {
          ...formData.campaignGoal,
          successEvent: next.goal,
          label: getGoalLabel(next.goal),
          stopOnGoal: next.stopOnGoal,
        },
      });
    },
    [formData.campaignGoal, formData.messages, formData.offers, onUpdate],
  );

  const updateSequenceLogic = useCallback(
    (updater: (logic: CampaignSequenceLogic) => CampaignSequenceLogic) => {
      onUpdate({ sequenceLogic: updater(formData.sequenceLogic) });
    },
    [formData.sequenceLogic, onUpdate],
  );

  const updateResponseRule = useCallback(
    (id: string, updates: Partial<ResponseRule>) => {
      updateSequenceLogic((logic) => ({
        ...logic,
        responseRules: logic.responseRules.map((rule) =>
          rule.id === id ? { ...rule, ...updates } : rule,
        ),
      }));
    },
    [updateSequenceLogic],
  );

  const updateNoResponseRule = useCallback(
    (id: string, updates: Partial<NoResponseRule>) => {
      updateSequenceLogic((logic) => ({
        ...logic,
        noResponseRules: logic.noResponseRules.map((rule) =>
          rule.id === id ? { ...rule, ...updates } : rule,
        ),
      }));
    },
    [updateSequenceLogic],
  );

  const updateOfferEscalation = useCallback(
    (id: string, updates: Partial<OfferEscalationRule>) => {
      updateSequenceLogic((logic) => ({
        ...logic,
        offerEscalations: logic.offerEscalations.map((rule) =>
          rule.id === id ? { ...rule, ...updates } : rule,
        ),
      }));
    },
    [updateSequenceLogic],
  );

  const addResponseRule = useCallback(() => {
    updateSequenceLogic((logic) => ({
      ...logic,
      responseRules: [
        ...logic.responseRules,
        {
          id: `resp-${Date.now()}`,
          event: "booked-appointment",
          afterMessageIndex: 0,
          action: "stop",
        },
      ],
    }));
  }, [updateSequenceLogic]);

  const addNoResponseRule = useCallback(() => {
    updateSequenceLogic((logic) => ({
      ...logic,
      noResponseRules: [
        ...logic.noResponseRules,
        {
          id: `nresp-${Date.now()}`,
          afterMessageIndex: Math.max(0, logic.noResponseRules.length),
          waitDays: 2,
          action: "send-message",
          sendMessageIndex: Math.min(1, Math.max(formData.messages.length - 1, 0)),
        },
      ],
    }));
  }, [formData.messages.length, updateSequenceLogic]);

  const addOfferEscalation = useCallback(() => {
    updateSequenceLogic((logic) => ({
      ...logic,
      offerEscalations: [
        ...logic.offerEscalations,
        {
          id: `offer-${Date.now()}`,
          afterMessageIndex: Math.max(0, logic.offerEscalations.length),
          waitDays: 2,
          offerId:
            formData.offers.find((offer) => offer.isRecommended)?.id ?? formData.offers[0]?.id,
          sendMessageIndex: Math.min(1, Math.max(formData.messages.length - 1, 0)),
        },
      ],
    }));
  }, [formData.messages.length, formData.offers, updateSequenceLogic]);

  const removeRule = useCallback(
    (kind: "response" | "no-response" | "offer", id: string) => {
      updateSequenceLogic((logic) => ({
        ...logic,
        responseRules:
          kind === "response"
            ? logic.responseRules.filter((rule) => rule.id !== id)
            : logic.responseRules,
        noResponseRules:
          kind === "no-response"
            ? logic.noResponseRules.filter((rule) => rule.id !== id)
            : logic.noResponseRules,
        offerEscalations:
          kind === "offer"
            ? logic.offerEscalations.filter((rule) => rule.id !== id)
            : logic.offerEscalations,
      }));
      setSelectedNodeId(null);
    },
    [updateSequenceLogic],
  );

  const updateCampaignGoal = useCallback(
    (goal: CampaignGoalEvent) => {
      onUpdate({
        campaignGoal: {
          ...formData.campaignGoal,
          successEvent: goal,
          label: getGoalLabel(goal),
        },
        sequenceLogic: {
          ...formData.sequenceLogic,
          goal,
        },
      });
    },
    [formData.campaignGoal, formData.sequenceLogic, onUpdate],
  );

  const handleLayoutChange = useCallback(
    (next: Record<string, { x: number; y: number }>) => {
      onUpdate({ workflowNodeLayout: next });
    },
    [onUpdate],
  );

  const recommendedOffers = formData.offers.filter((offer) => offer.isRecommended);

  if (!workflow) {
    return (
      <div className="mx-auto max-w-6xl py-6">
        <p className="text-sm text-muted-foreground">Loading workflow…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-6">
      <div className="mb-6 space-y-1">
        <h3 className="text-sm font-medium">Sequence Logic</h3>
        <p className="text-sm text-muted-foreground">
          Build branches on the map: add rules, drag steps to arrange, and click a step to edit details.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <CardTitle className="text-sm">Logic preset</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {WORKFLOW_PRESETS.map((preset) => {
              const isActive = formData.sequenceLogic.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.id)}
                  className={cn(
                    "rounded-md border p-4 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "hover:border-primary/30 hover:bg-accent/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{preset.label}</p>
                    {isActive && <Badge variant="secondary">Selected</Badge>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{preset.description}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <N8nWorkflowBlock
          key={workflowGraphSignature(workflow)}
          workflow={workflow}
          layout={mergedLayout}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onLayoutChange={handleLayoutChange}
          headerTitle="Workflow Builder"
          onAddResponseRule={addResponseRule}
          onAddNoResponseRule={addNoResponseRule}
          onAddOfferEscalation={addOfferEscalation}
        />

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Schedule summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.messageSchedule.map((item) => (
              <div key={item} className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        {recommendedOffers.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <CardTitle className="text-sm">Recommended offers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                <div className="space-y-3">
                  {formData.couponRecommendations.map((recommendation) => {
                    const offer = formData.offers.find((item) => item.id === recommendation.offerId);
                    if (!offer) return null;
                    return (
                      <div key={recommendation.id} className="rounded-md border bg-background p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{offer.title}</p>
                          <Badge variant="outline" className="capitalize">
                            {recommendation.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{recommendation.rationale[0]}</p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              onUpdate({
                                couponRecommendations: formData.couponRecommendations.map((item) =>
                                  item.id === recommendation.id
                                    ? { ...item, status: "accepted" }
                                    : item,
                                ),
                                offers: formData.offers.map((item) =>
                                  item.id === offer.id ? { ...item, isApproved: true } : item,
                                ),
                              })
                            }
                          >
                            <CheckCircle2 className="size-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              onUpdate({
                                couponRecommendations: formData.couponRecommendations.map((item) =>
                                  item.id === recommendation.id
                                    ? { ...item, status: "dismissed" }
                                    : item,
                                ),
                              })
                            }
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(formData.sequenceLogic.validationErrors?.length ?? 0) > 0 && (
          <div className="rounded-md border border-amber-300/40 bg-amber-500/10 p-3">
            <p className="mb-1 text-xs font-medium">Needs attention</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {formData.sequenceLogic.validationErrors?.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <Sheet
        open={selectedNode !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedNodeId(null);
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GitBranch className="size-4 text-primary" />
              {selectedNode ? selectedNode.label : "Step"}
            </SheetTitle>
            <SheetDescription>
              {selectedNode ? `Type: ${selectedNode.type}` : "Select a step on the map."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {selectedNode ? (
              <WorkflowNodeInspector
                node={selectedNode}
                formData={formData}
                onUpdate={onUpdate}
                onGoToStep={onGoToStep}
                updateResponseRule={updateResponseRule}
                updateNoResponseRule={updateNoResponseRule}
                updateOfferEscalation={updateOfferEscalation}
                updateCampaignGoal={updateCampaignGoal}
                removeRule={removeRule}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function getGoalLabel(goal: CampaignGoalEvent) {
  switch (goal) {
    case "booked-appointment":
      return "Booked appointment";
    case "redeemed-coupon":
      return "Coupon redeemed";
    case "replied":
      return "Customer replied";
    case "clicked":
      return "Customer clicked";
    default:
      return "Campaign goal";
  }
}
