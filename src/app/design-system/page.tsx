import Link from "next/link";
import { ArrowRight, LayoutDashboard, Package, Palette } from "lucide-react";

import { DesignSystemNav } from "./components/DesignSystemNav";
import { DesignSystemTemplate } from "./components/DesignSystemTemplate";
import { buildDesignSystemItemHref } from "./design-system-routes";

const HOME_CARDS = [
  {
    title: "Foundations",
    description: "Colors, typography, spacing and layout, and elevation foundations.",
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

        <div className="flex max-w-3xl flex-col gap-4">
          {HOME_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-[8px] border border-border/70 bg-muted/10 p-6 shadow-sm transition-all hover:-translate-y-px hover:border-sidebar-border/70 hover:bg-muted/20 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-md border border-emerald-200/80 bg-emerald-100/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <card.icon className="size-5" aria-hidden />
                  </div>
                  <h2 className="text-xl font-medium tracking-tight text-foreground">{card.title}</h2>
                </div>
                <ArrowRight className="mt-1 size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" aria-hidden />
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </DesignSystemTemplate>
  );
}
