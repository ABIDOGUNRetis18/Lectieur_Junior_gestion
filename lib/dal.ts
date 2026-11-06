import "server-only";

/** Couche d'accès aux données (DAL). */
import { requireRole, requireGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// ---------- Fraternités ----------

export async function getFraternites() {
  const groupeId = await requireGroup();
  return prisma.fraternite.findMany({
    where: { groupeId },
    orderBy: { nom: "asc" },
  });
}

export async function getFraternitesAvecCount() {
  const groupeId = await requireGroup();
  const fraternites = await prisma.fraternite.findMany({
    where: { groupeId },
    orderBy: { nom: "asc" },
    include: {
      _count: {
        select: { enfants: { where: { statut: "ACTIF" } } },
      },
    },
  });
  return fraternites.map((f) => ({
    id: f.id,
    nom: f.nom,
    enfantsCount: f._count.enfants,
  }));
}

export async function getFraterniteById(id: string) {
  const groupeId = await requireGroup();
  return prisma.fraternite.findFirst({ where: { id, groupeId } });
}

/** Statistiques d'une fraternité : nb de présences « présent » + total des cotisations. */
export async function getStatsFraternite(fraterniteId: string) {
  const groupeId = await requireGroup();
  const enfants = await prisma.enfant.findMany({
    where: { groupeId, fraterniteId, statut: "ACTIF" },
    select: { id: true },
  });
  const enfantIds = enfants.map((e) => e.id);

  if (enfantIds.length === 0) {
    return { presencesPresentes: 0, totalCotisations: 0, enfantsCount: 0 };
  }

  const [presencesPresentes, totalCotisations] = await Promise.all([
    prisma.presence.count({
      where: { groupeId, enfantId: { in: enfantIds }, etat: "PRESENT" },
    }),
    prisma.cotisation.aggregate({
      where: { groupeId, enfantId: { in: enfantIds } },
      _sum: { montant: true },
    }),
  ]);

  return {
    presencesPresentes,
    totalCotisations: totalCotisations._sum.montant ?? 0,
    enfantsCount: enfants.length,
  };
}

// ---------- Enfants (lecture) ----------

/** Tous les enfants du groupe (actifs et inactifs) — pour les filtres du tableau. */
export async function getEnfants(fraterniteId?: string) {
  const groupeId = await requireGroup();
  return prisma.enfant.findMany({
    where: {
      groupeId,
      ...(fraterniteId ? { fraterniteId } : {}),
    },
    include: { fraternite: true },
    orderBy: [{ nom: "asc" }, { prenoms: "asc" }],
  });
}

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

export async function getAdminsAndResponsables() {
  const groupeId = await requireGroup();
  const admins = await prisma.user.findMany({
    where: { groupeId, role: "ADMIN" },
    include: { fraternite: true },
    orderBy: { nom: "asc" },
  });
  const responsables = await prisma.user.findMany({
    where: { groupeId, role: "RESPONSABLE" },
    include: { fraternite: true },
    orderBy: [{ fraternite: { nom: "asc" } }, { nom: "asc" }],
  });
  return { admins, responsables };
}

// ---------- Groupe ----------

export async function getGroupeCourant() {
  const groupeId = await requireGroup();
  return prisma.groupe.findUnique({ where: { id: groupeId } });
}