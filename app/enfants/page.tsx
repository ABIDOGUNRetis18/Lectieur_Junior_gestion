export const instant = false;

import { requireRole } from "@/lib/auth-helpers";
import { getEnfants, getFraternites } from "@/lib/dal";
import AppShell from "@/components/AppShell";
import EnfantsList from "@/components/EnfantsList";

type SP = { q?: string; fraternite?: string; statut?: string };

export default async function EnfantsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireRole("ADMIN", "RESPONSABLE");
  const params = await searchParams;
  const fraternites = await getFraternites();
  const statut = (params.statut === "ACTIF" || params.statut === "INACTIF") ? params.statut : "ALL";
  const enfants = await getEnfants({
    q: params.q,
    fraterniteId: params.fraternite || undefined,
    statut,
  });

  return (
    <AppShell title="Enfants">
      <EnfantsList
        enfants={enfants.map((e) => ({
          id: e.id,
          numero: e.numero,
          nom: e.nom,
          prenoms: e.prenoms,
          fraterniteId: e.fraterniteId,
          fraterniteNom: e.fraternite.nom,
          statut: e.statut,
          classeEcole: e.classeEcole,
          telephoneParent: e.telephoneParent,
        }))}
        fraternites={fraternites.map((f) => ({ id: f.id, nom: f.nom }))}
        filters={{ q: params.q ?? "", fraternite: params.fraternite ?? "", statut }}
      />
    </AppShell>
  );
}
