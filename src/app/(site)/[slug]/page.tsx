import type { Metadata } from "next";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { PageHero, RichText } from "@/components/public/sections";
import { entityMetadata } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

// Slugs owned by dedicated routes are never served from the CMS pages table.
const RESERVED = new Set(["about", "contact", "home", "services", "solutions", "industries", "projects", "blog", "careers", "admin", "login", "api"]);

async function loadPage(slug: string) {
  if (RESERVED.has(slug)) return null;
  const [page] = await db.select().from(pages).where(and(eq(pages.slug, slug), eq(pages.status, "PUBLISHED"))).limit(1);
  return page ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return {};
  return entityMetadata({ title: page.seoTitle || page.title, description: page.seoDescription || page.heroDescription || page.title, path: `/${page.slug}` });
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) notFound();
  return (
    <main id="main-content">
      <PageHero eyebrow={page.eyebrow || "RedMug"} title={page.heroTitle} description={page.heroDescription} crumbs={[{ label: page.title }]} />
      <section className="page-body">
        <div className="site-container" style={{ maxWidth: 820 }}>
          {page.isDemo && <div className="demo-notice">Sample content — replace through the admin Pages editor before publishing.</div>}
          <RichText content={page.content} />
          <p style={{ marginTop: 40, color: "var(--muted-2)", fontSize: 13 }}>Last updated {page.updatedAt.toLocaleDateString("en-AE", { dateStyle: "long" })}</p>
        </div>
      </section>
    </main>
  );
}
