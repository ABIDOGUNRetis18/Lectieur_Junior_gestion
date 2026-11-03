import { z } from "zod";
import { isSundayInTZ } from "@/lib/dimanches";

export const MOIS_NOMS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
] as const;

export const ROLES = [
  { value: "ADMIN", label: "Administrateur" },
  { value: "RESPONSABLE", label: "Responsable (fraternité)" },
  { value: "TRESORIERE", label: "Trésorière" },
  { value: "SECRETAIRE", label: "Secrétaire" },
] as const;

const moisInt = z.coerce
  .number({ message: "Mois invalide" })
  .int()
  .min(1, "Mois entre 1 et 12")
  .max(12, "Mois entre 1 et 12");

/** Réglages du groupe. */
export const groupeSettingsSchema = z
  .object({
    nom: z.string().min(2, "Nom trop court").max(120, "Nom trop long"),
    montantCotisation: z.coerce
      .number({ message: "Montant invalide" })
      .int("Montant entier")
      .min(0, "Montant positif")
      .max(1_000_000, "Montant trop élevé"),
    premierDimanche: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (AAAA-MM-JJ)")
      .refine((v) => !isNaN(new Date(v + "T00:00:00Z").getTime()), "Date invalide")
      .refine((v) => isSundayInTZ(new Date(v + "T00:00:00Z")), {
        message: "Le premier dimanche doit être un dimanche.",
      }),
    moisDebutAnnee: moisInt,
    moisSansReunion: z
      .array(moisInt)
      .min(1, "Au moins un mois sans réunion")
      .max(12)
      .refine((v) => new Set(v).size === v.length, "Mois en double"),
  })
  .refine((d) => d.moisSansReunion.length < 12, {
    message: "Tous les mois ne peuvent pas être exclus.",
    path: ["moisSansReunion"],
  });

export type GroupeSettingsInput = z.infer<typeof groupeSettingsSchema>;

/** Création d'un compte utilisateur. */
export const compteCreateSchema = z
  .object({
    nom: z.string().min(2, "Nom requis").max(120),
    email: z
      .string()
      .min(1, "E-mail requis")
      .max(200)
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "E-mail invalide"),
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .max(128, "128 caractères maximum"),
    role: z.enum(["ADMIN", "RESPONSABLE", "TRESORIERE", "SECRETAIRE"]),
    fraterniteId: z.string().optional().nullable(),
  })
  .superRefine((d, ctx) => {
    if (d.role === "RESPONSABLE" && !d.fraterniteId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["fraterniteId"],
        message: "Un responsable doit être rattaché à une fraternité.",
      });
    }
  });

export type CompteCreateInput = z.infer<typeof compteCreateSchema>;

/** Modification d'un compte (rôle + fraternité). */
export const compteUpdateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["ADMIN", "RESPONSABLE", "TRESORIERE", "SECRETAIRE"]),
  fraterniteId: z.string().optional().nullable(),
});

export type CompteUpdateInput = z.infer<typeof compteUpdateSchema>;

/** Réinitialisation du mot de passe. */
export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .max(128, "128 caractères maximum"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
