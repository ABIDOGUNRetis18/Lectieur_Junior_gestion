"use server";

import "server-only";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  generateOtpCode,
  hashOtpCode,
  verifyOtpCode,
  setOtpCookie,
  getOtpCookie,
  clearOtpCookie,
  sendOtpEmail,
  verifyEmailDomain,
  type OtpPayload,
} from "@/lib/otp";
import { checkRateLimit, rateLimitMessage } from "@/lib/rate-limit";
import { checkPasswordStrength } from "@/lib/password";

const inscriptionSchema = z.object({
  nom: z.string().min(2, "Nom requis (2 caractères minimum)").max(120),
  prenoms: z.string().min(2, "Prénoms requis (2 caractères minimum)").max(120),
  email: z
    .string()
    .min(1, "E-mail requis")
    .max(200)
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail invalide"),
  fraterniteId: z.string().min(1, "Choisissez une fraternité"),
  password: z
    .string()
    .min(12, "12 caractères minimum")
    .max(128, "128 caractères maximum"),
  confirmPassword: z.string().min(1, "Confirmation requise"),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export type RejoindreResult =
  | { ok: true; message?: string; devCode?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

function flatten(err: unknown): Record<string, string[]> {
  return (err as { flatten: () => { fieldErrors: Record<string, string[]> } })
    .flatten().fieldErrors as Record<string, string[]>;
}

/** Étape 1 : demande d'inscription → envoi du code OTP. */
export async function demanderInscriptionAction(
  input: unknown
): Promise<RejoindreResult> {
  const parsed = inscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Données invalides.", fieldErrors: flatten(parsed.error) };
  }
  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  // Rate limiting OTP inscription : 3 demandes / 15 min par e-mail (item 1.2)
  const otpLimit = checkRateLimit(`otp-inscription:${email}`, 3, 15 * 60 * 1000);
  if (!otpLimit.allowed) {
    return { ok: false, error: rateLimitMessage(otpLimit.retryAfterSeconds) };
  }

  // Politique mot de passe (2.2)
  const strengthJoin = checkPasswordStrength(data.password, { email, nom: `${data.nom} ${data.prenoms}` });
  if (!strengthJoin.ok) {
    return { ok: false, error: strengthJoin.error!, fieldErrors: { password: [strengthJoin.error!] } };
  }

  // E-mail déjà utilisé
  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) {
    return {
      ok: false,
      error: "Cet e-mail est déjà utilisé.",
      fieldErrors: { email: ["E-mail déjà utilisé."] },
    };
  }

  // Vérifier que le domaine de l'e-mail peut recevoir des messages
  const domainOk = await verifyEmailDomain(email);
  if (!domainOk) {
    return {
      ok: false,
      error: "Le domaine de cette adresse e-mail ne peut pas recevoir de messages.",
      fieldErrors: { email: ["Adresse e-mail invalide ou domaine inexistant."] },
    };
  }

  // Fraternité valide dans un groupe (on prend le premier groupe)
  const fraternite = await prisma.fraternite.findUnique({ where: { id: data.fraterniteId } });
  if (!fraternite) {
    return { ok: false, error: "Fraternité introuvable.", fieldErrors: { fraterniteId: ["Fraternité introuvable."] } };
  }

  const code = generateOtpCode();
  const passwordHash = await bcrypt.hash(data.password, 12);

  const payload: OtpPayload = {
    purpose: "inscription",
    email,
    code: hashOtpCode(code), // stocké en hash, le code clair part par e-mail uniquement
    expiresAt: Date.now() + 10 * 60 * 1000,
    data: {
      nom: data.nom.trim().toUpperCase(),
      prenoms: data.prenoms.trim(),
      fraterniteId: data.fraterniteId,
      groupeId: fraternite.groupeId,
      passwordHash,
    },
  };

  await setOtpCookie(payload);
  const { devCode } = await sendOtpEmail(email, code);

  return {
    ok: true,
    message: "Un code de vérification a été envoyé à votre adresse e-mail.",
    devCode,
  };
}

/** Étape 2 : vérification du code OTP → création du compte RESPONSABLE. */
export async function verifierInscriptionOtpAction(code: string): Promise<RejoindreResult> {
  const payload = await getOtpCookie();
  if (!payload || payload.purpose !== "inscription") {
    return { ok: false, error: "Aucune demande d'inscription en cours ou code expiré." };
  }
  if (!verifyOtpCode(code, payload.code)) {
    // Max 5 essais (item 1.2)
    const attempts = (payload.attempts ?? 0) + 1;
    if (attempts >= 5) {
      await clearOtpCookie();
      return { ok: false, error: "Trop de tentatives. Demande expirée, veuillez recommencer." };
    }
    payload.attempts = attempts;
    await setOtpCookie(payload);
    return { ok: false, error: `Code incorrect. (${attempts}/5 tentatives)` };
  }

  const d = payload.data as {
    nom: string;
    prenoms: string;
    fraterniteId: string;
    groupeId: string;
    passwordHash: string;
  };

  // Re-vérifier l'unicité (concurrence)
  const existe = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existe) {
    await clearOtpCookie();
    return { ok: false, error: "Cet e-mail est déjà utilisé." };
  }

  await prisma.user.create({
    data: {
      nom: `${d.nom} ${d.prenoms}`.trim(),
      email: payload.email,
      passwordHash: d.passwordHash,
      role: "RESPONSABLE",
      groupeId: d.groupeId,
      fraterniteId: d.fraterniteId,
    },
  });

  await clearOtpCookie();

  return { ok: true, message: "Compte créé avec succès. Vous pouvez maintenant vous connecter." };
}

/** Renvoie un nouveau code (réutilise le payload existant). */
export async function renvoyerOtpAction(): Promise<RejoindreResult> {
  const payload = await getOtpCookie();
  if (!payload) {
    return { ok: false, error: "Aucune demande en cours." };
  }
  const code = generateOtpCode();
  payload.code = hashOtpCode(code);
  payload.attempts = 0;
  payload.expiresAt = Date.now() + 10 * 60 * 1000;
  await setOtpCookie(payload);
  const { devCode } = await sendOtpEmail(payload.email, code);
  return { ok: true, message: "Un nouveau code a été envoyé.", devCode };
}

export async function getFraternitesPubliquesAction(): Promise<{
  ok: boolean;
  fraternites: { id: string; nom: string }[];
}> {
  // Charge les fraternités du premier groupe (pas d'auth requise pour l'inscription publique)
  const groupe = await prisma.groupe.findFirst({ orderBy: { createdAt: "asc" } });
  if (!groupe) return { ok: false, fraternites: [] };
  const frats = await prisma.fraternite.findMany({
    where: { groupeId: groupe.id },
    orderBy: { nom: "asc" },
    select: { id: true, nom: true },
  });
  return { ok: true, fraternites: frats };
}
