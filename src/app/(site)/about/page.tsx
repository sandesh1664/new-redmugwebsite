import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleryItems, pages, teamMembers } from "@/db/schema";
import { FinalCta, PageHero, RichText, SectionHead } from "@/components/public/sections";
import { brandTitle, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> { const [page] = await db.select().from(pages).where(eq(pages.slug, "about")).limit(1); return { title: brandTitle(page?.seoTitle || "About"), description: page?.seoDescription || "RedMug IT Solution's company story, engineering philosophy and technology approach in Dubai.", alternates: { canonical: "/about" } }; }
export const dynamic = "force-dynamic";
export default async function AboutPage() {
  const [[page], settings, team, gallery] = await Promise.all([
    db.select().from(pages).where(eq(pages.slug, "about")).limit(1), getSiteSettings(),
    db.select().from(teamMembers).where(eq(teamMembers.status, "PUBLISHED")).orderBy(asc(teamMembers.displayOrder)),
    db.select().from(galleryItems).where(eq(galleryItems.status, "PUBLISHED")).orderBy(asc(galleryItems.displayOrder)).limit(6),
  ]);
  const title = page?.heroTitle || "Building Technology With Purpose Since 2019.";
  return <main id="main-content"><PageHero eyebrow={page?.eyebrow || "Company"} title={title} description={page?.heroDescription} />
    <section className="page-body"><div className="site-container content-grid"><RichText content={page?.content || "RedMug's company story is managed through the CMS."} /><aside className="side-panel"><small>Company profile</small><span>{settings?.companyName}</span><span>Established {settings?.establishedYear}</span><span>{settings?.address}</span>{settings?.phone && <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>{[settings.phone, settings.phoneSecondary, settings.phoneMobile].filter(Boolean).join(" · ")}</a>}{settings?.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}<span>Software · Infrastructure · Intelligence</span></aside></div></section>
    <section className="section section-dark"><div className="site-container"><SectionHead eyebrow="Operating principles" title="Engineering decisions with practical purpose." /><div className="pillar-grid">{[["Mission","Build useful, dependable technology around real operating needs."],["Vision","Connected organizations with stronger visibility, security and control."],["Values","Clarity, responsibility, technical discipline and long-term thinking."],["Approach","Discover the context, architect the system, validate the operation."]].map(([name,text])=><article className="pillar" key={name}><span>REDMUG / {name.toUpperCase()}</span><strong>{name}</strong><p>{text}</p></article>)}</div></div></section>
    <section className="section"><div className="site-container"><SectionHead eyebrow="Company gallery" title="Real RedMug environments, as they are approved." description="The gallery is CMS-managed and intentionally uses a technical placeholder until approved company photography is uploaded." />{gallery.length?<div className="project-grid">{gallery.slice(0,2).map(item=><figure className="project-card" key={item.id} style={{backgroundImage:`url('${item.imageUrl}')`}}><figcaption className="project-overlay">{item.isDemo&&<span className="demo-badge">Placeholder</span>}<small>{item.category}</small><h3>{item.title}</h3><p>{item.caption}</p></figcaption></figure>)}</div>:<div className="empty-public">Approved RedMug photography will appear here.</div>}</div></section>
    {team.length>0&&<section className="section section-dark"><div className="site-container"><SectionHead eyebrow="Team" title="The people behind the systems."/><div className="service-list-page">{team.map(member=><article className="tech-card" key={member.id}><span className="card-index">TEAM</span><h3>{member.name}</h3><p>{member.role}</p><p>{member.bio}</p></article>)}</div></div></section>}
    {settings&&<FinalCta title={settings.defaultCtaTitle} text={settings.defaultCtaText}/>}</main>;
}
