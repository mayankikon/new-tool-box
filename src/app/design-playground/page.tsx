"use client";

import * as React from "react";

import {
  getPlaygroundComponentNavItems,
  getPlaygroundPatternNavItems,
  getScrollTargetForNavSlug,
  getShowcaseKeyForNavSlug,
} from "./design-playground-registry";
import { DesignPlaygroundShell } from "./components/design-playground-shell";
import { PlaygroundNav } from "./components/playground-nav";
import { PlaygroundQueuedStub } from "./components/playground-queued-stub";
import { TabsShowcase } from "./showcases/tabs-showcase";
import { TableShowcase } from "./showcases/table-showcase";
import { ToggleSwitchShowcase } from "./showcases/toggle-switch-showcase";
import { SliderShowcase } from "./showcases/slider-showcase";
import { PageLayoutChromeShowcase } from "./showcases/page-layout-chrome-showcase";
import { FluidShellPilotShowcase } from "./showcases/fluid-shell-pilot-showcase";

export default function DesignPlaygroundPage() {
  const [activeSlug, setActiveSlug] = React.useState("tabs");
  const [pendingScrollId, setPendingScrollId] = React.useState<string | undefined>(undefined);

  const handleSelect = React.useCallback((slug: string) => {
    setActiveSlug(slug);
    setPendingScrollId(getScrollTargetForNavSlug(slug));
  }, []);

  React.useEffect(() => {
    if (!pendingScrollId) return;
    const id = pendingScrollId;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setPendingScrollId(undefined);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pendingScrollId, activeSlug]);

  const showcaseKey = getShowcaseKeyForNavSlug(activeSlug);
  const componentItems = React.useMemo(() => getPlaygroundComponentNavItems(), []);
  const patternItems = React.useMemo(() => getPlaygroundPatternNavItems(), []);

  const activeComponentLabel =
    componentItems.find((c) => c.slug === activeSlug)?.label ??
    patternItems.find((p) => p.slug === activeSlug)?.label ??
    activeSlug;

  return (
    <DesignPlaygroundShell
      contentClassName={
        activeSlug === "page-layout-chrome" ||
        activeSlug === "fluid-shell-pilot" ||
        activeSlug === "table"
          ? "w-full max-w-[min(1400px,calc(100vw-12rem))]"
          : undefined
      }
      nav={
        <PlaygroundNav
          componentItems={componentItems}
          patternItems={patternItems}
          activeSlug={activeSlug}
          onSelect={handleSelect}
        />
      }
    >
      {showcaseKey === "tabs" ? <TabsShowcase /> : null}
      {showcaseKey === "table" ? <TableShowcase /> : null}
      {showcaseKey === "toggle-switch" ? <ToggleSwitchShowcase /> : null}
      {showcaseKey === "slider" ? <SliderShowcase /> : null}
      {showcaseKey === "page-layout-chrome" ? <PageLayoutChromeShowcase /> : null}
      {showcaseKey === "fluid-shell-pilot" ? <FluidShellPilotShowcase /> : null}
      {showcaseKey === null ? (
        <PlaygroundQueuedStub label={activeComponentLabel} slug={activeSlug} />
      ) : null}

      <footer className="border-t border-border pt-8 text-xs text-muted-foreground">
        <p>
          Nav slugs match <code className="text-[11px]">src/app/design-system/design-system-nav-config.ts</code>.
          Matrix &amp; extractables: <code className="text-[11px]">docs/design-system-retro-audit.md</code>.
        </p>
      </footer>
    </DesignPlaygroundShell>
  );
}
