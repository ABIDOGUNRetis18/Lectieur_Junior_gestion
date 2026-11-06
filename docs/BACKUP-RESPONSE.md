# Backup & réponse aux incidents (item 2.3)

## Backup

| Couche | Méthode | Rétention | Test |
|---|---|---|---|
| Neon Postgres | PITR natif (réglé dans le dashboard Neon) | 7 jours | Restauration mensuelle sur une branche temporaire |
| `historique` (audit) | Export quotidien chiffré (script `scripts/export-historique.mjs`) | 90 jours hors ligne | Vérifier le fichier lendemain, JSON lisible |
| Code | GitHub (`main` protégée) | Historique complet | `git clone` + `npm ci` + `next build` |

### Export quotidien de l'audit
```bash
node scripts/export-historique.mjs          # export du jour → exports/historique-YYYY-MM-DD.json
# Ajouter à crontab : 0 2 * * * cd /app && node scripts/export-historique.mjs
```
Chiffrement au repos : `openssl enc -aes-256-gcm -salt` avec une clé stockée dans le gestionnaire de mots de passe (pas dans le repo).

## Alertes à configurer (Vercel)

Dans Vercel → Project → Settings → Notifications :
- **Nouveau déploiement échoué** → Slack `#alerts`
- **Spike 5xx** (seuil : > 5 erreurs / 5 min sur `/api/auth/*`) → Slack `#alerts`
- **Pic `CONNEXION_ECHOUEE`** : requête Vercel Log Explorer :
  ```
  message: "tentative de connexion échouée" OR action: "CONNEXION_ECHOUEE"
  ```
  Alerte si > 10 / 15 min sur le même e-mail.

Dans Neon :
- Alertes latence / connexions (dashboard Neon → Alerting)

## Réponse aux incidents (runbooks)

### Fuite d'`AUTH_SECRET`
1. Rotation immédiate (voir `docs/RUNBOOK-SECRETS.md`)
2. `/admin/administration` → « Déconnecter tous les comptes »
3. Noter l'incident dans `historique` + date ici

### Fuite de `DATABASE_URL`
1. Neon → Reset password
2. Rotation + redéploiement
3. Audit `historique` + logs Neon sur la fenêtre

### Spike de connexions échouées (possible attaque)
1. Vérifier le rate limiting (5/15 min par e-mail déjà actif)
2. Si IP unique : activer le WAF Vercel (blocage temporaire)
3. Forcer la rotation des mots de passe des comptes ciblés via `/admin/administration`

### Restauration DB
1. Neon → Branches → Restore from PITR (date/heure précise)
2. Vérifier `historique` intact, tester connexion admin
3. Noter la restauration ici

## Journal des backups / incidents

| Date | Événement | Action | Testé ? |
|---|---|---|---|
| | | | |
