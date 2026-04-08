"use client";

/**
 * Compact coupon strip used in Brand Profile and Customization live previews.
 * Matches customer-facing coupon chrome (primary bar + CTA).
 */
export function MiniCouponStrip({
  palette,
  logoUrl,
  dealershipName,
}: {
  palette: { primary: string; secondary: string };
  logoUrl: string;
  dealershipName: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 shadow-sm">
      <div
        className="flex items-center justify-between px-2 py-1.5 text-[8px] text-white"
        style={{ backgroundColor: palette.primary }}
      >
        <span className="rounded bg-white/20 px-1 py-0.5 text-[7px] font-semibold uppercase">
          Service
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt="" className="h-3 max-w-[3rem] object-contain" />
      </div>
      <div className="bg-card px-2 py-1.5 text-[8px]">
        <p className="font-medium text-foreground">$25 off</p>
        <p className="text-muted-foreground">{dealershipName}</p>
        <div
          className="mt-1 rounded px-1.5 py-0.5 text-center text-[7px] font-medium text-white"
          style={{ backgroundColor: palette.secondary }}
        >
          Book now
        </div>
      </div>
    </div>
  );
}
