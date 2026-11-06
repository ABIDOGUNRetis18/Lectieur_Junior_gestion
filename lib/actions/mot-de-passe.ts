"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  generateOtpCode,
  setOtpCookie,
  getOtpCookie,
  clearOtpCookie,
  sendOtpEmail,
  verifyEmailDomain,
  type OtpPayload,
} from "@/lib/otp";

export type MotDePasseResult =
  | { ok: true; message?: string; devCode?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function flatten(err: unknown): Record<string, string[]> {
  return (err as { flatten: () => { fieldErrors: Record<string, string[]> } })
    .flatten().fieldErrors as Record<string, string[]>;
}

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail requis")
    .max(200)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail invalide"),
});

/** Étape 1 : demande de réinitialisation → envoi du code OTP. */
export async function demanderResetMotDePasseAction(emailRaw: string): Promise<MotDePasseResult> {
  const parsed = emailSchema.safeParse({ email: emailRaw?.trim() ?? "" });
  if (!parsed.success) {
    return { ok: false, error: "E-mail invalide.", fieldErrors: flatten(parsed.error) };
  }
  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return {
      ok: false,
      error: "Aucun compte trouvé avec cet e-mail.",
      fieldErrors: { email: ["Aucun compte trouvé avec cet e-mail."] },
    };
  }

  const domainOk = await verifyEmailDomain(email);
  if (!domainOk) {
    return {
      ok: false,
      error: "Le domaine de cette adresse e-mail ne peut pas recevoir de messages.",
      fieldErrors: { email: ["Adresse e-mail invalide ou domaine inexistant."] },
    };
  }

  const code = generateOtpCode();
  const payload: OtpPayload = {
    purpose: "reset_password",
    email,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
    data: { userId: user.id },
  };

  await setOtpCookie(payload);
  const { devCode } = await sendOtpEmail(email, code);

  return {
    ok: true,
    message: "Un code de réinitialisation a été envoyé à votre adresse e-mail.",
    devCode,
  };
}

/** Étape 2 : vérification du code OTP + nouveau mot de passe. */
export async function confirmerResetMotDePasseAction(input: {
  code: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<MotDePasseResult> {
  const schema = z
    .object({
      newPassword: z
        .string()
        .min(8, "8 caractères minimum")
        .max(128, "128 caractères maximum"),
      confirmPassword: z.string().min(1, "Confirmation requise"),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: "Les mots de passe ne correspondent pas.",
      path: ["confirmPassword"],
    });

  const payload = await getOtpCookie();
  if (!payload || payload.purpose !== "reset_password") {
    return { ok: false, error: "Aucune demande de réinitialisation en cours ou code expiré." };
  }
  if (payload.code !== input.code.trim()) {
    return { ok: false, error: "Code incorrect." };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides.", fieldErrors: flatten(parsed.error) };
  }

  const userId = (payload.data as { userId?: string }).userId;
  if (!userId) {
    await clearOtpCookie();
    return { ok: false, error: "Demande invalide." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    await clearOtpCookie();
    return { ok: false, error: "Compte introuvable." };
  }

  // Si le nouveau mot de passe est identique à l'ancien, refus
  const same = await bcrypt.compare(parsed.data.newPassword, user.passwordHash);
  if (same) {
    return {
      ok: false,
      error: "Le nouveau mot de passe doit être différent de l'actuel.",
      fieldErrors: { newPassword: ["Choisissez un mot de passe différent."] },
    };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) },
  });

  await prisma.historique.create({
    data: {
      action: "MOT_DE_PASSE_REINITIALISE",
      details: `Mot de passe réinitialisé via « mot de passe oublié » (${user.email})`,
      utilisateurId: userId,
      groupeId: user.groupeId,
    },
  });

  await clearOtpCookie();

  return { ok: true, message: "Mot de passe réinitialisé. Vous pouvez vous connecter." };
}

/** Renvoie un nouveau code OTP. */
export async function renvoyerOtpResetAction(): Promise<MotDePasseResult> {
  const payload = await getOtpCookie();
  if (!payload || payload.purpose !== "reset_password") {
    return { ok: false, error: "Aucune demande en cours." };
  }
  const code = generateOtpCode();
  payload.code = code;
  payload.expiresAt = Date.now() + 10 * 60 * 1000;
  await setOtpCookie(payload);
  const { devCode } = await sendOtpEmail(payload.email, code);
  return { ok: true, message: "Un nouveau code a été envoyé.", devCode };
}
