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
import { Checkbox } from "@/components/ui/checkbox";
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
import { LinkButton } from "@/components/ui/link-button";
import { MapViewTooltip } from "@/components/ui/map-view-tooltip";
import { MagicPathFormControlsShowcase } from "@/components/ui/magicpath-form-controls-showcase";
import { Paginator } from "@/components/ui/paginator";
import { ProgressBar } from "@/components/ui/progress";
import { RadioCardGroup, RadioCardOption } from "@/components/ui/radio-card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RadioList, RadioListItem } from "@/components/ui/radio-list";
import { RadioSegmented } from "@/components/ui/radio-segmented";
import { Sidebar } from "@/components/ui/sidebar";
import { Slider, RangeSlider } from "@/components/ui/slider";
import { StepperHorizontal } from "@/components/ui/stepper-horizontal";
import { StepperVertical } from "@/components/ui/stepper-vertical";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TelemetryDeckTab, TelemetryDeckTabList, TelemetryDeckTabs } from "@/components/ui/telemetry-deck-tabs";
import { ToggleSwitch, type ToggleSwitchOption } from "@/components/ui/toggle-switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VehicleListItem } from "@/components/ui/vehicle-list-item";
import { VehicleListPanel } from "@/components/ui/vehicle-list-panel";
import { VehicleMapClusterMarker } from "@/components/ui/vehicle-map-cluster-marker";
import { VehicleMapMarkerChip } from "@/components/ui/vehicle-map-marker-chip";
import { VehicleMapMarkerPin } from "@/components/ui/vehicle-map-marker-pin";

import { DesignSystemNav } from "./components/DesignSystemNav";
import { DesignSystemTemplate } from "./components/DesignSystemTemplate";
import { SectionTitle } from "./components/atoms/SectionTitle";
import { ShowcaseCard } from "./components/atoms/ShowcaseCard";
import { ComponentShowcaseBlock } from "./components/molecules/ComponentShowcaseBlock";
import { AlertDialogShowcaseSection } from "./components/organisms/AlertDialogShowcaseSection";
import { BatteryThresholdShowcaseSection } from "./components/organisms/BatteryThresholdShowcaseSection";
import { ButtonShowcaseSection } from "./components/organisms/ButtonShowcaseSection";
import { ColorsSection } from "./components/organisms/ColorsSection";
import { RadiusSection } from "./components/organisms/RadiusSection";
import { ShadowsElevationsSection } from "./components/organisms/ShadowsElevationsSection";
import { SpacingSection } from "./components/organisms/SpacingSection";
import { StrokeSection } from "./components/organisms/StrokeSection";
import { TypographySection } from "./components/organisms/TypographySection";
import {
  DesignSystemTableViewPattern,
  DesignSystemTableViewPatternNoTabs,
} from "./components/patterns/table-view-pattern";
import { VehicleDetailsPagePattern } from "./components/patterns/vehicle-details-page-pattern";
import { designSystemNavConfig } from "./design-system-nav-config";

const SAMPLE_STEPS = [
  { label: "Audience", caption: "Pick segment" },
  { label: "Message", caption: "Compose content" },
  { label: "Schedule", caption: "Set timing" },
  { label: "Launch", caption: "Go live" },
];

const SAMPLE_VEHICLES = [
  {
    title: "2023 BMW X5 xDrive40i",
    vin: "5UXCR6C02P9R12345",
    price: "$58,900",
    mileage: "12,412 mi",
    statusIcons: { location: "active" as const, keyPaired: "active" as const, battery: "inactive" as const },
  },
  {
    title: "2022 BMW 330i Sedan",
    vin: "WBA5R1C0XNFH56789",
    price: "$41,200",
    mileage: "18,903 mi",
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
            size="xs"
            variant={variant === nextVariant ? "default" : "outline"}
            onClick={() => setVariant(nextVariant)}
          >
            {nextVariant}
          </Button>
        ))}
        {(["sm", "md"] as const).map((nextSize) => (
          <Button key={nextSize} size="xs" variant={size === nextSize ? "default" : "outline"} onClick={() => setSize(nextSize)}>
            {nextSize}
          </Button>
        ))}
        {(["default", "pill"] as const).map((nextShape) => (
          <Button key={nextShape} size="xs" variant={shape === nextShape ? "default" : "outline"} onClick={() => setShape(nextShape)}>
            {nextShape}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {BADGE_TONES.map((nextTone) => (
          <Button key={nextTone} size="xs" variant={tone === nextTone ? "default" : "outline"} onClick={() => setTone(nextTone)}>
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
          <Button key={nextSize} size="xs" variant={size === nextSize ? "default" : "outline"} onClick={() => setSize(nextSize)}>
            {nextSize}
          </Button>
        ))}
        {(["label", "icon"] as const).map((nextMode) => (
          <Button key={nextMode} size="xs" variant={mode === nextMode ? "default" : "outline"} onClick={() => setMode(nextMode)}>
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
  const [tabsVariant, setTabsVariant] = React.useState<"line" | "pill">("line");
  const [value, setValue] = React.useState("overview");
  const [deckValue, setDeckValue] = React.useState("drive");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {(["line", "pill"] as const).map((nextVariant) => (
          <Button key={nextVariant} size="xs" variant={tabsVariant === nextVariant ? "default" : "outline"} onClick={() => setTabsVariant(nextVariant)}>
            {nextVariant}
          </Button>
        ))}
      </div>
      <Tabs value={value} onValueChange={setValue}>
        <TabsList variant={tabsVariant}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">Campaign overview content.</TabsContent>
        <TabsContent value="audience" className="pt-4 text-sm text-muted-foreground">Audience targeting content.</TabsContent>
        <TabsContent value="messages" className="pt-4 text-sm text-muted-foreground">Message channel content.</TabsContent>
      </Tabs>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Telemetry deck strip</p>
        <TelemetryDeckTabs value={deckValue} onValueChange={setDeckValue}>
          <TelemetryDeckTabList>
            <TelemetryDeckTab value="drive">Drive</TelemetryDeckTab>
            <TelemetryDeckTab value="energy" ledTone="forest">Energy</TelemetryDeckTab>
            <TelemetryDeckTab value="alerts" ledTone="amber">Alerts</TelemetryDeckTab>
          </TelemetryDeckTabList>
        </TelemetryDeckTabs>
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
          <Button key={nextVariant} size="xs" variant={variant === nextVariant ? "default" : "outline"} onClick={() => setVariant(nextVariant)}>
            {nextVariant}
          </Button>
        ))}
        {[60, 40, 30, 20, 10].map((nextValue) => (
          <Button key={nextValue} size="xs" variant={value === nextValue ? "default" : "outline"} onClick={() => setValue(nextValue)}>
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
          <Button key={nextVariant} size="xs" variant={variant === nextVariant ? "default" : "outline"} onClick={() => setVariant(nextVariant)}>
            {nextVariant}
          </Button>
        ))}
        {[1, 2, 3, 4, 5].map((page) => (
          <Button key={page} size="xs" variant={currentPage === page ? "default" : "outline"} onClick={() => setCurrentPage(page)}>
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
          <Button key={nextVariant} size="xs" variant={variant === nextVariant ? "default" : "outline"} onClick={() => setVariant(nextVariant)}>
            {nextVariant}
          </Button>
        ))}
        {(["icon", "pill", "pill-sm"] as const).map((shape) => (
          <Button key={shape} size="xs" variant={submitShape === shape ? "default" : "outline"} onClick={() => setSubmitShape(shape)}>
            {shape}
          </Button>
        ))}
        <Button size="xs" variant={showSecondary ? "default" : "outline"} onClick={() => setShowSecondary((current) => !current)}>
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

function wrapSection(id: string, title: string, description: React.ReactNode, content: React.ReactNode) {
  return (
    <section key={id} id={id} className="scroll-mt-28 space-y-8">
      <SectionTitle title={title} description={description} />
      {content}
    </section>
  );
}

function renderComponentShowcase(slug: string, label: string) {
  switch (slug) {
    case "button":
      return <ButtonShowcaseSection key={slug} />;
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
        "Basic checkbox states plus list, card, and segmented patterns.",
        <ShowcaseCard className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Basic</p>
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm"><Checkbox checked /> Checked</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox /> Unchecked</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox disabled checked /> Disabled</label>
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
        "Mutually-exclusive controls with list, card, and segmented patterns.",
        <ShowcaseCard className="space-y-8">
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Basic</p>
            <RadioGroup defaultValue="high" className="gap-3">
              {[
                { value: "high", label: "High priority" },
                { value: "medium", label: "Medium priority" },
                { value: "low", label: "Low priority" },
              ].map((item) => (
                <label key={item.value} className="flex items-center gap-3 text-sm">
                  <RadioGroupItem value={item.value} id={`radio-${item.value}`} />
                  {item.label}
                </label>
              ))}
            </RadioGroup>
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
          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Segmented pattern</p>
            <RadioSegmented
              defaultValue="map"
              options={[
                { value: "map", label: "Map", icon: <Car className="size-4" /> },
                { value: "table", label: "Table", icon: <Hash className="size-4" /> },
                { value: "timeline", label: "Timeline", icon: <Bell className="size-4" /> },
              ]}
            />
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
        <div className="grid gap-4 md:grid-cols-2">
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
          <Card size="sm">
            <CardHeader>
              <CardTitle>Compact Card</CardTitle>
              <CardDescription>Smaller spacing variant.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" size="xs">Open</Button>
            </CardFooter>
          </Card>
        </div>,
      );
    case "tabs":
      return wrapSection(
        slug,
        label,
        "Line, pill, and telemetry deck tabs with interactive switching.",
        <ShowcaseCard className="space-y-8">
          <InteractiveTabsShowcase />
        </ShowcaseCard>,
      );
    case "table":
      return wrapSection(
        slug,
        label,
        "Data table primitives for compact and default rows.",
        <ShowcaseCard>
          <Table className="min-w-[680px]">
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Service Reminder</TableCell>
                <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                <TableCell>420</TableCell>
                <TableCell className="text-right">$18,500</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Battery Health Alert</TableCell>
                <TableCell><Badge variant="outline">Scheduled</Badge></TableCell>
                <TableCell>85</TableCell>
                <TableCell className="text-right">$6,200</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ShowcaseCard>,
      );
    case "tooltip":
      return wrapSection(
        slug,
        label,
        "Default and card tooltip variants.",
        <ShowcaseCard>
          <TooltipProvider>
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                  Hover me
                </TooltipTrigger>
                <TooltipContent>Quick tooltip copy</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="secondary" size="sm" />}>
                  Rich tooltip
                </TooltipTrigger>
                <TooltipContent variant="card">Use card tooltips for longer explanatory text.</TooltipContent>
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
      return <BatteryThresholdShowcaseSection key={slug} />;
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
          <div className="flex flex-wrap items-end gap-8">
            <VehicleMapMarkerPin tone="teal" hoverable />
            <VehicleMapMarkerChip variantIndex={0} hoverOverlayColor="#00B397" />
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
    case "alert-dialog":
      return <AlertDialogShowcaseSection key={slug} />;
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
            right={<Button size="sm">Save Draft</Button>}
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
    case "link-button":
      return wrapSection(
        slug,
        label,
        "Text-forward button for inline actions.",
        <ShowcaseCard>
          <div className="flex flex-wrap gap-3">
            <LinkButton asButton>Default link button</LinkButton>
            <LinkButton asButton variant="muted">Muted</LinkButton>
            <LinkButton asButton variant="primary" underline>Primary</LinkButton>
          </div>
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
    case "sort-form-controls-reference":
      return (
        <section key={slug} id={slug} className="scroll-mt-28 space-y-8">
          <SectionTitle
            title={label}
            description="Portfolio 3.0 form controls: `PortfolioCheckboxControl` (border #ebeced, selected fill #01AC81) and `PortfolioRadioButton` (accent #01AC81). Below: Figma-sized 307×163 reference frame (`magicpath-form-controls-showcase.tsx`). Product checkboxes/radios use `Checkbox` / `RadioGroupItem` in `src/components/ui/`."
          />
          <div className="flex justify-center rounded-sm border border-border bg-card p-6">
            <MagicPathFormControlsShowcase className="rounded-sm shadow-sm" />
          </div>
        </section>
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
            title={label}
            description="Interactive shell preview: sidebar, avatar bar, top bar, and main column patterns used across the app."
          />
          <PageLayoutChromeShowcase />
        </section>
      );
    case "table-view":
      return (
        <section key={slug} id={slug} className="scroll-mt-28 space-y-8">
          <SectionTitle
            title={label}
            description="File-cabinet table with tabs (sortable grid + paginator) and the simpler bordered table shell."
          />
          <div className="space-y-10">
            <div>
              <h3 className="ds-doc-font mb-4 text-lg font-medium text-foreground">Table with tabs</h3>
              <DesignSystemTableViewPattern />
            </div>
            <div>
              <h3 className="ds-doc-font mb-4 text-lg font-medium text-foreground">Table (no tabs)</h3>
              <DesignSystemTableViewPatternNoTabs />
            </div>
          </div>
        </section>
      );
    case "vehicle-details-page":
      return (
        <section key={slug} id={slug} className="scroll-mt-28 space-y-8">
          <SectionTitle title={label} description="Mobile-first inventory vehicle detail panel." />
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

export default function DesignSystemPage() {
  return (
    <DesignSystemTemplate left={<DesignSystemNav />}>
      <ColorsSection />
      <TypographySection />
      <SpacingSection />
      <RadiusSection />
      <ShadowsElevationsSection />
      <StrokeSection />
      {designSystemNavConfig.components.map(({ slug, label }) =>
        renderComponentShowcase(slug, label),
      )}
      {designSystemNavConfig.patterns.map(({ slug, label }) =>
        renderPatternShowcase(slug, label),
      )}
    </DesignSystemTemplate>
  );
}
