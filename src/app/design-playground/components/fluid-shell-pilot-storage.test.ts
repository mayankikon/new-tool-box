import { describe, expect, it } from "vitest";

import {
  FLUID_SHELL_SIDEBAR_COLLAPSED_KEY,
  readFluidShellSidebarCollapsed,
  writeFluidShellSidebarCollapsed,
} from "./fluid-shell-pilot-storage";

function createMemoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem(key: string) {
      return map.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    get value() {
      return map.get(FLUID_SHELL_SIDEBAR_COLLAPSED_KEY) ?? null;
    },
  };
}

describe("fluid shell sidebar collapse storage", () => {
  it("falls back to expanded when nothing is stored", () => {
    const storage = createMemoryStorage();
    expect(readFluidShellSidebarCollapsed(storage)).toBe(false);
  });

  it("reads collapsed state from persisted value", () => {
    const storage = createMemoryStorage({
      [FLUID_SHELL_SIDEBAR_COLLAPSED_KEY]: "1",
    });
    expect(readFluidShellSidebarCollapsed(storage)).toBe(true);
  });

  it("writes collapsed and expanded states with stable values", () => {
    const storage = createMemoryStorage();
    writeFluidShellSidebarCollapsed(storage, true);
    expect(storage.value).toBe("1");
    writeFluidShellSidebarCollapsed(storage, false);
    expect(storage.value).toBe("0");
  });
});
