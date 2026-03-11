import type { Metadata } from "next";
import { Saira, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AgentationDev } from "@/components/agentation-dev";
import "./globals.css";

const saira = Saira({
  variable: "--font-saira",
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
    <html lang="en">
      <body
        className={`${saira.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <TooltipProvider>
          {children}
          <AgentationDev />
        </TooltipProvider>
      </body>
    </html>
  );
}
