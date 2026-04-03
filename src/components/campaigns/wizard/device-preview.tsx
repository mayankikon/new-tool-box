"use client";

import { useEffect, useMemo } from "react";
import { useBrandProfileOptional } from "@/lib/branding/brand-profile-provider";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Battery,
  Bell,
  Mail,
  MessageSquare,
  Signal,
  Smartphone,
  Wifi,
} from "lucide-react";
import { CouponCardPreview } from "@/components/campaigns/coupon-builder/coupon-card-preview";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CampaignOffer, ImageAttachment } from "@/lib/campaigns/types";

export type DevicePreviewChannel = "sms" | "email" | "push" | "in-app";

/** Default channel set for campaign wizard and message previews. */
export const DEFAULT_DEVICE_PREVIEW_CHANNELS: readonly DevicePreviewChannel[] = [
  "sms",
  "email",
  "push",
  "in-app",
] as const;

interface DevicePreviewProps {
  subject: string;
  body: string;
  images: ImageAttachment[];
  previewChannel: DevicePreviewChannel;
  onChannelChange: (channel: DevicePreviewChannel) => void;
  /** When set, a coupon card is shown in each channel preview */
  attachedOffer?: CampaignOffer | null;
  dealershipDisplayName?: string;
  /**
   * Subset of channels to show as tabs. Defaults to all four (SMS, Email, Push, App).
   * If the current `previewChannel` is not allowed, parent should reset (see effect below).
   */
  allowedChannels?: readonly DevicePreviewChannel[];
  /** When false, only the active `previewChannel` frame is rendered (no tab strip). */
  showChannelTabs?: boolean;
}

const CHANNEL_TABS: {
  value: DevicePreviewChannel;
  label: string;
  icon: typeof MessageSquare;
}[] = [
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "email", label: "Email", icon: Mail },
  { value: "push", label: "Push", icon: Bell },
  { value: "in-app", label: "App", icon: Smartphone },
];

const CONTENT_TRANSITION = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const SF_PRO_FONT_STACK =
  "'SF Pro Text', 'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

function StatusBar() {
  return (
    <div
      className="flex items-center justify-between px-6 py-1.5 text-[11px] font-semibold text-foreground"
      style={{ fontFamily: SF_PRO_FONT_STACK }}
    >
      <span>9:41</span>
      <div className="flex items-center gap-1">
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <Battery className="size-3.5" />
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[280px]">
      <div className="relative overflow-hidden rounded-[2.5rem] border-[3px] border-foreground/20 bg-background shadow-xl">
        <div className="flex justify-center pt-2.5">
          <div className="h-[26px] w-[90px] rounded-full bg-foreground" />
        </div>

        <StatusBar />

        <div className="min-h-[400px]">{children}</div>

        <div className="flex justify-center pb-3 pt-2">
          <div className="h-[5px] w-[120px] rounded-full bg-foreground/20" />
        </div>
      </div>
    </div>
  );
}

function EmptyPlaceholder() {
  return (
    <p className="text-center text-xs italic text-muted-foreground">
      Your message preview will appear here...
    </p>
  );
}

function InlineImages({ images }: { images: ImageAttachment[] }) {
  if (images.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap gap-1">
      {images.map((item) => {
        const src =
          item.kind === "video" && item.gifPreviewUrl
            ? item.gifPreviewUrl
            : item.url;
        const isVideo = item.kind === "video";
        return (
          <div key={item.id} className="relative max-h-[120px] overflow-hidden rounded-sm">
            {isVideo && item.gifPreviewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={src}
                alt={item.name}
                className="max-h-[120px] object-cover"
              />
            ) : isVideo ? (
              <video
                src={item.url}
                className="max-h-[120px] object-cover"
                muted
                playsInline
                loop
                autoPlay
                preload="metadata"
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={src}
                alt={item.name}
                className="max-h-[120px] object-cover"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SmsContent({
  body,
  images,
  attachedOffer,
  dealershipDisplayName,
  dealerName,
}: {
  body: string;
  images: ImageAttachment[];
  attachedOffer?: CampaignOffer | null;
  dealershipDisplayName?: string;
  dealerName: string;
}) {
  return (
    <div className="flex h-full flex-col" style={{ fontFamily: SF_PRO_FONT_STACK }}>
      <div className="border-b border-border/50 px-3 py-2 text-center">
        <p className="text-[11px] font-semibold text-foreground">Messages</p>
        <p className="text-[9px] text-muted-foreground">{dealerName}</p>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-2 p-3">
        {body ? (
          <>
            <div className="flex flex-col items-end gap-2">
              <div className="max-w-[85%] rounded-md rounded-br-xs bg-primary px-3 py-2 shadow-sm">
                <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-primary-foreground">
                  {body}
                </p>
                <InlineImages images={images} />
              </div>
              {attachedOffer ? (
                <div className="w-[85%]">
                  <CouponCardPreview
                    offer={attachedOffer}
                    compact
                    dealershipDisplayName={dealershipDisplayName}
                  />
                </div>
              ) : null}
            </div>
            <p className="text-center text-[9px] text-muted-foreground">
              Today 9:41 AM
            </p>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyPlaceholder />
          </div>
        )}
      </div>

      <div className="border-t border-border/50 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-full border border-border/60 px-3 py-1.5">
            <span className="text-[10px] text-muted-foreground/60">
              iMessage
            </span>
          </div>
          <div className="flex size-6 items-center justify-center rounded-full bg-primary">
            <ArrowUp className="size-3 text-primary-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PushContent({
  subject,
  body,
  images,
  attachedOffer,
  dealershipDisplayName,
  dealerName,
  dealerIconUrl,
}: {
  subject: string;
  body: string;
  images: ImageAttachment[];
  attachedOffer?: CampaignOffer | null;
  dealershipDisplayName?: string;
  dealerName: string;
  dealerIconUrl: string;
}) {
  return (
    <div className="flex h-full flex-col" style={{ fontFamily: SF_PRO_FONT_STACK }}>
      <div className="flex flex-1 flex-col items-center pt-8">
        <p className="text-4xl font-light tracking-tight text-foreground">
          9:41
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Tuesday, March 10
        </p>

        <div className="mt-6 w-full px-3">
          {body ? (
            <div className="rounded-md border border-border/50 bg-card/80 p-3 shadow-md backdrop-blur-sm">
              <div className="mb-1.5 flex items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-xs bg-primary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dealerIconUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                </div>
                <span className="text-[10px] font-semibold text-foreground">
                  {dealerName}
                </span>
                <span className="ml-auto text-[9px] text-muted-foreground">
                  now
                </span>
              </div>
              {subject && (
                <p className="text-[11px] font-semibold text-foreground">
                  {subject}
                </p>
              )}
              <p className="line-clamp-3 whitespace-pre-wrap text-[10px] leading-relaxed text-muted-foreground">
                {body}
              </p>
              {images.length > 0 && (
                <div className="relative max-h-[80px] w-full overflow-hidden rounded-sm">
                  {images[0].kind === "video" && images[0].gifPreviewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={images[0].gifPreviewUrl}
                      alt={images[0].name}
                      className="max-h-[80px] w-full object-cover"
                    />
                  ) : images[0].kind === "video" ? (
                    <video
                      src={images[0].url}
                      className="max-h-[80px] w-full object-cover"
                      muted
                      playsInline
                      loop
                      autoPlay
                      preload="metadata"
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={images[0].url}
                      alt={images[0].name}
                      className="max-h-[80px] w-full object-cover"
                    />
                  )}
                </div>
              )}
              {attachedOffer ? (
                <div className="mt-2">
                  <CouponCardPreview
                    offer={attachedOffer}
                    compact
                    dealershipDisplayName={dealershipDisplayName}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-md border border-dashed border-border/50 p-6">
              <EmptyPlaceholder />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InAppContent({
  attachedOffer,
  dealershipDisplayName,
  dealerName,
}: {
  attachedOffer?: CampaignOffer | null;
  dealershipDisplayName?: string;
  dealerName: string;
}) {
  return (
    <div className="flex h-full flex-col bg-muted/30" style={{ fontFamily: SF_PRO_FONT_STACK }}>
      <div className="border-b border-border/60 bg-card px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-foreground">{dealerName}</span>
          <Smartphone className="size-3.5 text-muted-foreground" />
        </div>
        <p className="text-[9px] text-muted-foreground">Offers for you</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {attachedOffer ? (
          <CouponCardPreview
            offer={attachedOffer}
            dealershipDisplayName={dealershipDisplayName}
          />
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border/60">
            <EmptyPlaceholder />
          </div>
        )}
      </div>
    </div>
  );
}

function EmailFrame({
  subject,
  body,
  images,
  attachedOffer,
  dealershipDisplayName,
  dealerName,
}: {
  subject: string;
  body: string;
  images: ImageAttachment[];
  attachedOffer?: CampaignOffer | null;
  dealershipDisplayName?: string;
  dealerName: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="overflow-hidden rounded-md border border-border/60 bg-card shadow-lg">
        {/* macOS window controls (decorative) */}
        <div className="flex items-center gap-1.5 border-b border-border/40 bg-muted/50 px-3 py-2">
          <div className="size-2.5 rounded-full bg-destructive/60" />
          <div className="size-2.5 rounded-full bg-yellow-500/60" />
          <div className="size-2.5 rounded-full bg-green-500/60" />
          <span className="ml-2 text-[10px] text-muted-foreground">Inbox</span>
        </div>

        <div className="space-y-1 border-b border-border/40 px-4 py-3">
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
              From:
            </span>
            <span className="truncate text-[11px] text-foreground">
              {dealerName} &lt;no-reply@dealership.com&gt;
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
              To:
            </span>
            <span className="truncate text-[11px] text-foreground">
              sarah.johnson@email.com
            </span>
          </div>
          {subject && (
            <div className="flex items-baseline gap-2">
              <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                Subject:
              </span>
              <span className="text-[11px] font-semibold text-foreground">
                {subject}
              </span>
            </div>
          )}
        </div>

        <div className="min-h-[200px] p-4">
          {body ? (
            <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground">
              {body}
            </p>
          ) : null}
          {images.length > 0 ? (
            <div className="mt-1.5">
              <InlineImages images={images} />
            </div>
          ) : null}
          {attachedOffer ? (
            <div className="mt-3 max-w-[280px]">
              <CouponCardPreview
                offer={attachedOffer}
                dealershipDisplayName={dealershipDisplayName}
              />
            </div>
          ) : null}
          {!body && images.length === 0 && !attachedOffer ? (
            <div className="flex min-h-[160px] items-center justify-center">
              <EmptyPlaceholder />
            </div>
          ) : null}
        </div>

        <div className="border-t border-border/40 px-4 py-2.5">
          <p className="text-center text-[8px] text-muted-foreground">
            {dealerName} · 123 Auto Drive · Anytown, US 12345
          </p>
          <p className="mt-0.5 text-center text-[8px] text-muted-foreground underline">
            Unsubscribe
          </p>
        </div>
      </div>
    </div>
  );
}

function tabsListClassForCount(count: number): string {
  if (count <= 2) return "grid w-full grid-cols-2";
  if (count === 3) return "grid w-full grid-cols-3";
  return "grid w-full grid-cols-4";
}

export function DevicePreview({
  subject,
  body,
  images,
  previewChannel,
  onChannelChange,
  attachedOffer,
  dealershipDisplayName,
  allowedChannels = DEFAULT_DEVICE_PREVIEW_CHANNELS,
  showChannelTabs = true,
}: DevicePreviewProps) {
  const brand = useBrandProfileOptional();
  const dealerName = brand?.profile.dealershipName ?? "Your dealership";
  const dealerIconUrl =
    brand?.profile.logomarkUrl?.trim() ||
    brand?.profile.appIconUrl?.trim() ||
    brand?.profile.logoUrl ||
    "/account-logo-placeholder.png";

  const channelTabs = useMemo(() => {
    const allowed = new Set(allowedChannels);
    return CHANNEL_TABS.filter((tab) => allowed.has(tab.value));
  }, [allowedChannels]);

  useEffect(() => {
    const allowed = new Set(allowedChannels);
    if (allowed.has(previewChannel)) return;
    const fallback = channelTabs[0]?.value ?? "sms";
    onChannelChange(fallback);
  }, [allowedChannels, channelTabs, onChannelChange, previewChannel]);

  const previewBody = (
    <AnimatePresence mode="wait">
        <motion.div
          key={previewChannel}
          initial={CONTENT_TRANSITION.initial}
          animate={CONTENT_TRANSITION.animate}
          exit={CONTENT_TRANSITION.exit}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {previewChannel === "email" ? (
            <EmailFrame
              subject={subject}
              body={body}
              images={images}
              attachedOffer={attachedOffer}
              dealershipDisplayName={dealershipDisplayName}
              dealerName={dealerName}
            />
          ) : previewChannel === "in-app" ? (
            <PhoneFrame>
              <InAppContent
                attachedOffer={attachedOffer}
                dealershipDisplayName={dealershipDisplayName}
                dealerName={dealerName}
              />
            </PhoneFrame>
          ) : (
            <PhoneFrame>
              {previewChannel === "sms" ? (
                <SmsContent
                  body={body}
                  images={images}
                  attachedOffer={attachedOffer}
                  dealershipDisplayName={dealershipDisplayName}
                  dealerName={dealerName}
                />
              ) : (
                <PushContent
                  subject={subject}
                  body={body}
                  images={images}
                  attachedOffer={attachedOffer}
                  dealershipDisplayName={dealershipDisplayName}
                  dealerName={dealerName}
                  dealerIconUrl={dealerIconUrl}
                />
              )}
            </PhoneFrame>
          )}
        </motion.div>
      </AnimatePresence>
  );

  if (!showChannelTabs) {
    return <div className="space-y-4">{previewBody}</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={previewChannel}
        onValueChange={(value) => onChannelChange(value as DevicePreviewChannel)}
      >
        <TabsList className={tabsListClassForCount(channelTabs.length)}>
          {channelTabs.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-1.5 px-1 text-xs">
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {previewBody}
    </div>
  );
}
