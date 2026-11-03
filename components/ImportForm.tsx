"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import * as pdfjsLib from "pdfjs-dist";
import { importerCsvAction, importerExcelAction } from "@/lib/actions/import";
import type { ImportResult, ExcelRow } from "@/lib/actions/import";

// Configure pdf.js worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}
import { mapHeaders, normalizeHeader, CLASSE_ECOLE_MAP, CLASSE_CAT_MAP } from "@/lib/csv";

export default function ImportForm({ fraternites }: { fraternites: { id: string; nom: string }[] }) {
  const [fraterniteId, setFraterniteId] = useState(fraternites[0]?.id ?? "");
  const [csvText, setCsvText] = useState("");
  const [excelRows, setExcelRows] = useState<ExcelRow[] | null>(null);
  const [hasFraterniteColumn, setHasFraterniteColumn] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    setCsvText("");
    setExcelRows(null);
    setHasFraterniteColumn(false);
    const lower = file.name.toLowerCase();
    if (lower.endsWith(".pdf")) {
      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      // Extract text items with positions, group by line
      type Item = { str: string; x: number; y: number; w: number };
      const linesMap: Record<number, Item[]> = {};
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        for (const it of content.items as { str: string; transform: number[]; width: number }[]) {
          if (!it.str || !it.str.trim()) continue;
          const y = Math.round(it.transform[5]);
          const x = it.transform[4];
          if (!linesMap[y]) linesMap[y] = [];
          linesMap[y].push({ str: it.str, x, y, w: it.width || it.str.length * 5 });
        }
      }
      const ys = Object.keys(linesMap).map(Number).sort((a, b) => b - a);
      const lines: string[] = [];
      const lineItems: Item[][] = [];
      for (const y of ys) {
        const items = linesMap[y].sort((a, b) => a.x - b.x);
        lineItems.push(items);
        // Build a textual line by joining items with single spaces (for header detection)
        lines.push(items.map((it) => it.str).join(" ").trim());
      }
      // Find header line index
      const headerLineIdx = lines.findIndex((l) => {
        const n = l.toLowerCase();
        return n.includes("nom") && (n.includes("prenom") || n.includes("naissance") || n.includes("date"));
      });
      if (headerLineIdx === -1) {
        setExcelRows([]);
        setCsvText("");
        setHasFraterniteColumn(false);
        setFileName(file.name);
        setResult({ ok: false, error: "Aucun en-tête de tableau détecté dans le PDF.", total: 0, ajoutes: 0, doublons: 0, erreurs: [], details: [] });
        return;
      }
      // Header columns: filter out space-only items
      const headerItems = lineItems[headerLineIdx].filter((it) => it.str.trim().length > 0);
      const headerCols = headerItems.map((it) => it.str);
      const { mapHeaders } = await import("@/lib/csv");
      const hm = mapHeaders(headerCols);

      const rows: ExcelRow[] = [];
      for (let li = headerLineIdx + 1; li < lineItems.length; li++) {
        const items = lineItems[li];
        if (items.length === 0) continue;
        let dateNaissance = "";
        let classeEcole = "";
        let classeCatechisme = "";
        let telephoneParent = "";
        let fraternite = "";
        let statut = "";
        const rest: string[] = [];
        for (const it of items) {
          let raw = it.str.trim();
          if (!raw) continue;
          if (/^LJ-\d+$/i.test(raw)) continue;
          const dateMatch = raw.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/);
          if (dateMatch && !dateNaissance) {
            dateNaissance = dateMatch[0];
            raw = raw.replace(dateMatch[0], "").trim();
          }
          const phoneMatch = raw.match(/\d{8,15}/);
          if (phoneMatch && !telephoneParent) {
            telephoneParent = phoneMatch[0];
            raw = raw.replace(phoneMatch[0], "").trim();
          }
          if (!raw) continue;
          let classified = false;
          if (/^fraternit/i.test(raw)) {
            if (!fraternite) { fraternite = raw; classified = true; }
          } else if (/^actif$/i.test(raw) || /^inactif$/i.test(raw)) {
            if (!statut) { statut = raw; classified = true; }
          } else if (/^ann[ée]e?s?$/i.test(raw)) {
            classified = true;
          } else {
            const eco = CLASSE_ECOLE_MAP[normalizeHeader(raw)] || CLASSE_ECOLE_MAP[normalizeHeader(raw).replace(/\s+/g, "")];
            const cat = CLASSE_CAT_MAP[normalizeHeader(raw)] || CLASSE_CAT_MAP[normalizeHeader(raw).replace(/\s+/g, "")];
            if (eco && !classeEcole) { classeEcole = raw; classified = true; }
            else if (cat && !classeCatechisme) { classeCatechisme = raw; classified = true; }
          }
          if (classified) continue;
          for (const tok of raw.split(/\s+/)) {
            if (!tok) continue;
            if (/^LJ-\d+$/i.test(tok)) continue;
            if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(tok) || /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(tok)) {
              if (!dateNaissance) dateNaissance = tok;
            } else if (/^\d{8,15}$/.test(tok)) {
              if (!telephoneParent) telephoneParent = tok;
              else rest.push(tok);
            } else if (/^fraternit/i.test(tok)) {
              if (!fraternite) fraternite = tok;
              else rest.push(tok);
            } else if (/^actif$/i.test(tok) || /^inactif$/i.test(tok)) {
              if (!statut) statut = tok;
              else rest.push(tok);
            } else if (/^ann[ée]e?s?$/i.test(tok)) {
            } else {
              const eco = CLASSE_ECOLE_MAP[normalizeHeader(tok)] || CLASSE_ECOLE_MAP[normalizeHeader(tok).replace(/\s+/g, "")];
              const cat = CLASSE_CAT_MAP[normalizeHeader(tok)] || CLASSE_CAT_MAP[normalizeHeader(tok).replace(/\s+/g, "")];
              if (eco && !classeEcole) classeEcole = tok;
              else if (cat && !classeCatechisme) classeCatechisme = tok;
              else rest.push(tok);
            }
          }
          if (fraternite && !/\d/.test(fraternite)) {
            const idx = rest.findIndex((t) => /^\d+$/.test(t));
            if (idx !== -1) fraternite = fraternite + " " + rest.splice(idx, 1)[0];
          }
        }
        const nom = rest.length > 0 ? rest[0] : "";
        const prenoms = rest.slice(1).join(" ");
        if (!nom && !prenoms) continue;
        rows.push({
          fraternite: fraternite.trim(),
          nom,
          prenoms,
          dateNaissance,
          classeEcole,
          serie: "",
          classeCatechisme,
          telephoneParent,
          statut,
        });
      }

      setExcelRows(rows);
      setCsvText("");
      setHasFraterniteColumn(false);
      return;
    }
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const sheetName = wb.SheetNames.includes("Enfants") ? "Enfants" : wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      if (raw.length === 0) {
        setExcelRows([]);
        setCsvText("");
        setHasFraterniteColumn(false);
        return;
      }
      const headers = Object.keys(raw[0]);
      const headerMap = mapHeaders(headers);
      const rows: ExcelRow[] = raw.map((r) => {
        const get = (key: string) => {
          const idx = headerMap[key];
          if (idx === undefined) return "";
          const h = headers[idx];
          const v = r[h];
          if (v instanceof Date) {
            const d = v.getDate().toString().padStart(2, "0");
            const m = (v.getMonth() + 1).toString().padStart(2, "0");
            const y = v.getFullYear();
            return `${d}/${m}/${y}`;
          }
          return v;
        };
        return {
          fraternite: String(get("fraternite") ?? "").trim(),
          nom: String(get("nom") ?? "").trim(),
          prenoms: String(get("prenoms") ?? "").trim(),
          dateNaissance: String(get("dateNaissance") ?? "").trim(),
          classeEcole: String(get("classeEcole") ?? "").trim(),
          serie: String(get("serie") ?? "").trim(),
          classeCatechisme: String(get("classeCatechisme") ?? "").trim(),
          telephoneParent: String(get("telephoneParent") ?? "").trim(),
          statut: String(get("statut") ?? "").trim(),
        };
      });
      setExcelRows(rows);
      setCsvText("");
      setHasFraterniteColumn(headerMap["fraternite"] !== undefined);
    } else {
      const text = await file.text();
      setCsvText(text);
      setExcelRows(null);
      // detect fraternite column in CSV header
      const firstLine = text.split(/\\r?\\n/)[0];
      // quick parse not full; reuse mapHeaders on split
      const cols = firstLine.split(",");
      const hm = mapHeaders(cols);
      setHasFraterniteColumn(hm["fraternite"] !== undefined);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!csvText && !excelRows) return;
    setLoading(true);
    setResult(null);
    let res: ImportResult;
    if (excelRows) {
      res = await importerExcelAction(excelRows, fraterniteId);
    } else {
      res = await importerCsvAction(csvText, fraterniteId);
    }
    setResult(res);
    setLoading(false);
  }

  const hasData = !!csvText || (excelRows && excelRows.length > 0);

  return (
    <form className="px-margin py-space-md space-y-space-lg" onSubmit={onSubmit}>
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-primary">Import du registre</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Fichiers acceptés : <strong>CSV</strong>, <strong>Excel (.xlsx)</strong> ou <strong>PDF</strong>. Colonnes
          attendues : <strong>Nom, Prénoms, Date de naissance, Classe à l&apos;école, Classe au
          catéchisme</strong>. Optionnelles : Fraternité, Série, Téléphone du parent, Statut.
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Les classes sont converties automatiquement (ex. « 6ème » → SIXIEME, « Terminé » →
          TERMINE). Les valeurs non reconnues sont signalées.
        </p>

        {!hasFraterniteColumn && fileName && (
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Fraternité cible (par défaut)</label>
            <select
              className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
              value={fraterniteId}
              onChange={(e) => setFraterniteId(e.target.value)}
            >
              {fraternites.map((f) => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
            <p className="font-body-sm text-on-surface-variant">
              Le fichier ne contient pas de colonne « Fraternité » : tous les enfants seront rattachés à cette fraternité.
            </p>
          </div>
        )}
        {hasFraterniteColumn && fileName && (
          <p className="font-body-sm text-on-surface-variant">
            La colonne « Fraternité » du fichier est utilisée pour chaque enfant.
          </p>
        )}

        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface">Fichier</label>
          <div className="relative rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest hover:border-primary hover:bg-surface-container-low transition-all">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={onFile}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="flex flex-col items-center justify-center gap-space-xs py-space-lg px-space-md text-center pointer-events-none">
              <span className="material-symbols-outlined text-[32px] text-primary">upload_file</span>
              <p className="font-label-md text-label-md text-on-surface">
                Cliquez ou glissez un fichier ici
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                CSV, Excel (.xlsx) ou PDF — max 5 Mo
              </p>
              {fileName && (
                <p className="font-label-md text-label-md text-secondary mt-1">
                  ✅ {fileName}
                  {excelRows && ` — ${excelRows.length} ligne(s) détectée(s)`}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !hasData}
          className="w-full h-[52px] min-h-[52px] bg-primary-container text-on-primary rounded-lg font-label-lg text-label-lg uppercase tracking-wide flex items-center justify-center space-x-space-sm active:bg-primary transition-all shadow-md disabled:opacity-60"
        >
          <span>{loading ? "Import en cours..." : "Importer"}</span>
        </button>
      </section>

      {result && (
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
          {result.ok ? (
            <>
              <p className="font-label-md text-label-md text-secondary font-semibold">
                Import terminé : {result.ajoutes} ajouté(s), {result.doublons} doublon(s), {result.erreurs.length} erreur(s) sur {result.total} ligne(s).
              </p>
              {result.erreurs.length > 0 && (
                <div className="space-y-space-xs">
                  <p className="font-label-md text-label-md text-error">Erreurs :</p>
                  <ul className="list-disc pl-5 space-y-1 max-h-40 overflow-y-auto">
                    {result.erreurs.map((e, i) => (
                      <li key={i} className="font-body-sm text-error">
                        Ligne {e.ligne} : {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-space-xs">
                <p className="font-label-md text-label-md text-on-surface">Détail :</p>
                <ul className="space-y-1 max-h-60 overflow-y-auto">
                  {result.details.map((d, i) => (
                    <li key={i} className="font-body-sm">
                      {d.status === "ajoute" && <span className="text-secondary">✅ {d.nom} {d.prenoms} — {d.info}</span>}
                      {d.status === "doublon" && <span className="text-amber-600">⚠️ {d.nom} {d.prenoms} — {d.info}</span>}
                      {d.status === "erreur" && <span className="text-error">❌ {d.nom} {d.prenoms} — {d.info}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="font-body-sm text-body-sm text-error">{result.error}</p>
          )}
        </section>
      )}
    </form>
  );
}
