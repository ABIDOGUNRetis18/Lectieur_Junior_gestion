"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateProfilAction,
  demanderChangementEmailAction,
  confirmerChangementEmailAction,
  renvoyerOtpEmailAction,
  changerMotDePasseAction,
} from "@/lib/actions/profil";
import { toastSuccess, toastError } from "@/lib/toast";

type User = {
  id: string;
  nom: string;
  email: string;
  role: string;
  fraterniteNom: string | null;
  groupeNom: string;
  createdAt: string;
};

const FIELD =
  "w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm";

function Err({ msgs }: { msgs?: string[] }) {
  if (!msgs?.length) return null;
  return <p className="font-body-sm text-body-sm text-error">{msgs[0]}</p>;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Administrateur",
  RESPONSABLE: "Responsable",
};

export default function ProfilForm({ user }: { user: User }) {
  const router = useRouter();

  // ---- Informations (nom) ----
  const [editing, setEditing] = useState(false);
  const [nom, setNom] = useState(user.nom);
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoResult, setInfoResult] = useState<{
    ok: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  } | null>(null);

  // ---- Changement d'e-mail (OTP) ----
  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailStep, setEmailStep] = useState<"saisie" | "code">("saisie");
  const [emailCode, setEmailCode] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailResult, setEmailResult] = useState<{
    ok: boolean;
    message?: string;
    error?: string;
    devCode?: string;
  } | null>(null);
  const [emailDevCode, setEmailDevCode] = useState<string | undefined>(undefined);

  // ---- Mot de passe ----
  const [changingPwd, setChangingPwd] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdResult, setPwdResult] = useState<{
    ok: boolean;
    message?: string;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  } | null>(null);

  function notify(res: { ok: boolean; message?: string; error?: string } | null) {
    if (!res) return;
    if (res.ok) toastSuccess(res.message ?? "Enregistré.");
    else toastError(res.error ?? "Erreur.");
  }

  async function saveInfos(e: React.FormEvent) {
    e.preventDefault();
    setSavingInfo(true);
    setInfoResult(null);
    const res = await updateProfilAction({ nom });
    setSavingInfo(false);
    setInfoResult(res);
    notify(res);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function envoyerCodeEmail(e: React.FormEvent) {
    e.preventDefault();
    setSavingEmail(true);
    setEmailResult(null);
    const res = await demanderChangementEmailAction(newEmail);
    setSavingEmail(false);
    setEmailResult(res);
    notify(res);
    if (res.ok) {
      if (res.devCode) setEmailDevCode(res.devCode);
      setEmailStep("code");
    }
  }

  async function confirmerEmail(e: React.FormEvent) {
    e.preventDefault();
    setSavingEmail(true);
    setEmailResult(null);
    const res = await confirmerChangementEmailAction(emailCode);
    setSavingEmail(false);
    setEmailResult(res);
    notify(res);
    if (res.ok) {
      setChangingEmail(false);
      setEmailStep("saisie");
      setNewEmail("");
      setEmailCode("");
      setEmailDevCode(undefined);
      router.refresh();
    }
  }

  async function renvoyerCodeEmail() {
    const res = await renvoyerOtpEmailAction();
    if (res.ok) {
      if (res.devCode) setEmailDevCode(res.devCode);
      toastSuccess("Code renvoyé", res.message);
    } else {
      toastError(res.error ?? "Erreur.");
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPwd(true);
    setPwdResult(null);
    const res = await changerMotDePasseAction({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    setSavingPwd(false);
    setPwdResult(res);
    notify(res);
    if (res.ok) {
      setChangingPwd(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="space-y-space-md max-w-2xl">
      {/* Carte d'identité */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary">account_circle</span>
          <h2 className="font-headline-sm text-headline-sm text-primary">Mon profil</h2>
        </div>

        <dl className="space-y-space-xs">
          <div className="flex justify-between gap-space-sm py-1 border-b border-outline-variant/40">
            <dt className="font-label-md text-label-md text-on-surface-variant">Nom complet</dt>
            <dd className="font-body-md text-body-md text-on-surface text-right">{user.nom}</dd>
          </div>
          <div className="flex justify-between gap-space-sm py-1 border-b border-outline-variant/40">
            <dt className="font-label-md text-label-md text-on-surface-variant">E-mail</dt>
            <dd className="font-body-md text-body-md text-on-surface text-right">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-space-sm py-1 border-b border-outline-variant/40">
            <dt className="font-label-md text-label-md text-on-surface-variant">Rôle</dt>
            <dd className="font-body-md text-body-md text-on-surface text-right">
              {ROLE_LABEL[user.role] ?? user.role}
            </dd>
          </div>
          {user.fraterniteNom && (
            <div className="flex justify-between gap-space-sm py-1 border-b border-outline-variant/40">
              <dt className="font-label-md text-label-md text-on-surface-variant">Fraternité</dt>
              <dd className="font-body-md text-body-md text-on-surface text-right">{user.fraterniteNom}</dd>
            </div>
          )}
          <div className="flex justify-between gap-space-sm py-1 border-b border-outline-variant/40">
            <dt className="font-label-md text-label-md text-on-surface-variant">Groupe</dt>
            <dd className="font-body-md text-body-md text-on-surface text-right">{user.groupeNom}</dd>
          </div>
          <div className="flex justify-between gap-space-sm py-1">
            <dt className="font-label-md text-label-md text-on-surface-variant">Membre depuis</dt>
            <dd className="font-body-md text-body-md text-on-surface text-right">
              {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </dd>
          </div>
        </dl>
      </section>

      {/* Modification du nom */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <div className="flex items-center justify-between gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary">Informations</h2>
          {!editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setNom(user.nom);
                setInfoResult(null);
              }}
              className="h-[40px] px-space-md rounded-lg bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-colors"
            >
              Modifier
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={saveInfos} className="space-y-space-sm">
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="profil-nom">
                Nom complet
              </label>
              <input
                id="profil-nom"
                className={FIELD}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                minLength={2}
                maxLength={120}
              />
              <Err msgs={infoResult?.fieldErrors?.nom} />
            </div>
            {infoResult && !infoResult.ok && (
              <p className="font-body-sm text-body-sm text-error">{infoResult.error}</p>
            )}
            <div className="flex gap-space-sm">
              <button
                type="submit"
                disabled={savingInfo}
                className="h-[44px] px-space-md rounded-lg bg-primary text-on-primary font-label-md disabled:opacity-60"
              >
                {savingInfo ? "Enregistrement..." : "Enregistrer"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setInfoResult(null);
                }}
                className="h-[44px] px-space-md rounded-lg border border-outline-variant text-on-surface font-label-md"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Cliquez sur « Modifier » pour changer votre nom complet.
          </p>
        )}
      </section>

      {/* Changement d'e-mail (OTP) */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <div className="flex items-center justify-between gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary">Adresse e-mail</h2>
          {!changingEmail && (
            <button
              type="button"
              onClick={() => {
                setChangingEmail(true);
                setNewEmail(user.email);
                setEmailStep("saisie");
                setEmailResult(null);
                setEmailDevCode(undefined);
              }}
              className="h-[40px] px-space-md rounded-lg bg-secondary text-on-secondary font-label-md hover:bg-secondary/90 transition-colors"
            >
              Changer
            </button>
          )}
        </div>

        {changingEmail ? (
          emailStep === "saisie" ? (
            <form onSubmit={envoyerCodeEmail} className="space-y-space-sm">
              <div className="space-y-space-xs">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="new-email">
                  Nouvelle adresse e-mail
                </label>
                <input
                  id="new-email"
                  type="email"
                  className={FIELD}
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Un code de vérification sera envoyé à la nouvelle adresse pour confirmer le changement.
              </p>
              {emailResult && !emailResult.ok && (
                <p className="font-body-sm text-body-sm text-error">{emailResult.error}</p>
              )}
              <div className="flex gap-space-sm">
                <button
                  type="submit"
                  disabled={savingEmail}
                  className="h-[44px] px-space-md rounded-lg bg-primary text-on-primary font-label-md disabled:opacity-60"
                >
                  {savingEmail ? "Envoi..." : "Envoyer le code"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChangingEmail(false);
                    setEmailResult(null);
                  }}
                  className="h-[44px] px-space-md rounded-lg border border-outline-variant text-on-surface font-label-md"
                >
                  Annuler
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={confirmerEmail} className="space-y-space-sm">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Un code à 6 chiffres a été envoyé à <strong>{newEmail}</strong>.
              </p>
              {emailDevCode && (
                <div className="rounded-lg bg-tertiary-container text-on-tertiary-container p-space-sm font-body-sm">
                  <strong>Mode dev :</strong> code = {emailDevCode}
                </div>
              )}
              <div className="space-y-space-xs">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="email-code">
                  Code de vérification
                </label>
                <input
                  id="email-code"
                  className={FIELD}
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  autoComplete="one-time-code"
                />
              </div>
              {emailResult && !emailResult.ok && (
                <p className="font-body-sm text-body-sm text-error">{emailResult.error}</p>
              )}
              <div className="flex gap-space-sm">
                <button
                  type="submit"
                  disabled={savingEmail}
                  className="h-[44px] px-space-md rounded-lg bg-primary text-on-primary font-label-md disabled:opacity-60"
                >
                  {savingEmail ? "Vérification..." : "Valider"}
                </button>
                <button
                  type="button"
                  onClick={renvoyerCodeEmail}
                  className="h-[44px] px-space-md rounded-lg border border-outline-variant text-on-surface font-label-md"
                >
                  Renvoyer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailStep("saisie");
                    setEmailResult(null);
                  }}
                  className="h-[44px] px-space-md rounded-lg border border-outline-variant text-on-surface font-label-md"
                >
                  Retour
                </button>
              </div>
            </form>
          )
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Changez votre adresse e-mail avec vérification par code OTP.
          </p>
        )}
      </section>

      {/* Mot de passe */}
      <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
        <div className="flex items-center justify-between gap-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary">Mot de passe</h2>
          {!changingPwd && (
            <button
              type="button"
              onClick={() => {
                setChangingPwd(true);
                setPwdResult(null);
              }}
              className="h-[40px] px-space-md rounded-lg bg-secondary text-on-secondary font-label-md hover:bg-secondary/90 transition-colors"
            >
              Changer
            </button>
          )}
        </div>

        {changingPwd ? (
          <form onSubmit={savePassword} className="space-y-space-sm">
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="pwd-current">
                Mot de passe actuel
              </label>
              <input
                id="pwd-current"
                type="password"
                className={FIELD}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Err msgs={pwdResult?.fieldErrors?.currentPassword} />
            </div>
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="pwd-new">
                Nouveau mot de passe
              </label>
              <input
                id="pwd-new"
                type="password"
                className={FIELD}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={12}
                autoComplete="new-password"
              />
              <Err msgs={pwdResult?.fieldErrors?.newPassword} />
            </div>
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="pwd-confirm">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="pwd-confirm"
                type="password"
                className={FIELD}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Err msgs={pwdResult?.fieldErrors?.confirmPassword} />
            </div>
            {pwdResult && !pwdResult.ok && (
              <p className="font-body-sm text-body-sm text-error">{pwdResult.error}</p>
            )}
            <div className="flex gap-space-sm">
              <button
                type="submit"
                disabled={savingPwd}
                className="h-[44px] px-space-md rounded-lg bg-primary text-on-primary font-label-md disabled:opacity-60"
              >
                {savingPwd ? "Modification..." : "Modifier le mot de passe"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setChangingPwd(false);
                  setPwdResult(null);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="h-[44px] px-space-md rounded-lg border border-outline-variant text-on-surface font-label-md"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Modifiez votre mot de passe personnel. Le mot de passe actuel est requis.
          </p>
        )}
      </section>
    </div>
  );
}
