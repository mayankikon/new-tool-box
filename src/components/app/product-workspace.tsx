"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  type SidebarNavSectionConfig,
  type SidebarProductConfig,
} from "@/components/ui/sidebar";
import { AvatarBar, AvatarBarShiftActions } from "@/components/app/avatar-bar";
import { TitleBar } from "@/components/app/title-bar";
import { Button } from "@/components/ui/button";
import { AtlasAiPage } from "@/components/atlas-ai/atlas-ai-page";
import { CampaignDashboard } from "@/components/campaigns/campaign-dashboard";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurationsPage } from "@/components/settings/configurations-page";
import { GeneralSettingsContent } from "@/components/settings/general-settings-content";
import { CustomersPage } from "@/components/customers/customers-page";
import { RegisterCustomerPage } from "@/components/customers/register-customer-page";
import { BillingPage } from "@/components/billing/billing-page";
import { StaffPage } from "@/components/staff/staff-page";
import { InventoryDashboardPage } from "@/components/inventory/inventory-dashboard";
import { ReportsPage } from "@/components/reports/reports-page";
import { TemplatesPage } from "@/components/templates/templates-page";
import { AppGroovedMainColumn } from "@/components/chrome/app-grooved-main-column";
import { AppMainLineFieldPattern } from "@/components/chrome/app-main-line-field-pattern";
import {
  getCampaignById,
  type CampaignRecommendation,
} from "@/lib/campaigns/mock-data";
import {
  BookUser,
  Home,
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  UserCog,
  Settings,
  Bell,
  Megaphone,
  Settings2,
  Globe,
  Target,
  BarChart3,
  Radio,
  Zap,
  Package,
  Download,
  Plus,
  Save,
  Activity,
  Wand2,
  TicketPercent,
  Palette,
  ImageIcon,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { BrandProfileSettings } from "@/components/settings/brand-profile-settings";
import { MediaLibraryPage } from "@/components/media/media-library-page";
import { ConnectAppEditor } from "@/components/connect-app/connect-app-editor";
import { CouponLibraryPage } from "@/components/campaigns/coupon-builder";
import { CampaignWizard } from "@/components/campaigns/campaign-wizard";
import { MarketingMonitorPage } from "@/components/marketing/marketing-monitor-page";
import { MarketingAudiencesPage } from "@/components/marketing/marketing-audiences-page";
import type { MarketingAudienceTabValue } from "@/components/marketing/marketing-audiences-table-model";
import {
  InventoryContent,
  type InventoryViewMode,
} from "@/components/inventory/inventory-content";
import { InventoryViewModeToggle } from "@/components/inventory/inventory-view-mode-toggle";
import type { WizardFormData } from "@/components/campaigns/campaign-wizard";
import type { CampaignOffer } from "@/lib/campaigns/types";
import { useBrandProfile } from "@/lib/branding/brand-profile-provider";
import { useNavVisibility } from "@/lib/nav-visibility/nav-visibility-provider";
import type { NavVisibilitySectionData } from "@/lib/nav-visibility/nav-visibility-storage";
import {
  DEV_CONSOLE_LABEL,
  getDefaultHrefForProduct,
  getWorkspaceHref,
  normalizeWorkspacePathname,
  resolveWorkspaceRoute,
} from "@/lib/app-nav/workspace-routes";

const products: SidebarProductConfig[] = [
  { id: "inventory", label: "Inventory Management", icon: Package },
  { id: "marketing", label: "Smart Marketing", icon: Megaphone },
];

type NavItemDef =
  | { label: string; icon: LucideIcon }
  | { label: string; iconSrc: string };

const inventoryMainItems: NavItemDef[] = [
  { label: "Inventory", icon: Home },
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Customers", icon: BookUser },
  { label: "Billing", icon: CreditCard },
  { label: "Reports", icon: FileText },
  { label: "Staff", icon: UserCog },
];

const inventorySettingsItems: NavItemDef[] = [
  { label: "General", icon: Settings },
  { label: "Brand Profile", icon: Palette },
  { label: "Alerts", icon: Bell },
  { label: "Geofences", iconSrc: "/boundary.svg" },
  { label: "Configurations", icon: Settings2 },
  { label: "Integrations", icon: Globe },
  { label: DEV_CONSOLE_LABEL, icon: LayoutDashboard },
];

const marketingMainItems: NavItemDef[] = [
  { label: "Ask Atlas", icon: Wand2 },
  { label: "Monitor", icon: Activity },
  { label: "Audiences", icon: Users },
  { label: "Campaigns", icon: Target },
  { label: "Templates", icon: FileText },
  { label: "Media Library", icon: ImageIcon },
  { label: "Coupons", icon: TicketPercent },
  { label: "Customization", icon: Smartphone },
];

const marketingSettingsItems: NavItemDef[] = [
  { label: "General", icon: Settings },
  { label: "Brand Profile", icon: Palette },
  { label: "Analytics", icon: BarChart3 },
  { label: "Channels", icon: Radio },
  { label: "Automations", icon: Zap },
  { label: DEV_CONSOLE_LABEL, icon: LayoutDashboard },
];

const navVisibilitySections: NavVisibilitySectionData[] = [
  {
    productId: "inventory",
    productLabel: "Inventory Management",
    mainLabels: inventoryMainItems.map((i) => i.label),
    settingsLabels: inventorySettingsItems.map((i) => i.label),
  },
  {
    productId: "marketing",
    productLabel: "Smart Marketing",
    mainLabels: marketingMainItems.map((i) => i.label),
    settingsLabels: marketingSettingsItems.map((i) => i.label),
  },
];

function buildSections(
  items: NavItemDef[],
  productId: string,
  activeLabel: string,
  title?: string
): SidebarNavSectionConfig[] {
  return [
    {
      title,
      items: items.map((item) => {
        const href = getWorkspaceHref(productId, item.label);
        return {
          ...item,
          isActive: item.label === activeLabel,
          ...(href ? { href } : {}),
        };
      }),
    },
  ];
}

interface InventoryPageConfig {
  title: string;
  right: React.ReactNode;
}

function InventoryPlaceholderSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div
              key={item}
              className="rounded-md border border-border bg-muted/20 px-4 py-3 text-sm text-foreground"
            >
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryPlaceholderPage({
  title,
  right,
  children,
}: InventoryPageConfig & { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
      <TitleBar title={title} right={right} />
      <div className="flex flex-1 flex-col gap-6 overflow-auto px-8 pb-8 pt-6">
        {children}
      </div>
    </div>
  );
}

export function ProductWorkspace() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile: brandProfile } = useBrandProfile();
  const { isItemHidden } = useNavVisibility();
  const normalizedPath = normalizeWorkspacePathname(pathname ?? "");
  const resolved = resolveWorkspaceRoute(normalizedPath);

  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isRegisteringCustomer, setIsRegisteringCustomer] = useState(false);
  const [inventoryHomeView, setInventoryHomeView] =
    useState<InventoryViewMode>("map");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  );
  const [campaignWizardInitialData, setCampaignWizardInitialData] = useState<
    | (Partial<WizardFormData> & {
        atlasSuggestedOffer?: Partial<CampaignOffer>;
        atlasSuggestedOffers?: Partial<CampaignOffer>[];
      })
    | undefined
  >(undefined);
  const [audienceInitialTab, setAudienceInitialTab] = useState<
    MarketingAudienceTabValue | undefined
  >(undefined);

  const handleProductChange = (productId: string) => {
    router.push(getDefaultHrefForProduct(productId));
    setSelectedCampaignId(null);
    setIsRegisteringCustomer(false);
  };

  const handleNavItemClick = () => {
    setSelectedCampaignId(null);
    setIsCreatingCampaign(false);
    setCampaignWizardInitialData(undefined);
    setIsRegisteringCustomer(false);
    setAudienceInitialTab(undefined);
  };

  const handleViewCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
  };

  const handleCampaignBack = () => {
    setSelectedCampaignId(null);
  };

  const handleCreateCampaignFromAtlas = (draft: {
    name: string;
    type: WizardFormData["type"];
    templateId: string | null;
    audienceSegments: WizardFormData["audienceSegments"];
    audienceSize: number;
    trigger?: WizardFormData["trigger"];
    suggestedOffer?: Partial<CampaignOffer>;
    suggestedOffers?: Partial<CampaignOffer>[];
  }) => {
    router.push(getWorkspaceHref("marketing", "Campaigns")!);
    setSelectedCampaignId(null);
    setCampaignWizardInitialData({
      name: draft.name,
      type: draft.type,
      templateId: draft.templateId,
      audienceSegments: draft.audienceSegments,
      audienceSize: draft.audienceSize,
      trigger: draft.trigger,
      ...(draft.suggestedOffers?.length
        ? { atlasSuggestedOffers: draft.suggestedOffers }
        : draft.suggestedOffer
          ? { atlasSuggestedOffer: draft.suggestedOffer }
          : {}),
    });
    setIsCreatingCampaign(true);
  };

  const handleNavigateToAudiences = (tab: MarketingAudienceTabValue) => {
    setAudienceInitialTab(tab);
    router.push(getWorkspaceHref("marketing", "Audiences")!);
  };

  const handleCreateCampaignFromMonitor = (
    suggestion: CampaignRecommendation,
  ) => {
    router.push(getWorkspaceHref("marketing", "Campaigns")!);
    setSelectedCampaignId(null);
    setCampaignWizardInitialData({
      name: suggestion.title,
      type: "service-reminder",
      templateId: suggestion.templateId ?? null,
      audienceSegments: [],
      audienceSize: suggestion.estimatedReach,
    });
    setIsCreatingCampaign(true);
  };

  const activeProduct = resolved?.productId ?? "marketing";
  const activeItem = resolved?.itemLabel ?? "Campaigns";

  const isInventory = activeProduct === "inventory";
  const mainItems = isInventory ? inventoryMainItems : marketingMainItems;
  const settingsItems = isInventory
    ? inventorySettingsItems
    : marketingSettingsItems;

  const visibleMainItems = mainItems.filter(
    (item) => !isItemHidden(activeProduct, item.label),
  );
  const visibleSettingsItems = settingsItems.filter(
    (item) => !isItemHidden(activeProduct, item.label),
  );

  const mainSections = buildSections(
    visibleMainItems,
    activeProduct,
    activeItem
  );

  const settingsSections = buildSections(
    visibleSettingsItems,
    activeProduct,
    activeItem,
    "Settings"
  );

  const isCampaignsView =
    activeProduct === "marketing" && activeItem === "Campaigns";
  const selectedCampaign = selectedCampaignId
    ? getCampaignById(selectedCampaignId)
    : undefined;
  const inventoryPageConfigs: Record<string, InventoryPageConfig> = {
    Dashboard: {
      title: "Dashboard",
      right: (
        <>
          <Button variant="secondary" size="header" leadingIcon={<Download />}>
            Export
          </Button>
          <Button size="header" leadingIcon={<Plus />}>
            Add Widget
          </Button>
        </>
      ),
    },
    Customers: {
      title: "Customers",
      right: (
        <>
          <Button variant="secondary" size="header" leadingIcon={<Download />}>
            Export
          </Button>
          <Button size="header" leadingIcon={<Plus />}>
            Add Customer
          </Button>
        </>
      ),
    },
    Reports: {
      title: "Reports",
      right: (
        <>
          <Button variant="secondary" size="header" leadingIcon={<Download />}>
            Export
          </Button>
          <Button size="header">
            Create Report
          </Button>
        </>
      ),
    },
    Staff: {
      title: "Staff",
      right: (
        <>
          <Button variant="secondary" size="header">
            Invite Staff
          </Button>
          <Button size="header" leadingIcon={<Save />}>
            Save Changes
          </Button>
        </>
      ),
    },
    General: {
      title: "General",
      right: (
        <Button size="header" leadingIcon={<Save />}>
          Save Changes
        </Button>
      ),
    },
    Alerts: {
      title: "Alerts",
      right: (
        <>
          <Button variant="secondary" size="header">
            Test Alert
          </Button>
          <Button size="header" leadingIcon={<Save />}>
            Save Rules
          </Button>
        </>
      ),
    },
    Configurations: {
      title: "Configurations",
      right: (
        <Button size="header" leadingIcon={<Save />}>
          Save Configuration
        </Button>
      ),
    },
    Geofences: {
      title: "Geofences",
      right: (
        <>
          <Button variant="secondary" size="header">
            Import Boundaries
          </Button>
          <Button size="header" leadingIcon={<Save />}>
            Save Geofences
          </Button>
        </>
      ),
    },
    Integrations: {
      title: "Integrations",
      right: (
        <Button size="header" leadingIcon={<Save />}>
          Save Connections
        </Button>
      ),
    },
    Billing: {
      title: "Billing",
      right: (
        <>
          <Button variant="secondary" size="header" leadingIcon={<Download />}>
            Export CSV
          </Button>
          <Button size="header">
            Generate Report
          </Button>
        </>
      ),
    },
  };
  const activeInventoryPage = isInventory
    ? inventoryPageConfigs[activeItem]
    : undefined;

  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar
        products={products}
        activeProductId={activeProduct}
        onProductChange={handleProductChange}
        showTopProductSwitcher={false}
        showFooterProductToggle={false}
        mainSections={mainSections}
        settingsSections={settingsSections}
        onNavItemClick={handleNavItemClick}
        user={{
          primaryText: brandProfile.dealershipName,
          secondaryText: "Automobile Group",
          logoSrc: brandProfile.logoUrl,
        }}
      />
      <AppGroovedMainColumn>
        <AvatarBar>
          <AvatarBarShiftActions
            displayName="Lewis Hamilton"
            role="Service Manager"
            initials="LH"
          />
        </AvatarBar>
        <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <AppMainLineFieldPattern />
          <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {isInventory && activeItem === "Inventory" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-6">
              <TitleBar
                title="Inventory"
                right={
                  <InventoryViewModeToggle
                    aria-label="Inventory view mode"
                    value={inventoryHomeView}
                    onValueChange={(value) =>
                      setInventoryHomeView(value as InventoryViewMode)
                    }
                    showHoverTooltips={false}
                  />
                }
              />
              <InventoryContent
                className="pt-6"
                viewMode={inventoryHomeView}
              />
            </div>
          ) : activeInventoryPage != null && activeItem === "Dashboard" ? (
            <InventoryDashboardPage />
          ) : isInventory &&
            activeItem === "Customers" &&
            isRegisteringCustomer ? (
            <RegisterCustomerPage
              onCancel={() => setIsRegisteringCustomer(false)}
            />
          ) : isInventory && activeItem === "Customers" ? (
            <CustomersPage
              pageTitle="Customers"
              onRegisterCustomer={() => setIsRegisteringCustomer(true)}
            />
          ) : activeProduct === "marketing" && activeItem === "Audiences" ? (
            <MarketingAudiencesPage initialTab={audienceInitialTab} />
          ) : activeItem === "Billing" ? (
            <BillingPage />
          ) : activeItem === "Staff" ? (
            <StaffPage />
          ) : activeInventoryPage != null && activeItem === "Reports" ? (
            <ReportsPage />
          ) : activeItem === "General" ? (
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
              <TitleBar
                title={inventoryPageConfigs.General.title}
                right={inventoryPageConfigs.General.right}
              />
              <GeneralSettingsContent
                products={products}
                activeProductId={activeProduct}
                onProductChange={handleProductChange}
                className="overflow-auto pt-6"
                navSections={navVisibilitySections}
              />
            </div>
          ) : activeItem === "Brand Profile" ? (
            <BrandProfileSettings
              topBar={
                <TitleBar
                  title="Brand Profile"
                  right={
                    <Button size="header" leadingIcon={<Save />}>
                      Save Changes
                    </Button>
                  }
                />
              }
            />
          ) : activeProduct === "marketing" && activeItem === "Media Library" ? (
            <MediaLibraryPage
              topBar={
                <TitleBar
                  title="Media Library"
                  right={
                    <Button size="header" leadingIcon={<Save />}>
                      Save
                    </Button>
                  }
                />
              }
            />
          ) : activeProduct === "marketing" &&
            activeItem === "Customization" ? (
            <ConnectAppEditor
              topBar={
                <TitleBar
                  title="Customization"
                  right={
                    <Button size="header" leadingIcon={<Save />}>
                      Save
                    </Button>
                  }
                />
              }
            />
          ) : activeInventoryPage != null &&
            activeItem === "Alerts" ? (
            <InventoryPlaceholderPage {...activeInventoryPage}>
              <InventoryPlaceholderSection
                title="Alert Rules"
                description="Use this area for thresholds, delivery channels, and escalation paths tied to geofence behavior."
                items={[
                  "Entry alerts by lot",
                  "Exit alerts after hours",
                  "Unexpected dwell thresholds",
                  "Low battery notifications",
                  "Escalation recipients",
                  "Quiet hours and suppressions",
                ]}
              />
            </InventoryPlaceholderPage>
          ) : activeInventoryPage != null && activeItem === "Geofences" ? (
            <InventoryPlaceholderPage {...activeInventoryPage}>
              <InventoryPlaceholderSection
                title="Geofence Library"
                description="Manage lot boundaries, delivery corridors, and zone coverage used for vehicle tracking and alerting."
                items={[
                  "Primary dealership lot",
                  "Overflow parking zone",
                  "Service lane perimeter",
                  "Test drive route boundary",
                  "Off-site storage lot",
                  "Recovery and tow zones",
                ]}
              />
            </InventoryPlaceholderPage>
          ) : activeInventoryPage != null && activeItem === "Configurations" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ConfigurationsPage
                topBar={
                  <TitleBar
                    title={activeInventoryPage.title}
                    right={activeInventoryPage.right}
                  />
                }
              />
            </div>
          ) : activeInventoryPage != null && activeItem === "Integrations" ? (
            <InventoryPlaceholderPage {...activeInventoryPage}>
              <InventoryPlaceholderSection
                title="Connected Systems"
                description="Control third-party data feeds and platform connections that power inventory monitoring."
                items={[
                  "DMS sync",
                  "CRM handoff",
                  "GPS device provider",
                  "Battery telemetry feed",
                  "Tow vendor dispatch",
                  "Webhook subscriptions",
                ]}
              />
            </InventoryPlaceholderPage>
          ) : activeItem === DEV_CONSOLE_LABEL ? (
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
              <TitleBar title={DEV_CONSOLE_LABEL} />
              <div className="flex flex-1 flex-col gap-6 overflow-auto px-8 pb-8 pt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Developer Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      size="header"
                      onClick={() => router.push("/design-system")}
                    >
                      Design System
                    </Button>
                    <Button
                      variant="secondary"
                      size="header"
                      onClick={() => router.push("/design-playground")}
                    >
                      Design Playground
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : isCampaignsView && isCreatingCampaign ? (
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
              <TitleBar title="Campaigns" />
              <CampaignWizard
                key={
                  campaignWizardInitialData == null
                    ? "campaign-wizard-default"
                    : `campaign-wizard-${campaignWizardInitialData.name ?? "atlas"}-${
                        campaignWizardInitialData.templateId ?? "custom"
                      }-${campaignWizardInitialData.audienceSize ?? 0}`
                }
                initialData={campaignWizardInitialData}
                onCancel={() => {
                  setIsCreatingCampaign(false);
                  setCampaignWizardInitialData(undefined);
                }}
                onComplete={() => {
                  setIsCreatingCampaign(false);
                  setCampaignWizardInitialData(undefined);
                }}
              />
            </div>
          ) : isCampaignsView && selectedCampaign ? (
            <CampaignDetail
              campaign={selectedCampaign}
              onBack={handleCampaignBack}
            />
          ) : isCampaignsView ? (
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-6">
              <TitleBar
                title="Campaigns"
                right={
                  <Button
                    size="header"
                    leadingIcon={<Plus />}
                    onClick={() => setIsCreatingCampaign(true)}
                  >
                    Create Campaign
                  </Button>
                }
              />
              <CampaignDashboard
                onCreateCampaign={() => {
                  setCampaignWizardInitialData(undefined);
                  setIsCreatingCampaign(true);
                }}
                onViewCampaign={handleViewCampaign}
              />
            </div>
          ) : activeProduct === "marketing" && activeItem === "Monitor" ? (
            <MarketingMonitorPage
              onCreateCampaignFromSuggestion={handleCreateCampaignFromMonitor}
              onNavigateToAudiences={handleNavigateToAudiences}
            />
          ) : activeProduct === "marketing" && activeItem === "Ask Atlas" ? (
            <AtlasAiPage
              onCreateCampaign={handleCreateCampaignFromAtlas}
              onNavigateToCampaigns={() => {
                router.push(getWorkspaceHref("marketing", "Campaigns")!);
              }}
            />
          ) : activeProduct === "marketing" && activeItem === "Coupons" ? (
            <CouponLibraryPage />
          ) : activeProduct === "marketing" && activeItem === "Templates" ? (
            <TemplatesPage
              onOpenCampaign={(campaignId) => {
                router.push(getWorkspaceHref("marketing", "Campaigns")!);
                setSelectedCampaignId(campaignId);
                setIsCreatingCampaign(false);
              }}
            />
          ) : null}
          </div>
        </main>
      </AppGroovedMainColumn>
    </div>
  );
}
