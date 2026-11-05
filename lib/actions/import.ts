"use server";

import { requireAuth } from "@/lib/auth-helpers";
import { assertFraterniteInGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { parseCsv, mapHeaders, normalizeHeader, CLASSE_ECOLE_MAP, CLASSE_CAT_MAP } from "@/lib/csv";
import { normalizeNom, normalizePrenoms, makeCleDoublon } from "@/lib/normalization";
import type { ClasseEcole, ClasseCatechisme } from "@prisma/client";

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
  classeEcole: ClasseEcole;
  serie: string | null;
  classeCatechisme: ClasseCatechisme;
  telephoneParent: string | null;
  statut: "ACTIF" | "INACTIF";
};

async function importParsedRows(
  parsedRows: ParsedRow[],
  groupeId: string,
  userId: string,
  fraternitesByName: Map<string, string>,
  restrictFraterniteId?: string | null
): Promise<ImportResult> {
  const result: ImportResult = { ok: true, total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] };

  // Phase 1 : filtrage hors périmètre + détection de doublons (1 requête groupée)
  const cles = parsedRows.map((r) => makeCleDoublon(r.nom, r.prenoms, r.dateNaissance));
  const existing = cles.length
    ? await prisma.enfant.findMany({
        where: { groupeId, cleDoublon: { in: cles } },
        include: { fraternite: true },
      })
    : [];
  const byCle = new Map(existing.map((e) => [e.cleDoublon, e]));

  const seen = new Set<string>();
  const perRow: Array<
    | { kind: "ok"; r: ParsedRow; fraterniteId: string; cle: string }
    | { kind: "doublon"; r: ParsedRow; info: string }
    | { kind: "erreur"; ligne: number; message: string; nom: string; prenoms: string }
  > = [];

  for (let i = 0; i < parsedRows.length; i++) {
    const r = parsedRows[i];
    const ligne = i + 1;
    result.total++;

    const fraterniteId = fraternitesByName.get(r.fraterniteNom.trim().toLowerCase());
    if (!fraterniteId) {
      result.erreurs.push({ ligne, message: `Fraternité inconnue : « ${r.fraterniteNom} ».` });
      perRow.push({ kind: "erreur", ligne, message: `Fraternité inconnue : « ${r.fraterniteNom} ».`, nom: r.nom, prenoms: r.prenoms });
      continue;
    }
    if (restrictFraterniteId && fraterniteId !== restrictFraterniteId) {
      perRow.push({ kind: "erreur", ligne, message: `Fraternité hors de votre périmètre : « ${r.fraterniteNom} ».`, nom: r.nom, prenoms: r.prenoms });
      result.erreurs.push({ ligne, message: `Fraternité hors de votre périmètre : « ${r.fraterniteNom} ».` });
      continue;
    }

    const cle = cles[i];

    if (seen.has(cle)) {
      result.doublons++;
      perRow.push({ kind: "doublon", r, info: "Doublon dans le fichier (2 lignes identiques)." });
      continue;
    }
    seen.add(cle);

    const existingChild = byCle.get(cle);
    if (existingChild) {
      result.doublons++;
      perRow.push({
        kind: "doublon",
        r,
        info: `Déjà inscrit dans ${existingChild.fraternite.nom} (${existingChild.statut})`,
      });
      continue;
    }

    perRow.push({ kind: "ok", r, fraterniteId, cle });
  }

  // Phase 2 : insertion groupée (2 requêtes au lieu de 2N)
  const toCreate = perRow.filter((p) => p.kind === "ok") as Array<{ kind: "ok"; r: ParsedRow; fraterniteId: string; cle: string }>;
  if (toCreate.length) {
    await prisma.enfant.createMany({
      data: toCreate.map(({ r, fraterniteId, cle }) => ({
        nom: r.nom,
        prenoms: r.prenoms,
        dateNaissance: r.dateNaissance,
        cleDoublon: cle,
        classeEcole: r.classeEcole,
        serie: r.serie,
        classeCatechisme: r.classeCatechisme,
        telephoneParent: r.telephoneParent,
        statut: r.statut,
        fraterniteId,
        groupeId,
      })),
    });
    await prisma.historique.createMany({
      data: toCreate.map(({ r }) => ({
        action: "INSCRIPTION",
        details: `${r.nom} ${r.prenoms} inscrit via import`,
        utilisateurId: userId,
        groupeId,
      })),
    });
  }

  const duplicateInfos = perRow.filter((p) => p.kind === "doublon") as Array<{ kind: "doublon"; r: ParsedRow; info: string }>;
  if (duplicateInfos.length) {
    await prisma.historique.createMany({
      data: duplicateInfos.map(({ r, info }) => ({
        action: "DOUBLON_INSCRIPTION",
        details: `${r.nom} ${r.prenoms} — ${info}`,
        utilisateurId: userId,
        groupeId,
      })),
    });
  }

  for (const p of perRow) {
    if (p.kind === "ok") {
      result.ajoutes++;
      result.details.push({ nom: p.r.nom, prenoms: p.r.prenoms, status: "ajoute" });
    } else if (p.kind === "doublon") {
      result.details.push({ nom: p.r.nom, prenoms: p.r.prenoms, status: "doublon", info: p.info });
    } else {
      result.details.push({ nom: p.nom, prenoms: p.prenoms, status: "erreur", info: p.message });
    }
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
      classeEcole: classeNorm as ClasseEcole,
      serie,
      classeCatechisme: catNorm as ClasseCatechisme,
      telephoneParent: telRaw.trim() || null,
      statut,
    });
  }

  if (parsed.length === 0 && parseErrors.length > 0) {
    return { ok: false, error: "Aucune ligne valide.", total: parseErrors.length, ajoutes: 0, doublons: 0, erreurs: parseErrors, details: [] };
  }

  const result = await importParsedRows(
    parsed,
    groupeId,
    session.user.id,
    byName,
    session.user.role === "RESPONSABLE" ? session.user.fraterniteId : null
  );
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
      classeEcole: classeNorm as ClasseEcole,
      serie,
      classeCatechisme: catNorm as ClasseCatechisme,
      telephoneParent: String(row.telephoneParent ?? "").trim() || null,
      statut,
    });
  }

  if (parsed.length === 0 && parseErrors.length > 0) {
    return { ok: false, error: "Aucune ligne valide.", total: parseErrors.length, ajoutes: 0, doublons: 0, erreurs: parseErrors, details: [] };
  }

  const result = await importParsedRows(
    parsed,
    groupeId,
    session.user.id,
    byName,
    session.user.role === "RESPONSABLE" ? session.user.fraterniteId : null
  );
  result.total += parseErrors.length;
  result.erreurs = [...parseErrors, ...result.erreurs];
  return result;
}
