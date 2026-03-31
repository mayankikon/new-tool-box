"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { InputCaption } from "@/components/ui/input-caption";
import { Label } from "@/components/ui/label";
import { RadioCardGroup, RadioCardOption } from "@/components/ui/radio-card";
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
import { DEFAULT_COMPLIANCE_CHECKLIST } from "@/lib/campaigns/types";
import type { WizardFormDataV2 } from "../campaign-wizard-v2";

interface StepSetupV2Props {
  formData: WizardFormDataV2;
  onUpdate: (updates: Partial<WizardFormDataV2>) => void;
}

function campaignTemplatePreviewMedia(template: CampaignTemplate) {
  const libraryTemplate = MARKETING_TEMPLATE_LIBRARY.find(
    (t) => t.id === template.marketingLibraryTemplateId,
  );
  if (!libraryTemplate) {
    return null;
  }
  return (
    <MarketingTemplateLibraryHeroStrip
      template={libraryTemplate}
      minHeightClassName="min-h-[100px]"
    >
      <MarketingTemplatePreviewArtifact template={libraryTemplate} />
    </MarketingTemplateLibraryHeroStrip>
  );
}

export function StepSetupV2({ formData, onUpdate }: StepSetupV2Props) {
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onUpdate({ name: e.target.value });
    },
    [onUpdate],
  );

  const handleTemplateSelect = useCallback(
    (templateId: string) => {
      if (templateId === "scratch") {
        onUpdate({
          templateId: null,
          type: "custom",
          audienceSegments: [],
          exclusionRules: [],
          audienceSize: 0,
          trigger: { type: "time-based", isRecurring: false, config: {} },
          messages: [
            {
              subject: "",
              body: "",
              variables: [],
              aiPrompt: "",
              images: [],
            },
          ],
          channels: [],
          complianceChecklist: DEFAULT_COMPLIANCE_CHECKLIST,
        });
        return;
      }

      const template = CAMPAIGN_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;

      const { defaults } = template;
      const templateMessages = defaults.messages ?? [];
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
        channels: defaults.channels ?? [],
        complianceChecklist: DEFAULT_COMPLIANCE_CHECKLIST,
      });
    },
    [onUpdate],
  );

  const selectedValue =
    formData.templateId === null ? "scratch" : formData.templateId;

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      {formData.templateId === null && (
        <div className="space-y-2">
          <Label htmlFor="campaign-name-v2">Campaign Name</Label>
          <Input
            id="campaign-name-v2"
            placeholder="e.g., Spring Oil Change Promotion"
            value={formData.name}
            onChange={handleNameChange}
          />
          <InputCaption
            variant="default"
            text="Give your campaign a descriptive name to identify it later."
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Choose a Template
          </h3>
          <p className="text-sm text-muted-foreground">
            Start with a pre-built campaign or build from scratch
          </p>
        </div>

        <RadioCardGroup
          value={selectedValue}
          onValueChange={handleTemplateSelect}
          className="grid gap-3 sm:grid-cols-1"
        >
          <RadioCardOption
            value="scratch"
            title="Start from Scratch"
            description="Build a fully custom campaign"
            media={<WizardScratchPreviewStrip />}
          />
        </RadioCardGroup>

        <RadioCardGroup
          value={selectedValue}
          onValueChange={handleTemplateSelect}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CAMPAIGN_TEMPLATES.map((template) => (
            <RadioCardOption
              key={template.id}
              value={template.id}
              title={template.name}
              description={template.description}
              subDetail={CAMPAIGN_TYPE_LABELS[template.category]}
              media={campaignTemplatePreviewMedia(template)}
            />
          ))}
        </RadioCardGroup>
      </div>
    </div>
  );
}
