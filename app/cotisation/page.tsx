export const instant = false;

import { requireRole } from "@/lib/auth-helpers";
import { getGroupeCourant, getFraternites, getEnfantsActifs } from "@/lib/dal";
import { getDimanchesValides } from "@/lib/dimanches";
import AppShell from "@/components/AppShell";
import CotisationForm from "@/components/CotisationForm";

export default async function CotisationPage() {
  const session = await requireRole("ADMIN", "RESPONSABLE");

  // Une seule requête pour tous les enfants actifs (au lieu d'une par
  // fraternité), lancée en parallèle des autres lectures. Un responsable est
  // limité à sa fraternité dès la requête (minimisation des données).
  const enfantsPromise =
    session.user.role === "RESPONSABLE"
      ? session.user.fraterniteId
        ? getEnfantsActifs(session.user.fraterniteId)
        : Promise.resolve([])
      : getEnfantsActifs();

  const [groupe, fraternites, enfantsActifs] = await Promise.all([
    getGroupeCourant(),
    getFraternites(),
    enfantsPromise,
  ]);

  const dimanches = groupe
    ? getDimanchesValides(groupe, 12).map((d) => d.toISOString().slice(0, 10))
    : [];

  const visible =
    session.user.role === "RESPONSABLE" && session.user.fraterniteId
      ? fraternites.filter((f) => f.id === session.user.fraterniteId)
      : fraternites;

  const visibleIds = new Set(visible.map((f) => f.id));
  const enfantsByFrat: Record<string, { id: string; nom: string; prenoms: string }[]> = {};
  for (const f of visible) enfantsByFrat[f.id] = [];

  for (const enfant of enfantsActifs) {
    if (!enfant.fraterniteId || !visibleIds.has(enfant.fraterniteId)) continue;
    enfantsByFrat[enfant.fraterniteId].push({
      id: enfant.id,
      nom: enfant.nom,
      prenoms: enfant.prenoms,
    });
  }

  return (
    <AppShell title="Cotisation" role={session.user.role} userName={session.user.name}>
      <CotisationForm
        fraternites={visible}
        dimanches={dimanches}
        enfantsByFrat={enfantsByFrat}
        montant={groupe?.montantCotisation ?? 100}
      />
    </AppShell>
  );
}
