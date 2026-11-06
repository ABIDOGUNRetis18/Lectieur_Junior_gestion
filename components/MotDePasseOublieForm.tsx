"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  demanderResetMotDePasseAction,
  confirmerResetMotDePasseAction,
  renvoyerOtpResetAction,
} from "@/lib/actions/mot-de-passe";
import { toastSuccess, toastError } from "@/lib/toast";

const FIELD =
  "w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm";

function Err({ msgs }: { msgs?: string[] }) {
  if (!msgs?.length) return null;
  return <p className="font-body-sm text-body-sm text-error">{msgs[0]}</p>;
}

export default function MotDePasseOublieForm() {
  const router = useRouter();
  const [etape, setEtape] = useState<"email" | "code">("email");

  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [formResult, setFormResult] = useState<{
    ok: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
    devCode?: string;
  } | null>(null);

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [otpResult, setOtpResult] = useState<{
    ok: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
  } | null>(null);
  const [devCode, setDevCode] = useState<string | undefined>(undefined);

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormResult(null);
    try {
      const res = await demanderResetMotDePasseAction(email);
      setFormResult(res);
      if (res.ok) {
        if (res.devCode) setDevCode(res.devCode);
        setEtape("code");
        toastSuccess("Code envoyé", res.message);
      } else {
        toastError(res.error ?? "Erreur.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue.";
      setFormResult({ ok: false, error: msg });
      toastError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function submitCode(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setOtpResult(null);
    try {
      const res = await confirmerResetMotDePasseAction({ code, newPassword, confirmPassword });
      setOtpResult(res);
      if (res.ok) {
        toastSuccess("Mot de passe réinitialisé", res.message);
        router.push("/connexion");
      } else {
        toastError(res.error ?? "Erreur.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue.";
      setOtpResult({ ok: false, error: msg });
      toastError(msg);
    } finally {
      setVerifying(false);
    }
  }

  async function renvoyer() {
    const res = await renvoyerOtpResetAction();
    if (res.ok) {
      if (res.devCode) setDevCode(res.devCode);
      toastSuccess("Code renvoyé", res.message);
    } else {
      toastError(res.error ?? "Erreur.");
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
      {etape === "email" ? (
        <form onSubmit={submitEmail} className="space-y-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Saisissez l&apos;adresse e-mail de votre compte. Un code de réinitialisation vous sera envoyé par e-mail.
          </p>
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="reset-email">
              Adresse e-mail
            </label>
            <input
              id="reset-email"
              type="email"
              className={FIELD}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Err msgs={formResult?.fieldErrors?.email} />
          </div>

          {formResult && !formResult.ok && (
            <p role="alert" className="font-body-sm text-body-sm text-error">{formResult.error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-[48px] rounded-lg bg-primary text-on-primary font-label-md disabled:opacity-60"
          >
            {saving ? "Envoi du code..." : "Envoyer le code"}
          </button>

          <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
            Vous vous souvenez de votre mot de passe ?{" "}
            <Link href="/connexion" className="text-primary underline">
              Se connecter
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={submitCode} className="space-y-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>. Saisissez-le avec votre nouveau mot de passe.
          </p>

          {devCode && (
            <div className="rounded-lg bg-tertiary-container text-on-tertiary-container p-space-sm font-body-sm">
              <strong>Mode dev :</strong> code = {devCode}
            </div>
          )}

          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="reset-code">
              Code de vérification
            </label>
            <input
              id="reset-code"
              className={FIELD}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]{6}"
              autoComplete="one-time-code"
            />
          </div>

          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="reset-new">
              Nouveau mot de passe
            </label>
            <input
              id="reset-new"
              type="password"
              className={FIELD}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <Err msgs={otpResult?.fieldErrors?.newPassword} />
          </div>

          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="reset-confirm">
              Confirmer le nouveau mot de passe
            </label>
            <input
              id="reset-confirm"
              type="password"
              className={FIELD}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Err msgs={otpResult?.fieldErrors?.confirmPassword} />
          </div>

          {otpResult && !otpResult.ok && (
            <p role="alert" className="font-body-sm text-body-sm text-error">{otpResult.error}</p>
          )}

          <button
            type="submit"
            disabled={verifying}
            className="w-full h-[48px] rounded-lg bg-primary text-on-primary font-label-md disabled:opacity-60"
          >
            {verifying ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
          </button>

          <div className="flex items-center justify-between gap-space-sm">
            <button
              type="button"
              onClick={renvoyer}
              className="font-body-sm text-body-sm text-primary underline"
            >
              Renvoyer le code
            </button>
            <button
              type="button"
              onClick={() => setEtape("email")}
              className="font-body-sm text-body-sm text-on-surface-variant underline"
            >
              Modifier l&apos;e-mail
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
