"use client";

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
import { CodeInline } from "../atoms/CodeInline";
import { SectionTitle } from "../atoms/SectionTitle";

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
    <section id="modal" className="scroll-mt-28 space-y-8">
      <SectionTitle overline={overline} title={title} description={description} />

      <div className="rounded-sm border border-border bg-card p-6 shadow-sm space-y-10">
        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-2">
            Default — text only
          </h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-4">
            Centered header on small viewports; left-aligned from{" "}
            <CodeInline>sm</CodeInline> breakpoint. Primary action uses the
            default button; cancel is outline.
          </p>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" />}>
              Open alert
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved edits. If you leave now, they will be lost.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Discard</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-2">
            Destructive confirmation
          </h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-4">
            Use <CodeInline>variant=&quot;destructive&quot;</CodeInline> on{" "}
            <CodeInline>AlertDialogAction</CodeInline> for delete/remove flows.
          </p>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" />}>
              Delete item
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this vehicle?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes the vehicle from inventory and unlinks related
                  campaigns. You can restore it from the archive within 30 days.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-2">
            Body + input
          </h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-4">
            Body copy full width on top; labeled field below, full width. Useful for
            rename, confirm-by-typing, or short forms.
          </p>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" />}>
              Rename workspace
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Rename workspace</AlertDialogTitle>
                <AlertDialogDescription className="w-full text-center sm:text-left">
                  Choose a new name. This updates the label everywhere in Sort,
                  including shared links and exports.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="w-full">
                <InputGroup className="gap-2">
                  <InputLabel htmlFor="ds-alert-rename-input">
                    Workspace name
                  </InputLabel>
                  <InputContainer size="lg">
                    <Input
                      id="ds-alert-rename-input"
                      placeholder="Acme Fleet"
                      standalone={false}
                      size="lg"
                      defaultValue="North Region"
                    />
                  </InputContainer>
                  <InputHelperText>Max 64 characters</InputHelperText>
                </InputGroup>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Save name</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-2">
            Body + checkboxes
          </h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-4">
            Body copy full width on top; acknowledgements or options below, full
            width.
          </p>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" />}>
              Delete workspace
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
                <AlertDialogDescription className="w-full text-center sm:text-left">
                  All campaigns, assets, and member access for this workspace will
                  be removed. Billing stops at the end of the current period.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex w-full flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <PortfolioCheckboxControl id="ds-alert-del-understand" defaultChecked />
                  <label
                    htmlFor="ds-alert-del-understand"
                    className="font-sans text-sm leading-5 text-foreground select-none"
                  >
                    I understand this cannot be undone
                  </label>
                </div>
                <div className="flex items-start gap-2.5">
                  <PortfolioCheckboxControl id="ds-alert-del-export" />
                  <label
                    htmlFor="ds-alert-del-export"
                    className="font-sans text-sm leading-5 text-foreground select-none"
                  >
                    Email me an export before deletion
                  </label>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive">
                  Delete workspace
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-2">
            Body + input + checkboxes
          </h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-4">
            Body copy full width on top; email field and checkboxes stacked below,
            full width.
          </p>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" />}>
              Transfer ownership
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Transfer ownership</AlertDialogTitle>
                <AlertDialogDescription className="w-full text-center sm:text-left">
                  The new owner will receive billing and full admin rights. You will
                  become a member unless they change your role.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex w-full flex-col gap-4">
                <InputGroup className="gap-2">
                  <InputLabel htmlFor="ds-alert-transfer-email">
                    New owner email
                  </InputLabel>
                  <InputContainer size="lg">
                    <Input
                      id="ds-alert-transfer-email"
                      type="email"
                      placeholder="name@company.com"
                      standalone={false}
                      size="lg"
                      autoComplete="email"
                    />
                  </InputContainer>
                </InputGroup>
                <div className="flex items-start gap-2.5">
                  <PortfolioCheckboxControl id="ds-alert-transfer-notify" defaultChecked />
                  <label
                    htmlFor="ds-alert-transfer-notify"
                    className="font-sans text-sm leading-5 text-foreground select-none"
                  >
                    Notify current members by email
                  </label>
                </div>
                <div className="flex items-start gap-2.5">
                  <PortfolioCheckboxControl id="ds-alert-transfer-billing" />
                  <label
                    htmlFor="ds-alert-transfer-billing"
                    className="font-sans text-sm leading-5 text-foreground select-none"
                  >
                    I accept responsibility for payment method changes
                  </label>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Start transfer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div>
          <h3 className="ds-doc-font text-lg font-medium text-foreground mb-2">
            Compact footer (<CodeInline>size=&quot;sm&quot;</CodeInline>)
          </h3>
          <p className="ds-doc-font text-sm text-muted-foreground mb-4">
            Narrower dialog with a two-column footer grid on small size—suited
            to binary confirm/cancel on touch targets.
          </p>
          <AlertDialog>
            <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
              Remove
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia>
                  <Trash2 className="text-destructive" aria-hidden />
                </AlertDialogMedia>
                <AlertDialogTitle>Remove tag?</AlertDialogTitle>
                <AlertDialogDescription>
                  The tag will be removed from this record only.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel size="sm">Cancel</AlertDialogCancel>
                <AlertDialogAction size="sm" variant="destructive">
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </section>
  );
}
