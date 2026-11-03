/**
 * Couche d'accès aux données (DAL).
 * Règle : TOUTE requête est filtrée par le groupeId de l'utilisateur connecté.
 * On centralise ce filtre ici plutôt que de le répéter dans chaque action.
 */
import { requireAuth, requireRole, requireGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// ---------- Fraternités ----------

export async function getFraternites() {
  const groupeId = await requireGroup();
  return prisma.fraternite.findMany({
    where: { groupeId },
    orderBy: { nom: "asc" },
  });
}

export async function getFraterniteById(id: string) {
  const groupeId = await requireGroup();
  return prisma.fraternite.findFirst({ where: { id, groupeId } });
}

// ---------- Enfants (lecture) ----------

export async function getEnfantsActifs(fraterniteId?: string) {
  const groupeId = await requireGroup();
  return prisma.enfant.findMany({
    where: {
      groupeId,
      statut: "ACTIF",
      ...(fraterniteId ? { fraterniteId } : {}),
    },
    include: { fraternite: true },
    orderBy: [{ nom: "asc" }, { prenoms: "asc" }],
  });
}

export async function getEnfants(filters?: {
  q?: string;
  fraterniteId?: string;
  statut?: "ACTIF" | "INACTIF" | "ALL";
}) {
  const groupeId = await requireGroup();
  const statut = filters?.statut ?? "ALL";
  return prisma.enfant.findMany({
    where: {
      groupeId,
      ...(filters?.fraterniteId ? { fraterniteId: filters.fraterniteId } : {}),
      ...(statut !== "ALL" ? { statut } : {}),
      ...(filters?.q
        ? {
            OR: [
              { nom: { contains: filters.q, mode: "insensitive" } },
              { prenoms: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { fraternite: true },
    orderBy: [{ nom: "asc" }, { prenoms: "asc" }],
  });
}

export async function getEnfantById(id: string) {
  const groupeId = await requireGroup();
  const statut = filters?.statut ?? "ALL";
  return prisma.enfant.findMany({
    where: {
      groupeId,
      ...(filters?.fraterniteId ? { fraterniteId: filters.fraterniteId } : {}),
      ...(statut !== "ALL" ? { statut } : {}),
      ...(filters?.q
        ? {
            OR: [
              { nom: { contains: filters.q, mode: "insensitive" } },
              { prenoms: { contains: filters.q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { fraternite: true },
    orderBy: [{ nom: "asc" }, { prenoms: "asc" }],
  });
}

export async function getEnfantWithDetails(id: string) {
  const groupeId = await requireGroup();
  return prisma.enfant.findFirst({
    where: { id, groupeId },
    include: {
      fraternite: true,
      presences: { orderBy: { date: "desc" } },
      cotisations: { orderBy: { date: "desc" } },
    },
  });
}

export async function getEnfantWithDetails(id: string) {
  const groupeId = await requireGroup();
  return prisma.enfant.findFirst({
    where: { id, groupeId },
    include: {
      fraternite: true,
      presences: { orderBy: { date: "desc" } },
      cotisations: { orderBy: { date: "desc" } },
    },
  });
}

// ---------- Utilisateurs ----------

export async function getUtilisateurs() {
  await requireRole("ADMIN");
  const groupeId = await requireGroup();
  return prisma.user.findMany({
    where: { groupeId },
    include: { fraternite: true },
    orderBy: { nom: "asc" },
  });
}

// ---------- Groupe ----------

export async function getGroupeCourant() {
  const groupeId = await requireGroup();
  return prisma.groupe.findUnique({ where: { id: groupeId } });
}
