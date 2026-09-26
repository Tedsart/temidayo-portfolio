import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

import { siteConfig } from "@/lib/config";
import { absoluteUrl } from "@/lib/utils";

/**
 * Type system: Fraunces (display serif — the editorial voice), Archivo (body
 * grotesque), IBM Plex Mono (metadata labels & figures). All self-hosted at
 * build time by next/font.
 */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

const ogImage = absoluteUrl("/og-default.svg", siteConfig.url);

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.role}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: `${siteConfig.name} Portfolio`,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  keywords: [
    "data analyst",
    "data visualization",
    "data storytelling",
    "Power BI",
    "dashboard design",
    "Temidayo Kukoyi",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteConfig.url,
    siteName: `${siteConfig.name} — Portfolio`,
    title: `${siteConfig.name} — ${siteConfig.headline}`,
    description: siteConfig.tagline,
    images: [{ url: ogImage, width: 1200, height: 630, alt: `${siteConfig.name} — ${siteConfig.role}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.headline}`,
    description: siteConfig.tagline,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ec",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${fraunces.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:text-paper"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
