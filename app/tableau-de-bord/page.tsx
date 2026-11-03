import { requireAuth } from "@/lib/auth-helpers";
import { getGroupeCourant, getFraternites, getEnfantsActifs } from "@/lib/dal";

import AppShell from "@/components/AppShell";
import Link from "next/link";
export const revalidate = 0;
export const instant = false;

export default async function TableauDeBordPage() {
  const session = await requireAuth();
  const groupe = await getGroupeCourant();
  const fraternites = await getFraternites();
  const enfants = await getEnfantsActifs();

  return (
    <AppShell title="Tableau de bord">
      <div className="px-margin py-space-md space-y-space-md">
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">Utilisateur connecté</h2>
          <p className="font-body-md text-body-md text-on-surface">
            {session.user.name} — <span className="font-semibold">{session.user.role}</span>
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Groupe : {groupe?.nom ?? "—"} (id {session.user.groupeId})
          </p>
          {session.user.fraterniteId && (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Fraternité rattachée : {fraternites.find((f) => f.id === session.user.fraterniteId)?.nom ?? "—"}
            </p>
          )}
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">Fraternités du groupe</h2>
          <ul className="list-disc pl-5 space-y-1">
            {fraternites.map((f) => (
              <li key={f.id} className="font-body-md text-body-md text-on-surface">{f.nom}</li>
            ))}
          </ul>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">
            Enfants actifs ({enfants.length})
          </h2>
          {enfants.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant">Aucun enfant actif dans le groupe.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/50 max-h-96 overflow-y-auto">
              {enfants.map((e) => (
                <li key={e.id} className="py-space-xs flex items-center justify-between gap-space-sm font-body-sm">
                  <Link
                    href={`/enfants/${e.id}`}
                    className="font-body-md text-on-surface font-semibold hover:text-primary truncate block min-w-0 flex-1"
                  >
                    LJ-{String(e.numero).padStart(3, "0")} — {e.nom} {e.prenoms}
                  </Link>
                  <span
                    className={`font-label-sm text-label-sm ${e.fraterniteId ? "text-on-surface-variant" : "text-error"}`}
                  >
                    {e.fraternite?.nom ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {session.user.role === "ADMIN" && (
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-primary">Administration</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Paramètres du groupe (cotisation, premier dimanche, mois sans réunion) et comptes
              utilisateurs.
            </p>
            <a
              href="/parametres"
              className="inline-flex h-[44px] items-center px-space-md rounded-lg bg-primary text-on-primary font-label-md"
            >
              Ouvrir les paramètres
            </a>
          </section>
        )}

        {(session.user.role === "ADMIN" || session.user.role === "RESPONSABLE") && (
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
            <h2 className="font-headline-sm text-headline-sm text-primary">Importer le registre existant</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Reprise des enfants depuis un fichier CSV ou Excel (avec détection des doublons).
            </p>
            <a
              href="/import"
              className="inline-flex h-[44px] items-center px-space-md rounded-lg bg-primary-container text-on-primary font-label-md"
            >
              Ouvrir l&apos;import
            </a>
          </section>
        )}
      </div>
    </AppShell>
  );
}
