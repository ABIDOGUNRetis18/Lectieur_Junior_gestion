import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { getGroupeCourant } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

export const instant = false;

export default async function HistoriquePage() {
  await requireRole("ADMIN");
  const groupe = await getGroupeCourant();
  if (!groupe) redirect("/tableau-de-bord");

  const historique = await prisma.historique.findMany({
    where: { groupeId: groupe.id },
    orderBy: { createdAt: "desc" },
    include: { utilisateur: true },
    take: 200,
  });

  return (
    <AppShell title="Historique">
      <div className="px-margin py-space-md space-y-space-md">
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">
            Historique des actions — {groupe.nom}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Seul l’administrateur peut consulter ce journal. Il recense toutes
            les modifications effectuées sur la plateforme.
          </p>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-on-surface-variant font-label-sm text-label-sm border-b border-outline-variant/50">
                <th className="pb-space-xs text-left w-24">Date</th>
                <th className="pb-space-xs text-left">Utilisateur</th>
                <th className="pb-space-xs text-left">Action</th>
                <th className="pb-space-xs text-left">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {historique.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-space-sm text-center text-on-surface-variant font-body-sm">
                    Aucune activité enregistrée.
                  </td>
                </tr>
              ) : (
                historique.map((h) => (
                  <tr key={h.id} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="py-space-xs font-body-sm text-on-surface">
                      {new Date(h.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-space-xs font-body-sm text-on-surface">
                      {h.utilisateur?.nom ?? h.utilisateur?.email ?? "—"}
                    </td>
                    <td className="py-space-xs font-label-md text-label-md text-primary">
                      {h.action}
                    </td>
                    <td className="py-space-xs font-body-sm text-on-surface-variant">
                      {h.details ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
