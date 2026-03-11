"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  AudienceSegment,
  CampaignTrigger,
  CampaignType,
  ChannelConfig,
  ImageAttachment,
  PersonalizationVariable,
  WizardMessage,
} from "@/lib/campaigns/types";
import { WizardStepper } from "./wizard/wizard-stepper";
import { StepSetup } from "./wizard/step-setup";
import { StepAudienceTriggers } from "./wizard/step-audience-triggers";
import { StepMessageChannels } from "./wizard/step-message-channels";
import { StepReviewLaunch } from "./wizard/step-review-launch";

export interface WizardFormData {
  name: string;
  type: CampaignType;
  templateId: string | null;
  audienceSegments: AudienceSegment[];
  audienceSize: number;
  trigger: CampaignTrigger;
  message: WizardMessage;
  channels: ChannelConfig[];
}

const INITIAL_FORM_DATA: WizardFormData = {
  name: "",
  type: "custom",
  templateId: null,
  audienceSegments: [],
  audienceSize: 0,
  trigger: {
    type: "time-based",
    isRecurring: false,
    config: {},
  },
  message: {
    subject: "",
    body: "",
    variables: [],
    aiPrompt: "",
    images: [],
  },
  channels: [],
};

const STEP_COUNT = 4;

const stepTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

interface CampaignWizardProps {
  onCancel: () => void;
  onComplete: (data: WizardFormData) => void;
}

export function CampaignWizard({ onCancel, onComplete }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(INITIAL_FORM_DATA);

  const updateFormData = useCallback(
    (updates: Partial<WizardFormData>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
    },
    [],
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
      {/* Header */}
      <div className="flex items-center justify-between border-b px-8 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onCancel}
            className="cursor-pointer"
          >
            <X className="size-4" />
          </Button>
          <h1 className="font-headline text-lg font-semibold">
            Create Campaign
          </h1>
        </div>
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {STEP_COUNT}
        </span>
      </div>

      {/* Stepper */}
      <div className="border-b px-8">
        <WizardStepper
          currentStep={currentStep}
          onStepClick={handleGoToStep}
        />
      </div>

      {/* Step Content with animations */}
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
              <StepSetup formData={formData} onUpdate={updateFormData} />
            )}
            {currentStep === 1 && (
              <StepAudienceTriggers
                formData={formData}
                onUpdate={updateFormData}
              />
            )}
            {currentStep === 2 && (
              <StepMessageChannels
                formData={formData}
                onUpdate={updateFormData}
              />
            )}
            {currentStep === 3 && (
              <StepReviewLaunch
                formData={formData}
                onLaunch={handleLaunch}
                onGoToStep={handleGoToStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t px-8 py-4">
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
