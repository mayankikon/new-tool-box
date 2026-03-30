import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
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

interface VehicleListItemProps extends React.ComponentProps<"div"> {
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  vin?: string;
  price?: string;
  mileage?: string;
  statusIcons?: VehicleStatusIcons;
}

function VehicleListItem({
  imageSrc,
  imageAlt,
  title,
  vin,
  price,
  mileage,
  statusIcons = {},
  className,
  ...props
}: VehicleListItemProps) {
  const priceAndMileage = [price, mileage].filter(Boolean).join(" • ");

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
      <div className="shrink-0 overflow-hidden rounded-xs bg-transparent">
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
      </div>

      {/* Description */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-base font-medium leading-6 text-foreground">
          {title}
        </span>
        {vin && (
          <span className="truncate text-sm leading-5 text-muted-foreground">
            {vin}
          </span>
        )}
        {priceAndMileage && (
          <span className="truncate text-sm leading-5 text-muted-foreground">
            {priceAndMileage}
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
export type { VehicleListItemProps, VehicleListProps, VehicleStatusIcons, StatusIconVariant };
