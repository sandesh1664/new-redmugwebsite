import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { and, desc, eq, ne } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { blogCategories, blogPosts, users } from "@/db/schema";
import { PageHero, RichText, SectionHead } from "@/components/public/sections";
import { SITE_URL, entityMetadata, jsonLd } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

async function loadPost(slug: string) {
  const [row] = await db.select({ post: blogPosts, categoryName: blogCategories.name, authorName: users.name }).from(blogPosts).leftJoin(blogCategories, eq(blogPosts.categoryId, blogCategories.id)).leftJoin(users, eq(blogPosts.authorId, users.id)).where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, "PUBLISHED"))).limit(1);
  return row ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const row = await loadPost(slug);
  if (!row) return {};
  return entityMetadata({ title: row.post.seoTitle || row.post.title, description: row.post.seoDescription || row.post.excerpt, path: `/blog/${row.post.slug}`, image: row.post.featuredImage, type: "article", publishedTime: row.post.publishedAt?.toISOString() });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const row = await loadPost(slug);
  if (!row) notFound();
  const { post: item, categoryName, authorName } = row;
  const related = await db.select().from(blogPosts).where(and(eq(blogPosts.status, "PUBLISHED"), ne(blogPosts.id, item.id))).orderBy(desc(blogPosts.publishedAt)).limit(2);
  const headings = item.content.split("\n").filter((line) => line.startsWith("## ")).map((line) => line.slice(3));
  const url = `${SITE_URL}/blog/${item.slug}`;
  const structuredData = [
    { "@context": "https://schema.org", "@type": "Article", headline: item.title, description: item.excerpt, datePublished: item.publishedAt?.toISOString(), dateModified: item.updatedAt.toISOString(), image: item.featuredImage ? [item.featuredImage] : undefined, author: { "@type": authorName ? "Person" : "Organization", name: authorName || "RedMug IT Solution Co. L.L.C." }, publisher: { "@type": "Organization", name: "RedMug IT Solution Co. L.L.C." }, mainEntityOfPage: url },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Insights", item: `${SITE_URL}/blog` }, { "@type": "ListItem", position: 3, name: item.title, item: url }] },
  ];
  const share = encodeURIComponent(url);
  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      <PageHero eyebrow={item.isDemo ? "Sample editorial / Insights" : categoryName ? `Insights / ${categoryName}` : "Insights"} title={item.title} description={item.excerpt} crumbs={[{ label: "Insights", href: "/blog" }, { label: item.title }]} />
      <section className="page-body">
        <div className="site-container content-grid">
          <article>
            <div className="article-meta">
              <span>{item.publishedAt?.toLocaleDateString("en-AE", { dateStyle: "long" })}</span>
              <span>{item.readingTime} minute read</span>
              {authorName && <span>By {authorName}</span>}
              {item.tags.length > 0 && <span>{item.tags.join(" · ")}</span>}
            </div>
            {item.isDemo && <p className="demo-notice">Sample editorial content — illustrates the CMS article structure.</p>}
            {item.featuredImage && (
              // eslint-disable-next-line @next/next/no-img-element -- CMS-uploaded artwork.
              <img src={item.featuredImage} alt={item.title} style={{ width: "100%", borderRadius: "var(--r-lg)", border: "1px solid var(--line)", marginBottom: 32 }} />
            )}
            <RichText content={item.content} />
            <div className="share-row" aria-label="Share this article">
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`} target="_blank" rel="noreferrer noopener">Share on LinkedIn</a>
              <a href={`https://x.com/intent/tweet?url=${share}&text=${encodeURIComponent(item.title)}`} target="_blank" rel="noreferrer noopener">Share on X</a>
            </div>
          </article>
          <aside className="side-panel">
            {headings.length > 0 && <><small>In this article</small>{headings.map((h) => <span key={h}>{h}</span>)}</>}
            <small style={{ marginTop: headings.length ? 20 : 0 }}>Need help with this?</small>
            <Link className="button button-primary" href="/contact">Talk to RedMug <ArrowRight size={15} /></Link>
          </aside>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section section-dark section-line-top">
          <div className="site-container">
            <SectionHead eyebrow="Keep reading" title="Related insights." href="/blog" linkLabel="All insights" />
            <div className="insights-grid">
              {related.map((post) => (
                <Link className="insight-card reveal" href={`/blog/${post.slug}`} key={post.id}>
                  <span className="insight-meta">{post.readingTime} min read · {post.publishedAt?.toLocaleDateString("en-AE", { dateStyle: "medium" })}</span>
                  <h3>{post.title}</h3><p>{post.excerpt}</p><span className="text-link">Read article <ArrowRight size={13} /></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
