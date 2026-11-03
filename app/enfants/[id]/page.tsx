export const instant = false;

import { requireRole } from "@/lib/auth-helpers";
import { getEnfantWithDetails, getFraternites } from "@/lib/dal";
import AppShell from "@/components/AppShell";
import EnfantFiche from "@/components/EnfantFiche";

export default async function EnfantFichePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("ADMIN", "RESPONSABLE");
  const { id } = await params;
  const enfant = await getEnfantWithDetails(id);
  const fraternites = await getFraternites();
  if (!enfant) {
    return (
      <AppShell title="Enfant introuvable">
        <div className="px-margin py-space-md">
          <p className="font-body-md text-on-surface-variant">Cet enfant n&apos;existe pas ou n&apos;appartient pas à votre groupe.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`${enfant.nom} ${enfant.prenoms}`}>
      <EnfantFiche
        enfant={{
          id: enfant.id,
          numero: enfant.numero,
          nom: enfant.nom,
          prenoms: enfant.prenoms,
          dateNaissance: enfant.dateNaissance.toISOString().slice(0, 10),
          classeEcole: enfant.classeEcole,
          serie: enfant.serie,
          classeCatechisme: enfant.classeCatechisme,
          telephoneParent: enfant.telephoneParent,
          statut: enfant.statut,
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
        fraternites={fraternites.map((f) => ({ id: f.id, nom: f.nom }))}
      />
    </AppShell>
  );
}
