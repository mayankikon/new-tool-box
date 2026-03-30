import type { InventoryReportId } from "@/lib/inventory/report-catalog";

export type ReportColumnFormat = "plain" | "voltage" | "missing";

export interface ReportColumnDef {
  key: string;
  label: string;
  widthClassName: string;
  format?: ReportColumnFormat;
}

export interface ReportDeckTabDef {
  value: string;
  label: string;
}

export interface ReportTableViewConfig {
  columns: ReportColumnDef[];
  /** When set, detail view renders file-cabinet tabs (e.g. Pending Installation). */
  deckTabs?: ReportDeckTabDef[];
}

const W = {
  xs: "min-w-[56px] w-[64px]",
  sm: "min-w-[72px] w-[88px]",
  md: "min-w-[100px] w-[120px]",
  lg: "min-w-[120px] w-[140px]",
  xl: "min-w-[160px] w-[180px]",
  xxl: "min-w-[200px] w-[240px]",
  vin: "min-w-[200px] w-[220px]",
  img: "min-w-[42px] w-[48px]",
  icons: "min-w-[100px] w-[120px]",
};

const evox: ReportColumnDef = {
  key: "evoxImage",
  label: "Image",
  widthClassName: W.img,
};

const statusIcons: ReportColumnDef = {
  key: "statusIcons",
  label: "Status",
  widthClassName: W.icons,
};

const DATE_TIMEFRAME_DECK_TABS: ReportDeckTabDef[] = [
  { value: "all", label: "Show All" },
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last-7", label: "Last 7 Days" },
  { value: "last-14", label: "Last 14 Days" },
  { value: "last-30", label: "Last 30 Days" },
];

const UNINSTALLED_HISTORY_DECK_TABS: ReportDeckTabDef[] = [
  { value: "all", label: "Show All" },
  { value: "last-7", label: "Last 7 Days" },
  { value: "last-15", label: "Last 15 Days" },
  { value: "last-30", label: "Last 30 Days" },
];

export const REPORT_TABLE_CONFIG: Record<
  InventoryReportId,
  ReportTableViewConfig
> = {
  "low-battery": {
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      statusIcons,
      { key: "stockNumber", label: "Stock Number", widthClassName: W.lg },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "vehicleBattery", label: "Vehicle Battery", widthClassName: W.md, format: "voltage" },
      { key: "firstReportedDate", label: "First Reported Date", widthClassName: W.xl },
      { key: "firstReportedVoltage", label: "First Reported Voltage", widthClassName: W.lg, format: "voltage" },
      { key: "lastReportedDate", label: "Last Reported Date", widthClassName: W.xl },
      { key: "lastStatus", label: "Last Status", widthClassName: W.xl },
      { key: "installationDate", label: "Installation Date", widthClassName: W.xl },
      { key: "installedBy", label: "Installed By", widthClassName: W.lg },
      { key: "stockType", label: "Stock Type", widthClassName: W.lg },
      { key: "make", label: "Make", widthClassName: W.lg },
      { key: "model", label: "Model", widthClassName: W.lg },
      { key: "year", label: "Year", widthClassName: W.sm },
      { key: "trim", label: "Trim", widthClassName: W.lg },
      { key: "daysParked", label: "Days Parked", widthClassName: W.md },
      { key: "daysInstalled", label: "Days Installed", widthClassName: W.md },
    ],
  },
  "non-reporting": {
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      statusIcons,
      { key: "stockNumber", label: "Stock Number", widthClassName: W.lg },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "lastReportedDate", label: "Last Reported Date", widthClassName: W.xl },
      { key: "lastStatus", label: "Last Status", widthClassName: W.xl },
      { key: "vehicleBattery", label: "Vehicle Battery", widthClassName: W.md, format: "voltage" },
      { key: "installationDate", label: "Installation Date", widthClassName: W.xl },
      { key: "installedBy", label: "Installed By", widthClassName: W.lg },
      { key: "lastKnownLocation", label: "Last Known Location", widthClassName: W.xxl },
      { key: "stockType", label: "Stock Type", widthClassName: W.lg },
      { key: "make", label: "Make", widthClassName: W.lg },
      { key: "model", label: "Model", widthClassName: W.lg },
      { key: "year", label: "Year", widthClassName: W.sm },
      { key: "trim", label: "Trim", widthClassName: W.lg },
    ],
  },
  "off-lot": {
    deckTabs: DATE_TIMEFRAME_DECK_TABS,
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      statusIcons,
      { key: "stockNumber", label: "Stock Number", widthClassName: W.lg },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "lastReportedDate", label: "Last Reported Date", widthClassName: W.xl },
      { key: "offLotDate", label: "Off-Lot Date", widthClassName: W.lg },
      { key: "daysSinceOffLot", label: "Days since Off-Lot", widthClassName: W.md },
      { key: "vehicleBattery", label: "Vehicle Battery", widthClassName: W.md, format: "voltage" },
      { key: "installationDate", label: "Installation Date", widthClassName: W.xl },
      { key: "installedBy", label: "Installed By", widthClassName: W.lg },
      { key: "location", label: "Location", widthClassName: W.xxl },
      { key: "stockType", label: "Stock Type", widthClassName: W.lg },
      { key: "make", label: "Make", widthClassName: W.lg },
      { key: "model", label: "Model", widthClassName: W.lg },
      { key: "year", label: "Year", widthClassName: W.sm },
      { key: "trim", label: "Trim", widthClassName: W.lg },
    ],
  },
  "in-lot": {
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      statusIcons,
      { key: "stockNumber", label: "Stock Number", widthClassName: W.lg },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "lastReportedDate", label: "Last Reported Date", widthClassName: W.xl },
      { key: "inventoryAge", label: "Inventory Age", widthClassName: W.md },
      { key: "daysSinceInLot", label: "Days since In-Lot", widthClassName: W.md },
      { key: "geofence", label: "Geofence", widthClassName: W.xl },
      { key: "vehicleBattery", label: "Vehicle Battery", widthClassName: W.md, format: "voltage" },
      { key: "installationDate", label: "Installation Date", widthClassName: W.xl },
      { key: "installedBy", label: "Installed By", widthClassName: W.lg },
      { key: "location", label: "Location", widthClassName: W.xxl },
      { key: "stockType", label: "Stock Type", widthClassName: W.lg },
      { key: "make", label: "Make", widthClassName: W.lg },
      { key: "model", label: "Model", widthClassName: W.lg },
      { key: "year", label: "Year", widthClassName: W.sm },
      { key: "trim", label: "Trim", widthClassName: W.lg },
    ],
  },
  "installation-exception": {
    columns: [
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "firstReportedDate", label: "First Reported Date", widthClassName: W.xl },
      { key: "lastReportedDate", label: "Last Reported Date", widthClassName: W.xl },
      { key: "lastStatus", label: "Last Status", widthClassName: W.xl },
      { key: "location", label: "Location (Lat/Long)", widthClassName: W.xxl },
      { key: "vehicleBattery", label: "Vehicle Battery", widthClassName: W.md, format: "voltage" },
    ],
  },
  "installed-devices": {
    deckTabs: DATE_TIMEFRAME_DECK_TABS,
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      statusIcons,
      { key: "stockNumber", label: "Stock Number", widthClassName: W.lg },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "vehicleBattery", label: "Vehicle Battery", widthClassName: W.md, format: "voltage" },
      { key: "installationDate", label: "Installation Date", widthClassName: W.xl },
      { key: "installedBy", label: "Installed By", widthClassName: W.lg },
      { key: "stockType", label: "Stock Type", widthClassName: W.lg },
      { key: "make", label: "Make", widthClassName: W.lg },
      { key: "model", label: "Model", widthClassName: W.lg },
      { key: "year", label: "Year", widthClassName: W.sm },
      { key: "trim", label: "Trim", widthClassName: W.lg },
    ],
  },
  registrations: {
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      { key: "customerName", label: "Customer Name", widthClassName: W.xl },
      { key: "registrationDate", label: "Registration Date", widthClassName: W.xl },
      { key: "soldBy", label: "Sold By", widthClassName: W.lg },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "servicePlan", label: "Service Plan", widthClassName: W.lg },
      { key: "sellingPrice", label: "Selling Price", widthClassName: W.md },
      { key: "installedBy", label: "Installed By", widthClassName: W.lg },
      { key: "contractedVia", label: "Contracted Via", widthClassName: W.lg },
    ],
  },
  "non-registration": {
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      { key: "transferredTo", label: "Transferred To", widthClassName: W.xl },
      { key: "registrationDate", label: "Registration Date", widthClassName: W.xl },
      { key: "registrationType", label: "Registration Type", widthClassName: W.lg },
      { key: "transferredBy", label: "Transferred By", widthClassName: W.lg },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "installedBy", label: "Installed By", widthClassName: W.lg },
      { key: "contractedVia", label: "Contracted Via", widthClassName: W.lg },
    ],
  },
  "uninstalled-history": {
    deckTabs: UNINSTALLED_HISTORY_DECK_TABS,
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      statusIcons,
      { key: "stockNumber", label: "Stock Number", widthClassName: W.lg },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "uninstallationDate", label: "Uninstallation Date", widthClassName: W.xl },
      { key: "uninstalledBy", label: "Uninstalled By", widthClassName: W.lg },
      { key: "lastStatus", label: "Last Status", widthClassName: W.xl },
      { key: "location", label: "Location", widthClassName: W.xxl },
      { key: "stockType", label: "Stock Type", widthClassName: W.lg },
      { key: "make", label: "Make", widthClassName: W.lg },
      { key: "model", label: "Model", widthClassName: W.lg },
      { key: "year", label: "Year", widthClassName: W.sm },
      { key: "trim", label: "Trim", widthClassName: W.lg },
    ],
  },
  "pending-registrations": {
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      statusIcons,
      { key: "stockNumber", label: "Stock Number", widthClassName: W.lg },
      { key: "stockType", label: "Stock Type", widthClassName: W.lg },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "driveOffDate", label: "Drive Off Date", widthClassName: W.xl },
      { key: "make", label: "Make", widthClassName: W.lg },
      { key: "model", label: "Model", widthClassName: W.lg },
      { key: "year", label: "Year", widthClassName: W.sm },
      { key: "trim", label: "Trim", widthClassName: W.lg },
    ],
  },
  "pending-installations": {
    deckTabs: [
      { value: "no-gps", label: "Vehicles without GPS Device" },
      { value: "no-key", label: "Vehicles without Key Tag" },
    ],
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      statusIcons,
      { key: "stockNumber", label: "Stock Number", widthClassName: W.lg },
      { key: "stockType", label: "Stock Type", widthClassName: W.lg },
      { key: "make", label: "Make", widthClassName: W.lg },
      { key: "model", label: "Model", widthClassName: W.lg },
      { key: "year", label: "Year", widthClassName: W.sm },
      { key: "trim", label: "Trim", widthClassName: W.lg },
      { key: "vehicleStatus", label: "Vehicle Status", widthClassName: W.xl },
    ],
  },
  "data-exceptions": {
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      statusIcons,
      { key: "stockNumber", label: "Stock Number", widthClassName: W.lg },
      { key: "stockType", label: "Stock Type", widthClassName: W.lg, format: "missing" },
      { key: "mileage", label: "Mileage", widthClassName: W.md, format: "missing" },
      { key: "make", label: "Make", widthClassName: W.lg, format: "missing" },
      { key: "model", label: "Model", widthClassName: W.lg, format: "missing" },
      { key: "year", label: "Year", widthClassName: W.sm, format: "missing" },
      { key: "trim", label: "Trim", widthClassName: W.lg, format: "missing" },
      { key: "exteriorColor", label: "Exterior Color", widthClassName: W.lg, format: "missing" },
      { key: "interiorColor", label: "Interior Color", widthClassName: W.lg, format: "missing" },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "lastReportedDate", label: "Last Reported Date", widthClassName: W.xl },
      { key: "lastStatus", label: "Last Status", widthClassName: W.xl },
      { key: "location", label: "Location", widthClassName: W.xxl },
      { key: "installationDate", label: "Installation Date", widthClassName: W.xl },
      { key: "installedBy", label: "Installed By", widthClassName: W.lg },
    ],
  },
  "location-history": {
    columns: [
      { key: "lastStatus", label: "Last Status", widthClassName: W.xl },
      { key: "lastReportedTime", label: "Last Reported Time", widthClassName: W.xl },
      { key: "vehicleBattery", label: "Vehicle Battery", widthClassName: W.md, format: "voltage" },
      { key: "speed", label: "Speed", widthClassName: W.md },
      { key: "location", label: "Location", widthClassName: W.xxl },
    ],
  },
  unwinds: {
    columns: [
      evox,
      { key: "vin", label: "VIN", widthClassName: W.vin },
      { key: "customerName", label: "Customer Name", widthClassName: W.xl },
      { key: "registrationDate", label: "Registration Date", widthClassName: W.xl },
      { key: "soldBy", label: "Sold By", widthClassName: W.lg },
      { key: "unwindDate", label: "Unwind Date", widthClassName: W.xl },
      { key: "deviceId", label: "Device ID", widthClassName: W.xl },
      { key: "servicePlan", label: "Service Plan", widthClassName: W.lg },
      { key: "sellingPrice", label: "Selling Price", widthClassName: W.md },
      { key: "contractedVia", label: "Contracted Via", widthClassName: W.lg },
    ],
  },
};
