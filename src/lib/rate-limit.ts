type Entry = { count: number; resetAt: number };
const globalStore = globalThis as typeof globalThis & { __redmugRateLimits?: Map<string, Entry> };
const store = globalStore.__redmugRateLimits ?? new Map<string, Entry>();
if (process.env.NODE_ENV !== "production") globalStore.__redmugRateLimits = store;

/** Drops expired entries so the in-process map cannot grow without bound. */
function sweep(now: number) {
  if (store.size < 500) return;
  for (const [key, entry] of store) if (entry.resetAt < now) store.delete(key);
}

export function checkRateLimit(key: string, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  sweep(now);
  const current = store.get(key);
  if (!current || current.resetAt < now) {
    store.set(key, { count: 0, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

/** Records a failure and returns the running count within the window. */
export function recordFailure(key: string, windowMs: number) {
  const now = Date.now();
  sweep(now);
  const current = store.get(key);
  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }
  current.count += 1;
  return current.count;
}

/** Clears a counter, e.g. after a successful login. */
export function clearRateLimit(key: string) {
  store.delete(key);
}

/**
 * Best-effort client identity. Behind a reverse proxy every visitor can share
 * one address, so this must never be the sole basis for blocking access —
 * rate limits are scoped per credential as well.
 */
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate = forwarded?.split(",")[0]?.trim();
  return candidate || "unknown";
}
