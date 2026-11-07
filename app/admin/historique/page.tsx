import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { getGroupeCourant } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";
import { actionLabel, actionBadgeClasses, HISTORIQUE_ACTIONS } from "@/lib/historique";

export const instant = false;

type SearchParams = { action?: string; q?: string };

export default async function HistoriquePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireRole("ADMIN");
  const groupe = await getGroupeCourant();
  if (!groupe) redirect("/admin/tableau-de-bord");

  const params = await searchParams;
  const filtreAction = params.action?.trim() || "";
  const recherche = params.q?.trim() || "";

  // Filtres côté serveur : type d'action + recherche texte (utilisateur ou détails)
  const [historique, actionsExistantes] = await Promise.all([
    prisma.historique.findMany({
      where: {
        groupeId: groupe.id,
        ...(filtreAction ? { action: filtreAction } : {}),
        ...(recherche
          ? {
              OR: [
                { details: { contains: recherche, mode: "insensitive" } },
                { utilisateur: { nom: { contains: recherche, mode: "insensitive" } } },
                { utilisateur: { email: { contains: recherche, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { utilisateur: true },
      take: 200,
    }),
    // Actions réellement présentes dans le groupe (pour le menu déroulant)
    prisma.historique.groupBy({
      by: ["action"],
      where: { groupeId: groupe.id },
      _count: { _all: true },
      orderBy: { action: "asc" },
    }),
  ]);

  const query = (action: string, q: string) => {
    const sp = new URLSearchParams();
    if (action) sp.set("action", action);
    if (q) sp.set("q", q);
    const s = sp.toString();
    return s ? `/admin/historique?${s}` : "/admin/historique";
  };

  return (
    <AppShell title="Historique" role={session.user.role} userName={session.user.name}>
      <div className="px-margin py-space-md space-y-space-md">
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">
            Historique des actions — {groupe.nom}
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Seul l&apos;administrateur peut consulter ce journal. Il recense toutes
            les modifications effectuées sur la plateforme (200 dernières entrées).
          </p>
        </section>

        {/* Filtres */}
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm">
          <form method="GET" action="/admin/historique" className="flex flex-col sm:flex-row gap-space-sm">
            <div className="flex-1 space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="filtre-action">
                Type d&apos;action
              </label>
              <select
                id="filtre-action"
                name="action"
                defaultValue={filtreAction}
                className="w-full h-[44px] rounded-lg border border-outline-variant px-space-sm font-body-md bg-surface-container-lowest"
              >
                <option value="">Toutes les actions</option>
                {actionsExistantes.map((a) => (
                  <option key={a.action} value={a.action}>
                    {actionLabel(a.action)} ({a._count._all})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-space-xs">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="filtre-q">
                Recherche
              </label>
              <input
                id="filtre-q"
                name="q"
                type="search"
                defaultValue={recherche}
                placeholder="Utilisateur, détail…"
                className="w-full h-[44px] rounded-lg border border-outline-variant px-space-sm font-body-md"
              />
            </div>
            <div className="flex items-end gap-space-sm">
              <button
                type="submit"
                className="h-[44px] px-space-md rounded-lg bg-primary text-on-primary font-label-md"
              >
                Filtrer
              </button>
              <a
                href={query("", "")}
                className="h-[44px] inline-flex items-center px-space-md rounded-lg border border-outline-variant text-on-surface font-label-md"
              >
                Réinitialiser
              </a>
            </div>
          </form>
          {(filtreAction || recherche) && (
            <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
              {historique.length} résultat{historique.length !== 1 ? "s" : ""}
              {filtreAction ? ` — action : ${actionLabel(filtreAction)}` : ""}
              {recherche ? ` — recherche : « ${recherche} »` : ""}
            </p>
          )}
        </section>

        {/* Tableau */}
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm overflow-x-auto">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead>
              <tr className="text-on-surface-variant font-label-sm text-label-sm border-b border-outline-variant/50">
                <th className="pb-space-xs text-left w-40 whitespace-nowrap">Date</th>
                <th className="pb-space-xs text-left whitespace-nowrap">Utilisateur</th>
                <th className="pb-space-xs text-left whitespace-nowrap">Action</th>
                <th className="pb-space-xs text-left whitespace-nowrap">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/40">
              {historique.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-space-sm text-center text-on-surface-variant font-body-sm">
                    Aucune activité{filtreAction || recherche ? " ne correspond aux filtres" : " enregistrée"}.
                  </td>
                </tr>
              ) : (
                historique.map((h) => (
                  <tr key={h.id} className="hover:bg-surface-container-high/50 transition-colors align-top">
                    <td className="py-space-xs font-body-sm text-on-surface whitespace-nowrap">
                      {new Date(h.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-space-xs font-body-sm text-on-surface">
                      {h.utilisateur ? (
                        <>
                          <span className="block">{h.utilisateur.nom}</span>
                          <span className="block text-on-surface-variant text-xs">{h.utilisateur.email}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-space-xs whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${actionBadgeClasses(h.action)}`}
                      >
                        {actionLabel(h.action)}
                      </span>
                    </td>
                    <td className="py-space-xs font-body-sm text-on-surface-variant">{h.details ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {historique.length === 200 && (
            <p className="font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
              Affichage des 200 entrées les plus récentes. Affinez avec les filtres pour voir le reste.
            </p>
          )}
        </section>

        {/* Légende des catégories */}
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h3 className="font-label-md text-label-md text-on-surface">Actions tracées</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(HISTORIQUE_ACTIONS)
              .filter((k) => actionsExistantes.some((a) => a.action === k))
              .map((k) => (
                <a
                  key={k}
                  href={query(k, recherche)}
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold hover:opacity-80 ${actionBadgeClasses(k)}`}
                >
                  {actionLabel(k)}
                </a>
              ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
