import { requireAuth } from "@/lib/auth-helpers";
import { getGroupeCourant, getFraternites, getEnfantsActifs } from "@/lib/dal";
export const instant = false;

import AppShell from "@/components/AppShell";

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
          <h2 className="font-headline-sm text-headline-sm text-primary">Enfants actifs</h2>
          <p className="font-body-md text-body-md text-on-surface">
            {enfants.length} enfant(s) actif(s) dans le groupe.
          </p>
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
              Reprise des enfants depuis un fichier CSV (avec détection des doublons).
            </p>
            <a
              href="/import"
              className="inline-flex h-[44px] items-center px-space-md rounded-lg bg-primary-container text-on-primary font-label-md"
            >
              Ouvrir l&apos;import CSV
            </a>
          </section>
        )}
      </div>
    </AppShell>
  );
}
