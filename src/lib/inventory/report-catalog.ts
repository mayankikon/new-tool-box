export type InventoryReportId =
  | "low-battery"
  | "non-reporting"
  | "off-lot"
  | "installation-exception"
  | "installed-devices"
  | "registrations"
  | "non-registration"
  | "uninstalled-history"
  | "pending-registrations"
  | "pending-installations"
  | "in-lot"
  | "data-exceptions"
  | "location-history"
  | "unwinds";

export interface InventoryReportDefinition {
  id: InventoryReportId;
  title: string;
  description: string;
  summary: string;
  category: "device" | "operations" | "registration";
}

export const inventoryReportCatalog: InventoryReportDefinition[] = [
  {
    id: "low-battery",
    title: "Low Battery",
    description:
      "Vehicles with a paired wired device that are pinging and have vehicle battery below the threshold set on Configurations.",
    summary: "Battery and device health",
    category: "device",
  },
  {
    id: "non-reporting",
    title: "Non-Reporting",
    description:
      "Vehicles not reporting a ping for more than 24 hours.",
    summary: "Connectivity exception",
    category: "device",
  },
  {
    id: "off-lot",
    title: "Off Lot",
    description:
      "Vehicles currently outside every dealership geofence (classified off-lot as soon as the device reports outside all geofences).",
    summary: "Geofence activity",
    category: "operations",
  },
  {
    id: "in-lot",
    title: "In-Lot Report",
    description:
      "Vehicles inside at least one geofence, with inventory age and days in-lot.",
    summary: "On-lot inventory",
    category: "operations",
  },
  {
    id: "installation-exception",
    title: "Installation Exceptions",
    description:
      "Devices that are pinging but have no VIN association—the pairing process did not complete.",
    summary: "Unidentified pinging devices",
    category: "device",
  },
  {
    id: "installed-devices",
    title: "Installed Devices",
    description:
      "All vehicles paired to a device (most recent VIN association), newest first.",
    summary: "Installation completion",
    category: "device",
  },
  {
    id: "registrations",
    title: "Registrations",
    description:
      "Customer registrations completed via Toolbox or Pen (distinct from pending registrations).",
    summary: "Customer activation",
    category: "registration",
  },
  {
    id: "non-registration",
    title: "Non Registrations",
    description:
      "Vehicles transferred or marked as non-registration types (Auction, Dealer Trade, NS/NR, SM).",
    summary: "Non-registration transfers",
    category: "registration",
  },
  {
    id: "uninstalled-history",
    title: "Uninstalled History",
    description:
      "Vehicles unpaired from a device (most recent VIN association), newest uninstall first.",
    summary: "Removal history",
    category: "operations",
  },
  {
    id: "pending-registrations",
    title: "Pending Registrations",
    description:
      "New, preowned, or certified vehicles sold through without registration: off-lot over 3 days with a DMS sales record.",
    summary: "Sold pending registration",
    category: "registration",
  },
  {
    id: "pending-installations",
    title: "Pending Installation",
    description:
      "Vehicles missing a GPS device or key tag—two views: without GPS device and without key tag.",
    summary: "Install backlog",
    category: "device",
  },
  {
    id: "data-exceptions",
    title: "Data Exceptions Report",
    description:
      "Vehicles missing one of: Year, Make, Model, Trim, exterior color, stock type, or mileage.",
    summary: "DMS data gaps",
    category: "device",
  },
  {
    id: "location-history",
    title: "Location History",
    description:
      "Search by VIN and view ping history for devices paired to that VIN (periodic or motion intervals).",
    summary: "VIN location pings",
    category: "operations",
  },
  {
    id: "unwinds",
    title: "Unwinds",
    description:
      "Recent unwinds from Customers or Devices—reversing registration for applicable vehicles.",
    summary: "Registration unwind",
    category: "registration",
  },
];
