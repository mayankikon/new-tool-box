"use client";

import type { LucideIcon } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BatteryWarning,
  CalendarClock,
  ClipboardList,
  Clock3,
  Cpu,
  FileClock,
  LocateFixed,
  MapPin,
  Search,
  Timer,
  Undo2,
  UserRoundCheck,
  WifiOff,
  Wrench,
} from "lucide-react";

import { TitleBar } from "@/components/app/title-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, InputContainer, InputIcon } from "@/components/ui/input";
import {
  inventoryReportCatalog,
  type InventoryReportDefinition,
  type InventoryReportId,
} from "@/lib/inventory/report-catalog";
import { cn } from "@/lib/utils";

import { InventoryReportDetail } from "./inventory-report-detail";

const reportIconMap = {
  "low-battery": BatteryWarning,
  "non-reporting": WifiOff,
  "off-lot": Activity,
  "in-lot": MapPin,
  "installation-exception": ClipboardList,
  "installed-devices": Cpu,
  registrations: UserRoundCheck,
  "non-registration": FileClock,
  "uninstalled-history": Wrench,
  "pending-registrations": Clock3,
  "pending-installations": CalendarClock,
  "data-exceptions": AlertTriangle,
  "location-history": LocateFixed,
  unwinds: Undo2,
} as const satisfies Record<InventoryReportId, LucideIcon>;

function ReportDefinitionCard({
  report,
  onSelect,
}: {
  report: InventoryReportDefinition;
  onSelect: (id: InventoryReportId) => void;
}) {
  const Icon = reportIconMap[report.id];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onSelect(report.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(report.id);
        }
      }}
      className={cn(
        "gap-1 border border-border bg-sidebar text-sidebar-foreground",
        "cursor-pointer select-none",
        "transition-[border-color,box-shadow,transform,background-color] duration-200 ease-out",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
        "hover:border-sidebar-border hover:bg-[var(--sidebar-nav-item-hover-bg)] hover:shadow-md hover:-translate-y-px",
        "active:translate-y-0 active:scale-[0.99] active:shadow-sm active:bg-sidebar-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <CardHeader className="gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-sm border border-border/70 bg-background/80 text-foreground",
            "transition-[border-color,background-color,transform] duration-200 ease-out",
            "motion-reduce:transition-none motion-reduce:group-hover/card:scale-100",
            "group-hover/card:border-border group-hover/card:bg-background",
            "group-active/card:scale-[0.97]",
          )}
        >
          <Icon className="size-[18px]" aria-hidden />
        </div>
        <CardTitle className="text-base text-sidebar-foreground">
          {report.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-sm leading-6 text-sidebar-foreground/80">
        {report.description}
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const [selectedReportId, setSelectedReportId] =
    useState<InventoryReportId | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredReports = useMemo<InventoryReportDefinition[]>(() => {
    if (!normalizedQuery) {
      return inventoryReportCatalog;
    }

    return inventoryReportCatalog.filter((report) =>
      [report.title, report.description, report.summary].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery]);

  if (selectedReportId != null) {
    return (
      <InventoryReportDetail
        key={selectedReportId}
        reportId={selectedReportId}
        onBack={() => setSelectedReportId(null)}
      />
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 pt-6">
        <TitleBar
          title="Reports"
          right={
            <>
              <Button variant="secondary" size="header">
                Manage Scheduled Reports
              </Button>
              <Button size="header" leadingIcon={<Timer />}>
                Schedule Report
              </Button>
            </>
          }
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-8 pb-16 pt-6">
        <div className="flex w-full max-w-none flex-col gap-6">
          <div>
            <InputContainer className="w-full max-w-sm" size="lg">
              <InputIcon>
                <Search className="size-4" aria-hidden />
              </InputIcon>
              <Input
                aria-label="Search reports"
                placeholder="Search reports"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                size="lg"
                standalone={false}
              />
            </InputContainer>
          </div>

          {filteredReports.length > 0 ? (
            <section className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredReports.map((report) => (
                <ReportDefinitionCard
                  key={report.id}
                  report={report}
                  onSelect={setSelectedReportId}
                />
              ))}
            </section>
          ) : (
            <Card className="border border-dashed border-border bg-sidebar text-sidebar-foreground">
              <CardContent className="flex min-h-[180px] flex-col items-center justify-center gap-2 p-6 text-center">
                <p className="text-base font-medium text-sidebar-foreground">
                  No reports match that search.
                </p>
                <p className="max-w-md text-sm leading-6 text-sidebar-foreground/80">
                  Try searching by report title, workflow, or summary term such as
                  registration, battery, or installation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
