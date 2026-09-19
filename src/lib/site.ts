import "server-only";
import type { Metadata } from "next";
import { and, asc, eq, inArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { pages, seoSettings, services, siteSettings, solutions } from "@/db/schema";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://redmugitsolution.ae").replace(/\/$/, "");

/** Slugs for CMS pages that render in the footer legal navigation when published. */
export const LEGAL_PAGE_SLUGS = ["privacy-policy", "terms"];

export const getSiteSettings = cache(async () => {
  try {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "main")).limit(1);
    return settings ?? null;
  } catch {
    // A database hiccup should degrade gracefully rather than 500 every public page.
    return null;
  }
});

/** Published services/solutions used by the header mega menu and footer. */
export const getNavigationData = cache(async () => {
  try {
    const [serviceRows, solutionRows, legalRows] = await Promise.all([
      db.select({ name: services.name, slug: services.slug, icon: services.icon, shortDescription: services.shortDescription }).from(services).where(eq(services.status, "PUBLISHED")).orderBy(asc(services.displayOrder)).limit(8),
      db.select({ name: solutions.name, slug: solutions.slug }).from(solutions).where(eq(solutions.status, "PUBLISHED")).orderBy(asc(solutions.displayOrder)).limit(6),
      db.select({ title: pages.title, slug: pages.slug }).from(pages).where(and(eq(pages.status, "PUBLISHED"), inArray(pages.slug, LEGAL_PAGE_SLUGS))),
    ]);
    return { services: serviceRows, solutions: solutionRows, legalPages: legalRows };
  } catch {
    return { services: [], solutions: [], legalPages: [] };
  }
});

export const getSeoForRoute = cache(async (route: string) => {
  try {
    const [seo] = await db.select().from(seoSettings).where(eq(seoSettings.route, route)).limit(1);
    return seo ?? null;
  } catch {
    return null;
  }
});

export async function buildRouteMetadata(route: string, fallback: { title: string; description: string }): Promise<Metadata> {
  const seo = await getSeoForRoute(route);
  const title = seo?.title || fallback.title;
  const description = seo?.description || fallback.description;
  const noIndex = seo?.robots.startsWith("noindex") ?? false;
  const noFollow = seo?.robots.endsWith("nofollow") ?? false;
  return {
    // CMS SEO titles already include the brand when set, so bypass the layout template.
    title: seo?.title ? { absolute: title } : title,
    description,
    alternates: { canonical: seo?.canonicalUrl || route },
    robots: { index: !noIndex, follow: !noFollow },
    openGraph: { title, description, url: route, ...(seo?.openGraphImage ? { images: [seo.openGraphImage] } : {}) },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Wraps a title that already carries the brand so the layout template is not applied twice. */
export function brandTitle(title: string): { absolute: string } {
  return { absolute: title };
}

/** Metadata for CMS-backed detail pages (services, projects, posts). */
export function entityMetadata(input: { title: string; description: string; path: string; image?: string | null; type?: "website" | "article"; publishedTime?: string; noIndex?: boolean }): Metadata {
  const title = input.title;
  return {
    title,
    description: input.description,
    alternates: { canonical: input.path },
    robots: input.noIndex ? { index: false, follow: false } : undefined,
    openGraph: { title, description: input.description, url: input.path, type: input.type ?? "website", ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}), ...(input.image ? { images: [input.image] } : {}) },
    twitter: { card: "summary_large_image", title, description: input.description, ...(input.image ? { images: [input.image] } : {}) },
  };
}

export function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
