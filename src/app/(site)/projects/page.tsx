import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { industries, projects } from "@/db/schema";
import { FinalCta, PageHero } from "@/components/public/sections";
import { buildRouteMetadata, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/projects", { title: "Projects", description: "Approved RedMug technology case studies and clearly labeled sample project records." });
}
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [rows, settings] = await Promise.all([
    db.select({ project: projects, industryName: industries.name }).from(projects).leftJoin(industries, eq(projects.industryId, industries.id)).where(eq(projects.status, "PUBLISHED")).orderBy(desc(projects.featured), desc(projects.publishedAt)),
    getSiteSettings(),
  ]);
  const categories = Array.from(new Set(rows.map((r) => r.project.category)));
  return (
    <main id="main-content">
      <PageHero eyebrow="Case studies" title="The system, the reasoning and the result." description="Only approved case studies are presented as real work. Development records are always marked as sample data." crumbs={[{ label: "Projects" }]} />
      <section className="page-body">
        <div className="site-container">
          {categories.length > 1 && <div className="filter-chips" aria-label="Project categories">{categories.map((c) => <span className="chip" key={c}>{c}</span>)}</div>}
          {rows.length ? (
            <div className="project-list">
              {rows.map(({ project, industryName }, index) => (
                <Link className="project-card reveal" href={`/projects/${project.slug}`} key={project.id} style={{ ["--reveal-delay" as string]: `${(index % 2) * 90}ms` }}>
                  {project.featuredImage && <div className="project-media" style={{ backgroundImage: `url('${project.featuredImage}')` }} aria-hidden="true" />}
                  <div className="project-overlay">
                    <small>{project.isDemo && <span className="demo-badge">Sample data</span>}<span>{project.category}</span>{industryName && <span>· {industryName}</span>}</small>
                    <h3>{project.name}</h3>
                    <p>{project.summary}</p>
                    {project.technologies.length > 0 && <div className="card-tags">{project.technologies.slice(0, 5).map((t) => <span key={t}>{t}</span>)}</div>}
                    <span className="text-link">View case study <ArrowRight size={13} /></span>
                  </div>
                </Link>
              ))}
            </div>
          ) : <div className="empty-public">Approved project case studies will appear here when published.</div>}
        </div>
      </section>
      {settings && <FinalCta title={settings.defaultCtaTitle} text={settings.defaultCtaText} />}
    </main>
  );
}
