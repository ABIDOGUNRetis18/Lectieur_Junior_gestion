# CI/CD & protections (item 3.2)

## GitHub — protection de branche `main`

Settings → Branches → Add rule (`main`) :
- [x] Require a pull request before merging
  - Required approvals : **1** (CODEOWNERS compte)
  - Require review from Code Owners : **oui**
  - Dismiss stale reviews : oui
  - Require status checks to pass : **oui** (voir liste ci-dessous)
- [x] Require conversation resolution
- [x] Block force pushes
- [x] Restrict deletions

### Required status checks (Settings → Branches)
- `check` (CI : `tsc`, `lint`, guards, `audit critical`, `next build`)
- `SAST (CodeQL)`
- `Secrets (Gitleaks)`

Le build doit passer sur les 3 avant merge. ZAP (`zap.yml`) est planifié, non bloquant.

## Vercel — previews protégées

Vercel → Project → Settings → Deployment Protection :
- **Vercel Authentication** : activé (Preview et Production, Deployment Protection = « Vercel Authentication »)
- Seuls les membres de l'équipe Vercel voient les previews. La production reste publique (sondage `/`).

## Environnements séparés dev / prod

| | Dev | Prod |
|---|---|---|
| Neon | Branche `dev` (neon.tech → copy) | Branche `main` |
| `DATABASE_URL` | Neon dev (avec pooler) | Neon prod (avec pooler) |
| Vercel env | `Preview` (Neon dev) | `Production` (Neon prod) |
| `AUTH_SECRET` | différent de la prod | prod uniquement |
| `SMTP_PASS` | aucun (mode dev, code affiché) | mot de passe d'application |

Jamais de prod sur localhost. Les variables Vercel se mettent par environnement (Preview ≠ Production).

## CODEOWNERS

Fichier `.github/CODEOWNERS` : tout chemin sensible (`auth.ts`, `proxy.ts`, `otp.ts`, `mot-de-passe.ts`, `rate-limit.ts`, `password.ts`, `session-revoke.ts`, `next.config.ts`, `.github/`) requiert une review avant merge.
