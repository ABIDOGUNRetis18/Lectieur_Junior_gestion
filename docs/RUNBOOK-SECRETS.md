# Runbook — Secrets & rotation

## Inventaire des secrets (Vercel + local)

| Variable | Usage | Fuite → impact |
|---|---|---|
| `DATABASE_URL` | App Neon (avec pooler) | Lecture/écriture DB — **critique** |
| `DIRECT_URL` | Migrations Prisma (sans pooler) | Critique |
| `AUTH_SECRET` | Chiffrement JWT + OTP (AES-256-GCM) | Forging de sessions + déchiffrement OTP — **critique** |
| `SMTP_PASS` | Mot de passe d'application Gmail | Envoi de mail usurpé — **élevé** |
| `RESEND_API_KEY` | (optionnel, commenté) | Envoi de mail — **élevé** |

Jamais dans git. Vérifié 2026-11-06 : `git ls-files | grep ^\\.env$` vide, `git log -S <valeur SMTP_PASS>` vide.

## Rotation normale (tous les 90 jours)

1. **Gmail** : https://myaccount.google.com/apppasswords → supprimer l'ancien mot de passe d'application, générer un nouveau, coller dans Vercel + `.env` local, redéployer.
2. **Neon** : dashboard Neon → Reset password → mettre à jour `DATABASE_URL` + `DIRECT_URL` dans Vercel, redéployer, vérifier `/connexion`.
3. **AUTH_SECRET** : `openssl rand -base64 32` → Vercel → redéployer → **toutes les sessions sont invalidées** (les utilisateurs se reconnectent, c'est voulu).
4. Retester : inscription OTP, connexion, mot de passe oublié.

## Incident — fuite d'`AUTH_SECRET`

1. **Immédiat** : générer un nouveau `AUTH_SECRET`, le mettre dans Vercel, redéployer (invalide tous les JWT).
2. **Révoquer les sessions** : `/admin/administration` → « Déconnecter tous les comptes » (epoch `SESSIONS_REVOKED`).
3. **Notifier** les admins, noter l'incident dans `historique` + ce fichier (date, cause, actions).
4. Auditer les `CONNEXION_ECHOUEE` anormales autour de la date de fuite.

## Incident — fuite de `DATABASE_URL`

1. Neon → Reset password immédiatement (l'ancienne URL est morte).
2. Rotation + redéploiement, vérification `historique` pour accès suspects.
3. Si mouvements anormaux : export `historique`, audit Neon logs.

## Incident — fuite de `SMTP_PASS`

1. Supprimer le mot de passe d'application côté Google, recréer un nouveau.
2. Rotation + redéploiement, vérifier les e-mails envoyés (logs Vercel).

## Checklist post-rotation

- [ ] Vercel redéployé
- [ ] `/connexion` OK, `/rejoindre` OTP reçu, `/mot-de-passe-oublie` OK
- [ ] `historique` contient les entrées attendues, aucune anomalie
- [ ] Date de rotation notée ci-dessous

## Journal des rotations

| Date | Secrets rotés | Par qui |
|---|---|---|
| | | |
