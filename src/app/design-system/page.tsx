import Link from "next/link";
import { ArrowRight, Download, LayoutDashboard, Package, Palette, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import { DesignSystemNav } from "./components/DesignSystemNav";
import { DesignSystemTemplate } from "./components/DesignSystemTemplate";
import { buildDesignSystemItemHref } from "./design-system-routes";

const BRAND_GUIDELINES_ZIP_HREF = "/design-system/brand-guidelines.zip";
const DESIGN_MD_HREF = "/design-system/design.md";

const HOME_CARDS = [
  {
    title: "Foundations",
    description: "Colors, typography, spacing and layout, elevation, maps, and vehicle imagery.",
    href: buildDesignSystemItemHref("foundations", "colors"),
    icon: Palette,
  },
  {
    title: "Components",
    description: "Reusable UI building blocks for interaction, data entry, and navigation.",
    href: buildDesignSystemItemHref("components", "button"),
    icon: Package,
  },
  {
    title: "Patterns",
    description: "Composed interaction and layout patterns for complete product experiences.",
    href: buildDesignSystemItemHref("patterns", "page-layout-chrome"),
    icon: LayoutDashboard,
  },
] as const;

export default function DesignSystemHomePage() {
  return (
    <DesignSystemTemplate left={<DesignSystemNav />}>
      <section className="space-y-8 pt-20">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Shift Design System</h1>
          <p className="text-lg text-muted-foreground">
            Shift Design System: a series of assets and guidelines for building consistent user experiences across Ikon Technologies.
          </p>
        </div>

        <div className="flex max-w-5xl flex-col gap-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {HOME_CARDS.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="group flex h-full flex-col rounded-[8px] border border-border/70 bg-muted/10 p-6 shadow-sm transition-all hover:-translate-y-px hover:border-sidebar-border/70 hover:bg-muted/20 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-emerald-200/80 bg-emerald-100/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <card.icon className="size-5" aria-hidden />
                    </div>
                    <h2 className="text-lg font-medium tracking-tight text-foreground sm:text-xl">{card.title}</h2>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
                </div>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">{card.description}</p>
              </Link>
            ))}
          </div>

          <Link
            href={buildDesignSystemItemHref("patterns", "user-personas")}
            className="group flex h-full flex-col rounded-[8px] border border-border/70 bg-muted/10 p-6 shadow-sm transition-all hover:-translate-y-px hover:border-sidebar-border/70 hover:bg-muted/20 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md border border-emerald-200/80 bg-emerald-100/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                  <Users className="size-5" aria-hidden />
                </div>
                <h2 className="text-lg font-medium tracking-tight text-foreground sm:text-xl">User Personas</h2>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
            </div>
            <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
              Retention personas for smart marketing — Loyalist, At-Risk, Actively Defecting, and Relocated — with signals, goals, and triggers.
            </p>
          </Link>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[8px] border border-border/70 bg-muted/10 p-6 shadow-sm">
              <h2 className="text-xl font-medium tracking-tight text-foreground">Download brand guidelines</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Brand sample logos, app icons, and Ikon marks for use in decks, specs, and partner handoffs.
              </p>
              <a
                href={BRAND_GUIDELINES_ZIP_HREF}
                download="shift-brand-guidelines.zip"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "mt-5 inline-flex w-fit items-center gap-1.5",
                )}
              >
                <Download className="size-4 shrink-0" aria-hidden />
                Download
              </a>
            </div>
            <div className="rounded-[8px] border border-border/70 bg-muted/10 p-6 shadow-sm">
              <h2 className="text-xl font-medium tracking-tight text-foreground">Download design.md</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Offline summary of the Shift Design System structure and pointers to repository documentation.
              </p>
              <a
                href={DESIGN_MD_HREF}
                download="design.md"
                className={cn(
                  buttonVariants({ variant: "default", size: "default" }),
                  "mt-5 inline-flex w-fit items-center gap-1.5",
                )}
              >
                <Download className="size-4 shrink-0" aria-hidden />
                Download
              </a>
            </div>
          </div>
        </div>
      </section>
    </DesignSystemTemplate>
  );
}
