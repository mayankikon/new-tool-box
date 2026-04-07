import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LocationIconSvg,
  KeyIconSvg,
  BatteryIconSvg,
} from "@/components/icons/vehicle-status-icons";

/* ─── Status indicator icons (dealership Icons set) ─── */

type StatusIconVariant = "active" | "inactive";

interface StatusIconProps {
  variant?: StatusIconVariant;
  className?: string;
}

function LocationIcon({ variant = "inactive", className }: StatusIconProps) {
  return (
    <LocationIconSvg
      variant={variant}
      className={className}
    />
  );
}

function KeyPairedIcon({ variant = "inactive", className }: StatusIconProps) {
  return (
    <KeyIconSvg
      variant={variant}
      className={className}
    />
  );
}

function BatteryIcon({ variant = "inactive", className }: StatusIconProps) {
  return (
    <BatteryIconSvg
      variant={variant}
      className={className}
    />
  );
}

/* ─── Vehicle list item ─── */

interface VehicleStatusIcons {
  location?: StatusIconVariant;
  keyPaired?: StatusIconVariant;
  battery?: StatusIconVariant;
}

type VehicleStockType = "New" | "Pre-Owned" | "Certified" | "Service";

const stockTypeBadgeConfig: Record<VehicleStockType, { label: string; className: string }> = {
  New: { label: "New", className: "bg-[#3D25DC] text-white" },
  "Pre-Owned": { label: "Pre-Owned", className: "bg-[#B45309] text-white" },
  Certified: { label: "Certified", className: "bg-[#047857] text-white" },
  Service: { label: "Service", className: "bg-[#BE123C] text-white" },
};

interface VehicleListItemProps extends React.ComponentProps<"div"> {
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  /** Displayed as the secondary identifier. Falls back to `vin` when absent. */
  stockNumber?: string;
  vin?: string;
  price?: string;
  mileage?: string;
  /** @deprecated Use `stockType` instead. */
  isNew?: boolean;
  stockType?: VehicleStockType;
  statusIcons?: VehicleStatusIcons;
}

function VehicleListItem({
  imageSrc,
  imageAlt,
  title,
  stockNumber,
  vin,
  price,
  mileage,
  isNew,
  stockType,
  statusIcons = {},
  className,
  ...props
}: VehicleListItemProps) {
  const identifier = stockNumber ? `Stock ${stockNumber}` : vin;
  const identifierAndMileage = [identifier, mileage]
    .filter(Boolean)
    .join(" \u2022 ");

  const resolvedStockType = stockType ?? (isNew ? "New" : undefined);
  const badgeConfig = resolvedStockType ? stockTypeBadgeConfig[resolvedStockType] : undefined;

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 bg-background px-4 py-3 transition-colors hover:bg-muted/40",
        props.onClick ? "cursor-pointer" : "cursor-default",
        "after:pointer-events-none after:absolute after:bottom-0 after:left-4 after:right-4 after:h-px after:bg-border/80 last:after:hidden",
        className
      )}
      {...props}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 overflow-hidden rounded-xs bg-transparent">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt ?? title}
            width={95}
            height={72}
            className="h-[72px] w-[95px] bg-transparent object-cover"
          />
        ) : (
          <div className="h-[72px] w-[95px] bg-background/40" />
        )}
        {badgeConfig && (
          <Badge
            shape="pill"
            size="sm"
            className={cn("absolute left-1 top-1 min-h-0 border-transparent px-1.5 py-0", badgeConfig.className)}
          >
            {badgeConfig.label}
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-base font-medium leading-6 text-foreground">
          {title}
        </span>
        {identifierAndMileage && (
          <span className="truncate text-sm leading-5 text-muted-foreground">
            {identifierAndMileage}
          </span>
        )}
        {price && (
          <span className="truncate text-base font-medium leading-6 text-foreground">
            {price}
          </span>
        )}
      </div>

      {/* Status icons */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <LocationIcon variant={statusIcons.location} />
        <KeyPairedIcon variant={statusIcons.keyPaired} />
        <BatteryIcon variant={statusIcons.battery} />
      </div>
    </div>
  );
}

/* ─── Vehicle list container ─── */

interface VehicleListProps extends React.ComponentProps<"div"> {
  children: React.ReactNode;
}

function VehicleList({ children, className, ...props }: VehicleListProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  VehicleListItem,
  VehicleList,
  LocationIcon,
  KeyPairedIcon,
  BatteryIcon,
};
export type { VehicleListItemProps, VehicleListProps, VehicleStatusIcons, VehicleStockType, StatusIconVariant };
