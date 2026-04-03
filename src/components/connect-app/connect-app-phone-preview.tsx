"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Battery,
  Calendar,
  Home,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Percent,
  Phone,
  Search,
  Signal,
  Tag,
  Wifi,
  Wrench,
} from "lucide-react";
import type { DealerBrandProfile, FontPreset } from "@/lib/branding/brand-profile-types";
import type { ResolvedBrandPalette } from "@/lib/branding/brand-profile-types";
import type { ConnectAppConfig } from "@/lib/connect-app/connect-app-types";
import type { ConnectQuickActionIcon } from "@/lib/connect-app/connect-app-types";
import { sanitizeConnectQuickActions } from "@/lib/connect-app/connect-app-types";
import { CouponCardPreview } from "@/components/campaigns/coupon-builder/coupon-card-preview";
import type { CampaignOffer } from "@/lib/campaigns/types";
import {
  DEFAULT_CONNECT_PREVIEW_VEHICLE_IMAGE_ALT,
  DEFAULT_CONNECT_PREVIEW_VEHICLE_IMAGE_SRC,
} from "@/lib/inventory/vehicle-list-data";
import { cn } from "@/lib/utils";

/** Storefront preview uses Onest (see root `layout.tsx` `--font-onest`). */
const ONEST_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-onest), system-ui, sans-serif",
};

function QuickIcon({ name }: { name: ConnectQuickActionIcon }) {
  const className = "size-3.5 shrink-0";
  switch (name) {
    case "calendar":
      return <Calendar className={className} />;
    case "phone":
      return <Phone className={className} />;
    case "tag":
      return <Tag className={className} />;
    case "map-pin":
      return <MapPin className={className} />;
    case "wrench":
      return <Wrench className={className} />;
    case "message":
      return <MessageSquare className={className} />;
    default:
      return <Tag className={className} />;
  }
}

export function ConnectAppPhonePreview({
  config,
  profile,
  palette,
  fontPreset: _fontPreset,
  promotionOffers,
  galleryUrls,
}: {
  config: ConnectAppConfig;
  profile: DealerBrandProfile;
  palette: ResolvedBrandPalette;
  /** Retained for API compatibility; storefront chrome uses Onest. */
  fontPreset: FontPreset;
  promotionOffers: CampaignOffer[];
  galleryUrls: string[];
}) {
  const [gallerySlideIndex, setGallerySlideIndex] = useState(0);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const firstCouponMeasureRef = useRef<HTMLDivElement>(null);
  const secondCouponMeasureRef = useRef<HTMLDivElement>(null);
  const [firstCouponHeightPx, setFirstCouponHeightPx] = useState(0);
  const [secondCouponNaturalHeightPx, setSecondCouponNaturalHeightPx] =
    useState(0);

  useLayoutEffect(() => {
    const firstEl = firstCouponMeasureRef.current;
    const secondEl = secondCouponMeasureRef.current;
    if (promotionOffers.length < 2) {
      setFirstCouponHeightPx(0);
      setSecondCouponNaturalHeightPx(0);
      return;
    }

    const measure = () => {
      setFirstCouponHeightPx(firstEl?.offsetHeight ?? 0);
      setSecondCouponNaturalHeightPx(secondEl?.offsetHeight ?? 0);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (firstEl) ro.observe(firstEl);
    if (secondEl) ro.observe(secondEl);
    return () => ro.disconnect();
  }, [promotionOffers]);

  const secondCouponScaleDown =
    promotionOffers.length >= 2 &&
    firstCouponHeightPx > 0 &&
    secondCouponNaturalHeightPx > 0
      ? Math.min(1, firstCouponHeightPx / secondCouponNaturalHeightPx)
      : 1;

  /** Single storefront hero still image (cover); video uses `heroVideoUrl` instead. */
  const heroStillImageUrl =
    config.heroMode !== "video"
      ? config.heroImageUrl?.trim() || undefined
      : undefined;

  useLayoutEffect(() => {
    const el = galleryScrollRef.current;
    if (el) {
      el.scrollLeft = 0;
    }
    setGallerySlideIndex(0);
  }, [galleryUrls]);

  useEffect(() => {
    setGallerySlideIndex((i) =>
      galleryUrls.length === 0 ? 0 : Math.min(i, galleryUrls.length - 1),
    );
  }, [galleryUrls.length]);

  useEffect(() => {
    if (galleryUrls.length <= 1) return;
    const t = window.setInterval(() => {
      const el = galleryScrollRef.current;
      if (!el) return;
      setGallerySlideIndex((i) => {
        const next = (i + 1) % galleryUrls.length;
        const w = el.clientWidth;
        if (w > 0) {
          el.scrollTo({ left: next * w, behavior: "smooth" });
        }
        return next;
      });
    }, 4000);
    return () => clearInterval(t);
  }, [galleryUrls.length]);

  const navIcon =
    profile.appIconUrl?.trim() ||
    profile.logomarkUrl?.trim() ||
    profile.logoUrl;

  /** Tab bar sits on theme primary; active = full white, inactive = muted gray-white on both icon + label. */
  const tabBarBackgroundColor = palette.primary;
  const tabBarActiveColor = "#ffffff";
  const tabBarInactiveColor = "rgba(255,255,255,0.55)";

  const theseVehiclesSrc =
    config.theseVehiclesImageUrl?.trim() ||
    DEFAULT_CONNECT_PREVIEW_VEHICLE_IMAGE_SRC;
  const theseVehiclesAlt = config.theseVehiclesImageUrl?.trim()
    ? ""
    : DEFAULT_CONNECT_PREVIEW_VEHICLE_IMAGE_ALT;

  const previewQuickActions = useMemo(
    () => sanitizeConnectQuickActions(config.quickActions),
    [config.quickActions],
  );

  const hasHeroMedia =
    Boolean(heroStillImageUrl) ||
    (config.heroMode === "video" && Boolean(config.heroVideoUrl));

  return (
    <div className="mx-auto w-[300px]">
      <div
        className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-foreground/20 bg-background shadow-xl"
        style={{ ...ONEST_STYLE }}
      >
        {/* iPhone-style status area: theme color + Dynamic Island + time / signal / Wi‑Fi / battery */}
        <div
          className="shrink-0"
          style={{
            backgroundColor: palette.primary,
            color: palette.primaryForeground,
          }}
        >
          <div className="flex justify-center pt-2.5">
            <div
              className="h-[26px] w-[90px] rounded-full bg-black/38"
              aria-hidden
            />
          </div>
          <div className="flex items-center justify-between px-5 py-1.5 text-[11px] font-semibold tabular-nums">
            <span>9:41</span>
            <div
              className="flex items-center gap-1.5 opacity-[0.95]"
              aria-hidden
            >
              <Signal className="size-3.5" strokeWidth={2.25} />
              <Wifi className="size-3.5" strokeWidth={2.25} />
              <Battery className="size-3.5" strokeWidth={2.25} />
            </div>
          </div>
        </div>

        <div className="flex min-h-[520px] flex-col text-[#111]">
          <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {/* Hero stack; vehicle is rendered in a top overlay after the sheet so z-index wins over the sheet */}
            <div className="relative overflow-visible">
              <div className="relative z-0 min-h-[220px] w-full overflow-visible">
              {config.heroMode === "video" && config.heroVideoUrl ? (
                <video
                  src={config.heroVideoUrl}
                  className="absolute inset-0 h-full w-full object-cover"
                  muted
                  playsInline
                  loop
                  autoPlay
                  controls={false}
                />
              ) : heroStillImageUrl ? (
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroStillImageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(165deg, ${palette.surface} 0%, ${palette.accent} 100%)`,
                  }}
                />
              )}

              {/* Theme tint over cover */}
              {hasHeroMedia ? (
                <div
                  className="pointer-events-none absolute inset-0 z-[1]"
                  style={{
                    backgroundColor: palette.primary,
                    opacity: 0.42,
                    mixBlendMode: "multiply",
                  }}
                />
              ) : (
                <div
                  className="pointer-events-none absolute inset-0 z-[1] bg-black/10"
                />
              )}
              <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/35 via-transparent to-black/25" />

              {/* Top: dealership mark + search */}
              <div className="absolute left-0 right-0 top-0 z-10 flex items-start justify-between gap-2 px-3 pt-3">
                {config.showDealerLogoOnHero !== false ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={navIcon}
                    alt=""
                    className="size-9 shrink-0 rounded-xl bg-white/95 object-contain p-1 shadow-sm ring-1 ring-black/5"
                  />
                ) : (
                  <span className="size-9 shrink-0" />
                )}
                <button
                  type="button"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-white shadow-sm backdrop-blur-sm"
                  aria-label="Search"
                >
                  <Search className="size-4" strokeWidth={2.25} />
                </button>
              </div>

              {/* Headline + dealership name (narrower width so copy clears the vehicle on the right) */}
              <div className="absolute bottom-0 left-0 z-10 max-w-[62%] px-4 pb-10 pt-6">
                <h2 className="text-[22px] font-bold leading-[1.15] tracking-tight text-white drop-shadow-sm">
                  {config.welcomeHeadline}
                </h2>
                <p className="mt-1.5 text-[13px] font-semibold text-white/95">
                  {profile.dealershipName}
                </p>
                {config.welcomeSubtext?.trim() ? (
                  <p className="mt-1 text-[11px] leading-snug text-white/85">
                    {config.welcomeSubtext}
                  </p>
                ) : null}
              </div>
              </div>
            </div>

            {/* Sheet: overlaps hero */}
            <div className="relative z-10 -mt-9 rounded-t-[1.75rem] border border-border/30 bg-background px-3 pb-4 pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.06)]">
              {/* Quick actions */}
              {previewQuickActions.length > 0 ? (
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {previewQuickActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[9px] font-semibold text-white shadow-sm"
                      style={{ backgroundColor: palette.primary }}
                    >
                      <QuickIcon name={action.icon} />
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Coupon carousel */}
              {config.promotionsEnabled && promotionOffers.length > 0 ? (
                <div className="mt-2">
                  <p className="mb-2 text-[13px] font-semibold text-foreground">
                    Special offers
                  </p>
                  <div
                    className="flex touch-pan-x gap-2.5 overflow-x-auto overflow-y-visible pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin] snap-x snap-mandatory"
                    role="region"
                    aria-label="Special offers carousel"
                    style={{ scrollPaddingInline: "0.25rem" }}
                  >
                    {promotionOffers.slice(0, 4).map((offer, index) => (
                      <div
                        key={offer.id}
                        className="flex w-[240px] max-w-[calc(100%-1.25rem)] shrink-0 snap-start items-start justify-center overflow-hidden"
                      >
                        {index === 1 ? (
                          /* Scale does not shrink layout box; clip to first card height so no gap before gallery. */
                          <div
                            className="w-full overflow-hidden"
                            style={{
                              height:
                                firstCouponHeightPx > 0
                                  ? firstCouponHeightPx
                                  : undefined,
                              maxHeight:
                                firstCouponHeightPx > 0
                                  ? firstCouponHeightPx
                                  : undefined,
                            }}
                          >
                            <div
                              className="w-full origin-top"
                              style={{
                                transform:
                                  secondCouponScaleDown < 1
                                    ? `scale(${secondCouponScaleDown})`
                                    : undefined,
                                transformOrigin: "top center",
                              }}
                            >
                              <div
                                ref={secondCouponMeasureRef}
                                className="w-full"
                              >
                                <CouponCardPreview
                                  offer={offer}
                                  compact
                                  className="max-h-full min-h-0 w-full overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
                                  dealershipDisplayName={profile.dealershipName}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            ref={
                              index === 0 ? firstCouponMeasureRef : undefined
                            }
                            className="w-full"
                          >
                            <CouponCardPreview
                              offer={offer}
                              compact
                              className="max-h-full min-h-0 w-full overflow-hidden rounded-lg shadow-sm ring-1 ring-black/5"
                              dealershipDisplayName={profile.dealershipName}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Your service community — gallery carousel (independent of hero image) */}
              {config.galleryEnabled && galleryUrls.length > 0 ? (
                <div className="mt-8">
                  <p className="mb-2 text-[13px] font-semibold text-foreground">
                    Your service community
                  </p>
                  <div className="relative overflow-hidden rounded-xl border border-border/50 bg-muted/15">
                    <div
                      ref={galleryScrollRef}
                      role="region"
                      aria-label="Your service community gallery"
                      className={cn(
                        "flex w-full overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch]",
                        "snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                        galleryUrls.length > 1 ? "touch-pan-x" : "",
                      )}
                      onScroll={(e) => {
                        const scroller = e.currentTarget;
                        if (galleryUrls.length <= 1) return;
                        const w = scroller.clientWidth;
                        if (w <= 0) return;
                        const idx = Math.round(scroller.scrollLeft / w);
                        const clamped = Math.min(
                          Math.max(0, idx),
                          galleryUrls.length - 1,
                        );
                        setGallerySlideIndex((prev) =>
                          prev === clamped ? prev : clamped,
                        );
                      }}
                    >
                      {galleryUrls.map((url, i) => (
                        <div
                          key={`${i}-${url.slice(0, 48)}`}
                          className="w-full shrink-0 snap-start snap-always"
                          style={{ flex: "0 0 100%" }}
                        >
                          <div className="relative aspect-[16/10] w-full">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt=""
                              className="size-full object-cover"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    {galleryUrls.length > 1 ? (
                      <div className="flex justify-center gap-1.5 py-2">
                        {galleryUrls.map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            aria-label={`Community image ${i + 1}`}
                            className={cn(
                              "size-1.5 rounded-full transition-colors",
                              i === gallerySlideIndex
                                ? "bg-foreground"
                                : "bg-foreground/20",
                            )}
                            onClick={() => {
                              const el = galleryScrollRef.current;
                              if (!el) return;
                              const w = el.clientWidth;
                              el.scrollTo({
                                left: i * w,
                                behavior: "smooth",
                              });
                              setGallerySlideIndex(i);
                            }}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Vehicle sits in the hero ↔ sheet overlap (-mt-9 ≈ 36px); sibling z above sheet */}
            {theseVehiclesSrc ? (
              <div
                className="pointer-events-none absolute left-0 right-0 top-0 z-[25] h-[220px] overflow-visible"
                aria-hidden
              >
                <div className="absolute bottom-5 right-1 w-[58%] max-w-[178px] origin-bottom-right -translate-x-1 translate-y-4 scale-[0.6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={theseVehiclesSrc}
                    alt={theseVehiclesAlt}
                    className="h-auto w-full object-contain object-bottom drop-shadow-[0_12px_24px_rgba(0,0,0,0.38)]"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {/* Floating tab bar — fills with theme primary; active tab white, inactive gray-white */}
          <div className="shrink-0 px-2 pb-1 pt-1">
            <nav
              className="flex items-center justify-around rounded-full px-1 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.22)]"
              style={{ backgroundColor: tabBarBackgroundColor }}
              aria-label="Primary"
            >
              {[
                { label: "Home", Icon: Home },
                { label: "Services", Icon: Wrench },
                { label: "Offers", Icon: Percent },
                { label: "More", Icon: MoreHorizontal },
              ].map(({ label, Icon }, i) => {
                const isActive = i === config.activeTabIndex;
                return (
                  <button
                    key={label}
                    type="button"
                    className="flex flex-col items-center gap-0.5 px-2 py-0.5 transition-colors duration-150"
                    style={{
                      color: isActive ? tabBarActiveColor : tabBarInactiveColor,
                    }}
                  >
                    <Icon className="size-4" strokeWidth={2.25} />
                    <span className="text-[8px] font-semibold">{label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex justify-center pb-2 pt-0.5">
            <div className="h-[5px] w-[120px] rounded-full bg-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}
