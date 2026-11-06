# Sous-traitants & DPA (item 2.4)

## Liste des sous-traitants

| Sous-traitant | Données | Région | DPA à signer |
|---|---|---|---|
| Neon (Postgres) | `User`, `Enfant`, `Presence`, `Cotisation`, `Historique` | EU (eu-central-1) | Oui — Neon → Settings → DPA |
| Vercel | Requêtes HTTP + logs applicatifs | EU | Oui — Vercel → Settings → DPA |
| Gmail SMTP | E-mails OTP (adresse + code) | EU/US (Google) | Oui — Google Workspace DPA |

## Droit à l'oubli — procédure (≤ 30 jours)

1. Demande reçue par le secrétariat paroissial.
2. Un ADMIN exécute la suppression : fiche enfant → « Supprimer » (`supprimerEnfantAction`) ou suppression du compte (`supprimerCompteAction`).
3. La suppression est hard-delete + ligne `ENFANT_SUPPRIME` / `COMPTE_SUPPRIME` dans `historique` (date, fraternité, acteur).
4. Vérifier : la fiche n'apparaît plus dans les exports `scripts/export-historique.mjs`.
5. Noter la demande dans le journal ci-dessous.

## Export d'accès (droit d'accès RGPD)

- Par enfant : `exporterDonneesEnfantAction` (fiche + présences + cotisations) — déjà journalisé `DONNEES_EXPORTEES`.
- Par groupe : export quotidien de `historique` (`scripts/export-historique.mjs`).

## Minimisation

- `telephoneParent` : facultatif, jamais obligatoire (vérifier dans `inscriptionSchema`).
- Anonymisation des exports anciens : les exports Excel/PDF de consultation contiennent nom + présences + cotisations — limiter la période (filtre année/mois) et détruire les fichiers locaux sous 7 jours.

| Date | Demande (oubli / accès) | Exécutée le | Par |
|---|---|---|---|
| | | | |
