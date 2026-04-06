"use client";

import * as React from "react";
import { useTheme } from "@/components/theme/app-theme-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckboxList, CheckboxListItem } from "@/components/ui/checkbox-list";
import type { SidebarProductConfig } from "@/components/ui/sidebar";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { useNavVisibility } from "@/lib/nav-visibility/nav-visibility-provider";
import type { NavVisibilitySectionData } from "@/lib/nav-visibility/nav-visibility-storage";
import { cn } from "@/lib/utils";

const PROTECTED_LABELS = ["General"];

function AppearanceThemeControl() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayTheme =
    !mounted || theme == null ? "light" : theme === "dark" ? "dark" : "light";

  return (
    <ToggleSwitch
      aria-label="Color theme"
      value={displayTheme}
      onValueChange={(value) =>
        setTheme(value === "dark" ? "dark" : "light")
      }
      options={[
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ]}
      size="sm"
    />
  );
}

function NavigationVisibilityCard({
  section,
}: {
  section: NavVisibilitySectionData;
}) {
  const { getHiddenLabels, setHiddenLabels } = useNavVisibility();
  const { productId, productLabel, mainLabels, settingsLabels } = section;

  const allLabels = React.useMemo(
    () => [...mainLabels, ...settingsLabels],
    [mainLabels, settingsLabels],
  );

  const hiddenLabels = getHiddenLabels(productId);
  const visibleLabels = allLabels.filter((l) => !hiddenLabels.includes(l));

  const handleVisibleChange = React.useCallback(
    (newVisible: string[]) => {
      const protectedInProduct = PROTECTED_LABELS.filter((l) =>
        allLabels.includes(l),
      );
      const ensuredVisible = [
        ...new Set([...newVisible, ...protectedInProduct]),
      ];
      const newHidden = allLabels.filter((l) => !ensuredVisible.includes(l));
      setHiddenLabels(productId, newHidden);
    },
    [allLabels, productId, setHiddenLabels],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{productLabel}</CardTitle>
        <CardDescription>
          Toggle pages visible in the sidebar.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <CheckboxList
          value={visibleLabels}
          onValueChange={handleVisibleChange}
        >
          {mainLabels.map((label) => (
            <CheckboxListItem
              key={label}
              value={label}
              label={label}
              disabled={PROTECTED_LABELS.includes(label)}
            />
          ))}
          {settingsLabels.length > 0 && (
            <>
              <div className="my-1 border-t border-border" />
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground">
                Settings
              </p>
              {settingsLabels.map((label) => (
                <CheckboxListItem
                  key={label}
                  value={label}
                  label={label}
                  disabled={PROTECTED_LABELS.includes(label)}
                />
              ))}
            </>
          )}
        </CheckboxList>
      </CardContent>
    </Card>
  );
}

interface GeneralSettingsContentProps {
  products: SidebarProductConfig[];
  activeProductId: string;
  onProductChange: (productId: string) => void;
  className?: string;
  navSections?: NavVisibilitySectionData[];
}

export function GeneralSettingsContent({
  products,
  activeProductId,
  onProductChange,
  className,
  navSections,
}: GeneralSettingsContentProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-8 px-8 pb-8", className)}>
      {/* Account & preferences */}
      <section className="space-y-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          Account &amp; preferences
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Appearance</CardTitle>
              <CardDescription>
                Light or dark interface. Applies across the app and is saved on
                this device.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <AppearanceThemeControl />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Account</CardTitle>
              <CardDescription>
                Dealership name, contact, and billing details.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Region &amp; language</CardTitle>
              <CardDescription>
                Time zone, locale, and display language.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notifications</CardTitle>
              <CardDescription>
                Email and in-app notification preferences.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Sidebar navigation visibility */}
      {navSections && navSections.length > 0 && (
        <section className="space-y-6 border-t border-border pt-8">
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              Sidebar navigation
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose which pages appear in the sidebar for each application.
              Unchecked pages are hidden from the navigation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {navSections.map((section) => (
              <NavigationVisibilityCard
                key={section.productId}
                section={section}
              />
            ))}
          </div>
        </section>
      )}

      {/* Product switcher */}
      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-sm font-medium text-muted-foreground">
          Application
        </h2>
        <p className="text-sm text-muted-foreground">
          Switch between Inventory Management and Smart Marketing. The sidebar
          and main navigation update to the selected application.
        </p>
        <div className="flex flex-wrap gap-3">
          {products.map((product) => {
            const isActive = product.id === activeProductId;
            const Icon = product.icon;
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onProductChange(product.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-muted/50"
                )}
                aria-pressed={isActive}
                aria-label={`Switch to ${product.label}`}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="font-medium">{product.label}</span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
