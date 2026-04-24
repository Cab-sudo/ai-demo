// Simple in-memory rate limiter (per-instance). For prod, swap to Upstash Redis.
const buckets = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1h

export function checkRateLimit(userId: string): { ok: boolean; remaining: number } {
  const now = Date.now();
  const b = buckets.get(userId);
  if (!b || b.resetAt < now) {
    buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: LIMIT - 1 };
  }
  if (b.count >= LIMIT) return { ok: false, remaining: 0 };
  b.count += 1;
  return { ok: true, remaining: LIMIT - b.count };
}
