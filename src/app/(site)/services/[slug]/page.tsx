import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { and, asc, desc, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { projects, services } from "@/db/schema";
import { Reveal } from "@/components/public/motion";
import { FinalCta, PageHero, SectionHead } from "@/components/public/sections";
import { ServiceIcon } from "@/components/public/service-icon";
import { SITE_URL, entityMetadata, getSiteSettings, jsonLd } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

async function loadService(slug: string) {
  const [item] = await db.select().from(services).where(and(eq(services.slug, slug), eq(services.status, "PUBLISHED"))).limit(1);
  return item ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await loadService(slug);
  if (!item) return {};
  return entityMetadata({ title: item.seoTitle || item.name, description: item.seoDescription || item.shortDescription, path: `/services/${item.slug}`, image: item.heroImage });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const item = await loadService(slug);
  if (!item) notFound();
  const [related, otherServices, settings] = await Promise.all([
    db.select().from(projects).where(eq(projects.status, "PUBLISHED")).orderBy(desc(projects.featured)).limit(2),
    db.select({ name: services.name, slug: services.slug, icon: services.icon, shortDescription: services.shortDescription }).from(services).where(and(eq(services.status, "PUBLISHED"), ne(services.id, item.id))).orderBy(asc(services.displayOrder)).limit(3),
    getSiteSettings(),
  ]);
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Service", name: item.name, description: item.shortDescription, url: `${SITE_URL}/services/${item.slug}`, areaServed: "AE", provider: { "@type": "Organization", name: settings?.companyName || "RedMug IT Solution Co. L.L.C." } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` }, { "@type": "ListItem", position: 3, name: item.name, item: `${SITE_URL}/services/${item.slug}` }] },
    ...(item.faq.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: item.faq.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }] : []),
  ];
  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <PageHero eyebrow="Service" title={item.name} description={item.shortDescription} crumbs={[{ label: "Services", href: "/services" }, { label: item.name }]}>
        {item.technologies.length > 0 && <div className="logo-stack" style={{ marginTop: 26 }}>{item.technologies.map((t) => <span key={t}>{t}</span>)}</div>}
      </PageHero>
      <section className="page-body">
        <div className="site-container content-grid">
          <div className="prose">
            <h2>Overview</h2><p>{item.fullDescription}</p>
            {item.problems.length > 0 && <><h2>Problems we solve</h2><div className="detail-list">{item.problems.map((value) => <div key={value}>{value}</div>)}</div></>}
            {item.features.length > 0 && <><h2>Capabilities</h2><div className="detail-list">{item.features.map((value) => <div key={value}>{value}</div>)}</div></>}
            {item.process.length > 0 && <><h2>Process</h2><div className="ecosystem-flow" style={{ gridTemplateColumns: `repeat(${Math.min(item.process.length, 5)}, 1fr)` }}>{item.process.map((value, index) => <div className="flow-step" key={value}><small>PHASE {String(index + 1).padStart(2, "0")}</small><i /><b>{value.toUpperCase()}</b>{index < item.process.length - 1 && <span className="flow-arrow" />}</div>)}</div></>}
            {item.benefits.length > 0 && <><h2>Benefits</h2><div className="check-list">{item.benefits.map((value) => <span key={value}>{value}</span>)}</div></>}
            {item.faq.length > 0 && <><h2>Frequently asked questions</h2><div className="faq">{item.faq.map((entry) => <details key={entry.question}><summary>{entry.question}</summary><p>{entry.answer}</p></details>)}</div></>}
          </div>
          <aside className="side-panel">
            <small>Service system</small>
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}><ServiceIcon name={item.icon} size={16} style={{ color: "var(--blue-bright)" }} /> {item.name}</span>
            <span>Discover</span><span>Architecture</span><span>Implementation</span><span>Operational support</span>
            <Link className="button button-primary" href={`/contact?service=${item.slug}`}>Discuss this service <ArrowRight size={15} /></Link>
          </aside>
        </div>
      </section>
      {otherServices.length > 0 && (
        <section className="section section-dark section-line-top">
          <div className="site-container">
            <SectionHead eyebrow="Related capabilities" title="Services that connect to this one." href="/services" linkLabel="All services" />
            <div className="service-list-page">
              {otherServices.map((service, index) => (
                <Link className="tech-card reveal" href={`/services/${service.slug}`} key={service.slug} style={{ ["--reveal-delay" as string]: `${index * 70}ms` }}>
                  <span className="card-index">RELATED</span><div className="card-icon"><ServiceIcon name={service.icon} size={20} /></div><h3>{service.name}</h3><p>{service.shortDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {related.length > 0 && (
        <section className="section">
          <div className="site-container">
            <SectionHead eyebrow="Case studies" title="Related work." href="/projects" linkLabel="All projects" />
            <div className="project-grid">
              {related.map((project) => (
                <Reveal key={project.id} style={{ display: "grid" }}>
                  <Link className="project-card" href={`/projects/${project.slug}`}>
                    {project.featuredImage && <div className="project-media" style={{ backgroundImage: `url('${project.featuredImage}')` }} />}
                    <div className="project-overlay"><small>{project.isDemo && <span className="demo-badge">Sample data</span>}<span>{project.category}</span></small><h3>{project.name}</h3><p>{project.summary}</p><span className="text-link">View case study <ArrowRight size={13} /></span></div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
      {settings && <FinalCta title={settings.defaultCtaTitle} text={settings.defaultCtaText} />}
    </main>
  );
}
