"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import { TitleBar } from "@/components/app/title-bar";
import { Button } from "@/components/ui/button";
import { PortfolioCheckboxControl } from "@/components/ui/portfolio-checkbox";
import { PortfolioRadioButton } from "@/components/ui/portfolio-radio";
import {
  Input,
  InputAddon,
  InputContainer,
  InputGroup,
  InputHelperText,
  InputLabel,
} from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * Aligns `SelectTrigger` with `Input` size `lg` inside `InputContainer size="lg"` (36px row).
 * Overrides default `data-[size=default]:h-8` and vertical padding on the trigger.
 */
const SELECT_TRIGGER_LG_HEIGHT =
  "box-border !h-9 min-h-9 max-h-9 shrink-0 px-2.5 py-0 text-sm leading-none data-[size=default]:!h-9 data-[size=default]:min-h-9 data-[size=default]:max-h-9";

const SELECT_ROW_CLASS = cn(
  SELECT_TRIGGER_LG_HEIGHT,
  "w-full min-w-0 items-center",
);

const CARD_SURFACE_CLASS =
  "rounded-md border border-sidebar-border bg-sidebar p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

const US_STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
  "DC",
] as const;

const SERVICE_TIME_OPTIONS = [
  "1 Year Airtime",
  "2 Year Airtime",
  "3 Year Airtime",
  "5 Year Airtime",
] as const;

const REGISTER_CUSTOMER_FORM_ID = "register-customer-form";

interface RegisterCustomerPageProps {
  onCancel: () => void;
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[480px_600px] lg:justify-between lg:items-start">
      <header className="min-w-0 space-y-1.5">
        <h2 className="text-base font-medium leading-snug text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </header>
      <div className="min-w-0 w-full space-y-4">{children}</div>
    </div>
  );
}

export function RegisterCustomerPage({ onCancel }: RegisterCustomerPageProps) {
  const baseId = useId();
  const registrationTypeId = `${baseId}-registration-type`;
  const [registrationType, setRegistrationType] = useState<"new" | "existing">(
    "new",
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState("+1");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateCode, setStateCode] = useState<string | undefined>("TX");
  const [zip, setZip] = useState("");
  const [vin, setVin] = useState("");
  const [deviceSerial, setDeviceSerial] = useState("");
  const [serviceTime, setServiceTime] = useState<string>(
    SERVICE_TIME_OPTIONS[2],
  );
  const [salesPrice, setSalesPrice] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const decodedVehicleLine = useMemo(() => {
    if (vin.trim().length !== 17) return null;
    return "2023 Chevrolet Silverado 1500";
  }, [vin]);

  const showMockDeviceSerial = vin.trim().length === 17;
  const effectiveDeviceSerial = showMockDeviceSerial
    ? deviceSerial || "349867431"
    : deviceSerial;

  useEffect(() => {
    if (vin.trim().length !== 17) {
      setDeviceSerial("");
    }
  }, [vin]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!termsAccepted) return;
    onCancel();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-6">
      <TitleBar
        breadcrumbs={[
          { label: "Customers", onClick: onCancel },
          { label: "Register" },
        ]}
        title="Register"
        right={
          <>
            <Button
              type="button"
              variant="secondary"
              size="header"
              leadingIcon={<ArrowLeft />}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={REGISTER_CUSTOMER_FORM_ID}
              size="header"
              leadingIcon={<UserPlus />}
              disabled={!termsAccepted}
            >
              Register
            </Button>
          </>
        }
      />

      <form
        id={REGISTER_CUSTOMER_FORM_ID}
        onSubmit={handleSubmit}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pl-8 pr-8 pb-10 pt-6">
          <div className="flex w-full flex-col gap-6">
            <div className="space-y-3" aria-labelledby={registrationTypeId}>
              <h2
                id={registrationTypeId}
                className="text-base font-medium leading-snug text-foreground"
              >
                Registration Type
              </h2>
              <RadioGroup
                value={registrationType}
                onValueChange={(value) =>
                  setRegistrationType(value as "new" | "existing")
                }
                className="flex flex-row flex-wrap gap-8"
              >
                <label
                  htmlFor={`${baseId}-reg-new`}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <PortfolioRadioButton
                    value="new"
                    id={`${baseId}-reg-new`}
                  />
                  New Customer
                </label>
                <label
                  htmlFor={`${baseId}-reg-existing`}
                  className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                >
                  <PortfolioRadioButton
                    value="existing"
                    id={`${baseId}-reg-existing`}
                  />
                  Existing Customer
                </label>
              </RadioGroup>
            </div>

            <section className={cn(CARD_SURFACE_CLASS, "w-full min-w-0")}>
              <div className="flex flex-col gap-12">
                <FormSection
                  title="Customer Information"
                  description="Collect the customer's full name and primary contact methods. We use this for account access, service updates, and billing-related communication."
                >
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup className="group">
                      <InputLabel htmlFor={`${baseId}-first`}>First Name*</InputLabel>
                      <InputContainer size="lg">
                        <Input
                          id={`${baseId}-first`}
                          name="firstName"
                          autoComplete="given-name"
                          standalone={false}
                          size="lg"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                        />
                      </InputContainer>
                    </InputGroup>
                    <InputGroup className="group">
                      <InputLabel htmlFor={`${baseId}-last`}>Last Name*</InputLabel>
                      <InputContainer size="lg">
                        <Input
                          id={`${baseId}-last`}
                          name="lastName"
                          autoComplete="family-name"
                          standalone={false}
                          size="lg"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                        />
                      </InputContainer>
                    </InputGroup>
                  </div>
                  <InputGroup className="group">
                    <InputLabel htmlFor={`${baseId}-email`}>Email</InputLabel>
                    <InputContainer size="lg">
                      <Input
                        id={`${baseId}-email`}
                        name="email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        standalone={false}
                        size="lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </InputContainer>
                  </InputGroup>
                  <InputGroup className="group w-full">
                    <div className="w-full min-w-0">
                      <InputLabel
                        id={`${baseId}-phone-fields-label`}
                        className="block w-full max-w-full sm:whitespace-nowrap"
                      >
                        Phone Number
                      </InputLabel>
                    </div>
                    <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
                      <InputContainer
                        size="lg"
                        className="w-full shrink-0 sm:w-[60px]"
                      >
                        <Input
                          id={`${baseId}-dial`}
                          name="countryDialCode"
                          type="text"
                          autoComplete="tel-country-code"
                          inputMode="numeric"
                          standalone={false}
                          size="lg"
                          placeholder="+1"
                          value={dialCode}
                          onChange={(e) => setDialCode(e.target.value)}
                          aria-label="Country code"
                        />
                      </InputContainer>
                      <InputContainer size="lg" className="min-w-0 w-full flex-1">
                        <Input
                          id={`${baseId}-phone`}
                          name="phoneLocal"
                          type="tel"
                          autoComplete="tel-national"
                          inputMode="tel"
                          standalone={false}
                          size="lg"
                          placeholder="(555) 555-0100"
                          value={phoneLocal}
                          onChange={(e) => setPhoneLocal(e.target.value)}
                          aria-label="Phone number"
                        />
                      </InputContainer>
                    </div>
                  </InputGroup>
                </FormSection>

                <FormSection
                  title="Customer Address"
                  description="Provide the mailing or garaging address tied to this registration. It supports titling, tax, and location-based features in your account."
                >
                  <InputGroup className="group">
                    <InputLabel htmlFor={`${baseId}-addr1`}>
                      Address Line 1*
                    </InputLabel>
                    <InputContainer size="lg">
                      <Input
                        id={`${baseId}-addr1`}
                        name="addressLine1"
                        autoComplete="address-line1"
                        standalone={false}
                        size="lg"
                        value={address1}
                        onChange={(e) => setAddress1(e.target.value)}
                        required
                      />
                    </InputContainer>
                  </InputGroup>
                  <InputGroup className="group">
                    <InputLabel htmlFor={`${baseId}-addr2`}>
                      Address Line 2
                    </InputLabel>
                    <InputContainer size="lg">
                      <Input
                        id={`${baseId}-addr2`}
                        name="addressLine2"
                        autoComplete="address-line2"
                        standalone={false}
                        size="lg"
                        value={address2}
                        onChange={(e) => setAddress2(e.target.value)}
                      />
                    </InputContainer>
                  </InputGroup>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <InputGroup className="group">
                      <InputLabel htmlFor={`${baseId}-city`}>City*</InputLabel>
                      <InputContainer size="lg">
                        <Input
                          id={`${baseId}-city`}
                          name="city"
                          autoComplete="address-level2"
                          standalone={false}
                          size="lg"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        />
                      </InputContainer>
                    </InputGroup>
                    <InputGroup className="group">
                      <InputLabel htmlFor={`${baseId}-state`}>State*</InputLabel>
                      <Select
                        value={stateCode}
                        onValueChange={(value) => {
                          if (value != null) setStateCode(value);
                        }}
                        required
                      >
                        <SelectTrigger
                          size="default"
                          className={SELECT_ROW_CLASS}
                          id={`${baseId}-state`}
                        >
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATE_CODES.map((code) => (
                            <SelectItem key={code} value={code}>
                              {code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </InputGroup>
                    <InputGroup className="group">
                      <InputLabel htmlFor={`${baseId}-zip`}>ZIP Code*</InputLabel>
                      <InputContainer size="lg">
                        <Input
                          id={`${baseId}-zip`}
                          name="postalCode"
                          autoComplete="postal-code"
                          inputMode="numeric"
                          standalone={false}
                          size="lg"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          required
                        />
                      </InputContainer>
                    </InputGroup>
                  </div>
                </FormSection>

                <FormSection
                  title="Device Details"
                  description="Link the vehicle and hardware for this sale: VIN for identity, device serial from the unit, the airtime term you are selling, and the price recorded for this registration."
                >
                  <InputGroup className="group">
                    <InputLabel htmlFor={`${baseId}-vin`}>VIN*</InputLabel>
                    <InputContainer size="lg">
                      <Input
                        id={`${baseId}-vin`}
                        name="vin"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={17}
                        standalone={false}
                        size="lg"
                        value={vin}
                        onChange={(e) => setVin(e.target.value.toUpperCase())}
                        required
                      />
                    </InputContainer>
                    {decodedVehicleLine ? (
                      <InputHelperText>{decodedVehicleLine}</InputHelperText>
                    ) : null}
                  </InputGroup>
                  <InputGroup className="group">
                    <InputLabel htmlFor={`${baseId}-serial`}>
                      Device Serial Number*
                    </InputLabel>
                    <InputContainer size="lg">
                      <Input
                        id={`${baseId}-serial`}
                        name="deviceSerial"
                        standalone={false}
                        size="lg"
                        value={effectiveDeviceSerial}
                        onChange={(e) => setDeviceSerial(e.target.value)}
                        disabled={showMockDeviceSerial}
                        required={!showMockDeviceSerial}
                      />
                    </InputContainer>
                  </InputGroup>
                  <InputGroup className="group">
                    <InputLabel htmlFor={`${baseId}-service`}>Service Time*</InputLabel>
                    <Select
                      value={serviceTime}
                      onValueChange={(value) => {
                        if (value != null) setServiceTime(value);
                      }}
                      required
                    >
                      <SelectTrigger
                        size="default"
                        className={SELECT_ROW_CLASS}
                        id={`${baseId}-service`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TIME_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </InputGroup>
                  <InputGroup className="group">
                    <InputLabel htmlFor={`${baseId}-price`}>Sales Price*</InputLabel>
                    <InputContainer size="lg">
                      <InputAddon position="lead">$</InputAddon>
                      <Input
                        id={`${baseId}-price`}
                        name="salesPrice"
                        inputMode="decimal"
                        standalone={false}
                        size="lg"
                        placeholder="0.00"
                        value={salesPrice}
                        onChange={(e) => setSalesPrice(e.target.value)}
                        required
                      />
                    </InputContainer>
                  </InputGroup>
                </FormSection>

                <div className="flex justify-end">
                  <Button type="button" size="lg">
                    Continue
                  </Button>
                </div>
              </div>
            </section>

            <div className="flex flex-col gap-6">
              <label className="flex cursor-pointer items-center gap-1">
                <PortfolioCheckboxControl
                  checked={termsAccepted}
                  onCheckedChange={(checked) =>
                    setTermsAccepted(checked === true)
                  }
                />
                <span className="text-sm leading-relaxed text-foreground">
                  Customer accepts the{" "}
                  <Link
                    href="/#"
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/90"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms &amp; Conditions
                  </Link>
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
