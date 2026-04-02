"use client";

import Image from "next/image";
import { useTheme } from "@/components/theme/app-theme-provider";
import { useCallback, useState } from "react";
import {
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  Copy,
  Fuel,
  Gauge,
  MapPin,
  MessageSquareText,
  Send,
  Star,
  Sparkles,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashPreviewSurface } from "@/app/design-playground/components/dash-preview-canvas";
import { VehicleDetailDeckTabs } from "@/components/inventory/vehicle-detail-deck-tabs";
import { SendVehicleBrochureDialog } from "@/components/inventory/send-vehicle-brochure-dialog";
import {
  BatteryIcon,
  KeyPairedIcon,
  LocationIcon,
  type VehicleStatusIcons,
} from "@/components/ui/vehicle-list-item";
import type { InventoryVehicleRecord } from "@/lib/inventory/vehicle-list-data";
import { cn } from "@/lib/utils";

const CARFAX_LOGO_IMAGE =
  "https://www.figma.com/api/mcp/asset/25c012b7-0a23-407a-a697-2e9ee373339a";

const locationRows = [
  {
    label: "6824 Cerrillos Rd, Santa Fe, NM",
    caption: "Updated just now",
    icon: "location" as const,
  },
  {
    label: "General Manager's Office",
    caption: "Updated just now",
    icon: "key" as const,
  },
] as const;

const safetyRatings = [
  { label: "Overall Rating", value: 4 },
  { label: "Overall Front Rating", value: 5 },
  { label: "Overall Side Rating", value: 4 },
  { label: "Rollover Rating", value: 3 },
] as const;

const exteriorColors = [
  "Summit White",
  "Mosaic Black Metallic",
  "Radiant Red Tintcoat",
  "Sterling Gray Metallic",
  "Black",
  "White Sands",
  "Dark Ash Metallic",
  "Sebring Orange Tintcoat",
  "Hysteria Purple Metallic",
  "Glacier Blue Metallic",
] as const;

const interiorColors = [
  "Jet Black",
  "Black NuLuxe",
  "Obsidian Black",
  "Cool Gray",
  "Sandstone",
  "Dark Atmosphere",
  "Adrenaline Red",
  "Ash Gray",
  "Ebony",
  "Black / Red",
] as const;

interface InventoryVehicleDetailPanelProps {
  vehicle: InventoryVehicleRecord;
  statusIcons: VehicleStatusIcons;
  onBack: () => void;
  onShowSimilarVehicles?: () => void;
}

function getStockTypeTextClassName(
  stockType: InventoryVehicleRecord["stockType"],
): string {
  switch (stockType) {
    case "New":
      return "text-[var(--theme-text-success)]";
    case "Certified":
      return "text-[var(--theme-text-warning)]";
    case "Pre-Owned":
      return "text-[var(--theme-text-destructive)]";
  }
}

function VehicleInfoChip({
  label,
  copyValue,
  copiedValue,
  onCopy,
}: {
  label: string;
  copyValue: string;
  copiedValue?: string | null;
  onCopy: (value: string) => void;
}) {
  const isCopied = copiedValue === copyValue;

  return (
    <Badge
      variant="outline"
      className="h-8 cursor-default gap-1 rounded-sm border-sidebar-border bg-sidebar px-2 text-sidebar-foreground select-none"
    >
      <span className="tabular-nums">{label}</span>
      <button
        type="button"
        onClick={() => onCopy(copyValue)}
        aria-label={`Copy ${label}`}
        className="ml-1.5 inline-flex size-4 cursor-default items-center justify-center rounded-[4px] text-sidebar-foreground transition-colors hover:text-sidebar-foreground/80"
      >
        {isCopied ? (
          <Check className="size-3 text-sidebar-foreground" aria-hidden />
        ) : (
          <Copy className="size-3" aria-hidden />
        )}
      </button>
    </Badge>
  );
}

function VehicleDetailTile({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-muted/20 px-3 py-3",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[color-mix(in_srgb,var(--theme-text-secondary)_91%,rgb(0_0_0)_9%)]">
        <Icon className="size-3.5" aria-hidden />
        <span>{label}</span>
      </div>
      <p className="text-sm font-medium text-[var(--theme-text-secondary)] text-pretty">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-0.5">
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label={label}
        className="size-12 rounded-sm"
        onClick={onClick}
      >
        <Icon className="size-4" aria-hidden />
      </Button>
      <span className="min-h-8 max-w-[3.65rem] text-center text-[11px] leading-4 text-foreground text-pretty">
        {label}
      </span>
    </div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-500">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < value ? "fill-current text-amber-500" : "text-border",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}

function getVehicleBasics(vehicle: InventoryVehicleRecord) {
  const stockSeed = vehicle.vin
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const exteriorColor = exteriorColors[stockSeed % exteriorColors.length];
  const interiorColor =
    interiorColors[(stockSeed * 3) % interiorColors.length];

  return [
    { label: "Exterior Color", value: exteriorColor, icon: CarFront },
    { label: "Interior Color", value: interiorColor, icon: CarFront },
    { label: "Transmission", value: "Automatic", icon: CarFront },
    { label: "Engine", value: "4-Cyl Turbo", icon: Zap },
    { label: "EPA Mileage", value: "19/26 mpg", icon: Fuel },
    { label: "Fuel Type", value: "Gasoline", icon: Fuel },
    { label: "Doors", value: "4", icon: CarFront },
    { label: "Seats", value: "5", icon: CarFront },
  ] as const;
}

export function InventoryVehicleDetailPanel({
  vehicle,
  statusIcons,
  onBack,
  onShowSimilarVehicles,
}: InventoryVehicleDetailPanelProps) {
  const { resolvedTheme } = useTheme();
  const previewSurface: DashPreviewSurface =
    resolvedTheme === "dark" ? "dark" : "light";

  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [sendBrochureOpen, setSendBrochureOpen] = useState(false);
  const [detailDeckTab, setDetailDeckTab] = useState("info");
  const basics = getVehicleBasics(vehicle);
  const stockNumber = vehicle.vin.slice(-6);

  const handleCopy = useCallback((value: string) => {
    void navigator.clipboard.writeText(value).then(
      () => {
        setCopiedValue(value);
        window.setTimeout(() => {
          setCopiedValue((current) => (current === value ? null : current));
        }, 1600);
      },
      () => {
        setCopiedValue(null);
      },
    );
  }, []);

  return (
    <div className="flex h-full flex-col overflow-hidden border border-border bg-sidebar">
      <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border bg-sidebar px-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="h-auto gap-1.5 px-0 py-0 text-sm text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          <span>Back</span>
        </Button>
        {onShowSimilarVehicles ? (
          <Button
            type="button"
            variant="secondary"
            size="xs"
            className="shrink-0"
            onClick={onShowSimilarVehicles}
          >
            <Sparkles className="size-3 shrink-0" aria-hidden />
            Show similar vehicles
          </Button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto cursor-default select-none bg-background">
        <div className="overflow-hidden">
          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
            <Image
              src={vehicle.imageSrc}
              alt={vehicle.imageAlt ?? vehicle.title}
              fill
              unoptimized
              sizes="400px"
              className="object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Previous vehicle image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/90"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Next vehicle image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/90"
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
            <div className="absolute right-2 top-2">
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                aria-label="More vehicle image actions"
                className="bg-background/90"
              >
                <CircleEllipsis className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 backdrop-blur-sm">
              {Array.from({ length: 7 }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "size-2 rounded-full bg-foreground/30",
                    index === 0 && "bg-foreground",
                  )}
                />
              ))}
            </div>
            <div
              className="absolute bottom-3 right-3 flex items-center gap-2 rounded-sm bg-black/70 px-2 py-2"
              style={{ ["--theme-icon-secondary" as string]: "#f1fffa" }}
            >
              <LocationIcon variant={statusIcons.location} />
              <KeyPairedIcon variant={statusIcons.keyPaired} />
              <BatteryIcon variant={statusIcons.battery} />
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="space-y-2">
              <div className="min-w-0">
                <h4 className="font-headline text-2xl font-medium leading-8 text-foreground text-balance">
                  {vehicle.title}
                </h4>
                <p className="mt-1 text-sm text-foreground">
                  <span
                    className={cn(
                      "font-medium tabular-nums",
                      getStockTypeTextClassName(vehicle.stockType),
                    )}
                  >
                    {vehicle.stockType}
                  </span>
                  <span className="mx-1.5 text-foreground">•</span>
                  <span className="tabular-nums">{vehicle.price}</span>
                  <span className="mx-1.5 text-foreground">•</span>
                  <span className="tabular-nums">{vehicle.mileage}</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <VehicleInfoChip
                  label={`VIN ${vehicle.vin}`}
                  copyValue={vehicle.vin}
                  copiedValue={copiedValue}
                  onCopy={handleCopy}
                />
                <VehicleInfoChip
                  label={`Stock ${stockNumber}`}
                  copyValue={stockNumber}
                  copiedValue={copiedValue}
                  onCopy={handleCopy}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-sm border border-border bg-background">
              <div className="grid grid-cols-2 border-b border-border">
                <VehicleDetailTile
                  label="Miles"
                  value={vehicle.mileage}
                  icon={Gauge}
                  className="rounded-none border-0 border-r border-border bg-background"
                />
                <VehicleDetailTile
                  label="Lot Age"
                  value={vehicle.lotAge}
                  icon={MapPin}
                  className="rounded-none border-0 bg-background"
                />
              </div>
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm text-foreground",
                  statusIcons.battery === "inactive"
                    ? "bg-destructive/5"
                    : "bg-background",
                )}
              >
                <div className="flex items-center gap-2">
                  <BatteryIcon
                    variant={statusIcons.battery}
                    className="text-foreground"
                  />
                  <span className="font-medium">Battery Status</span>
                </div>
                <span className="font-semibold tabular-nums text-foreground">
                  9.4v
                </span>
              </div>
            </div>

            <div className="-mx-4 px-2 py-2">
              <div className="grid grid-cols-5 gap-1">
                <ActionButton label="Mark Featured" icon={Star} />
                <ActionButton label="Add a Remark" icon={MessageSquareText} />
                <ActionButton
                  label="Send Brochure"
                  icon={Send}
                  onClick={() => setSendBrochureOpen(true)}
                />
                <ActionButton label="Share Location" icon={MapPin} />
                <ActionButton label="More" icon={CircleEllipsis} />
              </div>
            </div>

            <VehicleDetailDeckTabs
              value={detailDeckTab}
              onValueChange={setDetailDeckTab}
              surface={previewSurface}
            >
              <div className="px-2 pb-2 pt-[4px]">
                {detailDeckTab === "info" ? (
                  <div className="space-y-6">
                    <section className="space-y-3">
                      <h5 className="text-sm font-semibold uppercase text-foreground">
                        Location
                      </h5>
                      <div className="space-y-3">
                        {locationRows.map((location) => (
                          <div
                            key={location.label}
                            className="flex items-center justify-between gap-3 rounded-sm border border-border bg-muted/20 px-4 py-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex size-6 shrink-0 items-center justify-center">
                                {location.icon === "key" ? (
                                  <KeyPairedIcon
                                    variant="active"
                                    className="size-6 text-primary"
                                  />
                                ) : (
                                  <MapPin
                                    className="size-6 text-primary"
                                    aria-hidden
                                  />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground text-pretty">
                                  {location.label}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {location.caption}
                                </p>
                              </div>
                            </div>
                            <div className="size-6 shrink-0" aria-hidden />
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h5 className="text-sm font-semibold uppercase text-foreground">
                        Basics
                      </h5>
                      <div className="grid grid-cols-2 gap-1">
                        {basics.map((item) => (
                          <VehicleDetailTile
                            key={item.label}
                            label={item.label}
                            value={item.value}
                            icon={item.icon}
                          />
                        ))}
                      </div>
                    </section>

                    <section className="space-y-3">
                      <div className="rounded-sm bg-[#00476d] px-4 py-7 text-white">
                        <div className="flex items-center justify-between gap-3">
                          <Image
                            src={CARFAX_LOGO_IMAGE}
                            alt="CARFAX"
                            width={125}
                            height={23}
                            unoptimized
                            className="h-auto w-[7.8125rem]"
                          />
                          <span className="text-sm font-medium underline underline-offset-2">
                            See full report
                          </span>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-3">
                      <h5 className="text-sm font-semibold uppercase text-foreground">
                        Safety Ratings
                      </h5>
                      <div className="space-y-3">
                        {safetyRatings.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between gap-3"
                          >
                            <span className="text-sm text-muted-foreground">
                              {item.label}
                            </span>
                            <StarRating value={item.value} />
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-sm border border-border bg-muted/20 p-4">
                      <p className="text-sm font-medium text-foreground text-pretty">
                        Trips can layer route history, stop summaries, and dwell
                        events into the same detail shell without changing the
                        hero or action rail.
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground text-pretty">
                        Keep the image carousel, section header, and action bar
                        persistent so users can switch contexts without losing the
                        selected vehicle.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </VehicleDetailDeckTabs>
          </div>
        </div>
      </div>
      <SendVehicleBrochureDialog
        open={sendBrochureOpen}
        onOpenChange={setSendBrochureOpen}
      />
    </div>
  );
}
