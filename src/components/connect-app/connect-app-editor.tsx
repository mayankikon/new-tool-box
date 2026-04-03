"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useBrandProfile } from "@/lib/branding/brand-profile-provider";
import {
  BRAND_THEME_PALETTES,
  type BrandThemePreset,
} from "@/lib/branding/brand-profile-types";
import {
  loadCouponLibrary,
} from "@/lib/campaigns/coupon-library-storage";
import type { CampaignOffer } from "@/lib/campaigns/types";
import {
  loadConnectAppConfig,
  updateConnectAppConfig,
  CONNECT_APP_CHANGED_EVENT,
} from "@/lib/connect-app/connect-app-storage";
import {
  resolveConnectFontPreset,
  resolveConnectPalette,
} from "@/lib/connect-app/connect-app-palette";
import type {
  ConnectAppConfig,
  ConnectQuickAction,
  ConnectQuickActionIcon,
  ConnectQuickActionKind,
} from "@/lib/connect-app/connect-app-types";
import { createDefaultConnectAppConfig } from "@/lib/connect-app/connect-app-types";
import { getMediaAssetById } from "@/lib/media/media-library-storage";
import { Button } from "@/components/ui/button";
import {
  Input,
  InputContainer,
  InputGroup,
  InputHelperText,
  InputLabel,
} from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConnectAppPhonePreview } from "@/components/connect-app/connect-app-phone-preview";
import { MediaPickerDialog } from "@/components/media/media-picker-dialog";
import { cn } from "@/lib/utils";

/**
 * Aligns `SelectTrigger` with `Input` size `lg` inside `InputContainer size="lg"` (36px row).
 */
const SELECT_TRIGGER_LG_HEIGHT =
  "box-border !h-9 min-h-9 max-h-9 shrink-0 px-2.5 py-0 text-sm leading-none data-[size=default]:!h-9 data-[size=default]:min-h-9 data-[size=default]:max-h-9";

const SELECT_ROW_CLASS = cn(
  SELECT_TRIGGER_LG_HEIGHT,
  "w-full min-w-0 items-center",
);

const CARD_SURFACE_CLASS =
  "rounded-md border border-sidebar-border bg-sidebar p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

const ICON_OPTIONS: { value: ConnectQuickActionIcon; label: string }[] = [
  { value: "calendar", label: "Calendar" },
  { value: "phone", label: "Phone" },
  { value: "tag", label: "Tag" },
  { value: "map-pin", label: "Map" },
  { value: "wrench", label: "Wrench" },
  { value: "message", label: "Message" },
];

const KIND_OPTIONS: { value: ConnectQuickActionKind; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "coupons", label: "Coupons" },
  { value: "directions", label: "Directions" },
  { value: "service", label: "Service" },
  { value: "message", label: "Message" },
];

const THEME_PRESETS: Exclude<BrandThemePreset, "custom">[] = [
  "red",
  "blue",
  "violet",
  "black",
];

const THEME_PRESET_LABELS: Record<
  Exclude<BrandThemePreset, "custom">,
  string
> = {
  red: "Red",
  blue: "Blue",
  violet: "Violet",
  black: "Black",
};

/**
 * Todoist-style mini chrome: top bar + sidebar accent + list skeleton lines.
 */
function ThemeMiniChromePreview({
  preset,
}: {
  preset: Exclude<BrandThemePreset, "custom">;
}) {
  const pal = BRAND_THEME_PALETTES[preset];
  const isBlack = preset === "black";

  return (
    <div
      className="relative h-[76px] w-[56px] shrink-0 overflow-hidden rounded-lg border border-black/[0.08] shadow-sm"
      style={{
        /* Black preset: ink body inside the chip so the theme still reads as “dark” on a light parent card. */
        backgroundColor: isBlack ? "#0a0a0a" : pal.surface,
      }}
    >
      <div
        className="h-[22px] w-full shrink-0"
        style={{ backgroundColor: pal.navBar }}
      />
      <div className="flex gap-1 p-1">
        <div
          className="w-2 shrink-0 rounded-sm"
          style={{ backgroundColor: pal.primary }}
          aria-hidden
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center gap-1 py-0.5">
          <div
            className={cn(
              "h-1 w-full max-w-full rounded-sm",
              isBlack ? "bg-white/22" : "bg-foreground/16",
            )}
          />
          <div
            className={cn(
              "h-1 w-4/5 rounded-sm",
              isBlack ? "bg-white/14" : "bg-foreground/11",
            )}
          />
          <div
            className={cn(
              "h-1 w-3/5 rounded-sm",
              isBlack ? "bg-white/10" : "bg-foreground/8",
            )}
          />
        </div>
      </div>
    </div>
  );
}

function ThemePresetChoice({
  preset,
  selected,
  onSelect,
}: {
  preset: Exclude<BrandThemePreset, "custom">;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full gap-3 rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-background shadow-md ring-1 ring-primary/20"
          : "border-border/80 bg-muted/25 hover:border-muted-foreground/30 hover:bg-muted/40",
      )}
    >
      <ThemeMiniChromePreview preset={preset} />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-tight tracking-tight text-neutral-950 dark:text-neutral-100">
            {THEME_PRESET_LABELS[preset]}
          </span>
          {selected ? (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Check className="size-3" strokeWidth={2.5} aria-hidden />
            </span>
          ) : (
            <span
              className="size-5 shrink-0 rounded-full border-2 border-muted-foreground/40 bg-transparent"
              aria-hidden
            />
          )}
        </div>
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="h-1 w-full rounded-full bg-muted-foreground/18" />
          <div className="h-1 w-2/3 rounded-full bg-muted-foreground/12" />
        </div>
      </div>
    </button>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:justify-between lg:items-start">
      <header className="min-w-0 space-y-1.5">
        <h2 className="text-base font-medium leading-snug text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </header>
      <div className="min-w-0 w-full space-y-4">{children}</div>
    </div>
  );
}

export function ConnectAppEditor({
  className,
  topBar,
}: {
  className?: string;
  topBar: React.ReactNode;
}) {
  const baseId = useId();
  const { profile } = useBrandProfile();
  const [config, setConfig] = useState<ConnectAppConfig>(() =>
    loadConnectAppConfig(),
  );
  const [picker, setPicker] = useState<
    "hero" | "gallery" | "these-vehicles" | null
  >(null);

  const sync = useCallback(() => {
    setConfig(loadConnectAppConfig());
  }, []);

  useEffect(() => {
    window.addEventListener(CONNECT_APP_CHANGED_EVENT, sync);
    return () => window.removeEventListener(CONNECT_APP_CHANGED_EVENT, sync);
  }, [sync]);

  const setPartial = useCallback((patch: Partial<ConnectAppConfig>) => {
    setConfig(updateConnectAppConfig(patch));
  }, []);

  const palette = useMemo(
    () => resolveConnectPalette(config, profile),
    [config, profile],
  );
  const fontPreset = useMemo(
    () => resolveConnectFontPreset(config, profile),
    [config, profile],
  );

  const promotionOffers: CampaignOffer[] = useMemo(() => {
    const lib = loadCouponLibrary();
    if (config.promotionRefs.length === 0) {
      return lib.slice(0, 3);
    }
    const byId = new Map(lib.map((o) => [o.id, o]));
    return config.promotionRefs
      .map((r) => (r.couponId ? byId.get(r.couponId) : undefined))
      .filter((o): o is CampaignOffer => o != null);
  }, [config.promotionRefs]);

  const galleryUrls = useMemo(() => {
    return config.galleryMediaIds
      .map((id) => getMediaAssetById(id)?.url)
      .filter((u): u is string => Boolean(u));
  }, [config.galleryMediaIds]);

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        className,
      )}
    >
      <div className="shrink-0 pt-6">{topBar}</div>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-8 pl-[32px] pr-8 pt-6">
        <div className="ml-0 flex w-full max-w-[1852px] flex-col gap-8 xl:flex-row xl:items-start">
          <div className="min-w-0 w-full space-y-6 xl:basis-0 xl:flex-[7]">
            <section className={cn(CARD_SURFACE_CLASS, "w-full min-w-0")}>
              <div className="flex flex-col gap-12">
                <FormSection
                  title="Theme Override"
                  description="Choose a storefront color theme for the preview. This does not change Brand Profile settings."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {THEME_PRESETS.map((preset) => (
                      <ThemePresetChoice
                        key={preset}
                        preset={preset}
                        selected={
                          config.themeOverride?.themePreset === preset
                        }
                        onSelect={() =>
                          setPartial({
                            themeOverride: {
                              ...config.themeOverride,
                              themePreset: preset,
                            },
                          })
                        }
                      />
                    ))}
                  </div>
                </FormSection>

                <FormSection
                  title="Storefront Hero"
                  description="One background cover—image or video—at the top of the home screen. Upload or pick from the library; there is no hero carousel. Use Your Service Community below for multiple images."
                >
                  <div className="flex flex-wrap gap-2">
                    {(["image", "video"] as const).map((mode) => {
                      return (
                        <Button
                          key={mode}
                          type="button"
                          size="sm"
                          variant={
                            config.heroMode === mode ? "default" : "outline"
                          }
                          onClick={() =>
                            setPartial({
                              heroMode: mode,
                              ...(mode === "image"
                                ? { heroVideoUrl: undefined }
                                : { heroImageUrl: undefined }),
                            })
                          }
                        >
                          {mode === "image" ? "Image" : "Video"}
                        </Button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setPicker("hero")}
                    >
                      Pick From Library
                    </Button>
                  </div>
                  {config.heroMode === "image" && config.heroImageUrl ? (
                    <InputHelperText className="truncate">
                      {config.heroImageUrl.slice(0, 60)}…
                    </InputHelperText>
                  ) : null}
                  {config.heroMode === "video" && config.heroVideoUrl ? (
                    <InputHelperText className="truncate">
                      {config.heroVideoUrl.slice(0, 60)}…
                    </InputHelperText>
                  ) : null}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputGroup className="group">
                      <InputLabel htmlFor={`${baseId}-welcome-headline`}>
                        Welcome Headline
                      </InputLabel>
                      <InputContainer size="lg">
                        <Input
                          id={`${baseId}-welcome-headline`}
                          standalone={false}
                          size="lg"
                          value={config.welcomeHeadline}
                          onChange={(e) =>
                            setPartial({ welcomeHeadline: e.target.value })
                          }
                        />
                      </InputContainer>
                    </InputGroup>
                    <InputGroup className="group sm:col-span-2">
                      <InputLabel htmlFor={`${baseId}-welcome-subtext`}>
                        Welcome Subtext
                      </InputLabel>
                      <Textarea
                        id={`${baseId}-welcome-subtext`}
                        value={config.welcomeSubtext}
                        onChange={(e) =>
                          setPartial({ welcomeSubtext: e.target.value })
                        }
                        rows={2}
                      />
                    </InputGroup>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setPicker("these-vehicles")}
                    >
                      These Vehicles Image
                    </Button>
                    {config.theseVehiclesImageUrl?.trim() ? (
                      <InputHelperText className="max-w-full truncate">
                        {config.theseVehiclesImageUrl.slice(0, 72)}
                        …
                      </InputHelperText>
                    ) : (
                      <InputHelperText>
                        Defaults to the first inventory vehicle photo (same URLs as
                        the map / list). Pick a custom image to override.
                      </InputHelperText>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${baseId}-hero-logo`}
                      checked={config.showDealerLogoOnHero}
                      onCheckedChange={(v) =>
                        setPartial({ showDealerLogoOnHero: v })
                      }
                    />
                    <Label htmlFor={`${baseId}-hero-logo`}>
                      Show dealer logo on hero
                    </Label>
                  </div>
                </FormSection>

                <FormSection
                  title="Quick Actions"
                  description="Shortcut row on the home screen."
                >
                  <div className="space-y-4">
                    {config.quickActions.map((action, index) => (
                      <div
                        key={action.id}
                        className="grid gap-4 rounded-md border border-sidebar-border bg-background/50 p-4 sm:grid-cols-2"
                      >
                        <InputGroup className="group">
                          <InputLabel htmlFor={`${action.id}-label`}>
                            Label
                          </InputLabel>
                          <InputContainer size="lg">
                            <Input
                              id={`${action.id}-label`}
                              standalone={false}
                              size="lg"
                              value={action.label}
                              onChange={(e) => {
                                const next = [...config.quickActions];
                                next[index] = {
                                  ...action,
                                  label: e.target.value,
                                };
                                setPartial({ quickActions: next });
                              }}
                            />
                          </InputContainer>
                        </InputGroup>
                        <InputGroup className="group">
                          <InputLabel htmlFor={`${action.id}-icon`}>
                            Icon
                          </InputLabel>
                          <Select
                            value={action.icon}
                            items={ICON_OPTIONS}
                            onValueChange={(v) => {
                              const next = [...config.quickActions];
                              next[index] = {
                                ...action,
                                icon: v as ConnectQuickActionIcon,
                              };
                              setPartial({ quickActions: next });
                            }}
                          >
                            <SelectTrigger
                              size="default"
                              className={SELECT_ROW_CLASS}
                              id={`${action.id}-icon`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ICON_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </InputGroup>
                        <InputGroup className="group sm:col-span-2">
                          <InputLabel htmlFor={`${action.id}-kind`}>
                            Action
                          </InputLabel>
                          <Select
                            value={action.kind}
                            items={KIND_OPTIONS}
                            onValueChange={(v) => {
                              const next = [...config.quickActions];
                              next[index] = {
                                ...action,
                                kind: v as ConnectQuickActionKind,
                              };
                              setPartial({ quickActions: next });
                            }}
                          >
                            <SelectTrigger
                              size="default"
                              className={SELECT_ROW_CLASS}
                              id={`${action.id}-kind`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {KIND_OPTIONS.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </InputGroup>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="sm:col-span-2"
                          onClick={() =>
                            setPartial({
                              quickActions: config.quickActions.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    {config.quickActions.length < 5 ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const next: ConnectQuickAction = {
                            id: `qa-${Date.now()}`,
                            icon: "wrench",
                            label: "New action",
                            kind: "call",
                          };
                          setPartial({
                            quickActions: [...config.quickActions, next],
                          });
                        }}
                      >
                        <Plus className="mr-1 size-4" />
                        Add action
                      </Button>
                    ) : null}
                  </div>
                </FormSection>

                <FormSection
                  title="Promotions"
                  description="Link saved coupons from your library."
                >
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${baseId}-promo-en`}
                      checked={config.promotionsEnabled}
                      onCheckedChange={(v) =>
                        setPartial({ promotionsEnabled: v })
                      }
                    />
                    <Label htmlFor={`${baseId}-promo-en`}>
                      Show Promotions
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const lib = loadCouponLibrary();
                      const first = lib[0];
                      if (!first) return;
                      setPartial({
                        promotionRefs: [
                          ...config.promotionRefs,
                          { id: `pr-${Date.now()}`, couponId: first.id },
                        ],
                      });
                    }}
                  >
                    Add Coupon From Library
                  </Button>
                  <ul className="text-xs text-muted-foreground">
                    {config.promotionRefs.map((r) => (
                      <li key={r.id} className="flex justify-between gap-2">
                        <span>Coupon: {r.couponId ?? "—"}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-6 px-1 text-destructive"
                          onClick={() =>
                            setPartial({
                              promotionRefs: config.promotionRefs.filter(
                                (x) => x.id !== r.id,
                              ),
                            })
                          }
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                  </ul>
                </FormSection>

                <FormSection
                  title="Your Service Community"
                  description="Image carousel below Special Offers in the preview. Independent from the storefront hero. Turn on to show it; hero image is unchanged when this is off."
                >
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${baseId}-gal-en`}
                      checked={config.galleryEnabled}
                      onCheckedChange={(v) =>
                        setPartial({ galleryEnabled: v })
                      }
                    />
                    <Label htmlFor={`${baseId}-gal-en`}>Show Gallery</Label>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setPicker("gallery")}
                  >
                    Browse Media
                  </Button>
                  <InputHelperText>
                    {config.galleryMediaIds.length} asset(s) selected
                  </InputHelperText>
                </FormSection>
              </div>
            </section>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                updateConnectAppConfig(createDefaultConnectAppConfig());
                setConfig(loadConnectAppConfig());
              }}
            >
              Reset To Defaults
            </Button>
          </div>

          <div className="sticky top-6 flex w-full min-w-0 justify-center self-start px-1 xl:basis-0 xl:flex-[3] xl:px-2">
            <ConnectAppPhonePreview
              config={config}
              profile={profile}
              palette={palette}
              fontPreset={fontPreset}
              promotionOffers={promotionOffers}
              galleryUrls={galleryUrls}
            />
          </div>
        </div>
      </div>

      <MediaPickerDialog
        open={picker != null}
        onOpenChange={(o) => !o && setPicker(null)}
        kindFilter={
          config.heroMode === "video" && picker === "hero"
            ? "video"
            : "image"
        }
        multiple={picker === "gallery"}
        uploadCategory="connect-assets"
        onSelect={(assets) => {
          const urls = assets.map((a) => a.url);
          if (picker === "hero") {
            if (config.heroMode === "video") {
              setPartial({ heroVideoUrl: urls[0], heroImageUrl: undefined });
            } else {
              setPartial({
                heroImageUrl: urls[0],
                heroVideoUrl: undefined,
                heroMode: "image",
              });
            }
          } else if (picker === "gallery") {
            setPartial({
              galleryMediaIds: [
                ...new Set([
                  ...config.galleryMediaIds,
                  ...assets.map((a) => a.id),
                ]),
              ],
            });
          } else if (picker === "these-vehicles") {
            setPartial({ theseVehiclesImageUrl: urls[0] });
          }
          setPicker(null);
        }}
        title={
          picker === "gallery"
            ? "Your Service Community"
            : picker === "these-vehicles"
              ? "These Vehicles Image"
              : "Choose Hero Media"
        }
      />
    </div>
  );
}
