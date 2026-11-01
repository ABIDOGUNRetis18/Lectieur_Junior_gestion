"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth-helpers";
import { assertFraterniteInGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  inscriptionSchema,
  type InscriptionInput,
} from "@/lib/schemas/inscription";
import {
  normalizeNom,
  normalizePrenoms,
  makeCleDoublon,
} from "@/lib/normalization";

export type InscriptionResult =
  | {
      ok: true;
      results: Array<{
        nom: string;
        prenoms: string;
        status: "ajoute" | "doublon";
        numero?: number;
        fraternite?: string;
        statut?: string;
      }>;
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function inscrireEnfantsAction(
  input: InscriptionInput
): Promise<InscriptionResult> {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé : rôle insuffisant." };
  }

  const parsed = inscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const data = parsed.data;

  // Fraternité doit appartenir au groupe
  let frat;
  try {
    frat = await assertFraterniteInGroup(data.fraterniteId, session.user.groupeId);
  } catch {
    return { ok: false, error: "Fraternité introuvable pour ce groupe." };
  }

  // RESPONSABLE ne peut inscrire que dans sa propre fraternité
  if (
    session.user.role === "RESPONSABLE" &&
    session.user.fraterniteId !== data.fraterniteId
  ) {
    return {
      ok: false,
      error: "Vous ne pouvez inscrire des enfants que dans votre fraternité.",
    };
  }

  const groupeId = session.user.groupeId;
  const maxAgg = await prisma.enfant.aggregate({
    where: { groupeId },
    _max: { numero: true },
  });
  let nextNumero = (maxAgg._max.numero ?? 0) + 1;

  type ResultItem = {
    nom: string;
    prenoms: string;
    status: "ajoute" | "doublon";
    numero?: number;
    fraternite?: string;
    statut?: string;
  };
  const results: ResultItem[] = [];

  for (const e of data.enfants) {
    const nom = normalizeNom(e.nom);
    const prenoms = normalizePrenoms(e.prenoms);
    const dateNaissance = new Date(e.dateNaissance);
    const cle = makeCleDoublon(nom, prenoms, dateNaissance);

    const existing = await prisma.enfant.findUnique({
      where: { groupeId_cleDoublon: { groupeId, cleDoublon: cle } },
      include: { fraternite: true },
    });

    if (existing) {
      results.push({
        nom,
        prenoms,
        status: "doublon",
        fraternite: existing.fraternite.nom,
        statut: existing.statut,
      });
      await prisma.historique.create({
        data: {
          action: "DOUBLON_INSCRIPTION",
          details: `${nom} ${prenoms} déjà inscrit dans ${existing.fraternite.nom} (${existing.statut})`,
          utilisateurId: session.user.id,
          groupeId,
        },
      });
      continue;
    }

    let serie: string | null = null;
    if (["SECONDE", "PREMIERE", "TERMINALE"].includes(e.classeEcole)) {
      if (e.serie && e.serie !== "AUTRE") serie = e.serie;
      else if (e.serie === "AUTRE" && e.serieAutre?.trim())
        serie = `Autre: ${e.serieAutre.trim()}`;
    }

    const numero = nextNumero++;
    await prisma.enfant.create({
      data: {
        numero,
        nom,
        prenoms,
        dateNaissance,
        cleDoublon: cle,
        classeEcole: e.classeEcole,
        serie,
        classeCatechisme: e.classeCatechisme,
        telephoneParent: e.telephoneParent?.trim() || null,
        statut: "ACTIF",
        fraterniteId: data.fraterniteId,
        groupeId,
      },
    });
    results.push({ nom, prenoms, status: "ajoute", numero });
    await prisma.historique.create({
      data: {
        action: "INSCRIPTION",
        details: `${nom} ${prenoms} inscrit (LJ-${String(numero).padStart(3, "0")})`,
        utilisateurId: session.user.id,
        groupeId,
      },
    });
  }

  return { ok: true, results };
}
