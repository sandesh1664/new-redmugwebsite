import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { industries } from "@/db/schema";
import { PageHero } from "@/components/public/sections";
export const metadata:Metadata={title:"Industries",description:"Technology architecture shaped around the operating context of organizations in Dubai and the UAE."};export const dynamic="force-dynamic";
export default async function IndustriesPage(){const rows=await db.select().from(industries).where(eq(industries.status,"PUBLISHED")).orderBy(asc(industries.displayOrder));return <main id="main-content"><PageHero eyebrow="Operating context" title="Technology shaped around how your industry works." description="Continuity, access, data and service expectations differ. Architecture should reflect those differences."/><section className="page-body"><div className="site-container">{rows.length?<div className="service-list-page">{rows.map((item,index)=><article className="tech-card" key={item.id}><span className="card-index">I{String(index+1).padStart(2,"0")}</span><div className="card-icon"><Building2 size={20}/></div><h3>{item.name}</h3><p>{item.overview}</p><div className="check-list">{item.challenges.slice(0,3).map(value=><span key={value}>{value}</span>)}</div></article>)}</div>:<div className="empty-public">No industries are published yet.</div>}</div></section></main>}
