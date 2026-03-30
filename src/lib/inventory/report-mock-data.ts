import type { InventoryReportId } from "@/lib/inventory/report-catalog";
import {
  getUninstalledHistoryCutoffMs,
  installationDateInTimeframe,
  parseDaysSince,
  parseReportDate,
  passesDaysOffLotFilter,
  type DaysOffLotThreshold,
  type InstalledDevicesTimeFrame,
  type UninstalledHistoryTimeFrame,
} from "@/lib/inventory/report-table-helpers";
import { INVENTORY_PANEL_VEHICLES } from "@/lib/inventory/vehicle-list-data";

/** Flat row for generic report table rendering */
export type InventoryReportRow = {
  id: string;
} & Record<string, string | number | undefined>;

const iso = (daysAgo: number) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  return d.toISOString().slice(0, 10);
};

const isoHoursAgo = (hours: number) => {
  const d = new Date(Date.now() - hours * 60 * 60 * 1000);
  return d.toISOString();
};

const REPORT_SIDE_IMAGE_POOL = INVENTORY_PANEL_VEHICLES.map((vehicle) => ({
  src: vehicle.imageSrc,
  alt: vehicle.imageAlt,
}));

function reportVehicleImageForSeed(seed: string) {
  const hash = seed
    .split("")
    .reduce((acc, char) => (acc * 33 + char.charCodeAt(0)) >>> 0, 5381);
  return REPORT_SIDE_IMAGE_POOL[hash % REPORT_SIDE_IMAGE_POOL.length];
}

function baseVehicle(
  id: string,
  vin: string,
): InventoryReportRow {
  const reportImage = reportVehicleImageForSeed(`${id}-${vin}`);
  return {
    id,
    vin,
    evoxImage: reportImage?.src ?? "",
    evoxImageAlt: reportImage?.alt ?? "Vehicle side profile",
    deviceStatus: "paired",
    keyStatus: "paired",
    batteryStatus: "good",
    stockNumber: `STK-${id}`,
    deviceId: `IKON-${id.padStart(6, "0")}`,
    stockType: "New",
    make: "Toyota",
    model: "Camry",
    year: 2024,
    trim: "LE",
    vehicleBattery: 12.4,
    installationDate: iso(14),
    installedBy: "Alex Morgan",
    lastReportedDate: isoHoursAgo(2),
    lastStatus: "Periodic Report",
  };
}

const LOW_BATTERY_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("lb1", "1HGCM82633A004352"),
    batteryStatus: "low",
    vehicleBattery: 11.2,
    firstReportedDate: iso(30),
    firstReportedVoltage: 12.6,
    daysParked: 3,
    daysInstalled: 30,
  },
  {
    ...baseVehicle("lb2", "5YJ3E1EA1KF123456"),
    batteryStatus: "low",
    vehicleBattery: 11.5,
    firstReportedDate: iso(10),
    firstReportedVoltage: 12.1,
    daysParked: 0,
    daysInstalled: 10,
  },
];

const NON_REPORTING_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("nr1", "JM1BK32F581234567"),
    deviceStatus: "nonReporting",
    batteryStatus: "noReading",
    lastReportedDate: iso(2),
    lastKnownLocation: "33.0198, -96.6989",
    vehicleBattery: "",
  },
];

const OFF_LOT_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("ol1", "1FTFW1ET5DFC12345"),
    offLotDate: iso(0),
    daysSinceOffLot: 0,
    location: "32.7767, -96.7970",
  },
  {
    ...baseVehicle("ol2", "2C3CDXHG6PH123456"),
    offLotDate: iso(5),
    daysSinceOffLot: 5,
    location: "33.1507, -96.8236",
  },
  {
    ...baseVehicle("ol3", "3VW2B7AJ5HM123456"),
    offLotDate: iso(12),
    daysSinceOffLot: 12,
    location: "32.9157, -96.9828",
  },
];

const IN_LOT_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("il1", "4T1BE46K37U123456"),
    inventoryAge: 45,
    daysSinceInLot: 0,
    geofence: "Main Lot",
    location: "33.0198, -96.6989",
  },
  {
    ...baseVehicle("il2", "KM8J3CA47JU123456"),
    inventoryAge: 12,
    daysSinceInLot: 4,
    geofence: "Overflow Lot",
    location: "33.0201, -96.6995",
  },
];

const INSTALLATION_EXCEPTION_ROWS: InventoryReportRow[] = [
  {
    id: "ie1",
    deviceId: "IKON-UNPAIR-001",
    firstReportedDate: iso(7),
    lastReportedDate: isoHoursAgo(1),
    lastStatus: "Drive Report",
    location: "32.7800, -96.8000",
    vehicleBattery: 12.8,
  },
];

const INSTALLED_DEVICES_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("id1", "1C4RJFAG5LC123456"),
    installationDate: iso(0),
  },
  {
    ...baseVehicle("id2", "1HGCV1F30LA123456"),
    installationDate: iso(3),
  },
  {
    ...baseVehicle("id3", "KNDJN2A2XH7123456"),
    installationDate: iso(60),
  },
];

const REGISTRATIONS_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("rg1", "1G1ZD5ST5LF123456"),
    customerName: "Jordan Lee",
    registrationDate: iso(1),
    soldBy: "Sam Rivera",
    servicePlan: "3 year",
    sellingPrice: "$450.00",
    contractedVia: "Toolbox",
  },
];

const NON_REGISTRATION_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("nreg1", "1N4AL3AP1JC123456"),
    transferredTo: "Regional Auction House",
    registrationDate: iso(4),
    registrationType: "Auction",
    transferredBy: "System",
    contractedVia: "Pen",
  },
];

const UNINSTALLED_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("uh1", "5N1DR2MN7LC123456"),
    uninstallationDate: iso(2),
    uninstalledBy: "Pat Kim",
    location: "33.01, -96.70",
  },
  {
    ...baseVehicle("uh2", "5YJSA1E14HF123456"),
    uninstallationDate: iso(20),
    uninstalledBy: "Chris Ng",
    location: "33.02, -96.71",
  },
];

const PENDING_REGISTRATIONS_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("pr1", "1C6RR7LT9LS123456"),
    driveOffDate: iso(5),
  },
];

const PENDING_INSTALLATIONS_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("pi1", "1FTMF1CB5KKF12345"),
    hasGpsDevice: "no",
    hasKeyTag: "yes",
    vehicleStatus: "13",
  },
  {
    ...baseVehicle("pi2", "2HGFC2F59LH123456"),
    hasGpsDevice: "yes",
    hasKeyTag: "no",
    vehicleStatus: "11",
  },
  {
    ...baseVehicle("pi3", "3N1AB7AP7KY123456"),
    hasGpsDevice: "no",
    hasKeyTag: "no",
    vehicleStatus: "1",
  },
];

const DATA_EXCEPTIONS_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("de1", "1G1BE5SM0K7123456"),
    stockType: "",
    mileage: "",
    make: "Toyota",
    model: "",
    year: "",
    trim: "LE",
    exteriorColor: "",
    interiorColor: "Black",
    lastReportedDate: iso(0),
    location: "33.0, -96.7",
  },
];

const UNWINDS_ROWS: InventoryReportRow[] = [
  {
    ...baseVehicle("uw1", "1FMCU0G61LUA12345"),
    customerName: "Taylor Reed",
    registrationDate: iso(90),
    soldBy: "Jamie Fox",
    unwindDate: iso(1),
    servicePlan: "1 year",
    sellingPrice: "$399.00",
    contractedVia: "Pen",
  },
];

const LOCATION_HISTORY_PINGS: Record<string, InventoryReportRow[]> = {
  "1HGCM82633A004352": [
    {
      id: "p1",
      lastStatus: "Ignition Off",
      lastReportedTime: isoHoursAgo(24),
      vehicleBattery: 12.4,
      speed: 0,
      location: "33.0198, -96.6989",
    },
    {
      id: "p2",
      lastStatus: "Drive Report",
      lastReportedTime: isoHoursAgo(26),
      vehicleBattery: 12.5,
      speed: 35,
      location: "33.0201, -96.6991",
    },
  ],
};

const ALL_MOCK: Record<InventoryReportId, InventoryReportRow[]> = {
  "low-battery": LOW_BATTERY_ROWS,
  "non-reporting": NON_REPORTING_ROWS,
  "off-lot": OFF_LOT_ROWS,
  "in-lot": IN_LOT_ROWS,
  "installation-exception": INSTALLATION_EXCEPTION_ROWS,
  "installed-devices": INSTALLED_DEVICES_ROWS,
  registrations: REGISTRATIONS_ROWS,
  "non-registration": NON_REGISTRATION_ROWS,
  "uninstalled-history": UNINSTALLED_ROWS,
  "pending-registrations": PENDING_REGISTRATIONS_ROWS,
  "pending-installations": PENDING_INSTALLATIONS_ROWS,
  "data-exceptions": DATA_EXCEPTIONS_ROWS,
  "location-history": [],
  unwinds: UNWINDS_ROWS,
};

export function getMockRowsForReport(reportId: InventoryReportId): InventoryReportRow[] {
  return ALL_MOCK[reportId] ?? [];
}

export function filterPendingInstallationTab(
  rows: InventoryReportRow[],
  tab: "no-gps" | "no-key",
): InventoryReportRow[] {
  if (tab === "no-gps") {
    return rows.filter((r) => String(r.hasGpsDevice ?? "yes").toLowerCase() === "no");
  }
  return rows.filter((r) => String(r.hasKeyTag ?? "yes").toLowerCase() === "no");
}

export function filterOffLotRows(
  rows: InventoryReportRow[],
  threshold: DaysOffLotThreshold,
): InventoryReportRow[] {
  return rows.filter((r) =>
    passesDaysOffLotFilter(parseDaysSince(r.daysSinceOffLot), threshold),
  );
}

export function filterOffLotRowsByTimeframe(
  rows: InventoryReportRow[],
  timeframe: InstalledDevicesTimeFrame,
  nowMs: number = Date.now(),
): InventoryReportRow[] {
  if (timeframe === "all") {
    return rows;
  }
  return rows.filter((r) =>
    installationDateInTimeframe(
      String(r.offLotDate ?? ""),
      timeframe,
      nowMs,
    ),
  );
}

export function filterInstalledDevicesTimeframe(
  rows: InventoryReportRow[],
  timeframe: InstalledDevicesTimeFrame,
  nowMs: number = Date.now(),
): InventoryReportRow[] {
  if (timeframe === "all") {
    return rows;
  }
  return rows.filter((r) =>
    installationDateInTimeframe(
      String(r.installationDate ?? ""),
      timeframe,
      nowMs,
    ),
  );
}

export function filterUninstalledHistoryTimeframe(
  rows: InventoryReportRow[],
  timeframe: UninstalledHistoryTimeFrame,
  nowMs: number = Date.now(),
): InventoryReportRow[] {
  if (timeframe === "all") {
    return rows;
  }
  const cutoff = getUninstalledHistoryCutoffMs(timeframe, nowMs);
  return rows.filter((r) => {
    const t = parseReportDate(String(r.uninstallationDate ?? ""));
    return t !== null && t >= cutoff;
  });
}

export function getLocationHistoryPingsForVin(vin: string): InventoryReportRow[] {
  const normalized = vin.trim().toUpperCase();
  return LOCATION_HISTORY_PINGS[normalized] ?? [];
}
