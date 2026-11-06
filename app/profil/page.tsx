export const instant = false;

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import ProfilForm from "@/components/ProfilForm";

export default async function ProfilPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { fraternite: true, groupe: true },
  });
  if (!user) redirect("/connexion");

  return (
    <AppShell title="Profil">
      <div className="px-margin py-space-md">
        <ProfilForm
          user={{
            id: user.id,
            nom: user.nom,
            email: user.email,
            role: user.role,
            fraterniteNom: user.fraternite?.nom ?? null,
            groupeNom: user.groupe.nom,
            createdAt: user.createdAt.toISOString(),
          }}
        />
      </div>
    </AppShell>
  );
}
