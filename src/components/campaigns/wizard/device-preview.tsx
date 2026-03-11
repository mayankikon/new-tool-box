"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Battery,
  Bell,
  Mail,
  MessageSquare,
  Signal,
  Wifi,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ImageAttachment } from "@/lib/campaigns/types";

interface DevicePreviewProps {
  subject: string;
  body: string;
  images: ImageAttachment[];
  previewChannel: "sms" | "email" | "push";
  onChannelChange: (channel: "sms" | "email" | "push") => void;
}

const CHANNEL_TABS = [
  { value: "sms" as const, label: "SMS", icon: MessageSquare },
  { value: "email" as const, label: "Email", icon: Mail },
  { value: "push" as const, label: "Push", icon: Bell },
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
}: {
  body: string;
  images: ImageAttachment[];
}) {
  return (
    <div className="flex h-full flex-col" style={{ fontFamily: SF_PRO_FONT_STACK }}>
      <div className="border-b border-border/50 px-3 py-2 text-center">
        <p className="text-[11px] font-semibold text-foreground">Messages</p>
        <p className="text-[9px] text-muted-foreground">AutoNation Toyota</p>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-2 p-3">
        {body ? (
          <>
            <div className="flex justify-end">
              <div className="max-w-[85%] rounded-md rounded-br-xs bg-primary px-3 py-2 shadow-sm">
                <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-primary-foreground">
                  {body}
                </p>
                <InlineImages images={images} />
              </div>
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
}: {
  subject: string;
  body: string;
  images: ImageAttachment[];
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
                <div className="flex size-5 items-center justify-center rounded-xs bg-primary">
                  <Bell className="size-3 text-primary-foreground" />
                </div>
                <span className="text-[10px] font-semibold text-foreground">
                  AutoNation Toyota
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

function EmailFrame({
  subject,
  body,
  images,
}: {
  subject: string;
  body: string;
  images: ImageAttachment[];
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
              AutoNation Toyota &lt;no-reply@autonation.com&gt;
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
          {!body && images.length === 0 ? (
            <div className="flex min-h-[160px] items-center justify-center">
              <EmptyPlaceholder />
            </div>
          ) : null}
        </div>

        <div className="border-t border-border/40 px-4 py-2.5">
          <p className="text-center text-[8px] text-muted-foreground">
            AutoNation Toyota · 123 Auto Drive · Anytown, US 12345
          </p>
          <p className="mt-0.5 text-center text-[8px] text-muted-foreground underline">
            Unsubscribe
          </p>
        </div>
      </div>
    </div>
  );
}

export function DevicePreview({
  subject,
  body,
  images,
  previewChannel,
  onChannelChange,
}: DevicePreviewProps) {
  return (
    <div className="space-y-4">
      <Tabs
        value={previewChannel}
        onValueChange={(value) =>
          onChannelChange(value as "sms" | "email" | "push")
        }
      >
        <TabsList className="w-full">
          {CHANNEL_TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="flex-1 gap-1.5">
              <Icon className="size-3.5" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <AnimatePresence mode="wait">
        <motion.div
          key={previewChannel}
          initial={CONTENT_TRANSITION.initial}
          animate={CONTENT_TRANSITION.animate}
          exit={CONTENT_TRANSITION.exit}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {previewChannel === "email" ? (
            <EmailFrame subject={subject} body={body} images={images} />
          ) : (
            <PhoneFrame>
              {previewChannel === "sms" ? (
                <SmsContent body={body} images={images} />
              ) : (
                <PushContent subject={subject} body={body} images={images} />
              )}
            </PhoneFrame>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
