"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  changerStatutEnfantAction,
  supprimerEnfantAction,
  exporterDonneesEnfantAction,
} from "@/lib/actions/enfants";

type Pres = { date: string; etat: string };
type Cot = { date: string; montant: number };

type Props = {
  enfant: {
    id: string;
    numero: number;
    nom: string;
    prenoms: string;
    dateNaissance: string;
    classeEcole: string;
    serie: string | null;
    classeCatechisme: string;
    telephoneParent: string | null;
    statut: string;
    fraterniteId: string;
    fraterniteNom: string;
    createdAt: string;
    updatedAt: string;
    presences: Pres[];
    cotisations: Cot[];
  };
};

const CLASSE_LABEL: Record<string, string> = {
  AVANT_CM1: "Avant le CM1", CM1: "CM1", CM2: "CM2", SIXIEME: "6ème",
  CINQUIEME: "5ème", QUATRIEME: "4ème", TROISIEME: "3ème", SECONDE: "Seconde",
  PREMIERE: "Première", TERMINALE: "Terminale", SUPERIEUR: "Études supérieures",
  TERMINEE: "Scolarité terminée",
};
const CAT_LABEL: Record<string, string> = {
  ANNEE_1: "1ère année", ANNEE_2: "2ème année", ANNEE_3: "3ème année",
  ANNEE_4: "4ème année", ANNEE_5: "5ème année", TERMINE: "Terminé",
};

export default function EnfantFiche({ enfant }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function toggleStatut() {
    setBusy(true);
    setMsg(null);
    const nouveau = enfant.statut === "ACTIF" ? "INACTIF" : "ACTIF";
    const res = await changerStatutEnfantAction(enfant.id, nouveau);
    setMsg({ ok: res.ok, text: res.ok ? res.message! : res.error });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  async function supprimer() {
    if (!confirm(`Supprimer définitivement les données de ${enfant.nom} ${enfant.prenoms} ?\nCette action est irréversible.`)) return;
    setBusy(true);
    setMsg(null);
    const res = await supprimerEnfantAction(enfant.id);
    setMsg({ ok: res.ok, text: res.ok ? res.message! : res.error });
    setBusy(false);
    if (res.ok) router.push("/enfants");
  }

  async function exporter() {
    setBusy(true);
    setMsg(null);
    const res = await exporterDonneesEnfantAction(enfant.id);
    setBusy(false);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error });
      return;
    }
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enfant-LJ-${String(enfant.numero).padStart(3, "0")}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMsg({ ok: true, text: "Export téléchargé." });
  }

  return (
    <div className="px-margin py-space-md space-y-space-md">
      {msg && (
        <div
          className={`rounded-xl p-space-sm font-body-sm text-body-sm ${
            msg.ok ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"
          }`}
        >
          {msg.ok ? "✅ " : "❌ "}
          {msg.text}
        </div>
      )}

      {/* En-tête */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
        <div className="flex items-start justify-between gap-space-sm">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              LJ-{String(enfant.numero).padStart(3, "0")}
            </p>
            <h2 className="font-headline-md text-headline-md text-primary">
              {enfant.nom} {enfant.prenoms}
            </h2>
            <p className="font-body-sm text-on-surface-variant">
              {enfant.fraterniteNom}
              {enfant.statut === "INACTIF" && (
                <span className="ml-2 text-error font-label-sm">(inactif)</span>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-space-xs">
            <button
              type="button"
              disabled={busy}
              onClick={toggleStatut}
              className="h-[40px] px-space-sm rounded-lg border border-outline-variant font-label-sm text-label-sm"
            >
              {enfant.statut === "ACTIF" ? "Désactiver" : "Réactiver"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={exporter}
              className="h-[40px] px-space-sm rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm"
            >
              Exporter données
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={supprimer}
              className="h-[40px] px-space-sm rounded-lg border border-error text-error font-label-sm text-label-sm"
            >
              Supprimer
            </button>
          </div>
        </div>
      </section>

      {/* Informations personnelles */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
        <h3 className="font-headline-sm text-headline-sm text-primary">Informations</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs font-body-md text-body-md">
          <div><dt className="font-label-md text-on-surface-variant">Date de naissance</dt><dd>{enfant.dateNaissance}</dd></div>
          <div><dt className="font-label-md text-on-surface-variant">Classe à l&apos;école</dt><dd>{CLASSE_LABEL[enfant.classeEcole] ?? enfant.classeEcole}</dd></div>
          <div><dt className="font-label-md text-on-surface-variant">Série</dt><dd>{enfant.serie ?? "—"}</dd></div>
          <div><dt className="font-label-md text-on-surface-variant">Classe au catéchisme</dt><dd>{CAT_LABEL[enfant.classeCatechisme] ?? enfant.classeCatechisme}</dd></div>
          <div><dt className="font-label-md text-on-surface-variant">Téléphone parent</dt><dd>{enfant.telephoneParent ?? "—"}</dd></div>
          <div><dt className="font-label-md text-on-surface-variant">Inscrit le</dt><dd>{enfant.createdAt.slice(0, 10)}</dd></div>
        </dl>
      </section>

      {/* Présences */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          Présences ({enfant.presences.length})
        </h3>
        {enfant.presences.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">Aucune présence enregistrée.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/50 max-h-60 overflow-y-auto">
            {enfant.presences.map((p) => (
              <li key={p.date} className="py-space-xs flex justify-between font-body-sm">
                <span>{p.date}</span>
                <span
                  className={
                    p.etat === "PRESENT"
                      ? "text-secondary font-semibold"
                      : p.etat === "PERMISSION"
                        ? "text-tertiary font-semibold"
                        : "text-error font-semibold"
                  }
                >
                  {p.etat === "PRESENT" ? "Présent" : p.etat === "PERMISSION" ? "Excusé" : "Absent"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Cotisations */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
        <h3 className="font-headline-sm text-headline-sm text-primary">
          Cotisations ({enfant.cotisations.length})
        </h3>
        {enfant.cotisations.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">Aucune cotisation enregistrée.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/50 max-h-60 overflow-y-auto">
            {enfant.cotisations.map((c) => (
              <li key={c.date} className="py-space-xs flex justify-between font-body-sm">
                <span>{c.date}</span>
                <span className="font-semibold">{c.montant} F</span>
              </li>
            ))}
          </ul>
        )}
        <p className="font-body-sm text-on-surface-variant pt-1">
          Total : {enfant.cotisations.reduce((s, c) => s + c.montant, 0)} F
        </p>
      </section>
    </div>
  );
}
