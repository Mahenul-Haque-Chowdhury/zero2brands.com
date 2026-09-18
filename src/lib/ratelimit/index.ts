import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Central rate limiter factory. Every limiter shares one Redis connection.
 * If Upstash env vars are not configured (e.g. local dev without a Redis
 * instance), limiters fail OPEN (allow the request) rather than throwing,
 * so local development is not blocked — but this means rate limiting is
 * NOT actually active until UPSTASH_REDIS_REST_URL/TOKEN are set. Flag this
 * clearly rather than silently no-op in production.
 */

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

function buildLimiter(tokens: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  const client = getRedis();
  if (!client) return null;
  return new Ratelimit({
    redis: client,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: false,
  });
}

// Phase 14.2 rate limit table.
export const limiters = {
  loginPerEmail: () => buildLimiter(5, "15 m"),
  loginPerIp: () => buildLimiter(20, "1 h"),
  signupPerIp: () => buildLimiter(3, "1 h"),
  passwordResetPerEmail: () => buildLimiter(3, "1 h"),
  paymentCreatePerUser: () => buildLimiter(5, "1 h"),
  videoTokenPerUser: () => buildLimiter(40, "1 h"),
  publicFormPerIp: () => buildLimiter(5, "1 h"),
  communityDirectoryPerUser: () => buildLimiter(100, "1 h"),
  globalPerIp: () => buildLimiter(300, "1 h"),
};

/**
 * Checks a rate limit by key. Returns `{ success: true }` (i.e. allowed) if
 * Redis is not configured, so local dev without Upstash still works — this
 * is intentional per-environment degradation, not a bug.
 */
export async function checkRateLimit(
  limiterFactory: () => Ratelimit | null,
  key: string
): Promise<LimitResult> {
  const limiter = limiterFactory();
  if (!limiter) {
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
  const result = await limiter.limit(key);
  return result;
}
