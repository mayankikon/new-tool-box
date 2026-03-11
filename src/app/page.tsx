"use client";

import { useState, useCallback } from "react";
import {
  Sidebar,
  type SidebarNavSectionConfig,
  type SidebarProductConfig,
} from "@/components/ui/sidebar";
import { TopBar } from "@/components/app/top-bar";
import { Button } from "@/components/ui/button";
import { CampaignDashboard } from "@/components/campaigns/campaign-dashboard";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { getCampaignById } from "@/lib/campaigns/mock-data";
import {
  Home,
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  UserCog,
  Settings,
  MapPin,
  Bell,
  Megaphone,
  Settings2,
  Globe,
  Target,
  BarChart3,
  Radio,
  Zap,
  Package,
  type LucideIcon,
} from "lucide-react";
import { CampaignWizard } from "@/components/campaigns/campaign-wizard";

const products: SidebarProductConfig[] = [
  { id: "inventory", label: "Inventory Management", icon: Package },
  { id: "marketing", label: "Smart Marketing", icon: Megaphone },
];

interface NavItemDef {
  label: string;
  icon: LucideIcon;
}

const inventoryMainItems: NavItemDef[] = [
  { label: "Home", icon: Home },
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Customers", icon: Users },
  { label: "Billing", icon: CreditCard },
  { label: "Reports", icon: FileText },
  { label: "Staff", icon: UserCog },
];

const inventorySettingsItems: NavItemDef[] = [
  { label: "General", icon: Settings },
  { label: "Geofences", icon: MapPin },
  { label: "Alerts", icon: Bell },
  { label: "Marketing", icon: Megaphone },
  { label: "Configurations", icon: Settings2 },
];

const marketingMainItems: NavItemDef[] = [
  { label: "Atlas AI", icon: Globe },
  { label: "Campaigns", icon: Target },
  { label: "Customers", icon: Users },
];

const marketingSettingsItems: NavItemDef[] = [
  { label: "Analytics", icon: BarChart3 },
  { label: "Channels", icon: Radio },
  { label: "Automations", icon: Zap },
];

const defaultActiveByProduct: Record<string, string> = {
  inventory: "Home",
  marketing: "Atlas AI",
};

function buildSections(
  items: NavItemDef[],
  activeLabel: string,
  title?: string
): SidebarNavSectionConfig[] {
  return [
    {
      title,
      items: items.map((item) => ({
        ...item,
        isActive: item.label === activeLabel,
      })),
    },
  ];
}

export default function ProductPage() {
  const [activeProduct, setActiveProduct] = useState("marketing");
  const [activeItem, setActiveItem] = useState("Campaigns");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null
  );

  const handleProductChange = useCallback((productId: string) => {
    setActiveProduct(productId);
    setActiveItem(defaultActiveByProduct[productId] ?? "Home");
    setSelectedCampaignId(null);
  }, []);

  const handleNavItemClick = useCallback((label: string) => {
    setActiveItem(label);
    setSelectedCampaignId(null);
    setIsCreatingCampaign(false);
  }, []);

  const handleViewCampaign = useCallback((campaignId: string) => {
    setSelectedCampaignId(campaignId);
  }, []);

  const handleCampaignBack = useCallback(() => {
    setSelectedCampaignId(null);
  }, []);

  const isInventory = activeProduct === "inventory";
  const mainItems = isInventory ? inventoryMainItems : marketingMainItems;
  const settingsItems = isInventory
    ? inventorySettingsItems
    : marketingSettingsItems;

  const mainSections = buildSections(mainItems, activeItem);
  const settingsSections = buildSections(settingsItems, activeItem, "Settings");

  const isCampaignsView =
    activeProduct === "marketing" && activeItem === "Campaigns";
  const selectedCampaign = selectedCampaignId
    ? getCampaignById(selectedCampaignId)
    : undefined;

  // Page title, description, and primary CTA live in main content below the top bar, not in the TopBar.
  // Top bar is left empty when viewing campaign details; campaign name lives in the detail view only.
  const topBarTitle =
    isCampaignsView && isCreatingCampaign
      ? "Create Campaign"
      : isCampaignsView && selectedCampaign
        ? undefined
        : isCampaignsView
          ? undefined
          : activeItem;
  const topBarSubtitle = undefined;
  const topBarRight = null;

  return (
    <div className="flex h-screen bg-background font-sans">
      <Sidebar
        products={products}
        activeProductId={activeProduct}
        onProductChange={handleProductChange}
        mainSections={mainSections}
        settingsSections={settingsSections}
        onNavItemClick={handleNavItemClick}
      />
      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          title={topBarTitle}
          subtitle={topBarSubtitle}
          right={topBarRight}
        />
        <main className="flex flex-1 flex-col overflow-hidden">
          {isCampaignsView && isCreatingCampaign ? (
            <CampaignWizard
              onCancel={() => setIsCreatingCampaign(false)}
              onComplete={() => setIsCreatingCampaign(false)}
            />
          ) : isCampaignsView && selectedCampaign ? (
            <CampaignDetail
              campaign={selectedCampaign}
              onBack={handleCampaignBack}
            />
          ) : isCampaignsView ? (
            <CampaignDashboard
              onCreateCampaign={() => setIsCreatingCampaign(true)}
              onViewCampaign={handleViewCampaign}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
