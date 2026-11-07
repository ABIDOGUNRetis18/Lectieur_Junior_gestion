import { requireRole } from "@/lib/auth-helpers";
import { getUtilisateurs, getFraternites } from "@/lib/dal";
import AppShell from "@/components/AppShell";
import AdministrationView from "@/components/AdministrationView";

export const instant = false;

export default async function AdministrationPage() {
  const session = await requireRole("ADMIN");
  const [utilisateurs, fraternites] = await Promise.all([
    getUtilisateurs(),
    getFraternites(),
  ]);

  return (
    <AppShell title="Administration" role={session.user.role} userName={session.user.name}>
      <AdministrationView
        allComptes={utilisateurs.map((u) => ({
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
