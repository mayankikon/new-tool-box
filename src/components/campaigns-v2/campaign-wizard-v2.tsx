"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FileText, Users, MessageSquare, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepperHorizontal } from "@/components/ui/stepper-horizontal";
import type {
  AudienceSegment,
  CampaignTrigger,
  CampaignType,
  ChannelConfig,
  ComplianceChecklist,
  ExclusionRule,
  PreferredSendWindow,
  WizardSequenceMessage,
} from "@/lib/campaigns/types";
import { DEFAULT_COMPLIANCE_CHECKLIST } from "@/lib/campaigns/types";
import { StepSetupV2 } from "./wizard/step-setup-v2";
import { StepAudienceTriggersV2 } from "./wizard/step-audience-triggers-v2";
import { StepMessageChannelsV2 } from "./wizard/step-message-channels-v2";
import { StepReviewLaunchV2 } from "./wizard/step-review-launch-v2";

export interface WizardFormDataV2 {
  name: string;
  type: CampaignType;
  templateId: string | null;
  audienceSegments: AudienceSegment[];
  exclusionRules: ExclusionRule[];
  audienceSize: number;
  trigger: CampaignTrigger;
  messages: WizardSequenceMessage[];
  channels: ChannelConfig[];
  scheduledAt?: string;
  scheduledEndAt?: string;
  preferredSendWindow?: PreferredSendWindow;
  complianceChecklist: ComplianceChecklist;
}

const DEFAULT_SINGLE_MESSAGE: WizardSequenceMessage = {
  subject: "",
  body: "",
  variables: [],
  aiPrompt: "",
  images: [],
};

const INITIAL_FORM_DATA: WizardFormDataV2 = {
  name: "",
  type: "custom",
  templateId: null,
  audienceSegments: [],
  exclusionRules: [],
  audienceSize: 0,
  trigger: {
    type: "time-based",
    isRecurring: false,
    config: {},
  },
  messages: [DEFAULT_SINGLE_MESSAGE],
  channels: [],
  complianceChecklist: DEFAULT_COMPLIANCE_CHECKLIST,
};

const WIZARD_STEPS = [
  { label: "Campaign Setup", icon: <FileText className="size-4" /> },
  { label: "Audience & Triggers", icon: <Users className="size-4" /> },
  { label: "Message & Channels", icon: <MessageSquare className="size-4" /> },
  { label: "Review & Launch", icon: <Rocket className="size-4" /> },
];

const STEP_COUNT = 4;

const stepTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

interface CampaignWizardV2Props {
  onCancel: () => void;
  onComplete: (data: WizardFormDataV2) => void;
}

export function CampaignWizardV2({
  onCancel,
  onComplete,
}: CampaignWizardV2Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormDataV2>(INITIAL_FORM_DATA);

  const updateFormData = useCallback(
    (updates: Partial<WizardFormDataV2>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, STEP_COUNT - 1));
  }, []);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleGoToStep = useCallback((step: number) => {
    if (step >= 0 && step < STEP_COUNT) {
      setCurrentStep(step);
    }
  }, []);

  const handleLaunch = useCallback(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEP_COUNT - 1;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-8 py-4">
        <StepperHorizontal
          steps={WIZARD_STEPS}
          currentStep={currentStep}
          position="top"
          align="center"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={stepTransition.initial}
            animate={stepTransition.animate}
            exit={stepTransition.exit}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {currentStep === 0 && (
              <StepSetupV2 formData={formData} onUpdate={updateFormData} />
            )}
            {currentStep === 1 && (
              <StepAudienceTriggersV2
                formData={formData}
                onUpdate={updateFormData}
              />
            )}
            {currentStep === 2 && (
              <StepMessageChannelsV2
                formData={formData}
                onUpdate={updateFormData}
              />
            )}
            {currentStep === 3 && (
              <StepReviewLaunchV2
                formData={formData}
                onUpdate={updateFormData}
                onLaunch={handleLaunch}
                onGoToStep={handleGoToStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between border-t border-border px-8 py-4">
        <Button
          variant="outline"
          onClick={isFirstStep ? onCancel : handleBack}
          className="cursor-pointer"
        >
          {isFirstStep ? (
            "Cancel"
          ) : (
            <>
              <ArrowLeft className="size-4" />
              Back
            </>
          )}
        </Button>
        {!isLastStep && (
          <Button onClick={handleNext} className="cursor-pointer">
            Next
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
