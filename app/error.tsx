"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Frontière d'erreur globale de l'application.
 * Ne jamais afficher `error.message` : celui-ci peut contenir des détails
 * techniques (chemins, requêtes SQL, identifiants internes).
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Journalisation côté client uniquement du digest (pas de message brut).
    if (error.digest) {
      console.error(`[app-error] digest=${error.digest}`);
    }
  }, [error.digest]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface p-margin">
      <div className="w-full max-w-[480px] rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-sm space-y-space-sm">
        <span className="material-symbols-outlined text-[40px] text-error">error</span>
        <h1 className="font-headline-sm text-headline-sm text-primary">
          Une erreur est survenue
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          L&apos;opération n&apos;a pas pu aboutir. Réessayez dans un instant. Si le
          problème persiste, contactez le secrétariat paroissial.
        </p>
        <div className="flex flex-col sm:flex-row gap-space-sm justify-center pt-space-xs">
          <button
            type="button"
            onClick={reset}
            className="h-[44px] px-space-md rounded-lg bg-primary text-on-primary font-label-md"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="h-[44px] px-space-md rounded-lg border border-outline-variant text-on-surface font-label-md inline-flex items-center justify-center"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
