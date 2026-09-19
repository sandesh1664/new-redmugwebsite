import type { Metadata } from "next";
import { ArrowRight, Briefcase, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { careers } from "@/db/schema";
import { Reveal } from "@/components/public/motion";
import { PageHero } from "@/components/public/sections";
import { buildRouteMetadata, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/careers", { title: "Careers", description: "View current career opportunities at RedMug IT Solution in Dubai." });
}
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const [rows, settings] = await Promise.all([
    db.select().from(careers).where(eq(careers.status, "OPEN")).orderBy(desc(careers.updatedAt)),
    getSiteSettings(),
  ]);
  return (
    <main id="main-content">
      <PageHero eyebrow="Careers" title="Build systems that make work better." description="Current roles are published and managed by RedMug administrators. Sample openings are clearly identified." crumbs={[{ label: "Careers" }]} />
      <section className="page-body">
        <div className="site-container" style={{ maxWidth: 900 }}>
          {rows.length ? rows.map((item, index) => (
            <Reveal className="career-card" key={item.id} delay={index * 60}>
              <div>
                {item.isDemo && <span className="demo-badge">Sample opening</span>}
                <h3>{item.title}</h3>
                <p>{item.description.slice(0, 160)}{item.description.length > 160 ? "…" : ""}</p>
                <div className="career-meta">
                  <span className="chip"><Briefcase size={11} /> {item.department}</span>
                  <span className="chip"><MapPin size={11} /> {item.location}</span>
                  <span className="chip"><Clock size={11} /> {item.employmentType}</span>
                  {item.experience && <span className="chip">{item.experience}</span>}
                </div>
              </div>
              <Link className="button button-secondary" href={`/careers/${item.slug}`}>View position <ArrowRight size={14} /></Link>
            </Reveal>
          )) : (
            <div className="empty-public">
              <p style={{ margin: "0 0 12px", color: "var(--text)" }}>There are no active vacancies right now.</p>
              <p style={{ margin: 0 }}>Please check back later{settings?.email ? <>, or send a speculative application to <a href={`mailto:${settings.email}`} style={{ color: "var(--blue-bright)" }}>{settings.email}</a></> : ""}.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
