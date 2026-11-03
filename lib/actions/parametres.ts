"use server";

import { requireAuth, requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  groupeSettingsSchema,
  type GroupeSettingsInput,
} from "@/lib/schemas/parametres";

export type SettingsResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function updateGroupeAction(
  input: GroupeSettingsInput
): Promise<SettingsResult> {
  await requireRole("ADMIN");

  const parsed = groupeSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Données invalides.",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const session = await requireAuth();
  const groupeId = session.user.groupeId;
  const data = parsed.data;

  const avant = await prisma.groupe.findUnique({ where: { id: groupeId } });
  if (!avant) return { ok: false, error: "Groupe introuvable." };

  await prisma.groupe.update({
    where: { id: groupeId },
    data: {
      nom: data.nom.trim(),
      montantCotisation: data.montantCotisation,
      premierDimanche: new Date(data.premierDimanche + "T00:00:00Z"),
      moisDebutAnnee: data.moisDebutAnnee,
      moisSansReunion: [...data.moisSansReunion].sort((a, b) => a - b),
    },
  });

  const changements: string[] = [];
  if (avant.nom !== data.nom.trim()) changements.push(`nom : « ${avant.nom} » → « ${data.nom.trim()} »`);
  if (avant.montantCotisation !== data.montantCotisation)
    changements.push(`cotisation : ${avant.montantCotisation} F → ${data.montantCotisation} F`);
  if (avant.moisDebutAnnee !== data.moisDebutAnnee)
    changements.push(`début d'année : mois ${avant.moisDebutAnnee} → mois ${data.moisDebutAnnee}`);
  const ancienSans = [...avant.moisSansReunion].sort((a, b) => a - b).join(",");
  const nouveauSans = [...data.moisSansReunion].sort((a, b) => a - b).join(",");
  if (ancienSans !== nouveauSans) changements.push(`mois sans réunion : ${ancienSans} → ${nouveauSans}`);

  await prisma.historique.create({
    data: {
      action: "PARAMETRES_MODIFIES",
      details: changements.length
        ? `Paramètres modifiés — ${changements.join(" ; ")}`
        : "Paramètres du groupe enregistrés",
      utilisateurId: session.user.id,
      groupeId,
    },
  });

  return { ok: true, message: "Paramètres enregistrés." };
}
