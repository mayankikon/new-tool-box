"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { Plus, Trash2, Sparkles, Users, ChevronDown, X as XIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import {
  SEGMENT_FIELD_DEFS,
  SEGMENT_CATEGORIES,
} from "@/lib/campaigns/mock-data";
import { VEHICLE_MODELS_BY_MAKE } from "@/lib/campaigns/vehicle-data";
import type { VehicleModel } from "@/lib/campaigns/vehicle-data";
import type { AudienceSegment } from "@/lib/campaigns/types";
import type { WizardFormData } from "../campaign-wizard";

interface StepAudienceProps {
  formData: WizardFormData;
  onUpdate: (updates: Partial<WizardFormData>) => void;
}

export function StepAudience({ formData, onUpdate }: StepAudienceProps) {
  const [aiQuery, setAiQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [modelPickerOpenFor, setModelPickerOpenFor] = useState<string | null>(null);
  const ruleCounterRef = useRef(formData.audienceSegments.length);

  const { audienceSegments, audienceSize } = formData;

  const updateAudience = useCallback(
    (segments: AudienceSegment[], size: number) => {
      onUpdate({ audienceSegments: segments, audienceSize: size });
    },
    [onUpdate],
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
    const newSegments = [...audienceSegments, newRule];
    updateAudience(newSegments, estimateAudienceSize(newSegments.length));
  }, [audienceSegments, updateAudience]);

  const removeRule = useCallback(
    (ruleId: string) => {
      const newSegments = audienceSegments.filter((s) => s.id !== ruleId);
      updateAudience(
        newSegments,
        newSegments.length > 0 ? estimateAudienceSize(newSegments.length) : 0,
      );
    },
    [audienceSegments, updateAudience],
  );

  const updateRule = useCallback(
    (ruleId: string, updates: Partial<AudienceSegment>) => {
      const newSegments = audienceSegments.map((s) =>
        s.id === ruleId ? { ...s, ...updates } : s,
      );
      updateAudience(newSegments, estimateAudienceSize(newSegments.length));
    },
    [audienceSegments, updateAudience],
  );

  const handleAiGenerate = useCallback(async () => {
    if (!aiQuery.trim()) return;
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    ruleCounterRef.current += 3;
    const base = ruleCounterRef.current;
    const mockRules: AudienceSegment[] = [
      { id: `seg-ai-${base - 2}`, field: "Make", operator: "equals", value: "Toyota" },
      { id: `seg-ai-${base - 1}`, field: "Mileage Since Last Service", operator: "greater than", value: "4500 miles" },
      { id: `seg-ai-${base}`, field: "OEM Service Interval Status", operator: "equals", value: "Upcoming" },
    ];

    updateAudience(mockRules, 420);
    setIsGenerating(false);
  }, [aiQuery, updateAudience]);

  const fieldsByCategory = SEGMENT_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat] = SEGMENT_FIELD_DEFS.filter((f) => f.category === cat);
      return acc;
    },
    {} as Record<string, typeof SEGMENT_FIELD_DEFS>,
  );

  const selectedMake = useMemo(() => {
    const makeRule = audienceSegments.find(
      (s) => s.field === "Make" && s.value,
    );
    return makeRule?.value ?? null;
  }, [audienceSegments]);

  const availableModels: VehicleModel[] = useMemo(() => {
    if (selectedMake && VEHICLE_MODELS_BY_MAKE[selectedMake]) {
      return VEHICLE_MODELS_BY_MAKE[selectedMake];
    }
    return Object.values(VEHICLE_MODELS_BY_MAKE).flat();
  }, [selectedMake]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      {/* Header + Audience Size */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Define Your Audience</h3>
          <p className="text-sm text-muted-foreground">
            Build rules to target the right customers
          </p>
        </div>
        {audienceSize > 0 && (
          <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2">
            <Users className="size-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              ~{audienceSize.toLocaleString()} customers
            </span>
          </div>
        )}
      </div>

      {/* AI Assist */}
      <Card>
        <button
          type="button"
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="flex w-full items-center gap-2 px-4 py-3 text-left"
        >
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium">AI Assist</span>
          <span className="text-xs text-muted-foreground">
            — Describe your audience in natural language
          </span>
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
        {audienceSegments.map((segment) => {
          const fieldDef = SEGMENT_FIELD_DEFS.find(
            (f) => f.label === segment.field,
          );
          const isModelField = fieldDef?.id === "vehicle_model";
          const selectedModelData = isModelField
            ? availableModels.find((m) => m.model === segment.value)
            : null;

          return (
            <div
              key={segment.id}
              className="rounded-md border"
            >
              <div className="flex items-start gap-2 p-3">
                <div className="grid flex-1 gap-2 sm:grid-cols-3">
                  {/* Field */}
                  <Select
                    value={segment.field}
                    onValueChange={(val) => {
                      if (!val) return;
                      const newField = SEGMENT_FIELD_DEFS.find(
                        (f) => f.label === val,
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
                      {Object.entries(fieldsByCategory).map(([cat, fields]) => (
                        <SelectGroup key={cat}>
                          <SelectLabel>{cat}</SelectLabel>
                          {fields.map((f) => (
                            <SelectItem key={f.id} value={f.label}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Operator */}
                  <Select
                    value={segment.operator}
                    items={(fieldDef?.operators ?? ["equals"]).map((op) => ({
                      value: op,
                      label: op,
                    }))}
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

                  {/* Value — Model field uses a card-grid picker */}
                  {isModelField ? (
                    <button
                      type="button"
                      onClick={() =>
                        setModelPickerOpenFor(
                          modelPickerOpenFor === segment.id ? null : segment.id,
                        )
                      }
                      className={cn(
                        "flex h-8 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors hover:border-input-hover hover:bg-[var(--theme-background-input-hover)]",
                        !segment.value && "text-muted-foreground",
                      )}
                    >
                      <span className="truncate">
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
                  className="mt-0.5 shrink-0"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>

              {/* Model card-grid picker */}
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
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {availableModels.map((vm) => (
                      <button
                        key={vm.model}
                        type="button"
                        onClick={() => {
                          updateRule(segment.id, { value: vm.model });
                          setModelPickerOpenFor(null);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-md border p-2 transition-colors hover:border-primary hover:bg-primary/5",
                          segment.value === vm.model &&
                            "border-primary bg-primary/10",
                        )}
                      >
                        {vm.imageUrl ? (
                          <Image
                            src={vm.imageUrl}
                            alt={vm.model}
                            width={160}
                            height={80}
                            unoptimized
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

              {/* Vehicle image preview when a model is selected */}
              {selectedModelData?.imageUrl &&
                modelPickerOpenFor !== segment.id && (
                  <div className="flex items-center gap-4 border-t bg-muted/30 px-4 py-3">
                    <Image
                      src={selectedModelData.imageUrl}
                      alt={selectedModelData.model}
                      width={240}
                      height={120}
                      unoptimized
                      className="h-20 w-auto rounded-sm object-contain"
                    />
                    <span className="text-sm font-medium text-muted-foreground">
                      {selectedMake ? `${selectedMake} ` : ""}
                      {selectedModelData.model}
                    </span>
                  </div>
                )}
            </div>
          );
        })}

        <Button variant="outline" size="sm" onClick={addRule}>
          <Plus className="size-3.5" />
          Add Rule
        </Button>
      </div>
    </div>
  );
}

function estimateAudienceSize(ruleCount: number): number {
  const base = 2400;
  const reduction = Math.min(ruleCount * 350, base - 100);
  return base - reduction;
}
