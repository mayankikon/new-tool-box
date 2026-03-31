"use client";

import type { ReactNode } from "react";
import { useDialKit } from "dialkit";
import {
  Blocks,
  CircleGauge,
  Cpu,
  Gauge,
  RadioTower,
  SlidersHorizontal,
} from "lucide-react";

import {
  APP_LINE_FIELD_DIAL_LABEL,
  appLineFieldDialPreset,
} from "@/components/chrome/app-line-field-dial-preset";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ConfigurationsPage({
  className,
  topBar,
}: {
  className?: string;
  topBar: ReactNode;
}) {
  const pattern = useDialKit(APP_LINE_FIELD_DIAL_LABEL, appLineFieldDialPreset);

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        className
      )}
    >
      <div className="shrink-0 pt-6">{topBar}</div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pb-8 pt-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
            <Card className="border-border/70 bg-card/75 backdrop-blur-sm">
              <CardHeader className="gap-3">
                <div className="flex items-center gap-2 text-xs font-medium tracking-[0.24em] text-muted-foreground uppercase">
                  <SlidersHorizontal className="size-3.5" />
                  Industrial Surface Study
                </div>
                <CardTitle className="max-w-2xl font-sans text-2xl leading-tight">
                  Configuration bays with a calibrated line field running edge to edge.
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm text-muted-foreground">
                <p className="max-w-2xl leading-6">
                  The page is using a subtle horizontal pattern spaced at{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {pattern.lineField.spacing}px
                  </span>{" "}
                  with the field tapering from{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {Math.round(pattern.lineField.topOpacity * 100)}%
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {Math.round(pattern.lineField.bottomOpacity * 100)}%
                  </span>{" "}
                  strength.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: "Line Spacing",
                      value: `${pattern.lineField.spacing}px`,
                      icon: Blocks,
                    },
                    {
                      label: "Top Density",
                      value: `${Math.round(pattern.lineField.topOpacity * 100)}%`,
                      icon: Gauge,
                    },
                    {
                      label: "Bottom Density",
                      value: `${Math.round(pattern.lineField.bottomOpacity * 100)}%`,
                      icon: CircleGauge,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-md border border-border/60 bg-background/70 px-4 py-3 backdrop-blur-sm"
                      >
                        <div className="mb-2 flex items-center gap-2 text-xs tracking-[0.18em] text-muted-foreground uppercase">
                          <Icon className="size-3.5" />
                          {item.label}
                        </div>
                        <div className="font-mono text-lg text-foreground tabular-nums">
                          {item.value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/78 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Tuning Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="rounded-md border border-border/60 bg-background/70 p-4">
                  Open the Dialkit panel → <strong>App Line Field</strong> to adjust
                  spacing, stroke, tint, density, and lift for the whole main column.
                </div>
                <div className="rounded-md border border-border/60 bg-background/70 p-4">
                  Keeping stroke at <span className="font-mono text-foreground">1px</span> and
                  opacity under <span className="font-mono text-foreground">20%</span> preserves
                  the industrial feel without fighting the content.
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            {[
              {
                title: "Signal Routing",
                icon: RadioTower,
                body: "Assign entry, exit, and dwell triggers across each rooftop and keep propagation rules visible.",
              },
              {
                title: "Device Calibration",
                icon: Cpu,
                body: "Stage tracker behavior, battery thresholds, and failover timing for installs moving through service.",
              },
              {
                title: "Operator Profiles",
                icon: SlidersHorizontal,
                body: "Tune default alert severity, response channels, and escalation logic per team role.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="border-border/70 bg-card/72 backdrop-blur-sm"
                >
                  <CardHeader className="gap-3">
                    <div className="flex size-10 items-center justify-center rounded-sm border border-border/70 bg-background/80 text-foreground">
                      <Icon className="size-[18px]" />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-6 text-muted-foreground">
                    {item.body}
                  </CardContent>
                </Card>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}
