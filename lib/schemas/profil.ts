import { z } from "zod";

/** Mise à jour du nom complet de l'utilisateur connecté. */
export const profilUpdateSchema = z.object({
  nom: z
    .string()
    .min(2, "Nom requis (2 caractères minimum)")
    .max(120, "Nom trop long (120 caractères maximum)"),
});

export type ProfilUpdateInput = z.infer<typeof profilUpdateSchema>;

/** Changement du mot de passe par l'utilisateur lui-même. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(12, "12 caractères minimum")
      .max(128, "128 caractères maximum"),
    confirmPassword: z.string().min(1, "Confirmation requise"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
