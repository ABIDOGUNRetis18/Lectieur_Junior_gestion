"use client";

import { useState } from "react";
import { updateGroupeAction } from "@/lib/actions/parametres";
import {
  creerCompteAction,
  updateCompteAction,
  resetPasswordAction,
  supprimerCompteAction,
} from "@/lib/actions/comptes";
import { MOIS_NOMS, ROLES } from "@/lib/schemas/parametres";

type Compte = {
  id: string;
  nom: string;
  email: string;
  role: string;
  fraterniteId: string | null;
  fraterniteNom: string | null;
};

type Props = {
  groupe: {
    nom: string;
    montantCotisation: number;
    premierDimanche: string; // AAAA-MM-JJ
    moisDebutAnnee: number;
    moisSansReunion: number[];
  };
  comptes: Compte[];
  fraternites: { id: string; nom: string }[];
  currentUserId: string;
};

const FIELD =
  "w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm";

function Err({ msgs }: { msgs?: string[] }) {
  if (!msgs?.length) return null;
  return <p className="font-body-sm text-body-sm text-error">{msgs[0]}</p>;
}

export default function ParametresView({ groupe, comptes, fraternites, currentUserId }: Props) {
  // ---- Paramètres groupe ----
  const [nom, setNom] = useState(groupe.nom);
  const [montant, setMontant] = useState(String(groupe.montantCotisation));
  const [premier, setPremier] = useState(groupe.premierDimanche);
  const [debutAnnee, setDebutAnnee] = useState(String(groupe.moisDebutAnnee));
  const [sansReunion, setSansReunion] = useState<Set<number>>(new Set(groupe.moisSansReunion));
  const [savingParams, setSavingParams] = useState(false);
  const [paramsResult, setParamsResult] = useState<{
    ok: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  } | null>(null);

  function toggleMois(m: number) {
    setSansReunion((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  }

  async function saveParams(e: React.FormEvent) {
    e.preventDefault();
    setSavingParams(true);
    setParamsResult(null);
    const res = await updateGroupeAction({
      nom,
      montantCotisation: Number(montant),
      premierDimanche: premier,
      moisDebutAnnee: Number(debutAnnee),
      moisSansReunion: Array.from(sansReunion),
    });
    setParamsResult(res);
    setSavingParams(false);
  }

  // ---- Création de compte ----
  const [cNom, setCNom] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cPwd, setCPwd] = useState("");
  const [cRole, setCRole] = useState("SECRETAIRE");
  const [cFrat, setCFrat] = useState("");
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<{
    ok: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  } | null>(null);

  async function createCompte(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateResult(null);
    const res = await creerCompteAction({
      nom: cNom,
      email: cEmail,
      password: cPwd,
      role: cRole as never,
      fraterniteId: cFrat || null,
    });
    setCreateResult(res);
    setCreating(false);
    if (res.ok) {
      setCNom("");
      setCEmail("");
      setCPwd("");
    }
  }

  // ---- Actions sur un compte ----
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwdFor, setPwdFor] = useState<string | null>(null);
  const [newPwd, setNewPwd] = useState("");

  async function changeRole(c: Compte, role: string) {
    setBusyId(c.id);
    setMsg(null);
    const res = await updateCompteAction({
      userId: c.id,
      role: role as never,
      fraterniteId: role === "RESPONSABLE" ? c.fraterniteId ?? fraternites[0]?.id ?? null : null,
    });
    setMsg({ ok: res.ok, text: res.ok ? res.message! : res.error });
    setBusyId(null);
  }

  async function changeFrat(c: Compte, fraterniteId: string) {
    setBusyId(c.id);
    setMsg(null);
    const res = await updateCompteAction({
      userId: c.id,
      role: c.role as never,
      fraterniteId: fraterniteId || null,
    });
    setMsg({ ok: res.ok, text: res.ok ? res.message! : res.error });
    setBusyId(null);
  }

  async function resetPwd(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdFor) return;
    setBusyId(pwdFor);
    setMsg(null);
    const res = await resetPasswordAction({ userId: pwdFor, password: newPwd });
    setMsg({ ok: res.ok, text: res.ok ? res.message! : res.error });
    if (res.ok) {
      setPwdFor(null);
      setNewPwd("");
    }
    setBusyId(null);
  }

  async function remove(c: Compte) {
    if (!confirm(`Supprimer le compte de ${c.nom} ?`)) return;
    setBusyId(c.id);
    setMsg(null);
    const res = await supprimerCompteAction(c.id);
    setMsg({ ok: res.ok, text: res.ok ? res.message! : res.error });
    setBusyId(null);
  }

  return (
    <div className="px-margin py-space-md space-y-space-lg">
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

      {/* ---------- Paramètres du groupe ---------- */}
      <form
        onSubmit={saveParams}
        className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm"
      >
        <h2 className="font-headline-sm text-headline-sm text-primary">Paramètres du groupe</h2>

        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface">Nom du groupe</label>
          <input className={FIELD} value={nom} onChange={(e) => setNom(e.target.value)} />
          <Err msgs={paramsResult?.fieldErrors?.nom} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Cotisation (F CFA / enfant)</label>
            <input
              className={FIELD}
              type="number"
              min={0}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
            <Err msgs={paramsResult?.fieldErrors?.montantCotisation} />
          </div>
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Premier dimanche</label>
            <input
              className={FIELD}
              type="date"
              value={premier}
              onChange={(e) => setPremier(e.target.value)}
            />
            <Err msgs={paramsResult?.fieldErrors?.premierDimanche} />
          </div>
        </div>

        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface">Mois de début de l&apos;année</label>
          <select className={FIELD} value={debutAnnee} onChange={(e) => setDebutAnnee(e.target.value)}>
            {MOIS_NOMS.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface">
            Mois sans réunion (activités d&apos;été)
          </label>
          <div className="flex flex-wrap gap-space-xs">
            {MOIS_NOMS.map((m, i) => {
              const num = i + 1;
              const on = sansReunion.has(num);
              return (
                <button
                  type="button"
                  key={num}
                  onClick={() => toggleMois(num)}
                  className={`h-[40px] px-space-sm rounded-lg font-label-sm text-label-sm border transition-colors ${
                    on
                      ? "bg-primary-container text-on-primary border-primary"
                      : "bg-surface text-on-surface border-outline-variant"
                  }`}
                >
                  {m}
                </button>
              );
            })}
          </div>
          <Err msgs={paramsResult?.fieldErrors?.moisSansReunion} />
        </div>

        <button
          type="submit"
          disabled={savingParams}
          className="w-full h-[52px] min-h-[52px] bg-primary-container text-on-primary rounded-lg font-label-lg text-label-lg uppercase tracking-wide flex items-center justify-center active:bg-primary transition-all shadow-md disabled:opacity-60"
        >
          {savingParams ? "Enregistrement..." : "Enregistrer les paramètres"}
        </button>

        {paramsResult && (
          <p
            className={`font-body-sm text-body-sm ${
              paramsResult.ok ? "text-secondary" : "text-error"
            }`}
          >
            {paramsResult.ok ? `✅ ${paramsResult.message}` : `❌ ${paramsResult.error}`}
          </p>
        )}
      </form>

      {/* ---------- Création de compte ---------- */}
      <form
        onSubmit={createCompte}
        className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm"
      >
        <h2 className="font-headline-sm text-headline-sm text-primary">Nouveau compte</h2>

        <div className="space-y-space-xs">
          <label className="block font-label-md text-label-md text-on-surface">Nom complet</label>
          <input
            className={FIELD}
            value={cNom}
            onChange={(e) => setCNom(e.target.value)}
            placeholder="Ex. Marie Kpodoù"
          />
          <Err msgs={createResult?.fieldErrors?.nom} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">E-mail</label>
            <input
              className={FIELD}
              type="email"
              value={cEmail}
              onChange={(e) => setCEmail(e.target.value)}
              placeholder="prenom.nom@paroisse.bj"
            />
            <Err msgs={createResult?.fieldErrors?.email} />
          </div>
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Mot de passe (8 car. min)</label>
            <input
              className={FIELD}
              type="password"
              value={cPwd}
              onChange={(e) => setCPwd(e.target.value)}
              placeholder="••••••••"
            />
            <Err msgs={createResult?.fieldErrors?.password} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface">Rôle</label>
            <select className={FIELD} value={cRole} onChange={(e) => setCRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {cRole === "RESPONSABLE" && (
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface">Fraternité</label>
              <select className={FIELD} value={cFrat} onChange={(e) => setCFrat(e.target.value)}>
                <option value="">— Choisir —</option>
                {fraternites.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nom}
                  </option>
                ))}
              </select>
              <Err msgs={createResult?.fieldErrors?.fraterniteId} />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full h-[52px] min-h-[52px] bg-primary text-on-primary rounded-lg font-label-lg text-label-lg uppercase tracking-wide flex items-center justify-center active:bg-primary-container transition-all shadow-md disabled:opacity-60"
        >
          {creating ? "Création..." : "Créer le compte"}
        </button>

        {createResult && (
          <p
            className={`font-body-sm text-body-sm ${
              createResult.ok ? "text-secondary" : "text-error"
            }`}
          >
            {createResult.ok ? `✅ ${createResult.message}` : `❌ ${createResult.error}`}
          </p>
        )}
      </form>

      {/* ---------- Liste des comptes ---------- */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <h2 className="font-headline-sm text-headline-sm text-primary">
          Comptes ({comptes.length})
        </h2>

        <ul className="space-y-space-sm">
          {comptes.map((c) => (
            <li key={c.id} className="border border-outline-variant rounded-xl p-space-sm space-y-space-xs">
              <div className="flex items-start justify-between gap-space-sm">
                <div className="min-w-0">
                  <p className="font-body-md text-body-md text-on-surface truncate">
                    {c.nom}
                    {c.id === currentUserId && (
                      <span className="ml-2 px-1.5 py-0.5 bg-primary-container text-primary rounded font-label-sm text-label-sm">
                        Vous
                      </span>
                    )}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{c.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(c)}
                  disabled={busyId === c.id || c.id === currentUserId}
                  className="shrink-0 h-[36px] px-space-sm rounded-lg border border-error text-error font-label-sm text-label-sm disabled:opacity-40"
                >
                  Supprimer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
                <select
                  className="h-[40px] rounded-lg border border-outline-variant px-space-xs font-body-sm"
                  value={c.role}
                  disabled={busyId === c.id || c.id === currentUserId}
                  onChange={(e) => changeRole(c, e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                {(c.role === "RESPONSABLE" || c.fraterniteId) && (
                  <select
                    className="h-[40px] rounded-lg border border-outline-variant px-space-xs font-body-sm"
                    value={c.fraterniteId ?? ""}
                    disabled={busyId === c.id}
                    onChange={(e) => changeFrat(c, e.target.value)}
                  >
                    <option value="">— Aucune fraternité —</option>
                    {fraternites.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nom}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {pwdFor === c.id ? (
                <form onSubmit={resetPwd} className="flex gap-space-xs">
                  <input
                    className="flex-1 h-[40px] rounded-lg border border-outline-variant px-space-xs font-body-sm"
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    placeholder="Nouveau mot de passe (8 car. min)"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={busyId === c.id}
                    className="h-[40px] px-space-sm bg-primary-container text-on-primary rounded-lg font-label-sm"
                  >
                    OK
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPwdFor(null);
                      setNewPwd("");
                    }}
                    className="h-[40px] px-space-sm border border-outline-variant rounded-lg font-label-sm"
                  >
                    Annuler
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPwdFor(c.id);
                    setNewPwd("");
                  }}
                  className="h-[36px] px-space-sm border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface-variant"
                >
                  Réinitialiser le mot de passe
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
