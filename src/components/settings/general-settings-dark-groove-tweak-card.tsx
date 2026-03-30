"use client";

/**
 * Legacy “Dark groove (temporary)” tuning UI.
 *
 * Product now uses code defaults in `DEFAULT_GROOVED_PANEL_DARK_APPEARANCE` for dark mode.
 * This card is currently not rendered on the General settings page.
 */

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useGroovedPanelDarkAppearanceTweakControls } from "@/components/chrome/grooved-panel-dark-appearance-tweak";

export function GeneralSettingsDarkGrooveTweakCard() {
  const tweak = useGroovedPanelDarkAppearanceTweakControls();

  if (!tweak) {
    return null;
  }

  const { merged, updateField, reset } = tweak;

  const crushPercent = Math.round(merged.topCrushExtended * 100);
  const vignettePercent = Math.round(merged.topVignetteOpacity * 100);
  const sheenPercent = Math.round(merged.sheenOpacity * 100);

  return (
    <Card className="border-dashed border-amber-500/40 bg-amber-500/5">
      <CardHeader>
        <CardTitle className="text-sm">Dark groove (temporary)</CardTitle>
        <CardDescription>
          Tweaks the dark-mode brushed-metal main column. Values persist on this device
          in localStorage — use to dial in a darker groove, then copy numbers into code
          and remove this panel.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="space-y-2">
          <Label htmlFor="groove-brush-intensity">
            Groove stroke brightness ({merged.brushGrooveIntensity}) — lower reads darker
          </Label>
          <Slider
            id="groove-brush-intensity"
            min={0}
            max={200}
            step={1}
            value={merged.brushGrooveIntensity}
            onValueChange={(value) =>
              updateField("brushGrooveIntensity", value)
            }
            size="sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="groove-base-depth">
            Metal ramp depth ({merged.brushBaseGradientDepth})
          </Label>
          <Slider
            id="groove-base-depth"
            min={0}
            max={200}
            step={1}
            value={merged.brushBaseGradientDepth}
            onValueChange={(value) =>
              updateField("brushBaseGradientDepth", value)
            }
            size="sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="groove-top-crush">
            Top crush ({crushPercent}%)
          </Label>
          <Slider
            id="groove-top-crush"
            min={0}
            max={100}
            step={1}
            value={crushPercent}
            onValueChange={(value) =>
              updateField("topCrushExtended", value / 100)
            }
            size="sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="groove-vignette">
            Top vignette ({vignettePercent}%)
          </Label>
          <Slider
            id="groove-vignette"
            min={0}
            max={100}
            step={1}
            value={vignettePercent}
            onValueChange={(value) =>
              updateField("topVignetteOpacity", value / 100)
            }
            size="sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="groove-sheen">
            Sheen / highlights ({sheenPercent}%)
          </Label>
          <Slider
            id="groove-sheen"
            min={0}
            max={100}
            step={1}
            value={sheenPercent}
            onValueChange={(value) =>
              updateField("sheenOpacity", value / 100)
            }
            size="sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="groove-gradient-start-hex">Gradient start (top/left)</Label>
            <Input
              id="groove-gradient-start-hex"
              value={merged.gradientStartHex}
              onChange={(event) =>
                updateField("gradientStartHex", event.target.value)
              }
              placeholder="#19191a"
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="groove-gradient-end-hex">
              Gradient end (bottom/right)
            </Label>
            <Input
              id="groove-gradient-end-hex"
              value={merged.gradientEndHex}
              onChange={(event) =>
                updateField("gradientEndHex", event.target.value)
              }
              placeholder="#39393c"
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              Darken this value to make the lower half heavier (ex: <code>#222226</code>).
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t border-border pt-4">
        <Button type="button" variant="outline" size="sm" onClick={reset}>
          Reset to code defaults
        </Button>
      </CardFooter>
    </Card>
  );
}
