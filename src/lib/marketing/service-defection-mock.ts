import type {
  Feature,
  FeatureCollection,
  LineString,
  Polygon,
  Position,
} from "geojson";

import type { CampaignRecommendation } from "@/lib/campaigns/mock-data";
import {
  DEALERSHIP_CENTER,
  mainLotGeoJSON,
  type GeofenceProperties,
} from "@/lib/inventory/dealership-geofences";

/** Miles per degree latitude (approximate). */
const MI_PER_DEG_LAT = 69;
const EARTH_RADIUS_MI = 3958.8;

/**
 * Competitor lot pads: half-width in miles (east–west / north–south). Smaller than the
 * legacy ~0.22/0.18 mi so zones read as tight local service areas; the map fits tighter
 * so they still appear prominent.
 */
const COMPETITOR_LOT_HALF_MI_LNG = 0.085;
const COMPETITOR_LOT_HALF_MI_LAT = 0.07;

export type ServiceDefectionZoneRole = "home" | "competitor";

export type CompetitorVenueKind =
  | "franchise_dealer"
  | "independent"
  | "quick_lube";

export interface ServiceDefectionGeofenceProperties extends GeofenceProperties {
  zoneRole: ServiceDefectionZoneRole;
  competitorId?: string;
}

export interface ServiceDefectionSpokeProperties {
  id: string;
  competitorId: string;
  competitorName: string;
}

export interface ServiceDefectionCompetitor {
  id: string;
  name: string;
  kind: CompetitorVenueKind;
  address: string;
  defectingCustomerCount: number;
  topServices: string[];
  /** Public / reported offer signal (mock). */
  promotionSummary?: string;
  estimatedAnnualServiceRevenueAtRisk: number;
}

/** [lng, lat] */
function destinationPointMi(
  lngDeg: number,
  latDeg: number,
  bearingDeg: number,
  distanceMi: number
): [number, number] {
  const φ1 = (latDeg * Math.PI) / 180;
  const λ1 = (lngDeg * Math.PI) / 180;
  const θ = (bearingDeg * Math.PI) / 180;
  const δ = distanceMi / EARTH_RADIUS_MI;

  const sinφ1 = Math.sin(φ1);
  const cosφ1 = Math.cos(φ1);
  const sinδ = Math.sin(δ);
  const cosδ = Math.cos(δ);

  const sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * Math.cos(θ);
  const φ2 = Math.asin(sinφ2);
  const y = Math.sin(θ) * sinδ * cosφ1;
  const x = cosδ - sinφ1 * sinφ2;
  const λ2 = λ1 + Math.atan2(y, x);

  return [(λ2 * 180) / Math.PI, (φ2 * 180) / Math.PI];
}

function competitorSquare(
  centerLng: number,
  centerLat: number,
  halfMiLng: number,
  halfMiLat: number
): Polygon {
  const cosLat = Math.cos((centerLat * Math.PI) / 180);
  const dLng = halfMiLng / (MI_PER_DEG_LAT * cosLat);
  const dLat = halfMiLat / MI_PER_DEG_LAT;
  const ring: Position[] = [
    [centerLng - dLng, centerLat - dLat],
    [centerLng + dLng, centerLat - dLat],
    [centerLng + dLng, centerLat + dLat],
    [centerLng - dLng, centerLat + dLat],
    [centerLng - dLng, centerLat - dLat],
  ];
  return { type: "Polygon", coordinates: [ring] };
}

const [HOME_LNG, HOME_LAT] = DEALERSHIP_CENTER;

export const SERVICE_DEFECTION_COMPETITORS: ServiceDefectionCompetitor[] = [
  {
    id: "comp-northside-auto-mall",
    name: "Northside Auto Mall Service",
    kind: "franchise_dealer",
    address: "2200 N Collins St, Arlington, TX",
    defectingCustomerCount: 9,
    topServices: ["Oil change", "Brakes", "Tire rotation"],
    promotionSummary: "Observed: $39.95 synthetic blend + free multipoint (site, Mar 2025)",
    estimatedAnnualServiceRevenueAtRisk: 42000,
  },
  {
    id: "comp-express-lube-collins",
    name: "Express Lube & Tire — Collins",
    kind: "quick_lube",
    address: "1845 N Collins St, Arlington, TX",
    defectingCustomerCount: 14,
    topServices: ["Quick lube", "State inspection", "Filters"],
    promotionSummary: "Observed: fleet card 10% off (window signage)",
    estimatedAnnualServiceRevenueAtRisk: 28000,
  },
  {
    id: "comp-hometown-motors",
    name: "Hometown Motors Service",
    kind: "independent",
    address: "910 W Division St, Arlington, TX",
    defectingCustomerCount: 6,
    topServices: ["Diagnostics", "Suspension", "A/C"],
    promotionSummary: "Reported: first-time customer labor 15% off (mailer)",
    estimatedAnnualServiceRevenueAtRisk: 19500,
  },
  {
    id: "comp-grand-prairie-quick-lane",
    name: "Grand Prairie Ford Quick Lane",
    kind: "franchise_dealer",
    address: "701 E Main St, Grand Prairie, TX",
    defectingCustomerCount: 11,
    topServices: ["Factory scheduled maint.", "Recall", "Battery"],
    promotionSummary: "OEM national: tire rebate + 0% financing on service (public)",
    estimatedAnnualServiceRevenueAtRisk: 51000,
  },
  {
    id: "comp-jiffy-tune-arlington",
    name: "Jiffy Tune Arlington",
    kind: "quick_lube",
    address: "3055 S Cooper St, Arlington, TX",
    defectingCustomerCount: 8,
    topServices: ["Oil change", "Brakes", "Alignment"],
    promotionSummary: "Observed: $19.99 conventional (limited time, web)",
    estimatedAnnualServiceRevenueAtRisk: 22000,
  },
];

function competitorCenters(): [number, number][] {
  /** Bearings (deg) + distance from home (mi) — keep competitors ~1–2 mi out, not 3–5 mi. */
  return [
    destinationPointMi(HOME_LNG, HOME_LAT, 0, 1.15),
    destinationPointMi(HOME_LNG, HOME_LAT, 55, 1.05),
    destinationPointMi(HOME_LNG, HOME_LAT, 180, 1.35),
    destinationPointMi(HOME_LNG, HOME_LAT, 115, 1.75),
    destinationPointMi(HOME_LNG, HOME_LAT, 200, 1.55),
  ];
}

function buildCompetitorFeatures(): Feature<
  Polygon,
  ServiceDefectionGeofenceProperties
>[] {
  const centers = competitorCenters();
  return SERVICE_DEFECTION_COMPETITORS.map((c, i) => {
    const [lng, lat] = centers[i] ?? centers[0];
    return {
      type: "Feature",
      properties: {
        id: c.id,
        name: c.name,
        address: c.address,
        zoneType: c.kind,
        zoneRole: "competitor",
        competitorId: c.id,
      },
      geometry: competitorSquare(
        lng,
        lat,
        COMPETITOR_LOT_HALF_MI_LNG,
        COMPETITOR_LOT_HALF_MI_LAT
      ),
    };
  });
}

const homeLotFeature = mainLotGeoJSON.features[0];
if (!homeLotFeature) {
  throw new Error("mainLotGeoJSON must include the main lot feature");
}

const homeFeature: Feature<Polygon, ServiceDefectionGeofenceProperties> = {
  type: "Feature",
  properties: {
    ...homeLotFeature.properties,
    zoneRole: "home",
  },
  geometry: homeLotFeature.geometry,
};

/** Closed-ring centroid in [lng, lat]. */
export function ringCentroid(ring: Position[]): [number, number] {
  const n = ring.length;
  if (n === 0) return [0, 0];
  const first = ring[0];
  const last = ring[n - 1];
  const closed =
    n > 2 &&
    last[0] === first[0] &&
    last[1] === first[1];
  const count = closed ? n - 1 : n;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < count; i++) {
    sx += ring[i][0];
    sy += ring[i][1];
  }
  return [sx / count, sy / count];
}

const competitorPolygonFeatures = buildCompetitorFeatures();

function haversineDistanceMiles(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Furthest competitor pad corner from the home lot centroid (statute miles). */
function farthestCompetitorVertexFromHomeMiles(): number {
  const [hcLng, hcLat] = ringCentroid(homeFeature.geometry.coordinates[0]);
  let maxD = 0;
  for (const f of competitorPolygonFeatures) {
    for (const coord of f.geometry.coordinates[0]) {
      const lng = coord[0];
      const lat = coord[1];
      if (typeof lng !== "number" || typeof lat !== "number") continue;
      maxD = Math.max(maxD, haversineDistanceMiles(hcLng, hcLat, lng, lat));
    }
  }
  return maxD;
}

/**
 * Extra distance beyond the farthest competitor vertex so the tracking ring clears pad edges
 * with a small margin (not extended past that).
 */
export const ACTIVITY_TRACKING_RADIUS_EDGE_BUFFER_MI = 0.18;

/** Home lot centroid — center of the Monitor “aggregate activity” disc. */
export function getActivityTrackingCircleCenterLngLat(): [number, number] {
  return ringCentroid(homeFeature.geometry.coordinates[0]);
}

/** Circular tracking radius: covers all five competitor geofences + `ACTIVITY_TRACKING_RADIUS_EDGE_BUFFER_MI`. */
export function getActivityTrackingRadiusMiles(): number {
  return farthestCompetitorVertexFromHomeMiles() + ACTIVITY_TRACKING_RADIUS_EDGE_BUFFER_MI;
}

function buildActivityTrackingCircleRing(
  centerLng: number,
  centerLat: number,
  radiusMi: number,
  steps = 72
): Position[] {
  const ring: Position[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const bearingDeg = (i / steps) * 360;
    ring.push(destinationPointMi(centerLng, centerLat, bearingDeg, radiusMi));
  }
  return ring;
}

/** GeoJSON disk for the aggregate-activity tracking boundary (Monitor heatmap + flame toggle). */
export const ACTIVITY_TRACKING_CIRCLE_GEOJSON: FeatureCollection<Polygon> = (() => {
  const [lng, lat] = getActivityTrackingCircleCenterLngLat();
  const r = getActivityTrackingRadiusMiles();
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { kind: "activity_tracking_radius" },
        geometry: {
          type: "Polygon",
          coordinates: [buildActivityTrackingCircleRing(lng, lat, r)],
        },
      },
    ],
  };
})();

/** Home lot + competitor service-area polygons (no fixed-radius catchment). */
export const SERVICE_DEFECTION_ZONES_GEOJSON: FeatureCollection<
  Polygon,
  ServiceDefectionGeofenceProperties
> = {
  type: "FeatureCollection",
  features: [homeFeature, ...competitorPolygonFeatures],
};

/**
 * Hub-and-spoke lines from your lot centroid to each competitor centroid —
 * spatial reference only (not a measured distance scale).
 */
export const SERVICE_DEFECTION_SPOKES_GEOJSON: FeatureCollection<
  LineString,
  ServiceDefectionSpokeProperties
> = {
  type: "FeatureCollection",
  features: competitorPolygonFeatures.map((f) => {
    const homeCenter = ringCentroid(homeFeature.geometry.coordinates[0]);
    const compCenter = ringCentroid(f.geometry.coordinates[0]);
    return {
      type: "Feature",
      properties: {
        id: `spoke-${f.properties.id}`,
        competitorId: f.properties.id,
        competitorName: f.properties.name,
      },
      geometry: {
        type: "LineString",
        coordinates: [homeCenter, compCenter],
      },
    };
  }),
};

/** Feature `properties.id` values — for Mapbox `promoteId` + feature-state. */
export const SERVICE_DEFECTION_ZONE_FEATURE_IDS: readonly string[] =
  SERVICE_DEFECTION_ZONES_GEOJSON.features.map((f) => f.properties.id);

export interface RankedServiceDefectionCompetitor extends ServiceDefectionCompetitor {
  /** 1 = highest impact, 5 = lowest among the mock set. */
  impactRank: number;
  impactScore: number;
}

/**
 * Competitors sorted by blended impact (defector count + revenue at risk).
 */
export function getRankedServiceDefectionCompetitors(): RankedServiceDefectionCompetitor[] {
  const sorted = [...SERVICE_DEFECTION_COMPETITORS].sort((a, b) => {
    const scoreA =
      a.defectingCustomerCount * 2000 + a.estimatedAnnualServiceRevenueAtRisk;
    const scoreB =
      b.defectingCustomerCount * 2000 + b.estimatedAnnualServiceRevenueAtRisk;
    return scoreB - scoreA;
  });
  return sorted.map((c, i) => ({
    ...c,
    impactRank: i + 1,
    impactScore: c.defectingCustomerCount * 2000 + c.estimatedAnnualServiceRevenueAtRisk,
  }));
}

export function getServiceDefectionCompetitorById(
  id: string
): ServiceDefectionCompetitor | undefined {
  return SERVICE_DEFECTION_COMPETITORS.find((c) => c.id === id);
}

export function getCompetitorPolygonFeature(
  competitorId: string
): Feature<Polygon, ServiceDefectionGeofenceProperties> | undefined {
  return SERVICE_DEFECTION_ZONES_GEOJSON.features.find(
    (f) => f.properties.competitorId === competitorId
  ) as Feature<Polygon, ServiceDefectionGeofenceProperties> | undefined;
}

const KIND_LABELS: Record<CompetitorVenueKind, string> = {
  franchise_dealer: "Franchise dealer",
  independent: "Independent",
  quick_lube: "Quick lube",
};

export function formatCompetitorKind(kind: CompetitorVenueKind): string {
  return KIND_LABELS[kind];
}

export function buildWinBackCampaignRecommendation(
  competitor: ServiceDefectionCompetitor
): CampaignRecommendation {
  const opportunity =
    competitor.defectingCustomerCount >= 10 ? "high" : "medium";
  return {
    id: `monitor-winback-${competitor.id}`,
    title: `Win-back: ${competitor.name}`,
    description: `Target ${competitor.defectingCustomerCount} households with recent service visits attributed to ${competitor.name}. Lead with value (loaner, OEM parts, bundled inspection) against their public positioning.`,
    estimatedReach: competitor.defectingCustomerCount,
    estimatedRevenue: Math.max(
      3200,
      Math.round(competitor.estimatedAnnualServiceRevenueAtRisk * 0.12)
    ),
    opportunity,
    templateId: "tpl-002",
  };
}

export interface ServiceDefectionKpiSnapshot {
  serviceDefectors30d: number;
  revenueAtRiskAnnual: number;
  competitorsTracked: number;
  winBackCampaignsActive: number;
}

export function getServiceDefectionKpiSnapshot(): ServiceDefectionKpiSnapshot {
  const serviceDefectors30d = SERVICE_DEFECTION_COMPETITORS.reduce(
    (sum, c) => sum + c.defectingCustomerCount,
    0
  );
  const revenueAtRiskAnnual = SERVICE_DEFECTION_COMPETITORS.reduce(
    (sum, c) => sum + c.estimatedAnnualServiceRevenueAtRisk,
    0
  );
  return {
    serviceDefectors30d,
    revenueAtRiskAnnual,
    competitorsTracked: SERVICE_DEFECTION_COMPETITORS.length,
    winBackCampaignsActive: 2,
  };
}
