import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { TechnologyFlow } from "@/components/public/ecosystem";
import { Reveal } from "@/components/public/motion";
import { FinalCta, PageHero, SectionHead } from "@/components/public/sections";
import { ServiceIcon } from "@/components/public/service-icon";
import { buildRouteMetadata, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/services", { title: "Services", description: "Software, AI, IoT, networking, CCTV & security, cloud, IT support and business automation services in Dubai." });
}
export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [rows, settings] = await Promise.all([
    db.select().from(services).where(eq(services.status, "PUBLISHED")).orderBy(asc(services.displayOrder)),
    getSiteSettings(),
  ]);
  return (
    <main id="main-content">
      <PageHero eyebrow="Capabilities" title="Technology services engineered as one system." description="From application logic to physical infrastructure, RedMug connects the layers your operation depends on." crumbs={[{ label: "Services" }]} />
      <section className="page-body">
        <div className="site-container">
          {rows.length ? (
            <div className="service-list-page">
              {rows.map((service, index) => (
                <Link className="tech-card reveal" href={`/services/${service.slug}`} key={service.id} style={{ ["--reveal-delay" as string]: `${(index % 3) * 70}ms` }}>
                  <span className="card-index">{String(index + 1).padStart(2, "0")} / SERVICE</span>
                  <ArrowUpRight className="card-arrow" size={15} aria-hidden="true" />
                  <div className="card-icon"><ServiceIcon name={service.icon} size={20} /></div>
                  <h3>{service.name}</h3>
                  <p>{service.shortDescription}</p>
                  {service.features.length > 0 && <div className="card-tags">{service.features.slice(0, 4).map((f) => <span key={f}>{f}</span>)}</div>}
                  <span className="text-link card-cta" style={{ fontSize: 13 }}>Explore service <ArrowRight size={13} /></span>
                </Link>
              ))}
            </div>
          ) : <div className="empty-public">No services are published yet.</div>}
        </div>
      </section>
      <section className="section section-dark section-grid section-line-top">
        <div className="site-container">
          <SectionHead eyebrow="How it connects" title="Every service is a layer of the same architecture." description="Devices, connectivity, cloud, data and intelligence are designed together so each layer strengthens the next." />
          <Reveal><TechnologyFlow /></Reveal>
        </div>
      </section>
      {settings && <FinalCta title={settings.defaultCtaTitle} text={settings.defaultCtaText} />}
    </main>
  );
}
