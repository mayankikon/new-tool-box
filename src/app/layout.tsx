import type { Metadata } from "next";
import { Agentation } from "agentation";
import { DialRoot } from "dialkit";
import { Saira, Inter, JetBrains_Mono } from "next/font/google";
import { GroovedPanelPreferenceProvider } from "@/components/chrome/grooved-panel-preference";
import { AppThemeProvider } from "@/components/theme/app-theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";
import "dialkit/styles.css";

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
        className={`${saira.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AppThemeProvider>
          <GroovedPanelPreferenceProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </GroovedPanelPreferenceProvider>
          <DialRoot position="bottom-right" defaultOpen={false} />
          {process.env.NODE_ENV === "development" && <Agentation />}
        </AppThemeProvider>
      </body>
    </html>
  );
}
