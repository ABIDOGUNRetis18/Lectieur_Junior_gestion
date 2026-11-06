"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { formatClasseEcole } from "@/lib/schemas/inscription";
import { formatTelephone } from "@/lib/normalization";
import { confirmDialog } from "@/lib/confirm";
import { toastSuccess, toastError } from "@/lib/toast";

type Pres = { date: string; etat: string };
type Cot = { date: string; montant: number };
type Frat = { id: string; nom: string };
type Enfant = {
  id: string; nom: string; prenoms: string; dateNaissance: string;
  classeEcole: string; serie: string | null; classeCatechisme: string;
  telephoneParent: string | null; statut: string; role: string; fraterniteId: string;
  fraterniteNom: string; createdAt: string; updatedAt: string;
  presences: Pres[]; cotisations: Cot[];
};
type Props = { enfant: Enfant; fraternites: Frat[] };

const CAT_LABEL: Record<string, string> = {
  ANNEE_1: "1ère année", ANNEE_2: "2ème année", ANNEE_3: "3ème année",
  ANNEE_4: "4ème année", ANNEE_5: "5ème année", TERMINE: "Terminé",
};

const FIELD = "w-full h-[44px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm";

export default function EnfantFiche({ enfant, fraternites }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const dashboardHref =
    session?.user?.role === "ADMIN" ? "/admin/tableau-de-bord" : "/responsable/tableau-de-bord";
  const storedSerie = enfant.serie ?? "";
  const initialSerie = storedSerie.startsWith("Autre: ") ? "AUTRE" : storedSerie;
  const initialSerieAutre = storedSerie.startsWith("Autre: ") ? storedSerie.slice(7) : "";
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({
    nom: enfant.nom,
    prenoms: enfant.prenoms,
    dateNaissance: enfant.dateNaissance,
    classeEcole: enfant.classeEcole,
    serie: initialSerie,
    serieAutre: initialSerieAutre,
    classeCatechisme: enfant.classeCatechisme,
    telephoneParent: enfant.telephoneParent ?? "",
    fraterniteId: enfant.fraterniteId,
    role: enfant.role,
  });

  async function toggleStatut() {
    setBusy(true);
    setMsg(null);
    const nouveau = enfant.statut === "ACTIF" ? "INACTIF" : "ACTIF";
    const res = await changerStatutEnfantAction(enfant.id, nouveau);
    setMsg({ ok: res.ok, text: res.ok ? res.message! : res.error });
    if (res.ok) toastSuccess(res.message!);
    else toastError(res.error);
    setBusy(false);
    if (res.ok) router.refresh();
  }

  async function supprimer() {
    const confirmed = await confirmDialog({
      title: `Supprimer ${enfant.nom} ${enfant.prenoms} ?`,
      message: "Cette action est irréversible. Les présences et cotisations associées seront également supprimées.",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!confirmed) return;
    setBusy(true);
    setMsg(null);
    const res = await supprimerEnfantAction(enfant.id);
    setBusy(false);
    if (res.ok) {
      toastSuccess(res.message!);
      router.push(dashboardHref);
    } else {
      setMsg({ ok: false, text: res.error });
      toastError(res.error);
    }
  }

  async function exporter() {
    setBusy(true);
    setMsg(null);
    const res = await exporterDonneesEnfantAction(enfant.id);
    setBusy(false);
    if (!res.ok) {
      setMsg({ ok: false, text: res.error });
      toastError(res.error);
      return;
    }
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enfant-${enfant.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMsg({ ok: true, text: "Export téléchargé." });
    toastSuccess("Export téléchargé.");
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
      serieAutre: edit.serie === "AUTRE" ? edit.serieAutre : null,
      classeCatechisme: edit.classeCatechisme as never,
      telephoneParent: edit.telephoneParent || null,
      fraterniteId: edit.fraterniteId,
      role: edit.role as "ENFANT" | "RESPONSABLE",
    });
    setBusy(false);
    if (res.ok) {
      setMsg({ ok: true, text: res.message });
      toastSuccess(res.message);
      setEditing(false);
      router.refresh();
    } else {
      setMsg({ ok: false, text: res.error });
      toastError(res.error);
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
        <div className="flex flex-col gap-space-sm sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-headline-md text-headline-md text-primary break-words">
              {enfant.nom} {enfant.prenoms}
            </h2>
            <p className="font-body-sm text-on-surface-variant break-words">
              {enfant.fraterniteNom}
              {enfant.statut === "INACTIF" && <span className="ml-2 text-error font-label-sm">(inactif)</span>}
            </p>
          </div>
          <div className="flex flex-wrap gap-space-xs sm:flex-col sm:shrink-0">
            <button type="button" disabled={busy} onClick={() => setEditing((v) => !v)}
              className="h-[40px] px-space-sm rounded-lg bg-primary-container text-on-primary font-label-sm text-label-sm whitespace-nowrap">
              {editing ? "Annuler" : "Modifier"}
            </button>
            <button type="button" disabled={busy} onClick={toggleStatut}
              className="h-[40px] px-space-sm rounded-lg border border-outline-variant font-label-sm text-label-sm whitespace-nowrap">
              {enfant.statut === "ACTIF" ? "Désactiver" : "Réactiver"}
            </button>
            <button type="button" disabled={busy} onClick={exporter}
              className="h-[40px] px-space-sm rounded-lg border border-outline-variant font-label-sm text-label-sm whitespace-nowrap">
              Exporter
            </button>
            <button type="button" disabled={busy} onClick={supprimer}
              className="h-[40px] px-space-sm rounded-lg border border-error text-error font-label-sm text-label-sm whitespace-nowrap">
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
              {fraternites.length > 1 ? (
                <select className={FIELD} value={edit.fraterniteId} onChange={(e) => setEdit({ ...edit, fraterniteId: e.target.value })}>
                  {fraternites.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              ) : (
                <p className={`${FIELD} flex items-center`}>{fraternites[0]?.nom ?? "—"}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Classe à l&apos;école</label>
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
              {edit.serie === "AUTRE" && (
                <input
                  className={FIELD}
                  value={edit.serieAutre}
                  onChange={(e) => setEdit({ ...edit, serieAutre: e.target.value })}
                  placeholder="Précisez la série"
                />
              )}
            </div>
          )}
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Téléphone du parent</label>
            <input className={FIELD} value={edit.telephoneParent} onChange={(e) => setEdit({ ...edit, telephoneParent: e.target.value })} placeholder="01 97 00 00 00" />
          </div>
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Rôle</label>
            <select className={FIELD} value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value })}>
              <option value="ENFANT">Enfant</option>
              <option value="RESPONSABLE">Responsable de fraternité</option>
            </select>
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
            <div><dt className="font-label-md text-on-surface-variant">Classe à l&apos;école</dt><dd>{formatClasseEcole(enfant.classeEcole, enfant.serie)}</dd></div>
            {CLASSES_AVEC_SERIE.includes(enfant.classeEcole) && (<div><dt className="font-label-md text-on-surface-variant">Série</dt><dd>{enfant.serie ?? "—"}</dd></div>)}
            <div><dt className="font-label-md text-on-surface-variant">Classe au catéchisme</dt><dd>{CAT_LABEL[enfant.classeCatechisme] ?? enfant.classeCatechisme}</dd></div>
            <div><dt className="font-label-md text-on-surface-variant">Téléphone parent</dt><dd>{formatTelephone(enfant.telephoneParent) || "—"}</dd></div>
            <div><dt className="font-label-md text-on-surface-variant">Rôle</dt><dd>{enfant.role === "RESPONSABLE" ? "Responsable de fraternité" : "Enfant"}</dd></div>
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
