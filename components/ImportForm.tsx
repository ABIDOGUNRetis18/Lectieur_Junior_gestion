"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { importerCsvAction, importerExcelAction } from "@/lib/actions/import";
import type { ImportResult, ExcelRow } from "@/lib/actions/import";
import { mapHeaders } from "@/lib/csv";

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
    const lower = file.name.toLowerCase();
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
          Fichiers acceptés : <strong>CSV</strong> ou <strong>Excel (.xlsx)</strong>. Colonnes
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
          <input
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={onFile}
            className="w-full"
          />
          {fileName && (
            <p className="font-body-sm text-on-surface-variant">
              Fichier : {fileName}
              {excelRows && ` — ${excelRows.length} ligne(s) détectée(s)`}
            </p>
          )}
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
