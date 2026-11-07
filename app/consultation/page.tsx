export const instant = false;

import { requireRole } from "@/lib/auth-helpers";
import { getGroupeCourant } from "@/lib/dal";
import { getConsultationData } from "@/lib/consultation";
import AppShell from "@/components/AppShell";
import ConsultationView from "@/components/ConsultationView";

type SearchParams = { annee?: string; mois?: string; fraternite?: string };

export default async function ConsultationPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await requireRole("ADMIN", "RESPONSABLE");
  const groupe = await getGroupeCourant();
  const params = await searchParams;
  const annee = params.annee ? Number(params.annee) : new Date().getFullYear();
  const mois = params.mois ? Number(params.mois) : null;

  // Un responsable ne consulte QUE les données de sa fraternité :
  // son filtre est forcé côté serveur (ignoré s'il tente ?fraternite=autre).
  const estResponsable = session.user.role === "RESPONSABLE";
  const fraterniteId = estResponsable
    ? session.user.fraterniteId
    : params.fraternite || null;

  const data = await getConsultationData(groupe!, { annee, mois, fraterniteId });

  if (estResponsable) {
    // Pas de liste déroulante des autres fraternités pour un responsable
    data.fraternites = data.fraternites.filter((f) => f.id === session.user.fraterniteId);
  }

  return (
    <AppShell title="Consultation" role={session.user.role} userName={session.user.name}>
      <ConsultationView data={data} />
    </AppShell>
  );
}
