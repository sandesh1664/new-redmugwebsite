import type { ReactNode } from "react";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { getSiteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();
  const contactNumbers = settings
    ? [settings.phone, settings.phoneSecondary, settings.phoneMobile].filter((value): value is string => Boolean(value))
    : [];
  const structuredData = settings ? {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: settings.companyName,
    url: settings.websiteUrl,
    logo: "/brand/redmug-mark.svg",
    telephone: contactNumbers[0],
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
      <PublicHeader logoUrl={settings?.logoUrl} />
      {children}
      {settings && <PublicFooter settings={settings} />}
    </div>
  );
}
