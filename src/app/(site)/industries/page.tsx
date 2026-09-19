import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { industries } from "@/db/schema";
import { Reveal } from "@/components/public/motion";
import { FinalCta, PageHero } from "@/components/public/sections";
import { ServiceIcon, industryIcon } from "@/components/public/service-icon";
import { buildRouteMetadata, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/industries", { title: "Industries", description: "Technology architecture shaped around the operating context of organizations in Dubai and the UAE." });
}
export const dynamic = "force-dynamic";

export default async function IndustriesPage() {
  const [rows, settings] = await Promise.all([
    db.select().from(industries).where(eq(industries.status, "PUBLISHED")).orderBy(asc(industries.displayOrder)),
    getSiteSettings(),
  ]);
  return (
    <main id="main-content">
      <PageHero eyebrow="Operating context" title="Technology shaped around how your industry works." description="Continuity, access, data and service expectations differ. Architecture should reflect those differences." crumbs={[{ label: "Industries" }]} />
      <section className="page-body">
        <div className="site-container">
          {rows.length ? (
            <div className="service-list-page">
              {rows.map((item, index) => (
                <Reveal as="article" className="tech-card" key={item.id} delay={(index % 3) * 70} style={{ scrollMarginTop: 110 }}>
                  <span className="card-index" id={item.slug}>I{String(index + 1).padStart(2, "0")} / INDUSTRY</span>
                  <div className="card-icon"><ServiceIcon name={industryIcon(item.name)} size={20} /></div>
                  <h3>{item.name}</h3>
                  <p>{item.overview}</p>
                  {item.challenges.length > 0 && <><small style={{ display: "block", marginTop: 20, font: "500 9.5px/1 var(--font-mono)", letterSpacing: ".12em", color: "var(--muted-2)", textTransform: "uppercase" }}>Typical challenges</small><div className="check-list" style={{ marginTop: 10 }}>{item.challenges.slice(0, 4).map((value) => <span key={value}>{value}</span>)}</div></>}
                  {item.solutions.length > 0 && <div className="card-tags">{item.solutions.map((value) => <span key={value}>{value}</span>)}</div>}
                  <Link className="text-link card-cta" href={`/contact?industry=${item.slug}`} style={{ fontSize: 13 }}>Talk about {item.name.toLowerCase()} <ArrowRight size={13} /></Link>
                </Reveal>
              ))}
            </div>
          ) : <div className="empty-public">No industries are published yet.</div>}
        </div>
      </section>
      {settings && <FinalCta title={settings.defaultCtaTitle} text={settings.defaultCtaText} />}
    </main>
  );
}
