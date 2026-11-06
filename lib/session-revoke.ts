import "server-only";

import { prisma } from "@/lib/prisma";

// Cache en mémoire pour éviter les requêtes DB à chaque requête
const revokedEpochCache = new Map<string, { value: number | null; expires: number }>();

/** Retourne le timestamp de la dernière révocation de sessions pour ce groupe. */
export async function getRevokedEpoch(groupeId: string): Promise<number | null> {
  const cached = revokedEpochCache.get(groupeId);
  if (cached && cached.expires > Date.now()) {
    return cached.value;
  }
  const latest = await prisma.historique.findFirst({
    where: { groupeId, action: "SESSIONS_REVOKED" },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  const value = latest ? latest.createdAt.getTime() : null;
  revokedEpochCache.set(groupeId, { value, expires: Date.now() + 10000 });
  return value;
}

/** Invalide le cache après une révocation. */
export function invalidateRevokedEpochCache(groupeId: string) {
  revokedEpochCache.delete(groupeId);
}
