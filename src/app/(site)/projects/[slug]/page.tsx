import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { and, desc, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { industries, projects } from "@/db/schema";
import { FinalCta, PageHero, SectionHead } from "@/components/public/sections";
import { SITE_URL, entityMetadata, getSiteSettings, jsonLd } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

async function loadProject(slug: string) {
  const [row] = await db.select({ project: projects, industryName: industries.name }).from(projects).leftJoin(industries, eq(projects.industryId, industries.id)).where(and(eq(projects.slug, slug), eq(projects.status, "PUBLISHED"))).limit(1);
  return row ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await loadProject(slug);
  if (!row) return {};
  return entityMetadata({ title: row.project.seoTitle || row.project.name, description: row.project.seoDescription || row.project.summary, path: `/projects/${row.project.slug}`, image: row.project.featuredImage });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const row = await loadProject(slug);
  if (!row) notFound();
  const { project: item, industryName } = row;
  const [settings, more] = await Promise.all([
    getSiteSettings(),
    db.select().from(projects).where(and(eq(projects.status, "PUBLISHED"), ne(projects.id, item.id))).orderBy(desc(projects.featured), desc(projects.publishedAt)).limit(2),
  ]);
  const structuredData = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` }, { "@type": "ListItem", position: 3, name: item.name, item: `${SITE_URL}/projects/${item.slug}` }] };
  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <PageHero eyebrow={`${item.category} / Case study`} title={item.name} description={item.summary} crumbs={[{ label: "Projects", href: "/projects" }, { label: item.name }]}>
        {item.technologies.length > 0 && <div className="logo-stack" style={{ marginTop: 26 }}>{item.technologies.map((t) => <span key={t}>{t}</span>)}</div>}
      </PageHero>
      {item.featuredImage && (
        <section className="site-container" style={{ marginTop: -1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- CMS-uploaded artwork served from the media route. */}
          <img src={item.featuredImage} alt={`${item.name} project visual`} style={{ width: "100%", maxHeight: 520, objectFit: "cover", borderRadius: "var(--r-xl)", border: "1px solid var(--line)", marginTop: 48 }} />
        </section>
      )}
      <section className="page-body">
        <div className="site-container content-grid">
          <article className="prose">
            {item.isDemo && <div className="demo-notice">Sample data: this record demonstrates the CMS case-study structure. It does not describe a real customer or claim real outcomes.</div>}
            <h2>The challenge</h2><p>{item.challenge}</p>
            <h2>The solution</h2><p>{item.solution}</p>
            {item.results.length > 0 && <><h2>Results</h2><div className="check-list">{item.results.map((value) => <span key={value}>{value}</span>)}</div></>}
            {item.gallery.length > 0 && (
              <><h2>Gallery</h2><div className="detail-list" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>{item.gallery.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element -- CMS-uploaded artwork.
                <img key={url} src={url} alt={`${item.name} gallery image`} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "var(--r-md)", border: "1px solid var(--line)" }} />
              ))}</div></>
            )}
          </article>
          <aside className="side-panel">
            <small>Project profile</small>
            <span>{item.category}</span>
            {industryName && <span>Industry · {industryName}</span>}
            {item.client && <span>Client · {item.client}</span>}
            {item.location && <span>Location · {item.location}</span>}
            {item.publishedAt && <span>Published · {item.publishedAt.toLocaleDateString("en-AE", { dateStyle: "medium" })}</span>}
            <Link className="button button-primary" href="/contact">Start a similar project <ArrowRight size={15} /></Link>
          </aside>
        </div>
      </section>
      {more.length > 0 && (
        <section className="section section-dark section-line-top">
          <div className="site-container">
            <SectionHead eyebrow="More work" title="Other case studies." href="/projects" linkLabel="All projects" />
            <div className="project-list">
              {more.map((p) => (
                <Link className="project-card reveal" href={`/projects/${p.slug}`} key={p.id}>
                  {p.featuredImage && <div className="project-media" style={{ backgroundImage: `url('${p.featuredImage}')` }} />}
                  <div className="project-overlay"><small>{p.isDemo && <span className="demo-badge">Sample data</span>}<span>{p.category}</span></small><h3>{p.name}</h3><p>{p.summary}</p><span className="text-link">View case study <ArrowRight size={13} /></span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {settings && <FinalCta title={settings.defaultCtaTitle} text={settings.defaultCtaText} />}
    </main>
  );
}
