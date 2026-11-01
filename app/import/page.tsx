export const instant = false;

import { requireRole } from "@/lib/auth-helpers";
import { getFraternites } from "@/lib/dal";
import AppShell from "@/components/AppShell";
import ImportForm from "@/components/ImportForm";

export default async function ImportPage() {
  const session = await requireRole("ADMIN", "RESPONSABLE");
  const fraternites = await getFraternites();
  const visible =
    session.user.role === "RESPONSABLE" && session.user.fraterniteId
      ? fraternites.filter((f) => f.id === session.user.fraterniteId)
      : fraternites;

  return (
    <AppShell title="Import CSV">
      <ImportForm fraternites={visible} />
    </AppShell>
  );
}
