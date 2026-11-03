export const instant = false;

import { requireRole } from "@/lib/auth-helpers";
import { getFraternites } from "@/lib/dal";
import AppShell from "@/components/AppShell";
import InscriptionView from "@/components/InscriptionView";

export default async function InscriptionPage() {
  const session = await requireRole("ADMIN", "RESPONSABLE");
  const fraternites = await getFraternites();

  const visible =
    session.user.role === "RESPONSABLE" && session.user.fraterniteId
      ? fraternites.filter((f) => f.id === session.user.fraterniteId)
      : fraternites;

  return (
    <AppShell title="Inscription">
      <InscriptionView fraternites={visible} />
    </AppShell>
  );
}
