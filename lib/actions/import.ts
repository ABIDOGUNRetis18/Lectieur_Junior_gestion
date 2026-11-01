"use server";

import { requireAuth } from "@/lib/auth-helpers";
import { assertFraterniteInGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { parseCsv, mapHeaders, normalizeHeader } from "@/lib/csv";
import { normalizeNom, normalizePrenoms, makeCleDoublon } from "@/lib/normalization";

const CLASSE_ECOLE_MAP: Record<string, string> = {
  "avant le cm1": "AVANT_CM1",
  "avant cm1": "AVANT_CM1",
  "cm1": "CM1",
  "cm2": "CM2",
  "6eme": "SIXIEME",
  "6ème": "SIXIEME",
  "sixieme": "SIXIEME",
  "5eme": "CINQUIEME",
  "5ème": "CINQUIEME",
  "cinquieme": "CINQUIEME",
  "4eme": "QUATRIEME",
  "4ème": "QUATRIEME",
  "quatrieme": "QUATRIEME",
  "3eme": "TROISIEME",
  "3ème": "TROISIEME",
  "troisieme": "TROISIEME",
  "seconde": "SECONDE",
  "premiere": "PREMIERE",
  "première": "PREMIERE",
  "terminale": "TERMINALE",
  "etudes superieures": "SUPERIEUR",
  "études supérieures": "SUPERIEUR",
  "superieur": "SUPERIEUR",
  "scolarite terminee": "TERMINEE",
  "scolarité terminée": "TERMINEE",
  "terminee": "TERMINEE",
};

const CLASSE_CAT_MAP: Record<string, string> = {
  "1ere annee": "ANNEE_1",
  "1ère année": "ANNEE_1",
  "1ere année": "ANNEE_1",
  "1": "ANNEE_1",
  "anee 1": "ANNEE_1",
  "annee 1": "ANNEE_1",
  "2eme annee": "ANNEE_2",
  "2ème année": "ANNEE_2",
  "2": "ANNEE_2",
  "annee 2": "ANNEE_2",
  "3eme annee": "ANNEE_3",
  "3ème année": "ANNEE_3",
  "3": "ANNEE_3",
  "annee 3": "ANNEE_3",
  "4eme annee": "ANNEE_4",
  "4ème année": "ANNEE_4",
  "4": "ANNEE_4",
  "annee 4": "ANNEE_4",
  "5eme annee": "ANNEE_5",
  "5ème année": "ANNEE_5",
  "5": "ANNEE_5",
  "annee 5": "ANNEE_5",
  "termine": "TERMINE",
  "terminé": "TERMINE",
  "terminee": "TERMINE",
};

const SERIES_VALID = new Set(["A1", "A2", "B", "C", "D", "E", "F1", "F2", "F3", "F4", "G1", "G2", "G3"]);

function parseDate(s: string): Date | null {
  s = s.trim();
  // Try DD/MM/YYYY
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) {
    const [, d, mo, y] = m1;
    const date = new Date(`${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00Z`);
    if (!isNaN(date.getTime())) return date;
  }
  // Try YYYY-MM-DD
  const m2 = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (m2) {
    const [, y, mo, d] = m2;
    const date = new Date(`${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00Z`);
    if (!isNaN(date.getTime())) return date;
  }
  return null;
}

export type ImportResult = {
  ok: boolean;
  error?: string;
  total: number;
  ajoutes: number;
  doublons: number;
  erreurs: { ligne: number; message: string }[];
  details: { nom: string; prenoms: string; status: "ajoute" | "doublon" | "erreur"; info?: string }[];
};

export async function importerCsvAction(csvText: string, fraterniteId: string): Promise<ImportResult> {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
  }

  if (session.user.role === "RESPONSABLE" && session.user.fraterniteId !== fraterniteId) {
    return { ok: false, error: "Vous ne pouvez importer que dans votre fraternité.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
  }

  let frat;
  try {
    frat = await assertFraterniteInGroup(fraterniteId, session.user.groupeId);
  } catch {
    return { ok: false, error: "Fraternité introuvable.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
  }

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return { ok: false, error: "Fichier CSV vide ou sans en-tête.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
  }

  const headerMap = mapHeaders(rows[0]);
  const required = ["nom", "prenoms", "dateNaissance", "classeEcole", "classeCatechisme"];
  for (const r of required) {
    if (headerMap[r] === undefined) {
      return {
        ok: false,
        error: `Colonne manquante : ${r}. En-têtes attendus : nom, prénoms, date de naissance, classe à l'école, classe au catéchisme.`,
        total: 0,
        ajoutes: 0,
        doublons: 0,
        erreurs: [],
        details: [],
      };
    }
  }

  const groupeId = session.user.groupeId;
  const maxAgg = await prisma.enfant.aggregate({ where: { groupeId }, _max: { numero: true } });
  let nextNumero = (maxAgg._max.numero ?? 0) + 1;

  const result: ImportResult = { ok: true, total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const ligne = i + 1;
    result.total++;

    const nomRaw = row[headerMap.nom] ?? "";
    const prenomsRaw = row[headerMap.prenoms] ?? "";
    const dateRaw = row[headerMap.dateNaissance] ?? "";
    const classeRaw = row[headerMap.classeEcole] ?? "";
    const serieRaw = headerMap.serie !== undefined ? row[headerMap.serie] ?? "" : "";
    const catRaw = row[headerMap.classeCatechisme] ?? "";
    const telRaw = headerMap.telephoneParent !== undefined ? row[headerMap.telephoneParent] ?? "" : "";

    const nom = normalizeNom(nomRaw);
    const prenoms = normalizePrenoms(prenomsRaw);
    if (!nom || !prenoms) {
      result.erreurs.push({ ligne, message: "Nom ou prénoms manquant." });
      result.details.push({ nom: nomRaw, prenoms: prenomsRaw, status: "erreur", info: "Nom/prénoms manquant" });
      continue;
    }

    const dateNaissance = parseDate(dateRaw);
    if (!dateNaissance) {
      result.erreurs.push({ ligne, message: `Date de naissance invalide : « ${dateRaw} ».` });
      result.details.push({ nom, prenoms, status: "erreur", info: "Date invalide" });
      continue;
    }

    const classeNorm = CLASSE_ECOLE_MAP[normalizeHeader(classeRaw)];
    if (!classeNorm) {
      result.erreurs.push({ ligne, message: `Classe inconnue : « ${classeRaw} ».` });
      result.details.push({ nom, prenoms, status: "erreur", info: "Classe inconnue" });
      continue;
    }

    const catNorm = CLASSE_CAT_MAP[normalizeHeader(catRaw)];
    if (!catNorm) {
      result.erreurs.push({ ligne, message: `Classe catéchisme inconnue : « ${catRaw} ».` });
      result.details.push({ nom, prenoms, status: "erreur", info: "Catéchisme inconnu" });
      continue;
    }

    let serie: string | null = null;
    const serieTrimmed = serieRaw.trim();
    if (["SECONDE", "PREMIERE", "TERMINALE"].includes(classeNorm) && serieTrimmed) {
      if (SERIES_VALID.has(serieTrimmed.toUpperCase())) {
        serie = serieTrimmed.toUpperCase();
      } else {
        serie = `Autre: ${serieTrimmed}`;
      }
    }

    const cle = makeCleDoublon(nom, prenoms, dateNaissance);
    const existing = await prisma.enfant.findUnique({
      where: { groupeId_cleDoublon: { groupeId, cleDoublon: cle } },
      include: { fraternite: true },
    });
    if (existing) {
      result.doublons++;
      result.details.push({
        nom,
        prenoms,
        status: "doublon",
        info: `Déjà inscrit dans ${existing.fraternite.nom} (${existing.statut})`,
      });
      await prisma.historique.create({
        data: {
          action: "DOUBLON_INSCRIPTION",
          details: `${nom} ${prenoms} déjà inscrit (import CSV) dans ${existing.fraternite.nom} (${existing.statut})`,
          utilisateurId: session.user.id,
          groupeId,
        },
      });
      continue;
    }

    const numero = nextNumero++;
    await prisma.enfant.create({
      data: {
        numero,
        nom,
        prenoms,
        dateNaissance,
        cleDoublon: cle,
        classeEcole: classeNorm as any,
        serie,
        classeCatechisme: catNorm as any,
        telephoneParent: telRaw.trim() || null,
        statut: "ACTIF",
        fraterniteId,
        groupeId,
      },
    });
    result.ajoutes++;
    result.details.push({ nom, prenoms, status: "ajoute", info: `LJ-${String(numero).padStart(3, "0")}` });
    await prisma.historique.create({
      data: {
        action: "INSCRIPTION",
        details: `${nom} ${prenoms} inscrit via import CSV (LJ-${String(numero).padStart(3, "0")})`,
        utilisateurId: session.user.id,
        groupeId,
      },
    });
  }

  return result;
}
