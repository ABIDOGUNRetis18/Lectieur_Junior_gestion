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
  await requireRole("ADMIN", "RESPONSABLE");
  const groupe = await getGroupeCourant();
  const params = await searchParams;
  const annee = params.annee ? Number(params.annee) : new Date().getFullYear();
  const mois = params.mois ? Number(params.mois) : null;
  const fraterniteId = params.fraternite || null;

  const data = await getConsultationData(groupe!.id, { annee, mois, fraterniteId });

  return (
    <AppShell title="Consultation">
      <ConsultationView data={data} />
    </AppShell>
  );
}
