"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sidebar } from "@/components/ui/sidebar";
import { TopBar } from "@/components/app/top-bar";
import {
  colorTokenGroups,
  radiusTokens,
  spacingTokens,
  strokeTokens,
  fontFamilyTokens,
  fontSizeTokens,
  fontWeightTokens,
  lineHeightTokens,
  letterSpacingTokens,
  themeTokenGroups,
} from "@/lib/design-tokens";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              ← Home
            </Link>
            <h1 className="text-xl font-bold tracking-tight">
              Design System
            </h1>
            <span className="w-16" aria-hidden />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 space-y-16">
        {/* Theme tokens (Themes.json) */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Theme tokens
            </h2>
            <p className="mt-1 text-muted-foreground">
              Semantic colors from <code className="rounded bg-muted px-1.5 py-0.5 text-sm">Themes.json</code> (Toolbox-Light / Toolbox-Dark). Drive <code className="rounded bg-muted px-1.5 py-0.5 text-sm">--background</code>, <code className="rounded bg-muted px-1.5 py-0.5 text-sm">--primary</code>, etc.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {themeTokenGroups.map((group) => (
              <div
                key={group.name}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {group.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.tokens.map((token) => (
                    <div
                      key={token.name}
                      className="flex flex-col items-center gap-1"
                    >
                      {token.type === "bg" ? (
                        <div
                          className="h-10 w-10 rounded-lg border border-border"
                          style={{ backgroundColor: token.cssVar }}
                          title={token.cssVar}
                        />
                      ) : (
                        <span
                          className="text-xs font-medium"
                          style={{ color: token.cssVar }}
                        >
                          Aa
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground max-w-[100px] truncate text-center">
                        {token.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Foundation tokens */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Foundation tokens
            </h2>
            <p className="mt-1 text-muted-foreground">
              Semantic colors (wired to theme), radius, spacing, and stroke from Figma. Used via <code className="rounded bg-muted px-1.5 py-0.5 text-sm">globals.css</code> and layout/theme primitives.
            </p>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Semantic colors
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                These map to theme tokens (Themes.json) and power shadcn components.
              </p>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {colorTokenGroups.map((group) => (
                  <div
                    key={group.name}
                    className="rounded-xl border border-border bg-card p-4 shadow-sm"
                  >
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      {group.name}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {group.tokens.map((token) => (
                        <div
                          key={token.name}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className={`h-10 w-10 rounded-lg border border-border ${token.tailwindClass}`}
                            title={token.cssVar}
                          />
                          <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                            {token.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Radius
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                From <code className="rounded bg-muted px-1 py-0.5 text-xs">Radius.json</code> (layout-primitives.css).
              </p>
              <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-card p-6">
                {radiusTokens.map((token) => (
                  <div
                    key={token.name}
                    className="flex flex-col items-center gap-2"
                  >
                    <div
                      className={`h-14 w-14 bg-primary ${token.tailwindClass}`}
                      title={token.cssVar}
                    />
                    <span className="text-xs text-muted-foreground">
                      {token.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Spacing */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Spacing
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                From <code className="rounded bg-muted px-1 py-0.5 text-xs">Spacing.json</code>. Figma scale (px); use <code className="rounded bg-muted px-1 py-0.5 text-xs">var(--spacing-*)</code> when you need these values. Tailwind utilities (<code className="rounded bg-muted px-1 py-0.5 text-xs">p-4</code>, <code className="rounded bg-muted px-1 py-0.5 text-xs">gap-2</code>) use Tailwind’s default scale so components keep correct sizing.
              </p>
              <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-6">
                {spacingTokens.map((size) => (
                  <div
                    key={size}
                    className="flex flex-col items-center gap-2 min-w-[2.5rem]"
                  >
                    <div
                      className="rounded-sm bg-primary opacity-80 shrink-0"
                      style={{
                        width: `var(--spacing-${size})`,
                        height: `var(--spacing-${size})`,
                        minHeight: size === "0" ? 0 : 2,
                        minWidth: size === "0" ? 0 : 2,
                      }}
                      title={`--spacing-${size}`}
                    />
                    <span className="text-xs text-muted-foreground">
                      {size}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stroke (border width) */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Stroke
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Border width from <code className="rounded bg-muted px-1 py-0.5 text-xs">Stroke.json</code>. Use <code className="rounded bg-muted px-1 py-0.5 text-xs">border</code>, <code className="rounded bg-muted px-1 py-0.5 text-xs">border-2</code>, etc.
              </p>
              <div className="space-y-3 rounded-xl border border-border bg-card p-6">
                {strokeTokens.map((token) => (
                  <div key={token.name} className="flex items-center gap-4">
                    <div
                      className="h-6 bg-foreground"
                      style={{ width: token.value, minWidth: token.value }}
                      title={token.cssVar}
                    />
                    <span className="text-sm text-muted-foreground">
                      {token.name} ({token.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Typography
            </h2>
            <p className="mt-1 text-muted-foreground">
              From <code className="rounded bg-muted px-1.5 py-0.5 text-sm">Font Family.json</code> and <code className="rounded bg-muted px-1.5 py-0.5 text-sm">Font Size.json</code> (typography-primitives.css).
            </p>
          </div>
          <div className="space-y-10">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Font families
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {fontFamilyTokens.map((token) => (
                  <div
                    key={token.name}
                    className={`rounded-xl border border-border bg-card p-4 ${token.className}`}
                  >
                    <p className="text-xs text-muted-foreground mb-2">{token.name}</p>
                    <p className="text-lg">The quick brown fox jumps over the lazy dog.</p>
                    <p className="mt-1 text-2xl">0123456789</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Font sizes
              </h3>
              <div className="space-y-3 rounded-xl border border-border bg-card p-6">
                {fontSizeTokens.map((size) => (
                  <div key={size} className="flex items-baseline gap-4">
                    <span className="w-12 shrink-0 text-xs text-muted-foreground">
                      {size}
                    </span>
                    <span
                      style={{ fontSize: `var(--text-${size})` }}
                    >
                      The quick brown fox
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Font weights
              </h3>
              <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-card p-6">
                {fontWeightTokens.map((weight) => (
                  <div key={weight} className="flex flex-col gap-1">
                    <span
                      className="text-lg"
                      style={{ fontWeight: `var(--font-weight-${weight})` }}
                    >
                      Ag
                    </span>
                    <span className="text-xs text-muted-foreground">{weight}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Line heights
              </h3>
              <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-card p-6">
                {lineHeightTokens.map((leading) => (
                  <div key={leading} className="flex flex-col gap-1 max-w-[140px]">
                    <span
                      className="text-base border-l-2 border-primary pl-2"
                      style={{ lineHeight: `var(--leading-${leading})` }}
                    >
                      Lorem ipsum dolor sit amet.
                    </span>
                    <span className="text-xs text-muted-foreground">leading-{leading}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">
                Letter spacing
              </h3>
              <div className="flex flex-wrap gap-8 rounded-xl border border-border bg-card p-6">
                {letterSpacingTokens.map((tracking) => (
                  <div key={tracking} className="flex flex-col gap-1">
                    <span
                      className="text-base"
                      style={{ letterSpacing: `var(--tracking-${tracking})` }}
                    >
                      Spacing
                    </span>
                    <span className="text-xs text-muted-foreground">tracking-{tracking}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Components
            </h2>
            <p className="mt-1 text-muted-foreground">
              shadcn/ui components in <code className="rounded bg-muted px-1.5 py-0.5 text-sm">src/components/ui</code>, plus app shell elements in <code className="rounded bg-muted px-1.5 py-0.5 text-sm">src/components/app</code>.
            </p>
          </div>

          <div className="space-y-12">
            {/* Page layout & chrome (shared across all pages) */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Page layout & chrome
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Elements present on every app page: <strong>TopBar</strong> (full-width header to the right of the sidebar) and the <strong>main content area</strong> (scrollable region with consistent horizontal padding). Use these to keep layout consistent across Campaigns, Campaign detail, Create campaign, and other views.
              </p>

              <h4 className="text-sm font-medium text-foreground mt-6 mb-2">
                TopBar
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">TopBar</code> accepts optional <code className="rounded bg-muted px-1 py-0.5 text-xs">title</code>, <code className="rounded bg-muted px-1 py-0.5 text-xs">subtitle</code>, and <code className="rounded bg-muted px-1 py-0.5 text-xs">right</code> (e.g. primary action). When viewing campaign details, the top bar is left empty; page title lives in the content area.
              </p>
              <div className="space-y-4 rounded-lg border border-border bg-background overflow-hidden">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 px-1">Empty (e.g. campaign details view)</p>
                  <TopBar />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 px-1">Title only</p>
                  <TopBar title="Campaigns" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 px-1">Title + subtitle</p>
                  <TopBar
                    title="Campaigns"
                    subtitle="Manage and monitor your marketing campaigns"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 px-1">Title + subtitle + right action</p>
                  <TopBar
                    title="Campaigns"
                    subtitle="Manage and monitor your marketing campaigns"
                    right={<Button size="sm">Create Campaign</Button>}
                  />
                </div>
              </div>

              <h4 className="text-sm font-medium text-foreground mt-8 mb-2">
                Main content area
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Page content sits in a scrollable container with <code className="rounded bg-muted px-1 py-0.5 text-xs">px-8</code> (32px) horizontal padding and <code className="rounded bg-muted px-1 py-0.5 text-xs">py-6</code> vertical padding. Use <code className="rounded bg-muted px-1 py-0.5 text-xs">flex flex-1 flex-col gap-8 overflow-y-auto px-8 py-6</code> for the main content wrapper.
              </p>
              <div className="rounded-lg border border-border bg-background overflow-hidden" style={{ height: 120 }}>
                <div className="flex h-full flex-col gap-4 overflow-y-auto px-8 py-6">
                  <div className="h-6 w-48 rounded bg-muted/60" />
                  <div className="h-4 w-full max-w-md rounded bg-muted/40" />
                  <div className="h-4 w-3/4 rounded bg-muted/40" />
                </div>
              </div>
            </div>

            {/* Button */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Button
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Variants and sizes.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <Button size="xs">Extra small</Button>
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            {/* Badge */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Badge
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Status and label variants.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="ghost">Ghost</Badge>
                <Badge variant="link">Link</Badge>
              </div>
            </div>

            {/* Input */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Input
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Text input with placeholder.
              </p>
              <div className="max-w-sm space-y-2">
                <Input type="text" placeholder="Enter something…" />
                <Input type="email" placeholder="you@example.com" disabled />
              </div>
            </div>

            {/* Card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Card
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Card with header, content, and footer.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Card title</CardTitle>
                    <CardDescription>
                      Optional description for the card content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Main content goes here. Cards can hold any layout.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="sm">Action</Button>
                  </CardFooter>
                </Card>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle>Small card</CardTitle>
                    <CardDescription>Compact size variant.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Same structure, smaller padding and gaps.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button size="xs">Action</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Sidebar */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Sidebar (side navigation)
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                App sidebar using design tokens: <code className="rounded bg-muted px-1 py-0.5 text-xs">--sidebar</code>, <code className="rounded bg-muted px-1 py-0.5 text-xs">--sidebar-foreground</code>, <code className="rounded bg-muted px-1 py-0.5 text-xs">--sidebar-accent</code>, <code className="rounded bg-muted px-1 py-0.5 text-xs">--sidebar-border</code>, spacing and radius from layout primitives.
              </p>
              <div className="flex overflow-hidden rounded-lg border border-border bg-background" style={{ height: 480 }}>
                <Sidebar />
                <div className="flex flex-1 items-center justify-center bg-muted/30 text-muted-foreground text-sm">
                  Main content area
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
