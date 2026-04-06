"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";

import { appLineFieldPattern } from "@/components/chrome/app-line-field-dial-preset";
import { LineFieldPatternLayers } from "@/components/chrome/line-field-pattern-layers";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { designSystemNavConfig, type NavItem } from "../design-system-nav-config";
import { buildDesignSystemItemHref, type DesignSystemGroup } from "../design-system-routes";

const SECTION_HEADINGS: Record<DesignSystemGroup, string> = {
  foundations: "Foundations",
  components: "Components",
  patterns: "Patterns",
};

type NavEntry = NavItem & { group: DesignSystemGroup };

function buildAllNavEntries(): NavEntry[] {
  const { foundations, components, patterns } = designSystemNavConfig;
  return [
    ...foundations.map((item) => ({ ...item, group: "foundations" as const })),
    ...components.map((item) => ({ ...item, group: "components" as const })),
    ...patterns.map((item) => ({ ...item, group: "patterns" as const })),
  ];
}

const ALL_NAV_ENTRIES = buildAllNavEntries();
const NAV_PATTERN_INTENSITY = 0.8;
const NAV_LINE_FIELD_PATTERN = {
  ...appLineFieldPattern,
  lineField: {
    ...appLineFieldPattern.lineField,
    topOpacity: appLineFieldPattern.lineField.topOpacity * NAV_PATTERN_INTENSITY,
    bottomOpacity:
      appLineFieldPattern.lineField.bottomOpacity * NAV_PATTERN_INTENSITY,
  },
  surface: {
    ...appLineFieldPattern.surface,
    glowOpacity: appLineFieldPattern.surface.glowOpacity * NAV_PATTERN_INTENSITY,
    noiseOpacity:
      appLineFieldPattern.surface.noiseOpacity * NAV_PATTERN_INTENSITY,
  },
};

function filterNavEntries(query: string): NavEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return ALL_NAV_ENTRIES;

  return ALL_NAV_ENTRIES.filter((item) => {
    const labelMatch = item.label.toLowerCase().includes(normalized);
    const slugMatch = item.slug.toLowerCase().includes(normalized);
    const slugSpaced = item.slug.replace(/-/g, " ").toLowerCase().includes(normalized);
    const sectionMatch = SECTION_HEADINGS[item.group].toLowerCase().includes(normalized);
    return labelMatch || slugMatch || slugSpaced || sectionMatch;
  });
}

function NavRow({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-[var(--spacing-6)] rounded-[var(--radius-sm)] p-[var(--spacing-8)] h-9 transition-colors",
        isActive
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "bg-transparent text-[color:var(--theme-text-secondary)] hover:bg-[color:var(--sidebar-nav-item-hover-bg)] hover:text-foreground"
      )}
    >
      <span
        className="min-w-0 truncate font-medium"
        style={{
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-5)",
        }}
      >
        {label}
      </span>
    </Link>
  );
}

export function DesignSystemNav() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEntries = useMemo(() => filterNavEntries(searchQuery), [searchQuery]);

  const entriesByGroup = useMemo(() => {
    const grouped: Record<DesignSystemGroup, NavEntry[]> = {
      foundations: [],
      components: [],
      patterns: [],
    };

    for (const entry of filteredEntries) {
      grouped[entry.group].push(entry);
    }

    return grouped;
  }, [filteredEntries]);

  return (
    <nav
      className="relative isolate flex min-h-screen w-[280px] shrink-0 flex-col overflow-hidden border-r border-border bg-sidebar"
      aria-label="Design system navigation"
    >
      <LineFieldPatternLayers pattern={NAV_LINE_FIELD_PATTERN} />

      <div className="relative z-10 border-b border-border px-[var(--spacing-16)] pb-[var(--spacing-12)] pt-[var(--spacing-24)]">
        <Link href="/design-system" className="group flex items-center gap-3 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <img
            src="/media/logos/logo.png"
            alt="Shift Design System logo"
            className="size-9 shrink-0 object-contain"
          />
          <h2
            className="font-semibold"
            style={{
              fontSize: "16px",
              lineHeight: "var(--leading-5)",
              color: "var(--theme-text-primary)",
            }}
          >
            Shift Design System
          </h2>
        </Link>
        <div className="mt-4" role="search" aria-label="Search design system sections">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setSearchQuery("");
                  (event.target as HTMLInputElement).blur();
                }
              }}
              placeholder="Search"
              className="h-9 pl-9 pr-9 text-sm [&::-webkit-search-cancel-button]:appearance-none"
              autoComplete="off"
              spellCheck={false}
            />
            {searchQuery.length > 0 ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto pb-4 pt-2">
        {(["foundations", "components", "patterns"] as const).map((group) => {
          const items = entriesByGroup[group];
          if (items.length === 0) return null;

          return (
            <div
              key={group}
              className="flex w-full flex-col gap-[2px]"
              style={{
                paddingLeft: "var(--spacing-16)",
                paddingRight: "var(--spacing-16)",
                paddingTop: "var(--spacing-8)",
                paddingBottom: "var(--spacing-8)",
              }}
            >
              <h3
                className="px-[var(--spacing-8)] py-[var(--spacing-4)] font-medium"
                style={{
                  fontSize: "var(--text-xs)",
                  lineHeight: "var(--leading-5)",
                  color: "var(--theme-text-secondary)",
                }}
              >
                {SECTION_HEADINGS[group]}
              </h3>

              <div className="flex flex-col gap-[2px]">
                {items.map((item) => {
                  const href = buildDesignSystemItemHref(group, item.slug);
                  return (
                    <NavRow
                      key={`${group}:${item.slug}`}
                      href={href}
                      label={item.label}
                      isActive={pathname === href}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredEntries.length === 0 ? (
          <p className="px-[var(--spacing-24)] py-2 text-sm text-muted-foreground">
            No sections match “{searchQuery.trim()}”.
          </p>
        ) : null}
      </div>
    </nav>
  );
}
