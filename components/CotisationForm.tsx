"use client";

import { useEffect, useState } from "react";
import { enregistrerCotisationAction, getCotisationEtatsAction } from "@/lib/actions/cotisation";
import { toastSuccess, toastError } from "@/lib/toast";

type Enfant = { id: string; nom: string; prenoms: string };

type Props = {
  fraternites: { id: string; nom: string }[];
  dimanches: string[];
  enfantsByFrat: Record<string, Enfant[]>;
  montant: number;
};

export default function CotisationForm({ fraternites, dimanches, enfantsByFrat, montant }: Props) {
  const [date, setDate] = useState(dimanches[0] ?? "");
  const [fratId, setFratId] = useState(fraternites[0]?.id ?? "");
  const [payes, setPayes] = useState<Set<string>>(new Set());
  const [loadingEtats, setLoadingEtats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; count?: number; total?: number; error?: string } | null>(null);

  const enfants = enfantsByFrat[fratId] ?? [];

  useEffect(() => {
    if (!date || !fratId) return;
    let cancelled = false;
    async function load() {
      setLoadingEtats(true);
      try {
        const ids = await getCotisationEtatsAction(date, fratId);
        if (!cancelled) setPayes(new Set(ids));
      } finally {
        if (!cancelled) setLoadingEtats(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [date, fratId]);

  function toggle(id: string) {
    setPayes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toutCocher() {
    setPayes(new Set(enfants.map((e) => e.id)));
  }

  const total = payes.size * montant;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await enregistrerCotisationAction({
      date,
      fraterniteId: fratId,
      payes: Array.from(payes),
    });
    setResult(res);
    setLoading(false);
    if (res.ok) toastSuccess(`${res.count} enfant(s) payé(s) enregistré(s)`, `Total ${res.total} F enregistré.`);
    else toastError(res.error ?? "Erreur lors de l'enregistrement.");
  }

  return (
    <form className="px-margin py-space-md space-y-space-md" onSubmit={onSubmit}>
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface">Date de célébration</label>
          <select
            className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          >
            {dimanches.map((d) => (
              <option key={d} value={d}>
                {new Date(d + "T00:00:00Z").toLocaleDateString("fr-FR", {
                  timeZone: "Africa/Porto-Novo",
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface">Fraternité</label>
          <select
            className="w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm"
            value={fratId}
            onChange={(e) => setFratId(e.target.value)}
          >
            {fraternites.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Caisse du jour */}
      <section className="bg-primary text-on-primary rounded-xl p-space-md shadow-md space-y-space-xs">
        <p className="font-label-sm text-label-sm uppercase tracking-wider opacity-80">Caisse du jour</p>
        <p className="font-headline-lg text-headline-lg">
          {total} <span className="text-headline-sm">F CFA</span>
        </p>
        <p className="font-body-sm text-body-sm opacity-80">
          {payes.size} / {enfants.length} enfant(s) payé(s) — {montant} F par enfant
        </p>
      </section>

      <section className="space-y-space-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Appel de cotisation</h2>
          <button type="button" onClick={toutCocher} className="font-label-md text-label-md text-primary">
            Tout cocher
          </button>
        </div>
        {loadingEtats ? (
          <p className="font-body-sm text-on-surface-variant">Chargement...</p>
        ) : enfants.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">Aucun lecteur actif dans cette fraternité.</p>
        ) : (
          <div className="space-y-space-xs">
            {enfants.map((e) => {
              const paid = payes.has(e.id);
              return (
                <label
                  key={e.id}
                  className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body-lg text-body-lg text-on-surface truncate">
                      {e.nom} {e.prenoms}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="w-6 h-6"
                    checked={paid}
                    onChange={() => toggle(e.id)}
                  />
                </label>
              );
            })}
          </div>
        )}
      </section>

      <button
        type="submit"
        disabled={loading || loadingEtats || enfants.length === 0}
        className="w-full h-[52px] min-h-[52px] bg-primary-container text-on-primary rounded-lg font-label-lg text-label-lg uppercase tracking-wide flex items-center justify-center space-x-space-sm active:bg-primary transition-all shadow-md disabled:opacity-60"
      >
        <span>{loading ? "Enregistrement..." : "Enregistrer la cotisation"}</span>
      </button>

      {result && (
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          {result.ok ? (
            <p className="font-body-sm text-body-sm text-secondary">
              ✅ {result.count} payé(s) — total {result.total} F enregistré.
            </p>
          ) : (
            <p className="font-body-sm text-body-sm text-error">{result.error}</p>
          )}
        </section>
      )}
    </form>
  );
}
