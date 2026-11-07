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
import { checkPasswordStrength } from "@/lib/password";
import {
  generateOtpCode,
  hashOtpCode,
  verifyOtpCode,
  setOtpCookie,
  getOtpCookie,
  clearOtpCookie,
  dispatchOtpEmail,
  verifyEmailDomain,
  type OtpPayload,
} from "@/lib/otp";
import { checkRateLimit, rateLimitMessage } from "@/lib/rate-limit";

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

  // Anti-spam : limite les demandes de code par utilisateur.
  const limit = checkRateLimit(`otp-email-change:${userId}`, 3, 15 * 60 * 1000);
  if (!limit.allowed) {
    return { ok: false, error: rateLimitMessage(limit.retryAfterSeconds) };
  }

  // Anti-énumération : on ne révèle pas ici si l'adresse appartient déjà à un
  // autre compte. Le code est envoyé à l'adresse visée ; l'information n'est
  // donnée qu'après vérification du code (preuve de possession de la boîte).
  const domainOk = await verifyEmailDomain(email);
  if (!domainOk) {
    return { ok: false, error: "Le domaine de cette adresse e-mail ne peut pas recevoir de messages." };
  }

  const code = generateOtpCode();

  const payload: OtpPayload = {
    purpose: "changement_email",
    email,
    code: hashOtpCode(code),
    expiresAt: Date.now() + 10 * 60 * 1000,
    data: { userId },
  };

  await setOtpCookie(payload);
  const { devCode } = await dispatchOtpEmail(email, code);

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
  if (!verifyOtpCode(code, payload.code)) {
    // Max 5 essais, comme les autres flux OTP.
    const attempts = (payload.attempts ?? 0) + 1;
    if (attempts >= 5) {
      await clearOtpCookie();
      return { ok: false, error: "Trop de tentatives. Demande expirée, veuillez recommencer." };
    }
    payload.attempts = attempts;
    await setOtpCookie(payload);
    return { ok: false, error: `Code incorrect. (${attempts}/5 tentatives)` };
  }

  const newEmail = payload.email;
  const d = payload.data as { userId: string };
  if (d.userId !== userId) {
    await clearOtpCookie();
    return { ok: false, error: "Demande invalide." };
  }

  // Révélé uniquement après validation du code : l'utilisateur a prouvé qu'il
  // contrôle l'adresse visée. Avant cela, aucune information n'est divulguée.
  const existe = await prisma.user.findFirst({ where: { email: newEmail, id: { not: userId } } });
  if (existe) {
    await clearOtpCookie();
    return {
      ok: false,
      error:
        "Cette adresse est déjà associée à un autre compte. Utilisez une autre adresse ou connectez-vous au compte concerné.",
    };
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

  // Force + réutilisation de l'actuel (comparaison bcrypt, pas string)
  const samePw = await bcrypt.compare(data.newPassword, user.passwordHash);
  if (samePw) {
    return {
      ok: false,
      error: "Le nouveau mot de passe doit être différent de l'actuel.",
      fieldErrors: { newPassword: ["Choisissez un mot de passe différent."] },
    };
  }

  const strengthChange = checkPasswordStrength(data.newPassword, { email: user.email, nom: user.nom });
  if (!strengthChange.ok) {
    return { ok: false, error: strengthChange.error!, fieldErrors: { newPassword: [strengthChange.error!] } };
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
  const session = await requireAuth();
  const payload = await getOtpCookie();
  if (!payload || payload.purpose !== "changement_email") {
    return { ok: false, error: "Aucune demande en cours." };
  }

  // Le cookie doit appartenir à l'utilisateur connecté.
  const d = payload.data as { userId?: string };
  if (d.userId !== session.user.id) {
    await clearOtpCookie();
    return { ok: false, error: "Aucune demande en cours." };
  }

  // Anti-spam : même limite que la demande initiale.
  const limit = checkRateLimit(
    `otp-email-change-resend:${session.user.id}`,
    3,
    15 * 60 * 1000
  );
  if (!limit.allowed) {
    return { ok: false, error: rateLimitMessage(limit.retryAfterSeconds) };
  }

  const code = generateOtpCode();
  payload.code = hashOtpCode(code);
  payload.attempts = 0;
  payload.expiresAt = Date.now() + 10 * 60 * 1000;
  await setOtpCookie(payload);
  const { devCode } = await dispatchOtpEmail(payload.email, code);
  return { ok: true, message: "Un nouveau code a été envoyé.", devCode };
}
