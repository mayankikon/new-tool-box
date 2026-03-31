"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { designSystemNavConfig, type NavItem } from "../design-system-nav-config";

const SECTION_HEADINGS = {
  foundations: "Foundations",
  components: "Components",
  patterns: "Patterns",
} as const;

type SectionKey = keyof typeof SECTION_HEADINGS;

type NavEntry = NavItem & { section: SectionKey };

function buildAllNavEntries(): NavEntry[] {
  const { foundations, components, patterns } = designSystemNavConfig;
  return [
    ...foundations.map((item) => ({ ...item, section: "foundations" as const })),
    ...components.map((item) => ({ ...item, section: "components" as const })),
    ...patterns.map((item) => ({ ...item, section: "patterns" as const })),
  ];
}

const ALL_NAV_ENTRIES = buildAllNavEntries();

function filterNavEntries(query: string): NavEntry[] {
  const normalized = query.trim().toLowerCase();
  return ALL_NAV_ENTRIES.filter((item) => {
    const labelMatch = item.label.toLowerCase().includes(normalized);
    const slugMatch = item.slug.toLowerCase().includes(normalized);
    const slugSpaced = item.slug.replace(/-/g, " ").toLowerCase().includes(normalized);
    const sectionMatch = SECTION_HEADINGS[item.section].toLowerCase().includes(normalized);
    return labelMatch || slugMatch || slugSpaced || sectionMatch;
  });
}

function scrollToSection(slug: string, behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById(slug);
  if (el) {
    el.scrollIntoView({ behavior });
  }
}

function getCurrentHash() {
  if (typeof window === "undefined") return "";
  return window.location.hash.slice(1);
}

export function DesignSystemNav() {
  const [activeSlug, setActiveSlug] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const hash = getCurrentHash();
    if (!hash) return;
    setActiveSlug(hash);
    // Defer until after paint; use instant scroll on load so a long page does not smooth-scroll
    // and re-layout repeatedly (reduces flicker with sticky chrome + heavy sections).
    const id = requestAnimationFrame(() => {
      scrollToSection(hash, "auto");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handleHashChange = () => setActiveSlug(getCurrentHash());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    window.history.replaceState(null, "", `#${slug}`);
    setActiveSlug(slug);
    scrollToSection(slug);
  };

  const { foundations, components, patterns } = designSystemNavConfig;

  const isSearching = searchQuery.trim().length > 0;
  const filteredEntries = useMemo(() => {
    if (!isSearching) {
      return [];
    }
    return filterNavEntries(searchQuery);
  }, [searchQuery, isSearching]);

  const groupedFiltered = useMemo(() => {
    if (!isSearching) {
      return null;
    }
    const bySection: Record<SectionKey, NavEntry[]> = {
      foundations: [],
      components: [],
      patterns: [],
    };
    for (const entry of filteredEntries) {
      bySection[entry.section].push(entry);
    }
    return bySection;
  }, [filteredEntries, isSearching]);

  return (
    <nav
      className="ds-doc-font flex flex-col border-r border-border bg-muted/30 min-w-[260px] shrink-0"
      aria-label="Design system sections"
    >
      <div className="sticky top-[53px] max-h-[calc(100vh-53px)] overflow-y-auto py-6 pl-6 pr-3">
        <div
          className="mb-4 pr-1"
          role="search"
          aria-label="Search design system sections"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchQuery("");
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="Search foundations, components…"
              className="h-9 pl-9 text-sm"
              aria-controls="ds-nav-sections"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div id="ds-nav-sections" className="space-y-6">
          {isSearching ? (
            filteredEntries.length === 0 ? (
              <p className="px-3 text-sm text-muted-foreground">
                No sections match &ldquo;{searchQuery.trim()}&rdquo;.
              </p>
            ) : (
              (["foundations", "components", "patterns"] as const).map((section) => {
                const items = groupedFiltered?.[section] ?? [];
                if (items.length === 0) return null;
                return (
                  <div key={section}>
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {SECTION_HEADINGS[section]}
                    </h3>
                    <ul className="space-y-0.5">
                      {items.map(({ slug, label }) => (
                        <li key={slug}>
                          <a
                            href={`#${slug}`}
                            onClick={(e) => handleNavClick(e, slug)}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm transition-colors",
                              activeSlug === slug
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                            )}
                          >
                            {label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )
          ) : (
            <>
              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Foundations
                </h3>
                <ul className="space-y-0.5">
                  {foundations.map(({ slug, label }) => (
                    <li key={slug}>
                      <a
                        href={`#${slug}`}
                        onClick={(e) => handleNavClick(e, slug)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors",
                          activeSlug === slug
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Components
                </h3>
                <ul className="space-y-0.5">
                  {components.map(({ slug, label }) => (
                    <li key={slug}>
                      <a
                        href={`#${slug}`}
                        onClick={(e) => handleNavClick(e, slug)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors",
                          activeSlug === slug
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Patterns
                </h3>
                <ul className="space-y-0.5">
                  {patterns.map(({ slug, label }) => (
                    <li key={slug}>
                      <a
                        href={`#${slug}`}
                        onClick={(e) => handleNavClick(e, slug)}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors",
                          activeSlug === slug
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                        )}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
