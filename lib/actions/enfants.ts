"use server";

import { requireAuth } from "@/lib/auth-helpers";
import { assertFraterniteInGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { normalizeNom, normalizePrenoms, makeCleDoublon } from "@/lib/normalization";

export type EnfantActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

const classeEcoleEnum = z.enum([
  "AVANT_CM1", "CM1", "CM2", "SIXIEME", "CINQUIEME", "QUATRIEME",
  "TROISIEME", "SECONDE", "PREMIERE", "TERMINALE", "SUPERIEUR", "TERMINEE",
]);
const classeCatechismeEnum = z.enum([
  "ANNEE_1", "ANNEE_2", "ANNEE_3", "ANNEE_4", "ANNEE_5", "TERMINE",
]);

const roleEnfantEnum = z.enum(["ENFANT", "RESPONSABLE"]);

const modifierSchema = z.object({
  enfantId: z.string().min(1),
  nom: z.string().min(1, "Nom requis").max(100),
  prenoms: z.string().min(1, "Prénoms requis").max(100),
  dateNaissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  classeEcole: classeEcoleEnum,
  serie: z.string().optional().nullable(),
  serieAutre: z.string().max(50).optional().nullable(),
  classeCatechisme: classeCatechismeEnum,
  telephoneParent: z.string().optional().nullable(),
  fraterniteId: z.string().min(1),
  role: roleEnfantEnum,
});

export type ModifierEnfantResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function modifierEnfantAction(input: z.infer<typeof modifierSchema>): Promise<ModifierEnfantResult> {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé." };
  }

  const parsed = modifierSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const data = parsed.data;

  const enfant = await prisma.enfant.findFirst({
    where: { id: data.enfantId, groupeId: session.user.groupeId },
    include: { fraternite: true },
  });
  if (!enfant) return { ok: false, error: "Enfant introuvable." };

  if (session.user.role === "RESPONSABLE" && session.user.fraterniteId !== enfant.fraterniteId) {
    return { ok: false, error: "Vous ne pouvez modifier que les enfants de votre fraternité." };
  }

  // New fraternity must belong to group
  try {
    await assertFraterniteInGroup(data.fraterniteId, session.user.groupeId);
  } catch {
    return { ok: false, error: "Fraternité introuvable." };
  }
  if (session.user.role === "RESPONSABLE" && data.fraterniteId !== session.user.fraterniteId) {
    return { ok: false, error: "Vous ne pouvez pas changer la fraternité." };
  }

  // Normalisation identique à l'inscription pour que cleDoublon reste cohérente
  // (accents, espaces et casse).
  const nom = normalizeNom(data.nom);
  const prenoms = normalizePrenoms(data.prenoms);
  const dateNaissance = new Date(`${data.dateNaissance}T00:00:00.000Z`);
  const newCle = makeCleDoublon(nom, prenoms, dateNaissance);

  // Anti-doublon check (if identity changed)
  if (newCle !== enfant.cleDoublon) {
    const existing = await prisma.enfant.findUnique({
      where: { groupeId_cleDoublon: { groupeId: session.user.groupeId, cleDoublon: newCle } },
    });
    if (existing && existing.id !== enfant.id) {
      return { ok: false, error: "Un autre enfant avec ces informations existe déjà." };
    }
  }

  // Série handling (même format que l'inscription : « Autre: précision »)
  let serie: string | null = null;
  if (["SECONDE", "PREMIERE", "TERMINALE"].includes(data.classeEcole)) {
    if (data.serie && data.serie !== "AUTRE") serie = data.serie;
    else if (data.serie === "AUTRE" && data.serieAutre?.trim())
      serie = `Autre: ${data.serieAutre.trim()}`;
  }

  const changes: string[] = [];
  if (enfant.nom !== nom) changes.push(`nom: ${enfant.nom} → ${nom}`);
  if (enfant.prenoms !== prenoms) changes.push(`prénoms: ${enfant.prenoms} → ${prenoms}`);
  if (enfant.classeEcole !== data.classeEcole) changes.push(`classe: ${enfant.classeEcole} → ${data.classeEcole}`);
  if (enfant.classeCatechisme !== data.classeCatechisme) changes.push(`catéchisme: ${enfant.classeCatechisme} → ${data.classeCatechisme}`);
  if ((enfant.telephoneParent ?? "") !== (data.telephoneParent?.trim() ?? "")) changes.push("téléphone modifié");
  if (enfant.fraterniteId !== data.fraterniteId) changes.push("fraternité modifiée");
  if (enfant.role !== data.role) changes.push(`rôle: ${enfant.role} → ${data.role}`);

  await prisma.enfant.update({
    where: { id: enfant.id },
    data: {
      nom,
      prenoms,
      dateNaissance,
      cleDoublon: newCle,
      classeEcole: data.classeEcole,
      serie,
      classeCatechisme: data.classeCatechisme,
      telephoneParent: data.telephoneParent?.trim() || null,
      fraterniteId: data.fraterniteId,
      role: data.role,
    },
  });

  await prisma.historique.create({
    data: {
      action: "ENFANT_MODIFIE",
      details: `${nom} ${prenoms} modifié${changes.length ? " — " + changes.join(", ") : ""}`,
      utilisateurId: session.user.id,
      groupeId: session.user.groupeId,
    },
  });

  return { ok: true, message: "Enfant modifié." };
}

// ---------- Statut / suppression / export ----------

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
  const canManage =
    session.user.role === "ADMIN" ||
    (session.user.role === "RESPONSABLE" && session.user.fraterniteId === enfant.fraterniteId);
  if (!canManage) return { ok: false, error: "Vous ne pouvez agir que dans votre fraternité." };

  await prisma.enfant.update({ where: { id: enfant.id }, data: { statut: nouveauStatut } });

  await prisma.historique.create({
    data: {
      action: nouveauStatut === "INACTIF" ? "ENFANT_DESACTIVE" : "ENFANT_REACTIVE",
      details: `${enfant.nom} ${enfant.prenoms} → ${nouveauStatut}`,
      utilisateurId: session.user.id,
      groupeId: session.user.groupeId,
    },
  });

  return { ok: true, message: `${enfant.nom} ${enfant.prenoms} ${nouveauStatut === "INACTIF" ? "désactivé" : "réactivé"}.` };
}

export async function supprimerEnfantsAction(
  enfantIds: string[]
): Promise<{ ok: true; count: number; message: string } | { ok: false; error: string }> {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé." };
  }
  if (!Array.isArray(enfantIds) || enfantIds.length === 0) {
    return { ok: false, error: "Aucun enfant sélectionné." };
  }

  const enfants = await prisma.enfant.findMany({
    where: { id: { in: enfantIds }, groupeId: session.user.groupeId },
    include: { fraternite: true },
  });

  const allowed = enfants.filter(
    (e) =>
      session.user.role === "ADMIN" ||
      (session.user.role === "RESPONSABLE" && session.user.fraterniteId === e.fraterniteId)
  );

  if (allowed.length === 0) {
    return { ok: false, error: "Aucun enfant supprimable dans votre périmètre." };
  }

  const ids = allowed.map((e) => e.id);
  const res = await prisma.enfant.deleteMany({ where: { id: { in: ids } } });

  await prisma.historique.create({
    data: {
      action: "ENFANTS_SUPPRIMES",
      details: `Suppression groupée de ${res.count} enfant(s) : ${allowed
        .map((e) => `${e.nom} ${e.prenoms}`)
        .join(", ")}`,
      utilisateurId: session.user.id,
      groupeId: session.user.groupeId,
    },
  });

  return { ok: true, count: res.count, message: `${res.count} enfant(s) supprimé(s).` };
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
  const canManage =
    session.user.role === "ADMIN" ||
    (session.user.role === "RESPONSABLE" && session.user.fraterniteId === enfant.fraterniteId);
  if (!canManage) return { ok: false, error: "Vous ne pouvez agir que dans votre fraternité." };

  await prisma.enfant.delete({ where: { id: enfant.id } });

  await prisma.historique.create({
    data: {
      action: "ENFANT_SUPPRIME",
      details: `Données supprimées : ${enfant.nom} ${enfant.prenoms} — fraternité ${enfant.fraternite.nom}`,
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
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
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

  if (session.user.role === "RESPONSABLE" && session.user.fraterniteId !== enfant.fraterniteId) {
    return { ok: false, error: "Accès refusé à cette fraternité." };
  }

  const data = {
    enfant: {
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
    presences: enfant.presences.map((p) => ({ date: p.date.toISOString().slice(0, 10), etat: p.etat })),
    cotisations: enfant.cotisations.map((c) => ({ date: c.date.toISOString().slice(0, 10), montant: c.montant })),
    exporteLe: new Date().toISOString(),
  };

  await prisma.historique.create({
    data: {
      action: "DONNEES_EXPORTEES",
      details: `Export des données personnelles de ${enfant.nom} ${enfant.prenoms}`,
      utilisateurId: session.user.id,
      groupeId: session.user.groupeId,
    },
  });

  return { ok: true, data };
}
