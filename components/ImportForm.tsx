"use client";

import { useState } from "react";
import { importerCsvAction } from "@/lib/actions/import";
import type { ImportResult } from "@/lib/actions/import";

export default function ImportForm({
  fraternites,
}: {
  fraternites: { id: string; nom: string }[];
}) {
  const [fraterniteId, setFraterniteId] = useState(fraternites[0]?.id ?? "");
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setCsvText(text);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!csvText) return;
    setLoading(true);
    setResult(null);
    const res = await importerCsvAction(csvText, fraterniteId);
    setResult(res);
    setLoading(false);
  }

  return (
    <form className="px-margin py-space-md space-y-space-lg" onSubmit={onSubmit}>
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-primary">Import CSV du registre</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Colonnes attendues : <strong>Nom, Prénoms, Date de naissance, Classe à l&apos;école, Classe au catéchisme</strong>.
          Optionnelles : Série, Téléphone du parent.
        </p>

        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface">Fraternité cible</label>
          <select
            className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
            value={fraterniteId}
            onChange={(e) => setFraterniteId(e.target.value)}
          >
            {fraternites.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
        </div>

        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface">Fichier CSV</label>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={onFile}
            className="w-full"
          />
          {fileName && <p className="font-body-sm text-on-surface-variant">Fichier : {fileName}</p>}
        </div>

        <button
          type="submit"
          disabled={loading || !csvText}
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
                  <ul className="list-disc pl-5 space-y-1">
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
