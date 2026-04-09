"use client";

import { useId, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioCheckboxControl } from "@/components/ui/portfolio-checkbox";
import {
  Input,
  InputContainer,
  InputGroup,
  InputHelperText,
  InputLabel,
} from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { CodeInline } from "../atoms/CodeInline";
import { SectionTitle } from "../atoms/SectionTitle";
import { ShowcaseCard } from "../atoms/ShowcaseCard";

const DIALOG_SIZE_OPTIONS = [
  { id: "default" as const, label: "Default" },
  { id: "sm" as const, label: "SM" },
] as const;

const ACTION_SIZE_OPTIONS = [
  { id: "lg" as const, label: "LG" },
  { id: "sm" as const, label: "SM" },
] as const;

type DialogSizeId = (typeof DIALOG_SIZE_OPTIONS)[number]["id"];
type ActionSizeId = (typeof ACTION_SIZE_OPTIONS)[number]["id"];

function DocCodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
      <code>{children}</code>
    </pre>
  );
}

function DocSubheading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="ds-doc-font text-lg font-medium tracking-tight text-foreground">{children}</h3>
  );
}

function DocLead({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("ds-doc-font text-sm text-muted-foreground", className)}>{children}</p>;
}

function ToggleTabList<T extends string>({
  title,
  options,
  value,
  onValueChange,
}: {
  title: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onValueChange: (next: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="ds-doc-font text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-wrap items-center gap-2">
        {options.map(({ id, label }) => {
          const isActive = id === value;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onValueChange(id)}
              className={cn(
                "inline-flex min-h-8 items-center rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "border-foreground/15 bg-foreground/6 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/15 hover:bg-muted/40 hover:text-foreground",
              )}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DefaultDialogPreview({
  dialogSize,
  actionSize,
}: {
  dialogSize: DialogSizeId;
  actionSize: ActionSizeId;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>Open preview</AlertDialogTrigger>
      <AlertDialogContent size={dialogSize}>
        <AlertDialogHeader>
          <AlertDialogTitle>Discard changes?</AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved edits. If you leave now, they will be lost. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size={actionSize}>Cancel</AlertDialogCancel>
          <AlertDialogAction size={actionSize}>Discard</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DestructiveDialogPreview({
  dialogSize,
  actionSize,
}: {
  dialogSize: DialogSizeId;
  actionSize: ActionSizeId;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>Open preview</AlertDialogTrigger>
      <AlertDialogContent size={dialogSize}>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Trash2 className="text-destructive" aria-hidden />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete this vehicle?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the vehicle from inventory and unlinks related campaigns. You can restore it from archive
            within 30 days.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel size={actionSize}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" size={actionSize}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FormDialogPreview({
  dialogSize,
  actionSize,
}: {
  dialogSize: DialogSizeId;
  actionSize: ActionSizeId;
}) {
  const inputId = useId();
  const acknowledgeId = useId();

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>Open preview</AlertDialogTrigger>
      <AlertDialogContent size={dialogSize}>
        <AlertDialogHeader>
          <AlertDialogTitle>Transfer ownership</AlertDialogTitle>
          <AlertDialogDescription className="w-full text-center sm:text-left">
            The new owner will receive billing and full admin rights. You will become a member unless they change your
            role.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex w-full flex-col gap-4">
          <InputGroup className="gap-2">
            <InputLabel htmlFor={inputId}>New owner email</InputLabel>
            <InputContainer size="lg">
              <Input id={inputId} type="email" placeholder="name@company.com" standalone={false} size="lg" />
            </InputContainer>
            <InputHelperText>Must be an active workspace member email.</InputHelperText>
          </InputGroup>
          <div className="flex items-start gap-2.5">
            <PortfolioCheckboxControl id={acknowledgeId} defaultChecked />
            <label htmlFor={acknowledgeId} className="font-sans text-sm leading-5 text-foreground select-none">
              Notify current members by email
            </label>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel size={actionSize}>Cancel</AlertDialogCancel>
          <AlertDialogAction size={actionSize}>Start transfer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ModalVariantExamplePanel({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: "default" | "destructive" | "form";
}) {
  const [dialogSize, setDialogSize] = useState<DialogSizeId>(type === "destructive" ? "sm" : "default");
  const [actionSize, setActionSize] = useState<ActionSizeId>(type === "destructive" ? "sm" : "lg");

  const preview =
    type === "destructive" ? (
      <DestructiveDialogPreview dialogSize={dialogSize} actionSize={actionSize} />
    ) : type === "form" ? (
      <FormDialogPreview dialogSize={dialogSize} actionSize={actionSize} />
    ) : (
      <DefaultDialogPreview dialogSize={dialogSize} actionSize={actionSize} />
    );

  const snippet =
    type === "destructive"
      ? `<AlertDialog>
  <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
    Open preview
  </AlertDialogTrigger>
  <AlertDialogContent size="${dialogSize}">
    <AlertDialogHeader>
      <AlertDialogMedia>
        <Trash2 className="text-destructive" />
      </AlertDialogMedia>
      <AlertDialogTitle>Delete this vehicle?</AlertDialogTitle>
      <AlertDialogDescription>
        This removes the vehicle from inventory...
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel size="${actionSize}">Cancel</AlertDialogCancel>
      <AlertDialogAction variant="destructive" size="${actionSize}">Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`
      : type === "form"
        ? `<AlertDialog>
  <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
    Open preview
  </AlertDialogTrigger>
  <AlertDialogContent size="${dialogSize}">
    <AlertDialogHeader>
      <AlertDialogTitle>Transfer ownership</AlertDialogTitle>
      <AlertDialogDescription>...</AlertDialogDescription>
    </AlertDialogHeader>
    <InputGroup>...</InputGroup>
    <AlertDialogFooter>
      <AlertDialogCancel size="${actionSize}">Cancel</AlertDialogCancel>
      <AlertDialogAction size="${actionSize}">Start transfer</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`
        : `<AlertDialog>
  <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
    Open preview
  </AlertDialogTrigger>
  <AlertDialogContent size="${dialogSize}">
    <AlertDialogHeader>
      <AlertDialogTitle>Discard changes?</AlertDialogTitle>
      <AlertDialogDescription>...</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel size="${actionSize}">Cancel</AlertDialogCancel>
      <AlertDialogAction size="${actionSize}">Discard</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`;

  return (
    <div className="w-full max-w-full space-y-4">
      <div className="space-y-1">
        <DocSubheading>{title}</DocSubheading>
        <DocLead>{description}</DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-6">
          <ToggleTabList title="Dialog size" options={DIALOG_SIZE_OPTIONS} value={dialogSize} onValueChange={setDialogSize} />
          <ToggleTabList title="Action size" options={ACTION_SIZE_OPTIONS} value={actionSize} onValueChange={setActionSize} />
        </div>
        <div className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-border bg-muted/25 p-8">
          {preview}
        </div>
        <DocCodeBlock>{snippet}</DocCodeBlock>
      </ShowcaseCard>
    </div>
  );
}

function ModalVariantExamplesBlock() {
  return (
    <div className="space-y-10">
      <ModalVariantExamplePanel
        title="Default"
        description="Baseline confirmation modal. Best for low-risk choices where the user needs a final confirmation before continuing."
        type="default"
      />
      <ModalVariantExamplePanel
        title="Destructive"
        description="Use for irreversible or high-risk actions. Pair with destructive action styling and concise consequence copy."
        type="destructive"
      />
      <ModalVariantExamplePanel
        title="Form Content"
        description="Use when the modal needs one small form step (email input, acknowledgement, or lightweight settings)."
        type="form"
      />
    </div>
  );
}

function ModalReferenceMatrixShowcase() {
  const [actionSize, setActionSize] = useState<ActionSizeId>("lg");

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <DocSubheading>Reference: variants × dialog size</DocSubheading>
        <DocLead>
          Compare modal variants in <CodeInline>default</CodeInline> and <CodeInline>sm</CodeInline> container sizes.
          Use controls to inspect footer action density.
        </DocLead>
      </div>
      <ShowcaseCard padding="lg" className="w-full max-w-full overflow-x-auto">
        <p className="ds-doc-font mb-6 text-sm text-muted-foreground">
          All previews are live. Click any cell to open the modal with that exact variant and container size.
        </p>
        <div className="mb-6">
          <ToggleTabList
            title="Action size (matrix)"
            options={ACTION_SIZE_OPTIONS}
            value={actionSize}
            onValueChange={setActionSize}
          />
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="w-[140px] pb-2 pr-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Variant
                </th>
                {DIALOG_SIZE_OPTIONS.map(({ id }) => (
                  <th key={id} className="px-2 pb-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="w-[140px] py-3 pr-4 align-middle text-sm font-medium text-foreground">Default</td>
                {DIALOG_SIZE_OPTIONS.map(({ id }) => (
                  <td key={`default-${id}`} className="px-2 py-3 align-middle">
                    <div className="flex justify-center">
                      <DefaultDialogPreview dialogSize={id} actionSize={actionSize} />
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/60">
                <td className="w-[140px] py-3 pr-4 align-middle text-sm font-medium text-foreground">Destructive</td>
                {DIALOG_SIZE_OPTIONS.map(({ id }) => (
                  <td key={`destructive-${id}`} className="px-2 py-3 align-middle">
                    <div className="flex justify-center">
                      <DestructiveDialogPreview dialogSize={id} actionSize={actionSize} />
                    </div>
                  </td>
                ))}
              </tr>
              <tr className="border-b border-border/60 last:border-b-0">
                <td className="w-[140px] py-3 pr-4 align-middle text-sm font-medium text-foreground">Form</td>
                {DIALOG_SIZE_OPTIONS.map(({ id }) => (
                  <td key={`form-${id}`} className="px-2 py-3 align-middle">
                    <div className="flex justify-center">
                      <FormDialogPreview dialogSize={id} actionSize={actionSize} />
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </ShowcaseCard>
    </div>
  );
}

export interface AlertDialogShowcaseSectionProps {
  overline?: string;
  title?: string;
  description?: React.ReactNode;
}

export function AlertDialogShowcaseSection({
  overline,
  title = "Modal",
  description,
}: AlertDialogShowcaseSectionProps) {
  return (
    <section id="modal" className="scroll-mt-28 space-y-10">
      <SectionTitle overline={overline} title={title} description={description} />
      <div className="space-y-10">
        <ModalVariantExamplesBlock />
        <ModalReferenceMatrixShowcase />
      </div>
    </section>
  );
}
