import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { careers } from "@/db/schema";
import { PageHero } from "@/components/public/sections";
export const metadata:Metadata={title:"Careers",description:"View current career opportunities at RedMug IT Solution in Dubai."};export const dynamic="force-dynamic";
export default async function CareersPage(){const rows=await db.select().from(careers).where(eq(careers.status,"OPEN")).orderBy(desc(careers.updatedAt));return <main id="main-content"><PageHero eyebrow="Careers" title="Build systems that make work better." description="Current roles are published and managed by RedMug administrators. Sample openings are clearly identified."/><section className="page-body"><div className="site-container">{rows.length?rows.map(item=><div className="career-card" key={item.id}><div>{item.isDemo&&<span className="demo-badge">Sample opening</span>}<h3>{item.title}</h3><p>{item.department} · {item.location} · {item.employmentType}</p></div><Link className="button button-secondary" href={`/careers/${item.slug}`}>View position <ArrowRight size={14}/></Link></div>):<div className="empty-public">There are no active vacancies right now. Please check back later.</div>}</div></section></main>}
