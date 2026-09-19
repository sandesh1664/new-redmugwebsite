import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { services, solutions } from "@/db/schema";
import { Reveal } from "@/components/public/motion";
import { FinalCta, PageHero } from "@/components/public/sections";
import { ServiceIcon } from "@/components/public/service-icon";
import { buildRouteMetadata, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/solutions", { title: "Solutions", description: "Integrated software, cloud, AI, IoT, network and security solutions from RedMug IT Solution in Dubai." });
}
export const dynamic = "force-dynamic";

export default async function SolutionsPage() {
  const [rows, settings] = await Promise.all([
    db.select().from(solutions).where(eq(solutions.status, "PUBLISHED")).orderBy(asc(solutions.displayOrder)),
    getSiteSettings(),
  ]);
  const serviceIds = Array.from(new Set(rows.flatMap((r) => r.relatedServiceIds)));
  const serviceRows = serviceIds.length ? await db.select({ id: services.id, name: services.name, slug: services.slug }).from(services).where(inArray(services.id, serviceIds)) : [];
  const serviceById = new Map(serviceRows.map((s) => [s.id, s]));
  return (
    <main id="main-content">
      <PageHero eyebrow="Integrated outcomes" title="Solutions that cross technical boundaries." description="Business systems rarely live in one layer. RedMug connects software, infrastructure, data and security around the outcome." crumbs={[{ label: "Solutions" }]} />
      <section className="page-body section-grid">
        <div className="site-container">
          {rows.length ? (
            <div className="service-list-page">
              {rows.map((item, index) => {
                const linked = item.relatedServiceIds.map((id) => serviceById.get(id)).filter(Boolean) as Array<{ id: string; name: string; slug: string }>;
                return (
                  <Reveal as="article" className="tech-card" key={item.id} delay={(index % 3) * 70} style={{ minHeight: 320 }}>
                    <span className="card-index" id={item.slug}>S{String(index + 1).padStart(2, "0")} / SOLUTION</span>
                    <div className="card-icon"><ServiceIcon name={item.icon} size={20} /></div>
                    <h3>{item.name}</h3>
                    <p>{item.summary}</p>
                    {item.description && item.description !== item.summary && <p style={{ marginTop: 10 }}>{item.description}</p>}
                    {item.capabilities.length > 0 && <div className="check-list">{item.capabilities.map((value) => <span key={value}>{value}</span>)}</div>}
                    {linked.length > 0 && <div className="card-tags">{linked.map((s) => <Link key={s.id} href={`/services/${s.slug}`}><span>{s.name}</span></Link>)}</div>}
                    <Link className="text-link card-cta" href={`/contact?solution=${item.slug}`} style={{ fontSize: 13 }}>Discuss this solution <ArrowRight size={13} /></Link>
                  </Reveal>
                );
              })}
            </div>
          ) : <div className="empty-public">No solutions are published yet.</div>}
        </div>
      </section>
      {settings && <FinalCta title={settings.defaultCtaTitle} text={settings.defaultCtaText} />}
    </main>
  );
}
