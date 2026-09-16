import { NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { careers, jobApplications } from "@/db/schema";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { applicationSchema, zodErrorMessage } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!checkRateLimit(`application:${ip}`, 15, 30 * 60 * 1000)) return Response.json({ error: "Too many applications. Please try again later." }, { status: 429 });
  const parsed = applicationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });
  const { website, ...data } = parsed.data;
  if (website) return Response.json({ success: true });
  const [career] = await db.select({ id: careers.id }).from(careers).where(and(eq(careers.id, data.careerId), eq(careers.status, "OPEN"))).limit(1);
  if (!career) return Response.json({ error: "This position is no longer accepting applications" }, { status: 409 });
  const [application] = await db.insert(jobApplications).values({ ...data, status: "NEW", isDemo: false }).returning({ id: jobApplications.id });
  return Response.json({ success: true, reference: application.id.slice(0, 8).toUpperCase() }, { status: 201 });
}
