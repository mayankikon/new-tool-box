import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  readRecentVehicleSearches,
  rememberVehicleSearch,
} from "./recent-vehicle-search-storage";

describe("recent-vehicle-search-storage", () => {
  const data: Record<string, string> = {};

  beforeEach(() => {
    vi.unstubAllGlobals();
    Object.keys(data).forEach((key) => {
      delete data[key];
    });
    const storage: Storage = {
      getItem: (key: string) => data[key] ?? null,
      setItem: (key: string, value: string) => {
        data[key] = value;
      },
      removeItem: (key: string) => {
        delete data[key];
      },
      clear: () => {
        Object.keys(data).forEach((key) => {
          delete data[key];
        });
      },
      key: (index: number) => Object.keys(data)[index] ?? null,
      get length() {
        return Object.keys(data).length;
      },
    };
    vi.stubGlobal("localStorage", storage);
    vi.stubGlobal("window", globalThis);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores newest searches first", () => {
    rememberVehicleSearch("red truck");
    rememberVehicleSearch("1HGBH41JXMN109186");
    const list = readRecentVehicleSearches();
    expect(list[0]).toBe("1HGBH41JXMN109186");
    expect(list[1]).toBe("red truck");
  });

  it("dedupes case-insensitively and promotes the latest casing", () => {
    rememberVehicleSearch("RAV4");
    rememberVehicleSearch("rav4");
    expect(readRecentVehicleSearches()).toEqual(["rav4"]);
  });

  it("ignores whitespace-only queries", () => {
    rememberVehicleSearch("   ");
    expect(readRecentVehicleSearches()).toEqual([]);
  });
});
