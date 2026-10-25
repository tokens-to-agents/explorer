import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: `${site.name} ${site.product}`, template: `%s · ${site.name} ${site.product}` },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: "#19191a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
