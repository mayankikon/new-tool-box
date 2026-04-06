"use client";

import { useCallback, useId } from "react";
import { Bell } from "lucide-react";
import { BRAND_IDENTITY_SAMPLES } from "@/lib/branding/brand-identity-samples";
import {
  BRAND_THEME_PALETTES,
  DEFAULT_DEALERSHIP_LOGO_SRC,
  FONT_PRESET_LABELS,
  TONE_PROFILE_EXAMPLES,
  TONE_PROFILE_LABELS,
  type BrandThemePreset,
  type FontPreset,
  type ResolvedBrandPalette,
  type ToneProfile,
} from "@/lib/branding/brand-profile-types";
import { useBrandProfile } from "@/lib/branding/brand-profile-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUploadArea } from "@/components/ui/file-upload-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const THEME_PRESET_ORDER: Exclude<BrandThemePreset, "custom">[] = [
  "red",
  "blue",
  "violet",
  "black",
];

const THEME_LABELS: Record<Exclude<BrandThemePreset, "custom">, string> = {
  red: "Red",
  blue: "Blue",
  violet: "Violet",
  black: "Black",
};

/** Circle swatch in the theme grid: black preset shows mostly gray with an ink slice (matches other chips). */
function themePresetSwatchBackground(
  preset: Exclude<BrandThemePreset, "custom">,
  pal: ResolvedBrandPalette,
): string {
  if (preset === "black") {
    return "linear-gradient(135deg, #E4E4E7 0%, #D4D4D8 42%, #27272A 42%, #0A0A0A 100%)";
  }
  return `linear-gradient(135deg, ${pal.primary} 50%, ${pal.secondary} 50%)`;
}

const FONT_PRESETS: FontPreset[] = [
  "modern-sans",
  "classic-serif",
  "bold-impact",
  "clean-geometric",
];

const FONT_PREVIEW_STYLE: Record<FontPreset, React.CSSProperties> = {
  "modern-sans": {
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
  },
  "classic-serif": {
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  "bold-impact": {
    fontFamily: "var(--font-saira), ui-sans-serif, system-ui, sans-serif",
    fontWeight: 700,
  },
  "clean-geometric": {
    fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    fontWeight: 500,
    letterSpacing: "-0.02em",
  },
};

const TONE_ORDER: ToneProfile[] = [
  "professional",
  "friendly",
  "premium-luxury",
  "sporty-energetic",
  "community-family",
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function MiniThemeStrip({
  palette,
  preset,
}: {
  palette: Pick<ResolvedBrandPalette, "navBar" | "tabBar" | "primary">;
  preset?: BrandThemePreset;
}) {
  const tabActiveFill =
    preset === "black" ? "rgba(255,255,255,0.9)" : palette.primary;
  return (
    <div className="mt-2 space-y-1 rounded-md border border-border/60 p-2">
      <div
        className="flex h-5 items-center justify-between rounded px-1.5"
        style={{ backgroundColor: palette.navBar }}
      >
        <div className="size-2.5 rounded-sm bg-white/90" />
        <div className="h-0.5 flex-1 mx-1 rounded-full bg-white/30" />
        <div className="size-2 rounded-full bg-white/40" />
      </div>
      <div
        className="flex h-4 items-center justify-between gap-0.5 rounded px-1"
        style={{ backgroundColor: palette.tabBar }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-sm"
            style={{
              backgroundColor:
                i === 0 ? tabActiveFill : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MiniConnectPhonePreview({
  dealershipName,
  logoUrl,
  logomarkUrl,
  palette,
  fontPreset,
  themePreset,
}: {
  dealershipName: string;
  logoUrl: string;
  logomarkUrl?: string;
  palette: Pick<ResolvedBrandPalette, "navBar" | "tabBar" | "primary" | "surface">;
  fontPreset: FontPreset;
  themePreset: BrandThemePreset;
}) {
  const iconSrc = logomarkUrl?.trim() || logoUrl;
  const tabBarActiveColor =
    themePreset === "black"
      ? "rgba(255,255,255,0.95)"
      : palette.primary;
  return (
    <div
      className="mx-auto w-[200px] overflow-hidden rounded-[1.75rem] border-[2px] border-foreground/20 bg-background shadow-lg"
      style={FONT_PREVIEW_STYLE[fontPreset]}
    >
      <div className="flex justify-center pt-1.5">
        <div className="h-[18px] w-[72px] rounded-full bg-foreground" />
      </div>
      <div className="flex items-center justify-between px-2 py-1 text-[8px] text-foreground">
        <span>9:41</span>
        <span className="opacity-60">●●●</span>
      </div>
      <div
        className="flex items-center gap-1.5 px-2 py-1.5"
        style={{ backgroundColor: palette.navBar }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          alt=""
          className="size-5 shrink-0 rounded-md bg-white/90 object-contain p-0.5"
        />
        <span className="min-w-0 flex-1 truncate text-[9px] font-semibold text-white">
          {dealershipName}
        </span>
        <Bell className="size-3 shrink-0 text-white/90" />
      </div>
      <div
        className="h-16 bg-muted/40"
        style={{ backgroundColor: palette.surface }}
      />
      <div className="px-2 py-1 text-[8px] text-muted-foreground">Welcome</div>
      <div
        className="flex items-center justify-around px-1 pb-1 pt-0.5"
        style={{ backgroundColor: palette.tabBar }}
      >
        {["Home", "Svc", "Off", "More"].map((t, i) => (
          <span
            key={t}
            className="text-[7px] font-medium"
            style={{
              color: i === 0 ? tabBarActiveColor : "rgba(255,255,255,0.55)",
            }}
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex justify-center pb-1 pt-0.5">
        <div className="h-1 w-10 rounded-full bg-foreground/20" />
      </div>
    </div>
  );
}

function MiniPushPreview({
  dealershipName,
  palette,
  logomarkUrl,
  logoUrl,
}: {
  dealershipName: string;
  palette: { primary: string };
  logomarkUrl?: string;
  logoUrl: string;
}) {
  const icon = logomarkUrl?.trim() || logoUrl;
  return (
    <div className="rounded-lg border border-border/60 bg-card/90 p-2 shadow-sm">
      <div className="flex items-start gap-2">
        <div
          className="flex size-6 shrink-0 items-center justify-center rounded-md p-0.5"
          style={{ backgroundColor: palette.primary }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={icon} alt="" className="size-5 rounded object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-semibold leading-tight">{dealershipName}</p>
          <p className="text-[8px] text-muted-foreground">Your service reminder is ready.</p>
        </div>
      </div>
    </div>
  );
}

function MiniCouponStrip({
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

export function BrandProfileSettings({
  className,
  topBar,
}: {
  className?: string;
  topBar: React.ReactNode;
}) {
  const { profile, palette, updateProfile } = useBrandProfile();
  const formId = useId();

  const onLogoFiles = useCallback(
    async (files: File[]) => {
      const f = files[0];
      if (!f || !f.type.startsWith("image/")) return;
      const url = await readFileAsDataUrl(f);
      updateProfile({ logoUrl: url });
    },
    [updateProfile],
  );

  const onIconFiles = useCallback(
    async (files: File[]) => {
      const f = files[0];
      if (!f || !f.type.startsWith("image/")) return;
      const url = await readFileAsDataUrl(f);
      updateProfile({ appIconUrl: url, logomarkUrl: url });
    },
    [updateProfile],
  );

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden pt-6",
        className,
      )}
    >
      {topBar}

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden px-8 pb-8 pt-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div className="min-w-0 flex-1 space-y-8">
            <section className="space-y-4">
              <div>
                <h2 className="text-base font-medium tracking-tight">
                  Theme Colors
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose A Palette; Customization Nav, Tabs, And Buttons Update
                  In The Preview.
                </p>
              </div>
              <div className="space-y-3 rounded-md border border-border bg-card p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {THEME_PRESET_ORDER.map((preset) => {
                    const pal = BRAND_THEME_PALETTES[preset];
                    const selected = profile.themePreset === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          updateProfile({
                            themePreset: preset,
                            customPrimaryHex: undefined,
                            customSecondaryHex: undefined,
                          })
                        }
                        className={cn(
                          "rounded-md border p-3 text-left transition-colors",
                          selected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border bg-background hover:bg-muted/40",
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="size-10 shrink-0 rounded-full border border-border/80 shadow-inner"
                            style={{
                              background: themePresetSwatchBackground(preset, pal),
                            }}
                          />
                          <span className="text-sm font-medium text-neutral-950 dark:text-neutral-100">
                            {THEME_LABELS[preset]}
                          </span>
                        </div>
                        <MiniThemeStrip palette={pal} preset={preset} />
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  aria-pressed={profile.themePreset === "custom"}
                  onClick={() => updateProfile({ themePreset: "custom" })}
                  className={cn(
                    "w-full rounded-md border p-3 text-left transition-colors",
                    profile.themePreset === "custom"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background hover:bg-muted/40",
                  )}
                >
                  <span className="text-sm font-medium">Custom</span>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Set Primary And Secondary Hex Values.
                  </p>
                  {profile.themePreset === "custom" ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px]">Primary</Label>
                        <Input
                          value={profile.customPrimaryHex ?? ""}
                          placeholder="#1E3A8A"
                          onChange={(e) =>
                            updateProfile({ customPrimaryHex: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px]">Secondary</Label>
                        <Input
                          value={profile.customSecondaryHex ?? ""}
                          placeholder="#3B82F6"
                          onChange={(e) =>
                            updateProfile({ customSecondaryHex: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  ) : null}
                </button>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-base font-medium tracking-tight">
                  Dealership Identity
                </h2>
                <p className="text-xs text-muted-foreground">
                  Logo And App Icon Appear In Campaigns, Coupons, And The
                  Customization Preview.
                </p>
              </div>
              <div className="space-y-6 rounded-md border border-border bg-card p-6 shadow-sm">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Dealership Details</p>
                  <p className="text-xs text-muted-foreground">
                    Name Shown In Messages, Email Footers, And The Consumer App.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${formId}-name`}>Dealership Name</Label>
                  <Input
                    id={`${formId}-name`}
                    value={profile.dealershipName}
                    onChange={(e) =>
                      updateProfile({ dealershipName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">
                    Sample Dealerships
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Apply A Matching Logo And App Icon Pair.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BRAND_IDENTITY_SAMPLES.map((sample) => (
                      <Button
                        key={sample.id}
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          updateProfile({
                            dealershipName: sample.dealershipName,
                            logoUrl: sample.logoUrl,
                            appIconUrl: sample.appIconUrl,
                            logomarkUrl: sample.appIconUrl,
                          })
                        }
                      >
                        {sample.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label>Logo</Label>
                    <div className="flex items-center justify-center rounded-lg border border-border bg-background p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profile.logoUrl}
                        alt=""
                        className="h-10 max-w-full object-contain"
                      />
                    </div>
                    <FileUploadArea
                      accept="image/*"
                      multiple={false}
                      hint="PNG or SVG, 5 MB max"
                      onFilesSelected={onLogoFiles}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateProfile({
                          logoUrl: DEFAULT_DEALERSHIP_LOGO_SRC,
                        })
                      }
                    >
                      Reset To Default
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Label>App Icon</Label>
                    <div className="flex items-center justify-center rounded-lg border border-border bg-background p-4">
                      <div className="size-16 overflow-hidden rounded-xl border border-border bg-background shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={profile.appIconUrl || profile.logomarkUrl || profile.logoUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      </div>
                    </div>
                    <FileUploadArea
                      accept="image/*"
                      multiple={false}
                      hint="Square image, 512×512 recommended"
                      onFilesSelected={onIconFiles}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-base font-medium tracking-tight">
                  Typography
                </h2>
                <p className="text-xs text-muted-foreground">
                  Font Pairing For Customization And Customer-Facing Previews.
                </p>
              </div>
              <div className="grid gap-3 rounded-md border border-border bg-card p-6 shadow-sm sm:grid-cols-2">
                {FONT_PRESETS.map((preset) => {
                  const selected = profile.fontPreset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateProfile({ fontPreset: preset })}
                      className={cn(
                        "rounded-md border p-3 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-background hover:bg-muted/40",
                      )}
                      style={FONT_PREVIEW_STYLE[preset]}
                    >
                      <p className="text-sm font-semibold leading-tight">
                        {FONT_PRESET_LABELS[preset]}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        The quick brown fox jumps.
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-base font-medium tracking-tight">Tone</h2>
                <p className="text-xs text-muted-foreground">
                  Guides Default Copy Style For Campaigns And Templates.
                </p>
              </div>
              <div className="grid gap-3 rounded-md border border-border bg-card p-6 shadow-sm sm:grid-cols-1">
                {TONE_ORDER.map((tone) => {
                  const selected = profile.toneProfile === tone;
                  return (
                    <button
                      key={tone}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateProfile({ toneProfile: tone })}
                      className={cn(
                        "rounded-md border p-3 text-left transition-colors",
                        selected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-background hover:bg-muted/40",
                      )}
                    >
                      <p className="text-sm font-medium">
                        {TONE_PROFILE_LABELS[tone]}
                      </p>
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        “{TONE_PROFILE_EXAMPLES[tone]}”
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="sticky top-6 w-full shrink-0 space-y-4 lg:w-[280px]">
            <p className="text-xs font-medium text-muted-foreground">
              Live Preview
            </p>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Customization</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0">
                <MiniConnectPhonePreview
                  dealershipName={profile.dealershipName}
                  logoUrl={profile.logoUrl}
                  logomarkUrl={profile.logomarkUrl || profile.appIconUrl}
                  palette={palette}
                  fontPreset={profile.fontPreset}
                  themePreset={profile.themePreset}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Coupon</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <MiniCouponStrip
                  palette={palette}
                  logoUrl={profile.logoUrl}
                  dealershipName={profile.dealershipName}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs">Push Notification</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <MiniPushPreview
                  dealershipName={profile.dealershipName}
                  palette={palette}
                  logomarkUrl={profile.logomarkUrl}
                  logoUrl={profile.logoUrl}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
