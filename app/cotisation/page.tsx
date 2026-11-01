export const instant = false;

import { requireRole } from "@/lib/auth-helpers";
import { getGroupeCourant, getFraternites, getEnfantsActifs } from "@/lib/dal";
import { getDimanchesValides } from "@/lib/dimanches";
import AppShell from "@/components/AppShell";
import CotisationForm from "@/components/CotisationForm";

export default async function CotisationPage() {
  const session = await requireRole("ADMIN", "TRESORIERE");
  const groupe = await getGroupeCourant();
  const fraternites = await getFraternites();
  const dimanches = getDimanchesValides(groupe!, 12).map((d) => d.toISOString().slice(0, 10));

  const enfantsByFrat: Record<string, { id: string; nom: string; prenoms: string }[]> = {};
  for (const f of fraternites) {
    const enfants = await getEnfantsActifs(f.id);
    enfantsByFrat[f.id] = enfants.map((e) => ({
      id: e.id,
      nom: e.nom,
      prenoms: e.prenoms,
    }));
  }

  // TRESORIERE sees all fraternities; ADMIN too
  return (
    <AppShell title="Cotisation">
      <CotisationForm
        fraternites={fraternites}
        dimanches={dimanches}
        enfantsByFrat={enfantsByFrat}
        montant={groupe!.montantCotisation}
      />
    </AppShell>
  );
}
