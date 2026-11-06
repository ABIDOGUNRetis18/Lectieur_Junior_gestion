/**
 * Libellés français et catégories des actions du journal d'historique.
 * Utilisé par la page /admin/historique pour afficher des badges lisibles
 * à la place des codes bruts (ex. « PRESENCE_ENREGISTREE »).
 */

export type HistoriqueCategorie =
  | "securite"
  | "compte"
  | "enfant"
  | "activite"
  | "parametre"
  | "autre";

type ActionDef = { label: string; categorie: HistoriqueCategorie };

export const HISTORIQUE_ACTIONS: Record<string, ActionDef> = {
  // Sécurité / profil
  CONNEXION: { label: "Connexion", categorie: "securite" },
  CONNEXION_ECHOUEE: { label: "Connexion échouée", categorie: "securite" },
  DECONNEXION: { label: "Déconnexion", categorie: "securite" },
  MOT_DE_PASSE_CHANGE: { label: "Mot de passe modifié", categorie: "securite" },
  MOT_DE_PASSE_REINITIALISE: { label: "Mot de passe réinitialisé", categorie: "securite" },
  PROFIL_MODIFIE: { label: "Profil modifié", categorie: "securite" },

  // Comptes utilisateurs
  COMPTE_CREE: { label: "Compte créé", categorie: "compte" },
  COMPTE_MODIFIE: { label: "Compte modifié", categorie: "compte" },
  COMPTE_SUPPRIME: { label: "Compte supprimé", categorie: "compte" },

  // Enfants / inscriptions
  INSCRIPTION: { label: "Inscription", categorie: "enfant" },
  DOUBLON_INSCRIPTION: { label: "Doublon détecté", categorie: "enfant" },
  ENFANT_MODIFIE: { label: "Fiche enfant modifiée", categorie: "enfant" },
  ENFANT_DESACTIVE: { label: "Enfant désactivé", categorie: "enfant" },
  ENFANT_REACTIVE: { label: "Enfant réactivé", categorie: "enfant" },
  ENFANT_SUPPRIME: { label: "Enfant supprimé", categorie: "enfant" },
  ENFANTS_SUPPRIMES: { label: "Suppression groupée", categorie: "enfant" },
  DONNEES_EXPORTEES: { label: "Données exportées", categorie: "enfant" },

  // Activité paroissiale
  PRESENCE_ENREGISTREE: { label: "Présences enregistrées", categorie: "activite" },
  COTISATION_ENREGISTREE: { label: "Cotisations enregistrées", categorie: "activite" },

  // Paramètres & exports
  PARAMETRES_MODIFIES: { label: "Paramètres modifiés", categorie: "parametre" },
  EXPORT_EXCEL: { label: "Export Excel (consultation)", categorie: "parametre" },
  EXPORT_PDF: { label: "Export PDF (consultation)", categorie: "parametre" },
};

/** Badge par catégorie — classes du thème Material de l'app. */
export const CATEGORIE_BADGE: Record<HistoriqueCategorie, string> = {
  securite: "bg-primary-container text-on-primary",
  compte: "bg-secondary-container text-on-secondary-container",
  enfant: "bg-tertiary-container text-on-tertiary-container",
  activite: "bg-tertiary-fixed text-on-tertiary-fixed",
  parametre: "bg-surface-container-high text-on-surface",
  autre: "bg-surface-container-high text-on-surface",
};

/** Libellé lisible d'une action (retourne le code brut si inconnu). */
export function actionLabel(action: string): string {
  return HISTORIQUE_ACTIONS[action]?.label ?? action;
}

/** Catégorie d'une action (« autre » si inconnue). */
export function actionCategorie(action: string): HistoriqueCategorie {
  return HISTORIQUE_ACTIONS[action]?.categorie ?? "autre";
}

/** Classes du badge d'une action. */
export function actionBadgeClasses(action: string): string {
  return CATEGORIE_BADGE[actionCategorie(action)];
}
