import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { PageHero } from "@/components/public/sections";
export const metadata:Metadata={title:"Insights",description:"Practical RedMug perspectives on software, infrastructure, AI, IoT, cloud and security."};export const dynamic="force-dynamic";
export default async function BlogPage(){const rows=await db.select().from(blogPosts).where(eq(blogPosts.status,"PUBLISHED")).orderBy(desc(blogPosts.publishedAt));return <main id="main-content"><PageHero eyebrow="Insights" title="Technical thinking for practical decisions." description="Architecture notes, operating guidance and useful questions for technology leaders."/><section className="page-body"><div className="site-container">{rows.length?<div className="insights-grid">{rows.map(post=><Link className="insight-card" href={`/blog/${post.slug}`} key={post.id}><span className="insight-meta">{post.isDemo&&"Sample editorial · "}{post.readingTime} min read · {post.publishedAt?.toLocaleDateString("en-AE")}</span><h3>{post.title}</h3><p>{post.excerpt}</p><span className="text-link">Read article <ArrowRight size={13}/></span></Link>)}</div>:<div className="empty-public">No articles are published yet.</div>}</div></section></main>}
