import "server-only";

type Bucket = { count: number; resetAt: number };

const globalForLimit = globalThis as unknown as {
  __rateLimitMap?: Map<string, Bucket>;
};

function getMap(): Map<string, Bucket> {
  if (!globalForLimit.__rateLimitMap) {
    globalForLimit.__rateLimitMap = new Map();
  }
  return globalForLimit.__rateLimitMap;
}

function cleanupIfNeeded() {
  const map = getMap();
  const now = Date.now();
  // Nettoyage opportuniste pour éviter la croissance indéfinie
  if (map.size > 5000) {
    for (const [k, v] of map) {
      if (v.resetAt < now) map.delete(k);
    }
  }
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

/** Limite à fenêtre glissante simple en mémoire (par instance).
 *
 * Note : en serverless multi-instance (Vercel), le compte est par instance.
 * Pour un partage global, migrer vers Upstash Redis (voir ROADMAP P2).
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): RateLimitResult {
  cleanupIfNeeded();
  const now = Date.now();
  const map = getMap();
  const bucket = map.get(key);

  if (!bucket || bucket.resetAt < now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (bucket.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { allowed: true };
}

export function rateLimitMessage(retryAfterSeconds: number): string {
  const m = Math.ceil(retryAfterSeconds / 60);
  if (m <= 1) return `Trop de tentatives. Réessayez dans 1 minute.`;
  return `Trop de tentatives. Réessayez dans ${m} minutes.`;
}
