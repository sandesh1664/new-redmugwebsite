import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogCategories, blogPosts } from "@/db/schema";
import { FinalCta, PageHero } from "@/components/public/sections";
import { buildRouteMetadata, getSiteSettings } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return buildRouteMetadata("/blog", { title: "Insights", description: "Practical RedMug perspectives on software, infrastructure, AI, IoT, cloud and security." });
}
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const [rows, settings] = await Promise.all([
    db.select({ post: blogPosts, categoryName: blogCategories.name }).from(blogPosts).leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id)).where(eq(blogPosts.status, "PUBLISHED")).orderBy(desc(blogPosts.publishedAt)),
    getSiteSettings(),
  ]);
  const categories = Array.from(new Set(rows.map((r) => r.categoryName).filter(Boolean))) as string[];
  return (
    <main id="main-content">
      <PageHero eyebrow="Insights" title="Technical thinking for practical decisions." description="Architecture notes, operating guidance and useful questions for technology leaders." crumbs={[{ label: "Insights" }]} />
      <section className="page-body">
        <div className="site-container">
          {categories.length > 0 && <div className="filter-chips" aria-label="Categories">{categories.map((c) => <span className="chip blue" key={c}>{c}</span>)}</div>}
          {rows.length ? (
            <div className="insights-grid">
              {rows.map(({ post, categoryName }, index) => (
                <Link className="insight-card reveal" href={`/blog/${post.slug}`} key={post.id} style={{ ["--reveal-delay" as string]: `${(index % 2) * 80}ms` }}>
                  <span className="insight-meta">{post.isDemo && "Sample editorial · "}{categoryName && `${categoryName} · `}{post.readingTime} min read · {post.publishedAt?.toLocaleDateString("en-AE", { dateStyle: "medium" })}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  {post.tags.length > 0 && <div className="card-tags" style={{ marginTop: 0, paddingTop: 0, marginBottom: 18 }}>{post.tags.map((t) => <span key={t}>{t}</span>)}</div>}
                  <span className="text-link">Read article <ArrowRight size={13} /></span>
                </Link>
              ))}
            </div>
          ) : <div className="empty-public">No articles are published yet.</div>}
        </div>
      </section>
      {settings && <FinalCta title={settings.defaultCtaTitle} text={settings.defaultCtaText} />}
    </main>
  );
}
