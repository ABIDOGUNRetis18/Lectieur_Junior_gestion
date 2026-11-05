"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

import { Suspense } from "react";
import Image from "next/image";
import { toastError } from "@/lib/toast";

function ConnexionForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/tableau-de-bord";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
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
      toastError(
        "Échec de l'authentification",
        "Identifiants incorrects. Vérifiez avec le bureau paroissial ou réessayez."
      );
    }
  }

  return (
    <main className="flex flex-col relative w-full bg-surface min-h-screen">
      <div className="p-margin max-w-[480px] mx-auto w-full flex flex-col space-y-space-lg">
        {/* Brand & Parish Header */}
        <header className="flex flex-col items-center text-center pt-space-md pb-space-xs space-y-space-sm">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center shadow-sm border border-surface-container-highest/60">
            <Image
              alt="Logo Paroisse Saint-Michel Gbeto"
              className="w-full h-full object-cover"
              src="/logo-saint-michel-carre.webp"
              width={80}
              height={80}
              priority
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

        {/* Login Form */}
        <form className="space-y-space-md pt-space-xs" onSubmit={onSubmit}>
          <div className="space-y-space-xs">
            <label
              className="block font-label-md text-label-md font-semibold text-on-surface"
              htmlFor="user-identifier"
            >
              Identifiant (adresse e-mail)
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
                placeholder="ex. contact@paroisse.bj"
                required
                type="email"
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

        {/* Bouton retour accueil */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full h-[52px] min-h-[52px] border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center justify-center space-x-1 gap-space-sm"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Retour à l&apos;accueil
        </button>

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
