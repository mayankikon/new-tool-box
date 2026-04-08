"use client";

import Image from "next/image";
import { useCallback, useState, type ReactNode } from "react";
import {
  CarFront,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Fingerprint,
  Fuel,
  Gauge,
  Hash,
  MapPin,
  MessageSquareText,
  Compass,
  Palette,
  Send,
  Star,
  X,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SendVehicleBrochureDialog } from "@/components/inventory/send-vehicle-brochure-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const exteriorColorHex: Record<string, string> = {
  "Summit White": "#F5F5F0",
  "Mosaic Black Metallic": "#1C1C1E",
  "Radiant Red Tintcoat": "#B91C1C",
  "Sterling Gray Metallic": "#8B8B8D",
  "Black": "#0A0A0A",
  "White Sands": "#E8E4D9",
  "Dark Ash Metallic": "#4A4A4C",
  "Sebring Orange Tintcoat": "#D97706",
  "Hysteria Purple Metallic": "#6B21A8",
  "Glacier Blue Metallic": "#3B82C4",
};

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

const stockTypeBadgeConfig: Record<string, { label: string; className: string }> = {
  New: { label: "New", className: "bg-[#3D25DC] text-white" },
  "Pre-Owned": { label: "Pre-Owned", className: "bg-[#B45309] text-white" },
  Certified: { label: "Certified", className: "bg-[#047857] text-white" },
  Service: { label: "Service", className: "bg-[#BE123C] text-white" },
};

function VehicleDetailTile({
  label,
  value,
  icon: Icon,
  labelIcon,
  className,
  labelIconClassName,
  copyValue,
  copiedValue,
  onCopy,
  valueAccessory,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  labelIcon?: ReactNode;
  className?: string;
  labelIconClassName?: string;
  copyValue?: string;
  copiedValue?: string | null;
  onCopy?: (value: string) => void;
  valueAccessory?: ReactNode;
}) {
  const isCopied = copyValue != null && copiedValue === copyValue;
  const copyIconTransition =
    "transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.2,0,0,1)]";
  const valueRow = (
    <span className="inline-flex min-w-0 flex-nowrap items-center gap-2">
      <span className="min-w-0 truncate text-pretty">{value}</span>
      {valueAccessory}
      {copyValue != null && onCopy ? (
        <span className="relative inline-flex size-10 shrink-0 items-center justify-center">
          <Copy
            className={cn(
              "absolute size-3",
              copyIconTransition,
              isCopied ? "scale-[0.25] opacity-0" : "scale-100 opacity-100",
            )}
            aria-hidden
          />
          <Check
            className={cn(
              "absolute size-3 text-emerald-500",
              copyIconTransition,
              isCopied ? "scale-100 opacity-100" : "scale-[0.25] opacity-0",
            )}
            aria-hidden
          />
        </span>
      ) : null}
    </span>
  );

  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-muted/20 px-3 py-3",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[color-mix(in_srgb,var(--theme-text-secondary)_91%,rgb(0_0_0)_9%)]">
        {labelIcon ?? (
          Icon ? (
            <Icon className={cn("size-3.5", labelIconClassName)} aria-hidden />
          ) : null
        )}
        <span>{label}</span>
      </div>
      {copyValue != null && onCopy ? (
        <button
          type="button"
          onClick={() => onCopy(copyValue)}
          className="flex min-h-10 w-full min-w-0 items-center text-left text-xs font-medium text-[var(--theme-text-secondary)] transition-colors hover:text-foreground sm:text-sm"
          aria-label={`Copy ${label}`}
        >
          {valueRow}
        </button>
      ) : (
        <p className="text-sm font-medium text-[var(--theme-text-secondary)] text-pretty">
          {valueRow}
        </p>
      )}
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
    <Button
      type="button"
      variant="ghost"
      size="lg"
      className="w-full gap-2 border-transparent bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
      onClick={onClick}
    >
      <Icon className="size-4" aria-hidden />
      {label}
    </Button>
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

/** Matches dealership BatteryIconSvg: healthy charge → active (green fill), otherwise inactive. */
function getBatteryVoltageVariant(
  voltage: number,
): "active" | "inactive" {
  return voltage >= 12.4 ? "active" : "inactive";
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
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [sendBrochureOpen, setSendBrochureOpen] = useState(false);
  const [detailDeckTab, setDetailDeckTab] = useState("info");
  const basics = getVehicleBasics(vehicle);
  const stockNumber = vehicle.vin.slice(-6);
  const stockSeed = vehicle.vin.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const exteriorColor = exteriorColors[stockSeed % exteriorColors.length];
  const batteryVoltage = 9.0 + ((stockSeed * 7) % 50) / 10;
  const batteryDisplay = `${batteryVoltage.toFixed(1)}V`;
  const batteryVoltageVariant = getBatteryVoltageVariant(batteryVoltage);

  const handleCopy = useCallback((value: string) => {
    void navigator.clipboard.writeText(value).then(
      () => {
        setCopiedValue(value);
        window.setTimeout(() => {
          setCopiedValue((current) => (current === value ? null : current));
        }, 3000);
      },
      () => {
        setCopiedValue(null);
      },
    );
  }, []);

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-lg border border-border/35 bg-transparent shadow-[0_8px_40px_rgba(0,0,0,0.08)]",
        "dark:border-border/25 dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)]",
      )}
    >
      <div className="flex-1 cursor-default select-none overflow-y-auto bg-transparent">
        <div className="overflow-hidden">
          <div className="px-1 pt-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
            <Image
              src={vehicle.imageSrc}
              alt={vehicle.imageAlt ?? vehicle.title}
              fill
              unoptimized
              sizes="400px"
              className="object-cover"
            />
            {vehicle.stockType && stockTypeBadgeConfig[vehicle.stockType] && (
              <Badge
                shape="pill"
                className={cn(
                  "absolute left-2 top-2 border-transparent px-2.5 py-0.5 text-xs font-medium",
                  stockTypeBadgeConfig[vehicle.stockType].className,
                )}
              >
                {stockTypeBadgeConfig[vehicle.stockType].label}
              </Badge>
            )}
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Close"
              onClick={onBack}
              className="absolute right-2 top-2 rounded-full border-transparent bg-black/50 text-white hover:border-transparent hover:bg-black/60"
            >
              <X className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Previous vehicle image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-md border-transparent bg-black/50 text-white hover:border-transparent hover:bg-black/60"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              aria-label="Next vehicle image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border-transparent bg-black/50 text-white hover:border-transparent hover:bg-black/60"
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
              {Array.from({ length: 7 }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "size-2 rounded-full bg-white/50 shadow-[0_1px_2px_rgba(0,0,0,0.2)]",
                    index === 0 && "bg-white shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
                  )}
                />
              ))}
            </div>
            <div
              className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md bg-black/50 px-2 py-2"
              style={{ ["--theme-icon-secondary" as string]: "#f1fffa" }}
            >
              <LocationIcon variant={statusIcons.location} />
              <KeyPairedIcon variant={statusIcons.keyPaired} />
              <BatteryIcon variant={statusIcons.battery} />
            </div>
            </div>
          </div>

          <div className="space-y-4 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {vehicle.title.match(/^\d{4}/)?.[0]} {vehicle.make}
                </p>
                <h4 className="[text-wrap:wrap] whitespace-normal font-headline text-[22px] font-medium leading-7 text-foreground">
                  {vehicle.model} {vehicle.trim}
                </h4>
              </div>
              <span className="shrink-0 font-headline text-xl font-medium tabular-nums text-foreground">
                {vehicle.price}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                <Compass className="size-4" aria-hidden />
                Send Directions to Mobile
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton label="Mark Featured" icon={Star} />
                <ActionButton label="Add a Remark" icon={MessageSquareText} />
                <ActionButton
                  label="Send Brochure"
                  icon={Send}
                  onClick={() => setSendBrochureOpen(true)}
                />
                <ActionButton label="Share Location" icon={MapPin} />
              </div>
            </div>

          </div>

          <Tabs
            value={detailDeckTab}
            onValueChange={setDetailDeckTab}
          >
            <div className="flex justify-center px-4">
              <TabsList variant="filter">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="trips">Trips</TabsTrigger>
              </TabsList>
            </div>
            <div className="mt-2 px-4 pb-4">
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
                      Details
                    </h5>
                    <div className="grid grid-cols-2 gap-1">
                      <VehicleDetailTile
                        label="Miles"
                        value={vehicle.mileage}
                        icon={Gauge}
                      />
                      <VehicleDetailTile
                        label="Lot Age"
                        value={vehicle.lotAge}
                        icon={MapPin}
                      />
                      <VehicleDetailTile
                        label="VIN"
                        value={vehicle.vin}
                        icon={Fingerprint}
                        copyValue={vehicle.vin}
                        copiedValue={copiedValue}
                        onCopy={handleCopy}
                      />
                      <VehicleDetailTile
                        label="Stock"
                        value={stockNumber}
                        icon={Hash}
                        copyValue={stockNumber}
                        copiedValue={copiedValue}
                        onCopy={handleCopy}
                      />
                      <VehicleDetailTile
                        label="Color"
                        value={exteriorColor}
                        icon={Palette}
                        valueAccessory={
                          <span
                            className="size-3.5 shrink-0 rounded-full border border-border"
                            style={{
                              backgroundColor:
                                exteriorColorHex[exteriorColor] ?? "#888",
                            }}
                            aria-hidden
                          />
                        }
                      />
                      <VehicleDetailTile
                        label="Battery"
                        value={batteryDisplay}
                        labelIcon={
                          <BatteryIcon
                            variant={batteryVoltageVariant}
                            className="size-3.5"
                          />
                        }
                      />
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
          </Tabs>
        </div>
      </div>
      <SendVehicleBrochureDialog
        open={sendBrochureOpen}
        onOpenChange={setSendBrochureOpen}
      />
    </div>
  );
}
