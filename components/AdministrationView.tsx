"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateCompteAction,
  resetPasswordAction,
  supprimerCompteAction,
  revokeAllSessionsAction,
} from "@/lib/actions/comptes";
import { confirmDialog } from "@/lib/confirm";
import { toastSuccess, toastError } from "@/lib/toast";

type Compte = {
  id: string;
  nom: string;
  email: string;
  role: string;
  fraterniteId: string | null;
  fraterniteNom: string | null;
};

type Props = {
  allComptes: Compte[];
  fraternites: { id: string; nom: string }[];
  currentUserId: string;
};

export default function AdministrationView({
  allComptes,
  fraternites,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwdFor, setPwdFor] = useState<string | null>(null);
  const [newPwd, setNewPwd] = useState("");
  const [revoking, setRevoking] = useState(false);

  function notify(res: { ok: boolean; message?: string; error?: string } | null) {
    if (!res) return;
    setMsg({ ok: res.ok, text: res.ok ? res.message! : (res.error ?? "Erreur inconnue") });
    if (res.ok) toastSuccess(res.message ?? "Enregistré.");
    else toastError(res.error ?? "Erreur.");
  }

  async function changeRole(c: Compte, role: string) {
    setBusyId(c.id);
    setMsg(null);
    const res = await updateCompteAction({
      userId: c.id,
      role: role as never,
      fraterniteId: role === "RESPONSABLE" ? c.fraterniteId ?? fraternites[0]?.id ?? null : null,
    });
    notify(res);
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function changeFrat(c: Compte, fraterniteId: string) {
    setBusyId(c.id);
    setMsg(null);
    const res = await updateCompteAction({
      userId: c.id,
      role: c.role as never,
      fraterniteId: fraterniteId || null,
    });
    notify(res);
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function resetPwd(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdFor) return;
    setBusyId(pwdFor);
    setMsg(null);
    const res = await resetPasswordAction({ userId: pwdFor, password: newPwd });
    notify(res);
    if (res.ok) {
      setPwdFor(null);
      setNewPwd("");
      router.refresh();
    }
    setBusyId(null);
  }

  async function remove(c: Compte) {
    const confirmed = await confirmDialog({
      title: `Supprimer le compte de ${c.nom} ?`,
      message: "L'utilisateur ne pourra plus se connecter. Cette action est irréversible.",
      confirmLabel: "Supprimer",
      danger: true,
    });
    if (!confirmed) return;
    setBusyId(c.id);
    setMsg(null);
    const res = await supprimerCompteAction(c.id);
    notify(res);
    setBusyId(null);
    if (res.ok) router.refresh();
  }

  async function revokeAll() {
    const confirmed = await confirmDialog({
      title: "Déconnecter tous les comptes ?",
      message:
        "Tous les utilisateurs (y compris vous) seront déconnectés et devront se reconnecter. Cette action est irréversible.",
      confirmLabel: "Déconnecter tous",
      danger: true,
    });
    if (!confirmed) return;
    setRevoking(true);
    setMsg(null);
    const res = await revokeAllSessionsAction();
    notify(res);
    setRevoking(false);
    if (res.ok) {
      router.push("/connexion");
    }
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

      {/* ---------- Tableau unique de tous les comptes ---------- */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm overflow-hidden">
        <h2 className="font-headline-sm text-headline-sm text-primary">
          Tous les comptes ({allComptes.length})
        </h2>

        {allComptes.length === 0 ? (
          <p className="font-body-sm text-on-surface-variant">Aucun compte créé.</p>
        ) : (
          <div className="overflow-x-auto -mx-space-md px-space-md">
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="text-on-surface-variant font-label-sm text-label-sm border-b border-outline-variant/50">
                  <th className="pb-space-xs text-left whitespace-nowrap">Nom</th>
                  <th className="pb-space-xs text-left whitespace-nowrap">E-mail</th>
                  <th className="pb-space-xs text-left whitespace-nowrap">Rôle</th>
                  <th className="pb-space-xs text-left whitespace-nowrap">Fraternité</th>
                  <th className="pb-space-xs text-left whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {allComptes.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-highest/50 transition-colors align-top">
                    <td className="py-space-xs font-body-sm text-body-sm text-on-surface whitespace-nowrap">
                      {c.nom}
                      {c.id === currentUserId && (
                        <span className="ml-2 px-1.5 py-0.5 bg-primary-container text-primary rounded font-label-sm text-label-sm">
                          Vous
                        </span>
                      )}
                    </td>
                    <td className="py-space-xs font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                      {c.email}
                    </td>
                    <td className="py-space-xs font-body-sm text-body-sm text-on-surface whitespace-nowrap">
                      <select
                        className="h-[36px] rounded-lg border border-outline-variant px-space-xs font-body-sm"
                        value={c.role}
                        disabled={busyId === c.id || c.id === currentUserId}
                        onChange={(e) => changeRole(c, e.target.value)}
                      >
                        <option value="ADMIN">Administrateur</option>
                        <option value="RESPONSABLE">Responsable</option>
                      </select>
                    </td>
                    <td className="py-space-xs font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                      {c.role === "RESPONSABLE" ? (
                        <select
                          className="h-[36px] rounded-lg border border-outline-variant px-space-xs font-body-sm"
                          value={c.fraterniteId ?? ""}
                          disabled={busyId === c.id}
                          onChange={(e) => changeFrat(c, e.target.value)}
                        >
                          <option value="">— Aucune —</option>
                          {fraternites.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.nom}
                            </option>
                          ))}
                        </select>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-space-xs whitespace-nowrap">
                      <div className="flex flex-wrap gap-space-xs">
                        {pwdFor === c.id ? (
                          <form onSubmit={resetPwd} className="flex flex-wrap gap-space-xs">
                            <input
                              className="w-[140px] h-[36px] rounded-lg border border-outline-variant px-space-xs font-body-sm"
                              type="password"
                              value={newPwd}
                              onChange={(e) => setNewPwd(e.target.value)}
                              placeholder="Nouveau mdp (12 car.)"
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={busyId === c.id}
                              className="h-[36px] px-space-sm bg-primary-container text-on-primary rounded-lg font-label-sm"
                            >
                              OK
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPwdFor(null);
                                setNewPwd("");
                              }}
                              className="h-[36px] px-space-sm border border-outline-variant rounded-lg font-label-sm"
                            >
                              Annuler
                            </button>
                          </form>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setPwdFor(c.id);
                                setNewPwd("");
                              }}
                              disabled={busyId === c.id}
                              className="h-[36px] px-space-sm border border-outline-variant rounded-lg font-label-sm text-label-sm text-on-surface-variant disabled:opacity-40"
                            >
                              Reset mdp
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(c)}
                              disabled={busyId === c.id || c.id === currentUserId}
                              className="h-[36px] px-space-sm rounded-lg border border-error text-error font-label-sm text-label-sm disabled:opacity-40"
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ---------- Sessions ---------- */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
        <h2 className="font-headline-sm text-headline-sm text-primary">Sessions</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Révoque toutes les sessions actives. Tous les utilisateurs (y compris vous) devront se reconnecter.
        </p>
        <button
          type="button"
          onClick={revokeAll}
          disabled={revoking}
          className="h-[48px] px-space-md rounded-lg border border-error text-error font-label-md hover:bg-error-container transition-colors disabled:opacity-60"
        >
          {revoking ? "Révocation..." : "Déconnecter tous les comptes"}
        </button>
      </section>
    </div>
  );
}
