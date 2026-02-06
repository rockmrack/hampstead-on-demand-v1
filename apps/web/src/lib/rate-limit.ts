/**
 * Simple in-memory rate limiter for serverless environments.
 *
 * Uses a sliding window counter per key (IP or user ID).
 * State is per-instance, so it resets on cold starts — acceptable for MVP.
 * For production scale, swap to Upstash Redis (@upstash/ratelimit).
 */

type Entry = { count: number; resetAt: number };

const stores = new Map<string, Map<string, Entry>>();

function getStore(name: string): Map<string, Entry> {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

interface RateLimitConfig {
  /** Unique name for this limiter (e.g. "magic-link", "api-messages") */
  name: string;
  /** Maximum requests allowed in the window */
  max: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request should be allowed under the rate limit.
 *
 * @param key - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and remaining quota
 */
export function rateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const store = getStore(config.name);
  const now = Date.now();
  const entry = store.get(key);

  // Purge expired entries periodically (every 100 calls)
  if (Math.random() < 0.01) {
    for (const [k, v] of store) {
      if (v.resetAt < now) store.delete(k);
    }
  }

  if (!entry || entry.resetAt < now) {
    // New window
    const resetAt = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: config.max - 1, resetAt };
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.max - entry.count, resetAt: entry.resetAt };
}

/**
 * Extract client IP from request headers (Vercel sets x-forwarded-for).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

// ─── Pre-configured limiters ────────────────────────────────────────────────

/** Magic link / auth: 5 requests per 60 seconds per IP */
export function rateLimitAuth(ip: string): RateLimitResult {
  return rateLimit(ip, { name: "auth", max: 5, windowSeconds: 60 });
}

/** API writes (messages, requests, uploads): 20 per 60 seconds per IP */
export function rateLimitApi(ip: string): RateLimitResult {
  return rateLimit(ip, { name: "api-write", max: 20, windowSeconds: 60 });
}

/** Waitlist: 3 per 60 seconds per IP */
export function rateLimitWaitlist(ip: string): RateLimitResult {
  return rateLimit(ip, { name: "waitlist", max: 3, windowSeconds: 60 });
}
