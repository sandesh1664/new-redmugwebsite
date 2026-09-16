import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const SESSION_COOKIE = "redmug_session";
const SESSION_DAYS = 7;

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR";
export type AuthUser = { id: string; name: string; email: string; role: UserRole; avatarUrl: string | null };

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function verifyCredentials(email: string, password: string): Promise<AuthUser | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
  if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) return null;
  await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));
  return { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl };
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ userId, tokenHash: hashToken(token), expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
      active: users.active,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!row || !row.active) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role, avatarUrl: row.avatarUrl };
}

export function hasRole(user: AuthUser, allowed: UserRole[]) {
  return allowed.includes(user.role);
}

export async function requireApiUser(allowed: UserRole[] = ["SUPER_ADMIN", "ADMIN", "EDITOR"]) {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: Response.json({ error: "Authentication required" }, { status: 401 }) };
  if (!hasRole(user, allowed)) return { user: null, error: Response.json({ error: "You do not have permission for this action" }, { status: 403 }) };
  return { user, error: null };
}
