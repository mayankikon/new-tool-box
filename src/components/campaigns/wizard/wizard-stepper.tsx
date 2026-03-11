"use client";

import { Fragment } from "react";
import { Check, MessageSquare, Rocket, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Campaign Setup", icon: Sparkles },
  { label: "Audience & Triggers", icon: Users },
  { label: "Message & Channels", icon: MessageSquare },
  { label: "Review & Launch", icon: Rocket },
] as const;

interface WizardStepperProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

export function WizardStepper({ currentStep, onStepClick }: WizardStepperProps) {
  return (
    <nav aria-label="Campaign wizard progress" className="py-5 pb-12">
      <div className="flex items-center justify-center">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const StepIcon = step.icon;

          return (
            <Fragment key={step.label}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => isCompleted && onStepClick(index)}
                  disabled={!isCompleted}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-colors duration-200",
                    isCompleted &&
                      "cursor-pointer bg-primary text-primary-foreground hover:opacity-80",
                    isCurrent &&
                      "border-2 border-primary bg-background text-primary",
                    isUpcoming && "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" />
                  ) : (
                    <StepIcon className="size-4" />
                  )}
                </button>

                <span
                  className={cn(
                    "absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-xs font-medium transition-colors duration-200",
                    isCurrent && "text-primary",
                    isCompleted && "text-foreground",
                    isUpcoming && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className="relative h-0.5 w-[120px] shrink-0 bg-muted"
                  aria-hidden="true"
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: index < currentStep ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <div
        className="sr-only"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-label={`Step ${currentStep + 1} of ${STEPS.length}`}
      />
    </nav>
  );
}
