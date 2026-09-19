import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { pages, services } from "@/db/schema";
import { ContactForm } from "@/components/public/contact-form";
import { Reveal } from "@/components/public/motion";
import { PageHero } from "@/components/public/sections";
import { buildRouteMetadata, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/contact", { title: "Contact", description: "Discuss software, AI, IoT, networking, security, cloud or IT support with RedMug IT Solution in Dubai." });
}
export const dynamic = "force-dynamic";

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string; solution?: string; industry?: string }> }) {
  const [params, [page], settings, serviceRows] = await Promise.all([
    searchParams,
    db.select().from(pages).where(eq(pages.slug, "contact")).limit(1),
    getSiteSettings(),
    db.select({ id: services.id, name: services.name, slug: services.slug }).from(services).where(eq(services.status, "PUBLISHED")).orderBy(asc(services.displayOrder)),
  ]);
  const phoneNumbers = settings ? [settings.phone, settings.phoneSecondary, settings.phoneMobile].filter((value): value is string => Boolean(value)) : [];
  const preselected = params.service ? serviceRows.find((s) => s.slug === params.service)?.id : undefined;
  const context = params.solution ? `Solution: ${params.solution.replace(/-/g, " ")}` : params.industry ? `Industry: ${params.industry.replace(/-/g, " ")}` : "";
  const mapQuery = settings ? encodeURIComponent(`${settings.companyName}, ${settings.address}`) : "";
  return (
    <main id="main-content">
      <PageHero eyebrow={page?.eyebrow || "Start a conversation"} title={page?.heroTitle || "Bring us the problem. We’ll help define the system."} description={page?.heroDescription} crumbs={[{ label: "Contact" }]} />
      <section className="page-body">
        <div className="site-container contact-layout">
          <Reveal as="div" className="contact-info">
            <span className="eyebrow">RedMug / {settings?.city || "Dubai"}</span>
            <h2>Tell us what needs to work better.</h2>
            <p>{page?.content}</p>
            {settings && (
              <>
                <div className="contact-line"><small><Phone size={10} style={{ display: "inline", marginRight: 6 }} />Phone</small>{phoneNumbers.map((number) => <a key={number} href={`tel:${number.replace(/[^\d+]/g, "")}`}>{number}</a>)}</div>
                {settings.email && <div className="contact-line"><small><Mail size={10} style={{ display: "inline", marginRight: 6 }} />Email</small><a href={`mailto:${settings.email}`}>{settings.email}</a></div>}
                <div className="contact-line"><small><MapPin size={10} style={{ display: "inline", marginRight: 6 }} />Address</small><a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer noopener">{settings.address}</a></div>
                {settings.businessHours && <div className="contact-line"><small><Clock size={10} style={{ display: "inline", marginRight: 6 }} />Business hours</small><span>{settings.businessHours}</span></div>}
              </>
            )}
          </Reveal>
          <Reveal className="form-card" delay={100}>
            <h2 id="contact-form">Start a project</h2>
            <p>Share the context, the current system and the outcome you need. A RedMug engineer will follow up.</p>
            <ContactForm services={serviceRows} preselectedServiceId={preselected} context={context} />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
