import { describe, expect, it } from "vitest";

import {
  createDefaultConnectAppConfig,
  normalizeConnectAppConfig,
  sanitizeConnectQuickActions,
} from "./connect-app-types";

describe("sanitizeConnectQuickActions", () => {
  it("removes schedule kind and Book Service label", () => {
    const out = sanitizeConnectQuickActions([
      {
        id: "a",
        icon: "calendar",
        label: "Book Service",
        kind: "schedule",
      },
      {
        id: "b",
        icon: "phone",
        label: "Call",
        kind: "call",
      },
      {
        id: "c",
        icon: "calendar",
        label: "Book Service",
        kind: "call",
      },
    ]);
    expect(out).toEqual([
      {
        id: "b",
        icon: "phone",
        label: "Call",
        kind: "call",
      },
    ]);
  });
});

describe("normalizeConnectAppConfig", () => {
  it("maps legacy hero carousel to single image using first carousel URL", () => {
    const base = createDefaultConnectAppConfig();
    const out = normalizeConnectAppConfig({
      ...base,
      heroMode: "carousel",
      heroImageUrl: undefined,
      carouselImageUrls: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    });
    expect(out.heroMode).toBe("image");
    expect(out.heroImageUrl).toBe("https://example.com/a.jpg");
    expect(
      "carouselImageUrls" in out && (out as { carouselImageUrls?: unknown }).carouselImageUrls,
    ).toBeFalsy();
  });

  it("preserves explicit hero image when legacy carousel mode had URLs", () => {
    const out = normalizeConnectAppConfig({
      ...createDefaultConnectAppConfig(),
      heroMode: "carousel",
      heroImageUrl: "https://example.com/hero.jpg",
      carouselImageUrls: ["https://example.com/other.jpg"],
    });
    expect(out.heroImageUrl).toBe("https://example.com/hero.jpg");
    expect(out.heroMode).toBe("image");
  });
});
