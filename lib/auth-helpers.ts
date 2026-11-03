import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type Role = "ADMIN" | "RESPONSABLE" | "TRESORIERE" | "SECRETAIRE";

export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    include: { groupe: true, fraternite: true },
  });
}

/** Lève une erreur si non authentifié. */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }
  return session;
}

/** Redirige vers le tableau de bord si le rôle n'est pas autorisé. */
export async function requireRole(...roles: Role[]) {
  const session = await requireAuth();
  if (!roles.includes(session.user.role as Role)) {
    redirect("/tableau-de-bord");
  }
  return session;
}

/** Retourne le groupeId de l'utilisateur connecté (ou lève une erreur). */
export async function requireGroup() {
  const session = await requireAuth();
  if (!session.user.groupeId) {
    throw new Error("Aucun groupe associé à cet utilisateur.");
  }
  return session.user.groupeId;
}

/** Vérifie que la fraternité demandée appartient au groupe de l'utilisateur. */
export async function assertFraterniteInGroup(fraterniteId: string, groupeId: string) {
  const f = await prisma.fraternite.findFirst({
    where: { id: fraterniteId, groupeId },
  });
  if (!f) throw new Error("Fraternité introuvable pour ce groupe.");
  return f;
}
