import { requireRole } from "@/lib/auth-helpers";
import { getAdminsAndResponsables, getUtilisateurs } from "@/lib/dal";
import AppShell from "@/components/AppShell";

export const instant = false;

export default async function AdministrationPage() {
  await requireRole("ADMIN");
  const { admins, responsablesEnfants } = await getAdminsAndResponsables();
  const utilisateurs = await getUtilisateurs();

  return (
    <AppShell title="Administration">
      <div className="px-margin py-space-md space-y-space-md">
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">Administrateurs ({admins.length})</h2>
          {admins.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant">Aucun administrateur dans le groupe.</p>
          ) : (
            <ul className="space-y-2">
              {admins.map((admin) => (
                <li key={admin.id} className="flex items-center justify-between gap-space-sm p-3 bg-surface rounded-lg">
                  <div className="min-w-0">
                    <p className="font-body-md text-on-surface font-medium break-words">{admin.nom}</p>
                    <p className="font-body-sm text-on-surface-variant break-words">{admin.email}</p>
                    {admin.fraternite && (
                      <p className="font-label-sm text-primary break-words">{admin.fraternite.nom}</p>
                    )}
                  </div>
                  <span className="shrink-0 px-2 py-1 bg-primary-container text-primary rounded-full text-xs font-label-md">
                    ADMIN
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">Responsables de fraternité ({responsablesEnfants.length})</h2>
          {responsablesEnfants.length === 0 ? (
            <p className="font-body-sm text-on-surface-variant">Aucun responsable de fraternité parmi les enfants.</p>
          ) : (
            <ul className="space-y-2">
              {responsablesEnfants.map((enfant) => (
                <li key={enfant.id} className="flex items-center justify-between gap-space-sm p-3 bg-surface rounded-lg">
                  <div className="min-w-0">
                    <p className="font-body-md text-on-surface font-medium break-words">{enfant.nom} {enfant.prenoms}</p>
                    <p className="font-body-sm text-on-surface-variant break-words">{enfant.fraternite.nom}</p>
                  </div>
                  <span className="shrink-0 px-2 py-1 bg-secondary-container text-secondary rounded-full text-xs font-label-md">
                    RESPONSABLE
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---------- Tous les comptes de la plateforme ---------- */}
        <section className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm space-y-space-xs">
          <h2 className="font-headline-sm text-headline-sm text-primary">
            Tous les comptes ({utilisateurs.length})
          </h2>
          {utilisateurs.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">Aucun compte créé.</p>
          ) : (
            <div className="bg-surface rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left border-collapse">
                  <thead>
                    <tr className="text-on-surface-variant font-label-sm text-label-sm border-b border-outline-variant/50">
                      <th className="pb-space-xs text-left whitespace-nowrap">Nom</th>
                      <th className="pb-space-xs text-left whitespace-nowrap">E-mail</th>
                      <th className="pb-space-xs text-left whitespace-nowrap">Rôle</th>
                      <th className="pb-space-xs text-left whitespace-nowrap">Fraternité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {utilisateurs.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-container-highest/50 transition-colors">
                        <td className="py-space-xs font-body-sm text-body-sm text-on-surface whitespace-nowrap">
                          {u.nom}
                        </td>
                        <td className="py-space-xs font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                          {u.email}
                        </td>
                        <td className="py-space-xs font-label-md text-label-md text-primary whitespace-nowrap">
                          {u.role}
                        </td>
                        <td className="py-space-xs font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap">
                          {u.fraternite?.nom ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
