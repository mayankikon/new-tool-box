"use client";

import * as React from "react";
import {
  Bell,
  Car,
  CheckCircle2,
  Globe,
  Hash,
  Mail,
  FilePlus2,
  Filter,
  Info,
  MessageSquare,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";

import { PageLayoutChromeShowcase } from "@/app/design-playground/showcases/page-layout-chrome-showcase";
import { FileCabinetTabRow } from "@/app/design-playground/components/file-cabinet-tab-row";
import { CAMPAIGN_RECOMMENDATIONS } from "@/lib/campaigns/mock-data";
import { inventoryDashboardData } from "@/lib/inventory/dashboard-data";
import { DASHBOARD_CHROME_SURFACE_CLASS } from "@/lib/ui/dashboard-chrome-surface";
import { AvatarBar, AvatarBarShiftActions } from "@/components/app/avatar-bar";
import { TopBar } from "@/components/app/top-bar";
import { CampaignSuggestionCard } from "@/components/campaigns/campaign-suggestion-card";
import {
  InventoryDonutCard,
  InventoryKpiCard,
  InventoryStatusCard,
  inventoryDashboardShowcaseWidgetSettings,
} from "@/components/inventory/inventory-dashboard-widgets";
import { InventoryAgingOverviewCard } from "@/components/inventory/lot-age-widgets";
import {
  AiTextArea,
  AiTextAreaActionButton,
  AiTextAreaChip,
  AiTextAreaInput,
  AiTextAreaSecondaryButton,
  AiTextAreaSubmit,
  AiTextAreaToolbar,
  AiTextAreaToolbarGroup,
  AiTextAreaToolbarSeparator,
} from "@/components/ui/ai-textarea";
import { AutomotiveSystemSwitch } from "@/components/ui/automotive-system-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { Badge, BadgeDot, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckboxCardGroup, CheckboxCardOption } from "@/components/ui/checkbox-card";
import { CheckboxGroup, CheckboxGroupItemWithDescription } from "@/components/ui/checkbox-group";
import { CheckboxList, CheckboxListItem } from "@/components/ui/checkbox-list";
import { PortfolioCheckboxControl } from "@/components/ui/portfolio-checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { DatePickerInput } from "@/components/ui/date-picker-input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DropdownButton } from "@/components/ui/dropdown-button";
import {
  DropdownMenuCaption,
  DropdownMenuFooterAction,
  DropdownMenuItem,
  DropdownMenuItemRow,
  DropdownMenuSearchInput,
  DropdownMenuSeparator,
  DropdownMenuUserbar,
} from "@/components/ui/dropdown-menu";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "@/components/ui/empty-state";
import { FileUploadArea } from "@/components/ui/file-upload-area";
import { FileUploadCard } from "@/components/ui/file-upload-card";
import { FilterButton } from "@/components/ui/filter-button";
import { FiltersPanel } from "@/components/ui/filters-panel";
import { InlineTip } from "@/components/ui/inline-tip";
import {
  Input,
  InputActionButton,
  InputAddon,
  InputContainer,
  InputGroup,
  InputHelperText,
  InputIcon,
  InputInlineAddon,
  InputLabel,
  InputQuantityButton,
  InputShortcutBadge,
} from "@/components/ui/input";
import { InputCaption } from "@/components/ui/input-caption";
import { MapViewTooltip } from "@/components/ui/map-view-tooltip";
import { Paginator } from "@/components/ui/paginator";
import { ProgressBar } from "@/components/ui/progress";
import { RadioCardGroup, RadioCardOption } from "@/components/ui/radio-card";
import { RadioGroup } from "@/components/ui/radio-group";
import { PortfolioRadioButton } from "@/components/ui/portfolio-radio";
import { RadioList, RadioListItem } from "@/components/ui/radio-list";
import { Sidebar } from "@/components/ui/sidebar";
import { Slider, RangeSlider } from "@/components/ui/slider";
import { StepperHorizontal } from "@/components/ui/stepper-horizontal";
import { StepperVertical } from "@/components/ui/stepper-vertical";
import { ToggleSwitch, type ToggleSwitchOption } from "@/components/ui/toggle-switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VehicleListItem } from "@/components/ui/vehicle-list-item";
import { VehicleListPanel } from "@/components/ui/vehicle-list-panel";
import { VehicleMapClusterMarker } from "@/components/ui/vehicle-map-cluster-marker";
import { VehicleMapMarkerChip } from "@/components/ui/vehicle-map-marker-chip";
import { KeysMapMarkerPin } from "@/components/ui/keys-map-marker-pin";
import { VehicleMapMarkerPin } from "@/components/ui/vehicle-map-marker-pin";
import {
  CUSTOMER_DECK_TAB_LABELS,
} from "@/components/customers/customers-table-model";
import { FILE_CABINET_BILLING_TABLE_DEFAULTS } from "@/lib/file-cabinet-billing-table-defaults";

import { SectionTitle } from "./components/atoms/SectionTitle";
import { ShowcaseCard } from "./components/atoms/ShowcaseCard";
import { ComponentShowcaseBlock } from "./components/molecules/ComponentShowcaseBlock";
import { AlertDialogShowcaseSection } from "./components/organisms/AlertDialogShowcaseSection";
import { BatteryThresholdShowcaseSection } from "./components/organisms/BatteryThresholdShowcaseSection";
import { ButtonShowcaseSection } from "./components/organisms/ButtonShowcaseSection";
import { ColorsSection } from "./components/organisms/ColorsSection";
import { MapsSection } from "./components/organisms/MapsSection";
import { ImagerySection } from "./components/organisms/ImagerySection";
import { ShadowsElevationsSection } from "./components/organisms/ShadowsElevationsSection";
import { SpacingSection } from "./components/organisms/SpacingSection";
import { TypographySection } from "./components/organisms/TypographySection";
import { DesignSystemPlaceholderSection } from "./components/organisms/DesignSystemPlaceholderSection";
import {
  DesignSystemTableViewPattern,
  DesignSystemTableViewPatternNoTabs,
} from "./components/patterns/table-view-pattern";
import { VehicleDetailsPagePattern } from "./components/patterns/vehicle-details-page-pattern";
import { designSystemNavConfig } from "./design-system-nav-config";
import { type DesignSystemGroup } from "./design-system-routes";

const SAMPLE_STEPS = [
  { label: "Audience", caption: "Pick segment" },
  { label: "Message", caption: "Compose content" },
  { label: "Schedule", caption: "Set timing" },
  { label: "Launch", caption: "Go live" },
];

const SAMPLE_VEHICLES = [
  {
    title: "2023 BMW X5 xDrive40i",
    stockNumber: "R12345",
    vin: "5UXCR6C02P9R12345",
    price: "$58,900",
    mileage: "12,412 mi",
    stockType: "New" as const,
    statusIcons: { location: "active" as const, keyPaired: "active" as const, battery: "inactive" as const },
  },
  {
    title: "2022 BMW 330i Sedan",
    stockNumber: "H56789",
    vin: "WBA5R1C0XNFH56789",
    price: "$41,200",
    mileage: "18,903 mi",
    stockType: "Certified" as const,
    statusIcons: { location: "inactive" as const, keyPaired: "active" as const, battery: "active" as const },
  },
];

const BADGE_TONES: BadgeTone[] = [
  "gray",
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

const {
  underGlowPx: fileCabinetUnderGlowPx,
  tabAccent: fileCabinetTabAccent,
  tabTopRadiusPx: fileCabinetTabTopRadiusPx,
} = FILE_CABINET_BILLING_TABLE_DEFAULTS;

function InteractiveBadgeShowcase() {
  const [variant, setVariant] = React.useState<"soft" | "outline" | "ghost" | "link">("soft");
  const [tone, setTone] = React.useState<BadgeTone>("green");
  const [size, setSize] = React.useState<"sm" | "md">("md");
  const [shape, setShape] = React.useState<"default" | "pill">("pill");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["soft", "outline", "ghost", "link"] as const).map((nextVariant) => (
          <Button
            key={nextVariant}
            size="2xs"
            variant={variant === nextVariant ? "default" : "outline"}
            onClick={() => setVariant(nextVariant)}
          >
            {nextVariant}
          </Button>
        ))}
        {(["sm", "md"] as const).map((nextSize) => (
          <Button key={nextSize} size="2xs" variant={size === nextSize ? "default" : "outline"} onClick={() => setSize(nextSize)}>
            {nextSize}
          </Button>
        ))}
        {(["default", "pill"] as const).map((nextShape) => (
          <Button key={nextShape} size="2xs" variant={shape === nextShape ? "default" : "outline"} onClick={() => setShape(nextShape)}>
            {nextShape}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {BADGE_TONES.map((nextTone) => (
          <Button key={nextTone} size="2xs" variant={tone === nextTone ? "default" : "outline"} onClick={() => setTone(nextTone)}>
            {nextTone}
          </Button>
        ))}
      </div>
      <div className="rounded-md border border-border bg-muted/20 p-4">
        <Badge variant={variant} tone={tone} size={size} shape={shape}>
          <span className="inline-flex items-center gap-1.5">
            <BadgeDot tone={tone} />
            Interactive badge
          </span>
        </Badge>
      </div>
    </div>
  );
}

function InteractiveToggleSwitchShowcase() {
  const [size, setSize] = React.useState<"sm" | "default" | "lg">("default");
  const [mode, setMode] = React.useState<"label" | "icon">("label");
  const [value, setValue] = React.useState("map");

  const options: [ToggleSwitchOption, ToggleSwitchOption] =
    mode === "icon"
      ? [
          { value: "map", icon: <Info className="size-4" /> },
          { value: "table", icon: <CheckCircle2 className="size-4" /> },
        ]
      : [
          { value: "map", label: "Map" },
          { value: "table", label: "Table" },
        ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["sm", "default", "lg"] as const).map((nextSize) => (
          <Button key={nextSize} size="2xs" variant={size === nextSize ? "default" : "outline"} onClick={() => setSize(nextSize)}>
            {nextSize}
          </Button>
        ))}
        {(["label", "icon"] as const).map((nextMode) => (
          <Button key={nextMode} size="2xs" variant={mode === nextMode ? "default" : "outline"} onClick={() => setMode(nextMode)}>
            {nextMode}
          </Button>
        ))}
      </div>
      <div className="rounded-md border border-border bg-muted/20 p-4">
        <ToggleSwitch
          value={value}
          onValueChange={setValue}
          size={size}
          options={options}
          aria-label="Interactive toggle switch"
        />
      </div>
    </div>
  );
}

function InteractiveTabsShowcase() {
  const [activeTab, setActiveTab] = React.useState("drive");

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-muted/20 p-5">
        <FileCabinetTabRow
          value={activeTab}
          onValueChange={setActiveTab}
          labels={CUSTOMER_DECK_TAB_LABELS}
          surface="light"
          underGlowPx={fileCabinetUnderGlowPx}
          accent={fileCabinetTabAccent}
          tabTopRadiusPx={fileCabinetTabTopRadiusPx}
          showLeftLamp={false}
          noLeftLampBelowStyle="preset-led"
          tabMotionVariant="sink-rise"
        />
        <div className="mt-4 rounded-sm border border-border bg-background px-4 py-5 text-sm text-muted-foreground">
          Reuses the file-cabinet tab treatment from the table-with-tabs component. Active tab:
          {" "}
          <span className="font-medium text-foreground">
            {CUSTOMER_DECK_TAB_LABELS[activeTab] ?? activeTab}
          </span>
          .
        </div>
      </div>
    </div>
  );
}

function InteractiveProgressBarShowcase() {
  const [variant, setVariant] = React.useState<"linear" | "dashed">("linear");
  const [value, setValue] = React.useState(60);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["linear", "dashed"] as const).map((nextVariant) => (
          <Button key={nextVariant} size="2xs" variant={variant === nextVariant ? "default" : "outline"} onClick={() => setVariant(nextVariant)}>
            {nextVariant}
          </Button>
        ))}
        {[60, 40, 30, 20, 10].map((nextValue) => (
          <Button key={nextValue} size="2xs" variant={value === nextValue ? "default" : "outline"} onClick={() => setValue(nextValue)}>
            {nextValue}%
          </Button>
        ))}
      </div>
      <ProgressBar
        variant={variant}
        label="Campaign upload"
        value={value}
        caption={`${value}% complete`}
      />
    </div>
  );
}

function InteractivePaginatorShowcase() {
  const [variant, setVariant] = React.useState<"simple" | "inline" | "numbered" | "dots">("simple");
  const [currentPage, setCurrentPage] = React.useState(2);
  const totalPages = 12;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["simple", "inline", "numbered", "dots"] as const).map((nextVariant) => (
          <Button key={nextVariant} size="2xs" variant={variant === nextVariant ? "default" : "outline"} onClick={() => setVariant(nextVariant)}>
            {nextVariant}
          </Button>
        ))}
        {[1, 2, 3, 4, 5].map((page) => (
          <Button key={page} size="2xs" variant={currentPage === page ? "default" : "outline"} onClick={() => setCurrentPage(page)}>
            p{page}
          </Button>
        ))}
      </div>
      <Paginator
        variant={variant}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={240}
        pageSize={20}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

function InteractiveAiTextAreaShowcase() {
  const [variant, setVariant] = React.useState<"default" | "shadow" | "soft">("default");
  const [submitShape, setSubmitShape] = React.useState<"icon" | "pill" | "pill-sm">("icon");
  const [showSecondary, setShowSecondary] = React.useState(true);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["default", "shadow", "soft"] as const).map((nextVariant) => (
          <Button key={nextVariant} size="2xs" variant={variant === nextVariant ? "default" : "outline"} onClick={() => setVariant(nextVariant)}>
            {nextVariant}
          </Button>
        ))}
        {(["icon", "pill", "pill-sm"] as const).map((shape) => (
          <Button key={shape} size="2xs" variant={submitShape === shape ? "default" : "outline"} onClick={() => setSubmitShape(shape)}>
            {shape}
          </Button>
        ))}
        <Button size="2xs" variant={showSecondary ? "default" : "outline"} onClick={() => setShowSecondary((current) => !current)}>
          secondary
        </Button>
      </div>
      <AiTextArea variant={variant} label="Interactive AI text area" caption="Switch variants and submit styles using controls above.">
        <AiTextAreaInput placeholder="Describe the message you want to generate..." />
        <AiTextAreaToolbar separator={variant === "shadow"}>
          <AiTextAreaToolbarGroup>
            <AiTextAreaChip><Sparkles className="size-4" /><span>Improve tone</span></AiTextAreaChip>
            <AiTextAreaChip><Filter className="size-4" /></AiTextAreaChip>
          </AiTextAreaToolbarGroup>
          <AiTextAreaToolbarGroup>
            <AiTextAreaActionButton aria-label="Add note"><MessageSquare className="size-4" /></AiTextAreaActionButton>
            {showSecondary ? <AiTextAreaSecondaryButton>Comment</AiTextAreaSecondaryButton> : null}
            <AiTextAreaSubmit shape={submitShape} aria-label="Send">
              {submitShape === "icon" ? <Send className="size-4" /> : "Generate"}
              {submitShape !== "icon" ? <Send className="size-4" /> : null}
            </AiTextAreaSubmit>
          </AiTextAreaToolbarGroup>
        </AiTextAreaToolbar>
      </AiTextArea>
    </div>
  );
}

function inferGroupBySlug(slug: string): DesignSystemGroup | null {
  if (designSystemNavConfig.foundations.some((item) => item.slug === slug)) return "foundations";
  if (designSystemNavConfig.components.some((item) => item.slug === slug || (slug === "alert-dialog" && item.slug === "modal"))) return "components";
  if (designSystemNavConfig.patterns.some((item) => item.slug === slug)) return "patterns";
  return null;
}

function overlineForGroup(group: DesignSystemGroup): string {
  if (group === "foundations") return "Foundations";
  if (group === "components") return "Components";
  return "Patterns";
}

function wrapSection(id: string, title: string, description: React.ReactNode, content: React.ReactNode) {
  const inferredGroup = inferGroupBySlug(id);
  const resolvedDescription =
    inferredGroup != null
      ? getDesignSystemDescription(inferredGroup, id)
      : null;

  return (
    <section key={id} id={id} className="scroll-mt-28 space-y-8">
      <SectionTitle
        overline={inferredGroup != null ? overlineForGroup(inferredGroup) : undefined}
        title={title}
        description={resolvedDescription ?? description}
      />
      {content}
    </section>
  );
}

function renderComponentShowcase(slug: string, label: string) {
  switch (slug) {
    case "button":
      return (
        <ButtonShowcaseSection
          key={slug}
          overline="Components"
          title={label}
          description={getDesignSystemDescription("components", slug)}
        />
      );
    case "badge":
      return wrapSection(
        slug,
        label,
        "Status and contextual labels with interactive tone, shape, size, and variant controls.",
        <ComponentShowcaseBlock title="Badge" useCard={true} className="space-y-6">
          <InteractiveBadgeShowcase />
        </ComponentShowcaseBlock>,
      );
    case "input":
      return wrapSection(
        slug,
        label,
        "Default, shortcut, add-on, inline add-on, lead/tail button, quantity, soft, and state variants.",
        <ShowcaseCard className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <InputGroup>
              <InputLabel>Default</InputLabel>
              <Input placeholder="Search inventory..." />
            </InputGroup>
            <InputGroup>
              <InputLabel>Shortcut</InputLabel>
              <InputContainer>
                <InputIcon position="lead">
                  <Mail className="size-4" />
                </InputIcon>
                <Input standalone={false} placeholder="Search by VIN or model" />
                <InputShortcutBadge>/</InputShortcutBadge>
              </InputContainer>
            </InputGroup>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <InputGroup>
              <InputLabel>Add-on</InputLabel>
              <InputContainer>
                <InputAddon position="lead">https://</InputAddon>
                <Input standalone={false} placeholder="my-dealership" />
                <InputAddon position="tail">.com</InputAddon>
              </InputContainer>
            </InputGroup>
            <InputGroup>
              <InputLabel>Inline add-on</InputLabel>
              <InputContainer>
                <InputInlineAddon position="lead">#</InputInlineAddon>
                <Input standalone={false} placeholder="Campaign tag" />
              </InputContainer>
            </InputGroup>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <InputGroup>
              <InputLabel>Tail button</InputLabel>
              <InputContainer>
                <Input standalone={false} placeholder="Promo code" />
                <InputActionButton position="tail">Apply</InputActionButton>
              </InputContainer>
            </InputGroup>
            <InputGroup>
              <InputLabel>Lead button</InputLabel>
              <InputContainer>
                <InputActionButton position="lead">Generate</InputActionButton>
                <Input standalone={false} placeholder="Campaign name" />
              </InputContainer>
            </InputGroup>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <InputGroup>
              <InputLabel>Quantity</InputLabel>
              <InputContainer size="lg">
                <InputQuantityButton action="decrement" />
                <Input standalone={false} className="text-center tabular-nums" value="12" readOnly />
                <InputQuantityButton action="increment" />
              </InputContainer>
            </InputGroup>
            <InputGroup>
              <InputLabel>Soft style</InputLabel>
              <InputContainer inputStyle="soft">
                <InputIcon position="lead">
                  <Globe className="size-4" />
                </InputIcon>
                <Input standalone={false} placeholder="https://maps.example.com" />
              </InputContainer>
            </InputGroup>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <InputGroup>
              <InputLabel>Email</InputLabel>
              <Input placeholder="you@example.com" />
              <InputHelperText>We’ll send campaign results here.</InputHelperText>
            </InputGroup>
            <InputGroup>
              <InputLabel>Password</InputLabel>
              <Input type="password" value="wrongpassword" readOnly aria-invalid />
              <InputHelperText variant="error">Password must include a symbol.</InputHelperText>
            </InputGroup>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <InputGroup disabled>
              <InputLabel>Disabled</InputLabel>
              <Input disabled value="Read only from policy" readOnly />
            </InputGroup>
            <InputGroup>
              <InputLabel>Leading icon</InputLabel>
              <InputContainer>
                <InputIcon position="lead">
                  <Hash className="size-4" />
                </InputIcon>
                <Input standalone={false} placeholder="Inventory unit ID" />
              </InputContainer>
            </InputGroup>
          </div>
        </ShowcaseCard>,
      );
    case "checkbox": {
      return wrapSection(
        slug,
        label,
        "Portfolio 3.0 checkboxes: basic states plus group, list, and card patterns (segmented controls use the legacy primitives separately).",
        <ShowcaseCard className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Basic</p>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm"><PortfolioCheckboxControl checked /> Checked</label>
              <label className="flex items-center gap-2 text-sm"><PortfolioCheckboxControl /> Unchecked</label>
              <label className="flex items-center gap-2 text-sm">
                <PortfolioCheckboxControl checked={false} indeterminate aria-label="Indeterminate checkbox state" />
                Indeterminate
              </label>
              <label className="flex items-center gap-2 text-sm"><PortfolioCheckboxControl disabled checked /> Disabled</label>
              <label className="flex items-center gap-2 text-sm">
                <PortfolioCheckboxControl checked showFocusRing aria-label="Focused checkbox state" />
                Focused
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Group with descriptions</p>
            <CheckboxGroup defaultValue={["email", "push"]}>
              <CheckboxGroupItemWithDescription
                value="email"
                label="Email notifications"
                description="Marketing and lifecycle campaign summaries."
              />
              <CheckboxGroupItemWithDescription
                value="sms"
                label="SMS notifications"
                description="Operational alerts and customer replies."
              />
              <CheckboxGroupItemWithDescription
                value="push"
                label="Push notifications"
                description="Real-time app events and monitor alerts."
              />
            </CheckboxGroup>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">List pattern</p>
            <CheckboxList defaultValue={["new", "used"]}>
              <CheckboxListItem value="new" label="New inventory" description="In-stock and inbound units" right={<Badge variant="soft" tone="blue">116</Badge>} />
              <CheckboxListItem value="used" label="Used inventory" description="Certified and pre-owned vehicles" right={<Badge variant="soft" tone="green">254</Badge>} />
              <CheckboxListItem value="loaner" label="Loaner fleet" description="Temporary service loaners" right={<Badge variant="soft" tone="amber">18</Badge>} />
            </CheckboxList>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Card pattern</p>
            <CheckboxCardGroup defaultValue={["sms"]}>
              <CheckboxCardOption
                value="sms"
                title="SMS channel"
                description="Fastest response rate for service reminders."
                subDetail="Avg response time: 11 min"
                trailing={<Badge variant="soft" tone="green">High</Badge>}
              />
              <CheckboxCardOption
                value="email"
                title="Email channel"
                description="Best for richer offer content and visuals."
                subDetail="Avg open rate: 34%"
                trailing={<Badge variant="soft" tone="blue">Medium</Badge>}
              />
            </CheckboxCardGroup>
          </div>
        </ShowcaseCard>,
      );
    }
    case "radio":
      return wrapSection(
        slug,
        label,
        "Portfolio 3.0 radios: mutually exclusive controls with basic, list, and card patterns.",
        <ShowcaseCard className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Basic</p>
            <div className="flex flex-wrap items-center gap-6">
              <RadioGroup defaultValue="checked" className="!flex w-auto flex-row items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <PortfolioRadioButton value="checked" id="radio-checked" aria-label="Checked radio state" />
                  Checked
                </label>
              </RadioGroup>
              <RadioGroup defaultValue="checked" className="!flex w-auto flex-row items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <PortfolioRadioButton value="unchecked" id="radio-unchecked" aria-label="Unchecked radio state" />
                  Unchecked
                </label>
              </RadioGroup>
              <RadioGroup defaultValue="disabled" className="!flex w-auto flex-row items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <PortfolioRadioButton
                    value="disabled"
                    id="radio-disabled"
                    visualDisabled
                    aria-label="Disabled radio state"
                  />
                  Disabled
                </label>
              </RadioGroup>
              <RadioGroup defaultValue="focused" className="!flex w-auto flex-row items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <PortfolioRadioButton
                    value="focused"
                    id="radio-focused"
                    showFocusRing
                    aria-label="Focused radio state"
                  />
                  Focused
                </label>
              </RadioGroup>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">List pattern</p>
            <RadioList defaultValue="sms">
              <RadioListItem value="sms" label="SMS first" description="Primary channel for this campaign." right={<Badge variant="soft" tone="green">Recommended</Badge>} />
              <RadioListItem value="email" label="Email first" description="Better for long-form content." right={<Badge variant="soft" tone="blue">Standard</Badge>} />
              <RadioListItem value="push" label="Push first" description="Mobile-only engagement strategy." right={<Badge variant="soft" tone="amber">Experimental</Badge>} />
            </RadioList>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Card pattern</p>
            <RadioCardGroup defaultValue="template-a">
              <RadioCardOption
                value="template-a"
                title="Retention template"
                description="Balanced promotion and reminder timing."
                subDetail="Expected lift: +12%"
                trailing={<Badge variant="soft" tone="green">Default</Badge>}
              />
              <RadioCardOption
                value="template-b"
                title="Win-back template"
                description="Aggressive offer cadence for inactive users."
                subDetail="Expected lift: +18%"
                trailing={<Badge variant="soft" tone="blue">Alt</Badge>}
              />
            </RadioCardGroup>
          </div>
        </ShowcaseCard>,
      );
    case "toggle-switch":
      return wrapSection(
        slug,
        label,
        "Two-state segmented toggle with live size and content-mode controls.",
        <ShowcaseCard>
          <InteractiveToggleSwitchShowcase />
        </ShowcaseCard>,
      );
    case "automotive-system-toggle":
      return wrapSection(
        slug,
        label,
        "Automotive-styled illuminated switch.",
        <ShowcaseCard>
          <div className="flex items-center gap-6">
            <AutomotiveSystemSwitch defaultChecked />
            <AutomotiveSystemSwitch />
          </div>
        </ShowcaseCard>,
      );
    case "card":
      return wrapSection(
        slug,
        label,
        "Standard cards with title, body and footer actions.",
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Last 30 days performance.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">Reach increased by 14.6% week over week.</CardContent>
            <CardFooter>
              <Button size="sm">View Details</Button>
            </CardFooter>
          </Card>
        </div>,
      );
    case "tabs":
      return wrapSection(
        slug,
        label,
        "File-cabinet tabs used by the table-with-tabs surface.",
        <ShowcaseCard className="space-y-8">
          <InteractiveTabsShowcase />
        </ShowcaseCard>,
      );
    case "table":
      return wrapSection(
        slug,
        label,
        "Bordered table shell without the file-cabinet tab strip.",
        <ShowcaseCard>
          <DesignSystemTableViewPatternNoTabs />
        </ShowcaseCard>,
      );
    case "table-with-tabs":
      return wrapSection(
        slug,
        label,
        "File-cabinet table shell with sink-rise tabs, sortable rows, and inline pagination.",
        <ShowcaseCard>
          <DesignSystemTableViewPattern />
        </ShowcaseCard>,
      );
    case "tooltip":
      return wrapSection(
        slug,
        label,
        "Tooltip placements for all four sides, plus the card variant.",
        <ShowcaseCard>
          <TooltipProvider>
            <div className="flex flex-wrap items-center gap-4">
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                  Top
                </TooltipTrigger>
                <TooltipContent side="top">Quick tooltip copy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                  Right
                </TooltipTrigger>
                <TooltipContent side="right">Quick tooltip copy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                  Bottom
                </TooltipTrigger>
                <TooltipContent side="bottom">Quick tooltip copy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                  Left
                </TooltipTrigger>
                <TooltipContent side="left">Quick tooltip copy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="secondary" size="sm" />}>
                  Card tooltip
                </TooltipTrigger>
                <TooltipContent side="top" variant="card">Use card tooltips for longer explanatory text.</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </ShowcaseCard>,
      );
    case "map-view-tooltip":
      return wrapSection(
        slug,
        label,
        "Rich map/table preview tooltip variants.",
        <ShowcaseCard className="bg-[rgb(23,23,26)]">
          <div className="flex flex-wrap gap-6">
            <MapViewTooltip variant="map" isActive />
            <MapViewTooltip variant="table" />
          </div>
        </ShowcaseCard>,
      );
    case "progress-bar":
      return wrapSection(
        slug,
        label,
        "Linear and dashed progress indicators with selectable values.",
        <ShowcaseCard className="space-y-5">
          <InteractiveProgressBarShowcase />
        </ShowcaseCard>,
      );
    case "slider":
      return wrapSection(
        slug,
        label,
        "Single and range slider controls with marks.",
        <ShowcaseCard className="space-y-6">
          <Slider defaultValue={45} min={0} max={100} marks={true} markStep={20} label="Alert threshold" helperText="Warn drivers below this battery score." />
          <RangeSlider defaultValue={[20, 75]} min={0} max={100} marks={true} markStep={25} label="Target mileage range" />
        </ShowcaseCard>,
      );
    case "battery-threshold":
      return (
        <BatteryThresholdShowcaseSection
          key={slug}
          overline="Components"
          title={label}
          description={getDesignSystemDescription("components", slug)}
        />
      );
    case "campaign-suggestion-card":
      return wrapSection(
        slug,
        label,
        "Recommendation card used in campaign dashboards.",
        <ShowcaseCard>
          <CampaignSuggestionCard suggestion={CAMPAIGN_RECOMMENDATIONS[0]} />
        </ShowcaseCard>,
      );
    case "dashboard-widgets":
      return wrapSection(
        slug,
        label,
        "Production dashboard widget primitives (KPI, status, donut, lot aging) used in inventory dashboards.",
        <div className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-4">
            {inventoryDashboardData.kpis.map((metric) => (
              <InventoryKpiCard
                key={metric.label}
                metric={metric}
                settings={inventoryDashboardShowcaseWidgetSettings}
                className={DASHBOARD_CHROME_SURFACE_CLASS}
              />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {inventoryDashboardData.statusCards.map((metric) => (
              <InventoryStatusCard
                key={metric.title}
                metric={metric}
                settings={inventoryDashboardShowcaseWidgetSettings}
                className={DASHBOARD_CHROME_SURFACE_CLASS}
              />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <InventoryDonutCard
              metric={inventoryDashboardData.inventoryBreakdown}
              settings={inventoryDashboardShowcaseWidgetSettings}
              className={DASHBOARD_CHROME_SURFACE_CLASS}
            />
            <InventoryDonutCard
              metric={inventoryDashboardData.lotUtilization}
              settings={inventoryDashboardShowcaseWidgetSettings}
              className={DASHBOARD_CHROME_SURFACE_CLASS}
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="min-w-0">
              <InventoryAgingOverviewCard
                lotAge={inventoryDashboardData.lotAgeTiers}
                vehicleAge={inventoryDashboardData.vehicleAgeDistribution}
                settings={inventoryDashboardShowcaseWidgetSettings}
                className={DASHBOARD_CHROME_SURFACE_CLASS}
              />
            </div>
          </div>
        </div>,
      );
    case "map-markers":
      return wrapSection(
        slug,
        label,
        "Pin, chip, and cluster markers for inventory map overlays.",
        <ShowcaseCard>
          <div className="flex flex-wrap items-center gap-8">
            <VehicleMapMarkerPin tone="teal" hoverable />
            <KeysMapMarkerPin hoverable />
            <VehicleMapMarkerChip variantIndex={0} hoverOverlayColor="#1A9375" />
            <VehicleMapClusterMarker countLabel="142" hoverable />
            <VehicleMapClusterMarker variant="group-active" countLabel="32" hoverable />
          </div>
        </ShowcaseCard>,
      );
    case "stepper":
      return wrapSection(
        slug,
        label,
        "Horizontal and vertical progress stepper components.",
        <ShowcaseCard className="space-y-8">
          <StepperHorizontal steps={SAMPLE_STEPS} currentStep={1} align="left" />
          <div className="max-w-md">
            <StepperVertical
              steps={SAMPLE_STEPS.map((step) => ({
                ...step,
                supportText: step.caption,
              }))}
              currentStep={2}
            />
          </div>
        </ShowcaseCard>,
      );
    case "paginator":
      return wrapSection(
        slug,
        label,
        "Simple, inline, numbered and dots pagination with live page controls.",
        <ShowcaseCard className="space-y-6">
          <InteractivePaginatorShowcase />
        </ShowcaseCard>,
      );
    case "inline-tips":
      return wrapSection(
        slug,
        label,
        "Contextual inline guidance and status messages.",
        <ShowcaseCard className="space-y-3">
          <InlineTip variant="default">Use map view to compare nearby inventory quickly.</InlineTip>
          <InlineTip variant="info">AI ranking is based on your selected dealership goals.</InlineTip>
          <InlineTip variant="success">Campaign created successfully and queued for launch.</InlineTip>
          <InlineTip variant="warning">No SMS sender configured for this dealership yet.</InlineTip>
          <InlineTip variant="error">Upload failed. Please retry with a smaller image.</InlineTip>
        </ShowcaseCard>,
      );
    case "dropdown-menu":
      return wrapSection(
        slug,
        label,
        "Menu primitives including search, rows, and footer action.",
        <ShowcaseCard>
          <div className="flex items-center gap-4">
            <DropdownButton label="Open menu" variant="outline" size="sm" align="start">
              <DropdownMenuUserbar
                name="Mayank Kinger"
                email="mayank@example.com"
                avatar={
                  <Avatar className="size-7">
                    <AvatarFallback>MK</AvatarFallback>
                  </Avatar>
                }
                badge={<Badge variant="soft" tone="green" size="sm">Pro</Badge>}
              />
              <DropdownMenuSeparator />
              <DropdownMenuCaption label="Quick actions" />
              <DropdownMenuSearchInput placeholder="Search actions" />
              <DropdownMenuItemRow label="Create campaign" leadIcon={<Sparkles className="size-4" />} />
              <DropdownMenuItemRow label="Upload assets" leadIcon={<Upload className="size-4" />} />
              <DropdownMenuSeparator />
              <DropdownMenuItem>View settings</DropdownMenuItem>
              <DropdownMenuFooterAction label="Add workflow" icon={<FilePlus2 className="size-4" />} />
            </DropdownButton>
          </div>
        </ShowcaseCard>,
      );
    case "modal":
    case "alert-dialog":
      return (
        <AlertDialogShowcaseSection
          key={slug}
          overline="Components"
          title={label}
          description={getDesignSystemDescription("components", "modal")}
        />
      );
    case "date-picker":
      return wrapSection(
        slug,
        label,
        "Single-date, range, and full trigger-state matrix (including preset side panel).",
        <ShowcaseCard className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <DatePicker label="Start date" helperText="Pick campaign start date." value={new Date("2026-03-27")} />
            <DatePicker label="Shadow style" inputStyle="shadow" value={new Date("2026-03-20")} />
            <DatePicker label="Soft style" inputStyle="soft" value={new Date("2026-03-15")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <DatePicker label="End date" error="End date must be after start date." value={new Date("2026-03-25")} />
            <DatePicker label="Disabled" disabled value={new Date("2026-03-10")} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <DateRangePicker
              label="Date range"
              helperText="Choose reporting period."
              value={{ from: new Date("2026-03-01"), to: new Date("2026-03-27") }}
            />
            <DateRangePicker
              label="Date range (soft)"
              inputStyle="soft"
              showPresets={false}
              value={{ from: new Date("2026-02-15"), to: new Date("2026-02-28") }}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <DateRangePicker
              label="Date range (shadow + presets)"
              inputStyle="shadow"
              value={{ from: new Date("2026-01-01"), to: new Date("2026-03-27") }}
            />
            <DateRangePicker
              label="Date range (error)"
              error="Please select an end date."
              value={{ from: new Date("2026-03-27"), to: undefined }}
            />
            <DateRangePicker
              label="Date range (disabled)"
              disabled
              value={{ from: new Date("2026-02-01"), to: new Date("2026-02-12") }}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <DatePickerInput />
            <DatePickerInput value={new Date("2026-03-27")} />
            <DatePickerInput value={new Date("2026-03-27")} isOpen />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <DatePickerInput invalid value={new Date("2026-03-27")} />
            <DatePickerInput value={new Date("2026-03-27")} disabled />
            <DatePickerInput type="range" value={new Date("2026-03-01")} endValue={new Date("2026-03-27")} />
          </div>
        </ShowcaseCard>,
      );
    case "avatar-bar":
      return wrapSection(
        slug,
        label,
        "Top account strip shown above TopBar in app chrome.",
        <ShowcaseCard className="overflow-hidden p-0">
          <AvatarBar>
            <AvatarBarShiftActions displayName="Mayank Kinger" role="Admin" />
          </AvatarBar>
        </ShowcaseCard>,
      );
    case "top-bar":
      return wrapSection(
        slug,
        label,
        "Page header with title, subtitle and right-side actions.",
        <ShowcaseCard className="overflow-hidden p-0">
          <TopBar
            breadcrumbs={[
              { label: "Marketing", href: "#" },
              { label: "Campaigns", href: "#" },
              { label: "Create" },
            ]}
            title="Create Campaign"
            subtitle="Configure targeting, channels and schedule."
            right={
              <>
                <Button variant="secondary" size="lg">
                  Cancel
                </Button>
                <Button size="lg">Save Draft</Button>
              </>
            }
          />
        </ShowcaseCard>,
      );
    case "breadcrumbs":
      return wrapSection(
        slug,
        label,
        "Breadcrumb treatment used in page top bars.",
        <ShowcaseCard className="overflow-hidden p-0">
          <TopBar
            breadcrumbs={[
              { label: "Inventory", href: "#" },
              { label: "Vehicles", href: "#" },
              { label: "Vehicle detail" },
            ]}
            title=""
          />
        </ShowcaseCard>,
      );
    case "filter-button":
      return wrapSection(
        slug,
        label,
        "Filter trigger with selected state and value.",
        <ShowcaseCard>
          <div className="flex flex-wrap gap-3">
            <FilterButton />
            <FilterButton selected valueLabel="Last 30 days" />
            <FilterButton selected label="Model" valueLabel="X5" leadIcon={<Car className="size-4" />} />
          </div>
        </ShowcaseCard>,
      );
    default:
      return null;
  }
}

function renderPatternShowcase(slug: string, label: string) {
  switch (slug) {
    case "page-layout-chrome":
      return (
        <section key={slug} id={slug} className="scroll-mt-28 space-y-8">
          <SectionTitle
            overline="Patterns"
            title={label}
            description={getDesignSystemDescription("patterns", slug)}
          />
          <PageLayoutChromeShowcase />
        </section>
      );
    case "fluid-shell-pilot":
      return (
        <DesignSystemPlaceholderSection
          key={slug}
          id={slug}
          overline="Patterns"
          title={label}
        />
      );
    case "vehicle-details-page":
      return (
        <section key={slug} id={slug} className="scroll-mt-28 space-y-8">
          <SectionTitle overline="Patterns" title={label} description={getDesignSystemDescription("patterns", slug)} />
          <VehicleDetailsPagePattern />
        </section>
      );
    case "ai-textarea":
      return wrapSection(
        slug,
        label,
        "Full AI text area variants with interactive controls for style and submit behavior.",
        <ShowcaseCard className="space-y-6">
          <InteractiveAiTextAreaShowcase />
          <AiTextArea label="Campaign prompt" caption="Use AI to draft channel-specific copy.">
            <AiTextAreaInput placeholder="Describe the message you want to generate..." />
            <AiTextAreaToolbar>
              <AiTextAreaToolbarGroup>
                <AiTextAreaChip><Sparkles className="size-4" /><span>Improve tone</span></AiTextAreaChip>
                <AiTextAreaChip><Filter className="size-4" /></AiTextAreaChip>
              </AiTextAreaToolbarGroup>
              <AiTextAreaToolbarGroup>
                <AiTextAreaActionButton aria-label="Add note"><MessageSquare className="size-4" /></AiTextAreaActionButton>
                <AiTextAreaSubmit aria-label="Send"><Send className="size-4" /></AiTextAreaSubmit>
              </AiTextAreaToolbarGroup>
            </AiTextAreaToolbar>
          </AiTextArea>
          <AiTextArea variant="shadow" label="Summarize service insights" caption="Shadow variant with separated toolbar line.">
            <AiTextAreaInput placeholder="Summarize high-value opportunities from this week..." />
            <AiTextAreaToolbar separator>
              <AiTextAreaToolbarGroup>
                <AiTextAreaActionButton aria-label="Attach file"><Upload className="size-4" /></AiTextAreaActionButton>
                <AiTextAreaActionButton aria-label="Voice note"><Bell className="size-4" /></AiTextAreaActionButton>
                <AiTextAreaToolbarSeparator />
                <AiTextAreaChip shape="rounded" size="sm"><span>Formal</span></AiTextAreaChip>
                <AiTextAreaChip shape="rounded" size="sm"><span>Short</span></AiTextAreaChip>
              </AiTextAreaToolbarGroup>
              <AiTextAreaToolbarGroup>
                <AiTextAreaSecondaryButton>Comment</AiTextAreaSecondaryButton>
                <AiTextAreaSubmit shape="pill">
                  Generate
                  <Send className="size-4" />
                </AiTextAreaSubmit>
              </AiTextAreaToolbarGroup>
            </AiTextAreaToolbar>
          </AiTextArea>
          <AiTextArea variant="soft" label="Quick reply">
            <AiTextAreaInput placeholder="Draft a short SMS follow-up..." />
            <AiTextAreaToolbar>
              <AiTextAreaToolbarGroup>
                <AiTextAreaChip shape="pill" size="sm"><span>Friendly</span></AiTextAreaChip>
                <AiTextAreaChip shape="pill" size="sm"><span>Urgent</span></AiTextAreaChip>
              </AiTextAreaToolbarGroup>
              <AiTextAreaToolbarGroup>
                <AiTextAreaSubmit shape="pill-sm">Send</AiTextAreaSubmit>
              </AiTextAreaToolbarGroup>
            </AiTextAreaToolbar>
          </AiTextArea>
        </ShowcaseCard>,
      );
    case "empty-state":
      return wrapSection(
        slug,
        label,
        "Reusable empty-state composition with icon, copy and actions.",
        <ShowcaseCard>
          <EmptyState className="py-8">
            <EmptyStateIcon className="rounded-full bg-muted p-3 text-muted-foreground">
              <Info className="size-5" />
            </EmptyStateIcon>
            <EmptyStateContent>
              <EmptyStateTitle>No campaigns yet</EmptyStateTitle>
              <EmptyStateDescription>Create your first campaign to start reaching your audience.</EmptyStateDescription>
            </EmptyStateContent>
            <EmptyStateActions>
              <Button size="sm">Create Campaign</Button>
              <Button size="sm" variant="outline">View Templates</Button>
            </EmptyStateActions>
          </EmptyState>
        </ShowcaseCard>,
      );
    case "file-upload":
      return wrapSection(
        slug,
        label,
        "Drag-and-drop upload zone and upload file cards.",
        <ShowcaseCard className="space-y-4">
          <FileUploadArea hint="PNG/JPG up to 10MB" />
          <div className="grid gap-3 md:grid-cols-2">
            <AvatarUpload />
            <AvatarUpload hasImage hint="JPG, GIF or PNG. 1MB Max." />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FileUploadCard fileName="hero-banner.png" fileSize="2.1 MB" state="uploaded" />
            <FileUploadCard fileName="campaign-video.mp4" fileSize="18.9 MB" state="uploading" />
          </div>
        </ShowcaseCard>,
      );
    case "sidebar":
      return wrapSection(
        slug,
        label,
        "Primary app navigation rail and section groups.",
        <ShowcaseCard className="overflow-hidden p-0">
          <div className="flex h-[520px]">
            <Sidebar className="h-full" />
            <div className="flex flex-1 items-center justify-center bg-muted/25 text-sm text-muted-foreground">Main content area</div>
          </div>
        </ShowcaseCard>,
      );
    case "filters-panel":
      return wrapSection(
        slug,
        label,
        "Inventory filtering panel with grouped options.",
        <ShowcaseCard>
          <FiltersPanel />
        </ShowcaseCard>,
      );
    case "input-caption":
      return wrapSection(
        slug,
        label,
        "Caption variants for default, success, error and password guidance.",
        <ShowcaseCard className="space-y-4">
          <InputCaption variant="default" text="Helper text for this field." />
          <InputCaption variant="success" successText="Looks good. Value is valid." />
          <InputCaption variant="error" errorText="This value is required." />
          <InputCaption
            variant="password"
            strength="medium"
            requirements={[
              { label: "At least 8 characters", met: true },
              { label: "One uppercase letter", met: true },
              { label: "One special character", met: false },
            ]}
          />
        </ShowcaseCard>,
      );
    case "vehicle-list-item":
      return wrapSection(
        slug,
        label,
        "Vehicle row item with image, metadata and status indicators.",
        <ShowcaseCard className="p-0">
          <VehicleListItem {...SAMPLE_VEHICLES[0]} />
          <VehicleListItem {...SAMPLE_VEHICLES[1]} />
        </ShowcaseCard>,
      );
    case "vehicle-list-panel":
      return wrapSection(
        slug,
        label,
        "Scrollable vehicle list container with count bar.",
        <ShowcaseCard className="p-0">
          <VehicleListPanel vehicles={SAMPLE_VEHICLES} className="h-[300px]" />
        </ShowcaseCard>,
      );
    default:
      return null;
  }
}

function renderFoundationShowcase(slug: string) {
  switch (slug) {
    case "colors":
      return <ColorsSection key={slug} />;
    case "maps":
      return <MapsSection key={slug} />;
    case "typography":
      return <TypographySection key={slug} />;
    case "spacing":
      return <SpacingSection key={slug} />;
    case "shadows-elevations":
      return <ShadowsElevationsSection key={slug} />;
    case "imagery":
      return <ImagerySection key={slug} />;
    default:
      return null;
  }
}

export interface DesignSystemPageEntry {
  group: DesignSystemGroup;
  slug: string;
  title: string;
  description: string;
  canonicalSlug?: string;
}

const entryDescriptions: Record<string, string> = {
  "foundations:colors": "Colors define the visual language and semantic meaning across interfaces and states.",
  "foundations:maps":
    "2D hybrid satellite (Maps JavaScript API) with a toggle to photorealistic 3D Tiles (Map Tiles API) in CesiumJS; separate from Mapbox inventory maps.",
  "foundations:typography": "Typography establishes hierarchy, readability, and tone across product experiences.",
  "foundations:spacing":
    "Spacing and corner radius create rhythm, structure, and consistent surfaces across the product.",
  "foundations:shadows-elevations": "Shadows and elevations communicate depth, layering, and interactive prominence.",
  "foundations:imagery":
    "Vehicle imagery documents Evox side and 3/4 renders used across campaigns and inventory surfaces.",
  "components:button": "Buttons allow the users to take action, make choices, or navigate within a product or website.",
  "components:avatar-bar": "Avatar Bar presents account context and quick user controls at the page edge.",
  "components:top-bar": "Top Bar introduces each page with title, context, and primary actions.",
  "components:breadcrumbs": "Breadcrumbs reveal navigation hierarchy and help users move through nested views.",
  "components:filter-button": "Filter Button toggles filter criteria and surfaces active filter selections.",
  "components:badge": "Badges highlight compact status, metadata, and categorical labels in context.",
  "components:input": "Input fields collect and validate typed information across forms and workflows.",
  "components:checkbox": "Checkboxes let users select one or more options from a set.",
  "components:radio": "Radio controls let users select exactly one option from mutually exclusive choices.",
  "components:toggle-switch": "Toggle Switch changes a setting between two clear, immediate states.",
  "components:automotive-system-toggle": "Automotive System Toggle provides a vehicle-style on/off control for system features.",
  "components:card": "Cards group related content and actions into clear, scannable information blocks.",
  "components:tabs": "Tabs organize peer content into quick, contextual view switches.",
  "components:table": "Tables display structured, comparable data across rows and columns.",
  "components:table-with-tabs": "Table with Tabs combines segmented table views with shared structure and controls.",
  "components:tooltip": "Tooltips reveal concise supporting information without leaving the current context.",
  "components:map-view-tooltip": "Map View Tooltip previews rich map metadata directly at point-of-interest interactions.",
  "components:progress-bar": "Progress Bars communicate completion state and remaining work over time.",
  "components:slider": "Sliders let users select values or ranges through direct manipulation.",
  "components:battery-threshold": "Battery Threshold controls configure and visualize threshold-based battery behavior.",
  "components:campaign-suggestion-card": "Campaign Suggestion Card summarizes campaign opportunities and suggested next actions.",
  "components:dashboard-widgets": "Dashboard Widgets present high-signal metrics, trends, and operational summaries.",
  "components:map-markers": "Map Markers visualize inventory, clusters, and selection state on map surfaces.",
  "components:stepper": "Steppers communicate progress across sequential tasks and multi-step workflows.",
  "components:paginator": "Paginator controls move users through paged data sets and long result lists.",
  "components:inline-tips": "Inline Tips provide contextual guidance, feedback, and status messaging.",
  "components:dropdown-menu": "Dropdown Menu surfaces compact action lists and contextual commands.",
  "components:modal": "Models communicate information by an overlayed window and allow users to maintain the context of a particular task.",
  "components:date-picker": "Date Picker controls help users select specific dates or ranges accurately.",
  "patterns:page-layout-chrome": "Page Layout Chrome defines the structural shell for navigation, headers, and content areas.",
  "patterns:fluid-shell-pilot": "Fluid Shell Pilot demonstrates adaptive shell behavior across responsive breakpoints.",
  "patterns:ai-textarea": "AI TextArea patterns support prompt entry, enhancement controls, and generated output flows.",
  "patterns:empty-state": "Empty State patterns guide users when no content is available yet.",
  "patterns:file-upload": "File Upload patterns support drag-drop ingestion, progress, and file-level feedback.",
  "patterns:sidebar": "Sidebar patterns organize primary navigation, section grouping, and persistent context.",
  "patterns:filters-panel": "Filters Panel patterns help users refine large datasets with structured controls.",
  "patterns:input-caption": "Input Caption patterns communicate helper text, errors, and validation states.",
  "patterns:vehicle-list-item": "Vehicle List Item patterns present compact inventory details for quick scanning.",
  "patterns:vehicle-list-panel": "Vehicle List Panel patterns combine list content with summary and browsing controls.",
  "patterns:vehicle-details-page": "Vehicle Details Page patterns structure deep inventory information and actions.",
};

const titleOverrides: Record<string, string> = {
  "components:button": "Buttons",
  "components:modal": "Modal",
};

function toTitle(label: string): string {
  if (label.toLowerCase() === "button") {
    return "Buttons";
  }
  return label;
}

export const designSystemEntries: DesignSystemPageEntry[] = [
  ...designSystemNavConfig.foundations.map((item) => ({
    group: "foundations" as const,
    slug: item.slug,
    title: titleOverrides[`foundations:${item.slug}`] ?? toTitle(item.label),
    description: entryDescriptions[`foundations:${item.slug}`] ?? "Design system foundation reference.",
  })),
  ...designSystemNavConfig.components.map((item) => ({
    group: "components" as const,
    slug: item.slug,
    title: titleOverrides[`components:${item.slug}`] ?? toTitle(item.label),
    description: entryDescriptions[`components:${item.slug}`] ?? "Design system component reference.",
    canonicalSlug: item.slug === "modal" ? "modal" : undefined,
  })),
  ...designSystemNavConfig.patterns.map((item) => ({
    group: "patterns" as const,
    slug: item.slug,
    title: titleOverrides[`patterns:${item.slug}`] ?? toTitle(item.label),
    description: entryDescriptions[`patterns:${item.slug}`] ?? "Design system pattern reference.",
  })),
  {
    group: "components",
    slug: "alert-dialog",
    canonicalSlug: "modal",
    title: "Modal",
    description: entryDescriptions["components:modal"],
  },
];

export function getDesignSystemDescription(group: DesignSystemGroup, slug: string): string {
  const normalizedSlug = group === "components" && slug === "alert-dialog" ? "modal" : slug;
  return (
    entryDescriptions[`${group}:${normalizedSlug}`] ??
    "Design system reference and usage guidance."
  );
}

export function getDesignSystemEntry(group: DesignSystemGroup, slug: string): DesignSystemPageEntry | null {
  return designSystemEntries.find((entry) => entry.group === group && entry.slug === slug) ?? null;
}

export function renderDesignSystemEntry(group: DesignSystemGroup, slug: string): React.ReactNode {
  const entry = getDesignSystemEntry(group, slug);
  if (entry == null) {
    return null;
  }

  if (group === "foundations") {
    return renderFoundationShowcase(entry.slug);
  }
  if (group === "components") {
    return renderComponentShowcase(entry.slug, entry.title);
  }
  return renderPatternShowcase(entry.slug, entry.title);
}
