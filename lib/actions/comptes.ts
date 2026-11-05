"use server";

import { requireRole, assertFraterniteInGroup } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  compteCreateSchema,
  compteUpdateSchema,
  resetPasswordSchema,
  type CompteCreateInput,
  type CompteUpdateInput,
  type ResetPasswordInput,
} from "@/lib/schemas/parametres";

export type CompteResult =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function flatten(err: unknown): Record<string, string[]> {
  return (err as { flatten: () => { fieldErrors: Record<string, string[]> } })
    .flatten().fieldErrors as Record<string, string[]>;
}

async function countAdmins(groupeId: string, excludeUserId?: string) {
  return prisma.user.count({
    where: {
      groupeId,
      role: "ADMIN",
      ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
    },
  });
}

// ---------- Création ----------

export async function creerCompteAction(
  input: CompteCreateInput
): Promise<CompteResult> {
  const session = await requireRole("ADMIN");
  const groupeId = session.user.groupeId;

  const parsed = compteCreateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides.", fieldErrors: flatten(parsed.error) };
  }
  const data = parsed.data;

  // Responsable : fraternité obligatoire et dans le groupe
  if (data.fraterniteId) {
    try {
      await assertFraterniteInGroup(data.fraterniteId, groupeId);
    } catch {
      return { ok: false, error: "Fraternité introuvable pour ce groupe." };
    }
  }

  const email = data.email.trim().toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return {
      ok: false,
      error: "Un compte existe déjà avec cet e-mail.",
      fieldErrors: { email: ["E-mail déjà utilisé."] },
    };
  }

  await prisma.user.create({
    data: {
      nom: data.nom.trim(),
      email,
      passwordHash: await bcrypt.hash(data.password, 12),
      role: data.role,
      groupeId,
      fraterniteId: data.fraterniteId || null,
    },
  });

  await prisma.historique.create({
    data: {
      action: "COMPTE_CREE",
      details: `Compte créé : ${data.nom.trim()} (${email}) — rôle ${data.role}`,
      utilisateurId: session.user.id,
      groupeId,
    },
  });

  return { ok: true, message: `Compte créé pour ${data.nom.trim()}.` };
}

// ---------- Modification rôle / fraternité ----------

export async function updateCompteAction(
  input: CompteUpdateInput
): Promise<CompteResult> {
  const session = await requireRole("ADMIN");
  const groupeId = session.user.groupeId;

  const parsed = compteUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides.", fieldErrors: flatten(parsed.error) };
  }
  const data = parsed.data;

  const cible = await prisma.user.findFirst({ where: { id: data.userId, groupeId } });
  if (!cible) return { ok: false, error: "Compte introuvable." };

  if (data.role === "RESPONSABLE" && !data.fraterniteId) {
    return {
      ok: false,
      error: "Un responsable doit être rattaché à une fraternité.",
      fieldErrors: { fraterniteId: ["Fraternité requise pour un responsable."] },
    };
  }

  if (data.fraterniteId) {
    try {
      await assertFraterniteInGroup(data.fraterniteId, groupeId);
    } catch {
      return { ok: false, error: "Fraternité introuvable pour ce groupe." };
    }
  }

  // Ne jamais se retirer soi-même le rôle ADMIN
  if (cible.id === session.user.id && data.role !== "ADMIN") {
    return { ok: false, error: "Vous ne pouvez pas changer votre propre rôle." };
  }
  // Ne jamais retirer le dernier admin du groupe
  if (cible.role === "ADMIN" && data.role !== "ADMIN") {
    const restants = await countAdmins(groupeId, cible.id);
    if (restants === 0) {
      return { ok: false, error: "Impossible : c'est le dernier administrateur du groupe." };
    }
  }

  await prisma.user.update({
    where: { id: cible.id },
    data: {
      role: data.role,
      fraterniteId: data.role === "RESPONSABLE" ? data.fraterniteId || null : null,
    },
  });

  await prisma.historique.create({
    data: {
      action: "COMPTE_MODIFIE",
      details: `Compte modifié : ${cible.nom} (${cible.email}) — ${cible.role} → ${data.role}`,
      utilisateurId: session.user.id,
      groupeId,
    },
  });

  return { ok: true, message: `Compte de ${cible.nom} mis à jour.` };
}

// ---------- Réinitialisation du mot de passe ----------

export async function resetPasswordAction(
  input: ResetPasswordInput
): Promise<CompteResult> {
  const session = await requireRole("ADMIN");
  const groupeId = session.user.groupeId;

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides.", fieldErrors: flatten(parsed.error) };
  }

  const cible = await prisma.user.findFirst({
    where: { id: parsed.data.userId, groupeId },
  });
  if (!cible) return { ok: false, error: "Compte introuvable." };

  await prisma.user.update({
    where: { id: cible.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
  });

  await prisma.historique.create({
    data: {
      action: "MOT_DE_PASSE_REINITIALISE",
      details: `Mot de passe réinitialisé pour ${cible.nom} (${cible.email})`,
      utilisateurId: session.user.id,
      groupeId,
    },
  });

  return { ok: true, message: `Mot de passe de ${cible.nom} réinitialisé.` };
}

// ---------- Suppression ----------

export async function supprimerCompteAction(userId: string): Promise<CompteResult> {
  const session = await requireRole("ADMIN");
  const groupeId = session.user.groupeId;

  if (userId === session.user.id) {
    return { ok: false, error: "Vous ne pouvez pas supprimer votre propre compte." };
  }

  const cible = await prisma.user.findFirst({ where: { id: userId, groupeId } });
  if (!cible) return { ok: false, error: "Compte introuvable." };

  if (cible.role === "ADMIN") {
    const restants = await countAdmins(groupeId, cible.id);
    if (restants === 0) {
      return { ok: false, error: "Impossible : c'est le dernier administrateur du groupe." };
    }
  }

  await prisma.user.delete({ where: { id: cible.id } });

  await prisma.historique.create({
    data: {
      action: "COMPTE_SUPPRIME",
      details: `Compte supprimé : ${cible.nom} (${cible.email}) — ${cible.role}`,
      utilisateurId: session.user.id,
      groupeId,
    },
  });

  return { ok: true, message: `Compte de ${cible.nom} supprimé.` };
}
