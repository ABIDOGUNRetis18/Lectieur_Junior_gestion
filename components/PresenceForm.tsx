"use client";

import { useEffect, useState, useMemo } from "react";
import { getPresenceEtatsAction, enregistrerPresenceAction } from "@/lib/actions/presence";
import { ECOLE_LABELS } from "@/lib/schemas/inscription";
import { toastSuccess, toastError } from "@/lib/toast";

type Enfant = {
  id: string;
  nom: string;
  prenoms: string;
  classeEcole: string;
};

type Props = {
  fraternites: { id: string; nom: string }[];
  dimanches: string[];
  enfantsByFrat: Record<string, Enfant[]>;
};

const ETAT_LABEL: Record<string, string> = {
  PRESENT: "Présent",
  PERMISSION: "Excusé",
  ABSENT: "Absent",
};

const ETAT_LETTER: Record<string, string> = {
  PRESENT: "P",
  PERMISSION: "E",
  ABSENT: "A",
};

const ETAT_COLOR: Record<string, string> = {
  PRESENT: "bg-secondary text-on-secondary",
  PERMISSION: "bg-tertiary-container text-on-tertiary-container",
  ABSENT: "bg-error text-on-error",
};

export default function PresenceForm({ fraternites, dimanches, enfantsByFrat }: Props) {
  const [date, setDate] = useState(dimanches[0] ?? "");
  const [fratId, setFratId] = useState(fraternites[0]?.id ?? "");
  const [etats, setEtats] = useState<Record<string, "PRESENT" | "PERMISSION" | "ABSENT">>({});
  const [loadingEtats, setLoadingEtats] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; count?: number; error?: string } | null>(null);

  const enfants = useMemo(() => enfantsByFrat[fratId] ?? [], [enfantsByFrat, fratId]);

  // Charger les états existants quand date/frat change
  useEffect(() => {
    if (!date || !fratId) return;
    let cancelled = false;
    async function load() {
      setLoadingEtats(true);
      try {
        const m = await getPresenceEtatsAction(date, fratId);
        if (cancelled) return;
        const next: Record<string, "PRESENT" | "PERMISSION" | "ABSENT"> = {};
        for (const e of enfants) {
          next[e.id] = m[e.id] ?? "ABSENT";
        }
        setEtats(next);
      } finally {
        if (!cancelled) setLoadingEtats(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [date, fratId, enfants]);

  function setEtat(enfantId: string, etat: "PRESENT" | "PERMISSION" | "ABSENT") {
    setEtats((prev) => ({ ...prev, [enfantId]: etat }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const res = await enregistrerPresenceAction({
      date,
      fraterniteId: fratId,
      presences: enfants.map((e) => ({ enfantId: e.id, etat: etats[e.id] ?? "ABSENT" })),
    });
    setResult(res);
    setLoading(false);
    if (res.ok) toastSuccess(`Présence enregistrée pour ${res.count} enfant(s)`);
    else toastError(res.error ?? "Erreur lors de l'enregistrement.");
  }

  return (
    <form className="px-margin py-space-md space-y-space-md" onSubmit={onSubmit}>
      {/* Sélecteurs */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-primary">event</span>
            Date de célébration
          </label>
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
          <label className="block font-label-md text-label-md text-on-surface flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
            Fraternité
          </label>
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

      {/* Liste des enfants */}
      <section className="space-y-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">
          Appel des lecteurs ({enfants.length})
        </h2>
        {loadingEtats ? (
          <p className="font-body-sm text-on-surface-variant">Chargement...</p>
        ) : enfants.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">Aucun lecteur actif dans cette fraternité.</p>
        ) : (
          <div className="space-y-space-xs">
            {enfants.map((e) => {
              const etat = etats[e.id] ?? "ABSENT";
              return (
                <div
                  key={e.id}
                  className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex items-center justify-between gap-space-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-body-lg text-body-lg text-on-surface truncate">
                      {e.nom} {e.prenoms}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{ECOLE_LABELS[e.classeEcole] ?? e.classeEcole}</p>
                  </div>
                  <div className="flex gap-1 rounded-lg bg-surface-container p-1">
                    {(["PRESENT", "PERMISSION", "ABSENT"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEtat(e.id, st)}
                        title={ETAT_LABEL[st]}
                        aria-label={ETAT_LABEL[st]}
                        className={`min-w-[40px] h-[36px] rounded-md font-label-md text-label-md transition-all ${
                          etat === st ? ETAT_COLOR[st] + " shadow-sm" : "text-on-surface-variant hover:bg-surface-container-lowest"
                        }`}
                      >
                        {ETAT_LETTER[st]}
                      </button>
                    ))}
                  </div>
                </div>
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
        <span>{loading ? "Enregistrement..." : "Enregistrer la présence"}</span>
      </button>

      {result && (
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          {result.ok ? (
            <p className="font-body-sm text-body-sm text-secondary">
              ✅ Présence enregistrée pour {result.count} enfant(s).
            </p>
          ) : (
            <p className="font-body-sm text-body-sm text-error">{result.error}</p>
          )}
        </section>
      )}
    </form>
  );
}
