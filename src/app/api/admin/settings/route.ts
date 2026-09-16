import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireApiUser } from "@/lib/auth";
import { settingsSchema, zodErrorMessage } from "@/lib/validation";

export async function GET() {
  const auth = await requireApiUser(["SUPER_ADMIN", "ADMIN"]);
  if (auth.error) return auth.error;
  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "main")).limit(1);
  return Response.json({ settings });
}

export async function PUT(request: Request) {
  const auth = await requireApiUser(["SUPER_ADMIN", "ADMIN"]);
  if (auth.error) return auth.error;
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  const value = { ...parsed.data, googleRating: String(parsed.data.googleRating), updatedAt: new Date() };
  const [settings] = await db.update(siteSettings).set(value).where(eq(siteSettings.id, "main")).returning();
  return Response.json({ settings, message: "Site settings saved" });
}
