import type { Metadata } from "next";
import { Radar } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { solutions } from "@/db/schema";
import { PageHero } from "@/components/public/sections";
export const metadata: Metadata={title:"Solutions",description:"Integrated software, cloud, AI, IoT, network and security solutions from RedMug."};export const dynamic="force-dynamic";
export default async function SolutionsPage(){const rows=await db.select().from(solutions).where(eq(solutions.status,"PUBLISHED")).orderBy(asc(solutions.displayOrder));return <main id="main-content"><PageHero eyebrow="Integrated outcomes" title="Solutions that cross technical boundaries." description="Business systems rarely live in one layer. RedMug connects software, infrastructure, data and security around the outcome."/><section className="page-body section-grid"><div className="site-container">{rows.length?<div className="service-list-page">{rows.map((item,index)=><article className="tech-card" key={item.id}><span className="card-index">S{String(index+1).padStart(2,"0")}</span><div className="card-icon"><Radar size={20}/></div><h3>{item.name}</h3><p>{item.summary}</p><div className="check-list">{item.capabilities.map(value=><span key={value}>{value}</span>)}</div></article>)}</div>:<div className="empty-public">No solutions are published yet.</div>}</div></section></main>}
