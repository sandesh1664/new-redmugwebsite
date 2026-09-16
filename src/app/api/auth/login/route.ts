import { NextRequest } from "next/server";
import { clearRateLimit, clientIp, recordFailure } from "@/lib/rate-limit";
import { createSession, verifyCredentials } from "@/lib/auth";
import { loginSchema, zodErrorMessage } from "@/lib/validation";

const MAX_FAILURES = 8;
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: zodErrorMessage(parsed.error) }, { status: 400 });

  const { email, password } = parsed.data;
  const ip = clientIp(request);

  // Credentials are verified BEFORE any throttling decision, so a correct password
  // can never be rejected by the rate limiter. Only failures accumulate, tracked per
  // address and per credential so a shared proxy IP cannot lock out unrelated users.
  const user = await verifyCredentials(email, password);
  if (user) {
    clearRateLimit(`login-fail:ip:${ip}`);
    clearRateLimit(`login-fail:email:${email}`);
    await createSession(user.id);
    return Response.json({ user: { name: user.name, role: user.role } });
  }

  const failures = Math.max(
    recordFailure(`login-fail:ip:${ip}`, WINDOW_MS),
    recordFailure(`login-fail:email:${email}`, WINDOW_MS),
  );

  if (failures > MAX_FAILURES) {
    return Response.json({ error: "Too many failed attempts. Please wait a few minutes and try again." }, { status: 429 });
  }

  return Response.json({ error: "Invalid email or password" }, { status: 401 });
}
