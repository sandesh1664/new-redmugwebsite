import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services } from "@/db/schema";
import { PageHero } from "@/components/public/sections";
import { ServiceIcon } from "@/components/public/service-icon";
import { buildRouteMetadata } from "@/lib/site";
export async function generateMetadata(): Promise<Metadata> { return buildRouteMetadata("/services", { title: "Services", description: "Software, AI, IoT, networking, security, cloud, IT support and business automation services in Dubai." }); }
export const dynamic = "force-dynamic";
export default async function ServicesPage(){const rows=await db.select().from(services).where(eq(services.status,"PUBLISHED")).orderBy(asc(services.displayOrder));return <main id="main-content"><PageHero eyebrow="Capabilities" title="Technology services engineered as one system." description="From application logic to physical infrastructure, RedMug connects the layers your operation depends on."/><section className="page-body"><div className="site-container">{rows.length?<div className="service-list-page">{rows.map((service,index)=><Link className="tech-card" href={`/services/${service.slug}`} key={service.id}><span className="card-index">{String(index+1).padStart(2,"0")} / SERVICE</span><ArrowUpRight className="card-arrow" size={15}/><div className="card-icon"><ServiceIcon name={service.icon} size={20}/></div><h3>{service.name}</h3><p>{service.shortDescription}</p></Link>)}</div>:<div className="empty-public">No services are published yet.</div>}</div></section></main>}
