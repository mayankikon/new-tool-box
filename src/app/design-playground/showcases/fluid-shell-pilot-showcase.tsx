"use client";

import * as React from "react";
import {
  Bell,
  BookUser,
  CreditCard,
  FileText,
  Globe,
  Home,
  LayoutDashboard,
  Megaphone,
  Package,
  Settings,
  Settings2,
  UserCog,
  type LucideIcon,
} from "lucide-react";

import { BillingPage } from "@/components/billing/billing-page";
import {
  Sidebar,
  type SidebarNavSectionConfig,
  type SidebarProductConfig,
} from "@/components/ui/sidebar";

import { FluidShellPilotFrame } from "../components/fluid-shell-pilot-frame";
import { PlayAreaSection } from "../components/play-area-section";
import {
  readFluidShellSidebarCollapsed,
  writeFluidShellSidebarCollapsed,
} from "../components/fluid-shell-pilot-storage";

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
  { label: "Alerts", icon: Bell },
  { label: "Geofences", iconSrc: "/boundary.svg" },
  { label: "Configurations", icon: Settings2 },
  { label: "Integrations", icon: Globe },
];

function buildSections(
  items: NavItemDef[],
  activeLabel: string,
  title?: string,
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

export function FluidShellPilotShowcase() {
  const [collapsed, setCollapsed] = React.useState(false);
  const noop = React.useCallback(() => {}, []);
  const mainSections = React.useMemo(
    () => buildSections(inventoryMainItems, "Billing"),
    [],
  );
  const settingsSections = React.useMemo(
    () => buildSections(inventorySettingsItems, "", "Settings"),
    [],
  );

  React.useEffect(() => {
    setCollapsed(readFluidShellSidebarCollapsed(window.localStorage));
  }, []);

  React.useEffect(() => {
    writeFluidShellSidebarCollapsed(window.localStorage, collapsed);
  }, [collapsed]);

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Fluid shell pilot</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Playground-only shell experiment for merged sidebar/content chrome with a persistent icon-rail collapse.
          This does not affect production page containers.
        </p>
      </div>

      <PlayAreaSection
        id="playground-fluid-shell-pilot"
        title="Play area: fluid shell"
        description="Click the sidebar collapse button to switch between expanded navigation and icon-only rail. State persists for the playground pilot."
      >
        <div className="fluid-shell-pilot-outer-texture relative h-[min(80vh,900px)] min-h-[540px] w-full overflow-hidden">
          <FluidShellPilotFrame
            className="relative z-[1]"
            sidebar={
              <Sidebar
                className="fluid-shell-pilot-sidebar-rail"
                products={products}
                activeProductId="inventory"
                onProductChange={noop}
                mainSections={mainSections}
                settingsSections={settingsSections}
                onNavItemClick={noop}
                showFooterProductToggle={false}
                collapsible
                collapsed={collapsed}
                onCollapsedChange={setCollapsed}
              />
            }
          >
            <main className="fluid-shell-pilot-main">
              <BillingPage presentation="designPlaygroundLight" />
            </main>
          </FluidShellPilotFrame>
        </div>
      </PlayAreaSection>
    </div>
  );
}
