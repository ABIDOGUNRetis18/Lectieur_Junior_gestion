import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { getEnfantWithDetails, getFraternites } from "@/lib/dal";
import AppShell from "@/components/AppShell";
import EnfantFiche from "@/components/EnfantFiche";

// Cette page lit la session et la base hors <Suspense> : rendu bloquant requis
// avec cacheComponents (voir app/tableau-de-bord/page.tsx).
export const instant = false;

export default async function EnfantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("ADMIN", "RESPONSABLE");
  const { id } = await params;

  const enfant = await getEnfantWithDetails(id);
  if (!enfant) notFound();

  // Un responsable ne peut consulter que les enfants de sa fraternité.
  if (
    session.user.role === "RESPONSABLE" &&
    session.user.fraterniteId !== enfant.fraterniteId
  ) {
    redirect("/tableau-de-bord");
  }

  const fraternites = await getFraternites();
  const visibles =
    session.user.role === "RESPONSABLE" && session.user.fraterniteId
      ? fraternites.filter((f) => f.id === session.user.fraterniteId)
      : fraternites;

  return (
    <AppShell title="Fiche enfant">
      <div className="px-margin pt-space-md">
        <Link
          href="/tableau-de-bord"
          className="inline-flex items-center gap-space-xs font-label-md text-label-md text-primary hover:underline"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Retour au tableau de bord
        </Link>
      </div>
      <EnfantFiche
        enfant={{
          id: enfant.id,
          nom: enfant.nom,
          prenoms: enfant.prenoms,
          dateNaissance: enfant.dateNaissance.toISOString().slice(0, 10),
          classeEcole: enfant.classeEcole,
          serie: enfant.serie,
          classeCatechisme: enfant.classeCatechisme,
          telephoneParent: enfant.telephoneParent,
          statut: enfant.statut,
          role: enfant.role,
          fraterniteId: enfant.fraterniteId,
          fraterniteNom: enfant.fraternite.nom,
          createdAt: enfant.createdAt.toISOString(),
          updatedAt: enfant.updatedAt.toISOString(),
          presences: enfant.presences.map((p) => ({
            date: p.date.toISOString().slice(0, 10),
            etat: p.etat,
          })),
          cotisations: enfant.cotisations.map((c) => ({
            date: c.date.toISOString().slice(0, 10),
            montant: c.montant,
          })),
        }}
        fraternites={visibles.map((f) => ({ id: f.id, nom: f.nom }))}
      />
    </AppShell>
  );
}
