"use server";

import { requireAuth, getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

/**
 * Trace la déconnexion dans l'historique.
 * Appelé par AppShell juste avant signOut() côté client.
 */
export async function tracerDeconnexionAction(): Promise<void> {
  const session = await getSession();
  if (!session?.user?.id || !session.user.groupeId) return;

  await prisma.historique
    .create({
      data: {
        action: "DECONNEXION",
        details: `Déconnexion (${session.user.email ?? session.user.id})`,
        utilisateurId: session.user.id,
        groupeId: session.user.groupeId,
      },
    })
    .catch(() => undefined);
}

/**
 * Trace un export de la consultation (Excel / PDF).
 * Appelé par ConsultationView avant de générer le fichier.
 */
export async function tracerExportAction(format: "EXCEL" | "PDF", annee: number): Promise<void> {
  const session = await requireAuth();

  await prisma.historique
    .create({
      data: {
        action: `EXPORT_${format}`,
        details: `Export ${format} de la consultation ${annee}`,
        utilisateurId: session.user.id,
        groupeId: session.user.groupeId,
      },
    })
    .catch(() => undefined);
}
