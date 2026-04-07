/**
 * Canonical URLs for the product shell (Inventory Management + Smart Marketing).
 * Used by the sidebar and by pathname → active nav resolution.
 */

export const DEFAULT_WORKSPACE_PATH = "/marketing/campaigns";

const DEV_CONSOLE_LABEL = "Dev Console";

const inventoryMainHrefs: Record<string, string> = {
  Inventory: "/inventory",
  Dashboard: "/inventory/dashboard",
  Customers: "/customers",
  Billing: "/billing",
  Reports: "/reports",
  Staff: "/staff",
};

const inventorySettingsHrefs: Record<string, string> = {
  General: "/inventory/settings/general",
  "Brand Profile": "/inventory/settings/brand-profile",
  Alerts: "/inventory/settings/alerts",
  Geofences: "/inventory/settings/geofences",
  Configurations: "/inventory/settings/configurations",
  Integrations: "/inventory/settings/integrations",
  [DEV_CONSOLE_LABEL]: "/inventory/settings/dev-console",
};

const marketingMainHrefs: Record<string, string> = {
  "Ask Atlas": "/marketing/atlas",
  Monitor: "/marketing/monitor",
  Audiences: "/marketing/audiences",
  Campaigns: "/marketing/campaigns",
  Templates: "/marketing/templates",
  "Media Library": "/marketing/media-library",
  Coupons: "/marketing/coupons",
  Customization: "/marketing/customization",
};

const marketingSettingsHrefs: Record<string, string> = {
  General: "/marketing/settings/general",
  "Brand Profile": "/marketing/settings/brand-profile",
  Analytics: "/marketing/settings/analytics",
  Channels: "/marketing/settings/channels",
  Automations: "/marketing/settings/automations",
  [DEV_CONSOLE_LABEL]: "/marketing/settings/dev-console",
};

export interface WorkspaceNavResolution {
  productId: "inventory" | "marketing";
  itemLabel: string;
}

function buildPathToNav(): Map<string, WorkspaceNavResolution> {
  const map = new Map<string, WorkspaceNavResolution>();

  for (const [label, href] of Object.entries(inventoryMainHrefs)) {
    map.set(href, { productId: "inventory", itemLabel: label });
  }
  for (const [label, href] of Object.entries(inventorySettingsHrefs)) {
    map.set(href, { productId: "inventory", itemLabel: label });
  }
  for (const [label, href] of Object.entries(marketingMainHrefs)) {
    map.set(href, { productId: "marketing", itemLabel: label });
  }
  for (const [label, href] of Object.entries(marketingSettingsHrefs)) {
    map.set(href, { productId: "marketing", itemLabel: label });
  }

  return map;
}

const pathToNav = buildPathToNav();

/** Normalize pathname (strip trailing slash except root). */
export function normalizeWorkspacePathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.replace(/\/$/, "");
}

export function resolveWorkspaceRoute(
  pathname: string
): WorkspaceNavResolution | null {
  const normalized = normalizeWorkspacePathname(pathname);
  return pathToNav.get(normalized) ?? null;
}

export function getWorkspaceHref(
  productId: string,
  itemLabel: string
): string | undefined {
  if (productId === "inventory") {
    return (
      inventoryMainHrefs[itemLabel] ?? inventorySettingsHrefs[itemLabel]
    );
  }
  if (productId === "marketing") {
    return (
      marketingMainHrefs[itemLabel] ?? marketingSettingsHrefs[itemLabel]
    );
  }
  return undefined;
}

export function getDefaultHrefForProduct(productId: string): string {
  if (productId === "inventory") return "/inventory";
  return DEFAULT_WORKSPACE_PATH;
}

export { DEV_CONSOLE_LABEL };
