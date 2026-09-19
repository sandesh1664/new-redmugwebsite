import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { CardSpotlight, RevealObserver, ScrollProgress } from "@/components/public/motion";
import { getNavigationData, getSiteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigationData()]);
  const contactNumbers = settings
    ? [settings.phone, settings.phoneSecondary, settings.phoneMobile].filter((value): value is string => Boolean(value))
    : [];
  const structuredData = settings ? {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: settings.companyName,
    url: settings.websiteUrl,
    logo: `${settings.websiteUrl.replace(/\/$/, "")}/brand/redmug-mark.svg`,
    telephone: contactNumbers[0],
    email: settings.email || undefined,
    foundingDate: String(settings.establishedYear),
    address: { "@type": "PostalAddress", streetAddress: settings.address, addressLocality: settings.city, addressCountry: "AE" },
    contactPoint: contactNumbers.map((number) => ({ "@type": "ContactPoint", telephone: number, contactType: "sales", areaServed: "AE", availableLanguage: ["en", "ar"] })),
    aggregateRating: { "@type": "AggregateRating", ratingValue: String(settings.googleRating), reviewCount: settings.googleReviewCount },
    sameAs: Object.values(settings.socialLinks).filter(Boolean),
  } : null;
  return (
    <div className="public-site">
      <a href="#main-content" className="skip-link">Skip to content</a>
      {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />}
      <ScrollProgress />
      <CardSpotlight />
      <RevealObserver />
      <PublicHeader logoUrl={settings?.logoUrl} services={navigation.services} phone={settings?.phone} />
      {children}
      {settings && <PublicFooter settings={settings} services={navigation.services} solutions={navigation.solutions} legalPages={navigation.legalPages} />}
    </div>
  );
}
