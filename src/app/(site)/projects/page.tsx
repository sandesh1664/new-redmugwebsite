import type { Metadata } from "next";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { PageHero } from "@/components/public/sections";
export const metadata:Metadata={title:"Projects",description:"Approved RedMug technology case studies and clearly labeled sample project records."};export const dynamic="force-dynamic";
export default async function ProjectsPage(){const rows=await db.select().from(projects).where(eq(projects.status,"PUBLISHED")).orderBy(desc(projects.featured),desc(projects.publishedAt));return <main id="main-content"><PageHero eyebrow="Case studies" title="The system, the reasoning and the result." description="Only approved case studies are presented as real work. Development records are always marked as sample data."/><section className="page-body"><div className="site-container">{rows.length?<div className="project-grid">{rows.map(project=><Link className="project-card" href={`/projects/${project.slug}`} key={project.id} style={project.featuredImage?{backgroundImage:`url('${project.featuredImage}')`}:undefined}><div className="project-overlay">{project.isDemo&&<span className="demo-badge">Sample data</span>}<small>{project.category}</small><h3>{project.name}</h3><p>{project.summary}</p></div></Link>)}</div>:<div className="empty-public">Approved project case studies will appear here when published.</div>}</div></section></main>}
