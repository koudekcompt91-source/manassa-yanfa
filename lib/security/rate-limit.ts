type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function now() {
  return Date.now();
}

function cleanupExpired() {
  const t = now();
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= t) buckets.delete(key);
  }
}

export function getClientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for") || "";
  const realIp = req.headers.get("x-real-ip") || "";
  const fromForwarded = fwd.split(",")[0]?.trim();
  return fromForwarded || realIp || "unknown";
}

export function checkRateLimit(config: RateLimitConfig) {
  cleanupExpired();
  const t = now();
  const existing = buckets.get(config.key);
  if (!existing || existing.resetAt <= t) {
    buckets.set(config.key, { count: 1, resetAt: t + config.windowMs });
    return { ok: true as const, remaining: config.limit - 1, retryAfterSec: 0 };
  }

  if (existing.count >= config.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - t) / 1000));
    return { ok: false as const, remaining: 0, retryAfterSec };
  }

  existing.count += 1;
  buckets.set(config.key, existing);
  return { ok: true as const, remaining: Math.max(0, config.limit - existing.count), retryAfterSec: 0 };
}
