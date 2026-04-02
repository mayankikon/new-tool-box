"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  AudienceSegment,
  CampaignOffer,
  CampaignSequenceLogic,
  CampaignWorkflow,
  CampaignTrigger,
  CampaignType,
  ChannelConfig,
  ComplianceChecklist,
  CouponRecommendation,
  ExclusionRule,
  PreferredSendWindow,
  ResponseTrackingSettings,
  WorkflowFallbackPaths,
  WorkflowGoal,
  WizardSequenceMessage,
} from "@/lib/campaigns/types";
import {
  DEFAULT_COMPLIANCE_CHECKLIST,
  DEFAULT_RESPONSE_TRACKING,
  DEFAULT_WORKFLOW_FALLBACK_PATHS,
} from "@/lib/campaigns/types";
import {
  mergePartialCampaignOffer,
  createNewCampaignOfferId,
} from "@/lib/campaigns/coupon-templates";
import { mergeUserCouponsWithOffers } from "@/lib/campaigns/coupon-library-storage";
import {
  createCouponRecommendations,
  createDefaultOfferLibrary,
  createSequenceLogicFromPreset,
  deriveWorkflowFromSequenceLogic,
  DEFAULT_WORKFLOW_GOAL,
  validateSequenceLogic,
} from "@/lib/campaigns/workflow";
import { WizardStepper } from "./wizard/wizard-stepper";
import { StepSetup } from "./wizard/step-setup";
import { StepAudienceTriggers } from "./wizard/step-audience-triggers";
import { StepMessageChannels } from "./wizard/step-message-channels";
import { StepWorkflow } from "./wizard/step-workflow";
import { StepReviewLaunch } from "./wizard/step-review-launch";

export interface WizardFormData {
  name: string;
  type: CampaignType;
  templateId: string | null;
  audienceSegments: AudienceSegment[];
  exclusionRules: ExclusionRule[];
  audienceSize: number;
  trigger: CampaignTrigger;
  messages: WizardSequenceMessage[];
  sequenceLogic: CampaignSequenceLogic;
  workflow?: CampaignWorkflow;
  /** User-dragged positions for workflow canvas nodes (presentation-only; optional). */
  workflowNodeLayout?: Record<string, { x: number; y: number }>;
  offers: CampaignOffer[];
  couponRecommendations: CouponRecommendation[];
  campaignGoal: WorkflowGoal;
  responseTracking: ResponseTrackingSettings;
  fallbackPaths: WorkflowFallbackPaths;
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
  channel: "sms",
};

const DEFAULT_OFFERS = createDefaultOfferLibrary();

const INITIAL_FORM_DATA: WizardFormData = {
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
  sequenceLogic: createSequenceLogicFromPreset({
    presetId: "no-response-escalation",
    messages: [DEFAULT_SINGLE_MESSAGE],
    offers: DEFAULT_OFFERS,
    goal: DEFAULT_WORKFLOW_GOAL,
  }),
  workflow: deriveWorkflowFromSequenceLogic({
    messages: [DEFAULT_SINGLE_MESSAGE],
    offers: DEFAULT_OFFERS,
    sequenceLogic: createSequenceLogicFromPreset({
      presetId: "no-response-escalation",
      messages: [DEFAULT_SINGLE_MESSAGE],
      offers: DEFAULT_OFFERS,
      goal: DEFAULT_WORKFLOW_GOAL,
    }),
    goal: DEFAULT_WORKFLOW_GOAL,
  }),
  workflowNodeLayout: undefined,
  offers: DEFAULT_OFFERS,
  couponRecommendations: createCouponRecommendations(DEFAULT_OFFERS),
  campaignGoal: DEFAULT_WORKFLOW_GOAL,
  responseTracking: DEFAULT_RESPONSE_TRACKING,
  fallbackPaths: DEFAULT_WORKFLOW_FALLBACK_PATHS,
  channels: [],
  complianceChecklist: DEFAULT_COMPLIANCE_CHECKLIST,
};

function applyUserCouponLibraryToFormData(data: WizardFormData): WizardFormData {
  const mergedOffers = mergeUserCouponsWithOffers(data.offers);
  const presetId =
    data.sequenceLogic.presetId ?? "no-response-escalation";
  const sequenceLogic = createSequenceLogicFromPreset({
    presetId,
    messages: data.messages,
    offers: mergedOffers,
    goal: data.campaignGoal,
  });
  const workflow = deriveWorkflowFromSequenceLogic({
    messages: data.messages,
    offers: mergedOffers,
    sequenceLogic,
    preferredSendWindow: data.preferredSendWindow,
    goal: data.campaignGoal,
  });
  const validationErrors = validateSequenceLogic(
    data.messages,
    sequenceLogic,
    mergedOffers,
  );
  return {
    ...data,
    offers: mergedOffers,
    sequenceLogic: { ...sequenceLogic, validationErrors },
    workflow: {
      ...workflow,
      validationErrors: Array.from(
        new Set([
          ...validationErrors,
          ...(workflow.validationErrors ?? []),
        ]),
      ),
    },
    couponRecommendations: createCouponRecommendations(mergedOffers),
  };
}

function mergeInitialFormData(
  initialData?: Partial<WizardFormData> & {
    atlasSuggestedOffer?: Partial<CampaignOffer>;
    atlasSuggestedOffers?: Partial<CampaignOffer>[];
  },
): WizardFormData {
  if (!initialData) {
    return applyUserCouponLibraryToFormData(INITIAL_FORM_DATA);
  }

  const { atlasSuggestedOffer, atlasSuggestedOffers, ...rest } = initialData;

  const baseMessages = rest.messages ?? INITIAL_FORM_DATA.messages;
  let offers = rest.offers ?? INITIAL_FORM_DATA.offers;
  let messages = baseMessages;

  if (atlasSuggestedOffers?.length) {
    const mergedTierOffers = atlasSuggestedOffers.map((partial) =>
      mergePartialCampaignOffer({
        id: createNewCampaignOfferId(),
        ...partial,
      }),
    );
    offers = [...mergedTierOffers, ...(rest.offers ?? createDefaultOfferLibrary())];
    const firstOfferId = mergedTierOffers[0]?.id;
    messages = baseMessages.map((m, i) =>
      i === 0 && firstOfferId ? { ...m, offerId: firstOfferId } : m,
    );
  } else if (atlasSuggestedOffer) {
    const atlas = mergePartialCampaignOffer({
      id: createNewCampaignOfferId(),
      ...atlasSuggestedOffer,
    });
    offers = [atlas, ...(rest.offers ?? createDefaultOfferLibrary())];
    messages = baseMessages.map((m, i) =>
      i === 0 ? { ...m, offerId: atlas.id } : m,
    );
  }

  const merged: WizardFormData = {
    ...INITIAL_FORM_DATA,
    ...rest,
    offers,
    messages,
    trigger: rest.trigger
      ? { ...INITIAL_FORM_DATA.trigger, ...rest.trigger }
      : INITIAL_FORM_DATA.trigger,
    couponRecommendations: createCouponRecommendations(offers),
  };
  return applyUserCouponLibraryToFormData(merged);
}

const STEP_COUNT = 5;

const stepTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

interface CampaignWizardProps {
  onCancel: () => void;
  onComplete: (data: WizardFormData) => void;
  initialData?: Partial<WizardFormData> & {
    atlasSuggestedOffer?: Partial<CampaignOffer>;
    atlasSuggestedOffers?: Partial<CampaignOffer>[];
  };
}

export function CampaignWizard({
  onCancel,
  onComplete,
  initialData,
}: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<WizardFormData>(
    mergeInitialFormData(initialData),
  );

  const updateFormData = useCallback(
    (updates: Partial<WizardFormData>) => {
      setFormData((prev) => {
        const next = { ...prev, ...updates };
        const validatedSequenceLogic = {
          ...next.sequenceLogic,
          validationErrors: validateSequenceLogic(
            next.messages,
            next.sequenceLogic,
            next.offers,
          ),
        };
        const workflow = deriveWorkflowFromSequenceLogic({
          messages: next.messages,
          offers: next.offers,
          sequenceLogic: validatedSequenceLogic,
          preferredSendWindow: next.preferredSendWindow,
          goal: next.campaignGoal,
        });

        return {
          ...next,
          sequenceLogic: validatedSequenceLogic,
          workflow: {
            ...workflow,
            validationErrors: Array.from(
              new Set([
                ...(validatedSequenceLogic.validationErrors ?? []),
                ...(workflow.validationErrors ?? []),
              ]),
            ),
          },
        };
      });
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Stepper */}
      <div className="shrink-0 border-b px-8">
        <WizardStepper
          currentStep={currentStep}
          onStepClick={handleGoToStep}
        />
      </div>

      {/* Step Content with animations */}
      <div className="min-h-0 flex-1 overflow-y-auto px-8">
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
              <StepWorkflow
                formData={formData}
                onUpdate={updateFormData}
                onGoToStep={handleGoToStep}
              />
            )}
            {currentStep === 4 && (
              <StepReviewLaunch
                formData={formData}
                onUpdate={updateFormData}
                onLaunch={handleLaunch}
                onGoToStep={handleGoToStep}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between border-t bg-background px-8 py-4">
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
