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
  // variants du registre Excel
  "6e": "SIXIEME",
  "5e": "CINQUIEME",
  "4e": "QUATRIEME",
  "3e": "TROISIEME",
  "1ere annee": "PREMIERE",
  "1ere annee marketing": "PREMIERE",
  "1ere annee hr": "PREMIERE",
  "ce2": "AVANT_CM1",
  "1ere": "PREMIERE",
  "1ère": "PREMIERE",
  "1ere d": "PREMIERE",
  "1ere g2": "PREMIERE",
  "1ere année": "PREMIERE",
  "1ere année marketing": "PREMIERE",
  "1ère année hr": "PREMIERE",
  "quatrième": "QUATRIEME",
  "jss3": "TROISIEME",
  "master 2 sécurité informatique": "SUPERIEUR",
  "master 2 securite informatique": "SUPERIEUR",
  "seconde c": "SECONDE",
  "terminale b": "TERMINALE",
  "tle d": "TERMINALE",
  "troisième": "TROISIEME",
  "fini": "TERMINEE",
};

const CLASSE_CAT_MAP: Record<string, string> = {
  "1ere annee": "ANNEE_1",
  "1": "ANNEE_1",
  "anee 1": "ANNEE_1",
  "annee 1": "ANNEE_1",
  "2eme annee": "ANNEE_2",
  "2": "ANNEE_2",
  "annee 2": "ANNEE_2",
  "3eme annee": "ANNEE_3",
  "3": "ANNEE_3",
  "annee 3": "ANNEE_3",
  "3eme": "ANNEE_3",
  "troisieme": "ANNEE_3",
  "4eme annee": "ANNEE_4",
  "4": "ANNEE_4",
  "annee 4": "ANNEE_4",
  "4eme": "ANNEE_4",
  "5eme annee": "ANNEE_5",
  "5": "ANNEE_5",
  "annee 5": "ANNEE_5",
  "5eme": "ANNEE_5",
  "cinquieme annee": "ANNEE_5",
  "termine": "TERMINE",
  "terminee": "TERMINE",
  "fini": "TERMINE",
  // variants du registre Excel
  "2e annee": "ANNEE_2",
  "4e annee": "ANNEE_4",
};

const SERIES_VALID = new Set(["A1", "A2", "B", "C", "D", "E", "F1", "F2", "F3", "F4", "G1", "G2", "G3"]);

function parseDate(s: string): Date | null {
  s = String(s ?? "").trim();
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m1) {
    const [, d, mo, y] = m1;
    const date = new Date(`${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00Z`);
    if (!isNaN(date.getTime())) return date;
  }
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

type ParsedRow = {
  fraterniteNom: string;
  nom: string;
  prenoms: string;
  dateNaissance: Date;
  classeEcole: string;
  serie: string | null;
  classeCatechisme: string;
  telephoneParent: string | null;
  statut: "ACTIF" | "INACTIF";
};

async function importParsedRows(
  parsedRows: ParsedRow[],
  groupeId: string,
  userId: string,
  fraternitesByName: Map<string, string>
): Promise<ImportResult> {
  const result: ImportResult = { ok: true, total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };

  const maxAgg = await prisma.enfant.aggregate({ where: { groupeId }, _max: { numero: true } });
  let nextNumero = (maxAgg._max.numero ?? 0) + 1;

  for (let i = 0; i < parsedRows.length; i++) {
    const r = parsedRows[i];
    const ligne = i + 1;
    result.total++;

    const fraterniteId = fraternitesByName.get(r.fraterniteNom.trim().toLowerCase());
    if (!fraterniteId) {
      result.erreurs.push({ ligne, message: `Fraternité inconnue : « ${r.fraterniteNom} ».` });
      result.details.push({ nom: r.nom, prenoms: r.prenoms, status: "erreur", info: "Fraternité inconnue" });
      continue;
    }

    const cle = makeCleDoublon(r.nom, r.prenoms, r.dateNaissance);
    const existing = await prisma.enfant.findUnique({
      where: { groupeId_cleDoublon: { groupeId, cleDoublon: cle } },
      include: { fraternite: true },
    });
    if (existing) {
      result.doublons++;
      result.details.push({
        nom: r.nom,
        prenoms: r.prenoms,
        status: "doublon",
        info: `Déjà inscrit dans ${existing.fraternite.nom} (${existing.statut})`,
      });
      await prisma.historique.create({
        data: {
          action: "DOUBLON_INSCRIPTION",
          details: `${r.nom} ${r.prenoms} déjà inscrit (import) dans ${existing.fraternite.nom} (${existing.statut})`,
          utilisateurId: userId,
          groupeId,
        },
      });
      continue;
    }

    const numero = nextNumero++;
    await prisma.enfant.create({
      data: {
        numero,
        nom: r.nom,
        prenoms: r.prenoms,
        dateNaissance: r.dateNaissance,
        cleDoublon: cle,
        classeEcole: r.classeEcole as any,
        serie: r.serie,
        classeCatechisme: r.classeCatechisme as any,
        telephoneParent: r.telephoneParent,
        statut: r.statut,
        fraterniteId,
        groupeId,
      },
    });
    result.ajoutes++;
    result.details.push({ nom: r.nom, prenoms: r.prenoms, status: "ajoute", info: `LJ-${String(numero).padStart(3, "0")}` });
    await prisma.historique.create({
      data: {
        action: "INSCRIPTION",
        details: `${r.nom} ${r.prenoms} inscrit via import (LJ-${String(numero).padStart(3, "0")})`,
        utilisateurId: userId,
        groupeId,
      },
    });
  }

  return result;
}

// ---------- CSV ----------

export async function importerCsvAction(csvText: string, fraterniteId: string): Promise<ImportResult> {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
  }

  // Fraternité cible (optionnelle, utilisée si le fichier n'en précise pas)
  let cibleFrat: { id: string; nom: string } | null = null;
  if (fraterniteId) {
    try {
      cibleFrat = await assertFraterniteInGroup(fraterniteId, session.user.groupeId);
    } catch {
      return { ok: false, error: "Fraternité introuvable.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
    }
    if (session.user.role === "RESPONSABLE" && session.user.fraterniteId !== fraterniteId) {
      return { ok: false, error: "Vous ne pouvez importer que dans votre fraternité.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
    }
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
        total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [],
      };
    }
  }

  const groupeId = session.user.groupeId;
  const fraternites = await prisma.fraternite.findMany({ where: { groupeId } });
  const byName = new Map(fraternites.map((f) => [f.nom.trim().toLowerCase(), f.id]));

  // Parse all rows first, collect errors
  const parsed: ParsedRow[] = [];
  const parseErrors: { ligne: number; message: string }[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const ligne = i + 1;
    if (row.every((c) => String(c ?? "").trim() === "")) continue;

    const nomRaw = row[headerMap.nom] ?? "";
    const prenomsRaw = row[headerMap.prenoms] ?? "";
    const dateRaw = row[headerMap.dateNaissance] ?? "";
    const classeRaw = row[headerMap.classeEcole] ?? "";
    const serieRaw = headerMap.serie !== undefined ? row[headerMap.serie] ?? "" : "";
    const catRaw = row[headerMap.classeCatechisme] ?? "";
    const telRaw = headerMap.telephoneParent !== undefined ? row[headerMap.telephoneParent] ?? "" : "";
    const fratRaw = headerMap.fraternite !== undefined ? row[headerMap.fraternite] ?? "" : "";
    const statutRaw = headerMap.statut !== undefined ? row[headerMap.statut] ?? "" : "";

    const nom = normalizeNom(nomRaw);
    const prenoms = normalizePrenoms(prenomsRaw);
    if (!nom || !prenoms) {
      parseErrors.push({ ligne, message: "Nom ou prénoms manquant." });
      continue;
    }
    const dateNaissance = parseDate(dateRaw);
    if (!dateNaissance) {
      parseErrors.push({ ligne, message: `Date de naissance invalide : « ${dateRaw} ».` });
      continue;
    }
    const classeNorm = CLASSE_ECOLE_MAP[normalizeHeader(classeRaw)];
    if (!classeNorm) {
      parseErrors.push({ ligne, message: `Classe inconnue : « ${classeRaw} ».` });
      continue;
    }
    const catNorm = CLASSE_CAT_MAP[normalizeHeader(catRaw)];
    if (!catNorm) {
      parseErrors.push({ ligne, message: `Classe catéchisme inconnue : « ${catRaw} ».` });
      continue;
    }

    let serie: string | null = null;
    const serieTrimmed = serieRaw.trim();
    if (["SECONDE", "PREMIERE", "TERMINALE"].includes(classeNorm) && serieTrimmed) {
      if (SERIES_VALID.has(serieTrimmed.toUpperCase())) serie = serieTrimmed.toUpperCase();
      else serie = `Autre: ${serieTrimmed}`;
    }

    const fraterniteNom = fratRaw.trim() || (cibleFrat ? cibleFrat.nom : "");
    if (!fraterniteNom) {
      parseErrors.push({ ligne, message: "Fraternité manquante (colonne 'Fraternité' absente et aucune fraternité cible sélectionnée)." });
      continue;
    }
    const statut = /inactif/i.test(statutRaw) ? "INACTIF" : "ACTIF";

    parsed.push({
      fraterniteNom,
      nom,
      prenoms,
      dateNaissance,
      classeEcole: classeNorm,
      serie,
      classeCatechisme: catNorm,
      telephoneParent: telRaw.trim() || null,
      statut,
    });
  }

  if (parsed.length === 0 && parseErrors.length > 0) {
    return { ok: false, error: "Aucune ligne valide.", total: parseErrors.length, ajoutes: 0, doublons: 0, erreurs: parseErrors, details: [] };
  }

  const result = await importParsedRows(parsed, groupeId, session.user.id, byName);
  // Merge parse errors into result
  result.total += parseErrors.length;
  result.erreurs = [...parseErrors.map((e) => ({ ligne: e.ligne, message: e.message })), ...result.erreurs];
  // Re-number erreur lines? keep as-is
  return result;
}

// ---------- Excel (rows envoyées par le client) ----------

export type ExcelRow = {
  fraternite?: string;
  nom?: string;
  prenoms?: string;
  dateNaissance?: string;
  classeEcole?: string;
  serie?: string;
  classeCatechisme?: string;
  telephoneParent?: string;
  statut?: string;
};

export async function importerExcelAction(rows: ExcelRow[], fraterniteId: string): Promise<ImportResult> {
  const session = await requireAuth();
  if (!["ADMIN", "RESPONSABLE"].includes(session.user.role)) {
    return { ok: false, error: "Accès refusé.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
  }

  let cibleFrat: { id: string; nom: string } | null = null;
  if (fraterniteId) {
    try {
      cibleFrat = await assertFraterniteInGroup(fraterniteId, session.user.groupeId);
    } catch {
      return { ok: false, error: "Fraternité introuvable.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
    }
    if (session.user.role === "RESPONSABLE" && session.user.fraterniteId !== fraterniteId) {
      return { ok: false, error: "Vous ne pouvez importer que dans votre fraternité.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
    }
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, error: "Fichier Excel vide.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };
  }

  const groupeId = session.user.groupeId;
  const fraternites = await prisma.fraternite.findMany({ where: { groupeId } });
  const byName = new Map(fraternites.map((f) => [f.nom.trim().toLowerCase(), f.id]));

  const parsed: ParsedRow[] = [];
  const parseErrors: { ligne: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const ligne = i + 2; // +2 because header row
    if (Object.values(row).every((v) => String(v ?? "").trim() === "")) continue;

    const nom = normalizeNom(row.nom ?? "");
    const prenoms = normalizePrenoms(row.prenoms ?? "");
    if (!nom || !prenoms) {
      parseErrors.push({ ligne, message: "Nom ou prénoms manquant." });
      continue;
    }
    const dateNaissance = parseDate(String(row.dateNaissance ?? ""));
    if (!dateNaissance) {
      parseErrors.push({ ligne, message: `Date de naissance invalide : « ${row.dateNaissance} ».` });
      continue;
    }
    const classeNorm = CLASSE_ECOLE_MAP[normalizeHeader(String(row.classeEcole ?? ""))];
    if (!classeNorm) {
      parseErrors.push({ ligne, message: `Classe inconnue : « ${row.classeEcole} ».` });
      continue;
    }
    const catNorm = CLASSE_CAT_MAP[normalizeHeader(String(row.classeCatechisme ?? ""))];
    if (!catNorm) {
      parseErrors.push({ ligne, message: `Classe catéchisme inconnue : « ${row.classeCatechisme} ».` });
      continue;
    }

    let serie: string | null = null;
    const serieTrimmed = String(row.serie ?? "").trim();
    if (["SECONDE", "PREMIERE", "TERMINALE"].includes(classeNorm) && serieTrimmed) {
      if (SERIES_VALID.has(serieTrimmed.toUpperCase())) serie = serieTrimmed.toUpperCase();
      else serie = `Autre: ${serieTrimmed}`;
    }

    const fraterniteNom = String(row.fraternite ?? "").trim() || (cibleFrat ? cibleFrat.nom : "");
    if (!fraterniteNom) {
      parseErrors.push({ ligne, message: "Fraternité manquante (colonne 'Fraternité' absente et aucune fraternité cible sélectionnée)." });
      continue;
    }
    const statut = /inactif/i.test(String(row.statut ?? "")) ? "INACTIF" : "ACTIF";

    parsed.push({
      fraterniteNom,
      nom,
      prenoms,
      dateNaissance,
      classeEcole: classeNorm,
      serie,
      classeCatechisme: catNorm,
      telephoneParent: String(row.telephoneParent ?? "").trim() || null,
      statut,
    });
  }

  if (parsed.length === 0 && parseErrors.length > 0) {
    return { ok: false, error: "Aucune ligne valide.", total: parseErrors.length, ajoutes: 0, doublons: 0, erreurs: parseErrors, details: [] };
  }

  const result = await importParsedRows(parsed, groupeId, session.user.id, byName);
  result.total += parseErrors.length;
  result.erreurs = [...parseErrors, ...result.erreurs];
  return result;
}
