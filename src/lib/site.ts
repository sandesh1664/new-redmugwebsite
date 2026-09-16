import "server-only";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { seoSettings, siteSettings } from "@/db/schema";

export const getSiteSettings = cache(async () => {
  try {
    const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "main")).limit(1);
    return settings ?? null;
  } catch {
    // A database hiccup should degrade gracefully rather than 500 every public page.
    return null;
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
    // CMS SEO titles already include the brand, so bypass the layout template.
    title: { absolute: title },
    description,
    alternates: { canonical: seo?.canonicalUrl || route },
    robots: { index: !noIndex, follow: !noFollow },
    // Defining an openGraph object at page level overrides the file-convention
    // og image, so only emit it when the CMS actually supplies an image.
    ...(seo?.openGraphImage ? { openGraph: { title, description, images: [seo.openGraphImage] } } : {}),
  };
}

/** Wraps a title that already carries the brand so the layout template is not applied twice. */
export function brandTitle(title: string): { absolute: string } {
  return { absolute: title };
}
