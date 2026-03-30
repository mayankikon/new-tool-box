"use client";

import { useState } from "react";

import { PortfolioCheckboxControl } from "@/components/ui/portfolio-checkbox";
import { PortfolioRadioButton } from "@/components/ui/portfolio-radio";
import { RadioGroup } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

/**
 * Portfolio 3.0 form-control state matrix for pixel QA.
 */
export function MagicPathFormControlsShowcase({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const [checkboxInactive, setCheckboxInactive] = useState(false);
  const [checkboxActive, setCheckboxActive] = useState(true);
  const [checkboxDeterminate, setCheckboxDeterminate] = useState(false);
  const [checkboxIndeterminate, setCheckboxIndeterminate] = useState(true);
  const [checkboxFocus, setCheckboxFocus] = useState(true);
  const [checkboxDisabledInactive, setCheckboxDisabledInactive] = useState(false);
  const [checkboxDisabledActive, setCheckboxDisabledActive] = useState(true);

  const [radioInactive, setRadioInactive] = useState("other");
  const [radioActive, setRadioActive] = useState("target");
  const [radioDeterminate, setRadioDeterminate] = useState("r-a");
  const [radioFocus, setRadioFocus] = useState("focus-a");
  const [radioDisabled, setRadioDisabled] = useState("r-disabled-a");

  return (
    <div
      className={cn("w-full max-w-[560px] bg-white p-4", className)}
      style={{
        boxSizing: "border-box",
        ...style,
      }}
    >
      <div className="mb-3">
        <h3 className="ds-doc-font text-sm font-semibold text-black">Checkbox States</h3>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Inactive</span>
          <PortfolioCheckboxControl
            checked={checkboxInactive}
            onCheckedChange={() => setCheckboxInactive((v) => !v)}
            aria-label="Checkbox inactive state"
          />
        </div>
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Active</span>
          <PortfolioCheckboxControl
            checked={checkboxActive}
            onCheckedChange={() => setCheckboxActive((v) => !v)}
            aria-label="Checkbox active state"
          />
        </div>
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Determinate (unchecked)</span>
          <PortfolioCheckboxControl
            checked={checkboxDeterminate}
            indeterminate={false}
            onCheckedChange={() => setCheckboxDeterminate((v) => !v)}
            aria-label="Checkbox determinate state"
          />
        </div>
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Indeterminate</span>
          <PortfolioCheckboxControl
            checked={false}
            indeterminate={checkboxIndeterminate}
            onCheckedChange={() => setCheckboxIndeterminate((v) => !v)}
            aria-label="Checkbox indeterminate state"
          />
        </div>
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Focus</span>
          <PortfolioCheckboxControl
            checked={checkboxFocus}
            showFocusRing
            onCheckedChange={() => setCheckboxFocus((v) => !v)}
            aria-label="Checkbox focus state"
          />
        </div>
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Disabled</span>
          <div className="flex items-center gap-3">
            <PortfolioCheckboxControl
              checked={checkboxDisabledInactive}
              visualDisabled
              onCheckedChange={() => setCheckboxDisabledInactive((v) => !v)}
              aria-label="Checkbox visual disabled inactive state"
            />
            <PortfolioCheckboxControl
              checked={checkboxDisabledActive}
              visualDisabled
              onCheckedChange={() => setCheckboxDisabledActive((v) => !v)}
              aria-label="Checkbox visual disabled active state"
            />
          </div>
        </div>
      </div>

      <div className="mb-3 mt-6">
        <h3 className="ds-doc-font text-sm font-semibold text-black">Radio States</h3>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Inactive</span>
          <RadioGroup
            value={radioInactive}
            onValueChange={setRadioInactive}
            className="!flex w-auto max-w-full flex-row items-center gap-3"
          >
            <PortfolioRadioButton value="target" aria-label="Radio inactive target state" />
            <PortfolioRadioButton value="other" aria-label="Radio inactive alternate state" />
          </RadioGroup>
        </div>
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Active</span>
          <RadioGroup
            value={radioActive}
            onValueChange={setRadioActive}
            className="!flex w-auto max-w-full flex-row items-center gap-3"
          >
            <PortfolioRadioButton value="target" aria-label="Radio active target state" />
            <PortfolioRadioButton value="other" aria-label="Radio active alternate state" />
          </RadioGroup>
        </div>
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Determinate (in group)</span>
          <RadioGroup
            value={radioDeterminate}
            onValueChange={setRadioDeterminate}
            className="!flex w-auto max-w-full flex-row items-center gap-3"
          >
            <PortfolioRadioButton value="r-a" aria-label="Determinate radio selected state" />
            <PortfolioRadioButton value="r-b" aria-label="Determinate radio unselected state" />
          </RadioGroup>
        </div>
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Focus</span>
          <RadioGroup
            value={radioFocus}
            onValueChange={setRadioFocus}
            className="!flex w-auto max-w-full flex-row items-center gap-3"
          >
            <PortfolioRadioButton value="focus-a" showFocusRing aria-label="Radio focus primary state" />
            <PortfolioRadioButton value="focus-b" showFocusRing aria-label="Radio focus secondary state" />
          </RadioGroup>
        </div>
        <div className="grid grid-cols-[160px_auto] items-center gap-3">
          <span className="ds-doc-font text-xs text-neutral-600">Disabled</span>
          <RadioGroup
            value={radioDisabled}
            onValueChange={setRadioDisabled}
            className="!flex w-auto max-w-full flex-row items-center gap-3"
          >
            <PortfolioRadioButton value="r-disabled-a" visualDisabled aria-label="Radio visual disabled state A" />
            <PortfolioRadioButton value="r-disabled-b" visualDisabled aria-label="Radio visual disabled state B" />
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
