"use client";

import { HelpCircle } from "lucide-react";

import {
  BatteryIconSvg,
  KeyIconSvg,
  LocationIconSvg,
} from "@/components/icons/vehicle-status-icons";
import { cn } from "@/lib/utils";

export type DeviceStatusLabel = "paired" | "unpaired" | "nonReporting";
export type KeyStatusLabel = "paired" | "unpaired";
export type BatteryStatusLabel = "good" | "low" | "noReading";

function keyIconVariant(status: string): "active" | "inactive" {
  const s = status.toLowerCase();
  return s === "paired" ? "active" : "inactive";
}

function batteryIconVariant(status: string): "active" | "inactive" | "unknown" {
  const s = status.toLowerCase();
  if (s === "noreading" || s === "no-reading" || s === "") {
    return "unknown";
  }
  if (s === "low") {
    return "inactive";
  }
  if (s === "good") {
    return "active";
  }
  return "inactive";
}

export function ReportStatusIcons({
  deviceStatus,
  keyStatus,
  batteryStatus,
  className,
}: {
  deviceStatus?: string;
  keyStatus?: string;
  batteryStatus?: string;
  className?: string;
}) {
  const keyVariant = keyIconVariant(keyStatus ?? "");
  const batteryVariant = batteryIconVariant(batteryStatus ?? "");

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Device ${deviceStatus ?? "unknown"}, Key ${keyStatus ?? "unknown"}, Battery ${batteryStatus ?? "unknown"}`}
    >
      <LocationIconSvg className="size-4 shrink-0" />
      <KeyIconSvg variant={keyVariant} className="size-4 shrink-0" />
      {batteryVariant === "unknown" ? (
        <HelpCircle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : (
        <BatteryIconSvg variant={batteryVariant} className="size-4 shrink-0" />
      )}
    </div>
  );
}
