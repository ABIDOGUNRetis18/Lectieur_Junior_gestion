"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  changerStatutEnfantAction,
  supprimerEnfantAction,
  exporterDonneesEnfantAction,
  modifierEnfantAction,
} from "@/lib/actions/enfants";
import {
  CLASSES_ECOLE,
  CLASSES_CATECHISME,
  SERIES,
  CLASSES_AVEC_SERIE,
} from "@/lib/schemas/inscription";

type Pres = { date: string; etat: string };
type Cot = { date: string; montant: number };
type Frat = { id: string; nom: string };
type Enfant = {
  id: string; numero: number; nom: string; prenoms: string; dateNaissance: string;
  classeEcole: string; serie: string | null; classeCatechisme: string;
  telephoneParent: string | null; statut: string; fraterniteId: string;
  fraterniteNom: string; createdAt: string; updatedAt: string;
  presences: Pres[]; cotisations: Cot[];
};
type Props = { enfant: Enfant; fraternites: Frat[] };

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

const FIELD = "w-full h-[44px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm";

export default function EnfantFiche({ enfant, fraternites }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({
    nom: enfant.nom,
    prenoms: enfant.prenoms,
    dateNaissance: enfant.dateNaissance,
    classeEcole: enfant.classeEcole,
    serie: enfant.serie ?? "",
    classeCatechisme: enfant.classeCatechisme,
    telephoneParent: enfant.telephoneParent ?? "",
    fraterniteId: enfant.fraterniteId,
  });

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
    if (!res.ok) { setMsg({ ok: false, text: res.error }); return; }
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

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await modifierEnfantAction({
      enfantId: enfant.id,
      nom: edit.nom,
      prenoms: edit.prenoms,
      dateNaissance: edit.dateNaissance,
      classeEcole: edit.classeEcole as never,
      serie: edit.serie || null,
      classeCatechisme: edit.classeCatechisme as never,
      telephoneParent: edit.telephoneParent || null,
      fraterniteId: edit.fraterniteId,
    });
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: res.message });
      setEditing(false);
      router.refresh();
    } else {
      setMsg({ ok: false, text: res.error });
    }
  }

  const needsSerie = CLASSES_AVEC_SERIE.includes(edit.classeEcole);

  return (
    <div className="px-margin py-space-md space-y-space-md">
      {msg && (
        <div className={`rounded-xl p-space-sm font-body-sm text-body-sm ${msg.ok ? "bg-secondary-container text-on-secondary-container" : "bg-error-container text-on-error-container"}`}>
          {msg.ok ? "✅ " : "❌ "}{msg.text}
        </div>
      )}

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
              {enfant.statut === "INACTIF" && <span className="ml-2 text-error font-label-sm">(inactif)</span>}
            </p>
          </div>
          <div className="flex flex-col gap-space-xs">
            <button type="button" disabled={busy} onClick={() => setEditing((v) => !v)}
              className="h-[40px] px-space-sm rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm">
              {editing ? "Annuler" : "Modifier"}
            </button>
            <button type="button" disabled={busy} onClick={toggleStatut}
              className="h-[40px] px-space-sm rounded-lg border border-outline-variant font-label-sm text-label-sm">
              {enfant.statut === "ACTIF" ? "Désactiver" : "Réactiver"}
            </button>
            <button type="button" disabled={busy} onClick={exporter}
              className="h-[40px] px-space-sm rounded-lg border border-outline-variant font-label-sm text-label-sm">
              Exporter
            </button>
            <button type="button" disabled={busy} onClick={supprimer}
              className="h-[40px] px-space-sm rounded-lg border border-error text-error font-label-sm text-label-sm">
              Supprimer
            </button>
          </div>
        </div>
      </section>

      {editing && (
        <form onSubmit={saveEdit} className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
          <h3 className="font-headline-sm text-headline-sm text-primary">Modifier</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Nom (MAJUSCULES)</label>
              <input className={FIELD} value={edit.nom} onChange={(e) => setEdit({ ...edit, nom: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Prénoms</label>
              <input className={FIELD} value={edit.prenoms} onChange={(e) => setEdit({ ...edit, prenoms: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Date de naissance</label>
              <input className={FIELD} type="date" value={edit.dateNaissance} onChange={(e) => setEdit({ ...edit, dateNaissance: e.target.value })} />
            </div>
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Fraternité</label>
              <select className={FIELD} value={edit.fraterniteId} onChange={(e) => setEdit({ ...edit, fraterniteId: e.target.value })}>
                {fraternites.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Classe à l'école</label>
              <select className={FIELD} value={edit.classeEcole} onChange={(e) => setEdit({ ...edit, classeEcole: e.target.value })}>
                {CLASSES_ECOLE.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Classe au catéchisme</label>
              <select className={FIELD} value={edit.classeCatechisme} onChange={(e) => setEdit({ ...edit, classeCatechisme: e.target.value })}>
                {CLASSES_CATECHISME.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          {needsSerie && (
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Série</label>
              <select className={FIELD} value={edit.serie} onChange={(e) => setEdit({ ...edit, serie: e.target.value })}>
                <option value="">— Choisir —</option>
                {SERIES.filter((s) => s !== "AUTRE").map((s) => <option key={s} value={s}>{s}</option>)}
                <option value="AUTRE">Autre</option>
              </select>
            </div>
          )}
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Téléphone du parent</label>
            <input className={FIELD} value={edit.telephoneParent} onChange={(e) => setEdit({ ...edit, telephoneParent: e.target.value })} placeholder="+229 97 00 00 00" />
          </div>
          <button type="submit" disabled={busy}
            className="w-full h-[52px] min-h-[52px] bg-primary-container text-on-primary rounded-lg font-label-lg text-label-lg uppercase tracking-wide flex items-center justify-center active:bg-primary transition-all shadow-md disabled:opacity-60">
            {busy ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      )}

      {!editing && (
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h3 className="font-headline-sm text-headline-sm text-primary">Informations</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs font-body-md text-body-md">
            <div><dt className="font-label-md text-on-surface-variant">Date de naissance</dt><dd>{enfant.dateNaissance}</dd></div>
            <div><dt className="font-label-md text-on-surface-variant">Classe à l'école</dt><dd>{CLASSE_LABEL[enfant.classeEcole] ?? enfant.classeEcole}</dd></div>
            {CLASSES_AVEC_SERIE.includes(enfant.classeEcole) && (<div><dt className="font-label-md text-on-surface-variant">Série</dt><dd>{enfant.serie ?? "—"}</dd></div>)}
            <div><dt className="font-label-md text-on-surface-variant">Classe au catéchisme</dt><dd>{CAT_LABEL[enfant.classeCatechisme] ?? enfant.classeCatechisme}</dd></div>
            <div><dt className="font-label-md text-on-surface-variant">Téléphone parent</dt><dd>{enfant.telephoneParent ?? "—"}</dd></div>
            <div><dt className="font-label-md text-on-surface-variant">Inscrit le</dt><dd>{enfant.createdAt.slice(0, 10)}</dd></div>
          </dl>
        </section>
      )}

      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
        <h3 className="font-headline-sm text-headline-sm text-primary">Présences ({enfant.presences.length})</h3>
        {enfant.presences.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">Aucune présence enregistrée.</p>
        ) : (
          <ul className="divide-y divide-outline-variant/50 max-h-60 overflow-y-auto">
            {enfant.presences.map((p) => (
              <li key={p.date} className="py-space-xs flex justify-between font-body-sm">
                <span>{p.date}</span>
                <span className={p.etat === "PRESENT" ? "text-secondary font-semibold" : p.etat === "PERMISSION" ? "text-tertiary font-semibold" : "text-error font-semibold"}>
                  {p.etat === "PRESENT" ? "Présent" : p.etat === "PERMISSION" ? "Excusé" : "Absent"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
        <h3 className="font-headline-sm text-headline-sm text-primary">Cotisations ({enfant.cotisations.length})</h3>
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
