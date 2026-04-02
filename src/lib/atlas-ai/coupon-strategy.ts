import type { CampaignOffer } from "@/lib/campaigns/types";
import type {
  AtlasAiCouponStrategy,
  AtlasAiCouponTier,
  AtlasAiCustomerPreviewRow,
} from "@/lib/atlas-ai/types";

export type CouponTier = AtlasAiCouponTier;

/** Maps any numeric offset to the three UI presets: −2 (conservative), 0 (balanced), +2 (aggressive). */
export function normalizeAggressivenessOffset(offset: number): number {
  if (offset < 0) return -2;
  if (offset > 0) return 2;
  return 0;
}

export interface IntelligentCouponResult {
  tier: CouponTier;
  discountPercent: number;
  label: string;
}

/** Base tiers from retention: low score → aggressive discount. Offset shifts all tiers by 5% per step. */
export function computeIntelligentCoupon(
  retentionScore: number,
  aggressivenessOffset: number,
): IntelligentCouponResult {
  const o = normalizeAggressivenessOffset(aggressivenessOffset);
  const clampedScore = Math.min(100, Math.max(0, retentionScore));
  let tier: CouponTier;
  let baseDiscount: number;
  if (clampedScore < 40) {
    tier = "aggressive";
    baseDiscount = 25;
  } else if (clampedScore < 70) {
    tier = "moderate";
    baseDiscount = 15;
  } else {
    tier = "light";
    baseDiscount = 5;
  }

  const delta = o * 5;
  const discountPercent = Math.min(50, Math.max(0, baseDiscount + delta));

  return {
    tier,
    discountPercent,
    label: `${discountPercent}% off`,
  };
}

const AVG_SERVICE_TICKET_DOLLARS = 180;

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface EngageKpiSnapshot {
  audienceSize: number;
  estimatedWinBackRate: string;
  estimatedCouponCost: string;
  estimatedRecoveryRevenue: string;
}

/** Live KPIs when adjusting incentive aggressiveness. */
export function computeEngageKpis(
  rows: AtlasAiCustomerPreviewRow[],
  aggressivenessOffset: number,
): EngageKpiSnapshot {
  const n = rows.length;
  if (n === 0) {
    return {
      audienceSize: 0,
      estimatedWinBackRate: "0%",
      estimatedCouponCost: "$0",
      estimatedRecoveryRevenue: "$0",
    };
  }

  let totalDiscountDollars = 0;
  let totalRecoveryDollars = 0;
  let winBackSum = 0;

  const o = normalizeAggressivenessOffset(aggressivenessOffset);

  for (const row of rows) {
    const { discountPercent } = computeIntelligentCoupon(
      row.retentionScore,
      aggressivenessOffset,
    );
    const baseWinBack = ((100 - row.retentionScore) / 100) * 0.55 + 0.12;
    const winBackBoost = o * 0.035;
    const winBack = Math.min(0.94, Math.max(0.08, baseWinBack + winBackBoost));
    winBackSum += winBack;
    totalDiscountDollars += AVG_SERVICE_TICKET_DOLLARS * (discountPercent / 100);
    totalRecoveryDollars += AVG_SERVICE_TICKET_DOLLARS * winBack;
  }

  return {
    audienceSize: n,
    estimatedWinBackRate: `${Math.round((winBackSum / n) * 100)}%`,
    estimatedCouponCost: formatMoney(totalDiscountDollars),
    estimatedRecoveryRevenue: formatMoney(totalRecoveryDollars),
  };
}

/** Aggregated tier counts and headline metrics for a baseline (offset 0). */
export function buildCouponStrategyFromRows(
  rows: AtlasAiCustomerPreviewRow[],
  aggressivenessOffset = 0,
): AtlasAiCouponStrategy {
  const n = rows.length;
  if (n === 0) {
    return {
      totalCustomers: 0,
      tiers: [],
      estimatedCouponCost: "$0",
      estimatedRecoveryRevenue: "$0",
      estimatedWinBackRate: "0%",
    };
  }

  const tierBuckets: Record<
    CouponTier,
    { count: number; discountSum: number }
  > = {
    aggressive: { count: 0, discountSum: 0 },
    moderate: { count: 0, discountSum: 0 },
    light: { count: 0, discountSum: 0 },
  };

  let totalDiscountDollars = 0;
  let totalRecoveryDollars = 0;
  let winBackSum = 0;

  const o = normalizeAggressivenessOffset(aggressivenessOffset);

  for (const row of rows) {
    const coupon = computeIntelligentCoupon(
      row.retentionScore,
      aggressivenessOffset,
    );
    tierBuckets[coupon.tier].count += 1;
    tierBuckets[coupon.tier].discountSum += coupon.discountPercent;

    const baseWinBack = ((100 - row.retentionScore) / 100) * 0.55 + 0.12;
    const winBackBoost = o * 0.035;
    const winBack = Math.min(0.94, Math.max(0.08, baseWinBack + winBackBoost));
    winBackSum += winBack;
    totalDiscountDollars += AVG_SERVICE_TICKET_DOLLARS * (coupon.discountPercent / 100);
    totalRecoveryDollars += AVG_SERVICE_TICKET_DOLLARS * winBack;
  }

  const tiers: AtlasAiCouponStrategy["tiers"] = (
    ["aggressive", "moderate", "light"] as const
  )
    .map((tier) => {
      const b = tierBuckets[tier];
      const avgDiscount =
        b.count > 0 ? Math.round(b.discountSum / b.count) : 0;
      return {
        tier,
        count: b.count,
        discountPercent: avgDiscount,
      };
    })
    .filter((t) => t.count > 0);

  return {
    totalCustomers: n,
    tiers,
    estimatedCouponCost: formatMoney(totalDiscountDollars),
    estimatedRecoveryRevenue: formatMoney(totalRecoveryDollars),
    estimatedWinBackRate: `${Math.round((winBackSum / n) * 100)}%`,
  };
}

/** Estimated dollar value of one coupon redemption for a row (for engage table). */
export function estimateCouponValueDollars(
  row: AtlasAiCustomerPreviewRow,
  aggressivenessOffset: number,
): number {
  const { discountPercent } = computeIntelligentCoupon(
    row.retentionScore,
    aggressivenessOffset,
  );
  return Math.round(AVG_SERVICE_TICKET_DOLLARS * (discountPercent / 100));
}

const TIER_REPRESENTATIVE_SCORE: Record<AtlasAiCouponTier, number> = {
  aggressive: 22,
  moderate: 52,
  light: 82,
};

/** Three wizard offers (aggressive / moderate / light bands) for “Customize in Wizard”. */
export function buildAtlasTieredOffers(
  aggressivenessOffset: number,
): Partial<CampaignOffer>[] {
  return (["aggressive", "moderate", "light"] as const).map((tier) => {
    const { discountPercent, label } = computeIntelligentCoupon(
      TIER_REPRESENTATIVE_SCORE[tier],
      aggressivenessOffset,
    );
    return {
      type: "percentage-discount" as const,
      discountPercent,
      title: `Atlas — ${tier} band`,
      description: `Intelligent coupon aligned to ${tier} retention risk`,
      valueLabel: label,
    };
  });
}
