"use server";

import { requireAuth, requireRole } from "@/lib/auth-helpers";
import { assertFraterniteInGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export type EnfantActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function canManage(role: string, enfantFraterniteId: string, userFraterniteId: string | null) {
  if (role === "ADMIN") return true;
  if (role === "RESPONSABLE" && userFraterniteId === enfantFraterniteId) return true;
  return false;
}

export async function changerStatutEnfantAction(
  enfantId: string,
  nouveauStatut: "ACTIF" | "INACTIF"
): Promise<EnfantActionResult> {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé." };
  }

  const enfant = await prisma.enfant.findFirst({
    where: { id: enfantId, groupeId: session.user.groupeId },
    include: { fraternite: true },
  });
  if (!enfant) return { ok: false, error: "Enfant introuvable." };
  if (!canManage(session.user.role, enfant.fraterniteId, session.user.fraterniteId)) {
    return { ok: false, error: "Vous ne pouvez agir que dans votre fraternité." };
  }

  await prisma.enfant.update({
    where: { id: enfant.id },
    data: { statut: nouveauStatut },
  });

  await prisma.historique.create({
    data: {
      action: nouveauStatut === "INACTIF" ? "ENFANT_DESACTIVE" : "ENFANT_REACTIVE",
      details: `${enfant.nom} ${enfant.prenoms} (LJ-${String(enfant.numero).padStart(3, "0")}) → ${nouveauStatut}`,
      utilisateurId: session.user.id,
      groupeId: session.user.groupeId,
    },
  });

  return { ok: true, message: `${enfant.nom} ${enfant.prenoms} ${nouveauStatut === "INACTIF" ? "désactivé" : "réactivé"}.` };
}

export async function supprimerEnfantAction(enfantId: string): Promise<EnfantActionResult> {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé." };
  }

  const enfant = await prisma.enfant.findFirst({
    where: { id: enfantId, groupeId: session.user.groupeId },
    include: { fraternite: true },
  });
  if (!enfant) return { ok: false, error: "Enfant introuvable." };
  if (!canManage(session.user.role, enfant.fraterniteId, session.user.fraterniteId)) {
    return { ok: false, error: "Vous ne pouvez agir que dans votre fraternité." };
  }

  await prisma.enfant.delete({ where: { id: enfant.id } });

  await prisma.historique.create({
    data: {
      action: "ENFANT_SUPPRIME",
      details: `Données supprimées : ${enfant.nom} ${enfant.prenoms} (LJ-${String(enfant.numero).padStart(3, "0")}) — fraternité ${enfant.fraternite.nom}`,
      utilisateurId: session.user.id,
      groupeId: session.user.groupeId,
    },
  });

  return { ok: true, message: `Données de ${enfant.nom} ${enfant.prenoms} supprimées.` };
}

export async function exporterDonneesEnfantAction(enfantId: string): Promise<
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; error: string }
> {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE", "SECRETAIRE", "TRESORIERE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé." };
  }

  const enfant = await prisma.enfant.findFirst({
    where: { id: enfantId, groupeId: session.user.groupeId },
    include: {
      fraternite: true,
      presences: { orderBy: { date: "asc" } },
      cotisations: { orderBy: { date: "asc" } },
    },
  });
  if (!enfant) return { ok: false, error: "Enfant introuvable." };

  // RESPONSABLE : sa fraternité uniquement
  if (
    session.user.role === "RESPONSABLE" &&
    session.user.fraterniteId !== enfant.fraterniteId
  ) {
    return { ok: false, error: "Accès refusé à cette fraternité." };
  }

  const data = {
    enfant: {
      numero: enfant.numero,
      nom: enfant.nom,
      prenoms: enfant.prenoms,
      dateNaissance: enfant.dateNaissance.toISOString().slice(0, 10),
      cleDoublon: enfant.cleDoublon,
      classeEcole: enfant.classeEcole,
      serie: enfant.serie,
      classeCatechisme: enfant.classeCatechisme,
      telephoneParent: enfant.telephoneParent,
      statut: enfant.statut,
      fraternite: enfant.fraternite.nom,
      createdAt: enfant.createdAt.toISOString(),
      updatedAt: enfant.updatedAt.toISOString(),
    },
    presences: enfant.presences.map((p) => ({
      date: p.date.toISOString().slice(0, 10),
      etat: p.etat,
    })),
    cotisations: enfant.cotisations.map((c) => ({
      date: c.date.toISOString().slice(0, 10),
      montant: c.montant,
    })),
    exporteLe: new Date().toISOString(),
  };

  await prisma.historique.create({
    data: {
      action: "DONNEES_EXPORTEES",
      details: `Export des données personnelles de ${enfant.nom} ${enfant.prenoms} (LJ-${String(enfant.numero).padStart(3, "0")})`,
      utilisateurId: session.user.id,
      groupeId: session.user.groupeId,
    },
  });

  return { ok: true, data };
}
