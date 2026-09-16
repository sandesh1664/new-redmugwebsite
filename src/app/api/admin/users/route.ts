import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { requireApiUser } from "@/lib/auth";

const userSchema = z.object({ name: z.string().trim().min(2).max(160), email: z.email().max(255), password: z.string().min(12).max(200).optional(), role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]), active: z.boolean().default(true) });

export async function GET() {
  const auth = await requireApiUser(["SUPER_ADMIN"]);
  if (auth.error) return auth.error;
  const records = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, lastLoginAt: users.lastLoginAt, createdAt: users.createdAt }).from(users);
  return Response.json({ records });
}

export async function POST(request: Request) {
  const auth = await requireApiUser(["SUPER_ADMIN"]);
  if (auth.error) return auth.error;
  const parsed = userSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parsed.data.password) return Response.json({ error: "Name, valid email, role and a 12+ character password are required" }, { status: 400 });
  try {
    const [user] = await db.insert(users).values({ ...parsed.data, email: parsed.data.email.toLowerCase(), passwordHash: await bcrypt.hash(parsed.data.password, 12) }).returning({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active });
    return Response.json({ user }, { status: 201 });
  } catch {
    return Response.json({ error: "A user with that email already exists" }, { status: 409 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireApiUser(["SUPER_ADMIN"]);
  if (auth.error) return auth.error;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body?.id) return Response.json({ error: "User ID is required" }, { status: 400 });
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Please check the user details" }, { status: 400 });
  const { password, ...profile } = parsed.data;
  const value = password ? { ...profile, email: profile.email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12), updatedAt: new Date() } : { ...profile, email: profile.email.toLowerCase(), updatedAt: new Date() };
  const [user] = await db.update(users).set(value).where(eq(users.id, String(body.id))).returning({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active });
  if (!profile.active) await db.delete(sessions).where(eq(sessions.userId, String(body.id)));
  return Response.json({ user });
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser(["SUPER_ADMIN"]);
  if (auth.error) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id || id === auth.user?.id) return Response.json({ error: "You cannot delete your own active account" }, { status: 400 });
  await db.delete(users).where(eq(users.id, id));
  return Response.json({ message: "User deleted" });
}
