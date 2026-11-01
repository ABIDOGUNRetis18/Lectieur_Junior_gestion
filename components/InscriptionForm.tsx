"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inscrireEnfantsAction } from "@/lib/actions/inscription";
import {
  CLASSES_ECOLE,
  CLASSES_CATECHISME,
  SERIES,
  CLASSES_AVEC_SERIE,
} from "@/lib/schemas/inscription";
import type { InscriptionResult } from "@/lib/actions/inscription";

type ChildRow = {
  nom: string;
  prenoms: string;
  dateNaissance: string;
  classeEcole: string;
  serie: string;
  serieAutre: string;
  classeCatechisme: string;
  telephoneParent: string;
};

const emptyRow: ChildRow = {
  nom: "",
  prenoms: "",
  dateNaissance: "",
  classeEcole: "CM2",
  serie: "",
  serieAutre: "",
  classeCatechisme: "ANNEE_1",
  telephoneParent: "",
};

export default function InscriptionForm({
  fraternites,
}: {
  fraternites: { id: string; nom: string }[];
}) {
  const router = useRouter();
  const [fraterniteId, setFraterniteId] = useState(fraternites[0]?.id ?? "");
  const [consentement, setConsentement] = useState(false);
  const [rows, setRows] = useState<ChildRow[]>([{ ...emptyRow }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InscriptionResult | null>(null);

  function updateRow(i: number, patch: Partial<ChildRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addRow() {
    if (rows.length < 20) setRows((prev) => [...prev, { ...emptyRow }]);
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const payload = {
      fraterniteId,
      consentement,
      enfants: rows.map((r) => ({
        nom: r.nom,
        prenoms: r.prenoms,
        dateNaissance: r.dateNaissance,
        classeEcole: r.classeEcole,
        serie: r.serie || null,
        serieAutre: r.serieAutre || null,
        classeCatechisme: r.classeCatechisme,
        telephoneParent: r.telephoneParent || null,
      })),
    };
    const res = await inscrireEnfantsAction(payload as any);
    setResult(res);
    setLoading(false);
    if (res.ok) {
      // reset form on full success (no doublons)
      const hasDoublon = res.results.some((r) => r.status === "doublon");
      if (!hasDoublon) {
        setRows([{ ...emptyRow }]);
        setConsentement(false);
      }
    }
  }

  return (
    <form className="px-margin py-space-md space-y-space-lg" onSubmit={onSubmit}>
      {/* Fraternité */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-primary">Affectation fraternité</h2>
        <label className="block font-label-md text-label-md text-on-surface" htmlFor="frat">
          Choisir la fraternité active
        </label>
        <select
          id="frat"
          className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
          value={fraterniteId}
          onChange={(e) => setFraterniteId(e.target.value)}
        >
          {fraternites.map((f) => (
            <option key={f.id} value={f.id}>{f.nom}</option>
          ))}
        </select>
      </section>

      {/* Enfants */}
      {rows.map((row, i) => {
        const needsSerie = CLASSES_AVEC_SERIE.includes(row.classeEcole);
        return (
          <section key={i} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Fiche de l&apos;enfant #{i + 1}</h3>
              {rows.length > 1 && (
                <button type="button" onClick={() => removeRow(i)} className="text-error font-label-md">
                  Supprimer
                </button>
              )}
            </div>

            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Nom de famille (MAJUSCULES)</label>
              <input
                className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
                value={row.nom}
                onChange={(e) => updateRow(i, { nom: e.target.value })}
                required
              />
            </div>

            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Prénoms</label>
              <input
                className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
                value={row.prenoms}
                onChange={(e) => updateRow(i, { prenoms: e.target.value })}
                required
              />
            </div>

            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Date de naissance</label>
              <input
                type="date"
                className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
                value={row.dateNaissance}
                onChange={(e) => updateRow(i, { dateNaissance: e.target.value })}
                required
              />
            </div>

            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Classe à l&apos;école</label>
              <select
                className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
                value={row.classeEcole}
                onChange={(e) => updateRow(i, { classeEcole: e.target.value, serie: "", serieAutre: "" })}
              >
                {CLASSES_ECOLE.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {needsSerie && (
              <>
                <div className="space-y-space-xs">
                  <label className="block font-label-md text-label-md text-on-surface">Série (facultative)</label>
                  <select
                    className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
                    value={row.serie}
                    onChange={(e) => updateRow(i, { serie: e.target.value })}
                  >
                    <option value="">(série non précisée)</option>
                    {SERIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                {row.serie === "AUTRE" && (
                  <div className="space-y-space-xs">
                    <label className="block font-label-md text-label-md text-on-surface">Précisez la série</label>
                    <input
                      className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
                      value={row.serieAutre}
                      onChange={(e) => updateRow(i, { serieAutre: e.target.value })}
                    />
                  </div>
                )}
              </>
            )}

            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Classe au catéchisme</label>
              <select
                className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
                value={row.classeCatechisme}
                onChange={(e) => updateRow(i, { classeCatechisme: e.target.value })}
              >
                {CLASSES_CATECHISME.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Téléphone du parent (facultatif)</label>
              <input
                type="tel"
                className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
                value={row.telephoneParent}
                onChange={(e) => updateRow(i, { telephoneParent: e.target.value })}
                placeholder="+229 97 00 00 00"
              />
            </div>
          </section>
        );
      })}

      <button
        type="button"
        onClick={addRow}
        disabled={rows.length >= 20}
        className="w-full h-[48px] rounded-lg border-2 border-dashed border-primary text-primary font-label-lg uppercase tracking-wide"
      >
        + Ajouter un enfant ({rows.length}/20)
      </button>

      {/* Consentement */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
        <label className="flex items-start gap-space-sm">
          <input
            type="checkbox"
            className="mt-1 w-5 h-5"
            checked={consentement}
            onChange={(e) => setConsentement(e.target.checked)}
          />
          <span className="font-body-sm text-body-sm text-on-surface">
            J&apos;ai l&apos;accord formel des parents ou tuteurs pour enregistrer et gérer ces informations paroissiales.
          </span>
        </label>
      </section>

      <button
        type="submit"
        disabled={loading || !consentement}
        className="w-full h-[52px] min-h-[52px] bg-primary-container text-on-primary rounded-lg font-label-lg text-label-lg uppercase tracking-wide flex items-center justify-center space-x-space-sm active:bg-primary transition-all shadow-md disabled:opacity-60"
      >
        <span>{loading ? "Enregistrement..." : "Enregistrer"}</span>
      </button>

      {/* Résultats */}
      {result && (
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
          {result.ok ? (
            <>
              <p className="font-label-md text-label-md text-secondary font-semibold">
                Enregistrement terminé.
              </p>
              <ul className="space-y-1">
                {result.results.map((r, i) => (
                  <li key={i} className="font-body-sm text-body-sm">
                    {r.status === "ajoute" ? (
                      <span className="text-secondary">
                        ✅ {r.nom} {r.prenoms} ajouté (LJ-{String(r.numero).padStart(3, "0")})
                      </span>
                    ) : (
                      <span className="text-error">
                        ⚠️ {r.nom} {r.prenoms} déjà inscrit dans {r.fraternite} ({r.statut})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="font-body-sm text-body-sm text-error">
              {result.error}
            </p>
          )}
        </section>
      )}
    </form>
  );
}
