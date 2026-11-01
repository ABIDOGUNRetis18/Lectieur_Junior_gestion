"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth-helpers";
import { assertFraterniteInGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getGroupeCourant } from "@/lib/dal";
import { isDimancheValide } from "@/lib/dimanches";

const etatEnum = z.enum(["PRESENT", "PERMISSION", "ABSENT"]);

const presenceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fraterniteId: z.string().min(1),
  presences: z.array(
    z.object({
      enfantId: z.string().min(1),
      etat: etatEnum,
    })
  ),
});

export async function enregistrerPresenceAction(input: {
  date: string;
  fraterniteId: string;
  presences: { enfantId: string; etat: "PRESENT" | "PERMISSION" | "ABSENT" }[];
}) {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé." };
  }

  const parsed = presenceSchema.safeParse(input);
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

  if (
    session.user.role === "RESPONSABLE" &&
    session.user.fraterniteId !== data.fraterniteId
  ) {
    return { ok: false, error: "Vous ne pouvez pointer que votre fraternité." };
  }

  const groupe = await getGroupeCourant();
  if (!groupe) return { ok: false, error: "Groupe introuvable." };

  const dateObj = new Date(data.date + "T00:00:00Z");
  if (!isDimancheValide(dateObj, groupe)) {
    return { ok: false, error: "Date invalide : ce n'est pas un dimanche de réunion." };
  }

  const enfantIds = data.presences.map((p) => p.enfantId);
  const enfants = await prisma.enfant.findMany({
    where: {
      id: { in: enfantIds },
      groupeId: session.user.groupeId,
      fraterniteId: data.fraterniteId,
      statut: "ACTIF",
    },
  });
  const validIds = new Set(enfants.map((e) => e.id));

  let count = 0;
  for (const p of data.presences) {
    if (!validIds.has(p.enfantId)) continue;
    await prisma.presence.upsert({
      where: { enfantId_date: { enfantId: p.enfantId, date: dateObj } },
      update: { etat: p.etat },
      create: {
        enfantId: p.enfantId,
        date: dateObj,
        etat: p.etat,
        groupeId: session.user.groupeId,
      },
    });
    count++;
  }

  await prisma.historique.create({
    data: {
      action: "PRESENCE_ENREGISTREE",
      details: `Présence enregistrée pour ${count} enfant(s) le ${data.date} (${frat.nom})`,
      utilisateurId: session.user.id,
      groupeId: session.user.groupeId,
    },
  });

  return { ok: true, count };
}

export async function getPresenceEtatsAction(date: string, fraterniteId: string) {
  const session = await requireAuth();
  const groupeId = session.user.groupeId;
  const dateObj = new Date(date + "T00:00:00Z");
  const enfants = await prisma.enfant.findMany({
    where: { groupeId, fraterniteId },
    select: { id: true },
  });
  const ids = new Set(enfants.map((e) => e.id));
  const records = await prisma.presence.findMany({
    where: { groupeId, date: dateObj },
  });
  const filtered = records.filter((r) => ids.has(r.enfantId));
  const map: Record<string, "PRESENT" | "PERMISSION" | "ABSENT"> = {};
  for (const r of filtered) map[r.enfantId] = r.etat;
  return map;
}
