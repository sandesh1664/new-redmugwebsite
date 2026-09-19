import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { careers } from "@/db/schema";
import { ApplicationForm } from "@/components/public/application-form";
import { Reveal } from "@/components/public/motion";
import { PageHero } from "@/components/public/sections";
import { SITE_URL, entityMetadata, getSiteSettings, jsonLd } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [item] = await db.select().from(careers).where(eq(careers.slug, slug)).limit(1);
  if (!item) return {};
  return entityMetadata({ title: item.seoTitle || item.title, description: item.seoDescription || item.description.slice(0, 155), path: `/careers/${item.slug}`, noIndex: item.status !== "OPEN" });
}

export default async function CareerPage({ params }: Props) {
  const { slug } = await params;
  const [[item], settings] = await Promise.all([
    db.select().from(careers).where(and(eq(careers.slug, slug), eq(careers.status, "OPEN"))).limit(1),
    getSiteSettings(),
  ]);
  if (!item) notFound();
  const structuredData = item.isDemo ? null : {
    "@context": "https://schema.org", "@type": "JobPosting", title: item.title, description: item.description, datePosted: item.createdAt.toISOString(), validThrough: item.deadline || undefined, employmentType: item.employmentType.toUpperCase().replace(/[-\s]/g, "_"),
    hiringOrganization: { "@type": "Organization", name: settings?.companyName || "RedMug IT Solution Co. L.L.C.", sameAs: SITE_URL },
    jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: item.location, addressCountry: "AE" } },
  };
  return (
    <main id="main-content">
      {structuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />}
      <PageHero eyebrow={item.isDemo ? "Sample opening / Careers" : "Careers"} title={item.title} description={`${item.department} · ${item.location} · ${item.employmentType}`} crumbs={[{ label: "Careers", href: "/careers" }, { label: item.title }]} />
      <section className="page-body">
        <div className="site-container content-grid">
          <article className="prose">
            {item.isDemo && <div className="demo-notice">This is a sample vacancy demonstrating the CMS workflow. It is not an active RedMug vacancy unless an administrator replaces this notice.</div>}
            <h2>Role overview</h2><p>{item.description}</p>
            {item.responsibilities.length > 0 && <><h2>Responsibilities</h2><ul>{item.responsibilities.map((value) => <li key={value}>{value}</li>)}</ul></>}
            {item.requirements.length > 0 && <><h2>Requirements</h2><ul>{item.requirements.map((value) => <li key={value}>{value}</li>)}</ul></>}
            {item.benefits.length > 0 && <><h2>Benefits</h2><ul>{item.benefits.map((value) => <li key={value}>{value}</li>)}</ul></>}
          </article>
          <aside className="side-panel">
            <small>Position</small>
            <span>{item.department}</span><span>{item.location}</span><span>{item.employmentType}</span>
            {item.experience && <span>{item.experience}</span>}
            {item.deadline && <span>Apply by {item.deadline}</span>}
            <a className="button button-primary" href="#apply">Apply now</a>
          </aside>
        </div>
      </section>
      <section className="section section-dark section-line-top" id="apply">
        <div className="site-container contact-layout">
          <Reveal>
            <span className="eyebrow">Apply</span>
            <h2 style={{ fontSize: "clamp(28px,3.4vw,42px)", letterSpacing: "-.04em", margin: "16px 0 12px", fontWeight: 600 }}>Submit your application.</h2>
            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>Applications are validated and stored securely for RedMug administrators to review. You will be contacted using the details you provide.</p>
          </Reveal>
          <Reveal className="form-card" delay={100}><ApplicationForm careerId={item.id} /></Reveal>
        </div>
      </section>
    </main>
  );
}
