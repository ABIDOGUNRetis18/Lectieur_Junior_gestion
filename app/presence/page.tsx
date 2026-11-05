export const instant = false;

import { requireRole } from "@/lib/auth-helpers";
import { getGroupeCourant, getFraternites, getEnfantsActifs } from "@/lib/dal";
import { getDimanchesValides } from "@/lib/dimanches";
import AppShell from "@/components/AppShell";
import PresenceForm from "@/components/PresenceForm";

export default async function PresencePage() {
  const session = await requireRole("ADMIN", "RESPONSABLE");
  const groupe = await getGroupeCourant();
  const fraternites = await getFraternites();
  const dimanches = groupe ? getDimanchesValides(groupe, 12).map((d) => d.toISOString().slice(0, 10)) : [];

  const enfantsByFrat: Record<string, { id: string; nom: string; prenoms: string; classeEcole: string }[]> = {};
  for (const f of fraternites) {
    const enfants = await getEnfantsActifs(f.id);
    enfantsByFrat[f.id] = enfants.map((e) => ({
      id: e.id,
      nom: e.nom,
      prenoms: e.prenoms,
      classeEcole: e.classeEcole,
    }));
  }

  const visible =
    session.user.role === "RESPONSABLE" && session.user.fraterniteId
      ? fraternites.filter((f) => f.id === session.user.fraterniteId)
      : fraternites;

  return (
    <AppShell title="Présence">
      <PresenceForm fraternites={visible} dimanches={dimanches} enfantsByFrat={enfantsByFrat} />
    </AppShell>
  );
}
