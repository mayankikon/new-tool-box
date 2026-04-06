import type { Metadata } from "next";
import { Agentation } from "agentation";
import { Saira, Inter, JetBrains_Mono, Onest } from "next/font/google";
import { GroovedPanelPreferenceProvider } from "@/components/chrome/grooved-panel-preference";
import { BrandProfileProvider } from "@/lib/branding/brand-profile-provider";
import { NavVisibilityProvider } from "@/lib/nav-visibility/nav-visibility-provider";
import { AppThemeProvider } from "@/components/theme/app-theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SM 2.0",
  description: "Design system and component showcase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${saira.variable} ${inter.variable} ${jetbrainsMono.variable} ${onest.variable} antialiased`}
      >
        <AppThemeProvider>
          <BrandProfileProvider>
            <NavVisibilityProvider>
              <GroovedPanelPreferenceProvider>
                <TooltipProvider>{children}</TooltipProvider>
              </GroovedPanelPreferenceProvider>
            </NavVisibilityProvider>
          </BrandProfileProvider>
          {process.env.NODE_ENV === "development" && <Agentation />}
        </AppThemeProvider>
      </body>
    </html>
  );
}
