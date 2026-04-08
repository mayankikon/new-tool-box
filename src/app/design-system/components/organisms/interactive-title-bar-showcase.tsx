"use client";

import * as React from "react";

import { TitleBar } from "@/components/app/title-bar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TitleBarButtonMode = "none" | "primary" | "primarySecondary";

export function InteractiveTitleBarShowcase() {
  const [showBreadcrumbs, setShowBreadcrumbs] = React.useState(true);
  const [showDescription, setShowDescription] = React.useState(true);
  const [buttonMode, setButtonMode] = React.useState<TitleBarButtonMode>(
    "primarySecondary",
  );

  const breadcrumbs = showBreadcrumbs
    ? [
        { label: "Marketing", href: "#" },
        { label: "Campaigns", href: "#" },
        { label: "Create" },
      ]
    : undefined;

  const right =
    buttonMode === "primary" ? (
      <Button type="button" size="header">
        Save Draft
      </Button>
    ) : buttonMode === "primarySecondary" ? (
      <>
        <Button type="button" variant="secondary" size="header">
          Cancel
        </Button>
        <Button type="button" size="header">
          Save Draft
        </Button>
      </>
    ) : undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card/40 p-4 space-y-4">
        <p className="text-sm font-medium text-foreground">Preview options</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showBreadcrumbs}
              onChange={(e) => setShowBreadcrumbs(e.target.checked)}
              className="size-4 rounded border-input accent-primary"
            />
            <span>Breadcrumbs</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDescription}
              onChange={(e) => setShowDescription(e.target.checked)}
              className="size-4 rounded border-input accent-primary"
            />
            <span>Description</span>
          </label>
        </div>
        <fieldset className="space-y-2 border-0 p-0">
          <legend className="mb-1 text-sm font-medium text-foreground">Actions</legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {(
              [
                { value: "primary" as const, label: "Primary only" },
                {
                  value: "primarySecondary" as const,
                  label: "Primary and secondary",
                },
                { value: "none" as const, label: "None" },
              ] satisfies { value: TitleBarButtonMode; label: string }[]
            ).map(({ value, label }) => (
              <label
                key={value}
                className={cn(
                  "flex cursor-pointer items-center gap-2 text-sm",
                  value === buttonMode && "text-foreground",
                )}
              >
                <input
                  type="radio"
                  name="title-bar-button-mode"
                  value={value}
                  checked={buttonMode === value}
                  onChange={() => setButtonMode(value)}
                  className="size-4 accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <TitleBar
          breadcrumbs={breadcrumbs}
          title="Create Campaign"
          subtitle={
            showDescription
              ? "Configure targeting, channels and schedule."
              : undefined
          }
          right={right}
        />
      </div>
    </div>
  );
}
