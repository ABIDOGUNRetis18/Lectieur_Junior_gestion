import { z } from "zod";

export const CLASSES_ECOLE = [
  { value: "AVANT_CM1", label: "Avant le CM1" },
  { value: "CM1", label: "CM1" },
  { value: "CM2", label: "CM2" },
  { value: "SIXIEME", label: "6ème" },
  { value: "CINQUIEME", label: "5ème" },
  { value: "QUATRIEME", label: "4ème" },
  { value: "TROISIEME", label: "3ème" },
  { value: "SECONDE", label: "2nde" },
  { value: "PREMIERE", label: "1ère" },
  { value: "TERMINALE", label: "Tle" },
  { value: "SUPERIEUR", label: "Études supérieures" },
  { value: "TERMINEE", label: "Scolarité terminée" },
] as const;

export const CLASSES_CATECHISME = [
  { value: "ANNEE_1", label: "1ère année" },
  { value: "ANNEE_2", label: "2ème année" },
  { value: "ANNEE_3", label: "3ème année" },
  { value: "ANNEE_4", label: "4ème année" },
  { value: "ANNEE_5", label: "5ème année" },
  { value: "TERMINE", label: "Terminé" },
] as const;

export const SERIES = [
  "A1", "A2", "B", "C", "D", "E", "F1", "F2", "F3", "F4", "G1", "G2", "G3", "AUTRE",
] as const;

export const CLASSES_AVEC_SERIE = ["SECONDE", "PREMIERE", "TERMINALE"];

export const ECOLE_LABELS: Record<string, string> = Object.fromEntries(
  CLASSES_ECOLE.map((c) => [c.value, c.label])
);

export const CATECHISME_LABELS: Record<string, string> = Object.fromEntries(
  CLASSES_CATECHISME.map((c) => [c.value, c.label])
);

/** Libellé de la classe à l'école, avec la série à côté pour le second cycle (ex. « 2nde C »). */
export function formatClasseEcole(classe: string, serie?: string | null): string {
  const base = ECOLE_LABELS[classe] ?? classe;
  if (!CLASSES_AVEC_SERIE.includes(classe)) return base;
  const s = (serie ?? "").trim();
  if (!s) return base;
  // Les séries libres sont stockées sous « Autre: … » : on n'affiche que la précision
  const detail = s.startsWith("Autre: ") ? s.slice(7) : s;
  return `${base} ${detail}`;
}

const classeEcoleEnum = z.enum([
  "AVANT_CM1", "CM1", "CM2", "SIXIEME", "CINQUIEME", "QUATRIEME",
  "TROISIEME", "SECONDE", "PREMIERE", "TERMINALE", "SUPERIEUR", "TERMINEE",
]);

const classeCatechismeEnum = z.enum([
  "ANNEE_1", "ANNEE_2", "ANNEE_3", "ANNEE_4", "ANNEE_5", "TERMINE",
]);

const serieEnum = z.enum([
  "A1", "A2", "B", "C", "D", "E", "F1", "F2", "F3", "F4", "G1", "G2", "G3", "AUTRE",
]);

export const childSchema = z
  .object({
    nom: z.string().min(1, "Nom requis").max(100),
    prenoms: z.string().min(1, "Prénoms requis").max(100),
    dateNaissance: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
    classeEcole: classeEcoleEnum,
    serie: serieEnum.optional().nullable(),
    serieAutre: z.string().max(50).optional().nullable(),
    classeCatechisme: classeCatechismeEnum,
    telephoneParent: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const needsSerie = CLASSES_AVEC_SERIE.includes(data.classeEcole);
    if (needsSerie && data.serie === "AUTRE" && (!data.serieAutre || !data.serieAutre.trim())) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["serieAutre"], message: "Précisez la série." });
    }
    if (data.telephoneParent && data.telephoneParent.trim()) {
      const cleaned = data.telephoneParent.replace(/[\s.-]/g, "");
      if (!/^\+?\d{8,15}$/.test(cleaned)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["telephoneParent"], message: "Format de téléphone invalide." });
      }
    }
  });

export const inscriptionSchema = z.object({
  fraterniteId: z.string().min(1, "Fraternité requise"),
  consentement: z.literal(true, {
    message: "Le consentement parental est requis.",
  }),
  enfants: z.array(childSchema).min(1, "Au moins un enfant").max(20, "Maximum 20 enfants par envoi"),
});

export type InscriptionInput = z.infer<typeof inscriptionSchema>;
export type ChildInput = z.infer<typeof childSchema>;
