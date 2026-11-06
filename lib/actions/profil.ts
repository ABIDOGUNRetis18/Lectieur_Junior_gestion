"use server";

import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  profilUpdateSchema,
  changePasswordSchema,
  type ProfilUpdateInput,
  type ChangePasswordInput,
} from "@/lib/schemas/profil";
import {
  generateOtpCode,
  setOtpCookie,
  getOtpCookie,
  clearOtpCookie,
  sendOtpEmail,
  verifyEmailDomain,
  type OtpPayload,
} from "@/lib/otp";

export type ProfilResult =
  | { ok: true; message: string; devCode?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function flatten(err: unknown): Record<string, string[]> {
  return (err as { flatten: () => { fieldErrors: Record<string, string[]> } })
    .flatten().fieldErrors as Record<string, string[]>;
}

/** Mise à jour du nom complet de l'utilisateur connecté. */
export async function updateProfilAction(
  input: ProfilUpdateInput
): Promise<ProfilResult> {
  const session = await requireAuth();
  const userId = session.user.id;
  const groupeId = session.user.groupeId;

  const parsed = profilUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides.", fieldErrors: flatten(parsed.error) };
  }
  const nom = parsed.data.nom.trim();

  const avant = await prisma.user.findUnique({ where: { id: userId } });
  if (!avant) return { ok: false, error: "Compte introuvable." };

  if (avant.nom === nom) {
    return { ok: true, message: "Profil enregistré." };
  }

  await prisma.user.update({ where: { id: userId }, data: { nom } });

  await prisma.historique.create({
    data: {
      action: "PROFIL_MODIFIE",
      details: `Profil modifié — nom : « ${avant.nom} » → « ${nom} »`,
      utilisateurId: userId,
      groupeId,
    },
  });

  return { ok: true, message: "Profil mis à jour." };
}

const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .min(1, "E-mail requis")
    .max(200)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail invalide"),
});

/** Étape 1 : demande de changement d'e-mail → envoi d'un code OTP à la nouvelle adresse. */
export async function demanderChangementEmailAction(
  newEmail: string
): Promise<ProfilResult> {
  const session = await requireAuth();
  const userId = session.user.id;

  const parsed = changeEmailSchema.safeParse({ newEmail });
  if (!parsed.success) {
    return { ok: false, error: "E-mail invalide.", fieldErrors: flatten(parsed.error) };
  }
  const email = parsed.data.newEmail.trim().toLowerCase();

  if (email === session.user.email?.toLowerCase()) {
    return { ok: false, error: "C'est déjà votre adresse e-mail actuelle." };
  }

  const existe = await prisma.user.findFirst({ where: { email, id: { not: userId } } });
  if (existe) {
    return { ok: false, error: "Cet e-mail est déjà utilisé par un autre compte." };
  }

  const domainOk = await verifyEmailDomain(email);
  if (!domainOk) {
    return { ok: false, error: "Le domaine de cette adresse e-mail ne peut pas recevoir de messages." };
  }

  const code = generateOtpCode();

  const payload: OtpPayload = {
    purpose: "changement_email",
    email,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    data: { userId },
  };

  await setOtpCookie(payload);
  const { devCode } = await sendOtpEmail(email, code);

  return {
    ok: true,
    message: "Un code de vérification a été envoyé à la nouvelle adresse e-mail.",
    devCode,
  };
}

/** Étape 2 : vérification du code OTP → mise à jour de l'e-mail. */
export async function confirmerChangementEmailAction(code: string): Promise<ProfilResult> {
  const session = await requireAuth();
  const userId = session.user.id;
  const groupeId = session.user.groupeId;

  const payload = await getOtpCookie();
  if (!payload || payload.purpose !== "changement_email") {
    return { ok: false, error: "Aucune demande en cours ou code expiré." };
  }
  if (payload.code !== code.trim()) {
    return { ok: false, error: "Code incorrect." };
  }

  const newEmail = payload.email;
  const d = payload.data as { userId: string };
  if (d.userId !== userId) {
    await clearOtpCookie();
    return { ok: false, error: "Demande invalide." };
  }

  const existe = await prisma.user.findFirst({ where: { email: newEmail, id: { not: userId } } });
  if (existe) {
    await clearOtpCookie();
    return { ok: false, error: "Cet e-mail est déjà utilisé." };
  }

  const avant = await prisma.user.findUnique({ where: { id: userId } });
  if (!avant) {
    await clearOtpCookie();
    return { ok: false, error: "Compte introuvable." };
  }

  await prisma.user.update({ where: { id: userId }, data: { email: newEmail } });

  await prisma.historique.create({
    data: {
      action: "PROFIL_MODIFIE",
      details: `E-mail modifié : ${avant.email} → ${newEmail}`,
      utilisateurId: userId,
      groupeId,
    },
  });

  await clearOtpCookie();

  return { ok: true, message: "Adresse e-mail mise à jour. Reconnectez-vous avec la nouvelle adresse." };
}

/** Changement du mot de passe par l'utilisateur lui-même. */
export async function changerMotDePasseAction(
  input: ChangePasswordInput
): Promise<ProfilResult> {
  const session = await requireAuth();
  const userId = session.user.id;
  const groupeId = session.user.groupeId;

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides.", fieldErrors: flatten(parsed.error) };
  }
  const data = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { ok: false, error: "Compte introuvable." };

  const ok = await bcrypt.compare(data.currentPassword, user.passwordHash);
  if (!ok) {
    return {
      ok: false,
      error: "Mot de passe actuel incorrect.",
      fieldErrors: { currentPassword: ["Mot de passe actuel incorrect."] },
    };
  }

  if (data.currentPassword === data.newPassword) {
    return {
      ok: false,
      error: "Le nouveau mot de passe doit être différent de l'actuel.",
      fieldErrors: { newPassword: ["Choisissez un mot de passe différent."] },
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(data.newPassword, 12) },
  });

  await prisma.historique.create({
    data: {
      action: "MOT_DE_PASSE_CHANGE",
      details: `Mot de passe modifié par l'utilisateur (${user.email})`,
      utilisateurId: userId,
      groupeId,
    },
  });

  return { ok: true, message: "Mot de passe modifié." };
}

/** Renvoie un nouveau code OTP pour le changement d'e-mail en cours. */
export async function renvoyerOtpEmailAction(): Promise<ProfilResult> {
  const payload = await getOtpCookie();
  if (!payload || payload.purpose !== "changement_email") {
    return { ok: false, error: "Aucune demande en cours." };
  }
  const code = generateOtpCode();
  payload.code = code;
  payload.expiresAt = Date.now() + 10 * 60 * 1000;
  await setOtpCookie(payload);
  const { devCode } = await sendOtpEmail(payload.email, code);
  return { ok: true, message: "Un nouveau code a été envoyé.", devCode };
}
