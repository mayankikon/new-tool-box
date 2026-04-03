import type {
  ConnectAppConfig,
  ConnectAppConfigPersisted,
} from "./connect-app-types";
import {
  createDefaultConnectAppConfig,
  normalizeConnectAppConfig,
  sanitizeConnectQuickActions,
} from "./connect-app-types";

const STORAGE_KEY = "sm-connect-app-config-v1";

export const CONNECT_APP_CHANGED_EVENT = "sm-connect-app-changed";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadConnectAppConfig(): ConnectAppConfig {
  if (!isBrowser()) {
    return createDefaultConnectAppConfig();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createDefaultConnectAppConfig();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<ConnectAppConfigPersisted> & {
      useBrandProfileTheme?: boolean;
    };
    const { useBrandProfileTheme: _legacyUseBrandTheme, ...rest } = parsed;
    const base = { ...createDefaultConnectAppConfig(), ...rest };
    const merged = normalizeConnectAppConfig(base);
    const normalizedHeroChanged =
      merged.heroMode !== base.heroMode ||
      merged.heroImageUrl !== base.heroImageUrl;
    const sanitized = sanitizeConnectQuickActions(merged.quickActions);
    const quickActionsChanged =
      JSON.stringify(sanitized) !== JSON.stringify(merged.quickActions);
    if (quickActionsChanged) {
      merged.quickActions = sanitized;
    }
    if (quickActionsChanged || normalizedHeroChanged) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event(CONNECT_APP_CHANGED_EVENT));
      } catch {
        /* ignore */
      }
    }
    return merged;
  } catch {
    return createDefaultConnectAppConfig();
  }
}

export function saveConnectAppConfig(config: ConnectAppConfig): void {
  if (!isBrowser()) return;
  const sanitized: ConnectAppConfig = normalizeConnectAppConfig({
    ...config,
    quickActions: sanitizeConnectQuickActions(config.quickActions),
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new Event(CONNECT_APP_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function updateConnectAppConfig(
  patch: Partial<ConnectAppConfig>,
): ConnectAppConfig {
  const current = loadConnectAppConfig();
  const next = { ...current, ...patch };
  saveConnectAppConfig(next);
  return normalizeConnectAppConfig({
    ...next,
    quickActions: sanitizeConnectQuickActions(next.quickActions),
  });
}
