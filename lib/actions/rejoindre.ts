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
  dispatchOtpEmail,
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

  // Anti-énumération : on ne révèle pas si l'e-mail est déjà utilisé avant
  // que le demandeur ait prouvé qu'il contrôle la boîte (code OTP).
  // Un compte existant reçoit donc aussi un code ; l'information n'est donnée
  // qu'à l'étape 2, après vérification du code.
  const existe = await prisma.user.findUnique({ where: { email } });

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
      // Compte déjà existant : ne jamais créer de doublon à l'étape 2.
      compteExistant: !!existe,
    },
  };

  await setOtpCookie(payload);
  const { devCode } = await dispatchOtpEmail(email, code);

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
    compteExistant?: boolean;
  };

  // Re-vérifier l'unicité (concurrence + compte existant au moment de la demande).
  // Le message n'est révélé qu'après preuve de possession de la boîte e-mail.
  const existe = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existe || d.compteExistant) {
    await clearOtpCookie();
    return {
      ok: false,
      error:
        "Un compte existe déjà avec cette adresse. Connectez-vous ou utilisez « Mot de passe oublié ».",
    };
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
  if (!payload || payload.purpose !== "inscription") {
    return { ok: false, error: "Aucune demande en cours." };
  }

  // Anti-spam : même limite que la demande initiale.
  const limit = checkRateLimit(
    `otp-inscription-resend:${payload.email}`,
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
