"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SidebarProductConfig } from "@/components/ui/sidebar";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { cn } from "@/lib/utils";

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
      onValueChange={(value) => setTheme(value)}
      options={[
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
      ]}
      size="sm"
    />
  );
}

interface GeneralSettingsContentProps {
  products: SidebarProductConfig[];
  activeProductId: string;
  onProductChange: (productId: string) => void;
  className?: string;
}

export function GeneralSettingsContent({
  products,
  activeProductId,
  onProductChange,
  className,
}: GeneralSettingsContentProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-8 px-8 pb-8", className)}>
      {/* General settings sections (above product switcher) */}
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

      {/* Product switcher: Inventory Management / Smart Marketing (buried at bottom) */}
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
