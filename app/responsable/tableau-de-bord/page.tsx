import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { getFraternites, getEnfants, getStatsFraternite } from "@/lib/dal";

import AppShell from "@/components/AppShell";
import ChildrenTable from "@/components/ChildrenTable";

export const instant = false;

export default async function ResponsableTableauDeBordPage() {
  const session = await requireRole("RESPONSABLE");
  const fraterniteId = session.user.fraterniteId;

  const fraternites = await getFraternites();
  const enfants = fraterniteId ? await getEnfants(fraterniteId) : [];
  const stats = fraterniteId ? await getStatsFraternite(fraterniteId) : null;
  const fraterniteNom = fraternites.find((f) => f.id === fraterniteId)?.nom ?? "Ma fraternité";
  // Un responsable ne voit que SA fraternité : inutile de proposer les autres en filtre
  const fraternitesVisibles = fraternites.filter((f) => f.id === fraterniteId);

  return (
    <AppShell title="Tableau de bord">
      <div className="px-margin py-space-md space-y-space-md">
        {stats && (
          <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
            <h2 className="font-headline-sm text-headline-sm text-primary">{fraterniteNom}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700">fact_check</span>
                  <span className="font-body-sm text-blue-700 font-medium">Enfants présents</span>
                </div>
                <p className="font-headline-md text-headline-md text-blue-700 mt-1">{stats.presencesPresentes}</p>
                <p className="text-xs text-blue-600 opacity-80">{stats.enfantsCount} enfant{stats.enfantsCount !== 1 ? "s" : ""} actif{stats.enfantsCount !== 1 ? "s" : ""}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-700">payments</span>
                  <span className="font-body-sm text-green-700 font-medium">Total cotisations</span>
                </div>
                <p className="font-headline-md text-headline-md text-green-700 mt-1">{stats.totalCotisations.toLocaleString("fr-FR")} F</p>
                <p className="text-xs text-green-600 opacity-80">Cotisations collectées</p>
              </div>
            </div>
          </section>
        )}

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">
            Enfants ({enfants.length})
          </h2>
          {enfants.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant">Aucun enfant dans votre fraternité.</p>
          ) : (
            <ChildrenTable 
              enfants={enfants.map(e => ({
                id: e.id,
                nom: e.nom,
                prenoms: e.prenoms,
                dateNaissance: e.dateNaissance,
                classeEcole: e.classeEcole,
                serie: e.serie,
                classeCatechisme: e.classeCatechisme,
                telephoneParent: e.telephoneParent,
                statut: e.statut,
                fraternite: e.fraternite,
                createdAt: e.createdAt,
              }))} 
              fraternites={fraternitesVisibles.map(f => ({ id: f.id, nom: f.nom }))}
            />
          )}
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary">Importer le registre existant</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Reprise des enfants depuis un fichier CSV ou Excel (avec détection des doublons).
          </p>
          <Link
            href="/import"
            className="inline-flex h-[44px] items-center px-space-md rounded-lg bg-primary-container text-on-primary font-label-md"
          >
            Ouvrir l&apos;import
          </Link>
        </section>
      </div>
    </AppShell>
  );
}