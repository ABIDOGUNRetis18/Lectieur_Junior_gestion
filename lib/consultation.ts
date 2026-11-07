import { prisma } from "@/lib/prisma";
import { getDimanchesValides } from "@/lib/dimanches";

export type ConsultationFilters = {
  annee: number;
  mois: number | null; // 1-12 or null (toute l'année)
  fraterniteId: string | null; // null = toutes
};

/** Champs du groupe nécessaires au calcul (évite un re-fetch en base). */
export type GroupeConsultation = {
  id: string;
  nom: string;
  premierDimanche: Date;
  moisDebutAnnee: number;
  moisSansReunion: number[];
  montantCotisation: number;
};

export async function getConsultationData(
  groupe: GroupeConsultation,
  filters: ConsultationFilters,
) {
  const groupeId = groupe.id;
  const allDimanches = getDimanchesValides(groupe, 1000); // enough

  // Filter dimanches by year (and month if specified)
  const dimanches = allDimanches.filter((d) => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Porto-Novo", year: "numeric", month: "numeric" }).formatToParts(d);
    const y = parseInt(parts.find((p) => p.type === "year")!.value, 10);
    const m = parseInt(parts.find((p) => p.type === "month")!.value, 10);
    if (y !== filters.annee) return false;
    if (filters.mois !== null && m !== filters.mois) return false;
    return true;
  });

  // Enfants, fraternités, présences et cotisations sont indépendants :
  // on les lance tous en parallèle (le périmètre passe par la relation enfant).
  const enfantScope = {
    groupeId,
    ...(filters.fraterniteId ? { fraterniteId: filters.fraterniteId } : {}),
  };

  const dimanchesAnnee = allDimanches.filter((d) => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Porto-Novo", year: "numeric" }).formatToParts(d);
    return parseInt(parts.find((p) => p.type === "year")!.value, 10) === filters.annee;
  });
  const datesAnnee = dimanchesAnnee.map(
    (d) => new Date(d.toISOString().slice(0, 10) + "T00:00:00Z"),
  );

  // Une seule passe pour toute l'année : les dimanches sélectionnés sont un
  // sous-ensemble, filtré en mémoire plus bas.
  const [enfants, fraternites, presencesAnnee, cotisationsAnnee] = await Promise.all([
    prisma.enfant.findMany({
      where: enfantScope,
      include: { fraternite: true },
      orderBy: [{ nom: "asc" }, { prenoms: "asc" }],
    }),
    prisma.fraternite.findMany({
      where: { groupeId },
      orderBy: { nom: "asc" },
    }),
    prisma.presence.findMany({
      where: { groupeId, enfant: enfantScope, date: { in: datesAnnee } },
    }),
    prisma.cotisation.findMany({
      where: { groupeId, enfant: enfantScope, date: { in: datesAnnee } },
    }),
  ]);

  const datesSelectionnees = new Set(dimanches.map((d) => d.toISOString().slice(0, 10)));
  const presences = presencesAnnee.filter((p) =>
    datesSelectionnees.has(p.date.toISOString().slice(0, 10)),
  );
  const cotisations = cotisationsAnnee.filter((c) =>
    datesSelectionnees.has(c.date.toISOString().slice(0, 10)),
  );

  // Map: enfantId -> dateISO -> etat/montant
  const presenceMap: Record<string, Record<string, string>> = {};
  const cotisationMap: Record<string, Record<string, number>> = {};
  for (const p of presences) {
    const iso = p.date.toISOString().slice(0, 10);
    if (!presenceMap[p.enfantId]) presenceMap[p.enfantId] = {};
    presenceMap[p.enfantId][iso] = p.etat;
  }
  for (const c of cotisations) {
    const iso = c.date.toISOString().slice(0, 10);
    if (!cotisationMap[c.enfantId]) cotisationMap[c.enfantId] = {};
    cotisationMap[c.enfantId][iso] = c.montant;
  }

  const bilan: Record<string, { present: number; permission: number; absent: number; taux: number; cotisationTotal: number }> = {};
  for (const e of enfants) {
    bilan[e.id] = { present: 0, permission: 0, absent: 0, taux: 0, cotisationTotal: 0 };
  }
  for (const p of presencesAnnee) {
    if (!bilan[p.enfantId]) continue;
    if (p.etat === "PRESENT") bilan[p.enfantId].present++;
    else if (p.etat === "PERMISSION") bilan[p.enfantId].permission++;
    else if (p.etat === "ABSENT") bilan[p.enfantId].absent++;
  }
  for (const c of cotisationsAnnee) {
    if (bilan[c.enfantId]) bilan[c.enfantId].cotisationTotal += c.montant;
  }
  for (const e of enfants) {
    const b = bilan[e.id];
    const total = b.present + b.permission + b.absent;
    b.taux = total > 0 ? Math.round((b.present / total) * 100) : 0;
  }

  // Totaux par dimanche (présence + cotisation)
  const totauxParDimanche: Record<string, { present: number; permission: number; absent: number; cotisation: number }> = {};
  for (const d of dimanches) {
    const iso = d.toISOString().slice(0, 10);
    totauxParDimanche[iso] = { present: 0, permission: 0, absent: 0, cotisation: 0 };
  }
  for (const p of presences) {
    const iso = p.date.toISOString().slice(0, 10);
    if (!totauxParDimanche[iso]) continue;
    if (p.etat === "PRESENT") totauxParDimanche[iso].present++;
    else if (p.etat === "PERMISSION") totauxParDimanche[iso].permission++;
    else if (p.etat === "ABSENT") totauxParDimanche[iso].absent++;
  }
  for (const c of cotisations) {
    const iso = c.date.toISOString().slice(0, 10);
    if (totauxParDimanche[iso]) totauxParDimanche[iso].cotisation += c.montant;
  }

  // Totaux par fraternité (cotisation annuelle)
  const cotisationParFrat: Record<string, number> = {};
  for (const e of enfants) {
    const fId = e.fraterniteId;
    cotisationParFrat[fId] = (cotisationParFrat[fId] ?? 0) + bilan[e.id].cotisationTotal;
  }

  // Totaux par mois (cotisation annuelle)
  const cotisationParMois: Record<number, number> = {};
  for (const c of cotisationsAnnee) {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Porto-Novo", month: "numeric" }).formatToParts(c.date);
    const m = parseInt(parts.find((p) => p.type === "month")!.value, 10);
    cotisationParMois[m] = (cotisationParMois[m] ?? 0) + c.montant;
  }

  return {
    groupe,
    filters,
    dimanches: dimanches.map((d) => d.toISOString().slice(0, 10)),
    enfants: enfants.map((e) => ({
      id: e.id,
      nom: e.nom,
      prenoms: e.prenoms,
      fraterniteId: e.fraterniteId,
      fraterniteNom: e.fraternite.nom,
    })),
    presenceMap,
    cotisationMap,
    bilan,
    totauxParDimanche,
    cotisationParFrat,
    cotisationParMois,
    fraternites: fraternites.map((f) => ({ id: f.id, nom: f.nom })),
    montantCotisation: groupe.montantCotisation,
  };
}
