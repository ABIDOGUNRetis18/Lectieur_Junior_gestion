"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Suspense } from "react";

const PROFILS = [
  { icon: "menu_book", color: "text-primary", name: "Responsable" },
  { icon: "account_balance_wallet", color: "text-secondary", name: "Trésorerie" },
  { icon: "check_circle", color: "text-surface-tint", name: "Secrétariat" },
  { icon: "admin_panel_settings", color: "text-primary-container", name: "Admin" },
];

function ConnexionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/presence";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAlertVisible(false);
    const res = await signIn("credentials", {
      email: identifier,
      password,
      redirect: false,
    });
    setLoading(false);
    // Auth.js renvoie HTTP 200 même en cas d'échec : l'erreur est dans res.error
    if (res?.ok && !res.error) {
      router.push(callbackUrl);
      router.refresh();
    } else {
      setAlertVisible(true);
    }
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen">
      <div className="p-margin max-w-[480px] mx-auto w-full flex flex-col space-y-space-lg">
        {/* Brand & Parish Header */}
        <header className="flex flex-col items-center text-center pt-space-md pb-space-xs space-y-space-sm">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center shadow-sm border border-surface-container-highest/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Logo Paroisse Saint-Michel Gbeto"
              className="w-full h-full object-cover"
              src="/logo-saint-michel-carre.webp"
            />
          </div>
          <div className="space-y-1">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-bold">
              Lecteurs Juniors
            </h1>
            <div className="flex items-center justify-center space-x-1.5 text-on-surface-variant font-label-md text-label-md">
              <span className="material-symbols-outlined text-[15px] text-surface-tint">church</span>
              <span>Paroisse Saint-Michel Gbeto • Cotonou</span>
            </div>
          </div>
        </header>

        {/* Error State Alert Banner (Dismissible) */}
        {alertVisible && (
          <div className="bg-error-container text-on-error-container p-space-md rounded-xl flex items-start space-x-space-sm shadow-sm transition-all duration-200">
            <span className="material-symbols-outlined text-error text-[22px] flex-shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1">
              <p className="font-label-md text-label-md font-semibold text-error">
                Échec d&apos;authentification
              </p>
              <p className="font-body-sm text-body-sm mt-0.5 text-on-error-container leading-snug">
                Identifiants incorrects. Vérifiez avec le bureau paroissial ou réessayez.
              </p>
            </div>
            <button
              aria-label="Fermer l'alerte"
              className="min-w-[48px] min-h-[48px] -mr-2 -mt-2 flex items-center justify-center text-on-error-container active:scale-95"
              type="button"
              onClick={() => setAlertVisible(false)}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-space-md pt-space-xs" onSubmit={onSubmit}>
          <div className="space-y-space-xs">
            <label
              className="block font-label-md text-label-md font-semibold text-on-surface"
              htmlFor="user-identifier"
            >
              Identifiant ou N° de téléphone
            </label>
            <div className="relative rounded-xl border border-surface-container-highest/80 bg-surface-container-lowest shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">alternate_email</span>
              </div>
              <input
                autoComplete="username"
                className="w-full h-[52px] pl-11 pr-space-md rounded-xl bg-transparent text-on-surface font-body-md text-body-md placeholder:text-outline-variant outline-none"
                id="user-identifier"
                inputMode="email"
                name="identifier"
                placeholder="ex. contact@paroisse.bj ou 97 00 00 00"
                required
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-space-xs">
            <div className="flex justify-between items-baseline">
              <label
                className="block font-label-md text-label-md font-semibold text-on-surface"
                htmlFor="user-password"
              >
                Mot de passe
              </label>
              <a
                className="font-label-md text-label-md text-primary font-medium hover:underline py-0.5"
                href="#"
              >
                Code oublié ?
              </a>
            </div>
            <div className="relative rounded-xl border border-surface-container-highest/80 bg-surface-container-lowest shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all">
              <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">lock_outline</span>
              </div>
              <input
                autoComplete="current-password"
                className="w-full h-[52px] pl-11 pr-12 rounded-xl bg-transparent text-on-surface font-body-md text-body-md placeholder:text-outline-variant outline-none"
                id="user-password"
                name="password"
                placeholder="Code confidentiel"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                aria-label="Afficher ou masquer le mot de passe"
                className="absolute inset-y-0 right-0 min-w-[48px] min-h-[48px] px-space-sm flex items-center justify-center text-outline hover:text-on-surface active:scale-95 transition-all"
                type="button"
                onClick={() => setShowPassword((v) => !v)}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-space-xs">
            <button
              className="w-full h-[52px] min-h-[52px] bg-primary text-on-primary rounded-xl font-label-lg text-label-lg font-semibold tracking-wide flex items-center justify-center space-x-space-sm shadow-md hover:bg-primary/95 active:scale-[0.99] transition-all disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Connexion..." : "Se connecter"}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </form>

        {/* Role Missions Guidance */}
        <div className="pt-space-xs space-y-space-xs text-center">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
            Profils autorisés
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {PROFILS.map((p) => (
              <span
                key={p.name}
                className="inline-flex items-center space-x-1 px-space-sm py-1 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm border border-surface-container-high"
              >
                <span className={`material-symbols-outlined text-[13px] ${p.color}`}>{p.icon}</span>
                <span>{p.name}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Support & Pastoral Office Footer Note */}
        <footer className="text-center pt-space-md pb-space-lg space-y-1 text-on-surface-variant/80">
          <p className="font-body-sm text-body-sm text-outline">
            Besoin d&apos;aide ? Contactez le secrétariat paroissial.
          </p>
          <p className="font-label-sm text-label-sm tracking-wide text-outline">
            Archidiocèse de Cotonou • Bénin
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <ConnexionForm />
    </Suspense>
  );
}
