// Simple in-memory rate limiter for single-instance or serverless environments.
// Note: In a distributed edge or multi-instance deployment, Redis (e.g. Upstash) is recommended.

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return true; // Allowed
  }

  // If the window has passed, reset the counter
  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    return true; // Allowed
  }

  // If within the window, check the count
  if (record.count >= limit) {
    return false; // Rate limited
  }

  record.count += 1;
  return true; // Allowed
}
