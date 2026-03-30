"use client";

import { InventoryVehicleDetailPanel } from "@/components/inventory/vehicle-detail-panel";
import type { InventoryVehicleRecord } from "@/lib/inventory/vehicle-list-data";

const demoVehicle: InventoryVehicleRecord = {
  title: "2022 Lexus ES 350",
  vin: "WBA53AK02R7N11601",
  make: "Lexus",
  model: "ES",
  trim: "350",
  lotAge: "34 days",
  stockType: "Certified",
  geofence: "Main showroom",
  imageSrc:
    "https://d2ivfcfbdvj3sm.cloudfront.net/YyBRaaUwCVEWdo9G/54822/color_0640_001_png/MY2024/54822/54822_cc0640_001_GB0.png?c=426&p=37&s=I_erXX4PYcFaue8eyTW6OO",
  imageAlt: "2022 Lexus ES 350 in white",
  mileage: "24,421 miles",
  price: "$37,989",
};

export function VehicleDetailsPagePattern() {
  return (
    <div className="space-y-4">
      <p className="ds-doc-font max-w-3xl text-sm text-muted-foreground text-pretty">
        Mobile-first inventory detail page adapted from the Sort UI vehicle
        details concept. This pattern composes existing buttons, badges, tabs,
        and dealership status icons into a shopper-facing drill-down screen.
      </p>

      <div className="max-w-[400px]">
        <InventoryVehicleDetailPanel
          vehicle={demoVehicle}
          statusIcons={{
            location: "active",
            keyPaired: "active",
            battery: "active",
          }}
          onBack={() => {}}
        />
      </div>
    </div>
  );
}
