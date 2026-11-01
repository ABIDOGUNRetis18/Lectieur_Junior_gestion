"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Suspense } from "react";

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
    if (res?.ok) {
      router.push(callbackUrl);
      router.refresh();
    } else {
      setAlertVisible(true);
    }
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen">
      {/* Network Status Strip */}
      <div className="bg-surface-container-high text-on-surface px-margin py-space-xs flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-space-xs">
          <span className="material-symbols-outlined text-secondary text-[18px]">
            signal_cellular_alt_2_bar
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
            Mode données réduites actif
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary" />
          <span className="font-label-sm text-label-sm text-secondary font-semibold">
            Hors-ligne prêt
          </span>
        </div>
      </div>

      <div className="p-margin max-w-[480px] mx-auto w-full flex flex-col space-y-space-lg">
        {/* Brand & Parish Header */}
        <header className="flex flex-col items-center text-center space-y-space-sm pt-space-xs">
          <div className="w-20 h-20 bg-surface-container-lowest shadow-sm rounded-xl p-space-xs flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Logo Lecteurs Juniors"
              className="w-full h-full object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WA-6Rn1mlMv8kN-Xj8JQUoOZXaFrZaM8EbxcC4bCW70Nnn_x0MTVwGIFgwMa56sxcbNKE_TbVs0N0-AinekZsINZRQSHJWasIrOq9_Va2lmnHAif0f0NAzryakQE0fW5uo3EVnx-p55UufH7Ugpz7ppXuCMuuzXOGTERXikgeNfkvzFOz1EKSuUE-3tUs2xy-OOWk32ynRFxlYPxQsybgmUrFi-ZDqNvOqO2V5JxOd"
            />
          </div>
          <div className="space-y-1">
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight">
              Lecteurs Juniors
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant flex items-center justify-center space-x-1">
              <span className="material-symbols-outlined text-[16px] text-surface-tint">
                church
              </span>
              <span>Paroisse Saint-Jean-Baptiste • Cotonou</span>
            </p>
          </div>
        </header>

        {/* Error State Alert Banner */}
        {alertVisible && (
          <div className="bg-error-container text-on-error-container p-space-md rounded-lg flex items-start space-x-space-sm shadow-sm transition-all duration-200">
            <span className="material-symbols-outlined text-error text-[22px] flex-shrink-0 mt-0.5">
              error
            </span>
            <div className="flex-1">
              <p className="font-label-md text-label-md font-semibold text-error">
                Échec d&apos;authentification
              </p>
              <p className="font-body-sm text-body-sm mt-0.5 text-on-error-container leading-snug">
                Identifiants incorrects. Veuillez vérifier avec le bureau paroissial ou réessayer.
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
        <form className="space-y-space-md" onSubmit={onSubmit}>
          <div className="space-y-space-xs">
            <label className="block font-label-md text-label-md text-on-surface" htmlFor="user-identifier">
              E-mail ou Téléphone
            </label>
            <div className="relative bg-surface-container-lowest rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <input
                autoComplete="username"
                className="w-full h-[52px] pl-11 pr-space-md rounded-lg bg-surface-container-lowest text-on-surface font-body-lg text-body-lg placeholder:text-outline-variant focus:bg-surface-container-low outline-none transition-colors"
                id="user-identifier"
                inputMode="email"
                name="identifier"
                placeholder="ex: jean.kpohinto@eglise.bj ou +229 97 00 00 00"
                required
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-space-xs">
            <div className="flex justify-between items-baseline">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="user-password">
                Mot de passe
              </label>
              <a className="font-label-md text-label-md text-primary font-semibold py-1 active:underline" href="#">
                Mot de passe oublié ?
              </a>
            </div>
            <div className="relative bg-surface-container-lowest rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-space-md flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                autoComplete="current-password"
                className="w-full h-[52px] pl-11 pr-12 rounded-lg bg-surface-container-lowest text-on-surface font-body-lg text-body-lg placeholder:text-outline-variant focus:bg-surface-container-low outline-none transition-colors"
                id="user-password"
                name="password"
                placeholder="Entrez votre code secret"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                aria-label="Afficher ou masquer le mot de passe"
                className="absolute inset-y-0 right-0 min-w-[48px] min-h-[48px] px-space-sm flex items-center justify-center text-outline active:text-on-surface"
                type="button"
                onClick={() => setShowPassword((v) => !v)}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div className="pt-space-xs">
            <button
              className="w-full h-[52px] min-h-[52px] bg-primary-container text-on-primary rounded-lg font-label-lg text-label-lg uppercase tracking-wide flex items-center justify-center space-x-space-sm active:bg-primary transition-all shadow-md active:shadow-sm disabled:opacity-60"
              type="submit"
              disabled={loading}
            >
              <span>{loading ? "Connexion..." : "Se connecter"}</span>
              <span className="material-symbols-outlined text-[20px]">login</span>
            </button>
          </div>
        </form>

        {/* Role Missions Guidance Card */}
        <section className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm">
          <div className="flex items-center space-x-space-xs text-on-surface">
            <span className="material-symbols-outlined text-surface-tint text-[20px]">
              shield_person
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Guide d&apos;accès aux missions
            </h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Vos droits sont configurés selon votre mission au sein de la paroisse :
          </p>
          <div className="grid grid-cols-2 gap-space-xs pt-1">
            {[
              { icon: "menu_book", color: "text-primary", name: "Responsable", sub: "Fraternité" },
              { icon: "account_balance_wallet", color: "text-secondary", name: "Trésorière", sub: "Cotisations" },
              { icon: "assignment_turned_in", color: "text-surface-tint", name: "Secrétaire", sub: "Présences" },
              { icon: "manage_accounts", color: "text-primary-container", name: "Administrateur", sub: "Paroisse" },
            ].map((r) => (
              <div
                key={r.name}
                className="bg-surface-container-lowest p-space-sm rounded-lg flex items-center space-x-space-xs shadow-sm"
              >
                <span className={`material-symbols-outlined text-[18px] ${r.color}`}>{r.icon}</span>
                <div className="min-w-0">
                  <span className="font-label-md text-label-md text-on-surface block truncate">{r.name}</span>
                  <span className="font-label-sm text-label-sm text-outline block truncate">{r.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center pt-space-xs pb-space-lg space-y-1">
          <p className="font-body-sm text-body-sm text-outline">
            Difficulté de connexion ? Contactez le bureau paroissial.
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
            Archidiocèse de Cotonou • République du Bénin
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
