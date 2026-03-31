"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  Plus,
  Trash2,
  Sparkles,
  Users,
  ChevronDown,
  X as XIcon,
  Clock,
  Gauge,
  AlertTriangle,
  Activity,
  MapPin,
  Snowflake,
  UserMinus,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RadioCardGroup, RadioCardOption } from "@/components/ui/radio-card";
import { InlineTip } from "@/components/ui/inline-tip";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/media-paths";
import {
  EXCLUSION_FIELD_DEFS,
  SEGMENT_FIELD_DEFS,
  SEGMENT_CATEGORIES,
  TRIGGER_TYPE_META,
  WINBACK_AT_RISK_PRESETS,
} from "@/lib/campaigns/mock-data";
import { DEFAULT_PROXIMITY_RADIUS_MILES } from "@/lib/campaigns/proximity-trigger-defaults";
import { VEHICLE_MODELS_BY_MAKE } from "@/lib/campaigns/vehicle-data";
import type { VehicleModel } from "@/lib/campaigns/vehicle-data";
import type {
  AudienceSegment,
  CampaignTrigger,
  ExclusionRule,
} from "@/lib/campaigns/types";
import type { WizardFormDataV2 } from "../campaign-wizard-v2";

type TriggerKind = CampaignTrigger["type"];

const TRIGGER_ICONS: Record<TriggerKind, React.ReactNode> = {
  "time-based": <Clock className="size-5" />,
  mileage: <Gauge className="size-5" />,
  diagnostic: <AlertTriangle className="size-5" />,
  health: <Activity className="size-5" />,
  proximity: <MapPin className="size-5" />,
  seasonal: <Snowflake className="size-5" />,
};

const OEM_LOGO_BY_MAKE: Record<string, string> = {
  BMW: mediaUrl("images/oem/bmw.png"),
  Chevrolet: mediaUrl("images/oem/chevrolet.png"),
  Ford: mediaUrl("images/oem/ford.png"),
  Honda: mediaUrl("images/oem/honda.png"),
  Nissan: mediaUrl("images/oem/nissan.png"),
  Toyota: mediaUrl("images/oem/toyota.png"),
};

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(2024, i).toLocaleString("default", { month: "long" }),
}));

function estimateAudienceSize(ruleCount: number): number {
  const base = 2400;
  const reduction = Math.min(ruleCount * 350, base - 100);
  return base - reduction;
}

const fieldsByCategory = SEGMENT_CATEGORIES.reduce(
  (acc, cat) => {
    acc[cat] = SEGMENT_FIELD_DEFS.filter((f) => f.category === cat);
    return acc;
  },
  {} as Record<string, typeof SEGMENT_FIELD_DEFS>
);

interface StepAudienceTriggersV2Props {
  formData: WizardFormDataV2;
  onUpdate: (updates: Partial<WizardFormDataV2>) => void;
}

export function StepAudienceTriggersV2({
  formData,
  onUpdate,
}: StepAudienceTriggersV2Props) {
  const [aiQuery, setAiQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [makePickerOpenFor, setMakePickerOpenFor] = useState<string | null>(
    null
  );
  const [modelPickerOpenFor, setModelPickerOpenFor] = useState<string | null>(
    null
  );
  const ruleCounterRef = useRef(formData.audienceSegments.length);
  const exclusionCounterRef = useRef(formData.exclusionRules?.length ?? 0);

  const { audienceSegments, exclusionRules = [], trigger } = formData;

  const baseAudienceSize =
    audienceSegments.length > 0
      ? estimateAudienceSize(audienceSegments.length)
      : 0;
  const exclusionDeduction = exclusionRules.length * 80;
  const displayAudienceSize = Math.max(
    0,
    baseAudienceSize - exclusionDeduction
  );

  useEffect(() => {
    const size =
      audienceSegments.length > 0
        ? estimateAudienceSize(audienceSegments.length)
        : 0;
    onUpdate({ audienceSize: size });
  }, [audienceSegments.length, onUpdate]);

  const selectedMake =
    audienceSegments.find((s) => s.field === "Make" && s.value)?.value ?? null;

  const availableModels: VehicleModel[] =
    selectedMake && VEHICLE_MODELS_BY_MAKE[selectedMake]
      ? VEHICLE_MODELS_BY_MAKE[selectedMake]
      : Object.values(VEHICLE_MODELS_BY_MAKE).flat();

  const updateAudience = useCallback(
    (segments: AudienceSegment[]) => {
      const size =
        segments.length > 0 ? estimateAudienceSize(segments.length) : 0;
      onUpdate({ audienceSegments: segments, audienceSize: size });
    },
    [onUpdate]
  );

  const addRule = useCallback(() => {
    ruleCounterRef.current += 1;
    const defaultField = SEGMENT_FIELD_DEFS[0];
    const newRule: AudienceSegment = {
      id: `seg-new-${ruleCounterRef.current}`,
      field: defaultField.label,
      operator: defaultField.operators[0],
      value: "",
    };
    updateAudience([...audienceSegments, newRule]);
  }, [audienceSegments, updateAudience]);

  const removeRule = useCallback(
    (ruleId: string) => {
      updateAudience(audienceSegments.filter((s) => s.id !== ruleId));
    },
    [audienceSegments, updateAudience]
  );

  const updateRule = useCallback(
    (ruleId: string, updates: Partial<AudienceSegment>) => {
      updateAudience(
        audienceSegments.map((s) =>
          s.id === ruleId ? { ...s, ...updates } : s
        )
      );
    },
    [audienceSegments, updateAudience]
  );

  const applyPreset = useCallback(
    (preset: (typeof WINBACK_AT_RISK_PRESETS)[number]) => {
      const newIds = preset.segments.map(
        (_, i) => `seg-preset-${preset.id}-${ruleCounterRef.current + i}`
      );
      ruleCounterRef.current += preset.segments.length;
      const newSegments = preset.segments.map((seg, i) => ({
        ...seg,
        id: newIds[i] ?? seg.id,
      }));
      updateAudience([...audienceSegments, ...newSegments]);
    },
    [audienceSegments, updateAudience]
  );

  const updateExclusionRules = useCallback(
    (rules: ExclusionRule[]) => {
      onUpdate({ exclusionRules: rules });
    },
    [onUpdate]
  );

  const addExclusionRule = useCallback(() => {
    exclusionCounterRef.current += 1;
    const first = EXCLUSION_FIELD_DEFS[0];
    const newRule: ExclusionRule = {
      id: `excl-${exclusionCounterRef.current}`,
      field: first.label,
      operator: first.operators[0] ?? "equals",
      value: first.options?.[0] ?? "",
    };
    updateExclusionRules([...exclusionRules, newRule]);
  }, [exclusionRules, updateExclusionRules]);

  const removeExclusionRule = useCallback(
    (id: string) => {
      updateExclusionRules(exclusionRules.filter((r) => r.id !== id));
    },
    [exclusionRules, updateExclusionRules]
  );

  const updateExclusionRule = useCallback(
    (id: string, updates: Partial<ExclusionRule>) => {
      updateExclusionRules(
        exclusionRules.map((r) => (r.id === id ? { ...r, ...updates } : r))
      );
    },
    [exclusionRules, updateExclusionRules]
  );

  const handleAiGenerate = useCallback(async () => {
    if (!aiQuery.trim()) return;
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    ruleCounterRef.current += 3;
    const base = ruleCounterRef.current;
    const mockRules: AudienceSegment[] = [
      {
        id: `seg-ai-${base - 2}`,
        field: "Make",
        operator: "equals",
        value: "Toyota",
      },
      {
        id: `seg-ai-${base - 1}`,
        field: "Mileage Since Last Service",
        operator: "greater than",
        value: "4500 miles",
      },
      {
        id: `seg-ai-${base}`,
        field: "OEM Service Interval Status",
        operator: "equals",
        value: "Upcoming",
      },
    ];

    updateAudience([...audienceSegments, ...mockRules]);
    setIsGenerating(false);
  }, [aiQuery, audienceSegments, updateAudience]);

  const updateTrigger = useCallback(
    (updates: Partial<CampaignTrigger>) => {
      onUpdate({ trigger: { ...trigger, ...updates } });
    },
    [trigger, onUpdate]
  );

  const updateConfig = useCallback(
    (key: string, value: unknown) => {
      updateTrigger({ config: { ...trigger.config, [key]: value } });
    },
    [trigger.config, updateTrigger]
  );

  const handleTypeSelect = useCallback(
    (type: string) => {
      const kind = type as TriggerKind;
      updateTrigger({
        type: kind,
        config:
          kind === "proximity"
            ? { radiusMiles: DEFAULT_PROXIMITY_RADIUS_MILES }
            : {},
      });
    },
    [updateTrigger]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      {/* Audience Builder */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Define Your Audience
          </h3>
          <p className="text-sm text-muted-foreground">
            Build rules to target the right customers
          </p>
        </div>
        {displayAudienceSize > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
            <Users className="size-3.5" />~
            {displayAudienceSize.toLocaleString()} customers
            {exclusionRules.length > 0 && baseAudienceSize > 0 && (
              <span className="text-primary/80"> (after exclusions)</span>
            )}
          </div>
        )}
      </div>

      {/* Quick segments */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Quick segments
        </p>
        <div className="flex flex-wrap gap-2">
          {WINBACK_AT_RISK_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5 cursor-pointer"
            >
              <Zap className="size-3.5 text-primary" />
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Assist */}
      <Card className="border border-border shadow-sm">
        <button
          type="button"
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={cn(
            "flex w-full min-h-[52px] items-center gap-2 px-4 py-3 text-left rounded-none",
            "hover:bg-muted/50 transition-colors cursor-pointer",
            isAiOpen ? "rounded-t-[var(--radius-Card-sm)]" : "rounded-[var(--radius-Card-sm)]"
          )}
        >
          <Sparkles className="size-4 shrink-0 text-primary" />
          <span className="text-sm font-medium">AI Assist</span>
          <span className="text-xs text-muted-foreground">
            — Describe your audience in natural language
          </span>
          <ChevronDown
            className={cn(
              "ml-auto size-4 shrink-0 text-muted-foreground transition-transform",
              isAiOpen && "rotate-180"
            )}
          />
        </button>
        {isAiOpen && (
          <CardContent className="border-t pt-4">
            <div className="space-y-3">
              <Textarea
                placeholder='e.g., "Toyota vehicles due for oil change within 30 days"'
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                onClick={handleAiGenerate}
                disabled={isGenerating || !aiQuery.trim()}
                size="sm"
              >
                <Sparkles className="size-3.5" />
                {isGenerating ? "Generating..." : "Generate Segment"}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Rule Builder */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Add rules manually below or use AI Assist above.
        </p>
        {audienceSegments.map((segment) => {
          const fieldDef = SEGMENT_FIELD_DEFS.find(
            (f) => f.label === segment.field
          );
          const isMakeField = fieldDef?.id === "vehicle_make";
          const isModelField = fieldDef?.id === "vehicle_model";
          const selectedModelData = isModelField
            ? availableModels.find((m) => m.model === segment.value)
            : null;

          return (
            <div key={segment.id} className="rounded-sm border border-border">
              <div className="flex items-start gap-2 p-3">
                <div className="grid flex-1 gap-2 sm:grid-cols-3">
                  <Select
                    value={segment.field}
                    onValueChange={(val) => {
                      if (!val) return;
                      const newField = SEGMENT_FIELD_DEFS.find(
                        (f) => f.label === val
                      );
                      updateRule(segment.id, {
                        field: val,
                        operator: newField?.operators[0] ?? "equals",
                        value: "",
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(fieldsByCategory).map(
                        ([cat, fields]) => (
                          <SelectGroup key={cat}>
                            <SelectLabel>{cat}</SelectLabel>
                            {fields.map((f) => (
                              <SelectItem key={f.id} value={f.label}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <Select
                    value={segment.operator}
                    onValueChange={(val) => {
                      if (!val) return;
                      updateRule(segment.id, { operator: val });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(fieldDef?.operators ?? ["equals"]).map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isMakeField ? (
                    <button
                      type="button"
                      onClick={() =>
                        setMakePickerOpenFor(
                          makePickerOpenFor === segment.id
                            ? null
                            : segment.id
                        )
                      }
                      className={cn(
                        "flex h-8 w-full items-center justify-between gap-1.5 rounded-sm border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors hover:border-input-hover hover:bg-[var(--theme-background-input-hover)]",
                        !segment.value && "text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {segment.value &&
                          OEM_LOGO_BY_MAKE[segment.value] && (
                            <img
                              src={OEM_LOGO_BY_MAKE[segment.value]}
                              alt={segment.value}
                              className="size-4 shrink-0 object-contain"
                            />
                          )}
                        {segment.value || "Select make"}
                      </span>
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  ) : isModelField ? (
                    <button
                      type="button"
                      onClick={() =>
                        setModelPickerOpenFor(
                          modelPickerOpenFor === segment.id
                            ? null
                            : segment.id
                        )
                      }
                      className={cn(
                        "flex h-8 w-full items-center justify-between gap-1.5 rounded-sm border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors hover:border-input-hover hover:bg-[var(--theme-background-input-hover)]",
                        !segment.value && "text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {selectedModelData?.imageUrl && (
                          <img
                            src={selectedModelData.imageUrl}
                            alt={selectedModelData.model}
                            className="h-4 w-8 shrink-0 object-contain"
                          />
                        )}
                        {segment.value || "Select model"}
                      </span>
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  ) : fieldDef?.options ? (
                    <Select
                      value={segment.value}
                      onValueChange={(val) => {
                        if (!val) return;
                        updateRule(segment.id, { value: val });
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldDef.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Input
                        placeholder="Enter value"
                        value={segment.value}
                        onChange={(e) =>
                          updateRule(segment.id, { value: e.target.value })
                        }
                      />
                      {fieldDef?.unit && (
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          {fieldDef.unit}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeRule(segment.id)}
                  className="mt-0.5 shrink-0 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              {isMakeField && makePickerOpenFor === segment.id && (
                <div className="border-t p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Select Make
                    </span>
                    <button
                      type="button"
                      onClick={() => setMakePickerOpenFor(null)}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {(fieldDef?.options ?? []).map((make) => (
                      <button
                        key={make}
                        type="button"
                        onClick={() => {
                          updateRule(segment.id, { value: make });
                          setMakePickerOpenFor(null);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-sm border p-2 transition-colors hover:border-primary hover:bg-primary/5",
                          segment.value === make &&
                            "border-primary bg-primary/10"
                        )}
                      >
                        {OEM_LOGO_BY_MAKE[make] ? (
                          <img
                            src={OEM_LOGO_BY_MAKE[make]}
                            alt={make}
                            className="h-10 w-auto object-contain"
                          />
                        ) : (
                          <div className="flex h-10 w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                            {make}
                          </div>
                        )}
                        <span className="text-xs font-medium">{make}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isModelField && modelPickerOpenFor === segment.id && (
                <div className="border-t p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedMake
                        ? `${selectedMake} Models`
                        : "All Models (select a Make first to filter)"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setModelPickerOpenFor(null)}
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                    >
                      <XIcon className="size-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {availableModels.map((vm) => (
                      <button
                        key={vm.model}
                        type="button"
                        onClick={() => {
                          updateRule(segment.id, { value: vm.model });
                          setModelPickerOpenFor(null);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-sm border p-2 transition-colors hover:border-primary hover:bg-primary/5",
                          segment.value === vm.model &&
                            "border-primary bg-primary/10"
                        )}
                      >
                        {vm.imageUrl ? (
                          <img
                            src={vm.imageUrl}
                            alt={vm.model}
                            width={160}
                            height={80}
                            className="h-16 w-full rounded object-contain"
                          />
                        ) : (
                          <div className="flex h-16 w-full items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                        <span className="text-xs font-medium">{vm.model}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <Button variant="dashed" size="sm" onClick={addRule}>
          <Plus className="size-3.5" />
          Add Rule
        </Button>
      </div>

      {/* Exclusions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserMinus className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Exclusions</h3>
        </div>
        <InlineTip variant="info" title="Tip:">
          Exclude customers who were contacted recently or opted out to improve
          campaign quality.
        </InlineTip>
        {exclusionRules.map((rule) => {
          const fieldDef = EXCLUSION_FIELD_DEFS.find(
            (f) => f.label === rule.field
          );
          return (
            <div
              key={rule.id}
              className="flex items-start gap-2 rounded-sm border border-border p-3"
            >
              <div className="grid flex-1 gap-2 sm:grid-cols-3">
                <Select
                  value={rule.field}
                  onValueChange={(val) => {
                    if (!val) return;
                    const def = EXCLUSION_FIELD_DEFS.find(
                      (f) => f.label === val
                    );
                    updateExclusionRule(rule.id, {
                      field: val,
                      operator: def?.operators[0] ?? "equals",
                      value: def?.options?.[0] ?? "",
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Exclusion type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXCLUSION_FIELD_DEFS.map((f) => (
                      <SelectItem key={f.id} value={f.label}>
                        {f.label}
                        {f.valueLabel ? ` (${f.valueLabel})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={rule.operator}
                  onValueChange={(val) =>
                    val && updateExclusionRule(rule.id, { operator: val })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(fieldDef?.operators ?? ["equals"]).map((op) => (
                      <SelectItem key={op} value={op}>
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldDef?.options ? (
                  <Select
                    value={rule.value}
                    onValueChange={(val) =>
                      val && updateExclusionRule(rule.id, { value: val })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Value" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldDef.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                          {fieldDef.valueLabel
                            ? ` ${fieldDef.valueLabel}`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="Value"
                    value={rule.value}
                    onChange={(e) =>
                      updateExclusionRule(rule.id, { value: e.target.value })
                    }
                  />
                )}
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeExclusionRule(rule.id)}
                className="mt-0.5 shrink-0 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          );
        })}
        <Button variant="dashed" size="sm" onClick={addExclusionRule}>
          <Plus className="size-3.5" />
          Add Exclusion
        </Button>
      </div>

      <div className="py-2">
        <Separator />
      </div>

      {/* Trigger Configuration */}
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Configure Trigger
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose when this campaign should fire
          </p>
        </div>

        <RadioCardGroup
          value={trigger.type}
          onValueChange={handleTypeSelect}
          className="grid gap-3 sm:grid-cols-2"
        >
          {(
            Object.entries(TRIGGER_TYPE_META) as [
              TriggerKind,
              (typeof TRIGGER_TYPE_META)[TriggerKind],
            ][]
          ).map(([type, meta]) => (
            <RadioCardOption
              key={type}
              value={type}
              title={meta.label}
              description={meta.description}
              trailing={
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[var(--radius-xs)] transition-colors",
                    trigger.type === type
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {TRIGGER_ICONS[type]}
                </span>
              }
            />
          ))}
        </RadioCardGroup>

        <div className="space-y-4 rounded-[var(--radius-Card-sm)] border border-border p-4">
          <h4 className="text-sm font-medium">Trigger Settings</h4>

          {trigger.type === "time-based" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Delay / Interval</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    placeholder="30"
                    value={String(trigger.config.delayDays ?? "")}
                    onChange={(e) =>
                      updateConfig("delayDays", Number(e.target.value))
                    }
                  />
                  <Select
                    value={String(trigger.config.unit ?? "days")}
                    onValueChange={(val) => val && updateConfig("unit", val)}
                  >
                    <SelectTrigger className="w-28 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {trigger.type === "mileage" && (
            <div className="space-y-2">
              <Label>Mileage Threshold</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  placeholder="5000"
                  value={String(
                    trigger.config.intervalMiles ??
                      trigger.config.mileageThreshold ??
                      ""
                  )}
                  onChange={(e) =>
                    updateConfig("intervalMiles", Number(e.target.value))
                  }
                />
                <span className="text-sm text-muted-foreground">miles</span>
              </div>
            </div>
          )}

          {trigger.type === "diagnostic" && (
            <div className="space-y-2">
              <Label>DTC Codes</Label>
              <Input
                placeholder="e.g., P0300, P0171"
                value={String(trigger.config.dtcCodes ?? "")}
                onChange={(e) => updateConfig("dtcCodes", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated diagnostic trouble codes
              </p>
            </div>
          )}

          {trigger.type === "health" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Health Metric</Label>
                <Select
                  value={String(
                    trigger.config.metric ?? "battery_percentage"
                  )}
                  onValueChange={(val) => val && updateConfig("metric", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="battery_percentage">
                      Battery Health %
                    </SelectItem>
                    <SelectItem value="tire_tread">
                      Tire Tread Depth
                    </SelectItem>
                    <SelectItem value="brake_pad">
                      Brake Pad Life %
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Threshold</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="40"
                    value={String(trigger.config.healthThreshold ?? "")}
                    onChange={(e) =>
                      updateConfig("healthThreshold", Number(e.target.value))
                    }
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          )}

          {trigger.type === "proximity" && (
            <div className="space-y-2">
              <Label>Geofence Radius</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  placeholder={String(DEFAULT_PROXIMITY_RADIUS_MILES)}
                  value={String(trigger.config.radiusMiles ?? "")}
                  onChange={(e) =>
                    updateConfig("radiusMiles", Number(e.target.value))
                  }
                />
                <span className="text-sm text-muted-foreground">miles</span>
              </div>
            </div>
          )}

          {trigger.type === "seasonal" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Season</Label>
                <Select
                  value={String(trigger.config.season ?? "winter")}
                  onValueChange={(val) => val && updateConfig("season", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="winter">Winter</SelectItem>
                    <SelectItem value="spring">Spring</SelectItem>
                    <SelectItem value="summer">Summer</SelectItem>
                    <SelectItem value="fall">Fall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Month</Label>
                <Select
                  value={String(trigger.config.startMonth ?? 10)}
                  onValueChange={(val) =>
                    val && updateConfig("startMonth", Number(val))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-[var(--radius-xs)] bg-muted/50 p-3">
            <div>
              <p className="text-sm font-medium">Recurring Campaign</p>
              <p className="text-xs text-muted-foreground">
                Automatically re-trigger for new qualifying vehicles
              </p>
            </div>
            <Switch
              checked={trigger.isRecurring}
              onCheckedChange={(checked: boolean) =>
                updateTrigger({ isRecurring: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
