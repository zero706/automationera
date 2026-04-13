import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _limiter: Ratelimit | null = null;

/**
 * Returns a rate limiter configured to use Upstash Redis when env vars are
 * available. If Upstash isn't configured, returns `null` so call sites can
 * fall back to allowing the request (useful for local dev).
 */
export function getRateLimiter(): Ratelimit | null {
  if (_limiter) return _limiter;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  _limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    analytics: true,
    prefix: "leadhuntr",
  });
  return _limiter;
}

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
}> {
  const limiter = getRateLimiter();
  if (!limiter) return { success: true, remaining: Infinity };
  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
