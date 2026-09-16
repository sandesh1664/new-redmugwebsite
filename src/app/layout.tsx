import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { getSiteSettings } from "@/lib/site";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://redmugitsolution.ae"),
    title: { default: "RedMug IT Solution | Technology & Infrastructure Dubai", template: "%s | RedMug IT Solution" },
    description: "RedMug IT Solution Co. L.L.C — software, AI, IoT, networking, CCTV & security, cloud and IT support engineered as one connected technology ecosystem in Dubai since 2019.",
    // The favicon is CMS-configurable; the bundled brand mark is the fallback.
    icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : { icon: "/favicon.svg" },
    openGraph: { type: "website", locale: "en_AE", siteName: "RedMug IT Solution Co. L.L.C." },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${geist.variable} ${mono.variable}`}><body>{children}</body></html>;
}
