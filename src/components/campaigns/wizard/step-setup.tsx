"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Wrench,
  Droplets,
  Battery,
  Shield,
  Sun,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CAMPAIGN_TEMPLATES,
  CAMPAIGN_TYPE_LABELS,
  PERSONALIZATION_VARIABLES,
} from "@/lib/campaigns/mock-data";
import type { CampaignTemplate, PersonalizationVariable } from "@/lib/campaigns/types";
import type { WizardFormData } from "../campaign-wizard";

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  "tpl-001": <UserPlus className="size-5" />,
  "tpl-002": <Wrench className="size-5" />,
  "tpl-003": <Droplets className="size-5" />,
  "tpl-004": <Battery className="size-5" />,
  "tpl-005": <Shield className="size-5" />,
  "tpl-006": <Sun className="size-5" />,
};

/** Semantic icon colors by use case: same category = same color. */
const TEMPLATE_SEMANTIC_COLORS: Record<
  string,
  { bg: string; text: string; hoverBg: string }
> = {
  "new-owner": {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    hoverBg: "group-hover:bg-blue-500/15",
  },
  "service-reminder": {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    hoverBg: "group-hover:bg-amber-500/15",
  },
  "oil-change": {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    hoverBg: "group-hover:bg-amber-500/15",
  },
  "battery-health": {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    hoverBg: "group-hover:bg-orange-500/15",
  },
  "warranty-expiration": {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    hoverBg: "group-hover:bg-indigo-500/15",
  },
  "seasonal-promotion": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    hoverBg: "group-hover:bg-emerald-500/15",
  },
};

function getSemanticIconClasses(template: { category: string }, isSelected: boolean) {
  if (isSelected) {
    return "bg-primary/10 text-primary";
  }
  const semantic = TEMPLATE_SEMANTIC_COLORS[template.category];
  if (!semantic) {
    return "bg-muted text-muted-foreground group-hover:bg-primary/15";
  }
  return cn(semantic.bg, semantic.text, semantic.hoverBg);
}

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
      if (!template) {
        onUpdate({
          templateId: null,
          type: "custom",
          audienceSegments: [],
          audienceSize: 0,
          trigger: { type: "time-based", isRecurring: false, config: {} },
          message: {
            subject: "",
            body: "",
            variables: [],
            aiPrompt: "",
            images: [],
          },
          channels: [],
        });
        return;
      }

      const { defaults } = template;
      const firstMsg = defaults.messages?.[0];
      const bodyText = firstMsg?.body ?? "";
      const detectedVars = PERSONALIZATION_VARIABLES.filter((v) =>
        bodyText.includes(`{{${v}}}`),
      ) as PersonalizationVariable[];

      onUpdate({
        templateId: template.id,
        type: template.category,
        name: template.name,
        audienceSegments: defaults.audienceSegments ?? [],
        audienceSize: (defaults.audienceSegments ?? []).length > 0 ? 420 : 0,
        trigger: defaults.trigger ?? {
          type: "time-based",
          isRecurring: false,
          config: {},
        },
        message: firstMsg
          ? {
              subject: firstMsg.subject ?? "",
              body: firstMsg.body,
              variables: detectedVars,
              aiPrompt: "",
              images: [],
            }
          : {
              subject: "",
              body: "",
              variables: [],
              aiPrompt: "",
              images: [],
            },
        channels: defaults.channels ?? [],
      });
    },
    [formData.name, onUpdate],
  );

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
            "flex w-full items-center gap-3 rounded-md border p-4 text-left transition-all duration-200",
            formData.templateId === null
              ? "border-primary bg-primary/5 ring-1 ring-primary"
              : "border-border hover:border-primary/40 hover:bg-accent/50 hover:shadow-sm cursor-pointer",
          )}
        >
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-sm transition-colors",
              formData.templateId === null
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground",
            )}
          >
            <FileText className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium">Start from Scratch</p>
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
            <motion.button
              key={template.id}
              type="button"
              variants={cardVariants}
              onClick={() => handleTemplateSelect(template)}
              className={cn(
                "group flex items-start gap-3 rounded-md border p-4 text-left transition-all duration-200",
                formData.templateId === template.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/40 hover:bg-accent/50 hover:shadow-sm cursor-pointer",
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-sm transition-all duration-200 group-hover:scale-105",
                  getSemanticIconClasses(template, formData.templateId === template.id),
                )}
              >
                {TEMPLATE_ICONS[template.id] ?? (
                  <FileText className="size-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{template.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {template.description}
                </p>
                <Badge variant="secondary" className="mt-2 text-[10px]">
                  {CAMPAIGN_TYPE_LABELS[template.category]}
                </Badge>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
