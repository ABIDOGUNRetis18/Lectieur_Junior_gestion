"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth-helpers";
import { assertFraterniteInGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getGroupeCourant } from "@/lib/dal";
import { isDimancheValide } from "@/lib/dimanches";

const cotisationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fraterniteId: z.string().min(1),
  payes: z.array(z.string().min(1)),
});

export async function enregistrerCotisationAction(input: {
  date: string;
  fraterniteId: string;
  payes: string[];
}) {
  const session = await requireAuth();
  if (!["ADMIN", "TRESORIERE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé." };
  }

  const parsed = cotisationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides." };
  }
  const data = parsed.data;

  let frat;
  try {
    frat = await assertFraterniteInGroup(data.fraterniteId, session.user.groupeId);
  } catch {
    return { ok: false, error: "Fraternité introuvable." };
  }

  const groupe = await getGroupeCourant();
  if (!groupe) return { ok: false, error: "Groupe introuvable." };

  const dateObj = new Date(data.date + "T00:00:00Z");
  if (!isDimancheValide(dateObj, groupe)) {
    return { ok: false, error: "Date invalide : ce n'est pas un dimanche de réunion." };
  }

  const montant = groupe.montantCotisation;
  const payesSet = new Set(data.payes);

  const enfants = await prisma.enfant.findMany({
    where: {
      groupeId: session.user.groupeId,
      fraterniteId: data.fraterniteId,
      statut: "ACTIF",
    },
  });

  let count = 0;
  let total = 0;
  for (const e of enfants) {
    const m = payesSet.has(e.id) ? montant : 0;
    await prisma.cotisation.upsert({
      where: { enfantId_date: { enfantId: e.id, date: dateObj } },
      update: { montant: m },
      create: {
        enfantId: e.id,
        date: dateObj,
        montant: m,
        groupeId: session.user.groupeId,
      },
    });
    if (m > 0) {
      count++;
      total += m;
    }
  }

  await prisma.historique.create({
    data: {
      action: "COTISATION_ENREGISTREE",
      details: `Cotisation enregistrée : ${count} payé(s), total ${total} F (${frat.nom}, ${data.date})`,
      utilisateurId: session.user.id,
      groupeId: session.user.groupeId,
    },
  });

  return { ok: true, count, total, montant };
}

export async function getCotisationEtatsAction(date: string, fraterniteId: string) {
  const session = await requireAuth();
  const groupeId = session.user.groupeId;
  const dateObj = new Date(date + "T00:00:00Z");
  const enfants = await prisma.enfant.findMany({
    where: { groupeId, fraterniteId },
    select: { id: true },
  });
  const ids = new Set(enfants.map((e) => e.id));
  const records = await prisma.cotisation.findMany({
    where: { groupeId, date: dateObj },
  });
  const payes = records.filter((r) => ids.has(r.enfantId) && r.montant > 0).map((r) => r.enfantId);
  return payes;
}
