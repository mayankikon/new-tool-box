const STORAGE_KEY = "sm-nav-visibility-v1";

export const NAV_VISIBILITY_CHANGED_EVENT = "sm-nav-visibility-changed";

export interface NavVisibilityData {
  /** Maps product id → array of hidden nav item labels. */
  hiddenItems: Record<string, string[]>;
}

/** UI-level descriptor passed to the settings page. */
export interface NavVisibilitySectionData {
  productId: string;
  productLabel: string;
  mainLabels: string[];
  settingsLabels: string[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadNavVisibility(): NavVisibilityData {
  if (!isBrowser()) return { hiddenItems: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NavVisibilityData>;
      if (
        parsed?.hiddenItems &&
        typeof parsed.hiddenItems === "object" &&
        !Array.isArray(parsed.hiddenItems)
      ) {
        return { hiddenItems: parsed.hiddenItems };
      }
    }
  } catch {
    /* ignore corrupt data */
  }
  return { hiddenItems: {} };
}

export function saveNavVisibility(data: NavVisibilityData): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(NAV_VISIBILITY_CHANGED_EVENT));
  } catch {
    /* ignore persistence failures */
  }
}

export function getHiddenLabels(
  data: NavVisibilityData,
  productId: string,
): string[] {
  return data.hiddenItems[productId] ?? [];
}
