"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  demanderInscriptionAction,
  verifierInscriptionOtpAction,
  renvoyerOtpAction,
} from "@/lib/actions/rejoindre";
import { toastSuccess, toastError } from "@/lib/toast";

const FIELD =
  "w-full h-[48px] rounded-lg bg-surface-container-lowest text-on-surface font-body-md border border-outline-variant px-space-sm";

function Err({ msgs }: { msgs?: string[] }) {
  if (!msgs?.length) return null;
  return <p className="font-body-sm text-body-sm text-error">{msgs[0]}</p>;
}

type Frat = { id: string; nom: string };

export default function RejoindreForm({ fraternites }: { fraternites: Frat[] }) {
  const router = useRouter();
  const [etape, setEtape] = useState<"formulaire" | "otp">("formulaire");

  // Formulaire
  const [nom, setNom] = useState("");
  const [prenoms, setPrenoms] = useState("");
  const [email, setEmail] = useState("");
  const [fraterniteId, setFraterniteId] = useState(fraternites[0]?.id ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formResult, setFormResult] = useState<{
    ok: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
    devCode?: string;
  } | null>(null);

  // OTP
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [otpResult, setOtpResult] = useState<{
    ok: boolean;
    error?: string;
    devCode?: string;
  } | null>(null);
  const [devCode, setDevCode] = useState<string | undefined>(undefined);

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormResult(null);
    try {
      const res = await demanderInscriptionAction({
        nom,
        prenoms,
        email,
        fraterniteId,
        password,
        confirmPassword,
      });
      setFormResult(res);
      if (res.ok) {
        if (res.devCode) setDevCode(res.devCode);
        setEtape("otp");
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

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setVerifying(true);
    setOtpResult(null);
    try {
      const res = await verifierInscriptionOtpAction(code);
      setOtpResult(res);
      if (res.ok) {
        toastSuccess("Compte créé", res.message);
        router.push("/connexion");
      } else {
        toastError(res.error ?? "Code incorrect.");
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
    const res = await renvoyerOtpAction();
    if (res.ok) {
      if (res.devCode) setDevCode(res.devCode);
      toastSuccess("Code renvoyé", res.message);
    } else {
      toastError(res.error ?? "Erreur.");
    }
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-md">
      {etape === "formulaire" ? (
        <form onSubmit={submitForm} className="space-y-space-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="nom">
                Nom de famille (MAJUSCULES)
              </label>
              <input
                id="nom"
                className={FIELD}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
                minLength={2}
              />
              <Err msgs={formResult?.fieldErrors?.nom} />
            </div>
            <div className="space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="prenoms">
                Prénoms
              </label>
              <input
                id="prenoms"
                className={FIELD}
                value={prenoms}
                onChange={(e) => setPrenoms(e.target.value)}
                required
                minLength={2}
              />
              <Err msgs={formResult?.fieldErrors?.prenoms} />
            </div>
          </div>

          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              className={FIELD}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Err msgs={formResult?.fieldErrors?.email} />
          </div>

          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="frat">
              Fraternité assignée
            </label>
            <select
              id="frat"
              className={FIELD}
              value={fraterniteId}
              onChange={(e) => setFraterniteId(e.target.value)}
              required
            >
              {fraternites.map((f) => (
                <option key={f.id} value={f.id}>{f.nom}</option>
              ))}
            </select>
            <Err msgs={formResult?.fieldErrors?.fraterniteId} />
          </div>

          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              className={FIELD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              autoComplete="new-password"
            />
            <Err msgs={formResult?.fieldErrors?.password} />
          </div>

          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="confirm">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              type="password"
              className={FIELD}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Err msgs={formResult?.fieldErrors?.confirmPassword} />
          </div>

          {formResult && !formResult.ok && (
            <p className="font-body-sm text-body-sm text-error">{formResult.error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-[48px] rounded-lg bg-primary text-on-primary font-label-md disabled:opacity-60"
          >
            {saving ? "Envoi du code..." : "Créer mon compte"}
          </button>

          <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
            Vous avez déjà un compte ?{" "}
            <Link href="/connexion" className="text-primary underline">
              Se connecter
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={submitOtp} className="space-y-space-sm">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Un code à 6 chiffres a été envoyé à <strong>{email}</strong>. Saisissez-le ci-dessous pour confirmer votre inscription.
          </p>

          {devCode && (
            <div className="rounded-lg bg-tertiary-container text-on-tertiary-container p-space-sm font-body-sm">
              <strong>Mode dev :</strong> code = {devCode}
            </div>
          )}

          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="otp-code">
              Code de vérification
            </label>
            <input
              id="otp-code"
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

          {otpResult && !otpResult.ok && (
            <p className="font-body-sm text-body-sm text-error">{otpResult.error}</p>
          )}

          <button
            type="submit"
            disabled={verifying}
            className="w-full h-[48px] rounded-lg bg-primary text-on-primary font-label-md disabled:opacity-60"
          >
            {verifying ? "Vérification..." : "Valider"}
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
              onClick={() => setEtape("formulaire")}
              className="font-body-sm text-body-sm text-on-surface-variant underline"
            >
              Modifier mes informations
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
