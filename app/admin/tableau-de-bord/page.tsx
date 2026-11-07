import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { getFraternitesAvecCount, getEnfants } from "@/lib/dal";

import AppShell from "@/components/AppShell";
import ChildrenTable from "@/components/ChildrenTable";

export const instant = false;

// Palette de couleurs pour les fraternités
const FRATERNITY_COLORS = [
  { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100 text-green-700" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
  { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-100 text-orange-700" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", badge: "bg-pink-100 text-pink-700" },
  { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", badge: "bg-teal-100 text-teal-700" },
  { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
  { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-100 text-red-700" },
];

function getFraternityColor(index: number) {
  return FRATERNITY_COLORS[index % FRATERNITY_COLORS.length];
}

export default async function AdminTableauDeBordPage() {
  const session = await requireRole("ADMIN");
  // Requêtes indépendantes → exécutées en parallèle au lieu de trois
  // allers-retours séquentiels. `getFraternitesAvecCount` contient déjà
  // id + nom : plus besoin de getFraternites().
  const [fraternitesAvecCount, enfants] = await Promise.all([
    getFraternitesAvecCount(),
    getEnfants(),
  ]);
  const fraternites = fraternitesAvecCount.map((f) => ({ id: f.id, nom: f.nom }));

  return (
    <AppShell title="Tableau de bord" role={session.user.role} userName={session.user.name}>
      <div className="px-margin py-space-md space-y-space-md">
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">Fraternités du groupe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 justify-items-center">
            {fraternitesAvecCount.map((f, index) => {
              const color = getFraternityColor(index);
              return (
                <div
                  key={f.id}
                  className={`${color.bg} rounded-xl p-3 border ${color.border} hover:shadow-md transition-all w-full max-w-[200px]`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-body-md text-body-md ${color.text} font-semibold break-words leading-tight`}>{f.nom}</h3>
                    <div className={`${color.badge} px-2 py-0.5 rounded-full text-xs shrink-0`}>
                      <span className="font-label-md">{f.enfantsCount}</span>
                    </div>
                  </div>
                  <p className={`text-xs ${color.text} mt-1 opacity-80`}>
                    {f.enfantsCount} enfant{f.enfantsCount !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">
            Enfants ({enfants.length})
          </h2>
          {enfants.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant">Aucun enfant dans le groupe.</p>
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
              fraternites={fraternites.map(f => ({ id: f.id, nom: f.nom }))}
            />
          )}
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-primary">Administration</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Paramètres du groupe (cotisation, premier dimanche, mois sans réunion) et comptes
            utilisateurs.
          </p>
          <Link
            href="/admin/parametres"
            className="inline-flex h-[44px] items-center px-space-md rounded-lg bg-primary text-on-primary font-label-md"
          >
            Ouvrir les paramètres
          </Link>
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