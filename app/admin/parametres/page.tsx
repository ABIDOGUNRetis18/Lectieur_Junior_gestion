export const instant = false;

import { requireRole } from "@/lib/auth-helpers";
import { getGroupeCourant, getFraternites, getUtilisateurs } from "@/lib/dal";
import AppShell from "@/components/AppShell";
import ParametresView from "@/components/ParametresView";

export default async function ParametresPage() {
  const session = await requireRole("ADMIN");
  const groupe = await getGroupeCourant();
  const fraternites = await getFraternites();
  const utilisateurs = await getUtilisateurs();

  if (!groupe) return null;

  return (
    <AppShell title="Paramètres">
      <ParametresView
        groupe={{
          nom: groupe.nom,
          montantCotisation: groupe.montantCotisation,
          premierDimanche: groupe.premierDimanche.toISOString().slice(0, 10),
          moisDebutAnnee: groupe.moisDebutAnnee,
          moisSansReunion: groupe.moisSansReunion,
        }}
        comptes={utilisateurs.map((u) => ({
          id: u.id,
          nom: u.nom,
          email: u.email,
          role: u.role,
          fraterniteId: u.fraterniteId,
          fraterniteNom: u.fraternite?.nom ?? null,
        }))}
        fraternites={fraternites.map((f) => ({ id: f.id, nom: f.nom }))}
        currentUserId={session.user.id}
      />
    </AppShell>
  );
}
