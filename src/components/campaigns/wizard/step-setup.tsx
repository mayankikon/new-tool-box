"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CAMPAIGN_TEMPLATES,
  CAMPAIGN_TYPE_LABELS,
  PERSONALIZATION_VARIABLES,
} from "@/lib/campaigns/mock-data";
import {
  MarketingTemplateLibraryHeroStrip,
  MarketingTemplatePreviewArtifact,
  WizardScratchPreviewStrip,
} from "@/components/templates/marketing-template-preview-artifact";
import { MARKETING_TEMPLATE_LIBRARY } from "@/lib/templates/mock-data";
import type {
  CampaignTemplate,
  PersonalizationVariable,
  WizardSequenceMessage,
} from "@/lib/campaigns/types";
import {
  DEFAULT_COMPLIANCE_CHECKLIST,
  DEFAULT_RESPONSE_TRACKING,
  DEFAULT_WORKFLOW_FALLBACK_PATHS,
} from "@/lib/campaigns/types";
import { mergeUserCouponsWithOffers } from "@/lib/campaigns/coupon-library-storage";
import {
  createCouponRecommendations,
  createDefaultOfferLibrary,
  createSequenceLogicFromPreset,
  DEFAULT_WORKFLOW_GOAL,
} from "@/lib/campaigns/workflow";
import type { WizardFormData } from "../campaign-wizard";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

interface StepSetupProps {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
}

export function StepSetup({ formData, onUpdate }: StepSetupProps) {
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ name: e.target.value });
    },
    [onUpdate],
  );

  const handleTemplateSelect = useCallback(
    (template: CampaignTemplate | null) => {
      const offers = mergeUserCouponsWithOffers(createDefaultOfferLibrary());
      if (!template) {
        const messages = [
          {
            subject: "",
            body: "",
            variables: [],
            aiPrompt: "",
            images: [],
            channel: "sms" as const,
          },
        ];
        onUpdate({
          templateId: null,
          type: "custom",
          audienceSegments: [],
          exclusionRules: [],
          audienceSize: 0,
          trigger: { type: "time-based", isRecurring: false, config: {} },
          messages,
          sequenceLogic: createSequenceLogicFromPreset({
            presetId: "no-response-escalation",
            messages,
            offers,
            goal: DEFAULT_WORKFLOW_GOAL,
          }),
          offers,
          couponRecommendations: createCouponRecommendations(offers),
          campaignGoal: DEFAULT_WORKFLOW_GOAL,
          responseTracking: DEFAULT_RESPONSE_TRACKING,
          fallbackPaths: DEFAULT_WORKFLOW_FALLBACK_PATHS,
          channels: [],
          complianceChecklist: DEFAULT_COMPLIANCE_CHECKLIST,
        });
        return;
      }

      const { defaults } = template;
      const mergedTemplateOffers = mergeUserCouponsWithOffers(
        defaults.offers ?? createDefaultOfferLibrary(),
      );
      const templateMessages = defaults.messages ?? [];
      const selectedPreset =
        defaults.sequenceLogic?.presetId ??
        (templateMessages.length > 2
          ? "three-day-follow-up"
          : template.category === "seasonal-promotion"
            ? "coupon-recovery"
            : "no-response-escalation");
      const messages: WizardSequenceMessage[] =
        templateMessages.length > 0
          ? templateMessages.map((msg) => {
              const detectedVars = PERSONALIZATION_VARIABLES.filter((v) =>
                msg.body.includes(`{{${v}}}`),
              ) as PersonalizationVariable[];
              return {
                subject: msg.subject ?? "",
                body: msg.body,
                variables: detectedVars,
                aiPrompt: "",
                images: [],
                delayDays: msg.delayDays,
                channel: msg.channel,
              };
            })
          : [
              {
                subject: "",
                body: "",
                variables: [],
                aiPrompt: "",
                images: [],
              },
            ];

      onUpdate({
        templateId: template.id,
        type: template.category,
        name: template.name,
        audienceSegments: defaults.audienceSegments ?? [],
        exclusionRules: [],
        audienceSize: (defaults.audienceSegments ?? []).length > 0 ? 420 : 0,
        trigger: defaults.trigger ?? {
          type: "time-based",
          isRecurring: false,
          config: {},
        },
        messages,
        sequenceLogic:
          defaults.sequenceLogic ??
          createSequenceLogicFromPreset({
            presetId: selectedPreset,
            messages,
            offers: mergedTemplateOffers,
            goal: DEFAULT_WORKFLOW_GOAL,
          }),
        offers: mergedTemplateOffers,
        couponRecommendations: createCouponRecommendations(mergedTemplateOffers),
        campaignGoal: DEFAULT_WORKFLOW_GOAL,
        responseTracking: DEFAULT_RESPONSE_TRACKING,
        fallbackPaths: DEFAULT_WORKFLOW_FALLBACK_PATHS,
        channels: defaults.channels ?? [],
        complianceChecklist: DEFAULT_COMPLIANCE_CHECKLIST,
      });
    },
    [onUpdate],
  );

  const getTemplatePreview = useCallback((template: CampaignTemplate) => {
    const messageCount = template.defaults.messages?.length ?? 0;
    const logicPreset =
      template.defaults.sequenceLogic?.presetId ??
      (messageCount > 2
        ? "three-day-follow-up"
        : template.category === "seasonal-promotion"
          ? "coupon-recovery"
          : "no-response-escalation");
    const hasOffer =
      (template.defaults.offers?.length ?? 0) > 0 ||
      logicPreset === "coupon-recovery";
    return {
      messageCount,
      includesLogic: logicPreset !== "single-send",
      hasOffer,
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      {formData.templateId === null && (
        <div className="space-y-2">
          <Label htmlFor="campaign-name">Campaign Name</Label>
          <Input
            id="campaign-name"
            placeholder="e.g., Spring Oil Change Promotion"
            value={formData.name}
            onChange={handleNameChange}
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Choose a Template</h3>
          <p className="text-sm text-muted-foreground">
            Start with a pre-built campaign or build from scratch
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleTemplateSelect(null)}
          className={cn(
            "flex w-full flex-col overflow-hidden rounded-md border text-left transition-all duration-200",
            "bg-white dark:bg-zinc-950",
            formData.templateId === null
              ? "border-primary ring-1 ring-primary"
              : "cursor-pointer border-border hover:border-primary/40 hover:shadow-sm",
          )}
        >
          <WizardScratchPreviewStrip />
          <div className="space-y-1 px-4 py-3">
            <p className="text-sm font-medium text-foreground">Start from Scratch</p>
            <p className="text-xs text-muted-foreground">
              Build a fully custom campaign
            </p>
          </div>
        </button>

        <motion.div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {CAMPAIGN_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={formData.templateId === template.id}
              onSelect={() => handleTemplateSelect(template)}
              preview={getTemplatePreview(template)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
  preview,
}: {
  template: CampaignTemplate;
  isSelected: boolean;
  onSelect: () => void;
  preview: { messageCount: number; includesLogic: boolean; hasOffer: boolean };
}) {
  const libraryTemplate = MARKETING_TEMPLATE_LIBRARY.find(
    (t) => t.id === template.marketingLibraryTemplateId,
  );

  if (!libraryTemplate) {
    return null;
  }

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      onClick={onSelect}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-md border text-left transition-all duration-200",
        "bg-white dark:bg-zinc-950",
        isSelected
          ? "border-primary ring-1 ring-primary"
          : "cursor-pointer border-border hover:border-primary/40 hover:shadow-sm",
      )}
    >
      <MarketingTemplateLibraryHeroStrip
        template={libraryTemplate}
        minHeightClassName="min-h-[120px]"
      >
        <MarketingTemplatePreviewArtifact template={libraryTemplate} />
      </MarketingTemplateLibraryHeroStrip>
      <div className="min-w-0 space-y-2 px-4 py-3">
        <p className="text-sm font-medium text-foreground">{template.name}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{template.description}</p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {CAMPAIGN_TYPE_LABELS[template.category]}
          </Badge>
          {preview.messageCount > 0 && (
            <Badge variant="outline" className="text-[10px]">
              {preview.messageCount} message{preview.messageCount === 1 ? "" : "s"}
            </Badge>
          )}
          {preview.includesLogic && (
            <Badge variant="outline" className="text-[10px]">
              Includes logic
            </Badge>
          )}
          {preview.hasOffer && (
            <Badge variant="outline" className="text-[10px]">
              Includes offer
            </Badge>
          )}
        </div>
      </div>
    </motion.button>
  );
}
