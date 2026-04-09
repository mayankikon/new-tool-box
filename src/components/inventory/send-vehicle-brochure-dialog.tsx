"use client";

import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Input,
  InputContainer,
  InputGroup,
  InputLabel,
} from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface SendVehicleBrochureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function checkboxToBoolean(
  checked: boolean | "indeterminate",
): boolean {
  return checked === true;
}

export function SendVehicleBrochureDialog({
  open,
  onOpenChange,
}: SendVehicleBrochureDialogProps) {
  const baseId = useId();
  const nameId = `${baseId}-name`;
  const emailId = `${baseId}-email`;
  const phoneId = `${baseId}-phone`;
  const pricingCheckboxId = `${baseId}-pricing`;
  const carfaxCheckboxId = `${baseId}-carfax`;

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [includePricingDetails, setIncludePricingDetails] = useState(true);
  const [includeCarfaxReport, setIncludeCarfaxReport] = useState(true);

  function resetFormState() {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setIncludePricingDetails(true);
    setIncludeCarfaxReport(true);
  }

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      resetFormState();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader className="gap-2 pr-10 text-left sm:text-left">
            <DialogTitle className="text-lg font-semibold leading-snug">
              Send Vehicle Brochure
            </DialogTitle>
            <DialogDescription>
              Provide customer contact information to send vehicle information
              details
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <InputGroup className="group">
              <InputLabel htmlFor={nameId}>Customer name</InputLabel>
              <InputContainer size="lg">
                <Input
                  id={nameId}
                  name="customerName"
                  autoComplete="name"
                  placeholder="Full name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  standalone={false}
                  size="lg"
                />
              </InputContainer>
            </InputGroup>

            <InputGroup className="group">
              <InputLabel htmlFor={emailId}>Email</InputLabel>
              <InputContainer size="lg">
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  standalone={false}
                  size="lg"
                />
              </InputContainer>
            </InputGroup>

            <InputGroup className="group">
              <InputLabel htmlFor={phoneId}>Phone number</InputLabel>
              <InputContainer size="lg">
                <Input
                  id={phoneId}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="(555) 555-0100"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  standalone={false}
                  size="lg"
                />
              </InputContainer>
            </InputGroup>

            <fieldset className="space-y-3 border-0 p-0">
              <legend className="sr-only">Attachments to include</legend>
              <div className="flex items-start gap-3">
                <Checkbox
                  id={pricingCheckboxId}
                  checked={includePricingDetails}
                  onCheckedChange={(checked) =>
                    setIncludePricingDetails(checkboxToBoolean(checked))
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor={pricingCheckboxId}
                  className="cursor-pointer text-sm font-normal leading-snug text-foreground"
                >
                  Include pricing details
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id={carfaxCheckboxId}
                  checked={includeCarfaxReport}
                  onCheckedChange={(checked) =>
                    setIncludeCarfaxReport(checkboxToBoolean(checked))
                  }
                  className="mt-0.5"
                />
                <Label
                  htmlFor={carfaxCheckboxId}
                  className="cursor-pointer text-sm font-normal leading-snug text-foreground"
                >
                  Include Carfax report
                </Label>
              </div>
            </fieldset>
          </div>

          <DialogFooter className="mx-0 mb-0 mt-1 border-0 bg-transparent p-0 pt-4 shadow-none sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Send</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
