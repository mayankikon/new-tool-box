const FLUID_SHELL_SIDEBAR_COLLAPSED_KEY =
  "design-playground.fluid-shell-pilot.sidebar-collapsed";

export function readFluidShellSidebarCollapsed(
  storage: Pick<Storage, "getItem"> | undefined,
): boolean {
  if (!storage) return false;
  const raw = storage.getItem(FLUID_SHELL_SIDEBAR_COLLAPSED_KEY);
  return raw === "1";
}

export function writeFluidShellSidebarCollapsed(
  storage: Pick<Storage, "setItem"> | undefined,
  collapsed: boolean,
): void {
  if (!storage) return;
  storage.setItem(FLUID_SHELL_SIDEBAR_COLLAPSED_KEY, collapsed ? "1" : "0");
}

export { FLUID_SHELL_SIDEBAR_COLLAPSED_KEY };
